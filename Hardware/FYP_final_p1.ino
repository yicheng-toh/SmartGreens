// Setup ESP32 libraries
//------------------------------
#ifdef ESP32
  #include <WiFi.h>
#else
  #include <ESP8266WiFi.h>
#endif

#include <Wire.h>
#include <Arduino.h>
#include <WiFi.h>
#include <WiFiMulti.h>
#include <HTTPClient.h>

#include "DFRobot_LTR390UV.h"
#include "DFRobot_BME280.h"

typedef DFRobot_BME280_IIC    BME;
//-------------------------------

// Pin init
//-------------------------------
#define I2C_LTR_SDA 35 
#define I2C_LTR_SCL 36 
#define I2C_BME_SDA 18
#define I2C_BME_SCL 17


TwoWire I2C_LTR = TwoWire(1);
TwoWire I2C_BME = TwoWire(2);

//------------------------------

// Replace with your SSID and Password
const char* ssid     = //SSID;
const char* password = //password;

const char* main_ip = "eefypintegration.azurewebsites.net";
const char* endpoint = "/plant/insertData/Set%20B1";
const char* local_ip = "eefypintegration.azurewebsites.net";
const char* local_ip2 = main_ip;
const int PORT = 443;

// Time to sleep
uint64_t uS_TO_S_FACTOR = 1000000;  // Conversion factor for micro seconds to seconds
// sleep for 30 minutes = 1800 seconds
//Change this value to adjust how often you want the data to be recorded
uint64_t TIME_TO_SLEEP = 1795; // 60= 1min 3600= 1hour
// uint64_t TIME_TO_SLEEP = 55; // 60= 1min 3600= 1hour
// uint64_t TIME_TO_SLEEP = 60;
//Average 5s taken to wake, run and sleep

#define SEALEVELPRESSURE_HPA (1013.25)

DFRobot_LTR390UV ltr390(/*addr = */LTR390UV_DEVICE_ADDR, /*pWire = */&I2C_LTR);
BME bme(&I2C_BME, 0x77);



void setup() {
  Serial.begin(115200); 
  //delay(2000);

  I2C_LTR.begin(I2C_LTR_SDA,I2C_LTR_SCL,100000);
  I2C_BME.begin(I2C_BME_SDA,I2C_BME_SCL,100000);

  // initialize LTR390 sensor
  while(ltr390.begin() != 0){
    Serial.println("LTR initialize failed!!");
    delay(1000);
  }
  Serial.println("LTR initialize success!!");
  ltr390.setALSOrUVSMeasRate(ltr390.e18bit,ltr390.e100ms);//18-bit data, sampling time of 100ms 
  ltr390.setALSOrUVSGain(ltr390.eGain3);//Gain of 3
  ltr390.setMode(ltr390.eALSMode);//Set ambient light mode

  //  initialize BME280 sensor
  while(bme.begin() != BME::eStatusOK) {
    Serial.println("bme initialize failed!!");
    printLastOperateStatus(bme.lastOperateStatus);
    delay(2000);
  }
  Serial.println("bme initialize success!!");


  initWifi();

  //-THROW--------
  sendData();
    
  #ifdef ESP32
    // enable timer deep sleep
    esp_sleep_enable_timer_wakeup(TIME_TO_SLEEP * uS_TO_S_FACTOR);    
    Serial.println("Going to sleep now");
    // start deep sleep for 3600 seconds (60 minutes)
    esp_deep_sleep_start();
  #else
    // Deep sleep mode for 3600 seconds (60 minutes)
    Serial.println("Going to sleep now");
    ESP.deepSleep(TIME_TO_SLEEP * uS_TO_S_FACTOR); 
  #endif
}

void loop() {
  // Sleeping - Will not come here
}

// Establish a Wi-Fi connection with your router
void initWifi() {
  Serial.print("Connecting to: "); 
  Serial.print(ssid);
  WiFi.begin(ssid, password);  

  int timeout = 10 * 4; // 10 seconds
  while(WiFi.status() != WL_CONNECTED  && (timeout-- > 0)) {
    delay(250);
    Serial.print(".");
  }
  Serial.println("");

  if(WiFi.status() != WL_CONNECTED) {
     Serial.println("Failed to connect, going back to sleep");
  }

  Serial.print("WiFi connected in: "); 
  Serial.print(millis());
  Serial.print(", IP address: "); 
  Serial.println(WiFi.localIP());
}

// Make an HTTP request
void sendData() {

  WiFiClientSecure client;
  client.setInsecure();
  int retries = 5;
  while(!!!client.connect(local_ip2, PORT) && (retries-- > 0)) {
    Serial.print(".");
  }
  Serial.println();
  if(!!!client.connected()) {
    Serial.println("Failed to connect...");
  }


  // Temperature in Celsius
  String jsonObject = String("{\"temperature\":\"") +  bme.getTemperature() + "\",\"humidity\":\"" + bme.getHumidity()
                      +  "\",\"brightness\":\"" + ltr390.readALSTransformData()*0.08873 + "\"}";


  client.println(String("POST ") + endpoint + " HTTP/1.1");
  client.println(String("Host: ") + local_ip); 
  client.println("Connection: close\r\nContent-Type: application/json");
  client.print("Content-Length: ");
  client.println(jsonObject.length());
  client.println();
  client.println(jsonObject);
  Serial.println(jsonObject);

  int timeout = 5 * 10; // 5 seconds             
  while(!!!client.available() && (timeout-- > 0)){
    delay(100);
  }
  if(!!!client.available()) {
    Serial.println("No response...");
  }
  while(client.available()){
    Serial.write(client.read());
  }
  
  Serial.println("\nclosing connection");
  client.stop(); 
}

void printLastOperateStatus(BME::eStatus_t eStatus)
{
  switch(eStatus) {
  case BME::eStatusOK:    Serial.println("everything ok"); break;
  case BME::eStatusErr:   Serial.println("unknown error"); break;
  case BME::eStatusErrDeviceNotDetected:    Serial.println("device not detected"); break;
  case BME::eStatusErrParameter:    Serial.println("parameter error"); break;
  default: Serial.println("unknown status"); break;
  }
}