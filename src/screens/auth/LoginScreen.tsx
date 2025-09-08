import React, { useState } from "react";
import { Text, TextInput, Button, StyleSheet } from "react-native";
import ScreenLayout from "../../components/ScreenLayout";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <ScreenLayout>
      <Text style={styles.title}>Welcome Back 👋</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={() => navigation.navigate("Main")} />
      <Text
        style={styles.link}
        onPress={() => navigation.navigate("Register")}
      >
        Don’t have an account? Register
      </Text>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  link: { marginTop: 10, color: "#2563eb", textAlign: "center" },
});
