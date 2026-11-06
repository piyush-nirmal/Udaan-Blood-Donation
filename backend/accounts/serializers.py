from rest_framework import serializers
from .models import User, Donor
from core.serializers import DonationSerializer

class DonorProfileSerializer(serializers.ModelSerializer):
    uid = serializers.CharField(source='user.firebase_uid', read_only=True)
    total_donations = serializers.SerializerMethodField()
    donation_history = serializers.SerializerMethodField()

    class Meta:
        model = Donor
        fields = [
            'id',
            'uid',
            'donor_code',
            'name',
            'blood_group',
            'city',
            'state',
            'pincode',
            'phone',
            'email',
            'last_donation_date',
            'total_donations',
            'is_available',
            'is_verified',
            'consent_display',
            'weight_kg',
            'gender',
            'donation_history',
        ]

    def get_total_donations(self, obj) -> int:
        return obj.donations.count()

    def get_donation_history(self, obj):
        donations = obj.donations.order_by('-donation_date')[:10]
        return DonationSerializer(donations, many=True).data

class UserAuthSerializer(serializers.ModelSerializer):
    uid = serializers.CharField(source='firebase_uid')
    displayName = serializers.CharField(source='display_name')
    donor_profile = DonorProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['uid', 'email', 'displayName', 'role', 'donor_profile']

class RegisterDonorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donor
        fields = [
            'name',
            'blood_group',
            'city',
            'state',
            'pincode',
            'phone',
            'email',
            'last_donation_date',
            'weight_kg',
            'gender',
            'consent_display',
        ]
