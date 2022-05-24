#define BLINKER_WIFI

#include <Blinker.h>
#include <Servo.h>

Servo servo1;
BlinkerButton button1("btn-abc");

void button1_callback(const String & state) {
  servo1.attach(5);
  pinMode(0,INPUT);
  digitalWrite(0,LOW);
  if (false) {
    servo1.write(0);
    item = 0;
  }

}

void setup() {
button1.attach(button1_callback);
  Blinker.begin("fa4jkl83", "clzhome", "chenlvzhou123");

}

void loop() {

}