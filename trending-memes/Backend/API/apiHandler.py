from flask import Flask, json, make_response, request, redirect, session, url_for, jsonify
import requests
from requests.auth import HTTPBasicAuth
from requests_oauthlib import OAuth2Session
from oauthlib.oauth2 import BackendApplicationClient
from logging.config import dictConfig
from flask.helpers import send_from_directory
from flask_cors import CORS, cross_origin
from flask.sessions import SecureCookieSession
import os
import base64
import re
import hashlib
from dotenv import load_dotenv
from time import time 
import ast
import redis
import pymongo
from waitress import serve

# Load variables from .env file (not in version control)
load_dotenv('../../.env')

# client id and client secret
CLIENT_ID = os.environ.get('CLIENT_ID')
CLIENT_SECRET = os.environ.get('SECRET_KEY')
SESSION_SECRET_KEY= os.environ.get('SESSION_SECRET_KEY')
REDIRECT_URI = os.environ.get('REDIRECT_URI')
# TOKEN_EXPIRATION_TIME = os.environ.get('TOKEN_EXPIRATION_TIME')
RESPONSE_TYPE = 'code'
# optional parameter for authorization field
APPLICATION_STATE = 'TEST'
# FIRST_TIME_LAUNCHED = ast.literal_eval(str(os.environ.get('FIRST_TIME_LAUNCH')))
EXPIRATION = 3600
REDIS_HOST = str(os.environ.get('REDIS_HOST'))

# 6379 is the default port for redis servers, redis is a quick non-sql database to save for 
# cache 
redis_client = redis.Redis(host=REDIS_HOST, port=5591, db=0)

headers = {'Connnection' : 'keep-alive'}

# variables to use for API call
tag_name = 'funny'
sort_filter = 'top'
window_time_filter = 'week'
custom_time_filter = 'month'
page_filter = '0'

# urls
authorization_base_url = 'https://api.imgur.com/oauth2/authorize'
token_url = 'https://api.imgur.com/oauth2/token'
refresh_url = token_url
get_request_url = 'https://api.imgur.com/3/gallery/t/'

# code verifiers: Secure random strings. Used to create a code challenge.
code_verifier = base64.urlsafe_b64encode(os.urandom(30)).decode("utf-8").strip('\"')
code_verifier = re.sub('[^a-zA-Z0-9]+', "", code_verifier)

# code challenge - base64 encoded string, SHA256
code_challenge = hashlib.sha256(code_verifier.encode("utf-8")).digest()
code_challenge = base64.urlsafe_b64encode(code_challenge).decode("utf-8").strip('\"')
code_challenge = code_challenge.replace("=", "")
print(code_challenge)

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

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.ProductionConfig')
    return app

app = create_app()
# serve(app, url_scheme='https')

# First landing page
@app.route('/', methods=['GET'])
def launch():

    # re-load .env file to dynamically get updated data
    # reload_env_vars()

    FIRST_TIME_LAUNCHED = redis_client.get("first_time_launched") 

    if (type(FIRST_TIME_LAUNCHED) is bytes): 
        FIRST_TIME_LAUNCHED = eval(FIRST_TIME_LAUNCHED.decode("utf-8").strip('\"'))

    app.logger.info('first launched bool status: ' + str(FIRST_TIME_LAUNCHED))
    print('type of bool status: ', type(FIRST_TIME_LAUNCHED))
    
    # first, check if expiration time on token has expired 
    if (FIRST_TIME_LAUNCHED): 
        # if the user manual process has been done to authenticate the application, we can go ahead
        # and validate if access token has expired. 
        validate_access_token()
        return redirect(url_for('.search'))
    else: 
        imgur = OAuth2Session(client_id=CLIENT_ID, redirect_uri=REDIRECT_URI)
        # Construct authorization url from the base auth url:
        authorization_url, state = imgur.authorization_url(
            url=authorization_base_url, access_type='offline',
            include_granted_scopes='true')
            # consider specific parameters from imgur
            # response_type=RESPONSE_TYPE)

        app.logger.info('authorization url:  ' + authorization_url)
        app.logger.info('state: ' + state)
        session['oauth_state'] = state


        # Update the FIRST_TIME_LAUNCHED value in the .env file
        # with open("../../.env", "r") as file:
        #     content = file.readlines()
            
        # with open("../../.env", "w") as file:
        #     for line in content:
        #         if "FIRST_TIME_LAUNCH" in line:
        #             file.write(f"FIRST_TIME_LAUNCH={True}\n")
        #         else:
        #             file.write(line)

        redis_client.set("first_time_launched", "True")
        FIRST_TIME_LAUNCHED = True

        return redirect(authorization_url)


