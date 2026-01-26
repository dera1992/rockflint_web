# ads/serializers.py
from rest_framework import serializers

from rockflint_web.ads.models import Category
from rockflint_web.ads.models import Feature
from rockflint_web.ads.models import Listing
from rockflint_web.ads.models import ListingImage
from rockflint_web.ads.models import Review


class ListingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = ("id", "image", "caption", "is_primary", "order")


class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = ("id", "name", "icon")


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug")


class ListingSerializer(serializers.ModelSerializer):
    images = ListingImageSerializer(many=True, read_only=True)
    features = FeatureSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "price",
            "rent_period",
            "bedrooms",
            "bathrooms",
            "area",
            "attributes",
            "features",
            "images",
            "primary_image",
            "category",
            "offer",
            "state",
            "lga",
            "vendor",
        ]
        read_only_fields = ("vendor",)

    def get_primary_image(self, obj):
        return obj.primary_image


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Review
        fields = ("id", "user", "listing", "title", "comment", "rating", "created")
        read_only_fields = ("user", "created")
