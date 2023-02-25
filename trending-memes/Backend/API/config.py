import os

class ProductionConfig(object):
    DEBUG = False
    TESTING = False
    JSONIFY_PRETTYPRINT_REGULAR = True
    SECRET_KEY= os.environ.get('SESSION_SECRET_KEY')
