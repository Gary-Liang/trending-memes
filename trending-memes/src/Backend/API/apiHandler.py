import imp
from flask import Flask, json, request, make_response
from requests import requests
from logging.config import dictConfig
import os

# client id and client secret
client_id = ''


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
    SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    app.logger.info(SITE_ROOT)
    json_url = os.path.join(SITE_ROOT, "static/data", "MOCK_DATA.json")
    # Load json from a file 
    json_data = json.load(open(json_url))
    # returns the json data, serialized 
    return json.dumps(json_data)

# Make api calls to imgur gallery tag name calls.   
# https://api.imgur.com/3/gallery/t/{{tagName}}/{{sort}}/{{window}}/{{page}}
@app.route('/hello')
def hello():
    r = requests.get('https://api.imgur.com/3/gallery/t/{{tagName}}/{{sort}}/{{window}}/{{page}}')
    return r.text

if __name__ == '__main__':
    app.run(debug=True)
    #app.run(port=5000)
