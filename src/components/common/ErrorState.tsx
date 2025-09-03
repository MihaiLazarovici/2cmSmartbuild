import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

export default function ErrorState({ 
  title = "Something went wrong",
  message = "Please try again later",
  onRetry,
  retryText = "Try Again"
}: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
      <Text className="text-xl font-bold text-gray-900 mt-4 text-center">{title}</Text>
      <Text className="text-gray-600 mt-2 text-center">{message}</Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="bg-blue-600 px-6 py-3 rounded-lg mt-6"
        >
          <Text className="text-white font-semibold">{retryText}</Text>
        </Pressable>
      )}
    </View>
  );
}