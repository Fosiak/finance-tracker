
import sys
from pathlib import Path
from datetime import timedelta

import environ
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

SESSION_COOKIE_SECURE = env.bool(
    "DJANGO_SESSION_COOKIE_SECURE",
    default=False,
)

CSRF_COOKIE_SECURE = env.bool(
    "DJANGO_CSRF_COOKIE_SECURE",
    default=False,
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

    "users",
    "transactions",
    "budgets",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
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
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
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

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Email
# https://docs.djangoproject.com/en/6.1/topics/email/#topic-email-configuration

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=[],
)
CSRF_TRUSTED_ORIGINS = env.list(
    "CSRF_TRUSTED_ORIGINS",
    default=[],
)

AUTH_USER_MODEL = "users.User"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
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
        "security_file": {
            "class": "logging.FileHandler",
            "filename": BASE_DIR / "security.log",
            "formatter": "security",
        },
    },

    "loggers": {
        "security": {
            "handlers": ["security_file"],
            "level": "INFO",
            "propagate": False,
        },
    },
}
