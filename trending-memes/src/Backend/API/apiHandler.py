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
from time import time 
import ast
import redis
import pymongo

# Load variables from .env file (not in version control)
load_dotenv()

# client id and client secret
CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('SECRET_KEY')
SESSION_SECRET_KEY= os.getenv('SESSION_SECRET_KEY')
REDIRECT_URI = os.getenv('REDIRECT_URI')
TOKEN_EXPIRATION_TIME = os.getenv('TOKEN_EXPIRATION_TIME')
RESPONSE_TYPE = 'code'
# optional parameter for authorization field
APPLICATION_STATE = 'TEST'
FIRST_TIME_LAUNCHED = ast.literal_eval(os.getenv('FIRST_TIME_LAUNCH'))
EXPIRATION = 3600

# 6379 is the default port for redis servers, redis is a quick non-sql database to save for 
# cache 
redis_client = redis.Redis(host='localhost', port=6379, db=0)

headers = {'Connnection' : 'keep-alive'}

# variables to use for API call
tag_name = 'funny'
sort_filter = 'top'
window_filter = 'week'
page_filter = '0'

# urls
authorization_base_url = 'https://api.imgur.com/oauth2/authorize'
token_url = 'https://api.imgur.com/oauth2/token'
refresh_url = token_url
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
def launch():

    app.logger.info('first launched bool status: ' + str(FIRST_TIME_LAUNCHED))
    
    # first, check if expiration time on token has expired 
    if (FIRST_TIME_LAUNCHED): 
        # re-load .env file to dynamically get updated data
        load_dotenv()
        # if the user manual process has been done to authenticate the application, we can go ahead
        # and validate if access token has expired. 
        validate_access_token()
        return redirect(url_for('.search'))
    else: 
        imgur = OAuth2Session(client_id=CLIENT_ID, redirect_uri=REDIRECT_URI)
        # Construct authorization url from the base auth url:
        authorization_url, state = imgur.authorization_url(
            url=authorization_base_url)
            # consider specific parameters from imgur
            # response_type=RESPONSE_TYPE)

        app.logger.info('authorization url:  ' + authorization_url)
        app.logger.info('state: ' + state)
        session['oauth_state'] = state


        # Update the FIRST_TIME_LAUNCHED value in the .env file
        with open("../../../.env", "r") as file:
            content = file.readlines()
            
        with open("../../../.env", "w") as file:
            for line in content:
                if "FIRST_TIME_LAUNCH" in line:
                    file.write(f"FIRST_TIME_LAUNCH={True}\n")
                else:
                    file.write(line)

        return redirect(authorization_url)


def validate_access_token():
    if (float(time()) >= float(TOKEN_EXPIRATION_TIME)):
        app.logger.info('condition statement triggered.')
        automatic_refresh()


def set_session_cache(session):
    # expiration is a field variable
    redis_client.set('oauth_state', session['oauth_state'], ex=EXPIRATION)
    redis_client.set('oauth_token', json.dumps(session['oauth_token']), ex=EXPIRATION)
    redis_client.set('refresh_token', json.dumps(session['refresh_token']), ex=None)

def get_session_cache(): 
    session['oauth_state'] = redis_client.get('oauth_state')
    session['oauth_token'] = json.loads(redis_client.get('oauth_token'))
    session['refresh_token'] = json.loads(redis_client.get('refresh_token'))
    # if (session is None):
    #     session = generate_session_cache()
    return session


def generate_session_cache():
    imgur = OAuth2Session(client_id=CLIENT_ID, redirect_uri=REDIRECT_URI)
    # Construct authorization url from the base auth url:
    authorization_url, state = imgur.authorization_url(
        url=authorization_base_url)
        # consider specific parameters from imgur
        # response_type=RESPONSE_TYPE)

    app.logger.info('authorization url:  ' + authorization_url)
    app.logger.info('state: ' + state)
    session['oauth_state'] = state

    token = imgur.fetch_token(token_url, client_secret=CLIENT_SECRET, authorization_response=request.url)
    session['oauth_token'] = token
    session['refresh_token'] = token['refresh_token']

    return session