def validate_access_token():
    expires_at = redis_client.get('expires_at')
    if (type(expires_at) is bytes):
        expires_at = expires_at.decode('utf-8').strip('\"')
        if (float(time()) >= float(expires_at)):
            app.logger.info('condition statement triggered.')
            automatic_refresh()
        else: 
            app.logger.info('condition statement not triggered.')
    else: 
        app.logger.info('non-existing expiration')


def set_session_cache(session):
    # expiration is a field variable
    expires_in = session.get('oauth_token').get('expires_in')
    app.logger.info('expires in: ' + str(int(expires_in)))
    redis_client.set('oauth_state', session['oauth_state'], ex=int(expires_in))
    redis_client.set('oauth_token', json.dumps(session['oauth_token']), ex=int(expires_in))
    redis_client.set('refresh_token', session['refresh_token'], ex=None)
    redis_client.set('expires_at', int(session['oauth_token'].get('expires_at')), ex=int(expires_in))

def get_session_cache(): 
    if (redis_client.get('oauth_state') is not None):
        oauth_state = redis_client.get('oauth_state')
        if (type(oauth_state) is bytes):
            app.logger.info("executed decode for oauth_state " + oauth_state.decode('utf-8').strip('\"'))
            session['oauth_state'] = oauth_state.decode('utf-8').strip('\"')
        else: 
            # may not actually execute
            app.logger.info("type of oauth_state" + str(type(oauth_state)))
            session['oauth_state'] = oauth_state
    if (redis_client.get('oauth_token') is not None):
        app.logger.info('triggered condition for getting oauth_token')
        oauth_token = redis_client.get('oauth_token')
        if (type(oauth_token) is bytes):
            app.logger.info("executed decode for oauth_token " + oauth_token.decode('utf-8').strip('\"'))
            session['oauth_token'] = json.loads(oauth_token.decode('utf-8').strip('\"'))
        else: 
            # may not actually execute
            app.logger.info("type of oauth_token" + str(type(oauth_token)))
            session['oauth_token'] = oauth_token

        refresh_token = redis_client.get('refresh_token')
        if (type(refresh_token) is bytes):
            app.logger.info("executed decode for refresh_token " + refresh_token.decode('utf-8').strip('\"'))
            session['refresh_token'] = refresh_token.decode('utf-8').strip('\"')
        else: 
            # may not actually execute
            app.logger.info("type of refresh_token" + str(type(refresh_token)))
            session['refresh_token'] = refresh_token

    print('return statement before session executed')
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
    # session['refresh_token'] = token['refresh_token']

    return session

# def reload_env_vars():
#     # Read environment variables from .env file
#     with open("../../.env") as f:
#         for line in f:
#             line_parts = line.strip().split("=")
#             if len(line_parts) == 2:
#                 key, value = line_parts
#                 app.logger.info(key + " " + value)
#                 os.environ[key] = value

#     global CLIENT_ID
#     CLIENT_ID = os.environ.get('CLIENT_ID')

#     global CLIENT_SECRET
#     CLIENT_SECRET = os.environ.get('SECRET_KEY')

#     global SESSION_SECRET_KEY
#     SESSION_SECRET_KEY = os.environ.get('SESSION_SECRET_KEY')

#     global REDIRECT_URI
#     REDIRECT_URI = os.environ.get('REDIRECT_URI')

