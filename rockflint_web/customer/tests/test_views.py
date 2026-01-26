import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from rockflint_web.ads.models import Category
from rockflint_web.ads.models import Favorite
from rockflint_web.ads.models import Listing
from rockflint_web.ads.models import LGA
from rockflint_web.ads.models import Offer
from rockflint_web.ads.models import State
from rockflint_web.users.models import Profile
from rockflint_web.users.models import Vendor
from rockflint_web.users.tests.factories import UserFactory

pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


def create_profile(user):
    return Profile.objects.create(
        user=user,
        first_name="Jamie",
        last_name="Customer",
        phone_number="+15551234567",
    )


@pytest.fixture
def listing_dependencies():
    state = State.objects.create(name="Test State")
    lga = LGA.objects.create(state=state, name="Test LGA")
    category = Category.objects.create(name="Apartment")
    offer = Offer.objects.create(name="For Rent")
    return category, offer, state, lga


def create_listing(vendor, listing_dependencies, title="Test Listing"):
    category, offer, state, lga = listing_dependencies
    return Listing.objects.create(
        vendor=vendor,
        title=title,
        category=category,
        offer=offer,
        state=state,
        lga=lga,
        price=1200,
        active=True,
    )


def test_staff_can_list_customers(api_client):
    staff_user = UserFactory(is_staff=True)
    customer_user = UserFactory()
    profile = create_profile(customer_user)

    api_client.force_authenticate(user=staff_user)
    response = api_client.get(reverse("customer:customers-list"))

    assert response.status_code == status.HTTP_200_OK
    assert response.data[0]["id"] == profile.id
    assert response.data[0]["user_id"] == customer_user.id


def test_non_staff_cannot_list_customers(api_client):
    user = UserFactory()
    api_client.force_authenticate(user=user)

    response = api_client.get(reverse("customer:customers-list"))

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_non_staff_can_retrieve_own_customer(api_client):
    user = UserFactory()
    profile = create_profile(user)

    api_client.force_authenticate(user=user)
    response = api_client.get(reverse("customer:customers-detail", args=[profile.id]))

    assert response.status_code == status.HTTP_200_OK
    assert response.data["id"] == profile.id


def test_customer_can_view_wishlist(api_client, listing_dependencies):
    user = UserFactory()
    create_profile(user)
    vendor_user = UserFactory()
    vendor = Vendor.objects.create(user=vendor_user, company_name="Vendor Co")
    listing = create_listing(vendor, listing_dependencies, title="Wishlist Home")
    Favorite.objects.create(user=user, listing=listing)

    api_client.force_authenticate(user=user)
    response = api_client.get(reverse("customer:customers-wishlist"))

    assert response.status_code == status.HTTP_200_OK
    assert response.data[0]["listing"]["id"] == listing.id
