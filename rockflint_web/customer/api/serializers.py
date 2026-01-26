from rest_framework import serializers

from rockflint_web.users.models import Profile


class CustomerSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_name = serializers.CharField(source="user.name", read_only=True)

    class Meta:
        model = Profile
        fields = (
            "id",
            "user_id",
            "user_email",
            "user_name",
            "first_name",
            "last_name",
            "phone_number",
            "profile_image",
        )
