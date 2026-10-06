
import sys
from pathlib import Path
from datetime import timedelta

import environ
import dj_database_url
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env()

environ.Env.read_env(BASE_DIR / ".env")
# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!

# SECURITY WARNING: don't run with debug turned on in production!

SECRET_KEY = env("DJANGO_SECRET_KEY")

DEBUG = env.bool("DJANGO_DEBUG", default=False)

SECURE_SSL_REDIRECT = env.bool(
    "DJANGO_SECURE_SSL_REDIRECT",
    default=False,
)

# Render (and most PaaS providers) terminate TLS at a reverse proxy and
# forward plain HTTP to the container, setting this header to signal the
# original scheme. Without it, Django thinks every request is HTTP, which
# breaks SECURE_SSL_REDIRECT (infinite redirect loop) and secure-cookie
# detection.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

SESSION_COOKIE_SECURE = env.bool(
    "DJANGO_SESSION_COOKIE_SECURE",
    default=False,
)

CSRF_COOKIE_SECURE = env.bool(
    "DJANGO_CSRF_COOKIE_SECURE",
    default=False,
)

# The csrftoken cookie is set by api.<domain> but read by JS running on
# app.<domain> (to echo it back as X-CSRFToken), so it needs a shared
# parent-domain scope - a host-only cookie from api.<domain> is invisible
# to document.cookie on app.<domain>. Leave unset for local dev.
CSRF_COOKIE_DOMAIN = env(
    "DJANGO_CSRF_COOKIE_DOMAIN",
    default=None,
)

SECURE_CONTENT_TYPE_NOSNIFF = True

X_FRAME_OPTIONS = "DENY"

SECURE_HSTS_SECONDS = env.int(
    "DJANGO_SECURE_HSTS_SECONDS",
    default=0,
)

SECURE_HSTS_INCLUDE_SUBDOMAINS = env.bool(
    "DJANGO_SECURE_HSTS_INCLUDE_SUBDOMAINS",
    default=False,
)

SECURE_HSTS_PRELOAD = env.bool(
    "DJANGO_SECURE_HSTS_PRELOAD",
    default=False,
)

ALLOWED_HOSTS = env.list(
    "DJANGO_ALLOWED_HOSTS",
    default=[],
)


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    "rest_framework",
    "drf_spectacular",
    "corsheaders",
    "rest_framework_simplejwt.token_blacklist",
    "anymail",
    "storages",

    "users",
    "transactions",
    "budgets",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",

    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
# https://docs.djangoproject.com/en/6.1/ref/settings/#databases

DATABASES = {
    'default': dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
        ssl_require=env.bool("DJANGO_DATABASE_SSL_REQUIRE", default=False),
    )
}


# Password validation
# https://docs.djangoproject.com/en/6.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {
            "min_length": 12,
        },
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.1/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / "staticfiles"

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# User-uploaded media (avatars) via an S3-compatible bucket (Supabase
# Storage). Render's filesystem is ephemeral and, unlike STATIC_URL,
# MEDIA_URL is only ever routed in DEBUG - without this, uploaded
# files would vanish on every redeploy and 404 even before that.
# Only activates when the bucket is actually configured, so local dev
# keeps using plain local-disk FileSystemStorage.
AWS_STORAGE_BUCKET_NAME = env("AWS_STORAGE_BUCKET_NAME", default="")

if AWS_STORAGE_BUCKET_NAME:
    AWS_ACCESS_KEY_ID = env("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = env("AWS_SECRET_ACCESS_KEY")
    AWS_S3_ENDPOINT_URL = env("AWS_S3_ENDPOINT_URL")
    AWS_S3_REGION_NAME = env("AWS_S3_REGION_NAME")
    AWS_S3_ADDRESSING_STYLE = "path"
    AWS_DEFAULT_ACL = None
    AWS_QUERYSTRING_AUTH = False

    STORAGES["default"] = {
        "BACKEND": "users.storage.SupabasePublicStorage",
    }

# Email
# https://docs.djangoproject.com/en/6.1/topics/email/#topic-email-configuration

EMAIL_BACKEND = env(
    "DJANGO_EMAIL_BACKEND",
    default="django.core.mail.backends.console.EmailBackend",
)

# Render blocks outbound traffic to SMTP ports (25/465/587) on free/starter
# web services, so email is sent over Resend's HTTPS API (port 443, never
# blocked) via django-anymail instead of raw SMTP.
ANYMAIL = {
    "RESEND_API_KEY": env("RESEND_API_KEY", default=""),
}

CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=[],
)
CSRF_TRUSTED_ORIGINS = env.list(
    "CSRF_TRUSTED_ORIGINS",
    default=[],
)

# SECURITY: tokens live in HttpOnly cookies, so the frontend origin needs
# credentialed (cookie-carrying) cross-origin requests to actually work.
CORS_ALLOW_CREDENTIALS = True

AUTH_USER_MODEL = "users.User"

# SECURITY: access/refresh tokens are delivered as HttpOnly cookies instead
# of JSON response bodies, so they are never reachable from JS (no XSS
# exfiltration via localStorage/sessionStorage).
AUTH_COOKIE_ACCESS = "access_token"
AUTH_COOKIE_REFRESH = "refresh_token"

# Scope the refresh cookie to the auth endpoints that actually need it, so
# it isn't attached to every single API request.
AUTH_COOKIE_REFRESH_PATH = "/api/auth/"

AUTH_COOKIE_SECURE = env.bool(
    "DJANGO_AUTH_COOKIE_SECURE",
    default=False,
)

AUTH_COOKIE_SAMESITE = env(
    "DJANGO_AUTH_COOKIE_SAMESITE",
    default="Lax",
)

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "users.authentication.CookieJWTAuthentication",
    ),

    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),

    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",

    "DEFAULT_THROTTLE_CLASSES": (
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
        "rest_framework.throttling.ScopedRateThrottle",
    ),

    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",
        "user": "1000/hour",
        "login": "5/minute",
        "register": "3/hour",
        "resend_verification": "3/hour",
        "health": "60/minute",
    },
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Finance Tracker API",
    "DESCRIPTION": "API for personal finance management",
    "VERSION": "1.0.0",
}

PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher",
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",
]

SIMPLE_JWT = {
    # SECURITY: krótko żyjący access token.
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=10),

    # Refresh token może żyć dłużej.
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),

    # SECURITY: po użyciu refresh token otrzymujemy nowy.
    "ROTATE_REFRESH_TOKENS": True,

    # SECURITY: stary refresh token zostaje unieważniony.
    "BLACKLIST_AFTER_ROTATION": True,

    "UPDATE_LAST_LOGIN": False,

    "ALGORITHM": "HS256",
}


FRONTEND_URL = env(
    "FRONTEND_URL",
    default="http://localhost:5173",
)

DEFAULT_FROM_EMAIL = env(
    "DEFAULT_FROM_EMAIL",
    default="no-reply@localhost",
)

if "pytest" in sys.modules:
    REST_FRAMEWORK["DEFAULT_THROTTLE_CLASSES"] = []


LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,

    "formatters": {
        "security": {
            "format": (
                "{asctime} | {levelname} | "
                "{name} | {message}"
            ),
            "style": "{",
        },
    },

    "handlers": {
        "security_console": {
            "class": "logging.StreamHandler",
            "formatter": "security",
        },
    },

    "loggers": {
        "security": {
            "handlers": ["security_console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}
