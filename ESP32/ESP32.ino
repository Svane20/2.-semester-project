#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "Svane Mobilnet";
const char* password = "Duller12";

// MQTT Broker settings
const char *mqtt_broker = "192.168.234.202"; 
const int mqtt_port = 8883;
const char* mqttUser = "ks";
const char* mqttPassword = "Duller12";

// MQTT Topics
const char* mqtt_topic_command = "smartlock/command";
const char* mqtt_topic_heartbeat = "smartlock/heartbeat";
const char* mqtt_topic_status = "smartlock/state";

WiFiClient espClient;
PubSubClient client(espClient);

const int ledPin = 23;
bool isDoorLocked = true;

unsigned long lastHeartbeatTime = 0;
unsigned long doorOpenedTime = 0;
const unsigned long heartbeatInterval = 10000; // 10 seconds
const unsigned long doorOpenDuration = 5000; // 5 seconds

void setup_wifi() {
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  
  Serial.print("Connected to WIFI: ");
  Serial.println(ssid);

  Serial.print("IP address: http://");
  Serial.println(WiFi.localIP());
}

String translateEncryptionType(wifi_auth_mode_t encryptionType) {
    switch (encryptionType) {
        case WIFI_AUTH_OPEN:
            return "Open";
        case WIFI_AUTH_WEP:
            return "WEP";
        case WIFI_AUTH_WPA_PSK:
            return "WPA_PSK";
        case WIFI_AUTH_WPA2_PSK:
            return "WPA2_PSK";
        case WIFI_AUTH_WPA_WPA2_PSK:
            return "WPA_WPA2_PSK";
        case WIFI_AUTH_WPA2_ENTERPRISE:
            return "WPA2_ENTERPRISE";
        // Add any other cases for newer encryption types here
        default:
            return "Unknown";
    }
}

void scanNetworks() {
  int numberOfNetworks = WiFi.scanNetworks();
  Serial.print("Number of networks found: ");
  Serial.println(numberOfNetworks);

  for (int i = 0; i < numberOfNetworks; i++) {
    Serial.print("Network name: ");
    Serial.println(WiFi.SSID(i));

    Serial.print("Signal strength: ");
    Serial.println(WiFi.RSSI(i));

    Serial.print("MAC address: ");
    Serial.println(WiFi.BSSIDstr(i));

    Serial.print("Encryption type: ");
    String encryptionTypeDescription = translateEncryptionType(WiFi.encryptionType(i));
    Serial.println(encryptionTypeDescription);

    // Check the channel to infer if it's 2.4GHz
    uint8_t primaryChan = WiFi.channel(i);
    Serial.print("Primary Channel: ");
    Serial.println(primaryChan);
    if (primaryChan <= 14) {
      Serial.println("This network is likely 2.4GHz");
    } else {
      Serial.println("This network is likely 5GHz");
    }
    Serial.println("-----------------------");
  }
}

void updateLockStatus(bool lock) {
  isDoorLocked = lock;

  StaticJsonDocument<100> doc;
  doc["type"] = "status";
  doc["value"] = isDoorLocked ? "locked" : "unlocked";
  char message[100];
  serializeJson(doc, message);

  client.publish(mqtt_topic_status, message, true); // Retained message
}

void sendHeartbeat() {
  StaticJsonDocument<100> doc;
  doc["type"] = "heartbeat";
  doc["value"] = "alive";
  char message[100];
  serializeJson(doc, message);

  client.publish(mqtt_topic_heartbeat, message);
}

void mqttCallback(char* topic, byte* message, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");

  char messageTemp[length + 1];
  for (unsigned int i = 0; i < length; i++) {
    messageTemp[i] = (char)message[i];
  }
  messageTemp[length] = '\0'; // Null-terminate the string

  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, messageTemp);

  if (error) {
    Serial.print("deserializeJson() failed: ");
    Serial.println(error.c_str());
    return;
  }

  const char* command = doc["command"];

  // Handle the command
  if (String(topic) == mqtt_topic_command && String(command) == "unlock") {
    if (isDoorLocked) {
      updateLockStatus(false);
      digitalWrite(ledPin, LOW);
      doorOpenedTime = millis(); // Start the timer for automatic re-locking if necessary
      Serial.println("Door unlocked.");
    } else {
      Serial.println("Unlock command received but the door is already unlocked.");
    }
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.println("Connecting to MQTT...");
    if (client.connect("ESP32Client", mqttUser, mqttPassword)) {
      Serial.println("Connected to MQTT");
      client.subscribe(mqtt_topic_command);
      updateLockStatus(isDoorLocked);
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 2 seconds");
      delay(2000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, HIGH); // Initially turn on LED

  setup_wifi();
  
  client.setServer(mqtt_broker, mqtt_port);
  client.setCallback(mqttCallback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Check if it's time to send a heartbeat
  if (millis() - lastHeartbeatTime > heartbeatInterval) {
    sendHeartbeat();
    lastHeartbeatTime = millis();
  }

  // Check if the door has been open long enough
  if (!isDoorLocked && (millis() - doorOpenedTime > doorOpenDuration)) {
    digitalWrite(ledPin, HIGH);
    updateLockStatus(true);
    Serial.println("Door locked.");
  }
}
