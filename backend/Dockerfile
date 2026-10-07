FROM python:3.13-slim-bookworm

# Don't buffer stdout/stderr and don't write .pyc files in the container.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# libmagic1 provides the shared library that python-magic binds to
# (required by users/validators.py for true MIME-type sniffing of
# uploaded avatars). This is the reason the backend is deployed via a
# Dockerfile instead of Render's native Python buildpack.
RUN apt-get update && \
    apt-get install -y --no-install-recommends libmagic1 && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run as a non-root user. collectstatic/migrate need to write to /app
# (staticfiles/, media/, db files), so hand ownership to appuser first.
RUN useradd --create-home appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# collectstatic and migrate need DJANGO_SECRET_KEY/DATABASE_URL, which are
# only injected at runtime on Render (not during `docker build`), so they
# run here in the start command rather than as a RUN step.
#
# The seed step only fires when ALLOW_STAGING_SEED_DATA=true, which must
# only ever be set on the staging service's env vars - never production.
# Free-tier Render has no shell/one-off-job access, so re-seeding on every
# boot (redeploy or wake from idle) is the only way to refresh staging data.
CMD python manage.py collectstatic --noinput && \
    python manage.py migrate --noinput && \
    (if [ "$ALLOW_STAGING_SEED_DATA" = "true" ]; then python manage.py seed_staging_data; fi) && \
    gunicorn config.wsgi:application --bind 0.0.0.0:8000
