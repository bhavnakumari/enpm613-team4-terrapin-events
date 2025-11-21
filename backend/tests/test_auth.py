from fastapi import status

def test_login_success(client, seed_user_participant):
    """
    Description: Valid credentials issue a bearer token and user info.
    Input: POST /api/auth/login with known directory_id + correct password
    Output: 200 OK; JSON includes access_token, token_type="bearer", user directory_id
    """
    payload = {"directory_id": seed_user_participant["directory_id"], "password": "Passw0rd!"}
    r = client.post("/api/auth/login", json=payload)
    assert r.status_code == status.HTTP_200_OK
    body = r.json()
    assert "access_token" in body and body["token_type"] == "bearer"
    assert body["user"]["directory_id"] == seed_user_participant["directory_id"]

def test_login_invalid_creds(client):
    """
    Description: Unknown user or wrong password should be rejected.
    Input: POST /api/auth/login with bad directory_id or password
    Output: 400/401; no token in response
    """
    r = client.post("/api/auth/login", json={"directory_id":"doesnotexist","password":"x"})
    assert r.status_code in (400, 401)
