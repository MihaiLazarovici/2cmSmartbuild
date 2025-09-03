import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../state/authStore";
import { useProjectStore } from "../../state/projectStore";
import { sampleDataService } from "../../services/sampleDataService";

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { getProjectsByUser } = useProjectStore();
  
  const userProjects = user ? getProjectsByUser(user.id) : [];
  const activeProjects = userProjects.filter(p => p.status === "in_progress");
  const completedProjects = userProjects.filter(p => p.status === "completed");
  
  const totalBudget = userProjects.reduce((sum, p) => sum + p.budget, 0);
  const totalEstimatedCost = userProjects.reduce((sum, p) => sum + p.estimatedCost, 0);

  const quickActions = [
    {
      title: "New Project",
      subtitle: "Start AI estimation",
      icon: "add-circle" as keyof typeof Ionicons.glyphMap,
      color: "bg-blue-600",
      onPress: () => navigation.navigate("CreateProject"),
    },
    {
      title: "AI Estimation",
      subtitle: "Quick cost analysis",
      icon: "calculator" as keyof typeof Ionicons.glyphMap,
      color: "bg-green-600",
      onPress: () => navigation.navigate("Estimation"),
    },
    {
      title: "View Reports",
      subtitle: "Analytics & insights",
      icon: "bar-chart" as keyof typeof Ionicons.glyphMap,
      color: "bg-purple-600",
      onPress: () => navigation.navigate("Reports"),
    },
    {
      title: "Risk Analysis",
      subtitle: "Project assessments",
      icon: "warning" as keyof typeof Ionicons.glyphMap,
      color: "bg-orange-600",
      onPress: () => {
        if (userProjects.length > 0) {
          navigation.navigate("RiskAnalysis", { projectId: userProjects[0].id });
        }
      },
    },
  ];

  const recentProjects = userProjects.slice(0, 3);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Welcome Header */}
        <View className="px-6 py-4 bg-white">
          <Text className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0]}!
          </Text>
          <Text className="text-gray-600 mt-1">
            {user?.role === "engineer" && "Engineering excellence starts here"}
            {user?.role === "contractor" && "Build smarter, not harder"}
            {user?.role === "project_manager" && "Manage projects with AI precision"}
          </Text>
        </View>

        {/* Stats Overview */}
        <View className="px-6 py-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Project Overview</Text>
          <View className="flex-row justify-between">
            <View className="flex-1 bg-white p-4 rounded-lg mr-2">
              <Text className="text-2xl font-bold text-blue-600">{userProjects.length}</Text>
              <Text className="text-sm text-gray-600">Total Projects</Text>
            </View>
            <View className="flex-1 bg-white p-4 rounded-lg mx-1">
              <Text className="text-2xl font-bold text-green-600">{activeProjects.length}</Text>
              <Text className="text-sm text-gray-600">Active</Text>
            </View>
            <View className="flex-1 bg-white p-4 rounded-lg ml-2">
              <Text className="text-2xl font-bold text-purple-600">{completedProjects.length}</Text>
              <Text className="text-sm text-gray-600">Completed</Text>
            </View>
          </View>
        </View>

        {/* Budget Overview */}
        <View className="px-6 py-2">
          <View className="bg-white p-4 rounded-lg">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Budget Overview</Text>
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-sm text-gray-600">Total Budget</Text>
                <Text className="text-xl font-bold text-gray-900">
                  ${totalBudget.toLocaleString()}
                </Text>
              </View>
              <View>
                <Text className="text-sm text-gray-600">Estimated Cost</Text>
                <Text className="text-xl font-bold text-orange-600">
                  ${totalEstimatedCost.toLocaleString()}
                </Text>
              </View>
            </View>
            {totalBudget > 0 && (
              <View className="mt-3">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-xs text-gray-500">Budget Utilization</Text>
                  <Text className="text-xs text-gray-500">
                    {((totalEstimatedCost / totalBudget) * 100).toFixed(1)}%
                  </Text>
                </View>
                <View className="w-full bg-gray-200 rounded-full h-2">
                  <View 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ 
                      width: `${Math.min((totalEstimatedCost / totalBudget) * 100, 100)}%` 
                    }}
                  />
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 py-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</Text>
          <View className="flex-row flex-wrap justify-between">
            {quickActions.map((action, index) => (
              <Pressable
                key={index}
                onPress={action.onPress}
                className="w-[48%] bg-white p-4 rounded-lg mb-3 items-center"
              >
                <View className={`w-12 h-12 ${action.color} rounded-full items-center justify-center mb-3`}>
                  <Ionicons name={action.icon} size={24} color="white" />
                </View>
                <Text className="text-sm font-semibold text-gray-900 text-center">
                  {action.title}
                </Text>
                <Text className="text-xs text-gray-600 text-center mt-1">
                  {action.subtitle}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <View className="px-6 py-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-900">Recent Projects</Text>
              <Pressable onPress={() => navigation.navigate("Projects")}>
                <Text className="text-blue-600 font-medium">View All</Text>
              </Pressable>
            </View>
            {recentProjects.map((project) => (
              <Pressable
                key={project.id}
                onPress={() => navigation.navigate("ProjectDetails", { projectId: project.id })}
                className="bg-white p-4 rounded-lg mb-3"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {project.name}
                    </Text>
                    <Text className="text-sm text-gray-600 mt-1">
                      {project.location}
                    </Text>
                    <View className="flex-row items-center mt-2">
                      <View className={`px-2 py-1 rounded-full ${
                        project.status === "in_progress" ? "bg-green-100" :
                        project.status === "completed" ? "bg-blue-100" :
                        project.status === "planning" ? "bg-yellow-100" : "bg-gray-100"
                      }`}>
                        <Text className={`text-xs font-medium ${
                          project.status === "in_progress" ? "text-green-800" :
                          project.status === "completed" ? "text-blue-800" :
                          project.status === "planning" ? "text-yellow-800" : "text-gray-800"
                        }`}>
                          {project.status.replace("_", " ").toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-semibold text-gray-900">
                      ${project.estimatedCost.toLocaleString()}
                    </Text>
                    <Text className="text-xs text-gray-500">Estimated</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Empty State */}
        {userProjects.length === 0 && (
          <View className="px-6 py-8 items-center">
            <Ionicons name="folder-open-outline" size={64} color="#9ca3af" />
            <Text className="text-lg font-semibold text-gray-900 mt-4">No Projects Yet</Text>
            <Text className="text-gray-600 text-center mt-2 mb-6">
              Create your first project to get started with AI-powered construction planning
            </Text>
            <View className="flex-row space-x-3">
              <Pressable
                onPress={() => navigation.navigate("CreateProject")}
                className="bg-blue-600 px-6 py-3 rounded-lg"
              >
                <Text className="text-white font-semibold">Create Project</Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  if (user) {
                    await sampleDataService.initializeSampleData(user.id);
                  }
                }}
                className="bg-green-600 px-6 py-3 rounded-lg"
              >
                <Text className="text-white font-semibold">Load Sample Data</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}