import React from "react";
import { View, Text, StyleSheet, TouchableOpacity} from "react-native";
import { useRouter } from "expo-router";


export default function HomeScreen() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <Text style={styles.title}>Rock Paper Scissors</Text>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push("/game")}
        >
          <Text style={styles.startText}>START</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // Plain black background
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    color: "#C084FC", // Violet tone
    fontWeight: "bold",
    marginBottom: 50,
    textAlign: "center",
  },
  startButton: {
    backgroundColor: "#6D28D9", // Deep violet
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  startText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});
