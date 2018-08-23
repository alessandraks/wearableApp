#include <nRF5x_BLE_API.h>
#include <Wire.h>
#include <Adafruit_ADXL345_U.h>
#include <Adafruit_LIS3DH.h>
#include <Adafruit_MCP9808.h>

#define DEVICE_NAME            "Nano 2"
#define TXRX_BUF_LEN           20

BLE                            ble;
Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345);
Adafruit_LIS3DH accel2 = Adafruit_LIS3DH();
Adafruit_LIS3DH accel3 = Adafruit_LIS3DH();
Adafruit_MCP9808 tempsensor = Adafruit_MCP9808();
Timeout                        timeout;

static uint8_t rx_buf[TXRX_BUF_LEN];
static uint8_t rx_buf_num;
static uint8_t rx_state=0;

float xVal, yVal, zVal;
float xLeft, yLeft, zLeft;
float xRight, yRight, zRight;
sensors_event_t event;
sensors_event_t event2;
sensors_event_t event3;
int stepCt = 0;

static uint8_t tempArray[1] = {0};
static uint8_t accelArray[5] = {0,0,0,0,0};

// The uuid of service and characteristics
static const uint8_t service1_uuid[]        = {0x71, 0x3D, 0, 0, 0x50, 0x3E, 0x4C, 0x75, 0xBA, 0x94, 0x31, 0x48, 0xF1, 0x8D, 0x94, 0x1E};

GattCharacteristic  char_temp(0x2A59, tempArray, sizeof(tempArray), sizeof(tempArray), GattCharacteristic::GattCharacteristic::BLE_GATT_CHAR_PROPERTIES_NOTIFY | GattCharacteristic::BLE_GATT_CHAR_PROPERTIES_READ);
GattCharacteristic  char_accel(0x2A58, accelArray, sizeof(accelArray), sizeof(accelArray), GattCharacteristic::GattCharacteristic::BLE_GATT_CHAR_PROPERTIES_NOTIFY | GattCharacteristic::BLE_GATT_CHAR_PROPERTIES_READ);
GattCharacteristic *uartChars[] = {&char_temp, &char_accel};
GattService         uartService(0x1815, uartChars, sizeof(uartChars) / sizeof(GattCharacteristic *));

void readAccel()  {
  /*************** 0,1,2 *************/
  accel.getEvent(&event);
  
  xVal = event.acceleration.x;
  yVal = event.acceleration.y;
  zVal = event.acceleration.z;

  xVal = map(xVal, -10, 10, 0, 255);
  yVal = map(yVal, -10, 10, 0, 255);
  zVal = map(zVal, -10, 10, 0, 255);
  
  accelArray[0] = xVal;
  accelArray[1] = yVal;
  accelArray[2] = zVal;
 
  ble.updateCharacteristicValue(char_accel.getValueAttribute().getHandle(), accelArray, sizeof(accelArray));
}

void armMove() {
  /*************** 3,4 *************/
  accel2.getEvent(&event2);
  accel3.getEvent(&event3);

  float xLeft2 = event2.acceleration.x;
  float yLeft2 = event2.acceleration.y;
  float zLeft2 = event2.acceleration.z;
  float xRight2 = event3.acceleration.x;
  float yRight2 = event3.acceleration.y;
  float zRight2 = event3.acceleration.z;

  xLeft2 = map(xLeft2, -10, 10, 0, 255);
  yLeft2 = map(yLeft2, -10, 10, 0, 255);
  zLeft2 = map(zLeft2, -10, 10, 0, 255);
  xRight2 = map(xRight2, -10, 10, 0, 255);
  yRight2 = map(yRight2, -10, 10, 0, 255);
  zRight2 = map(zRight2, -10, 10, 0, 255);

  //Serial.print(xLeft); Serial.print(" "); Serial.print(yLeft); Serial.print(" "); Serial.println(zLeft); 
  //Serial.print(xLeft2); Serial.print(" "); Serial.print(yLeft2); Serial.print(" "); Serial.println(zLeft2); 
  
  float leftVector = sqrt((xLeft2 - xLeft)*(xLeft2 - xLeft) + (yLeft2 - yLeft)*(yLeft2 - yLeft) + (zLeft2 - zLeft)*(zLeft2 - zLeft));
  float rightVector = sqrt((xRight2 - xRight)*(xRight2 - xRight) + (yRight2 - yRight)*(yRight2 - yRight) + (zRight2 - zRight)*(zRight2 - zRight));

  accelArray[3] = leftVector;
  accelArray[4] = rightVector;

  ble.updateCharacteristicValue(char_accel.getValueAttribute().getHandle(), accelArray, sizeof(accelArray));
}

