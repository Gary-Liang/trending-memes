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
import jwt
from dotenv import load_dotenv
from time import time 
import ast
import redis
from pymongo import MongoClient, errors

# Load variables from .env file (not in version control)
load_dotenv('../../.env')

# client id and client secret
CLIENT_ID = os.environ.get('CLIENT_ID')
CLIENT_SECRET = os.environ.get('SECRET_KEY')
SESSION_SECRET_KEY= str(os.environ.get('SESSION_SECRET_KEY'))
DEFAULT_SESSION_TIME = 900
REDIRECT_URI = os.environ.get('REDIRECT_URI')
# TOKEN_EXPIRATION_TIME = os.environ.get('TOKEN_EXPIRATION_TIME')
RESPONSE_TYPE = 'code'
# optional parameter for authorization field
APPLICATION_STATE = 'TEST'
# FIRST_TIME_LAUNCHED = ast.literal_eval(str(os.environ.get('FIRST_TIME_LAUNCH')))
REDIS_HOST = str(os.environ.get('REDIS_HOST'))
REDIS_PASSWORD = str(os.environ.get('REDIS_PASSWORD'))
REDIS_PORT = 5591
MONGO_CLIENT =str(os.environ.get('MONGO_CLIENT'))

# 5591 is the default port for redis railway db, redis is a quick non-sql database to save for cache 
redis_client = redis.Redis(host=REDIS_HOST, password=REDIS_PASSWORD, port=REDIS_PORT, health_check_interval=30)

mongo_client = MongoClient(MONGO_CLIENT)
db = mongo_client['trending_memes']
# users is a collection 
users = db['users']
sessions = db['sessions']
user_favorites = db['user_favorites']

headers = {'Connnection' : 'keep-alive'}

# variables to use for API call
tag_name = 'top'
sort_filter = 'top'
window_time_filter = 'week'
custom_time_filter = 'week'
page_filter = '0'

# urls
authorization_base_url = 'https://api.imgur.com/oauth2/authorize'
token_url = 'https://api.imgur.com/oauth2/token'
refresh_url = token_url
get_request_url = 'https://api.imgur.com/3/gallery/search/'


def generate_session_token(acc_id):
    payload = {
        'sub': str(acc_id),
        'iat': time(),
        'exp': time() + DEFAULT_SESSION_TIME
    }
    # generates a token based on payload then stores in session for reference 
    token = jwt.encode(payload, SESSION_SECRET_KEY, algorithm='HS256')
    sessions.insert_one({'username': acc_id['username'], 'token': token})
    return token

def is_token_valid(token):
    try:
        # see if the session with the token is originally stored in db before validating the payload 
        validated_session = sessions.find_one({'token': token}) 
        print(validated_session)
        if validated_session:
            print('decoding payload')
            payload = jwt.decode(validated_session['token'], SESSION_SECRET_KEY, algorithms=['HS256'])
            print('After decoding payload')
            if (payload['exp'] < time()): 
                # token has expired. need to delete from sessions collection then return false 
                sessions.delete_one({'token': token}) 
                return False
            else:
                # token is valid
                return True
        else:
            return False
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        # for some reason, token is invalid
        if (jwt.ExpiredSignatureError):
            sessions.delete_one({'token': token})
            print(jwt.ExpiredSignatureError)
        elif (jwt.InvalidTokenError):
            print(jwt.InvalidTokenError)
        return False




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
        app.logger.info('state: ', state)
        session['oauth_state'] = state

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


@app.route('/authenticate', methods=['GET'])
def authenticate():
    imgur = OAuth2Session(client_id=CLIENT_ID, redirect_uri=REDIRECT_URI)
    # Construct authorization url from the base auth url:
    authorization_url, state = imgur.authorization_url(
    url=authorization_base_url, access_type='offline',
    include_granted_scopes='true')
    # consider specific parameters from imgur
    # response_type=RESPONSE_TYPE)

    app.logger.info('authorization url:  ' + authorization_url)
    app.logger.info('state: ', state)
    session['oauth_state'] = state

    redis_client.set("first_time_launched", "True")

    return redirect(authorization_url)


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
    app.logger.info('state: ', state)
    session['oauth_state'] = state

    token = imgur.fetch_token(token_url, client_secret=CLIENT_SECRET, authorization_response=request.url)
    session['oauth_token'] = token
    # session['refresh_token'] = token['refresh_token']

    return session


