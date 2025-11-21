from fastapi import status
from tests.helper import bearer

def test_get_my_profile(client, seed_user_participant):
    """
    Description: Authenticated user can fetch their profile.
    Input: GET /api/users/me with participant bearer
    Output: 200 OK; JSON directory_id matches caller
    """
    r = client.get("/api/users/me", headers=bearer(seed_user_participant["directory_id"], "participant"))
    assert r.status_code == status.HTTP_200_OK
    assert r.json()["directory_id"] == seed_user_participant["directory_id"]

def test_update_my_profile_happy_path(client, seed_user_participant):
    """
    Description: Authenticated user can update allowed fields.
    Input: PATCH /api/users/me with participant bearer; body {"first_name":"New"}
    Output: 200 OK; JSON reflects updated "first_name"
    """
    r = client.patch(
        "/api/users/me",
        headers=bearer(seed_user_participant["directory_id"], "participant"),
        json={"first_name": "Stu"}
    )
    assert r.status_code == status.HTTP_200_OK
    assert r.json()["first_name"] == "Stu"

def test_public_profile_by_id(client, seed_user_participant):
    """
    Description: Public endpoint returns user’s public profile by directory_id.
    Input: GET /api/users/{directory_id}
    Output: 200 OK; JSON includes email for that user
    """
    r = client.get(f"/api/users/{seed_user_participant['directory_id']}")
    assert r.status_code == status.HTTP_200_OK
    assert r.json()["email"] == seed_user_participant["email"]
