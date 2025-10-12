from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.utils.crypto import get_random_string
from django_otp import devices_for_user
from django_otp.plugins.otp_totp.models import TOTPDevice
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from rockflint_web.users.models import Profile
from rockflint_web.users.models import User


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "password", "email"]

    def create(self, validated_data):
        # Extract and handle password properly
        password = validated_data.pop("password")

        # Create the user and hash the password
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # Create an OTP device (for 2FA)
        TOTPDevice.objects.create(user=user, name="Default OTP Device")

        return user


# lOgin with email and password, No otp
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        remember_me = attrs.get("remember_me", False)  # Add remember_me field

        if email is None or password is None:
            raise AuthenticationFailed("Email and password are required.")

        try:
            # Validate email format
            validate_email(email)
        except ValidationError:
            raise AuthenticationFailed("Invalid email format.")

        try:
            # Try to get the user by email
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed("Invalid email or password.")

        # Check if the password is correct
        if not user.check_password(password):
            raise AuthenticationFailed("Invalid email or password.")

        # If successful, return the tokens
        data = super().validate(attrs)

        # Adjust the expiration time for remember me
        if remember_me:
            self.token.set_exp(
                lifetime=timedelta(days=30),
            )  # Set a longer expiration if remember me is true

        return data


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, email):
        if not User.objects.filter(email=email).exists():
            raise serializers.ValidationError("No account found with this email.")
        return email

    def save(self):
        email = self.validated_data["email"]
        user = User.objects.get(email=email)

        # Create a password reset token (you can use Django's default password reset token generator)
        token = get_random_string(length=32)

        # Save token to user (you might want to store it in a model such as `PasswordResetToken`)
        user.passwordresettoken_set.create(token=token)

        # Send password reset email with the token (you can customize the link as needed)
        reset_link = f"{settings.FRONTEND_URL}/reset-password/?token={token}"
        send_mail(
            "Password Reset Request",
            f"Click the link to reset your password: {reset_link}",
            settings.DEFAULT_FROM_EMAIL,
            [email],
        )


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8, write_only=True)

    def validate_token(self, token):
        if not User.objects.filter(passwordresettoken__token=token).exists():
            raise serializers.ValidationError("Invalid or expired token.")
        return token

    def save(self):
        token = self.validated_data["token"]
        new_password = self.validated_data["new_password"]

        # Retrieve the user using the token
        user = User.objects.get(passwordresettoken__token=token)

        # Set the new password
        user.set_password(new_password)
        user.save()

        # Optionally, delete the reset token after use
        user.passwordresettoken_set.filter(token=token).delete()


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
    )

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def save(self):
        user = self.context["request"].user
        new_password = self.validated_data["new_password"]
        user.set_password(new_password)
        user.save()


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["first_name", "last_name", "phone_number", "profile_image"]

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get("first_name", instance.first_name)
        instance.last_name = validated_data.get("last_name", instance.last_name)
        instance.phone_number = validated_data.get(
            "phone_number",
            instance.phone_number,
        )
        instance.profile_image = validated_data.get(
            "profile_image",
            instance.profile_image,
        )
        instance.save()
        return instance


# Login with otp and remember me

User = get_user_model()


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    remember_me = serializers.BooleanField(default=False)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed("Invalid credentials")

        if not user.check_password(password):
            raise AuthenticationFailed("Invalid credentials")

        # If user has TOTP device, require second step
        for device in devices_for_user(user, confirmed=True):
            if isinstance(device, TOTPDevice):
                return {
                    "otp_required": True,
                    "user_id": user.id,
                    "remember_me": attrs.get("remember_me", False),
                }

        # If no OTP device, proceed to generate JWT
        self.context["user"] = user
        return {
            "otp_required": False,
            "user_id": user.id,
            "remember_me": attrs.get("remember_me", False),
        }


class OTPVerifySerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    otp = serializers.CharField()
    remember_me = serializers.BooleanField(default=False)

    def validate(self, attrs):
        user_id = attrs.get("user_id")
        otp = attrs.get("otp")
        remember_me = attrs.get("remember_me", False)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise AuthenticationFailed("Invalid user")

        # Get OTP device
        verified = False
        for device in devices_for_user(user, confirmed=True):
            if isinstance(device, TOTPDevice) and device.verify_token(otp):
                verified = True
                break

        if not verified:
            raise AuthenticationFailed("Invalid OTP code")

        refresh = RefreshToken.for_user(user)

        # Optional: Adjust token lifetime
        if remember_me:
            refresh.set_exp(lifetime=timedelta(days=30))

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
