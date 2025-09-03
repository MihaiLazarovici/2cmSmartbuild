import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../state/authStore";
import { useProjectStore } from "../../state/projectStore";
import { ProjectStatus, ProjectType } from "../../types/construction";

export default function ProjectsScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { getProjectsByUser } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | "all">("all");
  
  const userProjects = user ? getProjectsByUser(user.id) : [];
  
  const filteredProjects = userProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusFilters: { value: ProjectStatus | "all"; label: string; color: string }[] = [
    { value: "all", label: "All", color: "bg-gray-100 text-gray-800" },
    { value: "planning", label: "Planning", color: "bg-yellow-100 text-yellow-800" },
    { value: "in_progress", label: "Active", color: "bg-green-100 text-green-800" },
    { value: "completed", label: "Completed", color: "bg-blue-100 text-blue-800" },
    { value: "on_hold", label: "On Hold", color: "bg-orange-100 text-orange-800" },
  ];

  const getProjectTypeIcon = (type: ProjectType): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case "residential_new":
      case "residential_renovation":
        return "home";
      case "commercial_new":
      case "commercial_renovation":
        return "business";
      case "infrastructure":
        return "construct";
      case "industrial":
        return "build";
      default:
        return "folder";
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 py-4 bg-white">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-900">My Projects</Text>
          <Pressable
            onPress={() => navigation.navigate("CreateProject")}
            className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-semibold ml-1">New</Text>
          </Pressable>
        </View>

        {/* Search */}
        <View className="relative mb-4">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search projects..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg bg-white"
          />
          <Ionicons
            name="search"
            size={20}
            color="#6b7280"
            className="absolute left-3 top-3"
          />
        </View>

        {/* Status Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <View className="flex-row space-x-2">
            {statusFilters.map((filter) => (
              <Pressable
                key={filter.value}
                onPress={() => setFilterStatus(filter.value)}
                className={`px-3 py-2 rounded-full ${
                  filterStatus === filter.value
                    ? "bg-blue-600"
                    : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    filterStatus === filter.value
                      ? "text-white"
                      : "text-gray-700"
                  }`}
                >
                  {filter.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Projects List */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {filteredProjects.length > 0 ? (
          <View className="py-4">
            {filteredProjects.map((project) => (
              <Pressable
                key={project.id}
                onPress={() => navigation.navigate("ProjectDetails", { projectId: project.id })}
                className="bg-white p-4 rounded-lg mb-4 shadow-sm"
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                        <Ionicons
                          name={getProjectTypeIcon(project.type)}
                          size={20}
                          color="#2563eb"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-gray-900">
                          {project.name}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {project.location}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between mt-3">
                      <View className={`px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                        <Text className="text-xs font-medium">
                          {project.status.replace("_", " ").toUpperCase()}
                        </Text>
                      </View>
                      <Text className="text-sm text-gray-500">
                        {project.type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </View>

                    <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-100">
                      <View>
                        <Text className="text-xs text-gray-500">Budget</Text>
                        <Text className="text-sm font-semibold text-gray-900">
                          ${project.budget.toLocaleString()}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-xs text-gray-500">Estimated Cost</Text>
                        <Text className="text-sm font-semibold text-orange-600">
                          ${project.estimatedCost.toLocaleString()}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-xs text-gray-500">Start Date</Text>
                        <Text className="text-sm font-semibold text-gray-900">
                          {project.startDate.toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-16">
            <Ionicons name="folder-open-outline" size={64} color="#9ca3af" />
            <Text className="text-lg font-semibold text-gray-900 mt-4">
              {searchQuery || filterStatus !== "all" ? "No Projects Found" : "No Projects Yet"}
            </Text>
            <Text className="text-gray-600 text-center mt-2 mb-6">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first project to get started"}
            </Text>
            {!searchQuery && filterStatus === "all" && (
              <Pressable
                onPress={() => navigation.navigate("CreateProject")}
                className="bg-blue-600 px-6 py-3 rounded-lg"
              >
                <Text className="text-white font-semibold">Create Project</Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}