from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import (
    BloodRequest,
    RequestResponse,
    Donation,
    Camp,
    CampRSVP,
    Partner,
    AlertSubscription,
    WellnessTip,
    Feedback,
    Notification,
)
from .serializers import (
    PublicRequestSerializer,
    OwnerBloodRequestSerializer,
    DonorResponseSerializer,
    DonationSerializer,
    CampSerializer,
    CampRSVPSerializer,
    PartnerSerializer,
    AlertSubscriptionSerializer,
    WellnessTipSerializer,
    FeedbackSerializer,
    NotificationSerializer,
)
from .services import (
    on_request_create,
    respond,
    confirm,
    cancel_response as svc_cancel_response,
    no_show as svc_no_show,
    mark_donated as svc_mark_donated,
    stats as svc_stats,
)

@api_view(['GET'])
@permission_classes([AllowAny])
def list_public_requests(request):
    qs = BloodRequest.objects.all().order_by('-created_at')
    bg = request.query_params.get('blood_group')
    urgency = request.query_params.get('urgency')
    city = request.query_params.get('city')
    q = request.query_params.get('q')

    if bg and bg != 'all':
        qs = qs.filter(blood_group=bg)
    if urgency and urgency != 'all':
        qs = qs.filter(urgency=urgency)
    if city:
        qs = qs.filter(city__iexact=city)
    if q:
        query = q.strip()
        qs = qs.filter(
            Q(hospital_name__icontains=query) |
            Q(city__icontains=query) |
            Q(req_code__icontains=query)
        )

    serializer = PublicRequestSerializer(qs[:50], many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_request(request):
    data = request.data.copy()
    auto_reg = data.pop('auto_register_donor', False)

    req_instance = BloodRequest(user=request.user)
    for field in [
        'patient_name', 'attendant_name', 'contact_phone', 'hospital_name',
        'ward', 'state', 'city', 'district', 'pincode', 'blood_group',
        'component_type', 'units_needed', 'urgency', 'doctor_note', 'lat', 'lng'
    ]:
        if field in data:
            setattr(req_instance, field, data[field])

    req_instance.save()
    on_request_create(req_instance, auto_register_donor=bool(auto_reg))

    return Response(
        OwnerBloodRequestSerializer(req_instance, context={'request': request}).data,
        status=status.HTTP_201_CREATED
    )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_requests(request):
    qs = BloodRequest.objects.filter(user=request.user).order_by('-created_at')
    serializer = OwnerBloodRequestSerializer(qs, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def respond_to_request(request, pk):
    req_obj = get_object_or_404(BloodRequest, id=pk)
    if not hasattr(request.user, 'donor_profile'):
        return Response({'error': 'Please register as a donor first.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        resp = respond(req_obj, request.user.donor_profile)
        return Response(DonorResponseSerializer(resp, context={'request': request}).data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_donor(request, req_id, resp_id):
    resp = get_object_or_404(RequestResponse, id=resp_id, request_id=req_id)
    try:
        updated = confirm(resp, request.user)
        return Response(DonorResponseSerializer(updated, context={'request': request}).data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_response_view(request, resp_id):
    resp = get_object_or_404(RequestResponse, id=resp_id)
    try:
        updated = svc_cancel_response(resp, request.user)
        return Response(DonorResponseSerializer(updated, context={'request': request}).data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_no_show_view(request, resp_id):
    resp = get_object_or_404(RequestResponse, id=resp_id)
    try:
        updated = svc_no_show(resp, request.user)
        return Response(DonorResponseSerializer(updated, context={'request': request}).data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_donated_view(request, resp_id):
    resp = get_object_or_404(RequestResponse, id=resp_id)
    try:
        donation = svc_mark_donated(resp, request.user)
        return Response({
            'response': DonorResponseSerializer(resp, context={'request': request}).data,
            'din': donation.din
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def fulfill_request(request, pk):
    req_obj = get_object_or_404(BloodRequest, id=pk)
    if req_obj.user != request.user and request.user.role != 'admin':
        return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)
    req_obj.status = 'Fulfilled'
    req_obj.save(update_fields=['status', 'updated_at'])
    return Response(OwnerBloodRequestSerializer(req_obj, context={'request': request}).data)

@api_view(['GET'])
@permission_classes([AllowAny])
def list_blood_banks(request):
    qs = Partner.objects.filter(type='blood_bank', status='verified')
    city = request.query_params.get('city')
    if city:
        qs = qs.filter(city__iexact=city)

    data = [
        {
            'id': str(p.id),
            'name': p.name,
            'address': p.hospital_or_org,
            'city': p.city,
            'phone': p.phone,
            'verified': True,
            'lat': p.lat,
            'lng': p.lng,
            'stock_updated_at': p.stock_updated_at.isoformat() if p.stock_updated_at else p.created_at.isoformat(),
            'stock': p.stock or {'A+': 10, 'B+': 15, 'O+': 20, 'AB+': 5},
        }
        for p in qs
    ]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_notifications(request):
    qs = Notification.objects.filter(user=request.user).order_by('-created_at')[:30]
    return Response(NotificationSerializer(qs, many=True).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notifications_read(request):
    Notification.objects.filter(user=request.user, read=False).update(read=True)
    return Response({'success': True})

@api_view(['GET'])
@permission_classes([AllowAny])
def list_camps(request):
    qs = Camp.objects.all().order_by('date')
    return Response(CampSerializer(qs, many=True).data)

@api_view(['POST'])
@permission_classes([AllowAny])
def rsvp_camp(request, pk):
    camp = get_object_or_404(Camp, id=pk)
    if camp.booked_slots >= camp.total_slots:
        return Response({'error': 'This camp has reached maximum capacity.'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = CampRSVPSerializer(data={'camp': camp.id, **request.data})
    if serializer.is_valid():
        serializer.save()
        camp.booked_slots += 1
        camp.save(update_fields=['booked_slots'])
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def list_partners(request):
    qs = Partner.objects.all().order_by('-created_at')
    p_type = request.query_params.get('type')
    if p_type:
        qs = qs.filter(type=p_type)
    return Response(PartnerSerializer(qs, many=True).data)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_partner(request):
    serializer = PartnerSerializer(data={**request.data, 'status': 'pending'})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def subscribe_alerts(request):
    serializer = AlertSubscriptionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_wellness(request):
    qs = WellnessTip.objects.all()
    cat = request.query_params.get('category')
    if cat:
        qs = qs.filter(category=cat)
    return Response(WellnessTipSerializer(qs, many=True).data)

@api_view(['POST'])
@permission_classes([AllowAny])
def submit_feedback(request):
    serializer = FeedbackSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_stats(request):
    return Response(svc_stats())

@api_view(['GET'])
@permission_classes([AllowAny])
def track_view(request):
    code = request.query_params.get('code', '').strip().upper()
    if not code:
        return Response({'error': 'Code parameter is required.'}, status=status.HTTP_400_BAD_REQUEST)

    if code.startswith('REQ-') or code.startswith('#REQ'):
        cleaned_code = code if code.startswith('#') else f"#{code}"
        req_obj = BloodRequest.objects.filter(
            Q(req_code__iexact=code) | Q(req_code__iexact=cleaned_code)
        ).first()

        if not req_obj:
            return Response({'error': f'Request {code} not found.'}, status=status.HTTP_404_NOT_FOUND)

        interested_count = req_obj.responses.filter(response_status='Interested').count()
        confirmed_count = req_obj.responses.filter(response_status='Confirmed').count()
        donated_count = req_obj.responses.filter(response_status='Donated').count()

        timeline = [
            {'step': 'Emergency Request Broadcasted', 'timestamp': req_obj.created_at.strftime('%Y-%m-%d %H:%M'), 'completed': True},
            {'step': f'{interested_count} Donors Responded (Interested)', 'timestamp': 'Verified on Portal', 'completed': interested_count > 0 or confirmed_count > 0 or donated_count > 0},
            {'step': f'{confirmed_count} Donors Confirmed by Requester', 'timestamp': 'Coordination Phase', 'completed': confirmed_count > 0 or donated_count > 0},
            {'step': f'Donations Completed ({donated_count}/{req_obj.units_needed} Units)', 'timestamp': 'Hospital Collection', 'completed': req_obj.status == 'Fulfilled'},
        ]

        return Response({
            'code': req_obj.req_code,
            'type': 'REQ',
            'status': req_obj.status,
            'timeline': timeline,
            'details': {
                'blood_group': req_obj.blood_group,
                'city': req_obj.city,
                'hospital': req_obj.hospital_name,
                'units': req_obj.units_needed,
            }
        })

    # DIN lookup
    cleaned_din = code if code.startswith('#') else f"#{code}"
    donation = Donation.objects.filter(Q(din__iexact=code) | Q(din__iexact=cleaned_din)).first()
    if not donation:
        return Response({'error': f'Donation with DIN {code} not found.'}, status=status.HTTP_404_NOT_FOUND)

    timeline = [
        {'step': 'Voluntary Blood Donated', 'timestamp': donation.donation_date.strftime('%Y-%m-%d'), 'completed': True},
        {'step': 'Transfusion Lab Screening & Testing', 'timestamp': 'Within 24 Hours', 'completed': True},
        {'step': 'National Verified Certificate Issued', 'timestamp': 'Available Online', 'completed': True},
    ]

    return Response({
        'code': donation.din,
        'type': 'DIN',
        'status': 'Issued & Verified',
        'timeline': timeline,
        'details': {
            'blood_group': donation.blood_group,
            'city': getattr(donation.donor, 'city', 'Verified Centre'),
            'hospital': donation.hospital_or_camp,
            'units': donation.units,
        }
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def get_certificate_view(request):
    din = request.query_params.get('din', '').strip().upper()
    mobile = request.query_params.get('mobile', '').strip()

    qs = Donation.objects.all()
    if din:
        cleaned_din = din if din.startswith('#') else f"#{din}"
        qs = qs.filter(Q(din__iexact=din) | Q(din__iexact=cleaned_din))
    elif mobile:
        qs = qs.filter(donor__phone__icontains=mobile)
    else:
        return Response({'error': 'Please provide either din or mobile.'}, status=status.HTTP_400_BAD_REQUEST)

    donation = qs.first()
    if not donation:
        return Response({'error': 'No verified donation found matching these credentials.'}, status=status.HTTP_404_NOT_FOUND)

    return Response({
        'din': donation.din,
        'donor_name': donation.donor.name,
        'blood_group': donation.blood_group,
        'donation_date': donation.donation_date.strftime('%Y-%m-%d'),
        'hospital_or_camp': donation.hospital_or_camp,
        'units': donation.units,
        'component': donation.component,
    })
