import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../state/authStore";
import { useProjectStore } from "../../state/projectStore";
import { ProjectType, ProjectStatus } from "../../types/construction";

export default function CreateProjectScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { createProject } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    budget: "",
    startDate: new Date(),
    estimatedDuration: "90", // days
  });
  
  const [selectedType, setSelectedType] = useState<ProjectType>("residential_new");

  const projectTypes: { value: ProjectType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: "residential_new", label: "New Residential", icon: "home" },
    { value: "residential_renovation", label: "Residential Renovation", icon: "hammer" },
    { value: "commercial_new", label: "New Commercial", icon: "business" },
    { value: "commercial_renovation", label: "Commercial Renovation", icon: "storefront" },
    { value: "infrastructure", label: "Infrastructure", icon: "construct" },
    { value: "industrial", label: "Industrial", icon: "build" },
  ];

  const handleCreateProject = async () => {
    if (!formData.name || !formData.location || !formData.budget) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!user) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    const budget = parseFloat(formData.budget);
    if (isNaN(budget) || budget <= 0) {
      Alert.alert("Error", "Please enter a valid budget amount");
      return;
    }

    setIsLoading(true);

    try {
      const estimatedEndDate = new Date(formData.startDate);
      estimatedEndDate.setDate(estimatedEndDate.getDate() + parseInt(formData.estimatedDuration));

      const projectId = createProject({
        name: formData.name,
        description: formData.description,
        type: selectedType,
        location: formData.location,
        startDate: formData.startDate,
        estimatedEndDate,
        status: "planning" as ProjectStatus,
        budget,
        estimatedCost: budget * 0.85, // Initial estimate at 85% of budget
        actualCost: 0,
        ownerId: user.id,
      });

      Alert.alert(
        "Success",
        "Project created successfully!",
        [
          {
            text: "View Project",
            onPress: () => {
              navigation.replace("ProjectDetails", { projectId });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to create project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const adjustDate = (days: number) => {
    const newDate = new Date(formData.startDate);
    newDate.setDate(newDate.getDate() + days);
    setFormData(prev => ({ ...prev, startDate: newDate }));
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4 bg-white">
          <Text className="text-2xl font-bold text-gray-900 mb-2">Create New Project</Text>
          <Text className="text-gray-600">
            Set up your construction project for AI-powered planning
          </Text>
        </View>

        <View className="px-6 py-4">
          {/* Project Type Selection */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Project Type *</Text>
            <View className="flex-row flex-wrap">
              {projectTypes.map((type) => (
                <Pressable
                  key={type.value}
                  onPress={() => setSelectedType(type.value)}
                  className={`w-[48%] p-4 rounded-lg border-2 items-center mb-3 mr-2 ${
                    selectedType === type.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <Ionicons
                    name={type.icon}
                    size={24}
                    color={selectedType === type.value ? "#2563eb" : "#6b7280"}
                  />
                  <Text
                    className={`text-sm font-medium mt-2 text-center ${
                      selectedType === type.value ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Basic Information */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Basic Information</Text>
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Project Name *</Text>
                <TextInput
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="Enter project name"
                  className="w-full p-4 border border-gray-300 rounded-lg bg-white"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Description</Text>
                <TextInput
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  placeholder="Describe the project scope and objectives"
                  multiline
                  numberOfLines={3}
                  className="w-full p-4 border border-gray-300 rounded-lg bg-white"
                  style={{ textAlignVertical: "top" }}
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
                <Text className="text-sm font-medium text-gray-700 mb-2">Budget *</Text>
                <View className="relative">
                  <TextInput
                    value={formData.budget}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, budget: text }))}
                    placeholder="Enter total project budget"
                    keyboardType="numeric"
                    className="w-full p-4 pl-8 border border-gray-300 rounded-lg bg-white"
                  />
                  <Text className="absolute left-4 top-4 text-gray-500">$</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Timeline */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Timeline</Text>
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Start Date</Text>
                <View className="bg-white p-4 border border-gray-300 rounded-lg">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-base text-gray-900">{formatDate(formData.startDate)}</Text>
                    <View className="flex-row">
                      <Pressable
                        onPress={() => adjustDate(-1)}
                        className="bg-gray-100 p-2 rounded-lg mr-2"
                      >
                        <Ionicons name="remove" size={16} color="#374151" />
                      </Pressable>
                      <Pressable
                        onPress={() => adjustDate(1)}
                        className="bg-gray-100 p-2 rounded-lg"
                      >
                        <Ionicons name="add" size={16} color="#374151" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Estimated Duration (days)</Text>
                <TextInput
                  value={formData.estimatedDuration}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, estimatedDuration: text }))}
                  placeholder="Enter estimated duration in days"
                  keyboardType="numeric"
                  className="w-full p-4 border border-gray-300 rounded-lg bg-white"
                />
              </View>

              <View className="bg-blue-50 p-4 rounded-lg">
                <Text className="text-sm font-medium text-blue-900 mb-1">Estimated Completion</Text>
                <Text className="text-base text-blue-800">
                  {(() => {
                    const endDate = new Date(formData.startDate);
                    endDate.setDate(endDate.getDate() + parseInt(formData.estimatedDuration || "0"));
                    return formatDate(endDate);
                  })()}
                </Text>
              </View>
            </View>
          </View>

          {/* AI Estimation Preview */}
          <View className="mb-6">
            <View className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <View className="flex-row items-center mb-2">
                <Ionicons name="sparkles" size={20} color="#3b82f6" />
                <Text className="text-base font-semibold text-blue-900 ml-2">AI Estimation Preview</Text>
              </View>
              <Text className="text-sm text-blue-800 mb-3">
                Once created, our AI will analyze your project and provide detailed cost estimates, timeline predictions, and risk assessments.
              </Text>
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-xs text-blue-600">Estimated Accuracy</Text>
                  <Text className="text-sm font-bold text-blue-900">94%</Text>
                </View>
                <View>
                  <Text className="text-xs text-blue-600">Analysis Time</Text>
                  <Text className="text-sm font-bold text-blue-900">~30 seconds</Text>
                </View>
                <View>
                  <Text className="text-xs text-blue-600">Risk Factors</Text>
                  <Text className="text-sm font-bold text-blue-900">12+ analyzed</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Create Button */}
          <Pressable
            onPress={handleCreateProject}
            disabled={isLoading}
            className="w-full bg-blue-600 p-4 rounded-lg items-center mb-8"
          >
            {isLoading ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-semibold text-lg ml-2">Creating Project...</Text>
              </View>
            ) : (
              <Text className="text-white font-semibold text-lg">Create Project</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}