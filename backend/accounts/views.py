from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Donor
from .serializers import UserAuthSerializer, DonorProfileSerializer, RegisterDonorSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_me(request):
    serializer = UserAuthSerializer(request.user)
    data = serializer.data
    # attach bearer token echo
    auth_header = request.headers.get('Authorization', '')
    data['token'] = auth_header.replace('Bearer ', '').strip()
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_donor(request):
    if hasattr(request.user, 'donor_profile'):
        return Response(
            {'error': 'Donor profile already exists for this user.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = RegisterDonorSerializer(data=request.data)
    if serializer.is_valid():
        donor = serializer.save(user=request.user)
        return Response(DonorProfileSerializer(donor).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH', 'PUT'])
@permission_classes([IsAuthenticated])
def update_donor(request):
    if not hasattr(request.user, 'donor_profile'):
        return Response({'error': 'Donor profile not found.'}, status=status.HTTP_404_NOT_FOUND)

    donor = request.user.donor_profile
    serializer = RegisterDonorSerializer(donor, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(DonorProfileSerializer(donor).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_availability(request):
    if not hasattr(request.user, 'donor_profile'):
        return Response({'error': 'Donor profile not found.'}, status=status.HTTP_404_NOT_FOUND)

    is_available = request.data.get('is_available')
    if is_available is None:
        return Response({'error': 'is_available boolean is required.'}, status=status.HTTP_400_BAD_REQUEST)

    donor = request.user.donor_profile
    donor.is_available = bool(is_available)
    donor.save(update_fields=['is_available', 'updated_at'])
    return Response(DonorProfileSerializer(donor).data)

@api_view(['GET'])
@permission_classes([AllowAny])
def list_donors(request):
    qs = Donor.objects.filter(is_available=True)
    bg = request.query_params.get('blood_group')
    city = request.query_params.get('city')
    if bg and bg != 'all':
        qs = qs.filter(blood_group=bg)
    if city:
        qs = qs.filter(city__iexact=city)

    serializer = DonorProfileSerializer(qs[:50], many=True)
    return Response(serializer.data)
