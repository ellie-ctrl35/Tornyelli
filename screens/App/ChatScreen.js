import React, { useState, useRef } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from "react-native";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

const GCPApiKey = "YOUR_GCP_API_KEY";
const apiKey = "AIzaSyAcNJQALN2tTEs3eG3CO1cS9sU7goX7O50";
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
const speechToTextUrl = `https://speech.googleapis.com/v1p1beta1/speech:recognize?key=${GCPApiKey}`;

export default function ChatScreen() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const recordingRef = useRef(null);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    setChatHistory(prev => [...prev, { role: "user", text }]);
    setIsLoading(true);

    try {
      const response = await axios.post(apiUrl, {
        contents: [{ parts: [{ text }] }],
      }, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("API response:", response.data); // Debug log to inspect the API response

      const botMessage = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
      console.log("Bot message:", botMessage); // Debug log to inspect the bot message

      setChatHistory(prev => [...prev, { role: "bot", text: botMessage }]);
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
      setMessage("");
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    await recordingRef.current.stopAndUnloadAsync();
    const uri = recordingRef.current.getURI();
    console.log("Recording stopped and stored at", uri);

    const audioData = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });

    try {
      const response = await axios.post(speechToTextUrl, {
        config: {
          encoding: "LINEAR16",
          sampleRateHertz: 16000,
          languageCode: "en-US",
        },
        audio: { content: audioData },
      });

      const transcription = response.data.results.map(result => result.alternatives[0].transcript).join("\n");
      console.log("Transcription:", transcription);

      sendMessage(transcription);
    } catch (error) {
      console.error("Error transcribing audio:", error.response?.data || error.message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.key} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chat with Tornyelli</Text>
        </View>

        <ScrollView style={styles.chatContainer}>
          {chatHistory.map((chat, index) => (
            <View key={index} style={[styles.chatBubble, chat.role === "user" ? styles.userBubble : styles.botBubble]}>
              <Text style={styles.chatBubbleText}>{chat.text}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <AntDesign name="paperclip" size={24} color="white" style={{ marginLeft: "2%" }} />
          <TextInput
            placeholder="Type your message..."
            placeholderTextColor="#888"
            style={styles.input}
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={() => sendMessage(message)}>
            {isLoading ? <ActivityIndicator size="small" color="white" /> : <FontAwesome name="send" size={24} color="white" />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.micButton} onPressIn={startRecording} onPressOut={stopRecording}>
            <FontAwesome name={isRecording ? "microphone-slash" : "microphone"} size={24} color="white" />
          </TouchableOpacity>
        </View>
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
    padding: 1,
    height: 60,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  chatBubble: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    maxWidth: "80%",
  },
  userBubble: {
    backgroundColor: "#333",
    alignSelf: "flex-end",
  },
  botBubble: {
    backgroundColor: "#444",
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
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    height: 40,
    color: "white",
    borderRadius: 25,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  sendButton: {
    borderRadius: 25,
    padding: 12,
  },
  micButton: {
    borderRadius: 25,
    padding: 12,
    marginLeft: 8,
  },
});
