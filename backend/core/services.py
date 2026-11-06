from datetime import date, timedelta
from django.db import transaction
from django.conf import settings
from django.core.cache import cache
from django.core.exceptions import PermissionDenied, ValidationError
from accounts.models import Donor
from .models import (
    BloodRequest,
    RequestResponse,
    Donation,
    Camp,
    Notification,
)
from .notifier import notifier

def match_donors(request: BloodRequest):
    """
    Finds eligible matching donors for a BloodRequest:
    1. Same blood group
    2. Available (is_available=True)
    3. Not the requesting user
    4. Last donation date is null or older than settings.DONATION_GAP_DAYS (default 90)
    5. Exclude donors who previously cancelled or marked NoShow for this request
    6. Search priority:
       - If urgency == 'critical': start at city, then state
       - Else: pincode, then city, then state (stopping at the first non-empty level)
    """
    cutoff_date = date.today() - timedelta(days=getattr(settings, 'DONATION_GAP_DAYS', 90))

    excluded_donor_ids = RequestResponse.objects.filter(
        request=request,
        response_status__in=['Cancelled', 'NoShow']
    ).values_list('donor_id', flat=True)

    base_qs = Donor.objects.filter(
        blood_group=request.blood_group,
        is_available=True,
    ).exclude(
        user=request.user
    ).exclude(
        id__in=excluded_donor_ids
    ).filter(
        models_date_filter(cutoff_date)
    )

    is_critical = (request.urgency == 'critical')

    if not is_critical and request.pincode:
        pincode_donors = list(base_qs.filter(pincode=request.pincode))
        if pincode_donors:
            return pincode_donors

    if request.city:
        city_donors = list(base_qs.filter(city__iexact=request.city))
        if city_donors:
            return city_donors

    if request.state:
        state_donors = list(base_qs.filter(state__iexact=request.state))
        if state_donors:
            return state_donors

    return []

def models_date_filter(cutoff_date):
    from django.db.models import Q
    return Q(last_donation_date__isnull=True) | Q(last_donation_date__lte=cutoff_date)

@transaction.atomic
def on_request_create(request: BloodRequest, auto_register_donor: bool = False, donor_meta: dict = None):
    """
    Executes post-creation actions:
    1. If auto_register_donor is True and user does not have a donor profile, create one.
    2. Run match_donors, create in-app notification & dispatch via notifier stub.
    """
    if auto_register_donor and not hasattr(request.user, 'donor_profile') and donor_meta:
        Donor.objects.create(
            user=request.user,
            name=donor_meta.get('name', request.attendant_name),
            blood_group=request.blood_group,
            state=request.state,
            city=request.city,
            pincode=request.pincode,
            phone=request.contact_phone,
            email=request.user.email,
            weight_kg=donor_meta.get('weight_kg', 60),
            gender=donor_meta.get('gender', 'other'),
            consent_display=donor_meta.get('consent_display', True),
            is_available=True,
        )

    matched = match_donors(request)
    for donor in matched:
        # Crucial privacy rule: NEVER include patient name, attendant name, or contact phone
        notification_msg = (
            f"Urgent SOS: {request.blood_group} ({request.get_component_type_display()}) needed at "
            f"{request.hospital_name}, {request.city}. Urgency: {request.urgency.capitalize()}. Can you donate?"
        )
        Notification.objects.create(
            user=donor.user,
            title=f"SOS: {request.blood_group} Needed Nearby",
            message=notification_msg,
            type='match',
            link=f"/board?req={request.req_code}",
        )
        notifier.send(donor, notification_msg)

    return matched