# Callback
@app.route('/callback', methods=['GET'])
def callback():
    print("session", jsonify(session))
    app.logger.info('session: ', session)
    imgur = OAuth2Session(CLIENT_ID, state=session['oauth_state'])
    new_url = request.url
    if "http:" in new_url:
        new_url = "https:" + new_url[5:]
    token = imgur.fetch_token(token_url, client_secret=CLIENT_SECRET, authorization_response=new_url)
    session['oauth_token'] = token
    session['refresh_token'] = token['refresh_token']


    print('full session info:' + str(session))
    # store session and token in redis db 
    set_session_cache(session)
    app.logger.info('session[oauth_state]: ' + session['oauth_state'])
    app.logger.info('session[oauth_token]: ' + json.dumps(session['oauth_token']))
    app.logger.info('session[refresh_token]: ' + json.dumps(session['refresh_token'])) 

    redis_client.set('expires_at', session['oauth_token']['expires_at'])

    return redirect(url_for('.search'))

@app.route('/saved_favorites', methods=['POST'])
def saved_favorites():
    # Get the form data from the POST Request as application/json (use get_json)
    data = request.get_json()
    token = ''
    if data:
        token = data.get('token')
    else:
        return jsonify({'success': False, 'message': 'Internal Error Occurred'}), 500
        
    print('POST Request called')

    # find the token in the database by token
    validated_token = is_token_valid(token)

    if validated_token:
        session = sessions.find_one({'token': token})
        username = ''
        if (session):
            username = session['username']
        
        print('username: ', username)

        # search for the favorite with the specified user and id
        user_data = user_favorites.find_one({'username': username})
        print('favorite list: ', user_data['favorites'])
        if (user_data):
            query = request.args.get('q')
            if (query is None or query == ""):
                print('Returning user favorites')
                return jsonify(user_data['favorites']), 200
            else : 
                print(query)
                return ""
        else: 
            print('Returning nothing')
            return jsonify({}), 200
    else:
        print('Non-authoritative information')
        return jsonify({'success': True, 'message': 'Non-Authoritative Information'}), 203


@app.route('/saved_favorites_as_data', methods=['POST'])
def saved_favorites_as_data():
    # Get the form data from the POST Request as application/json (use get_json)
    data = request.get_json()
    token = ''
    if data:
        token = data.get('token')
    else:
        return jsonify({'success': False, 'message': 'Internal Error Occurred'}), 500
        
    print('POST Request called')

    # find the token in the database by token
    validated_token = is_token_valid(token)

    if validated_token:
        session = sessions.find_one({'token': token})
        username = ''
        if (session):
            username = session['username']
        
        print('username: ', username)

        # search for the favorite with the specified user and id
        user_data = user_favorites.find_one({'username': username})
        print('favorite list: ', user_data['favorites'])
        if (user_data):
            query = request.args.get('q')
            if (query is None or query == ""):
                print('Returning user favorites')
                return jsonify(user_data['favorites']), 200
            else : 
                print(query)
                return ""
        else: 
            print('Returning nothing')
            return jsonify({}), 200
    else:
        print('Non-authoritative information')
        return jsonify({'success': True, 'message': 'Non-Authoritative Information'}), 203


@app.route('/is_a_favorite', methods=['POST'])
def is_a_favorite():
    return jsonify({})

@app.route('/update_favorites', methods=['POST'])
def update_favorites():
    # Get the form data from the POST Request as application/json (use get_json)
    data = request.get_json()
    token = ''
    id = ''
    media_info = ''
    album_info = ''
    if data:
        id = data.get('id')
        token = data.get('token')
        media_info = data.get('mediaInfo')
        album_info = data.get('albumInfo')
    else:
        return jsonify({'success': False, 'message': 'Internal Error Occurred'}), 500
        
    print('POST Request called')

    # find the token in the database by token
    validated_token = is_token_valid(token)

    if validated_token:
        session = sessions.find_one({'token': token})
        username = ''
        favorites_list = ''
        favorite = ''
        if (session):
            username = session['username']
        
        print('username: ', username)
        print('id: ', id)

        # search for the favorite with the specified user and id
        favorite = user_favorites.find_one({'username': username, 'favorites.' + id: {'$exists': True}})
        print('favorite before: ', favorite)
        
        if (favorite is None):
            favorite_info = {id: {'media_info': media_info, 'album_info': album_info}}
            user_favorites.update_one(
                {"username": username},
                {"$push": {"favorites": favorite_info}}
            )
            user_data = user_favorites.find_one({'username': username})
            if (user_data):
                favorites_list = user_data['favorites']
                print('favorites list after 1: ', jsonify(favorites_list).get_data(as_text=True))
            return jsonify({'success': True, 'message': 'Favorite update successful'}), 200
        else: 
            # remove from db 
            # delete the favorite
            user_favorites.update_one(
                {'username': username}, 
                {'$pull': {'favorites': {id: {'$exists': True}}}}
            )
            user_data = user_favorites.find_one({'username': username})
            if (user_data):
                favorites_list = user_data['favorites']
                print('favorites list after 2: ', jsonify(favorites_list).get_data(as_text=True))
            return jsonify({'success': True, 'message': 'Favorite update successful'}), 200
    else:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401



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
        return jsonify(imgur.get('https://api.imgur.com/3/gallery/search/' + sort_filter + '/' + custom_time_filter + '/' + page_filter + '?q=funny').json())
    else:
        return jsonify(imgur.get('https://api.imgur.com/3/gallery/search/' + sort_filter + '/' + custom_time_filter + '/' + page_filter + '?q=' + query).json())


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

    return jsonify(session)

