import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useProjectStore } from "../../state/projectStore";

export default function ProjectDetailsScreen({ route, navigation }: any) {
  const { projectId } = route.params;
  const { projects, getEstimatesByProject, getRiskAssessmentsByProject } = useProjectStore();
  
  const project = projects.find(p => p.id === projectId);
  const estimates = getEstimatesByProject(projectId);
  const riskAssessments = getRiskAssessmentsByProject(projectId);
  
  if (!project) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Ionicons name="alert-circle-outline" size={64} color="#9ca3af" />
        <Text className="text-lg font-semibold text-gray-900 mt-4">Project Not Found</Text>
        <Text className="text-gray-600 mt-2">The requested project could not be found.</Text>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "on_hold":
        return "bg-orange-100 text-orange-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const latestEstimate = estimates.length > 0 ? estimates[estimates.length - 1] : null;
  const latestRiskAssessment = riskAssessments.length > 0 ? riskAssessments[riskAssessments.length - 1] : null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Project Header */}
        <View className="px-6 py-4 bg-white">
          <Text className="text-2xl font-bold text-gray-900 mb-2">{project.name}</Text>
          <Text className="text-gray-600 mb-3">{project.description}</Text>
          <View className="flex-row items-center justify-between">
            <View className={`px-3 py-1 rounded-full ${getStatusColor(project.status)}`}>
              <Text className="text-sm font-medium">
                {project.status.replace("_", " ").toUpperCase()}
              </Text>
            </View>
            <Text className="text-sm text-gray-500">
              {project.type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 py-4">
          <View className="flex-row justify-between">
            <Pressable
              onPress={() => navigation.navigate("RiskAnalysis", { projectId })}
              className="flex-1 bg-white p-4 rounded-lg mr-2 items-center"
            >
              <Ionicons name="warning" size={24} color="#f59e0b" />
              <Text className="text-sm font-medium text-gray-900 mt-2">Risk Analysis</Text>
            </Pressable>
            <Pressable className="flex-1 bg-white p-4 rounded-lg mx-1 items-center">
              <Ionicons name="calculator" size={24} color="#3b82f6" />
              <Text className="text-sm font-medium text-gray-900 mt-2">New Estimate</Text>
            </Pressable>
            <Pressable className="flex-1 bg-white p-4 rounded-lg ml-2 items-center">
              <Ionicons name="document-text" size={24} color="#10b981" />
              <Text className="text-sm font-medium text-gray-900 mt-2">Generate Report</Text>
            </Pressable>
          </View>
        </View>

        {/* Project Details */}
        <View className="px-6 py-2">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Project Information</Text>
          <View className="bg-white p-4 rounded-lg">
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Location</Text>
                <Text className="text-gray-900 font-medium">{project.location}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Start Date</Text>
                <Text className="text-gray-900 font-medium">
                  {project.startDate.toLocaleDateString()}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Estimated End Date</Text>
                <Text className="text-gray-900 font-medium">
                  {project.estimatedEndDate.toLocaleDateString()}
                </Text>
              </View>
              {project.actualEndDate && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Actual End Date</Text>
                  <Text className="text-gray-900 font-medium">
                    {project.actualEndDate.toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Budget Overview */}
        <View className="px-6 py-2">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Budget Overview</Text>
          <View className="bg-white p-4 rounded-lg">
            <View className="space-y-4">
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-sm text-gray-600">Total Budget</Text>
                  <Text className="text-xl font-bold text-gray-900">
                    ${project.budget.toLocaleString()}
                  </Text>
                </View>
                <View>
                  <Text className="text-sm text-gray-600">Estimated Cost</Text>
                  <Text className="text-xl font-bold text-orange-600">
                    ${project.estimatedCost.toLocaleString()}
                  </Text>
                </View>
              </View>
              
              {project.actualCost > 0 && (
                <View>
                  <Text className="text-sm text-gray-600">Actual Cost</Text>
                  <Text className="text-xl font-bold text-red-600">
                    ${project.actualCost.toLocaleString()}
                  </Text>
                </View>
              )}

              <View className="mt-3">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-xs text-gray-500">Budget Utilization</Text>
                  <Text className="text-xs text-gray-500">
                    {((project.estimatedCost / project.budget) * 100).toFixed(1)}%
                  </Text>
                </View>
                <View className="w-full bg-gray-200 rounded-full h-2">
                  <View 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ 
                      width: `${Math.min((project.estimatedCost / project.budget) * 100, 100)}%` 
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Latest Estimate */}
        {latestEstimate && (
          <View className="px-6 py-2">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Latest Estimate</Text>
            <View className="bg-white p-4 rounded-lg">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-base font-medium text-gray-900">
                  ${latestEstimate.totalCost.toLocaleString()}
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text className="text-sm text-green-600 ml-1">
                    {latestEstimate.confidence}% Confidence
                  </Text>
                </View>
              </View>
              <Text className="text-sm text-gray-600">
                Method: {latestEstimate.method.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
              <Text className="text-sm text-gray-600">
                Created: {latestEstimate.createdAt.toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}

        {/* Risk Assessment */}
        {latestRiskAssessment && (
          <View className="px-6 py-2">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Risk Assessment</Text>
            <View className="bg-white p-4 rounded-lg">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-base font-medium text-gray-900">
                  Overall Risk Score
                </Text>
                <View className={`px-3 py-1 rounded-full ${
                  latestRiskAssessment.overallRiskScore < 30 ? "bg-green-100" :
                  latestRiskAssessment.overallRiskScore < 70 ? "bg-yellow-100" : "bg-red-100"
                }`}>
                  <Text className={`text-sm font-medium ${
                    latestRiskAssessment.overallRiskScore < 30 ? "text-green-800" :
                    latestRiskAssessment.overallRiskScore < 70 ? "text-yellow-800" : "text-red-800"
                  }`}>
                    {latestRiskAssessment.overallRiskScore}/100
                  </Text>
                </View>
              </View>
              <Text className="text-sm text-gray-600">
                {latestRiskAssessment.risks.length} risks identified
              </Text>
              <Text className="text-sm text-gray-600">
                Updated: {latestRiskAssessment.updatedAt.toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}

        {/* Timeline */}
        <View className="px-6 py-2 pb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Project Timeline</Text>
          <View className="bg-white p-4 rounded-lg">
            <View className="space-y-3">
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-blue-600 rounded-full mr-3" />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-900">Project Created</Text>
                  <Text className="text-xs text-gray-500">
                    {project.createdAt.toLocaleDateString()}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-green-600 rounded-full mr-3" />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-900">Construction Start</Text>
                  <Text className="text-xs text-gray-500">
                    {project.startDate.toLocaleDateString()}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-gray-300 rounded-full mr-3" />
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-900">Estimated Completion</Text>
                  <Text className="text-xs text-gray-500">
                    {project.estimatedEndDate.toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}