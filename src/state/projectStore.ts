import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Project, ProjectEstimate, RiskAssessment, HistoricalProject } from "../types/construction";
import { databaseService } from "../services/databaseService";

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  estimates: ProjectEstimate[];
  riskAssessments: RiskAssessment[];
  historicalProjects: HistoricalProject[];
  isLoading: boolean;
  
  // Project management
  createProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (project: Project | null) => void;
  getProjectsByUser: (userId: string) => Project[];
  
  // Estimates
  addEstimate: (estimate: Omit<ProjectEstimate, "id" | "createdAt">) => string;
  updateEstimate: (id: string, updates: Partial<ProjectEstimate>) => void;
  getEstimatesByProject: (projectId: string) => ProjectEstimate[];
  
  // Risk assessments
  addRiskAssessment: (assessment: Omit<RiskAssessment, "id" | "createdAt" | "updatedAt">) => string;
  updateRiskAssessment: (id: string, updates: Partial<RiskAssessment>) => void;
  getRiskAssessmentsByProject: (projectId: string) => RiskAssessment[];
  
  // Historical data
  addHistoricalProject: (project: Omit<HistoricalProject, "id">) => string;
  getHistoricalProjectsByType: (projectType: string) => HistoricalProject[];
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      estimates: [],
      riskAssessments: [],
      historicalProjects: [],
      isLoading: false,

      createProject: (projectData) => {
        const id = Date.now().toString();
        const newProject: Project = {
          ...projectData,
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set(state => ({
          projects: [...state.projects, newProject]
        }));
        
        return id;
      },

      updateProject: (id, updates) => {
        set(state => ({
          projects: state.projects.map(project =>
            project.id === id 
              ? { ...project, ...updates, updatedAt: new Date() }
              : project
          ),
          currentProject: state.currentProject?.id === id 
            ? { ...state.currentProject, ...updates, updatedAt: new Date() }
            : state.currentProject
        }));
      },

      deleteProject: (id) => {
        set(state => ({
          projects: state.projects.filter(project => project.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject,
          estimates: state.estimates.filter(estimate => estimate.projectId !== id),
          riskAssessments: state.riskAssessments.filter(assessment => assessment.projectId !== id)
        }));
      },

      setCurrentProject: (project) => {
        set({ currentProject: project });
      },

      getProjectsByUser: (userId) => {
        return get().projects.filter(project => project.ownerId === userId);
      },

      addEstimate: (estimateData) => {
        const id = Date.now().toString();
        const newEstimate: ProjectEstimate = {
          ...estimateData,
          id,
          createdAt: new Date(),
        };
        
        set(state => ({
          estimates: [...state.estimates, newEstimate]
        }));
        
        return id;
      },

      updateEstimate: (id, updates) => {
        set(state => ({
          estimates: state.estimates.map(estimate =>
            estimate.id === id ? { ...estimate, ...updates } : estimate
          )
        }));
      },

      getEstimatesByProject: (projectId) => {
        return get().estimates.filter(estimate => estimate.projectId === projectId);
      },

      addRiskAssessment: (assessmentData) => {
        const id = Date.now().toString();
        const newAssessment: RiskAssessment = {
          ...assessmentData,
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set(state => ({
          riskAssessments: [...state.riskAssessments, newAssessment]
        }));
        
        return id;
      },

      updateRiskAssessment: (id, updates) => {
        set(state => ({
          riskAssessments: state.riskAssessments.map(assessment =>
            assessment.id === id 
              ? { ...assessment, ...updates, updatedAt: new Date() }
              : assessment
          )
        }));
      },

      getRiskAssessmentsByProject: (projectId) => {
        return get().riskAssessments.filter(assessment => assessment.projectId === projectId);
      },

      addHistoricalProject: (projectData) => {
        const id = Date.now().toString();
        const newHistoricalProject: HistoricalProject = {
          ...projectData,
          id,
        };
        
        set(state => ({
          historicalProjects: [...state.historicalProjects, newHistoricalProject]
        }));
        
        return id;
      },

      getHistoricalProjectsByType: (projectType) => {
        return get().historicalProjects.filter(project => project.projectType === projectType);
      },
    }),
    {
      name: "project-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        projects: state.projects,
        estimates: state.estimates,
        riskAssessments: state.riskAssessments,
        historicalProjects: state.historicalProjects,
      }),
    }
  )
);