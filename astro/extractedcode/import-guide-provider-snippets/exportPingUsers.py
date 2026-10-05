# python -m venv venv
# source venv/bin/activate
# pip install requests

import requests
from requests.auth import HTTPDigestAuth
import json

apiPath = 'https://api.pingone.com/v1' # change domain to the one for the region where your user data is stored

method_call = 'users'
envID = 'ADD YOUR ENVIRONMENT ID'
access_token = "ADD YOUR ACCESS TOKEN"
base_url = f'{apiPath}/environments/{envID}/'


# This method can be enhanced to add more or less data from the main export i.e. Custom Attributes
def transform_json(input_json):
    transformed_users = []

    for user in input_json["_embedded"]["users"]:
        transformed_user = {
            "active": user["enabled"],
            "birthDate": None,
            "insertInstance": None,  # Replace with appropriate value
            "data": {
                "migrated": True,  # Replace with appropriate value
                "favoriteColors": None,  # Replace with appropriate value
            },
            "email": user["email"],
            "expiry": None,
            "firstName":'',# ["name"]["family"],
            "fullName": '',#user["name"]["formatted"],
            "id": user["id"],
            "lastLoginInstant": 0,
            "lastName": user["name"]["family"],
            "middleName": "",
            "mobilePhone": "",
            "password": None,  # Replace with appropriate value
            "salt": None,  # Replace with appropriate value
            "factor": 10000,
            "encryptionScheme": "salted-pbkdf2-hmac-sha256",
            "passwordChangeRequired": False,
            "passwordLastUpdateInstant": 0,
            "preferredLanguages": ["en"],
            "identityProviders": {},
            "timezone": None,
            "twoFactorEnabled": False,
            "username": user["username"],
            "verified": True,  # Replace with appropriate value
        }

        transformed_users.append(transformed_user)

    result_json = {"users": transformed_users}
    return result_json


def main():
    url = base_url + method_call
    headers = {
        'Authorization': 'Bearer ' +access_token,
    }

    response = requests.get(
        url,
        headers=headers,
        timeout=30
    )

    print(response.status_code)

    result = response.json()
    with open("org.json", "w") as json_file:
        json.dump(result, json_file, indent=2)


    output = transform_json(result)

    with open("users.json", "w") as json_file:
        json.dump(output, json_file, indent=2)


if __name__ == "__main__":
    print("Exporting data....")
    main()
    print("Exporting done.")
