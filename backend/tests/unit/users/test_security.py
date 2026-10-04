import logging
import pytest

from users.services.security import (
    log_login_success,
    log_login_failed,
    log_logout,
)


@pytest.mark.django_db
def test_log_login_success(
        user, caplog,
):
    with caplog.at_level(
        logging.INFO,
        logger="security",
    ):
        log_login_success(user)

    assert "LOGIN_SUCCESS" in caplog.text
    assert f"user_id={user.pk}" in caplog.text


def test_log_login_failed(
        caplog,
):
    with caplog.at_level(
        logging.WARNING,
        logger="security",
    ):
        log_login_failed("testuser")

    assert "LOGIN_FAILED" in caplog.text
    assert "testuser" in caplog.text


@pytest.mark.django_db
def text_log_logout(user, caplog):
    with caplog.atlevel(logging.INFO, logger="security"):
        log_logout(user)

    assert "LOGOUT" in caplog.text
    assert f"user_id={user.pk}" in caplog.text
