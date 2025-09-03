import React from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../state/authStore";

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: logout },
      ]
    );
  };

  const profileSections = [
    {
      title: "Account",
      items: [
        { label: "Edit Profile", icon: "person-outline" as keyof typeof Ionicons.glyphMap, onPress: () => {} },
        { label: "Change Password", icon: "lock-closed-outline" as keyof typeof Ionicons.glyphMap, onPress: () => {} },
        { label: "Notifications", icon: "notifications-outline" as keyof typeof Ionicons.glyphMap, onPress: () => {} },
      ],
    },
    {
      title: "Preferences",
      items: [
        { label: "Units & Measurements", icon: "resize-outline" as keyof typeof Ionicons.glyphMap, onPress: () => {} },
        { label: "Default Project Settings", icon: "settings-outline" as keyof typeof Ionicons.glyphMap, onPress: () => {} },
        { label: "AI Estimation Preferences", icon: "brain-outline" as keyof typeof Ionicons.glyphMap, onPress: () => {} },
      ],
    },
    {
      title: "Data & Privacy",
      items: [
        { label: "Export Data", icon: "download-outline" as keyof typeof Ionicons.glyphMap, onPress: () => {} },
        { label: "Privacy Settings", icon: "shield-outline" as keyof typeof Ionicons.glyphMap, onPress: () => {} },
        { label: "Data Usage", icon: "analytics-outline" as keyof typeof Ionicons.glyphMap, onPress: () => {} },
      ],
    },
    {
      title: "Support",
      items: [
        { label: "Help Center", icon: "help-circle-outline" as keyof typeof Ionicons.glyphMap, onPress: () => {} },
        { label: "Contact Support", icon: "mail-outline" as keyof typeof Ionicons.glyphMap, onPress: () => {} },
        { label: "Feature Requests", icon: "bulb-outline" as keyof typeof Ionicons.glyphMap, onPress: () => {} },
      ],
    },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case "engineer":
        return "bg-blue-100 text-blue-800";
      case "contractor":
        return "bg-green-100 text-green-800";
      case "project_manager":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: string): keyof typeof Ionicons.glyphMap => {
    switch (role) {
      case "engineer":
        return "construct";
      case "contractor":
        return "hammer";
      case "project_manager":
        return "people";
      default:
        return "person";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="px-6 py-6 bg-white">
          <View className="items-center">
            <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-4">
              <Ionicons 
                name={getRoleIcon(user?.role || "")} 
                size={40} 
                color="white" 
              />
            </View>
            <Text className="text-2xl font-bold text-gray-900">{user?.name}</Text>
            <Text className="text-gray-600 mt-1">{user?.email}</Text>
            {user?.company && (
              <Text className="text-gray-600 mt-1">{user.company}</Text>
            )}
            <View className={`px-3 py-1 rounded-full mt-3 ${getRoleColor(user?.role || "")}`}>
              <Text className="text-sm font-medium">
                {user?.role?.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </View>
          </View>
        </View>

        {/* Account Stats */}
        <View className="px-6 py-4">
          <View className="bg-white p-4 rounded-lg">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-2xl font-bold text-blue-600">12</Text>
                <Text className="text-sm text-gray-600">Projects</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-green-600">8</Text>
                <Text className="text-sm text-gray-600">Completed</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-purple-600">94%</Text>
                <Text className="text-sm text-gray-600">AI Accuracy</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-orange-600">$2.4M</Text>
                <Text className="text-sm text-gray-600">Total Value</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="px-6 py-2">
            <Text className="text-lg font-semibold text-gray-900 mb-3">{section.title}</Text>
            <View className="bg-white rounded-lg">
              {section.items.map((item, itemIndex) => (
                <Pressable
                  key={itemIndex}
                  onPress={item.onPress}
                  className={`flex-row items-center p-4 ${
                    itemIndex < section.items.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <Ionicons name={item.icon} size={24} color="#6b7280" />
                  <Text className="text-base text-gray-900 ml-4 flex-1">{item.label}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View className="px-6 py-4">
          <View className="bg-white p-4 rounded-lg">
            <Text className="text-lg font-semibold text-gray-900 mb-3">About</Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">App Version</Text>
                <Text className="text-gray-900 font-medium">1.0.0</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Build</Text>
                <Text className="text-gray-900 font-medium">2024.12.15</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Member Since</Text>
                <Text className="text-gray-900 font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <View className="px-6 py-4 pb-8">
          <Pressable
            onPress={handleLogout}
            className="bg-red-600 p-4 rounded-lg flex-row items-center justify-center"
          >
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}