import {useState,useEffect} from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList
} from "react-native";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = () => {
  const navigation = useNavigation();
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const now = new Date();
    console.log("Current Time:", now);
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const history = await AsyncStorage.getItem("chatHistory");
      console.log(history);
      if (history) {
        setChatHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  };

  const renderChatItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Text style={styles.historyText}>{item.text}</Text>
    </View>
  );
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.featureContainer}>
        <View style={styles.featureBox}>
          <Text style={styles.featureText}>Completed</Text>
          <Text style={styles.featureText}>
            Ask our AI Assistant about anuthing Health related
          </Text>
        </View>
        <View style={styles.featureBox}>
        <Text style={styles.featureText}>Scheduled</Text>
          <Text style={styles.featureText}>
            Set Reminders for your Medicine{" "}
          </Text>
        </View>
      </View>

      <View style={styles.featureContainer}>
        
        <TouchableOpacity onPress={()=>navigation.navigate('Chat')} style={styles.featureBox}>
          <MaterialCommunityIcons
            name="robot-angry"
            size={24}
            color="#4b9eb2"
          />
          <Text style={styles.featureText}>
            Ask our AI Assistant about anuthing Health related
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featureBox} onPress={() => navigation.navigate('AddReminder')}>
          <MaterialCommunityIcons name="alarm" size={24} color="#4b9eb2" />
          <Text style={styles.featureText}>
            Set Reminders for your Medicine{" "}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.historyTitle}>History</Text>
      <FlatList
        style={styles.historyContainer}
        data={chatHistory}
        renderItem={renderChatItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050c1c", // Assuming the background is black
    paddingTop: "6%",
  },
  header: {
    padding: 20,
    backgroundColor: "#5ad7ff", // Dark background for header
    borderRadius: 20,
    marginTop: "2%",
    marginHorizontal: "3%",
  },
  headerTitle: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 20,
  },
  headerSubtitle: {
    color: "#000",
    fontSize: 16,
    marginBottom: 10,
  },
  upgradeButton: {
    backgroundColor: "#000", // Example green color
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  upgradeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  featureContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    marginTop: "3%",
  },
  featureBox: {
    backgroundColor: "#795cd7", // Dark boxes for features
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "45%",
  },
  featureText: {
    color: "#fff",
    marginTop: 5,
  },
  historyTitle: {
    color: "#fff",
    padding: 20,
    fontSize: 18,
    fontWeight: "bold",
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  historyItem: {
    backgroundColor: "#222",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  historyText: {
    color: "#fff",
  },
  // ... other styles
});
