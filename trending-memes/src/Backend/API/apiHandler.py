from flask import Flask, json, make_response, request
import requests
from requests_oauthlib import OAuth2Session
from logging.config import dictConfig
import os
from dotenv import load_dotenv

# Load variables from .env file (not in version control)
load_dotenv()

# client id and client secret
CLIENT_ID = 'af53be228b9a39e'
CLIENT_SECRET = os.getenv('SECRET_KEY')
headers = {'Accept':'*/*',
           'Authorization' : 'Client-ID ' + CLIENT_ID }

# variables to use for API call
tag_name = 'funny'
sort_filter = 'top'
window_filter = 'week'
page_filter = '0'

# urls 
authorization_base_url = 'https://api.imgur.com/3/gallery/t/'
token_url = 'https://api.imgur.com/oauth2/token'
redirect_uri = 'http://127.0.0.1:5000/callback'

# Configuration to allow HTTP connection in the environment
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

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

@app.route('/callback')
def callback():
    imgur = OAuth2Session(CLIENT_ID)
    token = imgur.fetch_token(token_url, client_secret=CLIENT_SECRET, authorization_response=redirect_uri)
    return token

# Make API calls to imgur gallery tag name calls.   
# https://api.imgur.com/3/gallery/t/{{tagName}}/{{sort}}/{{window}}/{{page}}
# Imgur API uses OAuth 2.0.  get request is different from the norm due to different authentication
@app.route('/response')
def response():
    get_request = 'https://api.imgur.com/3/gallery/t/' + tag_name +  '/' + sort_filter + '/' + window_filter + '/' + page_filter
    r = requests.get(get_request, headers=headers, auth=(CLIENT_ID, CLIENT_SECRET))
    return r.text

if __name__ == '__main__':
    app.run(debug=True)
    #app.run(port=5000)
