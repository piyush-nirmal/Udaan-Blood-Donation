from django.urls import path
from . import views

urlpatterns = [
    path('auth/me/', views.get_me, name='auth-me'),
    path('auth/donor/register/', views.register_donor, name='auth-donor-register'),
    path('auth/donor/update/', views.update_donor, name='auth-donor-update'),
    path('auth/donor/availability/', views.set_availability, name='auth-donor-availability'),
    path('donors/', views.list_donors, name='donors-list'),
]
