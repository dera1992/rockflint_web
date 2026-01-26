from rest_framework import serializers

from rockflint_web.ads.models import Listing
from rockflint_web.ads.models import Review
from rockflint_web.users.models import Vendor


class VendorSummarySerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_name = serializers.CharField(source="user.name", read_only=True)

    class Meta:
        model = Vendor
        fields = (
            "id",
            "user_id",
            "user_email",
            "user_name",
            "company_name",
            "phone_number",
            "website",
            "verified",
            "created",
        )


class VendorSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_name = serializers.CharField(source="user.name", read_only=True)

    class Meta:
        model = Vendor
        fields = (
            "id",
            "user",
            "user_email",
            "user_name",
            "company_name",
            "phone_number",
            "website",
            "verified",
            "created",
        )
        read_only_fields = ("created",)


class ListingSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        fields = (
            "id",
            "title",
            "slug",
            "price",
            "active",
            "created",
        )


class ReviewSummarySerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    listing_title = serializers.CharField(source="listing.title", read_only=True)

    class Meta:
        model = Review
        fields = (
            "id",
            "user",
            "listing",
            "listing_title",
            "rating",
            "title",
            "comment",
            "created",
        )


class AgentActivitySerializer(serializers.Serializer):
    activity_type = serializers.CharField()
    created = serializers.DateTimeField()
    summary = serializers.CharField()
    listing_id = serializers.IntegerField(allow_null=True)
    listing_title = serializers.CharField(allow_null=True)
    actor = serializers.CharField(allow_null=True)


class AgentDashboardSerializer(serializers.Serializer):
    vendor = VendorSummarySerializer()
    total_listings = serializers.IntegerField()
    active_listings = serializers.IntegerField()
    inactive_listings = serializers.IntegerField()
    total_reviews = serializers.IntegerField()
    average_rating = serializers.FloatField()
    total_favorites = serializers.IntegerField()
    recent_listings = ListingSummarySerializer(many=True)
    recent_reviews = ReviewSummarySerializer(many=True)
    activities = AgentActivitySerializer(many=True)
