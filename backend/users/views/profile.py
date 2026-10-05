from django.contrib.auth import get_user_model
from rest_framework import generics
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated

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