void readTemp() {
  float c = tempsensor.readTempC();
  //Serial.println("Temp: "); Serial.print(c); Serial.print("*C\t"); 
  tempArray[0] = c;
  ble.updateCharacteristicValue(char_temp.getValueAttribute().getHandle(), tempArray, sizeof(tempArray));
}

void disconnectionCallBack(const Gap::DisconnectionCallbackParams_t *params) {
  Serial.println("Disconnected!");
  Serial.println("Restarting the advertising process");
  ble.startAdvertising();
}

void gattServerWriteCallBack(const GattWriteCallbackParams *Handler) {
  uint8_t buf[TXRX_BUF_LEN];
  uint8_t index;
  uint16_t bytesRead = TXRX_BUF_LEN;

  Serial.println("onDataWritten : ");
  if (Handler->handle == char_temp.getValueAttribute().getHandle()) {
    ble.readCharacteristicValue(char_temp.getValueAttribute().getHandle(), buf, &bytesRead);
    Serial.print("bytesRead: ");
    Serial.println(bytesRead, HEX);
    for(index=0; index<bytesRead; index++) {
      Serial.write(buf[index]);
    }
    Serial.println("");
   
  }
}

void m_uart_rx_handle() {   //update characteristic data
  ble.updateCharacteristicValue(char_accel.getValueAttribute().getHandle(), rx_buf, rx_buf_num);
  Serial.print("\nrx_handle:");
  Serial.write(rx_buf, 20);
  memset(rx_buf, 0x00,20);
  rx_state = 0;
}

void uart_handle(uint32_t id, SerialIrq event) {   /* Serial rx IRQ */
  if(event == RxIrq) {
    /*if(rx_state == 0) {
      rx_state = 1;
      timeout.attach_us(m_uart_rx_handle, 100000);
      rx_buf_num=0;
    }
    while(Serial.available()) {
      if(rx_buf_num < 20) {
        rx_buf[rx_buf_num] = Serial.read();
        rx_buf_num++;
      }
      else {
        Serial.read();
      }
    }*/
  }
}

void setup() {
  // put your setup code here, to run once
  Serial.begin(9600);
  //Serial.attach(uart_handle);
  Wire.begin();
  ble.init();
  ble.onDisconnection(disconnectionCallBack);
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
 
   if(!accel.begin()) {
    Serial.println("Couldnt start accel 1!");
    while(1);
  }
  if (! accel2.begin(0x18)) {   // change this to 0x19 for alternative i2c address
    Serial.println("Couldnt start accel 2!");
    while (1);
  }
  if (! accel3.begin(0x19)) {   // change this to 0x19 for alternative i2c address
    Serial.println("Couldnt start accel 32");
    while (1);
  }
  if (!tempsensor.begin(0x1A)) {
    Serial.println("Couldn't start temp!");
    while (1);
  }

  accel.setRange(ADXL345_RANGE_4_G);
  accel2.setRange(LIS3DH_RANGE_4_G);   // 2, 4, 8 or 16 G!
  accel3.setRange(LIS3DH_RANGE_4_G);
}

void loop() {
/************************** ACCELEROMETERS *******************************/     

    /*** ARM MOVEMENT ***/
    accel2.getEvent(&event2); 
    xLeft = event2.acceleration.x;
    yLeft = event2.acceleration.y;
    zLeft = event2.acceleration.z;
    xLeft = map(xLeft, -10, 10, 0, 255);
    yLeft = map(yLeft, -10, 10, 0, 255);
    zLeft = map(zLeft, -10, 10, 0, 255);

    accel3.getEvent(&event3); 
    xRight = event3.acceleration.x;
    yRight = event3.acceleration.y;
    zRight = event3.acceleration.z;
    xRight = map(xRight, -10, 10, 0, 255);
    yRight = map(yRight, -10, 10, 0, 255);
    zRight = map(zRight, -10, 10, 0, 255);
  
    delay(400);
    armMove();

    /*** STEPS, POSTURE, SLEEP POS ***/
    readAccel();

/************************** TEMPERATURE *******************************/  
    readTemp();
    //delay(400);

    ble.waitForEvent();
}

