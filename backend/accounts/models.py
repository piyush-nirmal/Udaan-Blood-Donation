import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils.crypto import get_random_string

class TimeStampedUUIDModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class UserManager(BaseUserManager):
    def create_user(self, email, firebase_uid, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        if not firebase_uid:
            raise ValueError('Firebase UID is required')
        email = self.normalize_email(email)
        user = self.model(email=email, firebase_uid=firebase_uid, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, firebase_uid=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        if not firebase_uid:
            firebase_uid = f'admin_{uuid.uuid4().hex[:12]}'
        return self.create_user(email, firebase_uid=firebase_uid, password=password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin, TimeStampedUUIDModel):
    ROLE_CHOICES = (
        ('donor', 'Donor'),
        ('requester', 'Requester'),
        ('coordinator', 'Coordinator'),
        ('admin', 'Admin'),
    )

    firebase_uid = models.CharField(max_length=128, unique=True, db_index=True)
    email = models.EmailField(unique=True, db_index=True)
    display_name = models.CharField(max_length=150, blank=True, default='')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='donor')
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{self.display_name or self.email} ({self.role})"

class Donor(TimeStampedUUIDModel):
    BLOOD_GROUP_CHOICES = (
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
    )
    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='donor_profile')
    donor_code = models.CharField(max_length=20, unique=True, editable=False)
    name = models.CharField(max_length=150)
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUP_CHOICES)
    state = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    last_donation_date = models.DateField(null=True, blank=True)
    is_available = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    consent_display = models.BooleanField(default=True)
    no_show_count = models.PositiveIntegerField(default=0)

    class Meta:
        indexes = [
            models.Index(fields=['state', 'city', 'pincode']),
            models.Index(fields=['blood_group', 'is_available']),
        ]

    def save(self, *args, **kwargs):
        if not self.donor_code:
            code = f"D-{get_random_string(4, allowed_chars='0123456789')}"
            while Donor.objects.filter(donor_code=code).exists():
                code = f"D-{get_random_string(4, allowed_chars='0123456789')}"
            self.donor_code = code
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} [{self.donor_code}] - {self.blood_group} ({self.city})"
