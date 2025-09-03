export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  company?: string;
  createdAt: Date;
}

export type UserRole = "engineer" | "contractor" | "project_manager";

export interface Project {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  location: string;
  startDate: Date;
  estimatedEndDate: Date;
  actualEndDate?: Date;
  status: ProjectStatus;
  budget: number;
  estimatedCost: number;
  actualCost: number;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectType = 
  | "residential_new"
  | "residential_renovation" 
  | "commercial_new"
  | "commercial_renovation"
  | "infrastructure"
  | "industrial";

export type ProjectStatus = 
  | "planning"
  | "estimation"
  | "approved"
  | "in_progress"
  | "on_hold"
  | "completed"
  | "cancelled";

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  unit: string;
  basePrice: number;
  currentPrice: number;
  supplier?: string;
  availability: AvailabilityStatus;
  leadTime: number; // days
  priceHistory: PricePoint[];
}

export type MaterialCategory = 
  | "concrete"
  | "steel"
  | "lumber"
  | "electrical"
  | "plumbing"
  | "roofing"
  | "insulation"
  | "flooring"
  | "fixtures"
  | "other";

export type AvailabilityStatus = "available" | "limited" | "unavailable" | "backordered";

export interface PricePoint {
  date: Date;
  price: number;
}

export interface WorkforceRequirement {
  id: string;
  projectId: string;
  skillType: SkillType;
  requiredCount: number;
  duration: number; // days
  hourlyRate: number;
  availability: AvailabilityStatus;
}

export type SkillType = 
  | "general_labor"
  | "carpenter"
  | "electrician"
  | "plumber"
  | "mason"
  | "roofer"
  | "hvac_tech"
  | "heavy_equipment"
  | "project_manager"
  | "engineer"
  | "architect";

export interface ProjectEstimate {
  id: string;
  projectId: string;
  materialCosts: MaterialCost[];
  laborCosts: LaborCost[];
  equipmentCosts: EquipmentCost[];
  overheadCosts: OverheadCost[];
  totalCost: number;
  timeline: ProjectTimeline;
  confidence: number; // 0-100
  createdBy: string;
  createdAt: Date;
  method: EstimationMethod;
}

export type EstimationMethod = "ai_generated" | "manual" | "hybrid";

export interface MaterialCost {
  materialId: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
  supplier?: string;
  deliveryDate?: Date;
}

export interface LaborCost {
  skillType: SkillType;
  hours: number;
  hourlyRate: number;
  totalCost: number;
  startDate: Date;
  endDate: Date;
}

export interface EquipmentCost {
  equipmentType: string;
  rentalDays: number;
  dailyRate: number;
  totalCost: number;
}

export interface OverheadCost {
  category: string;
  amount: number;
  description: string;
}

export interface ProjectTimeline {
  phases: ProjectPhase[];
  totalDuration: number; // days
  criticalPath: string[];
  milestones: Milestone[];
}

export interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  dependencies: string[];
  resources: ResourceAllocation[];
  status: PhaseStatus;
}

export type PhaseStatus = "not_started" | "in_progress" | "completed" | "delayed";

export interface ResourceAllocation {
  resourceType: "material" | "labor" | "equipment";
  resourceId: string;
  quantity: number;
  startDate: Date;
  endDate: Date;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: Date;
  actualDate?: Date;
  status: MilestoneStatus;
  dependencies: string[];
}

export type MilestoneStatus = "pending" | "completed" | "overdue";

export interface RiskAssessment {
  id: string;
  projectId: string;
  risks: Risk[];
  overallRiskScore: number; // 0-100
  recommendations: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Risk {
  id: string;
  category: RiskCategory;
  description: string;
  probability: number; // 0-100
  impact: number; // 0-100
  riskScore: number;
  mitigation: string;
  status: RiskStatus;
}

export type RiskCategory = 
  | "weather"
  | "supply_chain"
  | "workforce"
  | "regulatory"
  | "financial"
  | "technical"
  | "safety"
  | "environmental";

export type RiskStatus = "identified" | "monitoring" | "mitigating" | "resolved";

export interface HistoricalProject {
  id: string;
  projectType: ProjectType;
  size: number;
  location: string;
  estimatedCost: number;
  actualCost: number;
  estimatedDuration: number;
  actualDuration: number;
  completedAt: Date;
  successFactors: string[];
  challenges: string[];
}

export interface AIEstimationRequest {
  projectType: ProjectType;
  size: number;
  location: string;
  specifications: string;
  timeline: string;
  specialRequirements?: string[];
}

export interface AIEstimationResponse {
  estimatedCost: number;
  costBreakdown: {
    materials: number;
    labor: number;
    equipment: number;
    overhead: number;
  };
  timeline: number;
  confidence: number;
  assumptions: string[];
  recommendations: string[];
  risks: string[];
}