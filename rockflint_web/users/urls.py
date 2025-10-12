from django.urls import path

from rockflint_web.users.api.views import ActivateAccountView
from rockflint_web.users.api.views import ChangePasswordView
from rockflint_web.users.api.views import CustomTokenObtainPairView
from rockflint_web.users.api.views import DeactivateAccountView
from rockflint_web.users.api.views import DeleteAccountView
from rockflint_web.users.api.views import LoginView
from rockflint_web.users.api.views import OTPVerifyView
from rockflint_web.users.api.views import PasswordResetView
from rockflint_web.users.api.views import ProfileCreateUpdateView
from rockflint_web.users.api.views import ResetPasswordView
from rockflint_web.users.api.views import TokenRefreshView
from rockflint_web.users.api.views import UserRegisterView

from .views import user_detail_view
from .views import user_redirect_view
from .views import user_update_view

app_name = "users"
urlpatterns = [
    path("~redirect/", view=user_redirect_view, name="redirect"),
    path("~update/", view=user_update_view, name="update"),
    path("<str:username>/", view=user_detail_view, name="detail"),
    path("register/", UserRegisterView.as_view(), name="register"),
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("password-reset/", PasswordResetView.as_view(), name="password-reset"),
    path("password-reset/confirm/", ResetPasswordView.as_view(), name="reset-password"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("profile/", ProfileCreateUpdateView.as_view(), name="create-update-profile"),
    path("auth/login/", LoginView.as_view(), name="login-user"),
    path("auth/verify-otp/", OTPVerifyView.as_view(), name="verify-otp"),
    path("deactivate/", DeactivateAccountView.as_view(), name="deactivate-account"),
    path("delete/", DeleteAccountView.as_view(), name="delete-account"),
    path("activate/<uidb64>/<token>/", ActivateAccountView.as_view(), name="activate"),
]
