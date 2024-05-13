//*******************************************LIBRARIES**************************************************//
#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include <String.h>
#include <Base64.h>
#include <WiFiClientSecure.h>
// #include <PubSubClient.h>

#define TESTING 0

//********************************CAMERA_MODEL_AI_THINKER PIN DEFINITIONS******************************//
#define PWDN_GPIO_NUM 32
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM 0
#define SIOD_GPIO_NUM 26
#define SIOC_GPIO_NUM 27
#define Y9_GPIO_NUM 35
#define Y8_GPIO_NUM 34
#define Y7_GPIO_NUM 39
#define Y6_GPIO_NUM 36
#define Y5_GPIO_NUM 21
#define Y4_GPIO_NUM 19
#define Y3_GPIO_NUM 18
#define Y2_GPIO_NUM 5
#define VSYNC_GPIO_NUM 25
#define HREF_GPIO_NUM 23
#define PCLK_GPIO_NUM 22

//**********************************WIFI AND MQTT SETTINGS*******************************************//

const char *ssid = //SSID;
const char *password = //password;

const char* serverUrl = "https://eefypintegration.azurewebsites.net/ai/predictFromPhoto/Set%20A";
char* main_ip;
char* endpoint;
int PORT;

// Camera settings
const int SVGA_WIDTH = 800;
const int SVGA_HEIGHT = 600;
const int JPEG_QUALITY = 10; // Adjust as needed


bool takePic = false;
//********************************CAMERA INIT OBJECT***********************************************//
camera_config_t config;  //Stores the camera initialisation parameters
//**********************************************************MQTT SUBSCRIBE CALLBACK*********************************************************************//

void callback(char* topic, byte* payload, unsigned int length) {

  takePic = true;
}

void setup() {
  Serial.begin(115200);
  camera_init();
  camera_settings();


  Serial.println("Connected to the WiFi network");

}

void loop() {

  connectToWiFi();
  Serial.println("Connected to the WiFi network");
  take_picture();

  
  // Enter deep sleep for 30 seconds
  Serial.println("Entering deep sleep for 30 seconds...");
  esp_sleep_enable_timer_wakeup(10e6); // 30 seconds
  esp_deep_sleep_start();

}

//**********************************************************INITIALISE CAMERA*********************************************************************//
void camera_init() {
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  // config.frame_size = FRAMESIZE_VGA;
  // config.frame_size = FRAMESIZE_VGA;
  config.frame_size = FRAMESIZE_SVGA;
  // config.jpeg_quality = 15; //NEED TO INCREASE THIS NUMBER IF PICTURE IS STRANGE COLOURS -> LARGER THE NUMBER THE LOWER THE QUALITY
  config.jpeg_quality = 7;  //NEED TO INCREASE THIS NUMBER IF PICTURE IS STRANGE COLOURS -> LARGER THE NUMBER THE LOWER THE QUALITY
  config.fb_count = 1;


  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  } else {
    Serial.printf("Camera init passed :)");
  }
}
//**********************************************************CAMERA SETTINGS*******************************************************************//
void camera_settings() {
  sensor_t* s = esp_camera_sensor_get();
  s->set_brightness(s, 2);                  // -2 to 2
  s->set_contrast(s, -2);                    // -2 to 2
  s->set_saturation(s, 0);                  // -2 to 2
  s->set_special_effect(s, 0);              // 0 to 6 (0 - No Effect, 1 - Negative, 2 - Grayscale, 3 - Red Tint, 4 - Green Tint, 5 - Blue Tint, 6 - Sepia)
  s->set_whitebal(s, 1);                    // 0 = disable , 1 = enable
  s->set_awb_gain(s, 1);                    // 0 = disable , 1 = enable
  s->set_wb_mode(s, 2);                     // 0 to 4 - if awb_gain enabled (0 - Auto, 1 - Sunny, 2 - Cloudy, 3 - Office, 4 - Home)
  s->set_exposure_ctrl(s, 1);               // 0 = disable , 1 = enable
  s->set_aec2(s, 0);                        // 0 = disable , 1 = enable
  s->set_ae_level(s, 0);                    // -2 to 2
  s->set_aec_value(s, 300);                 // 0 to 1200
  s->set_gain_ctrl(s, 1);                   // 0 = disable , 1 = enable
  s->set_agc_gain(s, 0);                    // 0 to 30
  s->set_gainceiling(s, (gainceiling_t)0);  // 0 to 6
  s->set_bpc(s, 0);                         // 0 = disable , 1 = enable
  s->set_wpc(s, 1);                         // 0 = disable , 1 = enable
  s->set_raw_gma(s, 1);                     // 0 = disable , 1 = enable
  s->set_lenc(s, 1);                        // 0 = disable , 1 = enable
  s->set_hmirror(s, 0);                     // 0 = disable , 1 = enable
  s->set_vflip(s, 0);                       // 0 = disable , 1 = enable
  s->set_dcw(s, 1);                         // 0 = disable , 1 = enable
  s->set_colorbar(s, 0);                    // 0 = disable , 1 = enable
}

//********************************************************TAKE PICTURE AND SEND TO WEB SERVER*********************************************//
void take_picture() {
  camera_fb_t* fb = NULL;
  fb = esp_camera_fb_get();
  // there is a bug where this buffer can be from previous capture so as workaround it is discarded and captured again
  esp_camera_fb_return(fb);  // dispose the buffered image
  fb = NULL;                 // reset to capture errors
  fb = esp_camera_fb_get();  // get fresh image
   String base64Image = base64::encode(fb->buf, fb->len);

  String jsonString = "{\"imgData\":\"" + base64Image + "\"}";
  // String jsonString = "{\"imgData\":\"" + 1 + "\"}";
  Serial.println(jsonString);  // Print JSON data for debugging
  sendDataToCloud(jsonString, serverUrl);

  if (!fb) {
    Serial.println("Camera capture failed");
    return;
  } else {
    Serial.println("Picture taken");
  }

  

  esp_camera_fb_return(fb);
}
//**********************************************SENDING DATA TO WEB SERVER**************************************************************************
// Function to establish WiFi connection
void connectToWiFi() {
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
}

// Function to send data to the cloud

void sendDataToCloud(String jsonData, String serverUrl) {
  Serial.println("Sending data to cloud...");
  
  // Use HTTPS connection
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  // // Set buffer size to 8 KB for both RX and TX
  // http.setBufferSizes(8192, 8192);
  int httpResponseCode = http.POST(jsonData);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("HTTP Response code: " + String(httpResponseCode));
    Serial.println("Response: " + response);
  } else {
    Serial.print("Error on HTTP request: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}