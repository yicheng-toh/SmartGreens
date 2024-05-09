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

#include <DFRobot_SCD4X.h>
#include "DFRobot_ESP_EC.h"
// #include "DFRobot_ESP_PH.h"
#include "EEPROM.h"

//-------------------------------

// Pin init
//-------------------------------

#define I2C_SCD_SDA 17
#define I2C_SCD_SCL 16
#define EC_PIN 9
#define TDS_PIN 10
#define VREF 3.3              // analog reference ec_voltage(Volt) of the ADC
#define SCOUNT  30            // sum of sample point for TDS

#define pH_PIN 11          //pH meter Analog output
unsigned long int avgValue;  //Store the average value of the sensor feedback
float b;
int buf[10],temp;


TwoWire I2C_SCD = TwoWire(1);

//------------------------------
unsigned long Time_0 = 0;
int interval = 2000;

// Replace with your SSID and Password
const char* ssid     = //SSID;
const char* password = //password;

const char* main_ip = "eefypintegration.azurewebsites.net";
const char* endpoint = "/plant/insertData/Set%20B2";
const char* local_ip = "eefypintegration.azurewebsites.net";
const char* local_ip2 = main_ip;
const int PORT = 443;

// Time to sleep
uint64_t uS_TO_S_FACTOR = 1000000;  // Conversion factor for micro seconds to seconds
// sleep for 30 minutes = 1800 seconds
//Change this value to adjust how often you want the data to be recorded
// uint64_t TIME_TO_SLEEP = 54; // 60= 1min 3600= 1hour
uint64_t TIME_TO_SLEEP = 1794; // 60= 1min 3600= 1hour
//Average 6s for whole system to wake, run, and sleep


#define SEALEVELPRESSURE_HPA (1013.25)
float ec_voltage, ecValue, temperature = 25;

DFRobot_SCD4X SCD4X(&I2C_SCD, /*i2cAddr = */SCD4X_I2C_ADDR);
DFRobot_ESP_EC ec;
// DFRobot_ESP_PH ph;

//-----------------TDS-------------------------------
int analogBuffer[SCOUNT];     // store the analog value in the array, read from ADC
int analogBufferTemp[SCOUNT];
int analogBufferIndex = 0;
int copyIndex = 0;

float aveTDSvoltage = 0;
float tdsValue = 0;

// median filtering algorithm
int getMedianNum(int bArray[], int iFilterLen){
  int bTab[iFilterLen];
  for (byte i = 0; i<iFilterLen; i++)
  bTab[i] = bArray[i];
  int i, j, bTemp;
  for (j = 0; j < iFilterLen - 1; j++) {
    for (i = 0; i < iFilterLen - j - 1; i++) {
      if (bTab[i] > bTab[i + 1]) {
        bTemp = bTab[i];
        bTab[i] = bTab[i + 1];
        bTab[i + 1] = bTemp;
      }
    }
  }
  if ((iFilterLen & 1) > 0){
    bTemp = bTab[(iFilterLen - 1) / 2];
  }
  else {
    bTemp = (bTab[iFilterLen / 2] + bTab[iFilterLen / 2 - 1]) / 2;
  }
  return bTemp;
}

