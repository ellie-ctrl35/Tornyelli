import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

// Function to handle push notifications registration
async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

// Function to schedule push notifications
async function schedulePushNotification(reminder) {
  const trigger = new Date(reminder.time);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Reminder!",
      body: reminder.message,
    },
    trigger: {
      hour: trigger.getHours(),
      minute: trigger.getMinutes(),
      repeats: reminder.frequency !== "Once",
    },
  });
}

const AddReminder = () => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [frequency, setFrequency] = useState(null);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [description, setDescription] = useState("");

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDate(Platform.OS === "ios");
    setDate(currentDate);
  };

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTime(Platform.OS === "ios");
    setTime(currentTime);
  };

  const showDatePicker = () => {
    setShowDate(true);
  };

  const showTimePicker = () => {
    setShowTime(true);
  };

  const frequencyOptions = ["Daily", "Weekly", "Monthly"];

  const selectFrequency = () => {
    Alert.alert(
      "Select Frequency",
      "",
      frequencyOptions.map((option) => ({
        text: option,
        onPress: () => setFrequency(option),
      })),
      { cancelable: true }
    );
  };

  const handleSaveReminder = async () => {
    const reminderDateTime = new Date(date);
    reminderDateTime.setHours(time.getHours());
    reminderDateTime.setMinutes(time.getMinutes());
    try {
      const reminder = {
        id: Date.now().toString(),
        description,
        time: reminderDateTime.toISOString(),
        message: `Reminder for ${description}`,
        frequency,
      };

      const storedReminders = await AsyncStorage.getItem("reminders");
      const reminders = storedReminders ? JSON.parse(storedReminders) : [];
      reminders.push(reminder);
      await AsyncStorage.setItem("reminders", JSON.stringify(reminders));

      await schedulePushNotification(reminder);

      setDescription("");
      setDate(new Date());
      setTime(new Date());
      setFrequency("Once");

      Alert.alert(
        "Reminder Set",
        "Your reminder has been saved and scheduled."
      );
    } catch (error) {
      console.error("Failed to save reminder", error);
      Alert.alert("Error", "Failed to save reminder. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Add New Reminder</Text>
      <View style={styles.form}>
        <TouchableOpacity
          onPress={showDatePicker}
          style={[styles.inputField, { backgroundColor: "#F26B6B" }]}
        >
          <Ionicons name="calendar" size={24} color="#fff" />
          <Text style={styles.inputText}>{date.toLocaleDateString()}</Text>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
        {showDate && (
          <DateTimePicker
            value={date}
            mode={"date"}
            display="default"
            onChange={handleDateChange}
            style={styles.dateTimePicker}
          />
        )}

        <TouchableOpacity
          onPress={showTimePicker}
          style={[styles.inputField, { backgroundColor: "#A0CED9" }]}
        >
          <Ionicons name="time" size={24} color="#fff" />
          <Text style={styles.inputText}>{time.toLocaleTimeString()}</Text>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
        {showTime && (
          <DateTimePicker
            value={time}
            mode={"time"}
            is24Hour={true}
            display="default"
            onChange={handleTimeChange}
            style={styles.dateTimePicker}
          />
        )}

        <TouchableOpacity
          onPress={selectFrequency}
          style={[styles.inputField, { backgroundColor: "#E6E8EA" }]}
        >
          <Ionicons name="repeat" size={24} color="#000" />
          <Text style={styles.inputText}>
            {frequency || "Select Frequency"}
          </Text>
          <Ionicons name="chevron-forward" size={24} color="#000" />
        </TouchableOpacity>

        <View
          style={{
            borderColor: "#555",
            borderWidth: 1,
            borderRadius: 7,
            height: 200,
            width: "100%",
            backgroundColor: "#2a2e37",
            marginTop: "5%",
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          <TextInput
            style={{ backgroundColor: "#2a2e37",color:"white",paddingLeft:10, height: 50, borderRadius: 7 ,margin:0, borderBottomColor:"#555", borderBottomWidth:1}}
            placeholder="Enter Title"
            placeholderTextColor="#ccc"
          />
          <TextInput
            style={styles.description}
            placeholder="Add Description..."
            value={description}
            onChangeText={setDescription}
            placeholderTextColor="#ccc"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleSaveReminder}>
        <Ionicons name="checkmark" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050c1c",
    paddingTop: "5%",
    paddingHorizontal: 20,
  },
  heading: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  form: {
    marginBottom: 20,
  },
  inputField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  inputText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
  },
  description: {
    color: "#fff",
    borderRadius: 10,
    height: 150,
    width: "100%",
    paddingHorizontal: 10,
    backgroundColor: "#2a2e37",
  },
  addButton: {
    backgroundColor: "#795cd7",
    padding: 15,
    borderRadius: 50,
    position: "absolute",
    bottom: 40,
    right: 40,
    alignItems: "center",
  },
  dateTimePicker: {
    backgroundColor: "#fff",
    alignSelf: "center",
    marginTop: 10,
  },
});

export default AddReminder;