#     global TOKEN_EXPIRATION_TIME
#     TOKEN_EXPIRATION_TIME = os.environ.get('TOKEN_EXPIRATION_TIME')

#     global FIRST_TIME_LAUNCHED
#     FIRST_TIME_LAUNCHED = ast.literal_eval(os.environ.get('FIRST_TIME_LAUNCH'))

#     global EXPIRATION
#     EXPIRATION = 3600




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
@app.route('/callback', methods=['GET'])
def callback():
    print("session", jsonify(session))
    app.logger.info('session: ', session)
    imgur = OAuth2Session(CLIENT_ID, state=session['oauth_state'])
    token = imgur.fetch_token(token_url, client_secret=CLIENT_SECRET, authorization_response=request.url)
    session['oauth_token'] = token
    session['refresh_token'] = token['refresh_token']


    print('full session info:' + str(session))
    # store session and token in redis db 
    set_session_cache(session)
    app.logger.info('session[oauth_state]: ' + session['oauth_state'])
    app.logger.info('session[oauth_token]: ' + json.dumps(session['oauth_token']))
    app.logger.info('session[refresh_token]: ' + json.dumps(session['refresh_token'])) 

        # Update the values in the .env file
    # with open("../../.env", "r") as file:
    #     content = file.readlines()
        
    # with open("../../.env", "w") as file:
    #     for line in content:
    #         if "TOKEN_EXPIRATION_TIME" in line:
    #             file.write(f"TOKEN_EXPIRATION_TIME={time() + 3600}\n")
    #         # elif "SESSION_SECRET_KEY" in line:
    #         #     file.write(f"SESSION_SECRET_KEY={code_challenge}\n")
    #         else:
    #             file.write(line)

    redis_client.set('expires_at', session['oauth_token']['expires_at'])

    return redirect(url_for('.search'))


@app.route('/search', methods=['GET'])
def search():
    imgur = None
    oauth_token = None
    refresh_token = None

    session = get_session_cache()

    if (session.get('oauth_token') is not None):
        # session['oauth_token'] can be a dict or a str
        if (type(session['oauth_token']) == dict):
            oauth_token = session['oauth_token']
        else:
            oauth_token = session['oauth_token']
        imgur = OAuth2Session(CLIENT_ID, token={"access_token": oauth_token.get('access_token')})
    elif (session.get('refresh_token') is not None):
        imgur = OAuth2Session(CLIENT_ID, token={"refresh_token": session['refresh_token']})
    # elif (session.get('oauth_token') is None and session.get('refresh_token') is None):
    #     if (redis_client.get('oauth_token') is not None):
    #         session['oauth_token'] = redis_client.get('oauth_token')
    #         imgur = OAuth2Session(CLIENT_ID, token={"access_token": oauth_token})
    #     elif (redis_client.get('refresh_token') is not None):
    #         imgur = OAuth2Session(CLIENT_ID, token={"refresh_token": redis_client.get('refresh_token')})
    else:    
        return "Error: Both oauth_token and refresh_token are missing"

    query = request.args.get('q')
    app.logger.info('current query: ' + str(query))
    if (query is None or query == ""):
        return jsonify(imgur.get('https://api.imgur.com/3/gallery/t/' + tag_name +  '/' + sort_filter + '/' + window_time_filter + '/' + page_filter).json())
    else:
        return jsonify(imgur.get('https://api.imgur.com/3/gallery/t/' + query +  '/' + sort_filter + '/' + custom_time_filter + '/' + page_filter).json())


