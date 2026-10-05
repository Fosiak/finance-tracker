from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage


class SupabasePublicStorage(S3Boto3Storage):
    """
    Uploads still go through the S3-compatible gateway
    (AWS_S3_ENDPOINT_URL) via boto3, same as any other S3 backend.

    But Supabase serves public downloads from a separate REST path
    (/storage/v1/object/public/<bucket>/<key>), not from the S3
    gateway itself - django-storages' default url() builds links
    against the gateway, which 404s for GET. Build the real public
    URL by hand instead.
    """

    def url(self, name, parameters=None, expire=None, http_method=None):
        base_url = settings.AWS_S3_ENDPOINT_URL.removesuffix(
            "/storage/v1/s3"
        )

        return f"{base_url}/storage/v1/object/public/{self.bucket_name}/{name}"
