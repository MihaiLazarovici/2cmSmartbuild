import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../state/authStore";
import { UserRole } from "../../types/construction";

export default function RegisterScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
  });
  const [selectedRole, setSelectedRole] = useState<UserRole>("engineer");
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, isLoading } = useAuthStore();

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    const success = await register(
      formData.email,
      formData.password,
      formData.name,
      selectedRole,
      formData.company || undefined
    );

    if (!success) {
      Alert.alert("Registration Failed", "Email already exists");
    }
  };

  const roles: { value: UserRole; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: "engineer", label: "Engineer", icon: "construct" },
    { value: "contractor", label: "Contractor", icon: "hammer" },
    { value: "project_manager", label: "Project Manager", icon: "people" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="items-center my-8">
          <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-4">
            <Ionicons name="business" size={40} color="white" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-2">Create Account</Text>
          <Text className="text-gray-600 text-center">
            Join 2CM SmartBuild to revolutionize your construction planning
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

        {/* Registration Form */}
        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Full Name *</Text>
            <TextInput
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Enter your full name"
              className="w-full p-4 border border-gray-300 rounded-lg bg-white"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Email *</Text>
            <TextInput
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              className="w-full p-4 border border-gray-300 rounded-lg bg-white"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Company (Optional)</Text>
            <TextInput
              value={formData.company}
              onChangeText={(text) => setFormData(prev => ({ ...prev, company: text }))}
              placeholder="Enter your company name"
              className="w-full p-4 border border-gray-300 rounded-lg bg-white"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Password *</Text>
            <View className="relative">
              <TextInput
                value={formData.password}
                onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
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

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Confirm Password *</Text>
            <TextInput
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
              placeholder="Confirm your password"
              secureTextEntry={!showPassword}
              className="w-full p-4 border border-gray-300 rounded-lg bg-white"
            />
          </View>

          <Pressable
            onPress={handleRegister}
            disabled={isLoading}
            className="w-full bg-blue-600 p-4 rounded-lg items-center mt-6"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-lg">Create Account</Text>
            )}
          </Pressable>
        </View>

        {/* Login Link */}
        <View className="flex-row justify-center mt-6 mb-8">
          <Text className="text-gray-600">Already have an account? </Text>
          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text className="text-blue-600 font-semibold">Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}