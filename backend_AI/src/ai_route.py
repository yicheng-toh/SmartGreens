from flask import Blueprint, render_template, request, jsonify
from flask_cors import cross_origin
from urllib.parse import quote
from ai_logic import ai_main
import logging
import send_yc_image
import datetime
import os
import shutil
import time
import base64

ai_routes_blueprint = Blueprint('ai_routes', __name__)

@ai_routes_blueprint.route('/', methods = ['POST', 'GET'])
@cross_origin()
def ai_route():
    print("Executing ai route....")
    logging.info("Executing ai route....")
    if request.method == "GET":
        return "This route seems to be working!"
    json_data = request.json
    imgData = json_data.get('imgData')
    print(f"imgData is {imgData}")
    microcontrollerId = json_data.get('microcontrollerId')
    strippedMicrocontrollerId = ''.join(microcontrollerId.split()).replace("\"", "")
    print(f"stripped mid is {strippedMicrocontrollerId}")
    # Get current datetime in ISO format
    current_datetime = datetime.datetime.now().isoformat()
    # Replace ":" and "-" characters in ISO format with "_"
    current_datetime = current_datetime.replace(":", "_").replace("-", "_").split(".")[0]

    fileNameNoExtension = f"{current_datetime}_" + strippedMicrocontrollerId
    fileName = fileNameNoExtension + ".jpg"

    with open(fileName, 'wb') as f:
        f.write(base64.b64decode(imgData))
    try:
        try:
            send_yc_image.send_image_to_yc(fileName)
        except Exception as e:
            print(e)
        #First need to get the image from the request body.
        #example of input {image:, microcontroller id}
        #need to save it in a file first. File will be datetimeisostring_microcontrollerid
        #pass the path and the argument to the ai_logic function -> returns expected yield
        #then wait for a while for the model to generate an image 
        expectedCurrentYield, plantHealthStatus = ai_main("./", fileName)

        #read it into as blob
        #data will be stored at f"./{fileNameNoExtension}/predict/{fileNameNoExtension}.jpg"
        #send the data as {img:, microconntrollerid, expected yield}
        # Add your AI logic here
        with open(f"./{fileNameNoExtension}/predict/{fileNameNoExtension}.jpg", 'rb') as file:
            imgData = file.read()
        try:
            send_yc_image.send_image_to_yc(f"./{fileNameNoExtension}/predict/{fileNameNoExtension}.jpg")
        except Exception as e:
            print(e)
        # 1. delete the file name
        # 2. delete the predict directory
        # 3. delete the filename diretory.
        #file name will be the same as directory name so rmtree(filename)
        result = {
            "expectedCurrentYield" : expectedCurrentYield,
            "imgData" : base64.b64encode(imgData).decode('utf-8'),
            "plantHealthStatus": plantHealthStatus
        }
        if os.path.exists(fileName):
        # Remove the file
            os.remove(fileName)
            print(f"The file '{fileName}' has been successfully removed.")
        else:
            print(f"The file '{fileName}' does not exist.")
        shutil.rmtree(f"./{fileNameNoExtension}")
        print("returning result")
        return jsonify(result), 201
        # return {}
    except Exception as e:
        print(e)
        time.sleep(5)
        if os.path.exists(fileName):
        # Remove the file
            os.remove(fileName)
            print(f"The file '{fileName}' has been successfully removed.")
        else:
            print(f"The file '{fileName}' does not exist.")
        shutil.rmtree(f"./{fileNameNoExtension}")

        return f"Error encountered: {e}"


# You can add more routes related to AI in this file
