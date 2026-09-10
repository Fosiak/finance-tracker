import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models

from .validators import validate_avatar



def avatar_upload_path(instance, filename):
    extension = filename.rsplit(".", 1)[-1].lower()

    return (
        f"avatars/{instance.pk}/"
        f"{uuid.uuid4()}.{extension}"
    )

class User(AbstractUser):
    avatar = models.ImageField(
        upload_to=avatar_upload_path,
        blank=True,
        null=True,
        validators=[validate_avatar]
    )

    def __str__(self):
        return self.username