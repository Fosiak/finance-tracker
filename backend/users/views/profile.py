from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from users.permissions import IsEmailVerified
from users.serializers.profile import AvatarSerializer, ProfileSerializer


User = get_user_model()


class ProfileView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class AvatarUploadView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = AvatarSerializer
    permission_classes = [IsAuthenticated, IsEmailVerified]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user

    def perform_update(self, serializer):
        old_avatar = serializer.instance.avatar

        super().perform_update(serializer)

        new_avatar = serializer.instance.avatar

        # Django doesn't delete the previous file when a FileField is
        # reassigned - without this, every re-upload leaves the old
        # one behind in the bucket forever.
        if old_avatar and old_avatar != new_avatar:
            old_avatar.delete(save=False)

    def delete(self, request, *args, **kwargs):
        user = self.get_object()

        if user.avatar:
            # Deletes the file from storage and clears + saves the
            # field in one call.
            user.avatar.delete(save=True)

        return Response(status=status.HTTP_204_NO_CONTENT)
