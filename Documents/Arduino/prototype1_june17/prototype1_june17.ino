/*
 * Copyright (c) 2016 RedBear
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */
#include <nRF5x_BLE_API.h>
#include <Ticker.h>

#define DEVICE_NAME            "Nano v2"
//#define TOUCH_SENSOR           2
#define TEMP_SENSOR            4
#define ACCEL_X                2
#define ACCEL_Y                1
#define ACCEL_Z                0

BLE                            ble;
Timeout                        timeout;
//Ticker                         ticker_touch;
Ticker                         ticker_temp;
Ticker                         ticker_accel;

//bool flag = 0;
int LED_testt=13;

int sensorValue;
long rawTemp;
uint16_t rawX, rawY, rawZ;
float voltage;
uint16_t celsius;
static uint8_t rx_buf[1] = {'a'};
static uint8_t tempArray[1] = {0}; //{'0','0'};
static uint8_t accelArray[3] = {0,0,0}; //{'0','0'};

// The uuid of service and characteristics
static const uint8_t service1_uuid[]        = {0x71, 0x3D, 0, 0, 0x50, 0x3E, 0x4C, 0x75, 0xBA, 0x94, 0x31, 0x48, 0xF1, 0x8D, 0x94, 0x1E};

GattCharacteristic  char_touch(0x2A57, rx_buf, sizeof(rx_buf), sizeof(rx_buf), GattCharacteristic::GattCharacteristic::BLE_GATT_CHAR_PROPERTIES_NOTIFY | GattCharacteristic::BLE_GATT_CHAR_PROPERTIES_READ);
GattCharacteristic  char_temp(0x2A59, tempArray, sizeof(tempArray), sizeof(tempArray), GattCharacteristic::GattCharacteristic::BLE_GATT_CHAR_PROPERTIES_NOTIFY | GattCharacteristic::BLE_GATT_CHAR_PROPERTIES_READ);
GattCharacteristic  char_accel(0x2A58, accelArray, sizeof(accelArray), sizeof(accelArray), GattCharacteristic::GattCharacteristic::BLE_GATT_CHAR_PROPERTIES_NOTIFY | GattCharacteristic::BLE_GATT_CHAR_PROPERTIES_READ);
GattCharacteristic *uartChars[] = {&char_touch, &char_temp, &char_accel};
GattService         uartService(0x1815, uartChars, sizeof(uartChars) / sizeof(GattCharacteristic *));

void disconnectionCallBack(const Gap::DisconnectionCallbackParams_t *params) {
  //Serial.println("Disconnected!");
  ble.startAdvertising();
}
void connectionCallBack(const Gap::ConnectionCallbackParams_t *params) {
  //Serial.println("Connected!");
}

/*void pin_ISR() {
  if (ble.getGapState().connected) {
    sensorValue = digitalRead(TOUCH_SENSOR);
    if(!sensorValue) { //button pressed
      rx_buf[0] = 'p';
    }
    else {
      rx_buf[0] = 'n';
    }
    ble.updateCharacteristicValue(char_touch.getValueAttribute().getHandle(), rx_buf, sizeof(rx_buf));
  }
}*/

void getTemp() {
  if (ble.getGapState().connected) {
    rawTemp = analogRead(TEMP_SENSOR);
    voltage = rawTemp * (3.4 / 1023.0);
    celsius = (voltage - 0.5) * 100;
    tempArray[0] = celsius;
    ble.updateCharacteristicValue(char_temp.getValueAttribute().getHandle(), tempArray, sizeof(tempArray));
  }
}
 
void getAccel() {
  if (ble.getGapState().connected) {
    rawX = analogRead(ACCEL_X);
    rawY = analogRead(ACCEL_Y);
    rawZ = analogRead(ACCEL_Z);
    accelArray[0] = rawX * (4 / 1023.0) * 100; //(0x)00-11-22
    accelArray[1] = rawY * (4 / 1023.0) * 100;
    accelArray[2] = rawZ * (4 / 1023.0) * 100;
    ble.updateCharacteristicValue(char_accel.getValueAttribute().getHandle(), accelArray, sizeof(accelArray));
  }
}

void setup() {
  // put your setup code here, to run once
  //Serial.begin(9600);

  pinMode(LED_testt, OUTPUT);
  //pinMode(TOUCH_SENSOR, INPUT);
  pinMode(TEMP_SENSOR, INPUT);
  pinMode(ACCEL_X, INPUT);
  pinMode(ACCEL_Y, INPUT);
  pinMode(ACCEL_Z, INPUT);
  
  digitalWrite(LED_testt, HIGH);

  //ticker_touch.attach(pin_ISR, 0.1);
  ticker_temp.attach(getTemp, 1);
  ticker_accel.attach(getAccel, 0.1);

  ble.init();
  ble.onDisconnection(disconnectionCallBack);
  ble.onConnection(connectionCallBack);
  //ble.onDataWritten(gattServerWriteCallBack);

  // setup adv_data and srp_data
  ble.accumulateAdvertisingPayload(GapAdvertisingData::BREDR_NOT_SUPPORTED | GapAdvertisingData::LE_GENERAL_DISCOVERABLE);
  ble.accumulateAdvertisingPayload(GapAdvertisingData::COMPLETE_LOCAL_NAME, (uint8_t *)DEVICE_NAME, sizeof(DEVICE_NAME));

  ble.setAdvertisingType(GapAdvertisingParams::ADV_CONNECTABLE_UNDIRECTED);
  ble.addService(uartService);
  ble.setDeviceName((const uint8_t *)DEVICE_NAME);
  ble.setTxPower(4); //valid values are -40, -20, -16, -12, -8, -4, 0, 4
  ble.setAdvertisingInterval(160);
  ble.setAdvertisingTimeout(0); //seconds
  ble.startAdvertising();
 // Serial.println("Advertising Start!");
  //delay(20000);
}

void loop() {
  ble.waitForEvent();
}



