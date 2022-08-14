from flask import Flask, json, make_response, request, redirect, session, url_for, jsonify
import requests
from requests.auth import HTTPBasicAuth
from requests_oauthlib import OAuth2Session
from oauthlib.oauth2 import BackendApplicationClient
from logging.config import dictConfig
import os
import base64
import re
import hashlib
from dotenv import load_dotenv

# Load variables from .env file (not in version control)
load_dotenv()

# client id and client secret
CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('SECRET_KEY')
SESSION_SECRET_KEY= os.getenv('SESSION_SECRET_KEY')
REDIRECT_URI = os.getenv('REDIRECT_URI')
RESPONSE_TYPE = 'code'
# optional parameter for authorization field
APPLICATION_STATE = 'TEST'

headers = {'Accept':'*/*',
           'Authorization' : 'Client-ID ' + CLIENT_ID }

# variables to use for API call
tag_name = 'funny'
sort_filter = 'top'
window_filter = 'week'
page_filter = '0'

# urls
authorization_base_url = 'https://api.imgur.com/oauth2/authorize'
token_url = 'https://api.imgur.com/oauth2/token'
get_request_url = 'https://api.imgur.com/3/gallery/t/'

# code verifiers: Secure random strings. Used to create a code challenge.
code_verifier = base64.urlsafe_b64encode(os.urandom(30)).decode("utf-8")
code_verifier = re.sub('[^a-zA-Z0-9]+', "", code_verifier)

# code challenge - base64 encoded string, SHA256
code_challenge = hashlib.sha256(code_verifier.encode("utf-8")).digest()
code_challenge = base64.urlsafe_b64encode(code_challenge).decode("utf-8")
code_challenge = code_challenge.replace("=", "")

"""
    You need a client id and a client secret to get an access token from the API.
    This is the client's way of asking for permission to use the API service.
    The Authentication token gives the client authorization to use the API service. 

"""

# Configuration to allow HTTP connection in the environment
#os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

# Basic configuration for app for logging
# Referenced from https://flask.palletsprojects.com/en/2.1.x/logging/
dictConfig({
    'version': 1,
    'formatters': {'default': {
        'format': '[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
    }},
    'handlers': {'wsgi': {
        'class': 'logging.StreamHandler',
        'stream': 'ext://flask.logging.wsgi_errors_stream',
        'formatter': 'default'
    }},
    'root': {
        'level': 'INFO',
        'handlers': ['wsgi']
    }
})

app = Flask(__name__)

# First landing page
@app.route('/', methods=['GET'])
def authsamplecall():
    

    imgur = OAuth2Session(client_id=CLIENT_ID, redirect_uri=REDIRECT_URI)
    # Construct authorization url from the base auth url:
    authorization_url, state = imgur.authorization_url(
        url=authorization_base_url)
        # consider specific parameters from imgur
        #response_type=RESPONSE_TYPE)

    app.logger.info('authorization url:  ' + authorization_url)
    app.logger.info('state: ' + state)
    session['oauth_state'] = state
    return redirect(authorization_url)



# Members API Route
@app.route('/json')
def members():
    # Get current directory and output path into terminal console 
    SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    app.logger.info(SITE_ROOT)
    app.logger.info(CLIENT_SECRET)
    json_url = os.path.join(SITE_ROOT, "static/data", "MOCK_DATA.json")
    # Load json from a file 
    json_data = json.load(open(json_url))
    # returns the json data, serialized 
    return json.dumps(json_data)

@app.route('/json2')
def members_two():
    SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    app.logger.info(SITE_ROOT)
    json_url = os.path.join(SITE_ROOT, "static/data", "MOCK_DATA_2.json")
    # Load json from a file 
    json_data = json.load(open(json_url))
    # returns the json data, serialized 
    return json.dumps(json_data)

@app.route('/oauth', methods=['GET'])
def auth():
    # Create an authorization URL by setting parameters in the authorization URL
    #authorization_url = authorization_base_url + '?client_id=' + CLIENT_ID + '&response_type=' + RESPONSE_TYPE  
    authorization_url = authorization_base_url + '?response_type=' + RESPONSE_TYPE +  '&client_id=' + CLIENT_ID + '&redirect_uri=' + REDIRECT_URI + '&code_challenge=' + code_challenge + '&code_challenge_method=S256' 
    app.logger.info(authorization_url)

    # Redirect the user (us) to the authorization URL. From there, the server would authenticate us and a response is sent back. Returns a response to redirect the user to the URI defined 
    # in the application. 
    return redirect(authorization_url)

    # return requests.get(authorization_url).content


@app.route('/oauth/callback/', methods=['GET'])
def callback():
    # state_string = request.args['state']
    # query_string = request.args
    # return query_string
    # token = imgur.fetch_token(
    #     token_url=token_url, 
    #     client_secret=CLIENT_SECRET, 
    #     code_verifier=code_verifier, 
    #     code = code,
    # )

    imgur = OAuth2Session(CLIENT_ID, state=session['oauth_state'])
    token = imgur.fetch_token(token_url, client_secret=CLIENT_SECRET, authorization_response=request.url)

    session['oauth_token'] = token
    return redirect(url_for('.search'))


@app.route('/search', methods=['GET'])
def search():
    imgur = OAuth2Session(CLIENT_ID, token=session['oauth_token'])
    return jsonify(imgur.get('https://api.imgur.com/3/gallery/t/' + tag_name +  '/' + sort_filter + '/' + window_filter + '/' + page_filter).json())


    

# Make API calls to imgur gallery tag name calls.   
# https://api.imgur.com/3/gallery/t/{{tagName}}/{{sort}}/{{window}}/{{page}}
# Imgur API uses OAuth 2.0.  get request is different from the norm due to different authentication
@app.route('/response')
def response():
    get_request = 'https://api.imgur.com/3/gallery/t/' + tag_name +  '/' + sort_filter + '/' + window_filter + '/' + page_filter
    r = requests.get(get_request, headers=headers, auth=(CLIENT_ID, CLIENT_SECRET))
    return r.text

# We need to make sure the cerificate we use for HTTPS is signed by a CA (certificate authority)
# HTTPS (Hypertext Transfer Protocol Secure) is a secure version of the HTTP protocol as it adds an extra layer of encryption, authentication, and integrity via the SSL/TLS protocol
if __name__ == '__main__':
    
    # Plain HTTP callback
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = "1"

    app.config['SECRET_KEY'] = SESSION_SECRET_KEY
    app.run(port=5000)
