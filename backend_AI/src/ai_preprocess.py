import ai_logic
import cv2
import numpy as np

path = ''
img = 'image2.png'
new_img = 'edited_image.png'
new_img_pixel = 'edited_image_pixel.png'

def preprocess(path,img):
    img = path + img
    # Load the color image
    image = cv2.imread(img)

    # Split the image into color channels
    b, g, r = cv2.split(image)

    # Equalize the histogram of each channel
    b_eq = cv2.equalizeHist(b)
    g_eq = cv2.equalizeHist(g)
    r_eq = cv2.equalizeHist(r)

    # Merge the equalized channels back into an image
    equalized_image = cv2.merge((b_eq, g_eq, r_eq))

    # # Write the equalized image back to the same file
    cv2.imwrite(img, equalized_image)

# print(ai_logic.ai_main(path,new_img))
