from flask import Flask
from flask_cors import CORS
from ai_route import ai_routes_blueprint
import logging
import sys

app = Flask(__name__)
CORS(app)

VERSION = 5

# Register blueprints
app.register_blueprint(ai_routes_blueprint, url_prefix='/ai_routes')
logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))

@app.route('/')
def main_route():
    print("Executing main route....")
    logging.info("Executing main route....")
    return {'success': 1}

if __name__ == "__main__":
    print("Setting up")
    print(f"The current version is version {VERSION}")
    print("This is suppose to be run on port 5000")
    logging.info("This is suppose to be run on port 5000")
    # app.run(host = '0.0.0.0', port = 5000, debug=True)
    app.run(host = '0.0.0.0', port = 5000)
