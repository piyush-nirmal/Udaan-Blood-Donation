from django.contrib import admin
from .models import User, Donor

@admin.action(description='Mark selected donors as Verified')
def mark_donor_verified(modeladmin, request, queryset):
    queryset.update(is_verified=True)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'display_name', 'role', 'firebase_uid', 'is_staff', 'created_at')
    list_filter = ('role', 'is_staff', 'is_active', 'created_at')
    search_fields = ('email', 'display_name', 'firebase_uid')
    readonly_fields = ('id', 'firebase_uid', 'created_at', 'updated_at')

@admin.register(Donor)
class DonorAdmin(admin.ModelAdmin):
    list_display = ('donor_code', 'name', 'blood_group', 'city', 'state', 'phone', 'is_available', 'is_verified', 'no_show_count')
    list_filter = ('blood_group', 'is_available', 'is_verified', 'state', 'city')
    search_fields = ('donor_code', 'name', 'phone', 'email', 'city', 'pincode')
    readonly_fields = ('id', 'donor_code', 'created_at', 'updated_at')
    actions = [mark_donor_verified]
