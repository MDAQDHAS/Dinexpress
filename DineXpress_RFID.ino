#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>

// 🚀 DineXpress Config
const char* ssid = "iQOO Z9x 5G";
const char* password = "0987654321";
const char* serverUrl = "http://10.151.251.210:3000/rfid-scan"; 

#define SS_PIN 5
#define RST_PIN 22
MFRC522 rfid(SS_PIN, RST_PIN);

String lastUID = "";

void setup() {
  Serial.begin(115200);
  SPI.begin();
  rfid.PCD_Init();
  
  // 🔥 START SCANNING IMMEDIATELY
  Serial.println("Scan RFID...");
  
  // Background WiFi Init
  WiFi.begin(ssid, password);
}

void loop() {
  // 🎯 1. Instant Scanner Logic (Directly from your working snippet)
  if (!rfid.PICC_IsNewCardPresent()) return;
  if (!rfid.PICC_ReadCardSerial()) return;

  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    uid += String(rfid.uid.uidByte[i], HEX);
    uid += " ";
  }

  // 🎯 2. Instant Feedback
  if (uid != lastUID) {
    Serial.print("UID: ");
    Serial.println(uid);
    lastUID = uid;

    // 🎯 3. Background Sync (If connected)
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverUrl);
      http.addHeader("Content-Type", "application/json");
      String clean = uid;
      clean.trim();
      http.POST("{\"uid\":\"" + clean + "\"}");
      http.end();
    }
  }

  rfid.PICC_HaltA();
  delay(10); // Ultra-short pause for stability
}
