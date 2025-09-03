import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ProjectType, AIEstimationRequest, AIEstimationResponse } from "../../types/construction";
import { aiEstimationService } from "../../services/aiEstimationService";
import CostBreakdownChart from "../../components/charts/CostBreakdownChart";
import EstimateComparisonTool from "../../components/comparison/EstimateComparisonTool";

export default function EstimationScreen() {
  const [formData, setFormData] = useState<AIEstimationRequest>({
    projectType: "residential_new",
    size: 0,
    location: "",
    specifications: "",
    timeline: "",
    specialRequirements: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [estimation, setEstimation] = useState<AIEstimationResponse | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const projectTypes: { value: ProjectType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: "residential_new", label: "New Residential", icon: "home" },
    { value: "residential_renovation", label: "Residential Renovation", icon: "hammer" },
    { value: "commercial_new", label: "New Commercial", icon: "business" },
    { value: "commercial_renovation", label: "Commercial Renovation", icon: "storefront" },
    { value: "infrastructure", label: "Infrastructure", icon: "construct" },
    { value: "industrial", label: "Industrial", icon: "build" },
  ];

  const handleEstimate = async () => {
    if (!formData.size || !formData.location || !formData.specifications) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    
    try {
      // Use AI estimation service
      const estimationResult = await aiEstimationService.generateEstimation(formData);
      setEstimation(estimationResult);
    } catch (error) {
      Alert.alert("Error", "Failed to generate estimation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4 bg-white">
          <Text className="text-2xl font-bold text-gray-900 mb-2">AI Estimation</Text>
          <Text className="text-gray-600">
            Get instant cost and timeline estimates powered by AI
          </Text>
        </View>

        {!estimation ? (
          <View className="px-6 py-4">
            {/* Project Type Selection */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">Project Type</Text>
              <View className="flex-row flex-wrap">
                {projectTypes.map((type) => (
                  <Pressable
                    key={type.value}
                    onPress={() => setFormData(prev => ({ ...prev, projectType: type.value }))}
                    className={`w-[48%] p-4 rounded-lg border-2 items-center mb-3 mr-2 ${
                      formData.projectType === type.value
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <Ionicons
                      name={type.icon}
                      size={24}
                      color={formData.projectType === type.value ? "#2563eb" : "#6b7280"}
                    />
                    <Text
                      className={`text-sm font-medium mt-2 text-center ${
                        formData.projectType === type.value ? "text-blue-600" : "text-gray-600"
                      }`}
                    >
                      {type.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Form Fields */}
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Project Size (sq ft) *</Text>
                <TextInput
                  value={formData.size.toString()}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, size: parseInt(text) || 0 }))}
                  placeholder="Enter project size in square feet"
                  keyboardType="numeric"
                  className="w-full p-4 border border-gray-300 rounded-lg bg-white"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Location *</Text>
                <TextInput
                  value={formData.location}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                  placeholder="Enter project location (city, state)"
                  className="w-full p-4 border border-gray-300 rounded-lg bg-white"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Project Specifications *</Text>
                <TextInput
                  value={formData.specifications}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, specifications: text }))}
                  placeholder="Describe the project scope, materials, and requirements"
                  multiline
                  numberOfLines={4}
                  className="w-full p-4 border border-gray-300 rounded-lg bg-white"
                  style={{ textAlignVertical: "top" }}
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Desired Timeline</Text>
                <TextInput
                  value={formData.timeline}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, timeline: text }))}
                  placeholder="Enter desired completion timeline"
                  className="w-full p-4 border border-gray-300 rounded-lg bg-white"
                />
              </View>

              <Pressable
                onPress={handleEstimate}
                disabled={isLoading}
                className="w-full bg-blue-600 p-4 rounded-lg items-center mt-6"
              >
                {isLoading ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator color="white" size="small" />
                    <Text className="text-white font-semibold text-lg ml-2">
                      Generating Estimate...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white font-semibold text-lg">Generate AI Estimate</Text>
                )}
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="px-6 py-4">
            {/* Estimation Results */}
            <View className="bg-white p-6 rounded-lg mb-4">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-gray-900">Estimation Results</Text>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text className="text-sm font-medium text-green-600 ml-1">
                    {estimation.confidence}% Confidence
                  </Text>
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-3xl font-bold text-blue-600 mb-1">
                  ${estimation.estimatedCost.toLocaleString()}
                </Text>
                <Text className="text-gray-600">Estimated Total Cost</Text>
              </View>

              <View className="mb-6">
                <Text className="text-xl font-bold text-gray-900 mb-1">
                  {estimation.timeline} days
                </Text>
                <Text className="text-gray-600">Estimated Timeline</Text>
              </View>

              {/* Cost Breakdown Chart */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-3">Cost Breakdown</Text>
                <CostBreakdownChart data={estimation.costBreakdown} />
              </View>

              {/* Assumptions */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-3">Key Assumptions</Text>
                {estimation.assumptions.map((assumption: string, index: number) => (
                  <View key={index} className="flex-row items-start mb-2">
                    <Ionicons name="ellipse" size={6} color="#6b7280" className="mt-2 mr-2" />
                    <Text className="text-gray-600 flex-1">{assumption}</Text>
                  </View>
                ))}
              </View>

              {/* Actions */}
              <View className="flex-row space-x-2 mb-4">
                <Pressable
                  onPress={() => setEstimation(null)}
                  className="flex-1 bg-gray-100 p-3 rounded-lg items-center"
                >
                  <Text className="text-gray-700 font-semibold">New Estimate</Text>
                </Pressable>
                <Pressable 
                  onPress={() => setShowComparison(!showComparison)}
                  className="flex-1 bg-purple-600 p-3 rounded-lg items-center"
                >
                  <Text className="text-white font-semibold">Compare</Text>
                </Pressable>
                <Pressable className="flex-1 bg-blue-600 p-3 rounded-lg items-center">
                  <Text className="text-white font-semibold">Create Project</Text>
                </Pressable>
              </View>

              {/* Comparison Tool */}
              {showComparison && (
                <View className="mb-4">
                  <Text className="text-lg font-semibold text-gray-900 mb-3">AI vs Manual Comparison</Text>
                  <EstimateComparisonTool 
                    aiEstimate={estimation}
                    onComparisonComplete={(comparison) => {
                      console.log("Comparison completed:", comparison);
                    }}
                  />
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}