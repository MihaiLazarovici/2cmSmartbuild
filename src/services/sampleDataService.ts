import { useProjectStore } from "../state/projectStore";
import { Project, ProjectEstimate, RiskAssessment, Risk } from "../types/construction";

export class SampleDataService {
  private static instance: SampleDataService;

  public static getInstance(): SampleDataService {
    if (!SampleDataService.instance) {
      SampleDataService.instance = new SampleDataService();
    }
    return SampleDataService.instance;
  }

  async initializeSampleData(userId: string): Promise<void> {
    const { createProject, addEstimate, addRiskAssessment } = useProjectStore.getState();

    // Create sample projects
    const sampleProjects: Omit<Project, "id" | "createdAt" | "updatedAt">[] = [
      {
        name: "Sunset Ridge Residential Complex",
        description: "Modern 24-unit residential complex with sustainable features and community amenities",
        type: "residential_new",
        location: "Austin, Texas",
        startDate: new Date("2024-03-15"),
        estimatedEndDate: new Date("2024-12-15"),
        status: "in_progress",
        budget: 3200000,
        estimatedCost: 2950000,
        actualCost: 1200000,
        ownerId: userId,
      },
      {
        name: "Downtown Office Renovation",
        description: "Complete renovation of 15,000 sq ft office space with modern amenities",
        type: "commercial_renovation",
        location: "Seattle, Washington",
        startDate: new Date("2024-02-01"),
        estimatedEndDate: new Date("2024-08-01"),
        status: "planning",
        budget: 850000,
        estimatedCost: 780000,
        actualCost: 0,
        ownerId: userId,
      },
      {
        name: "Green Valley Shopping Center",
        description: "New 45,000 sq ft retail shopping center with parking and landscaping",
        type: "commercial_new",
        location: "Phoenix, Arizona",
        startDate: new Date("2024-05-01"),
        estimatedEndDate: new Date("2025-03-01"),
        status: "planning",
        budget: 5500000,
        estimatedCost: 5200000,
        actualCost: 0,
        ownerId: userId,
      },
    ];

    // Create projects and add estimates/risk assessments
    for (const projectData of sampleProjects) {
      const projectId = createProject(projectData);

      // Add sample estimate
      const sampleEstimate: Omit<ProjectEstimate, "id" | "createdAt"> = {
        projectId,
        materialCosts: [
          { materialId: "concrete", quantity: 500, unitPrice: 120, totalCost: 60000, supplier: "ABC Concrete Co" },
          { materialId: "steel", quantity: 50, unitPrice: 800, totalCost: 40000, supplier: "Steel Works Inc" },
          { materialId: "lumber", quantity: 10000, unitPrice: 2.5, totalCost: 25000, supplier: "Timber Supply Co" },
        ],
        laborCosts: [
          { skillType: "general_labor", hours: 2000, hourlyRate: 25, totalCost: 50000, startDate: new Date(), endDate: new Date() },
          { skillType: "carpenter", hours: 800, hourlyRate: 35, totalCost: 28000, startDate: new Date(), endDate: new Date() },
          { skillType: "electrician", hours: 400, hourlyRate: 45, totalCost: 18000, startDate: new Date(), endDate: new Date() },
        ],
        equipmentCosts: [
          { equipmentType: "Excavator", rentalDays: 30, dailyRate: 400, totalCost: 12000 },
          { equipmentType: "Crane", rentalDays: 15, dailyRate: 800, totalCost: 12000 },
        ],
        overheadCosts: [
          { category: "Insurance", amount: 15000, description: "General liability and workers comp" },
          { category: "Permits", amount: 8000, description: "Building permits and inspections" },
          { category: "Management", amount: 25000, description: "Project management and supervision" },
        ],
        totalCost: projectData.estimatedCost,
        timeline: {
          phases: [
            {
              id: "foundation",
              name: "Foundation",
              description: "Site preparation and foundation work",
              startDate: projectData.startDate,
              endDate: new Date(projectData.startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
              duration: 30,
              dependencies: [],
              resources: [],
              status: "completed",
            },
            {
              id: "framing",
              name: "Framing",
              description: "Structural framing and roofing",
              startDate: new Date(projectData.startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
              endDate: new Date(projectData.startDate.getTime() + 75 * 24 * 60 * 60 * 1000),
              duration: 45,
              dependencies: ["foundation"],
              resources: [],
              status: "in_progress",
            },
          ],
          totalDuration: Math.ceil((projectData.estimatedEndDate.getTime() - projectData.startDate.getTime()) / (1000 * 60 * 60 * 24)),
          criticalPath: ["foundation", "framing"],
          milestones: [
            {
              id: "foundation_complete",
              name: "Foundation Complete",
              description: "Foundation work finished and inspected",
              targetDate: new Date(projectData.startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
              status: "completed",
              dependencies: ["foundation"],
            },
          ],
        },
        confidence: 87,
        createdBy: userId,
        method: "ai_generated",
      };

      addEstimate(sampleEstimate);

      // Add sample risk assessment
      const sampleRisks: Risk[] = [
        {
          id: `risk_weather_${projectId}`,
          category: "weather",
          description: "Potential weather delays during construction season",
          probability: 65,
          impact: 40,
          riskScore: 26,
          mitigation: "Schedule critical outdoor work during favorable weather windows and maintain weather monitoring system",
          status: "monitoring",
        },
        {
          id: `risk_supply_${projectId}`,
          category: "supply_chain",
          description: "Material price volatility and potential supply chain disruptions",
          probability: 45,
          impact: 70,
          riskScore: 32,
          mitigation: "Secure material contracts early and maintain relationships with multiple suppliers",
          status: "identified",
        },
        {
          id: `risk_workforce_${projectId}`,
          category: "workforce",
          description: "Skilled labor shortage in specialized trades",
          probability: 55,
          impact: 60,
          riskScore: 33,
          mitigation: "Pre-book qualified contractors and maintain backup options for critical trades",
          status: "mitigating",
        },
      ];

      const sampleRiskAssessment: Omit<RiskAssessment, "id" | "createdAt" | "updatedAt"> = {
        projectId,
        risks: sampleRisks,
        overallRiskScore: Math.round(sampleRisks.reduce((sum, risk) => sum + risk.riskScore, 0) / sampleRisks.length),
        recommendations: [
          "Implement comprehensive weather monitoring and response procedures",
          "Establish material procurement timeline with 15% buffer for delays",
          "Create workforce contingency plan with pre-qualified backup contractors",
          "Maintain 12% budget contingency for unforeseen circumstances",
          "Schedule weekly risk review meetings during active construction phases",
          "Implement real-time project tracking and communication systems",
        ],
      };

      addRiskAssessment(sampleRiskAssessment);
    }

    console.log("Sample data initialized successfully");
  }

  async clearSampleData(userId: string): Promise<void> {
    const { projects, deleteProject } = useProjectStore.getState();
    const userProjects = projects.filter(p => p.ownerId === userId);
    
    for (const project of userProjects) {
      deleteProject(project.id);
    }

    console.log("Sample data cleared successfully");
  }
}

export const sampleDataService = SampleDataService.getInstance();