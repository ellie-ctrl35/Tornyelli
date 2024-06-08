import React, { useState ,useEffect} from "react";
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
import { Ionicons } from "@expo/vector-icons"; // Ensure you have expo/vector-icons installed
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

registerForPushNotificationsAsync();

async function schedulePushNotification(reminder) {
  // Note: 'trigger' needs to be a Date object or a valid trigger object for specific times
  const trigger = new Date(reminder.time);
  // Convert to the trigger object for expo-notifications
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Reminder!",
      body: reminder.message,
    },
    trigger: {
      // Convert to the trigger object format accepted by expo-notifications
      hour: trigger.getHours(),
      minute: trigger.getMinutes(),
      repeats: reminder.frequency !== "Once",
    },
  });
}
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

const AddReminder = () => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [frequency, setFrequency] = useState(null);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const storedReminders = await AsyncStorage.getItem("reminders");
        if (storedReminders) {
          console.info("Reminders from AsyncStorage:", JSON.parse(storedReminders));
        }
      } catch (error) {
        console.error("Error retrieving reminders:", error);
      }
    };

    fetchReminders();

    const interval = setInterval(() => {
      checkReminders();
    }, 1000); // Check every second
    return () => clearInterval(interval); // Clean up interval on component unmount
    
  }, []);

  const checkReminders = async () => {
    const storedReminders = await AsyncStorage.getItem("reminders");
    if (storedReminders) {
      const reminders = JSON.parse(storedReminders);
      const now = new Date();
      reminders.forEach((reminder) => {
        const reminderTime = new Date(reminder.time);
        if (
          now.getFullYear() === reminderTime.getFullYear() &&
          now.getMonth() === reminderTime.getMonth() &&
          now.getDate() === reminderTime.getDate() &&
          now.getHours() === reminderTime.getHours() &&
          now.getMinutes() === reminderTime.getMinutes() &&
          now.getSeconds() === 0
        ) {
          // Trigger notification for the reminder
          schedulePushNotification(reminder);
        }
      });
    }
  };


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
        time: reminderDateTime.toISOString(), // ISO string of the scheduled time
        message: `Reminder for ${description}`,
        frequency,
      };

      // Save reminder to AsyncStorage
      const storedReminders = await AsyncStorage.getItem("reminders");
      const reminders = storedReminders ? JSON.parse(storedReminders) : [];
      reminders.push(reminder);
      await AsyncStorage.setItem("reminders", JSON.stringify(reminders));
      console.log("Reminder saved successfully!", reminder);

      // Schedule notification
      await schedulePushNotification(reminder);

      setDescription('');
    setDate(new Date());
    setTime(new Date());
    setFrequency('Once');
    Alert.alert("Reminder Set", "Your reminder has been saved and scheduled.");

      // Reset state or navigate away
    } catch (error) {
      // Handle errors
      console.error("Failed to save reminder", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.description}
        placeholder="Add Description..."
        value={description}
        onChangeText={setDescription}
      />

      {/* Date Picker */}
      <TouchableOpacity onPress={showDatePicker} style={styles.inputField}>
        <Ionicons name="calendar" size={24} color="black" />
        <Text style={styles.inputText}>{date.toLocaleDateString()}</Text>
        <Ionicons name="chevron-down" size={24} color="black" />
      </TouchableOpacity>
      {showDate && (
        <DateTimePicker
          value={date}
          mode={"date"}
          display="default"
          onChange={handleDateChange}
          style={{
            backgroundColor: "#fff",
            alignSelf: "center",
            justifyContent: "center",
            marginTop: "1%",
          }}
        />
      )}

      {/* Time Picker */}
      <TouchableOpacity onPress={showTimePicker} style={styles.inputField}>
        <Ionicons name="time" size={24} color="black" />
        <Text style={styles.inputText}>{time.toLocaleTimeString()}</Text>
        <Ionicons name="chevron-down" size={24} color="black" />
      </TouchableOpacity>
      {showTime && (
        <DateTimePicker
          value={time}
          mode={"time"}
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
          style={{
            backgroundColor: "#fff",
            alignSelf: "center",
            justifyContent: "center",
            marginTop: "1%",
          }}
        />
      )}

      {/* Frequency Selector */}
      <TouchableOpacity onPress={selectFrequency} style={styles.inputField}>
        <Ionicons name="repeat" size={24} color="black" />
        <Text style={styles.inputText}>{frequency || "Select Frequency"}</Text>
        <Ionicons name="chevron-down" size={24} color="black" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.addButton} onPress={handleSaveReminder}>
        <Text style={styles.addButtonText}>Add Reminder</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#191919", // Assuming dark mode from screenshot
    paddingTop: "5%",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    marginTop: "3%",
    marginLeft: "2%",
  },
  inputField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#BAE6FD", // Replace with actual color from your theme
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: "6%",
    height: "10%",
  },
  inputText: {
    color: "#000",
  },
  description: {
    color: "#fff",
    borderColor: "#555", // Lighter grey for border
    borderWidth: 1,
    borderRadius: 5,
    height: "9%",
    width: "90%",
    alignSelf: "center",
    padding: 10,
    marginTop: "5%",
  },
  addButton: {
    backgroundColor: "#BAE6FD", // Replace with actual color from your theme
    padding: 15,
    borderRadius: 10,
    width: "90%",
    height: "10%",
    alignSelf: "center",
    marginTop: "10%",
    justifyContent: "center ",
    alignItems: "center",
    display: "flex",
  },
  addButtonText: {
    textAlign: "center",
    color: "#000",
    fontWeight: "bold",
    fontSize: 20,
  },
});

export default AddReminder;
