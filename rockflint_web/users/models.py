import re

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import CharField
from django.urls import reverse
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """
    Default custom user model for rockflint_web.
    If adding fields that need to be filled at user signup,
    check forms.SignupForm and forms.SocialSignupForms accordingly.
    """

    # First and last name do not cover name patterns around the globe
    name = CharField(_("Name of User"), blank=True, max_length=255)
    first_name = None  # type: ignore[assignment]
    last_name = None  # type: ignore[assignment]
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=False)

    def get_absolute_url(self) -> str:
        """Get URL for user's detail view.

        Returns:
            str: URL for user detail.

        """
        return reverse("users:detail", kwargs={"username": self.username})


# Validate phone number format
def validate_phone_number(value):
    if not re.match(r"^\+?1?\d{9,15}$", value):
        raise ValidationError("Invalid phone number format.")


class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone_number = models.CharField(
        max_length=15,
        blank=True,
        validators=[validate_phone_number],
    )
    profile_image = models.ImageField(
        upload_to="profile_image/",
        blank=True,
        null=True,
        default="profile/None/avater.png",
    )

    def __str__(self):
        return self.first_name

    @property
    def fullname(self):
        return f"{self.first_name} {self.last_name}"