@app.route('/validate', methods=['GET'])
def validate():
    token = session['oauth_token']

    validate_url = 'https://api.imgur.com/oauth2/secret?' 'access_token=%s' % token['access_token']
    return jsonify(requests.get(validate_url).json())


@app.route('/login_user', methods=['POST', 'OPTIONS'])
def login_user():
    if request.method == 'OPTIONS':
        response_headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Connection'
        }
        print('OPTIONS request called.')
        return ('', 204, response_headers) 
    else:
        # Get the form data from the POST Request as application/json (use get_json)
        data = request.get_json()
        username = ''
        password = ''
        if data:
            username = data.get('username').lower()
            password = data.get('password')
        else:
            return jsonify({'success': False, 'message': 'Internal Error Occurred'}), 500
        
        print('POST Request called')

        # find the user in the database by their username
        account = users.find_one({'username': username})

        if account:
            # check if the password matches 
            if password == account['password'].decode('utf-8'):
                # return a success message and any other data you want to include
                user_session_token = generate_session_token(account)
                
                return jsonify({'success': True, 'message': 'Login successful', 'token': user_session_token}), 200
            else:
                # return a failure message if the password doesn't match, 401 unauthorized
                return jsonify({'success': False, 'message': 'Invalid password'}), 401
        else:
            # return a failure message if the user doesn't exist, 404 not found
            return jsonify({'success': False, 'message': 'User does not exist'}), 404
        

@app.route('/logout_user', methods=['POST', 'OPTIONS'])
def logout_user():
    if request.method == 'OPTIONS':
        response_headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Connection'
        }
        print('OPTIONS request called.')
        return ('', 204, response_headers) 
    else:
        # Get the form data from the POST Request as application/json (use get_json)
        token = None
        print(request.headers)
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split('Bearer ')[1]
        else:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 401
        
        print('POST Request called ', token)

        # find the token in the database by token
        validated_token = is_token_valid(token)

        if validated_token:
            # if token is validated, then delete the session from sessions document
            print('deleting session token for user')
            sessions.delete_one({'token': token})
            return jsonify({'success': True, 'message': 'Logout successful.'}), 200

        else:
            return jsonify({'success': True, 'message': 'Session expired.'}), 202
    


@app.route('/register_new_user', methods=['POST', 'OPTIONS'])
def register_new_user():
    if request.method == 'OPTIONS':
        response_headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
        print('OPTIONS request called.')
        return ('', 204, response_headers) 
    else:   
        # Get the form data from the POST Request as application/json (use get_json)
        data = request.get_json()

        username = ''
        password = ''
        # lowercase all usernames
        if data:
            username = data.get('username').lower()
            password = data.get('password').encode('utf-8')
        else:
            return jsonify({'success': False, 'message': 'Internal Error Occurred'}), 500
        
        print(request)
        print(request.get_json())
        print(password)
        app.logger.info('Invoking registering a new user.')

        user = {'username': username, 'password': password}
        favorite_info = {'username': username, 'favorites': []}
        if username is None or not username: 
            return jsonify({'success': False, 'message': 'Username is required.'}), 400
        elif password is None or not password: 
            return jsonify({'success': False, 'message': 'Password is required.'}), 400
        elif len(username) < 3:
            return jsonify({'success': False, 'message': 'Username needs to be at least 4 letters long.'}), 400
        elif len(password) < 5:
            return jsonify({'success': False, 'message': 'Password needs to be at least 6 characters long.'}), 400 
        else:  
            # find the user in the database by their username
            existing_user = users.find_one({'username': username})
            if existing_user:
                return jsonify({'success': False, 'message': 'Username already exists.'}), 400
            try: 
                users.insert_one(user)
                user_favorites.insert_one(favorite_info)
                return jsonify({'success': True, 'message': 'Registration successful, please log in.'}), 200
            except errors.DuplicateKeyError:
                print('User already in DB')
                return jsonify({'success': False, 'message': 'User already exists!'}), 409



@app.errorhandler(404) 
def invalid_route(e): 
    return jsonify({'message': '404 Not found'}), 404


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
    app.run(port=5000, debug=False)
    # app.run(port=5000, debug=False, ssl_context=context)
    # serve(app, host='0.0.0.0', port=5000, url_scheme='https')
# else: 
#     app = create_app()
