from django.conf import settings
from django.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework.routers import SimpleRouter

from rockflint_web.users.api.views import UserViewSet

router = DefaultRouter() if settings.DEBUG else SimpleRouter()

router.register("users", UserViewSet)


app_name = "api"
urlpatterns = [
    path("", include(router.urls)),
    path("users/", include("rockflint_web.users.urls", namespace="users")),
    path("ads/", include("rockflint_web.ads.urls", namespace="ads")),
    path("agent/", include("rockflint_web.agent.urls", namespace="agent")),
    path("customer/", include("rockflint_web.customer.urls", namespace="customer")),
]
