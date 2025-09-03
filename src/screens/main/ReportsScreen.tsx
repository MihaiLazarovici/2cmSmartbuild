import React from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../state/authStore";
import { useProjectStore } from "../../state/projectStore";
import { reportingService } from "../../services/reportingService";

export default function ReportsScreen() {
  const { user } = useAuthStore();
  const { getProjectsByUser, getEstimatesByProject, getRiskAssessmentsByProject } = useProjectStore();
  
  const userProjects = user ? getProjectsByUser(user.id) : [];

  const handleGenerateReport = async (reportType: "summary" | "cost" | "risk") => {
    if (userProjects.length === 0) {
      Alert.alert("No Projects", "You need to have at least one project to generate reports.");
      return;
    }

    try {
      // Use the first project for demo purposes
      const project = userProjects[0];
      const estimates = getEstimatesByProject(project.id);
      const riskAssessments = getRiskAssessmentsByProject(project.id);

      const reportData = {
        project,
        estimates,
        riskAssessments,
        generatedAt: new Date(),
      };

      await reportingService.generateAndShareProjectReport(reportData, reportType);
    } catch (error) {
      Alert.alert("Error", "Failed to generate report. Please try again.");
      console.error("Report generation failed:", error);
    }
  };

  const handleExportCSV = async () => {
    if (userProjects.length === 0) {
      Alert.alert("No Projects", "You need to have at least one project to export data.");
      return;
    }

    try {
      const project = userProjects[0];
      const estimates = getEstimatesByProject(project.id);
      const riskAssessments = getRiskAssessmentsByProject(project.id);

      const reportData = {
        project,
        estimates,
        riskAssessments,
        generatedAt: new Date(),
      };

      await reportingService.generateAndShareCSVExport(reportData);
    } catch (error) {
      Alert.alert("Error", "Failed to export data. Please try again.");
      console.error("CSV export failed:", error);
    }
  };
  const reportTypes = [
    {
      title: "Project Summary",
      description: "Overview of all projects with key metrics",
      icon: "document-text" as keyof typeof Ionicons.glyphMap,
      color: "bg-blue-600",
    },
    {
      title: "Cost Analysis",
      description: "Detailed cost breakdowns and budget comparisons",
      icon: "analytics" as keyof typeof Ionicons.glyphMap,
      color: "bg-green-600",
    },
    {
      title: "Timeline Performance",
      description: "Project timeline analysis and delays",
      icon: "time" as keyof typeof Ionicons.glyphMap,
      color: "bg-purple-600",
    },
    {
      title: "Risk Assessment",
      description: "Risk analysis across all projects",
      icon: "warning" as keyof typeof Ionicons.glyphMap,
      color: "bg-orange-600",
    },
    {
      title: "Resource Utilization",
      description: "Workforce and material usage reports",
      icon: "people" as keyof typeof Ionicons.glyphMap,
      color: "bg-indigo-600",
    },
    {
      title: "AI Accuracy Report",
      description: "AI estimation vs actual cost analysis",
      icon: "trending-up" as keyof typeof Ionicons.glyphMap,
      color: "bg-pink-600",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4 bg-white">
          <Text className="text-2xl font-bold text-gray-900 mb-2">Reports & Analytics</Text>
          <Text className="text-gray-600">
            Generate comprehensive reports and insights
          </Text>
        </View>

        {/* Quick Stats */}
        <View className="px-6 py-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</Text>
          <View className="flex-row justify-between mb-4">
            <View className="flex-1 bg-white p-4 rounded-lg mr-2">
              <Text className="text-2xl font-bold text-blue-600">12</Text>
              <Text className="text-sm text-gray-600">Total Projects</Text>
            </View>
            <View className="flex-1 bg-white p-4 rounded-lg mx-1">
              <Text className="text-2xl font-bold text-green-600">$2.4M</Text>
              <Text className="text-sm text-gray-600">Total Value</Text>
            </View>
            <View className="flex-1 bg-white p-4 rounded-lg ml-2">
              <Text className="text-2xl font-bold text-purple-600">94%</Text>
              <Text className="text-sm text-gray-600">AI Accuracy</Text>
            </View>
          </View>
        </View>

        {/* Report Types */}
        <View className="px-6 py-2">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Available Reports</Text>
          <View className="space-y-3">
            {reportTypes.map((report, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  if (report.title.includes("Summary")) handleGenerateReport("summary");
                  else if (report.title.includes("Cost")) handleGenerateReport("cost");
                  else if (report.title.includes("Risk")) handleGenerateReport("risk");
                  else handleGenerateReport("summary");
                }}
                className="bg-white p-4 rounded-lg flex-row items-center"
              >
                <View className={`w-12 h-12 ${report.color} rounded-full items-center justify-center mr-4`}>
                  <Ionicons name={report.icon} size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    {report.title}
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    {report.description}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Pressable className="bg-gray-100 p-2 rounded-lg mr-2">
                    <Ionicons name="download" size={16} color="#374151" />
                  </Pressable>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Export Options */}
        <View className="px-6 py-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Export Options</Text>
          <View className="bg-white p-4 rounded-lg">
            <Text className="text-base font-medium text-gray-900 mb-3">
              Export Format
            </Text>
            <View className="flex-row justify-between">
              <Pressable className="flex-1 bg-red-50 p-3 rounded-lg items-center mr-2">
                <Ionicons name="document" size={24} color="#dc2626" />
                <Text className="text-sm font-medium text-red-600 mt-1">PDF</Text>
              </Pressable>
              <Pressable 
                onPress={handleExportCSV}
                className="flex-1 bg-green-50 p-3 rounded-lg items-center mx-1"
              >
                <Ionicons name="grid" size={24} color="#16a34a" />
                <Text className="text-sm font-medium text-green-600 mt-1">Excel</Text>
              </Pressable>
              <Pressable className="flex-1 bg-blue-50 p-3 rounded-lg items-center ml-2">
                <Ionicons name="share" size={24} color="#2563eb" />
                <Text className="text-sm font-medium text-blue-600 mt-1">Share</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Recent Reports */}
        <View className="px-6 py-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</Text>
          <View className="space-y-3">
            <View className="bg-white p-4 rounded-lg">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    Q4 2024 Project Summary
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    Generated on Dec 15, 2024
                  </Text>
                </View>
                <Pressable className="bg-blue-100 p-2 rounded-lg">
                  <Ionicons name="download" size={16} color="#2563eb" />
                </Pressable>
              </View>
            </View>
            <View className="bg-white p-4 rounded-lg">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    Cost Analysis - Commercial Projects
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    Generated on Dec 10, 2024
                  </Text>
                </View>
                <Pressable className="bg-blue-100 p-2 rounded-lg">
                  <Ionicons name="download" size={16} color="#2563eb" />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}