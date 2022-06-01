from flask import Flask, json, request, make_response
import requests
from logging.config import dictConfig
import os
from dotenv import load_dotenv

load_dotenv()
# client id and client secret
client_id = 'af53be228b9a39e'
client_secret = os.getenv('CLIENT_SECRET')

# variables to use for API call
tag_name = ''
sort_filter = ''
window_filter = ''
page_filter = ''


# Basic configuration for app for logging
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
    app.logger.info(client_secret)
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

# Make api calls to imgur gallery tag name calls.   
# https://api.imgur.com/3/gallery/t/{{tagName}}/{{sort}}/{{window}}/{{page}}
@app.route('/response')
def response():
    get_request = 'https://api.imgur.com/3/gallery/t/' + tag_name +  '/' + sort_filter + '/' + window_filter + '/' + page_filter
    r = requests.get(get_request)
    return r.text

if __name__ == '__main__':
    app.run(debug=True)
    #app.run(port=5000)
