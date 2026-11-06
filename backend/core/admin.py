from django.contrib import admin
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
from .services import mark_donated

@admin.action(description='Verify selected partners')
def verify_partner(modeladmin, request, queryset):
    queryset.update(status='verified')

@admin.action(description='Mark selected responses as Donated')
def mark_response_donated(modeladmin, request, queryset):
    for resp in queryset.filter(response_status__in=['Confirmed', 'Interested']):
        mark_donated(resp, request.user)

@admin.register(BloodRequest)
class BloodRequestAdmin(admin.ModelAdmin):
    list_display = ('req_code', 'blood_group', 'component_type', 'units_needed', 'city', 'hospital_name', 'urgency', 'status', 'created_at')
    list_filter = ('status', 'urgency', 'blood_group', 'component_type', 'state', 'city')
    search_fields = ('req_code', 'hospital_name', 'patient_name', 'city', 'pincode')
    readonly_fields = ('id', 'req_code', 'created_at', 'updated_at')

@admin.register(RequestResponse)
class RequestResponseAdmin(admin.ModelAdmin):
    list_display = ('donor', 'request', 'response_status', 'din', 'confirmed_at', 'donated_at', 'created_at')
    list_filter = ('response_status', 'created_at')
    search_fields = ('donor__name', 'donor__phone', 'request__req_code', 'din')
    readonly_fields = ('id', 'din', 'created_at', 'updated_at')
    actions = [mark_response_donated]

@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ('din', 'donor', 'blood_group', 'component', 'units', 'hospital_or_camp', 'donation_date')
    list_filter = ('blood_group', 'component', 'donation_date')
    search_fields = ('din', 'donor__name', 'donor__phone', 'hospital_or_camp')
    readonly_fields = ('id', 'din', 'created_at', 'updated_at')

@admin.register(Camp)
class CampAdmin(admin.ModelAdmin):
    list_display = ('title', 'organizer', 'venue', 'city', 'date', 'booked_slots', 'total_slots')
    list_filter = ('city', 'date')
    search_fields = ('title', 'organizer', 'venue', 'city')
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(CampRSVP)
class CampRSVPAdmin(admin.ModelAdmin):
    list_display = ('name', 'mobile', 'blood_group', 'camp', 'created_at')
    list_filter = ('blood_group', 'camp')
    search_fields = ('name', 'mobile')
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'city', 'phone', 'status', 'stock_updated_at')
    list_filter = ('type', 'status', 'city')
    search_fields = ('name', 'city', 'phone', 'registration_no', 'license_no')
    readonly_fields = ('id', 'created_at', 'updated_at')
    actions = [verify_partner]

@admin.register(AlertSubscription)
class AlertSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('mobile', 'blood_group', 'city', 'name', 'via_whatsapp', 'via_sms', 'created_at')
    list_filter = ('blood_group', 'city', 'via_whatsapp', 'via_sms')
    search_fields = ('mobile', 'name', 'city')
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(WellnessTip)
class WellnessTipAdmin(admin.ModelAdmin):
    list_display = ('title_en', 'category', 'created_at')
    list_filter = ('category',)
    search_fields = ('title_en', 'title_hi', 'body_en', 'body_hi')
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('role', 'rating', 'created_at')
    list_filter = ('role', 'rating', 'created_at')
    search_fields = ('message',)
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'type', 'read', 'created_at')
    list_filter = ('type', 'read', 'created_at')
    search_fields = ('title', 'message', 'user__email')
    readonly_fields = ('id', 'created_at', 'updated_at')
