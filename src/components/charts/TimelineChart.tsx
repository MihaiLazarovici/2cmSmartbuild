import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TimelineItem {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  status: "completed" | "in_progress" | "pending" | "delayed";
  progress?: number;
}

interface TimelineChartProps {
  items: TimelineItem[];
  projectStart: Date;
  projectEnd: Date;
}

export default function TimelineChart({ items, projectStart, projectEnd }: TimelineChartProps) {
  const totalDays = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#10b981";
      case "in_progress":
        return "#3b82f6";
      case "pending":
        return "#6b7280";
      case "delayed":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case "completed":
        return "checkmark-circle";
      case "in_progress":
        return "play-circle";
      case "pending":
        return "time";
      case "delayed":
        return "warning";
      default:
        return "ellipse";
    }
  };

  const calculatePosition = (date: Date) => {
    const daysSinceStart = Math.ceil((date.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(100, (daysSinceStart / totalDays) * 100));
  };

  const calculateWidth = (startDate: Date, endDate: Date) => {
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(2, (duration / totalDays) * 100);
  };

  return (
    <View className="w-full">
      {/* Timeline Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-sm font-medium text-gray-700">
          {projectStart.toLocaleDateString()}
        </Text>
        <Text className="text-sm font-medium text-gray-700">
          {totalDays} days
        </Text>
        <Text className="text-sm font-medium text-gray-700">
          {projectEnd.toLocaleDateString()}
        </Text>
      </View>

      {/* Timeline Items */}
      <View className="space-y-4">
        {items.map((item) => {
          const leftPosition = calculatePosition(item.startDate);
          const width = calculateWidth(item.startDate, item.endDate);
          const statusColor = getStatusColor(item.status);
          
          return (
            <View key={item.id} className="relative">
              {/* Item Label */}
              <View className="flex-row items-center mb-2">
                <Ionicons
                  name={getStatusIcon(item.status)}
                  size={16}
                  color={statusColor}
                />
                <Text className="text-sm font-medium text-gray-900 ml-2">
                  {item.title}
                </Text>
                <Text className="text-xs text-gray-500 ml-auto">
                  {item.startDate.toLocaleDateString()} - {item.endDate.toLocaleDateString()}
                </Text>
              </View>

              {/* Timeline Bar Background */}
              <View className="w-full bg-gray-200 rounded-full h-6 relative">
                {/* Timeline Bar */}
                <View
                  className="h-6 rounded-full flex-row items-center px-2"
                  style={{
                    backgroundColor: statusColor,
                    width: `${width}%`,
                    marginLeft: `${leftPosition}%`,
                    opacity: item.status === "pending" ? 0.5 : 1,
                  }}
                >
                  {/* Progress Indicator */}
                  {item.status === "in_progress" && item.progress !== undefined && (
                    <View className="flex-1 bg-white bg-opacity-30 rounded-full h-2">
                      <View
                        className="bg-white rounded-full h-2"
                        style={{ width: `${item.progress}%` }}
                      />
                    </View>
                  )}
                </View>

                {/* Progress Text */}
                {item.status === "in_progress" && item.progress !== undefined && (
                  <Text
                    className="absolute text-xs font-medium text-white"
                    style={{
                      left: `${leftPosition + width / 2}%`,
                      transform: [{ translateX: -20 }],
                      top: 6,
                    }}
                  >
                    {item.progress}%
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View className="flex-row justify-around mt-6 pt-4 border-t border-gray-200">
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
          <Text className="text-xs text-gray-600">Completed</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
          <Text className="text-xs text-gray-600">In Progress</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-gray-500 mr-2" />
          <Text className="text-xs text-gray-600">Pending</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
          <Text className="text-xs text-gray-600">Delayed</Text>
        </View>
      </View>
    </View>
  );
}