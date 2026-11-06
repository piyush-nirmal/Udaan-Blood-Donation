from django.urls import path
from . import views

urlpatterns = [
    # Requests
    path('requests/', views.list_public_requests, name='requests-public-list'),
    path('requests/create/', views.create_request, name='requests-create'),
    path('requests/my/', views.my_requests, name='requests-my'),
    path('requests/<uuid:pk>/respond/', views.respond_to_request, name='requests-respond'),
    path('requests/<uuid:req_id>/confirm/<uuid:resp_id>/', views.confirm_donor, name='requests-confirm-donor'),
    path('requests/responses/<uuid:resp_id>/cancel/', views.cancel_response_view, name='responses-cancel'),
    path('requests/responses/<uuid:resp_id>/noshow/', views.mark_no_show_view, name='responses-noshow'),
    path('requests/responses/<uuid:resp_id>/donated/', views.mark_donated_view, name='responses-donated'),
    path('requests/<uuid:pk>/fulfill/', views.fulfill_request, name='requests-fulfill'),

    # Blood banks & Camps
    path('blood-banks/', views.list_blood_banks, name='blood-banks-list'),
    path('camps/', views.list_camps, name='camps-list'),
    path('camps/<uuid:pk>/rsvp/', views.rsvp_camp, name='camps-rsvp'),

    # Partners
    path('partners/', views.list_partners, name='partners-list'),
    path('partners/register/', views.register_partner, name='partners-register'),

    # Notifications
    path('notifications/', views.list_notifications, name='notifications-list'),
    path('notifications/read-all/', views.mark_notifications_read, name='notifications-mark-read'),

    # Auxiliaries
    path('alerts/subscribe/', views.subscribe_alerts, name='alerts-subscribe'),
    path('wellness/', views.get_wellness, name='wellness-list'),
    path('feedback/', views.submit_feedback, name='feedback-submit'),
    path('stats/', views.get_stats, name='stats-summary'),
    path('track/', views.track_view, name='track-entity'),
    path('certificate/', views.get_certificate_view, name='certificate-lookup'),
]