@transaction.atomic
def respond(request: BloodRequest, donor: Donor) -> RequestResponse:
    """
    Donor clicks 'I Can Donate':
    - Validates eligibility (cooldown & availability)
    - Rejects if request is already Fulfilled
    - Creates or reactivates response as 'Interested'
    - Notifies requester
    """
    if request.status == 'Fulfilled':
        raise ValidationError("This request is already fulfilled.")

    if not donor.is_available:
        raise ValidationError("Your donor availability is currently paused.")

    gap_days = getattr(settings, 'DONATION_GAP_DAYS', 90)
    if donor.last_donation_date:
        days_since = (date.today() - donor.last_donation_date).days
        if days_since < gap_days:
            remaining = gap_days - days_since
            raise ValidationError(f"You are on a medical cooldown. {remaining} days remaining.")

    response, created = RequestResponse.objects.get_or_create(
        request=request,
        donor=donor,
        defaults={'response_status': 'Interested'}
    )

    if not created:
        if response.response_status in ['Cancelled', 'NoShow']:
            response.response_status = 'Interested'
            response.save(update_fields=['response_status', 'updated_at'])
        elif response.response_status in ['Confirmed', 'Donated']:
            return response

    if request.status == 'Pending':
        request.status = 'Matched'
        request.save(update_fields=['status', 'updated_at'])

    Notification.objects.create(
        user=request.user,
        title="Donor Offered Help",
        message=f"{donor.name} ({donor.blood_group}) offered to donate for {request.req_code}.",
        type='match',
        link="/dashboard",
    )

    return response

@transaction.atomic
def confirm(response: RequestResponse, actor_user) -> RequestResponse:
    """
    Only request owner can confirm:
    - Confirmed count cannot exceed units_needed
    - Extra interested donors become 'Waitlisted'
    - Marks response as 'Confirmed'
    - Notifies donor
    """
    request = response.request
    if request.user != actor_user and actor_user.role != 'admin':
        raise PermissionDenied("Only the requester or admin can confirm a donor.")

    confirmed_count = request.responses.filter(response_status__in=['Confirmed', 'Donated']).count()
    if confirmed_count >= request.units_needed:
        raise ValidationError(f"Cannot confirm more than {request.units_needed} donors for this request.")

    from django.utils import timezone
    response.response_status = 'Confirmed'
    response.confirmed_at = timezone.now()
    response.save(update_fields=['response_status', 'confirmed_at', 'updated_at'])

    # Recheck confirmed count
    total_confirmed = request.responses.filter(response_status__in=['Confirmed', 'Donated']).count()
    if total_confirmed >= request.units_needed:
        # Move excess Interested to Waitlisted
        request.responses.filter(response_status='Interested').update(response_status='Waitlisted')
        request.status = 'Matched'
        request.save(update_fields=['status', 'updated_at'])

    Notification.objects.create(
        user=response.donor.user,
        title="Donation Confirmed!",
        message=(
            f"Your offer for {request.req_code} at {request.hospital_name} has been confirmed. "
            f"Attendant: {request.attendant_name} ({request.contact_phone})."
        ),
        type='confirmed',
        link="/dashboard",
    )
    notifier.send(
        response.donor,
        f"UDAAN Confirmation: Your blood donation for {request.req_code} is confirmed. Please visit {request.hospital_name}."
    )

    return response

@transaction.atomic
def cancel_response(response: RequestResponse, actor_user) -> RequestResponse:
    """
    Cancels a response:
    - If was Confirmed, promotes first Waitlisted to Confirmed, else runs matching
    - Updates request status if needed
    """
    request = response.request
    is_owner = (request.user == actor_user)
    is_donor = (response.donor.user == actor_user)
    if not (is_owner or is_donor or actor_user.role == 'admin'):
        raise PermissionDenied("Unauthorized to cancel response.")

    was_confirmed = response.response_status == 'Confirmed'
    response.response_status = 'Cancelled'
    response.save(update_fields=['response_status', 'updated_at'])

    if was_confirmed:
        _handle_confirmed_slot_freed(request)

    return response

@transaction.atomic
def no_show(response: RequestResponse, actor_user) -> RequestResponse:
    """
    Requester marks a confirmed donor as NoShow:
    - Increments donor.no_show_count
    - Promotes first Waitlisted to Confirmed, or triggers matching
    """
    request = response.request
    if request.user != actor_user and actor_user.role != 'admin':
        raise PermissionDenied("Only the requester or admin can mark NoShow.")

    was_confirmed = response.response_status == 'Confirmed'
    response.response_status = 'NoShow'
    response.save(update_fields=['response_status', 'updated_at'])

    donor = response.donor
    donor.no_show_count += 1
    donor.save(update_fields=['no_show_count', 'updated_at'])

    if was_confirmed:
        _handle_confirmed_slot_freed(request)

    return response

