import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../state/authStore";

// Auth Screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

// Main App Screens
import DashboardScreen from "../screens/main/DashboardScreen";
import ProjectsScreen from "../screens/main/ProjectsScreen";
import EstimationScreen from "../screens/main/EstimationScreen";
import ReportsScreen from "../screens/main/ReportsScreen";
import ProfileScreen from "../screens/main/ProfileScreen";

// Project Screens
import ProjectDetailsScreen from "../screens/project/ProjectDetailsScreen";
import CreateProjectScreen from "../screens/project/CreateProjectScreen";
import RiskAnalysisScreen from "../screens/project/RiskAnalysisScreen";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProjectDetails: { projectId: string };
  CreateProject: undefined;
  RiskAnalysis: { projectId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Projects: undefined;
  Estimation: undefined;
  Reports: undefined;
  Profile: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  const { user } = useAuthStore();
  
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Projects") {
            iconName = focused ? "folder" : "folder-outline";
          } else if (route.name === "Estimation") {
            iconName = focused ? "calculator" : "calculator-outline";
          } else if (route.name === "Reports") {
            iconName = focused ? "document-text" : "document-text-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else {
            iconName = "help-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "gray",
        headerStyle: {
          backgroundColor: "#f8fafc",
        },
        headerTitleStyle: {
          fontWeight: "600",
        },
        headerRight: () => (
          <Ionicons 
            name="notifications-outline" 
            size={24} 
            color="#374151" 
            style={{ marginRight: 16 }}
          />
        ),
      })}
    >
      <MainTab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          title: `Welcome, ${user?.name?.split(" ")[0] || "User"}`,
        }}
      />
      <MainTab.Screen 
        name="Projects" 
        component={ProjectsScreen}
        options={{ title: "My Projects" }}
      />
      <MainTab.Screen 
        name="Estimation" 
        component={EstimationScreen}
        options={{ title: "AI Estimation" }}
      />
      <MainTab.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{ title: "Reports & Analytics" }}
      />
      <MainTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: "Profile & Settings" }}
      />
    </MainTab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <RootStack.Screen name="Main" component={MainNavigator} />
            <RootStack.Screen 
              name="ProjectDetails" 
              component={ProjectDetailsScreen}
              options={{
                headerShown: true,
                title: "Project Details",
                headerStyle: { backgroundColor: "#f8fafc" },
              }}
            />
            <RootStack.Screen 
              name="CreateProject" 
              component={CreateProjectScreen}
              options={{
                headerShown: true,
                title: "New Project",
                presentation: "modal",
                headerStyle: { backgroundColor: "#f8fafc" },
              }}
            />
            <RootStack.Screen 
              name="RiskAnalysis" 
              component={RiskAnalysisScreen}
              options={{
                headerShown: true,
                title: "Risk Analysis",
                headerStyle: { backgroundColor: "#f8fafc" },
              }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}