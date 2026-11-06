from rest_framework import serializers
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

class DonorResponseSerializer(serializers.ModelSerializer):
    donor_id = serializers.UUIDField(source='donor.id', read_only=True)
    donor_name = serializers.CharField(source='donor.name', read_only=True)
    donor_blood_group = serializers.CharField(source='donor.blood_group', read_only=True)
    donor_phone = serializers.SerializerMethodField()
    can_see_contact = serializers.SerializerMethodField()

    class Meta:
        model = RequestResponse
        fields = [
            'id',
            'request_id',
            'donor_id',
            'donor_name',
            'donor_phone',
            'can_see_contact',
            'donor_blood_group',
            'response_status',
            'din',
            'created_at',
            'confirmed_at',
            'donated_at',
        ]

    def get_can_see_contact(self, obj) -> bool:
        user = self.context.get('request').user if self.context.get('request') else None
        if not user or not user.is_authenticated:
            return False
        is_owner = (obj.request.user == user)
        is_donor = (obj.donor.user == user)
        is_confirmed = obj.response_status in ['Confirmed', 'Donated']
        return (is_owner or is_donor) and is_confirmed

    def get_donor_phone(self, obj):
        can_see = self.get_can_see_contact(obj)
        if can_see and obj.donor.consent_display:
            return obj.donor.phone
        return None

class PublicRequestSerializer(serializers.ModelSerializer):
    units_donated = serializers.IntegerField(read_only=True)
    responses = serializers.SerializerMethodField()
    # Contact fields are dynamically attached only if current user is confirmed donor
    patient_name = serializers.SerializerMethodField()
    attendant_name = serializers.SerializerMethodField()
    contact_phone = serializers.SerializerMethodField()

    class Meta:
        model = BloodRequest
        fields = [
            'id',
            'req_code',
            'hospital_name',
            'ward',
            'city',
            'state',
            'pincode',
            'district',
            'blood_group',
            'component_type',
            'units_needed',
            'units_donated',
            'urgency',
            'status',
            'created_at',
            'lat',
            'lng',
            'responses',
            'patient_name',
            'attendant_name',
            'contact_phone',
        ]

    def get_responses(self, obj):
        responses_qs = obj.responses.all()
        return DonorResponseSerializer(responses_qs, many=True, context=self.context).data

    def _is_confirmed_donor(self, obj) -> bool:
        user = self.context.get('request').user if self.context.get('request') else None
        if not user or not user.is_authenticated or not hasattr(user, 'donor_profile'):
            return False
        return obj.responses.filter(
            donor=user.donor_profile,
            response_status__in=['Confirmed', 'Donated']
        ).exists()

    def get_patient_name(self, obj):
        return obj.patient_name if self._is_confirmed_donor(obj) else None

    def get_attendant_name(self, obj):
        return obj.attendant_name if self._is_confirmed_donor(obj) else None

    def get_contact_phone(self, obj):
        return obj.contact_phone if self._is_confirmed_donor(obj) else None

class OwnerBloodRequestSerializer(serializers.ModelSerializer):
    units_donated = serializers.IntegerField(read_only=True)
    responses = DonorResponseSerializer(many=True, read_only=True)

    class Meta:
        model = BloodRequest
        fields = [
            'id',
            'req_code',
            'patient_name',
            'attendant_name',
            'contact_phone',
            'hospital_name',
            'ward',
            'city',
            'state',
            'district',
            'pincode',
            'blood_group',
            'component_type',
            'units_needed',
            'units_donated',
            'urgency',
            'status',
            'doctor_note',
            'created_at',
            'lat',
            'lng',
            'responses',
        ]

class DonationSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(source='donor.name', read_only=True)

    class Meta:
        model = Donation
        fields = [
            'id',
            'din',
            'donor_name',
            'blood_group',
            'donation_date',
            'hospital_or_camp',
            'units',
            'component',
            'created_at',
        ]

class CampSerializer(serializers.ModelSerializer):
    class Meta:
        model = Camp
        fields = '__all__'

class CampRSVPSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampRSVP
        fields = ['id', 'camp', 'name', 'mobile', 'blood_group', 'created_at']

class PartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partner
        fields = '__all__'

class AlertSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertSubscription
        fields = '__all__'

class WellnessTipSerializer(serializers.ModelSerializer):
    class Meta:
        model = WellnessTip
        fields = '__all__'

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