def _handle_confirmed_slot_freed(request: BloodRequest):
    """Promotes first Waitlisted donor to Confirmed; otherwise re-runs matching."""
    from django.utils import timezone
    waitlisted = request.responses.filter(response_status='Waitlisted').order_by('created_at').first()
    if waitlisted:
        waitlisted.response_status = 'Confirmed'
        waitlisted.confirmed_at = timezone.now()
        waitlisted.save(update_fields=['response_status', 'confirmed_at', 'updated_at'])

        Notification.objects.create(
            user=waitlisted.donor.user,
            title="Slot Available: You are Confirmed!",
            message=f"A slot opened for {request.req_code} at {request.hospital_name}. You are now confirmed.",
            type='confirmed',
            link="/dashboard",
        )
        notifier.send(waitlisted.donor, f"UDAAN Alert: You are promoted from waitlist to Confirmed for {request.req_code}.")
    else:
        # Re-run matching for remaining requirement
        confirmed_count = request.responses.filter(response_status__in=['Confirmed', 'Donated']).count()
        if confirmed_count == 0:
            request.status = 'Pending'
            request.save(update_fields=['status', 'updated_at'])
        on_request_create(request)

@transaction.atomic
def mark_donated(response: RequestResponse, actor_user) -> Donation:
    """
    Owner or Admin marks donor as Donated:
    - Generates Donation record with DIN
    - Sets donor.last_donation_date to today
    - Sets response.response_status = 'Donated'
    - Updates request units and status (PartiallyFulfilled or Fulfilled)
    - Notifies donor with their DIN
    """
    request = response.request
    if request.user != actor_user and actor_user.role != 'admin':
        raise PermissionDenied("Only requester or admin can mark as Donated.")

    from django.utils import timezone
    today = date.today()

    donation = Donation.objects.create(
        donor=response.donor,
        request=request,
        donation_date=today,
        hospital_or_camp=request.hospital_name,
        blood_group=request.blood_group,
        component=request.component_type,
        units=1,
    )

    response.response_status = 'Donated'
    response.donated_at = timezone.now()
    response.din = donation.din
    response.save(update_fields=['response_status', 'donated_at', 'din', 'updated_at'])

    donor = response.donor
    donor.last_donation_date = today
    donor.save(update_fields=['last_donation_date', 'updated_at'])

    donated_count = request.units_donated
    if donated_count >= request.units_needed:
        request.status = 'Fulfilled'
    else:
        request.status = 'PartiallyFulfilled'
    request.save(update_fields=['status', 'updated_at'])

    Notification.objects.create(
        user=donor.user,
        title="Donation Completed - Thank You!",
        message=f"Thank you for saving lives! Your Donation ID is {donation.din}. View your verified certificate.",
        type='donated',
        link=f"/certificate?din={donation.din}",
    )
    notifier.send(donor, f"UDAAN: Thank you for donating blood at {request.hospital_name}! Your certificate DIN: {donation.din}.")

    # Invalidate cached stats
    cache.delete('udaan_impact_stats')

    return donation

def stats():
    """Returns cached impact statistics (cached for 5 minutes)."""
    cached_stats = cache.get('udaan_impact_stats')
    if cached_stats:
        return cached_stats

    total_donors = Donor.objects.count()
    active_donors = Donor.objects.filter(is_available=True).count()
    fulfilled_requests = BloodRequest.objects.filter(status='Fulfilled').count()
    camps_organized = Camp.objects.count()
    lives_impacted = fulfilled_requests * 3

    data = {
        'total_donors': total_donors,
        'active_donors': active_donors,
        'fulfilled_requests': fulfilled_requests,
        'camps_organized': camps_organized,
        'lives_impacted': lives_impacted,
    }
    cache.set('udaan_impact_stats', data, timeout=300)
    return data