@app.route('/all_album_image_links/<string:album_hash_info>', methods=['GET'])
def all_album_image_links(album_hash_info):
    imgur = None
    oauth_token = None
    refresh_token = None

    session = get_session_cache()

    if (session.get('oauth_token') is not None):
        # session['oauth_token'] can be a dict or a str
        if (type(session['oauth_token']) == dict):
            oauth_token = session['oauth_token'].get('access_token')
        else:
            oauth_token = session['oauth_token']
        imgur = OAuth2Session(CLIENT_ID, token={"access_token": oauth_token})
    elif (session.get('refresh_token') is not None):
        imgur = OAuth2Session(CLIENT_ID, token={"refresh_token": session['refresh_token']})
    # elif (session.get('oauth_token') is None and session.get('refresh_token') is None):
    #     if (redis_client.get('oauth_token') is not None):
    #         session = get_session_cache()
    #         imgur = OAuth2Session(CLIENT_ID, token={"access_token": oauth_token})
    #     elif (redis_client.get('refresh_token') is not None):
    #         imgur = OAuth2Session(CLIENT_ID, token={"refresh_token": session['refresh_token']})
    else:    
        return "Error: Both oauth_token and refresh_token are missing"

    return jsonify(imgur.get('https://api.imgur.com/3/album/' + album_hash_info + '/images').json())

    
@app.route('/automatic_refresh', methods=['GET, POST'])
def automatic_refresh():
    app.logger.info('Called automatic refresh function.')
    session = get_session_cache()
    # token = session['oauth_token']
    refresh_token = session['refresh_token']
    # str_refresh_token = str(refresh_token, 'utf-8').replace('"', '')

    app.logger.info("refresh token: " + str(refresh_token))
    # print("refresh_token " + str_refresh_token)

    # token['expires_at'] = time() + 3600
    new_expiration_time = time() + 3600

    extra = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }
    
    def token_updater(token):
        session['oauth_token'] = token

    
    # os.environ["TOKEN_EXPIRATION_TIME"] = str(token['expires_at'])
    # token_expiration_time = new_expiration_time
    # app.logger.info("decoded refresh token: " + str_refresh_token)

    params = {
        "grant_type": "refresh_token",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "refresh_token": refresh_token
    }

    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }

    imgur = OAuth2Session(client_id=CLIENT_ID)
    # For some reason, imgur.refresh_tokens function is not working as it mentions I 
    # need the access token. Temporarily replacing this with a post call to get json response in the meantime
    response_json = imgur.post(refresh_url, data=params, headers=headers).json()

    app.logger.info(response_json)

    # Construct authorization url from the base auth url:
    authorization_url, state = imgur.authorization_url(
    url=authorization_base_url, access_type='offline',
    include_granted_scopes='true')

    session['oauth_state'] = state
    session['oauth_token'] = response_json['oauth_token']
    session['refresh_token'] = response_json['refresh_token']
    # session['expires_at'] = response_json['oauth_token']['expires_in']
    set_session_cache(session)


    #     # Update the values in the .env file
    # with open("../../.env", "r") as file:
    #     content = file.readlines()
        
    # with open("../../.env", "w") as file:
    #     for line in content:
    #         if "TOKEN_EXPIRATION_TIME" in line:
    #             file.write(f"TOKEN_EXPIRATION_TIME={token_expiration_time}\n")
    #         # elif "SESSION_SECRET_KEY" in line:
    #         #     file.write(f"SESSION_SECRET_KEY={code_challenge}\n")
    #         else:
    #             file.write(line)

    return jsonify(session)

@app.route('/validate', methods=['GET'])
def validate():
    token = session['oauth_token']

    validate_url = 'https://api.imgur.com/oauth2/secret?' 'access_token=%s' % token['access_token']
    return jsonify(requests.get(validate_url).json())


@app.errorhandler(404) 
def invalid_route(e): 
    return "Invalid route."


# We need to make sure the cerificate we use for HTTPS is signed by a CA (certificate authority)
# HTTPS (Hypertext Transfer Protocol Secure) is a secure version of the HTTP protocol as it adds an extra layer of encryption, authentication, and integrity via the SSL/TLS protocol
if __name__ == '__main__':
    
    # # Plain HTTP callback
    # os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = "0"
    # app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True
    # app.config['SECRET_KEY'] = SESSION_SECRET_KEY

    # enable HTTPS, cert.pem and key.pem not in version control
    context = ('cert.pem', 'key.pem')

    # development build
    app.run(port=5000, debug=False, ssl_context=context)
    # serve(app, host='0.0.0.0', port=5000, url_scheme='https')
# else: 
#     app = create_app()
