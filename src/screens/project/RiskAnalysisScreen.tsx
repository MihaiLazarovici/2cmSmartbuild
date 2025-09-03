import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useProjectStore } from "../../state/projectStore";
import { Risk, RiskCategory } from "../../types/construction";
import { riskAnalysisService } from "../../services/riskAnalysisService";

export default function RiskAnalysisScreen({ route }: any) {
  const { projectId } = route.params;
  const { projects, getRiskAssessmentsByProject, addRiskAssessment } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState<any>(null);
  
  const project = projects.find(p => p.id === projectId);
  const existingAssessments = getRiskAssessmentsByProject(projectId);
  const latestAssessment = existingAssessments.length > 0 ? existingAssessments[existingAssessments.length - 1] : null;

  useEffect(() => {
    if (latestAssessment) {
      setRiskAssessment(latestAssessment);
    }
  }, [latestAssessment]);

  const generateRiskAssessment = async () => {
    if (!project) return;

    setIsLoading(true);
    
    try {
      // Use AI risk analysis service
      const assessmentData = await riskAnalysisService.generateRiskAssessment(project);
      
      const assessmentId = addRiskAssessment(assessmentData);
      setRiskAssessment({ 
        ...assessmentData, 
        id: assessmentId, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      });
    } catch (error) {
      console.error("Risk assessment generation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskCategoryIcon = (category: RiskCategory): keyof typeof Ionicons.glyphMap => {
    switch (category) {
      case "weather":
        return "cloud-outline";
      case "supply_chain":
        return "cube-outline";
      case "workforce":
        return "people-outline";
      case "regulatory":
        return "document-text-outline";
      case "financial":
        return "card-outline";
      case "technical":
        return "construct-outline";
      case "safety":
        return "shield-outline";
      case "environmental":
        return "leaf-outline";
      default:
        return "alert-circle-outline";
    }
  };

  const getRiskCategoryColor = (category: RiskCategory) => {
    switch (category) {
      case "weather":
        return "bg-blue-100 text-blue-800";
      case "supply_chain":
        return "bg-orange-100 text-orange-800";
      case "workforce":
        return "bg-purple-100 text-purple-800";
      case "regulatory":
        return "bg-gray-100 text-gray-800";
      case "financial":
        return "bg-red-100 text-red-800";
      case "technical":
        return "bg-green-100 text-green-800";
      case "safety":
        return "bg-yellow-100 text-yellow-800";
      case "environmental":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score < 20) return "text-green-600";
    if (score < 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getOverallRiskColor = (score: number) => {
    if (score < 20) return "bg-green-100 text-green-800";
    if (score < 40) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (!project) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Ionicons name="alert-circle-outline" size={64} color="#9ca3af" />
        <Text className="text-lg font-semibold text-gray-900 mt-4">Project Not Found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4 bg-white">
          <Text className="text-2xl font-bold text-gray-900 mb-2">Risk Analysis</Text>
          <Text className="text-gray-600">{project.name}</Text>
        </View>

        {!riskAssessment ? (
          <View className="px-6 py-8 items-center">
            <View className="w-20 h-20 bg-orange-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="warning" size={40} color="#f59e0b" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-2">AI Risk Assessment</Text>
            <Text className="text-gray-600 text-center mb-6">
              Generate a comprehensive risk analysis for your project using AI-powered insights
            </Text>
            <Pressable
              onPress={generateRiskAssessment}
              disabled={isLoading}
              className="bg-orange-600 px-6 py-3 rounded-lg items-center"
            >
              {isLoading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white font-semibold ml-2">Analyzing Risks...</Text>
                </View>
              ) : (
                <Text className="text-white font-semibold">Generate Risk Assessment</Text>
              )}
            </Pressable>
          </View>
        ) : (
          <View className="px-6 py-4">
            {/* Overall Risk Score */}
            <View className="bg-white p-6 rounded-lg mb-4">
              <View className="items-center">
                <Text className="text-lg font-semibold text-gray-900 mb-2">Overall Risk Score</Text>
                <View className={`px-4 py-2 rounded-full ${getOverallRiskColor(riskAssessment.overallRiskScore)}`}>
                  <Text className="text-2xl font-bold">
                    {riskAssessment.overallRiskScore}/100
                  </Text>
                </View>
                <Text className="text-sm text-gray-600 mt-2">
                  {riskAssessment.overallRiskScore < 20 ? "Low Risk" :
                   riskAssessment.overallRiskScore < 40 ? "Moderate Risk" : "High Risk"}
                </Text>
              </View>
            </View>

            {/* Risk Categories */}
            <View className="mb-4">
              <Text className="text-lg font-semibold text-gray-900 mb-3">Identified Risks</Text>
              <View className="space-y-3">
                {riskAssessment.risks.map((risk: Risk) => (
                  <View key={risk.id} className="bg-white p-4 rounded-lg">
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-row items-center flex-1">
                        <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                          <Ionicons
                            name={getRiskCategoryIcon(risk.category)}
                            size={20}
                            color="#6b7280"
                          />
                        </View>
                        <View className="flex-1">
                          <View className={`px-2 py-1 rounded-full self-start mb-1 ${getRiskCategoryColor(risk.category)}`}>
                            <Text className="text-xs font-medium">
                              {risk.category.replace("_", " ").toUpperCase()}
                            </Text>
                          </View>
                          <Text className="text-sm font-medium text-gray-900">
                            {risk.description}
                          </Text>
                        </View>
                      </View>
                      <Text className={`text-lg font-bold ${getRiskScoreColor(risk.riskScore)}`}>
                        {risk.riskScore}
                      </Text>
                    </View>

                    <View className="flex-row justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-xs text-gray-500">Probability</Text>
                        <View className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <View 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${risk.probability}%` }}
                          />
                        </View>
                        <Text className="text-xs text-gray-600 mt-1">{risk.probability}%</Text>
                      </View>
                      <View className="w-4" />
                      <View className="flex-1">
                        <Text className="text-xs text-gray-500">Impact</Text>
                        <View className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <View 
                            className="bg-red-600 h-2 rounded-full"
                            style={{ width: `${risk.impact}%` }}
                          />
                        </View>
                        <Text className="text-xs text-gray-600 mt-1">{risk.impact}%</Text>
                      </View>
                    </View>

                    <View className="border-t border-gray-100 pt-3">
                      <Text className="text-xs font-medium text-gray-700 mb-1">Mitigation Strategy:</Text>
                      <Text className="text-xs text-gray-600">{risk.mitigation}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Recommendations */}
            <View className="mb-4">
              <Text className="text-lg font-semibold text-gray-900 mb-3">AI Recommendations</Text>
              <View className="bg-white p-4 rounded-lg">
                {riskAssessment.recommendations.map((recommendation: string, index: number) => (
                  <View key={index} className="flex-row items-start mb-3 last:mb-0">
                    <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mr-3 mt-0.5">
                      <Text className="text-xs font-bold text-blue-600">{index + 1}</Text>
                    </View>
                    <Text className="text-sm text-gray-700 flex-1">{recommendation}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Actions */}
            <View className="flex-row space-x-3 mb-8">
              <Pressable
                onPress={generateRiskAssessment}
                className="flex-1 bg-orange-600 p-3 rounded-lg items-center"
              >
                <Text className="text-white font-semibold">Update Assessment</Text>
              </Pressable>
              <Pressable className="flex-1 bg-blue-600 p-3 rounded-lg items-center">
                <Text className="text-white font-semibold">Export Report</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}