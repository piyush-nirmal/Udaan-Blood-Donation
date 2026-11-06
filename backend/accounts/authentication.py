import logging
from rest_framework import authentication, exceptions
from django.conf import settings
from .models import User

logger = logging.getLogger('udaan.auth')

class FirebaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split('Bearer ')[1].strip()
        if not token:
            return None

        firebase_uid = None
        email = None
        display_name = ''

        # Development / mock token fallback
        if settings.DEBUG and token.startswith('mock_token_'):
            firebase_uid = f"mock_{token}"
            email = f"{firebase_uid}@udaan-blood.org"
            display_name = "Mock User"
        else:
            try:
                import firebase_admin
                from firebase_admin import auth as fb_auth

                if not firebase_admin._apps:
                    cred_path = getattr(settings, 'FIREBASE_CREDENTIALS_PATH', None)
                    if cred_path:
                        cred = firebase_admin.credentials.Certificate(cred_path)
                        firebase_admin.initialize_app(cred)
                    else:
                        firebase_admin.initialize_app()

                decoded_token = fb_auth.verify_id_token(token)
                firebase_uid = decoded_token['uid']
                email = decoded_token.get('email', f"{firebase_uid}@firebaseuser.udaan")
                display_name = decoded_token.get('name', '')
            except Exception as e:
                logger.warning(f"Firebase token verification failed: {e}")
                raise exceptions.AuthenticationFailed('Invalid or expired Firebase ID token.')

        user, _ = User.objects.get_or_create(
            firebase_uid=firebase_uid,
            defaults={
                'email': email,
                'display_name': display_name,
                'role': 'donor',
            }
        )
        return (user, token)
