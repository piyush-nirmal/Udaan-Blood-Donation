import uuid
from django.db import models
from django.conf import settings
from django.utils.crypto import get_random_string
from accounts.models import TimeStampedUUIDModel, Donor

class BloodRequest(TimeStampedUUIDModel):
    BLOOD_GROUP_CHOICES = (
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    )
    COMPONENT_CHOICES = (
        ('whole_blood', 'Whole Blood'),
        ('platelets', 'Platelets'),
        ('plasma', 'Plasma'),
        ('rbc', 'RBC'),
    )
    URGENCY_CHOICES = (
        ('critical', 'Critical (Within 2 hrs)'),
        ('urgent', 'Urgent (Today)'),
        ('scheduled', 'Scheduled'),
    )
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Matched', 'Matched'),
        ('PartiallyFulfilled', 'PartiallyFulfilled'),
        ('Fulfilled', 'Fulfilled'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='blood_requests')
    req_code = models.CharField(max_length=20, unique=True, editable=False)
    patient_name = models.CharField(max_length=150)
    attendant_name = models.CharField(max_length=150)
    contact_phone = models.CharField(max_length=20)
    hospital_name = models.CharField(max_length=200)
    ward = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100, blank=True, null=True)
    pincode = models.CharField(max_length=10)
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUP_CHOICES)
    component_type = models.CharField(max_length=20, choices=COMPONENT_CHOICES, default='whole_blood')
    units_needed = models.PositiveIntegerField(default=1)
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES)
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='Pending')
    doctor_note = models.TextField(blank=True, default='')
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['status', 'urgency']),
            models.Index(fields=['city', 'blood_group']),
        ]

    def save(self, *args, **kwargs):
        if not self.req_code:
            code = f"#REQ{get_random_string(4, allowed_chars='0123456789')}"
            while BloodRequest.objects.filter(req_code=code).exists():
                code = f"#REQ{get_random_string(4, allowed_chars='0123456789')}"
            self.req_code = code
        super().save(*args, **kwargs)

    @property
    def units_donated(self) -> int:
        return self.responses.filter(response_status='Donated').count()

    def __str__(self):
        return f"{self.req_code} - {self.blood_group} ({self.units_needed} units) at {self.hospital_name}"

class RequestResponse(TimeStampedUUIDModel):
    RESPONSE_STATUS_CHOICES = (
        ('Interested', 'Interested'),
        ('Confirmed', 'Confirmed'),
        ('Waitlisted', 'Waitlisted'),
        ('NoShow', 'NoShow'),
        ('Donated', 'Donated'),
        ('Cancelled', 'Cancelled'),
    )

    request = models.ForeignKey(BloodRequest, on_delete=models.CASCADE, related_name='responses')
    donor = models.ForeignKey(Donor, on_delete=models.CASCADE, related_name='responses')
    response_status = models.CharField(max_length=20, choices=RESPONSE_STATUS_CHOICES, default='Interested')
    confirmed_at = models.DateTimeField(null=True, blank=True)
    donated_at = models.DateTimeField(null=True, blank=True)
    din = models.CharField(max_length=20, null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['request', 'donor'], name='unique_request_donor')
        ]

    def __str__(self):
        return f"{self.donor.name} -> {self.request.req_code} [{self.response_status}]"

class Camp(TimeStampedUUIDModel):
    title = models.CharField(max_length=200)
    organizer = models.CharField(max_length=200)
    venue = models.CharField(max_length=250)
    city = models.CharField(max_length=100)
    date = models.DateField()
    time = models.CharField(max_length=100)
    total_slots = models.PositiveIntegerField(default=100)
    booked_slots = models.PositiveIntegerField(default=0)
    contact_phone = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.title} ({self.date}) - {self.city}"

class CampRSVP(TimeStampedUUIDModel):
    camp = models.ForeignKey(Camp, on_delete=models.CASCADE, related_name='rsvps')
    name = models.CharField(max_length=150)
    mobile = models.CharField(max_length=20)
    blood_group = models.CharField(max_length=5)

    def __str__(self):
        return f"{self.name} ({self.blood_group}) -> {self.camp.title}"

class Donation(TimeStampedUUIDModel):
    donor = models.ForeignKey(Donor, on_delete=models.CASCADE, related_name='donations')
    request = models.ForeignKey(BloodRequest, on_delete=models.SET_NULL, null=True, blank=True, related_name='donations')
    camp = models.ForeignKey(Camp, on_delete=models.SET_NULL, null=True, blank=True, related_name='donations')
    din = models.CharField(max_length=20, unique=True, editable=False)
    donation_date = models.DateField()
    hospital_or_camp = models.CharField(max_length=250)
    blood_group = models.CharField(max_length=5)
    component = models.CharField(max_length=20)
    units = models.PositiveIntegerField(default=1)

    def save(self, *args, **kwargs):
        if not self.din:
            code = f"#DIN{get_random_string(4, allowed_chars='0123456789')}"
            while Donation.objects.filter(din=code).exists():
                code = f"#DIN{get_random_string(4, allowed_chars='0123456789')}"
            self.din = code
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.din} - {self.donor.name} ({self.blood_group})"

class Partner(TimeStampedUUIDModel):
    PARTNER_TYPE_CHOICES = (
        ('ngo', 'NGO'),
        ('blood_bank', 'Blood Bank'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('verified', 'Verified'),
    )

    type = models.CharField(max_length=20, choices=PARTNER_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    name = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, default='')
    registration_no = models.CharField(max_length=100, blank=True, default='')
    license_no = models.CharField(max_length=100, blank=True, default='')
    hospital_or_org = models.CharField(max_length=200, blank=True, default='')
    available_blood_types = models.JSONField(default=list, blank=True)
    about = models.TextField(blank=True, default='')
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)
    stock = models.JSONField(default=dict, blank=True)
    stock_updated_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} [{self.type.upper()}] - {self.status}"

class AlertSubscription(TimeStampedUUIDModel):
    mobile = models.CharField(max_length=20)
    blood_group = models.CharField(max_length=5)
    city = models.CharField(max_length=100)
    name = models.CharField(max_length=150, blank=True, default='')
    via_whatsapp = models.BooleanField(default=True)
    via_sms = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.mobile} ({self.blood_group} - {self.city})"

class WellnessTip(TimeStampedUUIDModel):
    CATEGORY_CHOICES = (
        ('pre', 'Pre-Donation'),
        ('post', 'Post-Donation'),
        ('eligibility', 'Eligibility & Safety'),
    )

    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    title_en = models.CharField(max_length=200)
    title_hi = models.CharField(max_length=200)
    body_en = models.TextField()
    body_hi = models.TextField()

    def __str__(self):
        return f"[{self.category}] {self.title_en}"

class Feedback(TimeStampedUUIDModel):
    ROLE_CHOICES = (
        ('donor', 'Donor'),
        ('receiver', 'Receiver'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    rating = models.PositiveSmallIntegerField()
    message = models.TextField()

    def __str__(self):
        return f"{self.role} ({self.rating}/5)"

class Notification(TimeStampedUUIDModel):
    TYPE_CHOICES = (
        ('match', 'Match'),
        ('confirmed', 'Confirmed'),
        ('donated', 'Donated'),
        ('alert', 'Alert'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='alert')
    link = models.CharField(max_length=255, blank=True, default='')
    read = models.BooleanField(default=False)

    def __str__(self):
        return f"To {self.user.email}: {self.title}"
