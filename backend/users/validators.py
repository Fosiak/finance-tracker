import magic

from django.core.exceptions import ValidationError
from PIL import Image


MAX_AVATAR_SIZE = 5 * 1024 * 1024

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}


def validate_avatar(file):
    if not file:
        return

    # SECURITY: limit rozmiaru pliku.
    if file.size > MAX_AVATAR_SIZE:
        raise ValidationError(
            "Avatar must be smaller than 5 MB."
        )

    # SECURITY: sprawdzamy rzeczywisty MIME na podstawie
    # zawartości pliku, a nie rozszerzenia.
    file.seek(0)
    mime_type = magic.from_buffer(
        file.read(2048),
        mime=True,
    )
    file.seek(0)

    if mime_type not in ALLOWED_MIME_TYPES:
        raise ValidationError(
            "Unsupported image format."
        )

    # SECURITY: dodatkowo sprawdzamy, czy Pillow
    # potrafi poprawnie odczytać obraz.
    try:
        image = Image.open(file)
        image.verify()
    except Exception as exc:
        raise ValidationError(
            "Invalid image file."
        ) from exc
    finally:
        file.seek(0)