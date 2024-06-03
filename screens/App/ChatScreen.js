import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";

export default function ChatScreen() {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recording, setRecording] = useState(null);

  useEffect(() => {
    return recording
      ? () => {
          recording.stopAndUnloadAsync();
        }
      : undefined;
  }, [recording]);

  const startRecording = async () => {
    try {
      console.log("Requesting permissions..");
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await recording.startAsync();

      setRecording(recording);
      setIsListening(true);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    console.log("Stopping recording..");
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log("Recording stopped and stored at", uri);
    setIsListening(false);

    // Here you should implement speech-to-text conversion
    // using any third-party service, for demonstration purposes, we're setting a dummy text
    setMessage("Speech to text conversion result");
  };

  const handleLongPress = async () => {
    await startRecording();
  };

  const handleLongPressOut = async () => {
    await stopRecording();
  };

  return (
    <KeyboardAvoidingView
      style={styles.key}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chat with AI Bot</Text>
        </View>

        <View style={styles.chatBubble}>
          <Text style={styles.chatBubbleText}>
            Describe and show me the perfect vacation spot on an island in the
            ocean
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <AntDesign
            name="paperclip"
            size={24}
            color="white"
            style={{ marginLeft: "2%" }}
          />
          <TextInput
            placeholder="Type your message..."
            placeholderTextColor="#888"
            style={styles.input}
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onLongPress={handleLongPress}
            onPressOut={handleLongPressOut}
          >
            {message ? (
              <FontAwesome name="send" size={24} color="white" />
            ) : (
              <FontAwesome name="microphone" size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isListening}
          onRequestClose={() => {
            setIsListening(!isListening);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <FontAwesome name="microphone" size={80} color="white" />
              <Text style={styles.modalText}>Listening...</Text>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    justifyContent: "space-between",
  },
  key: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
  },
  chatBubble: {
    backgroundColor: "#333",
    borderRadius: 20,
    padding: 16,
    margin: 16,
    maxWidth: "80%",
    alignSelf: "flex-start",
  },
  chatBubbleText: {
    color: "white",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    backgroundColor: "#222729",
    borderRadius: 25,
  },
  input: {
    flex: 1,
    height: 50,
    color: "white",
    borderRadius: 25,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  sendButton: {
    borderRadius: 25,
    padding: 12,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginTop: 15,
    color: "white",
    fontSize: 18,
  },
});
 