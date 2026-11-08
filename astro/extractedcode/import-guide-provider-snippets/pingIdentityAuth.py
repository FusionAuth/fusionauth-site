# python -m venv venv
# source venv/bin/activate
# pip install requests flask

import requests
import json
from flask import Flask, render_template,  jsonify, request

app = Flask(__name__)

authPath = 'https://auth.pingone.com' # change domain to the one for the region where your user data is stored
apiPath ='https://api.pingone.com/v1' # change domain to the one for the region where your user data is stored
envID = 'YOUR ENVIRONMENT ID'
appId = 'YOUR PING IDENTITY OIDC APP CLIENT ID'
accessToken = "YOUR ACCESS TOKEN"


def sentAuthRequest(appId):
    url = f"{authPath}/{envID}/as/authorize?response_type=code&client_id={appId}&redirect_uri=https://www.google.com&scope=openid"
    payload = {}
    headers= {}
    response = requests.request("GET", url, headers=headers, data = payload, allow_redirects=False)

    if response.status_code!=302:
        print(response.status_code)
        print(response.text.encode('utf8'))
    else:
        return  response.headers['Location'].split("flowId=")[1]

def getFlowId(flowId):

    url = f"{authPath}/{envID}/flows/{flowId}"
    payload = {}
    headers = {}
    response = requests.request("GET", url, headers=headers, data = payload)
    if response.status_code!=200:
        print(response.status_code)
        print(response.text.encode('utf8'))
        return None
    else:
        return flowId

def submitCredentials(flowID,username,userPassword):
    url = f"{authPath}/{envID}/flows/{flowID}"
    payload = "{\n    \"username\": \""+ username +"\",\n    \"password\": \""+ userPassword+"\"\n}"
    headers = {
    'Content-Type': 'application/vnd.pingidentity.usernamePassword.check+json'
    }
    response = requests.request("POST", url, headers=headers, data = payload)

    if response.status_code!=200:
        print(response.status_code)
        print(response.text.encode('utf8'))
    else:
        result = transform_json_user(response.content)
        return result


def transform_json_user(input_json):
    dataJson = json.loads(input_json)
    userId = dataJson["_embedded"]['user']['id']
    dataJson =  readUserInfo(userId)
    transformed_user = {
        "active": dataJson.get("enabled", False),
        "birthDate": None,
        "data": {
            "migrated": True,
        },
        "email": dataJson.get("email", ""),
        "expiry": None,
        "firstName": dataJson["name"].get("given", ""),
        "fullName": "",  # user["name"]["formatted"],
        "id": dataJson.get("id", ""),
        "lastLoginInstant": 0,
        "lastName": dataJson["name"].get("family", ""),
        "middleName": "",
        "passwordChangeRequired": False,
        "passwordLastUpdateInstant": 0,
        "preferredLanguages": ["en"],
        "timezone": None,
        "username": dataJson.get("username", ""),
        "verified": dataJson.get("verifyStatus", False)==True,
   }

    result_json = {"user": transformed_user}
    return result_json

def readUserInfo(userId):
    url =f'{apiPath}/environments/{envID}/users/{userId}?expand=population'
    headers = {'Authorization': 'Bearer ' +accessToken }
    response = requests.get(url,headers=headers,timeout=30)

    if response.status_code!=200:
            print(response.status_code)
            print(response.text.encode('utf8'))
    else:
        jsonData = response.json()
        return jsonData


@app.route('/api/RopcProxy', methods=['POST'])
def rocp_proxy():
    # Extract the 'code' query parameter from the URL
    code = request.args.get('code')

    if not code:
        return jsonify({'error': 'Missing code parameter'}), 400

    # Extract the 'loginId' and 'password' from the JSON body
    data = request.get_json()

    if not data or 'loginId' not in data or 'password' not in data:
        return jsonify({'error': 'Invalid or missing JSON body'}), 400

    login_id = data['loginId']
    password = data['password']

    response_data = TestCredentialLogin(appId,login_id,password)
    # print(json.dumps(response_data,indent=3))
    return response_data

def TestCredentialLogin(appId,username,password):
    print("--> Send auth request")
    flowId =sentAuthRequest(appId)
    print(flowId)
    print("--> Get Flow")
    flowId2=getFlowId(flowId)
    print(flowId2)
    print("--> Validating Credentials")
    result = submitCredentials(flowId2,username,password)
    print("--> Done")
    return result


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001,debug=True)
