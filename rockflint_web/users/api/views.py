from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.db.models.signals import post_save
from django.dispatch import receiver
from datetime import timedelta

from django.utils import timezone
from django.utils.encoding import force_bytes
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.utils.http import urlsafe_base64_encode
from django.urls import reverse
from rest_framework import generics
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.mixins import ListModelMixin
from rest_framework.mixins import RetrieveModelMixin
from rest_framework.mixins import UpdateModelMixin
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView
from social_django.models import UserSocialAuth

from rockflint_web.users.models import Profile
from rockflint_web.users.models import User

from .serializers import ChangePasswordSerializer
from .serializers import CustomTokenObtainPairSerializer
from .serializers import LoginSerializer
from .serializers import OTPVerifySerializer
from .serializers import PasswordResetSerializer
from .serializers import ProfileSerializer
from .serializers import ResetPasswordSerializer
from .serializers import UserSerializer
from .tokens import account_activation_token


class UserViewSet(RetrieveModelMixin, ListModelMixin, UpdateModelMixin, GenericViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()
    lookup_field = "username"

    def get_queryset(self, *args, **kwargs):
        assert isinstance(self.request.user.id, int)
        return self.queryset.filter(id=self.request.user.id)

    @action(detail=False)
    def me(self, request):
        serializer = UserSerializer(request.user, context={"request": request})
        return Response(status=status.HTTP_200_OK, data=serializer.data)


class UserRegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save(is_active=False)  # prevent login until activated
            user.email_verification_expiry = timezone.now() + timedelta(hours=24)
            user.save(update_fields=["email_verification_expiry"])

            # Generate activation link
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = account_activation_token.make_token(user)
            activation_link = request.build_absolute_uri(
                reverse("users:activate", kwargs={"uidb64": uid, "token": token})
            )

            # Send email
            send_mail(
                "Activate your account",
                "Please click the link below to activate your account:\n"
                f"{activation_link}",
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )

            return Response(
                {
                    "message": "User registered successfully. Please check your email to activate your account.",
                    "user_id": user.id,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class OTPVerifyView(APIView):
    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# Token Refresh view
class TokenRefreshView(TokenRefreshView):
    pass


class PasswordResetView(generics.GenericAPIView):
    serializer_class = PasswordResetSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Password reset email sent."})


class ResetPasswordView(generics.GenericAPIView):
    serializer_class = ResetPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Password reset successfully."})


class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        # Custom handling for password change
        return super().update(request, *args, **kwargs)


class ProfileCreateUpdateView(generics.CreateAPIView, generics.UpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # If the profile doesn't exist, create a new one
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return profile

    def post(self, request, *args, **kwargs):
        # Create profile (if not created during registration)
        return self.create(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        # Update profile
        return self.update(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@receiver(post_save, sender=UserSocialAuth)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    user = instance.user
    if created:
        # Handle new user profile creation or update
        user.profile.first_name = instance.extra_data.get("given_name", "")
        user.profile.last_name = instance.extra_data.get("family_name", "")
        user.profile.save()


class DeactivateAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.is_active = False
        request.user.save()
        return Response({"message": "Your account has been deactivated."})


class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.delete()
        return Response({"message": "Your account has been deleted."})


class EmailVerification(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, token):
        try:
            # Validate the token and check expiration
            user = RefreshToken(token).user
            if (
                not user.email_verification_expiry
                or timezone.now() > user.email_verification_expiry
            ):
                return Response(
                    {"error": "Verification token expired."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user.is_active = True  # Mark user as active
            user.save()
            return Response(
                {"message": "Email verified successfully."},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


User = get_user_model()


class ActivateAccountView(APIView):
    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user and account_activation_token.check_token(user, token):
            user.is_active = True
            user.save()
            return Response(
                {"message": "Account activated successfully."},
                status=status.HTTP_200_OK,
            )
        return Response(
            {"error": "Invalid activation link"},
            status=status.HTTP_400_BAD_REQUEST,
        )