//---------------------------------------------------
void setup() {
  Serial.begin(115200);
  EEPROM.begin(64);//needed EEPROM.begin to store calibration k in eeprom
	ec.begin(10);//by default lib store calibration k since 10 change it by set ec.begin(30); to start from 30
  // ph.begin(20);
  pinMode(TDS_PIN,INPUT);
  I2C_SCD.begin(I2C_SCD_SDA,I2C_SCD_SCL,100000);

  // initialize SCD41 sensor
  while( !SCD4X.begin() ){
    Serial.println("SCD initialize failed!!");
    delay(3000);
  }
  Serial.println("SCD initialize success!!");
  SCD4X.enablePeriodMeasure(SCD4X_STOP_PERIODIC_MEASURE);
  SCD4X.enablePeriodMeasure(SCD4X_START_PERIODIC_MEASURE);

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
  
  DFRobot_SCD4X::sSensorMeasurement_t data;
  while (!SCD4X.getDataReadyStatus()){
    delay(200);
  }
  if(SCD4X.getDataReadyStatus()) {
    SCD4X.readMeasurement(&data);

    Serial.print("Carbon dioxide concentration : ");
    Serial.print(data.CO2ppm);
    Serial.println(" ppm");

    temperature = data.temp;

    Serial.println();
  }


  ec_voltage =  analogRead(EC_PIN);
	Serial.print("ec_voltage:");
	Serial.println(ec_voltage, 4);

	//temperature = readTemperature();  // read your temperature sensor to execute temperature compensation
	Serial.print("temperature:");
	Serial.print(temperature, 1);
	Serial.println("^C");

	ecValue = ec.readEC(ec_voltage, temperature); // convert ec_voltage to EC with temperature compensation
	Serial.print("EC:");
	Serial.print(ecValue, 4);
	Serial.println("ms/cm");
	ec.calibration(ec_voltage, temperature); // calibration process by Serail CMD

  Serial.println("Calibrated EC:");
  float cal_ec;
  cal_ec = ((ecValue-1.665)* 11.467/ 14.133) + 1.413;
  Serial.println(cal_ec);

  //----------------TDS--------------------------- 
  while (analogBufferIndex != SCOUNT){ 
      analogBuffer[analogBufferIndex] = analogRead(TDS_PIN);    //read the analog value and store into the buffer
      analogBufferIndex++;
      delay(40);
    }

    for(copyIndex=0; copyIndex<SCOUNT; copyIndex++){
      analogBufferTemp[copyIndex] = analogBuffer[copyIndex];
      
      // read the analog value more stable by the median filtering algorithm, and convert to ec_voltage value
      aveTDSvoltage = getMedianNum(analogBufferTemp,SCOUNT) * (float)VREF / 4096.0;
      
      //temperature compensation formula: fFinalResult(25^C) = fFinalResult(current)/(1.0+0.02*(fTP-25.0)); 
      float compensationCoefficient = 1.0+0.02*(temperature-25.0);
      //temperature compensation
      float compensateVoltage=aveTDSvoltage/compensationCoefficient;
      
      //convert ec_voltage value to tds value
      tdsValue=(133.42*compensateVoltage*compensateVoltage*compensateVoltage - 255.86*compensateVoltage*compensateVoltage + 857.39*compensateVoltage)*0.5;

    }

  //--------ph-----------------------------------
  for(int i=0;i<10;i++)       //Get 10 sample value from the sensor for smooth the value
  { 
    buf[i]=analogRead(pH_PIN);
    delay(10);
  }
  for(int i=0;i<9;i++)        //sort the analog from small to large
  {
    for(int j=i+1;j<10;j++)
    {
      if(buf[i]>buf[j])
      {
        temp=buf[i];
        buf[i]=buf[j];
        buf[j]=temp;
      }
    }
  }
  avgValue=0;
  for(int i=2;i<8;i++)                      //take the average value of 6 center sample
    avgValue+=buf[i];
  float phValue=(float)avgValue*3.3/4096/6; //convert the analog into millivolt
  phValue=3.3*phValue;                      //convert the millivolt into pH value
  Serial.print("pH:");  
  Serial.print(phValue,2);
  Serial.println(" ");

  float cal_ph;
  Serial.println("Calibrated pH:");
  cal_ph = ((phValue-1.572)* 5.17/ 7.69) + 4.01;
  Serial.println(cal_ph);
  //----------------------------------------

  // Temperature in Celsius
  String jsonObject = String("{\"CO2\":\"") + data.CO2ppm  + "\",\"EC\":\"" + cal_ec + "\",\"TDS\":\"" + tdsValue + "\",\"pH\":\"" + cal_ph
                      + "\"}";

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