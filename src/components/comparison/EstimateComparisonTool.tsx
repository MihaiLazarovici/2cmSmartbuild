import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AIEstimationResponse } from "../../types/construction";

interface ManualEstimate {
  totalCost: number;
  materials: number;
  labor: number;
  equipment: number;
  overhead: number;
  timeline: number;
  notes: string;
}

interface EstimateComparisonToolProps {
  aiEstimate: AIEstimationResponse;
  onComparisonComplete?: (comparison: ComparisonResult) => void;
}

interface ComparisonResult {
  aiEstimate: AIEstimationResponse;
  manualEstimate: ManualEstimate;
  variance: {
    totalCost: number;
    materials: number;
    labor: number;
    equipment: number;
    overhead: number;
    timeline: number;
  };
  accuracy: number;
}

export default function EstimateComparisonTool({ aiEstimate, onComparisonComplete }: EstimateComparisonToolProps) {
  const [manualEstimate, setManualEstimate] = useState<ManualEstimate>({
    totalCost: 0,
    materials: 0,
    labor: 0,
    equipment: 0,
    overhead: 0,
    timeline: 0,
    notes: "",
  });

  const [showComparison, setShowComparison] = useState(false);

  const calculateVariance = (): ComparisonResult["variance"] => {
    return {
      totalCost: ((manualEstimate.totalCost - aiEstimate.estimatedCost) / aiEstimate.estimatedCost) * 100,
      materials: ((manualEstimate.materials - aiEstimate.costBreakdown.materials) / aiEstimate.costBreakdown.materials) * 100,
      labor: ((manualEstimate.labor - aiEstimate.costBreakdown.labor) / aiEstimate.costBreakdown.labor) * 100,
      equipment: ((manualEstimate.equipment - aiEstimate.costBreakdown.equipment) / aiEstimate.costBreakdown.equipment) * 100,
      overhead: ((manualEstimate.overhead - aiEstimate.costBreakdown.overhead) / aiEstimate.costBreakdown.overhead) * 100,
      timeline: ((manualEstimate.timeline - aiEstimate.timeline) / aiEstimate.timeline) * 100,
    };
  };

  const calculateAccuracy = (): number => {
    const variance = calculateVariance();
    const avgVariance = Math.abs((
      Math.abs(variance.totalCost) +
      Math.abs(variance.materials) +
      Math.abs(variance.labor) +
      Math.abs(variance.equipment) +
      Math.abs(variance.overhead) +
      Math.abs(variance.timeline)
    ) / 6);
    
    return Math.max(0, 100 - avgVariance);
  };

  const handleCompare = () => {
    const variance = calculateVariance();
    const accuracy = calculateAccuracy();
    
    const comparison: ComparisonResult = {
      aiEstimate,
      manualEstimate,
      variance,
      accuracy,
    };

    setShowComparison(true);
    onComparisonComplete?.(comparison);
  };

  const getVarianceColor = (variance: number) => {
    const absVariance = Math.abs(variance);
    if (absVariance < 5) return "text-green-600";
    if (absVariance < 15) return "text-yellow-600";
    return "text-red-600";
  };

  const getVarianceIcon = (variance: number): keyof typeof Ionicons.glyphMap => {
    if (Math.abs(variance) < 5) return "checkmark-circle";
    if (Math.abs(variance) < 15) return "warning";
    return "alert-circle";
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* AI Estimate Display */}
      <View className="bg-blue-50 p-4 rounded-lg mb-4">
        <Text className="text-lg font-semibold text-blue-900 mb-3">AI Estimate</Text>
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-blue-700">Total Cost:</Text>
            <Text className="font-semibold text-blue-900">${aiEstimate.estimatedCost.toLocaleString()}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-blue-700">Materials:</Text>
            <Text className="font-semibold text-blue-900">${aiEstimate.costBreakdown.materials.toLocaleString()}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-blue-700">Labor:</Text>
            <Text className="font-semibold text-blue-900">${aiEstimate.costBreakdown.labor.toLocaleString()}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-blue-700">Equipment:</Text>
            <Text className="font-semibold text-blue-900">${aiEstimate.costBreakdown.equipment.toLocaleString()}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-blue-700">Overhead:</Text>
            <Text className="font-semibold text-blue-900">${aiEstimate.costBreakdown.overhead.toLocaleString()}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-blue-700">Timeline:</Text>
            <Text className="font-semibold text-blue-900">{aiEstimate.timeline} days</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-blue-700">Confidence:</Text>
            <Text className="font-semibold text-blue-900">{aiEstimate.confidence}%</Text>
          </View>
        </View>
      </View>

      {/* Manual Estimate Input */}
      <View className="bg-white p-4 rounded-lg mb-4">
        <Text className="text-lg font-semibold text-gray-900 mb-3">Manual Estimate</Text>
        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Total Cost</Text>
            <TextInput
              value={manualEstimate.totalCost.toString()}
              onChangeText={(text) => setManualEstimate(prev => ({ ...prev, totalCost: parseFloat(text) || 0 }))}
              placeholder="Enter total cost"
              keyboardType="numeric"
              className="w-full p-3 border border-gray-300 rounded-lg bg-white"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Materials Cost</Text>
            <TextInput
              value={manualEstimate.materials.toString()}
              onChangeText={(text) => setManualEstimate(prev => ({ ...prev, materials: parseFloat(text) || 0 }))}
              placeholder="Enter materials cost"
              keyboardType="numeric"
              className="w-full p-3 border border-gray-300 rounded-lg bg-white"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Labor Cost</Text>
            <TextInput
              value={manualEstimate.labor.toString()}
              onChangeText={(text) => setManualEstimate(prev => ({ ...prev, labor: parseFloat(text) || 0 }))}
              placeholder="Enter labor cost"
              keyboardType="numeric"
              className="w-full p-3 border border-gray-300 rounded-lg bg-white"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Equipment Cost</Text>
            <TextInput
              value={manualEstimate.equipment.toString()}
              onChangeText={(text) => setManualEstimate(prev => ({ ...prev, equipment: parseFloat(text) || 0 }))}
              placeholder="Enter equipment cost"
              keyboardType="numeric"
              className="w-full p-3 border border-gray-300 rounded-lg bg-white"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Overhead Cost</Text>
            <TextInput
              value={manualEstimate.overhead.toString()}
              onChangeText={(text) => setManualEstimate(prev => ({ ...prev, overhead: parseFloat(text) || 0 }))}
              placeholder="Enter overhead cost"
              keyboardType="numeric"
              className="w-full p-3 border border-gray-300 rounded-lg bg-white"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Timeline (days)</Text>
            <TextInput
              value={manualEstimate.timeline.toString()}
              onChangeText={(text) => setManualEstimate(prev => ({ ...prev, timeline: parseInt(text) || 0 }))}
              placeholder="Enter timeline in days"
              keyboardType="numeric"
              className="w-full p-3 border border-gray-300 rounded-lg bg-white"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Notes</Text>
            <TextInput
              value={manualEstimate.notes}
              onChangeText={(text) => setManualEstimate(prev => ({ ...prev, notes: text }))}
              placeholder="Add any notes about your manual estimate"
              multiline
              numberOfLines={3}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white"
              style={{ textAlignVertical: "top" }}
            />
          </View>
        </View>

        <Pressable
          onPress={handleCompare}
          className="w-full bg-purple-600 p-4 rounded-lg items-center mt-4"
        >
          <Text className="text-white font-semibold text-lg">Compare Estimates</Text>
        </Pressable>
      </View>

      {/* Comparison Results */}
      {showComparison && (
        <View className="bg-white p-4 rounded-lg mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Comparison Results</Text>
          
          {/* Overall Accuracy */}
          <View className="bg-gray-50 p-4 rounded-lg mb-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-medium text-gray-900">AI Accuracy Score</Text>
              <View className="flex-row items-center">
                <Ionicons
                  name={calculateAccuracy() > 80 ? "checkmark-circle" : calculateAccuracy() > 60 ? "warning" : "alert-circle"}
                  size={20}
                  color={calculateAccuracy() > 80 ? "#10b981" : calculateAccuracy() > 60 ? "#f59e0b" : "#ef4444"}
                />
                <Text className={`text-lg font-bold ml-2 ${
                  calculateAccuracy() > 80 ? "text-green-600" : 
                  calculateAccuracy() > 60 ? "text-yellow-600" : "text-red-600"
                }`}>
                  {calculateAccuracy().toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Detailed Comparison */}
          <View className="space-y-3">
            {[
              { label: "Total Cost", ai: aiEstimate.estimatedCost, manual: manualEstimate.totalCost, variance: calculateVariance().totalCost },
              { label: "Materials", ai: aiEstimate.costBreakdown.materials, manual: manualEstimate.materials, variance: calculateVariance().materials },
              { label: "Labor", ai: aiEstimate.costBreakdown.labor, manual: manualEstimate.labor, variance: calculateVariance().labor },
              { label: "Equipment", ai: aiEstimate.costBreakdown.equipment, manual: manualEstimate.equipment, variance: calculateVariance().equipment },
              { label: "Overhead", ai: aiEstimate.costBreakdown.overhead, manual: manualEstimate.overhead, variance: calculateVariance().overhead },
              { label: "Timeline", ai: aiEstimate.timeline, manual: manualEstimate.timeline, variance: calculateVariance().timeline, unit: "days" },
            ].map((item, index) => (
              <View key={index} className="border-b border-gray-100 pb-3">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm font-medium text-gray-900">{item.label}</Text>
                  <View className="flex-row items-center">
                    <Ionicons
                      name={getVarianceIcon(item.variance)}
                      size={16}
                      color={item.variance < 5 ? "#10b981" : item.variance < 15 ? "#f59e0b" : "#ef4444"}
                    />
                    <Text className={`text-sm font-semibold ml-1 ${getVarianceColor(item.variance)}`}>
                      {item.variance > 0 ? "+" : ""}{item.variance.toFixed(1)}%
                    </Text>
                  </View>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-600">
                    AI: {item.unit === "days" ? item.ai : `$${item.ai.toLocaleString()}`} {item.unit || ""}
                  </Text>
                  <Text className="text-xs text-gray-600">
                    Manual: {item.unit === "days" ? item.manual : `$${item.manual.toLocaleString()}`} {item.unit || ""}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Insights */}
          <View className="mt-4 p-4 bg-blue-50 rounded-lg">
            <Text className="text-sm font-medium text-blue-900 mb-2">Insights</Text>
            <Text className="text-xs text-blue-700">
              {calculateAccuracy() > 90 ? "Excellent accuracy! The AI estimate closely matches your manual estimate." :
               calculateAccuracy() > 80 ? "Good accuracy. Minor differences may be due to different assumptions or market data." :
               calculateAccuracy() > 60 ? "Moderate accuracy. Consider reviewing the project specifications and market conditions." :
               "Significant differences detected. Review project details and consider updating AI training data."}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}