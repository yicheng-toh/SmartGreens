from joblib import load
from ultralytics import YOLO
import tensorflow as tf
import cv2 
import numpy as np
import ai_preprocess

initial_weight = 277

#Load a pretrained YOLOv8n model
yolo_model = YOLO('./models/27MarModel.pt')

#images will be generated based on the file on the initial reading
#it will be saved as datetimeisostring_microcontrollerid

def plant_health__leaf_number(img):
    print("Currrently inside plant_health_leaf_number")
    
    #Run inference on the source
    print(f"yc file name {img.split('.')[-2].split('/')[-1]}")
    print(f"yc file path name {img}")
    fileName = img.split('.')[-2].split('/')[-1]
    results = yolo_model(source=img, show=False, conf=0.5, save=True,project = fileName) #generator of results
    # print(f"The result is {results}")
    num_leaves = 0
    for result in results:
        print("retrieving a result.")
        boxes = result.boxes
        print(f"boxes is {boxes}")
        classes = result.boxes.cls
        
        if len(classes) == 0:
            plantHealthStatus = 2
        if (classes == 0).any():
            plantHealthStatus = 0
        else:
            plantHealthStatus = 1
        num_leaves = tf.math.count_nonzero(result.boxes.cls)
    
    num_leaves = float(num_leaves)
    print(num_leaves)
    num_leaves = num_leaves / (num_leaves + 1)
    
    return num_leaves, plantHealthStatus

def percentage_green__leafsize(img):
    print("Current exeucting percentage_green__leafsize")
    #######################################################
    # Percentage green
    #######################################################
    
    # Using the image
    image = cv2.imread(img)
    # Resizing the image
    image = cv2.resize(image, (200, 200)) 

    res = image.copy()
    
    # Convert Image to Image HSV 
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV) 

    # Defining lower and upper bound HSV values
    lower = np.array([35, 65, 120]) 
    upper = np.array([50, 250, 250]) 

    # Defining mask for detecting color 
    mask = cv2.inRange(hsv, lower, upper)

    # Get percentage of green in image
    percentage_green = np.count_nonzero(mask)/40000
    print(percentage_green)

    #######################################################
    # Leaf Size
    #######################################################
    
    # convert to gray 
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # threshold the gray
    th = 100 
    th, threshed = cv2.threshold(gray, th, 255,  cv2.THRESH_BINARY)
    
    # Get identified green as grey image
    img_search = cv2.bitwise_and(mask, threshed)
    
    # Canny Edge Detection
    edges = cv2.Canny(image=img_search, threshold1=80, threshold2=300) 

    cnts = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)[-2]

    counts = 0
    total_area = 0

    for cnt in cnts:
        arclen = cv2.arcLength(cnt, True)
        area = cv2.contourArea(cnt)
        if area > 0:
            total_area += area
            cv2.drawContours(res, [cnt], -1, (0,255,0), 3, cv2.LINE_AA)
            print("Length: {:.3f}\nArea: {:.3f}".format(arclen, area))
            counts +=1
    if counts != 0:
        leaf_size = total_area/counts
        print(leaf_size)
        leaf_size = leaf_size/ (leaf_size + 1)
    else:
        leaf_size = 0
    
    return percentage_green, leaf_size


# path = "C:\\Users\\Qi Ren\\Desktop\\FYP\\test\\"
# img = "20240320_282_800_600_2.jpg"
path = "./"
img = "example1.jpg"

def ai_main(path,img):
    print("Current executing ai_main function")
    ai_preprocess.preprocess(path,img)
    new_X = [0]

    # Process the image to get desired features

    percentagegreen_new, leafsize_new = percentage_green__leafsize(path+img)
    new_X.append(percentagegreen_new)
    new_X.append(leafsize_new)
    leafNum, plantHealthSatus = plant_health__leaf_number(path+img)
    new_X.append(leafNum)
    new_X = np.array(new_X).reshape(1, -1)

    svr_model_filename = './models/svr_yield.joblib'
    dtr_model_filename = './models/dtr_yield.joblib'
    xgb_model_filename = './models/xgb_yield.joblib'
    svr_model = load(svr_model_filename)
    dtr_model = load(dtr_model_filename)
    xgb_model = load(xgb_model_filename)

    svr_estimated_yield = svr_model.predict(new_X)
    print("SVR Prediction: ", svr_estimated_yield)
    dtr_estimated_yield = dtr_model.predict(new_X)
    print("DTR Prediction: ", dtr_estimated_yield)
    xgb_estimated_yield = xgb_model.predict(new_X)
    print("XGB Prediction: ", xgb_estimated_yield)


    svr_weighted_pred = 0.27135809556219675
    dtr_weighted_pred = 0.3261035063794821
    xgb_weighted_pred = 0.4025383980583211
    # I will need to return the ensemble_yield.
    ensemble_yield = svr_estimated_yield*svr_weighted_pred + dtr_estimated_yield*dtr_weighted_pred + xgb_estimated_yield*xgb_weighted_pred
    print("")
    print("Ensemble pred: ", ensemble_yield)
    # print("Actual yield: ", int(img[9:img.index("_", 9)])- initial_weight)
    return ensemble_yield[0], plantHealthSatus
if __name__ == "__main__":
    print(ai_main(path,img))