import React from "react";
import { View, Text } from "react-native";

interface CostBreakdownChartProps {
  data: {
    materials: number;
    labor: number;
    equipment: number;
    overhead: number;
  };
}

export default function CostBreakdownChart({ data }: CostBreakdownChartProps) {
  const chartData = [
    { value: data.materials, color: "#3b82f6", label: "Materials" },
    { value: data.labor, color: "#10b981", label: "Labor" },
    { value: data.equipment, color: "#f59e0b", label: "Equipment" },
    { value: data.overhead, color: "#ef4444", label: "Overhead" },
  ];

  const total = data.materials + data.labor + data.equipment + data.overhead;

  return (
    <View className="w-full">
      {/* Horizontal Bar Chart */}
      <View className="mb-4">
        {chartData.map((item, index) => {
          const percentage = (item.value / total) * 100;
          return (
            <View key={index} className="mb-3">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-sm font-medium text-gray-700">{item.label}</Text>
                <Text className="text-sm font-semibold text-gray-900">
                  ${item.value.toLocaleString()} ({percentage.toFixed(1)}%)
                </Text>
              </View>
              <View className="w-full bg-gray-200 rounded-full h-3">
                <View 
                  className="h-3 rounded-full"
                  style={{ 
                    backgroundColor: item.color,
                    width: `${percentage}%`
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Summary */}
      <View className="bg-gray-50 p-4 rounded-lg">
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-semibold text-gray-900">Total Cost</Text>
          <Text className="text-xl font-bold text-blue-600">
            ${total.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}