def reload_env_vars():
    load_dotenv()
    # client id and client secret
    global CLIENT_ID; CLIENT_ID = os.getenv('CLIENT_ID')
    global CLIENT_SECRET; CLIENT_SECRET = os.getenv('SECRET_KEY')
    SESSION_SECRET_KEY= os.getenv('SESSION_SECRET_KEY')
    REDIRECT_URI = os.getenv('REDIRECT_URI')
    TOKEN_EXPIRATION_TIME = os.getenv('TOKEN_EXPIRATION_TIME')
    RESPONSE_TYPE = 'code'
    # optional parameter for authorization field
    APPLICATION_STATE = 'TEST'
    FIRST_TIME_LAUNCHED = ast.literal_eval(os.getenv('FIRST_TIME_LAUNCH'))
    EXPIRATION = 3600




# @app.route('/json2')
# def members_two():
#     SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
#     app.logger.info(SITE_ROOT)
#     json_url = os.path.join(SITE_ROOT, "static/data", "MOCK_DATA_2.json")
#     # Load json from a file 
#     json_data = json.load(open(json_url))
#     # returns the json data, serialized 
#     return json.dumps(json_data)

# Callback
@app.route('/oauth/callback/', methods=['GET'])
def callback():
    imgur = OAuth2Session(CLIENT_ID, state=session['oauth_state'])
    token = imgur.fetch_token(token_url, client_secret=CLIENT_SECRET, authorization_response=request.url)
    session['oauth_token'] = token
    session['refresh_token'] = token['refresh_token']


    # store session and token in redis db 
    set_session_cache(session)
    app.logger.info('session[oauth_state]: ' + session['oauth_state'])
    app.logger.info('session[oauth_token]: ' + json.dumps(session['oauth_token']))
    app.logger.info('session[refresh_token]: ' + json.dumps(session['refresh_token'])) 

        # Update the values in the .env file
    with open("../../../.env", "r") as file:
        content = file.readlines()
        
    with open("../../../.env", "w") as file:
        for line in content:
            if "TOKEN_EXPIRATION_TIME" in line:
                file.write(f"TOKEN_EXPIRATION_TIME={time() + 3600}\n")
            elif "SESSION_SECRET_KEY" in line:
                file.write(f"SESSION_SECRET_KEY={code_challenge}\n")
            else:
                file.write(line)

    return redirect(url_for('.search'))


@app.route('/search', methods=['GET'])
def search():
    imgur = OAuth2Session(CLIENT_ID, token=session['oauth_token'])
    
    return jsonify(imgur.get('https://api.imgur.com/3/gallery/t/' + tag_name +  '/' + sort_filter + '/' + window_filter + '/' + page_filter).json())


@app.route('/all_album_image_links/<string:album_hash_info>', methods=['GET'])
def all_album_image_links(album_hash_info):
    imgur = OAuth2Session(CLIENT_ID, token=session['oauth_token'])
    return jsonify(imgur.get('https://api.imgur.com/3/album/' + album_hash_info + '/images').json())

    
@app.route('/automatic_refresh', methods=['GET'])
def automatic_refresh():
    app.logger.info('Called automatic refresh function.')
    token = session['oauth_token']

    token['expires_at'] = time() + 3600

    extra = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }
    
    def token_updater(token):
        session['oauth_token'] = token

    
    # os.environ["TOKEN_EXPIRATION_TIME"] = str(token['expires_at'])
    token_expiration_time = token['expires_at']


    # Update the values in the .env file
    with open("../../../.env", "r") as file:
        content = file.readlines()
        
    with open("../../../.env", "w") as file:
        for line in content:
            if "TOKEN_EXPIRATION_TIME" in line:
                file.write(f"TOKEN_EXPIRATION_TIME={token_expiration_time}\n")
            elif "SESSION_SECRET_KEY" in line:
                file.write(f"SESSION_SECRET_KEY={code_challenge}\n")
            else:
                file.write(line)

    imgur = OAuth2Session(client_id=CLIENT_ID, token=token, auto_refresh_kwargs=extra, auto_refresh_url=refresh_url, token_updater=token_updater)
    return jsonify(session['oauth_token'])

@app.route('/validate', methods=['GET'])
def validate():
    token = session['oauth_token']

    validate_url = 'https://api.imgur.com/oauth2/secret?' 'access_token=%s' % token['access_token']
    return jsonify(requests.get(validate_url).json())


# We need to make sure the cerificate we use for HTTPS is signed by a CA (certificate authority)
# HTTPS (Hypertext Transfer Protocol Secure) is a secure version of the HTTP protocol as it adds an extra layer of encryption, authentication, and integrity via the SSL/TLS protocol
if __name__ == '__main__':
    
    # Plain HTTP callback
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = "1"
    app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True
    app.config['SECRET_KEY'] = SESSION_SECRET_KEY
    app.run(port=5000, debug=True)
