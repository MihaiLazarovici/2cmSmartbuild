import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../state/authStore";
import { UserRole } from "../../types/construction";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("engineer");
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const success = await login(email, password, selectedRole);
    if (!success) {
      Alert.alert("Login Failed", "Invalid credentials or role mismatch");
    }
  };

  const roles: { value: UserRole; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: "engineer", label: "Engineer", icon: "construct" },
    { value: "contractor", label: "Contractor", icon: "hammer" },
    { value: "project_manager", label: "Project Manager", icon: "people" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1 px-6" 
          contentContainerStyle={{ justifyContent: "center", minHeight: "100%" }}
          keyboardShouldPersistTaps="handled"
        >
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-4">
            <Ionicons name="business" size={40} color="white" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-2">2CM SmartBuild</Text>
          <Text className="text-gray-600 text-center">
            AI-powered construction project planning
          </Text>
        </View>

        {/* Role Selection */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Select Your Role</Text>
          <View className="flex-row justify-between">
            {roles.map((role) => (
              <Pressable
                key={role.value}
                onPress={() => setSelectedRole(role.value)}
                className={`flex-1 mx-1 p-4 rounded-lg border-2 items-center ${
                  selectedRole === role.value
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <Ionicons
                  name={role.icon}
                  size={24}
                  color={selectedRole === role.value ? "#2563eb" : "#6b7280"}
                />
                <Text
                  className={`text-sm font-medium mt-2 text-center ${
                    selectedRole === role.value ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  {role.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Login Form */}
        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              className="w-full p-4 border border-gray-300 rounded-lg bg-white"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
            <View className="relative">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                className="w-full p-4 border border-gray-300 rounded-lg bg-white pr-12"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4"
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#6b7280"
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            className="w-full bg-blue-600 p-4 rounded-lg items-center mt-6"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-lg">Sign In</Text>
            )}
          </Pressable>
        </View>

        {/* Demo Accounts */}
        <View className="mt-8 p-4 bg-gray-50 rounded-lg">
          <Text className="text-sm font-medium text-gray-700 mb-2">Demo Accounts:</Text>
          <Text className="text-xs text-gray-600">Engineer: john.engineer@example.com</Text>
          <Text className="text-xs text-gray-600">Contractor: sarah.contractor@example.com</Text>
          <Text className="text-xs text-gray-600">PM: mike.pm@example.com</Text>
          <Text className="text-xs text-gray-500 mt-1">Password: any password</Text>
        </View>

        {/* Register Link */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-600">Don't have an account? </Text>
          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text className="text-blue-600 font-semibold">Sign Up</Text>
          </Pressable>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}