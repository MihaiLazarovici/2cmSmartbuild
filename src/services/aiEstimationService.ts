import { getOpenAIChatResponse, getAnthropicChatResponse } from "../api/chat-service";
import { AIEstimationRequest, AIEstimationResponse, ProjectType, Material, WorkforceRequirement } from "../types/construction";

export class AIEstimationService {
  private static instance: AIEstimationService;
  
  public static getInstance(): AIEstimationService {
    if (!AIEstimationService.instance) {
      AIEstimationService.instance = new AIEstimationService();
    }
    return AIEstimationService.instance;
  }

  async generateEstimation(request: AIEstimationRequest): Promise<AIEstimationResponse> {
    try {
      const prompt = this.buildEstimationPrompt(request);
      
      // Use OpenAI for estimation analysis
      const response = await getOpenAIChatResponse(prompt);
      
      // Parse the AI response and structure it
      const estimation = this.parseEstimationResponse(response.content, request);
      
      return estimation;
    } catch (error) {
      console.error("AI Estimation failed:", error);
      // Fallback to rule-based estimation
      return this.generateFallbackEstimation(request);
    }
  }

  async analyzeMarketConditions(location: string, projectType: ProjectType): Promise<{
    materialCostMultiplier: number;
    laborCostMultiplier: number;
    marketInsights: string[];
  }> {
    try {
      const prompt = `Analyze current construction market conditions for ${location} focusing on ${projectType} projects. 
      Provide insights on:
      1. Material cost trends and availability
      2. Labor market conditions and rates
      3. Regional economic factors affecting construction
      4. Seasonal considerations
      
      Format your response as JSON with materialCostMultiplier (0.8-1.5), laborCostMultiplier (0.8-1.5), and marketInsights array.`;

      const response = await getAnthropicChatResponse(prompt);
      
      try {
        const parsed = JSON.parse(response.content);
        return {
          materialCostMultiplier: parsed.materialCostMultiplier || 1.0,
          laborCostMultiplier: parsed.laborCostMultiplier || 1.0,
          marketInsights: parsed.marketInsights || ["Market analysis unavailable"],
        };
      } catch {
        return {
          materialCostMultiplier: 1.0,
          laborCostMultiplier: 1.0,
          marketInsights: ["Unable to parse market analysis"],
        };
      }
    } catch (error) {
      console.error("Market analysis failed:", error);
      return {
        materialCostMultiplier: 1.0,
        laborCostMultiplier: 1.0,
        marketInsights: ["Market analysis unavailable"],
      };
    }
  }

  async generateMaterialList(request: AIEstimationRequest): Promise<Material[]> {
    try {
      const prompt = `Generate a detailed material list for a ${request.projectType} project of ${request.size} sq ft in ${request.location}.
      
      Project specifications: ${request.specifications}
      
      For each material, provide:
      - Name and category
      - Estimated quantity needed
      - Unit of measurement
      - Current market price per unit
      - Supplier recommendations
      - Lead time considerations
      
      Focus on major materials like concrete, steel, lumber, electrical, plumbing, roofing, etc.
      
      Format as JSON array with fields: name, category, quantity, unit, basePrice, currentPrice, supplier, leadTime.`;

      const response = await getOpenAIChatResponse(prompt);
      
      try {
        const materials = JSON.parse(response.content);
        return materials.map((m: any, index: number) => ({
          id: `material_${index}`,
          name: m.name || "Unknown Material",
          category: m.category || "other",
          unit: m.unit || "unit",
          basePrice: m.basePrice || 0,
          currentPrice: m.currentPrice || m.basePrice || 0,
          supplier: m.supplier,
          availability: "available",
          leadTime: m.leadTime || 7,
          priceHistory: [],
        }));
      } catch {
        return this.generateFallbackMaterialList(request);
      }
    } catch (error) {
      console.error("Material list generation failed:", error);
      return this.generateFallbackMaterialList(request);
    }
  }

  async generateWorkforceRequirements(request: AIEstimationRequest): Promise<WorkforceRequirement[]> {
    try {
      const prompt = `Analyze workforce requirements for a ${request.projectType} project of ${request.size} sq ft.
      
      Project specifications: ${request.specifications}
      Timeline: ${request.timeline}
      
      Determine required:
      - Skill types and specializations needed
      - Number of workers per skill type
      - Duration each skill type is needed
      - Current hourly rates in ${request.location}
      - Availability considerations
      
      Format as JSON array with fields: skillType, requiredCount, duration, hourlyRate, availability.`;

      const response = await getAnthropicChatResponse(prompt);
      
      try {
        const workforce = JSON.parse(response.content);
        return workforce.map((w: any, index: number) => ({
          id: `workforce_${index}`,
          projectId: "temp",
          skillType: w.skillType || "general_labor",
          requiredCount: w.requiredCount || 1,
          duration: w.duration || 30,
          hourlyRate: w.hourlyRate || 25,
          availability: w.availability || "available",
        }));
      } catch {
        return this.generateFallbackWorkforceRequirements(request);
      }
    } catch (error) {
      console.error("Workforce requirements generation failed:", error);
      return this.generateFallbackWorkforceRequirements(request);
    }
  }

  private buildEstimationPrompt(request: AIEstimationRequest): string {
    return `You are an expert construction cost estimator with 20+ years of experience. Analyze this construction project and provide a detailed cost estimate.

Project Details:
- Type: ${request.projectType}
- Size: ${request.size} square feet
- Location: ${request.location}
- Specifications: ${request.specifications}
- Timeline: ${request.timeline}
- Special Requirements: ${request.specialRequirements?.join(", ") || "None"}

Please provide a comprehensive analysis including:

1. TOTAL ESTIMATED COST (be realistic based on current market conditions)

2. COST BREAKDOWN:
   - Materials (45-50% of total)
   - Labor (30-35% of total)
   - Equipment (10-15% of total)
   - Overhead & Profit (8-12% of total)

3. TIMELINE ESTIMATE (in days)

4. CONFIDENCE LEVEL (0-100%)

5. KEY ASSUMPTIONS (list 4-6 critical assumptions)

6. RECOMMENDATIONS (3-5 actionable recommendations)

7. RISK FACTORS (3-5 potential risks that could impact cost/timeline)

Consider factors like:
- Regional cost variations
- Current material prices and availability
- Labor market conditions
- Seasonal factors
- Project complexity
- Permit and regulatory requirements

Format your response as a structured analysis with clear sections. Be specific with dollar amounts and percentages.`;
  }

  private parseEstimationResponse(content: string, request: AIEstimationRequest): AIEstimationResponse {
    // Extract key information from AI response using regex patterns
    const costMatch = content.match(/\$?([\d,]+(?:\.\d{2})?)/);
    const timelineMatch = content.match(/(\d+)\s*days?/i);
    const confidenceMatch = content.match(/(\d+)%?\s*confidence/i);
    
    // Extract cost breakdown
    const materialsMatch = content.match(/materials?[:\s]*\$?([\d,]+)/i);
    const laborMatch = content.match(/labor[:\s]*\$?([\d,]+)/i);
    const equipmentMatch = content.match(/equipment[:\s]*\$?([\d,]+)/i);
    const overheadMatch = content.match(/overhead[:\s]*\$?([\d,]+)/i);

    const estimatedCost = costMatch ? parseInt(costMatch[1].replace(/,/g, "")) : this.calculateFallbackCost(request);
    
    return {
      estimatedCost,
      costBreakdown: {
        materials: materialsMatch ? parseInt(materialsMatch[1].replace(/,/g, "")) : Math.round(estimatedCost * 0.47),
        labor: laborMatch ? parseInt(laborMatch[1].replace(/,/g, "")) : Math.round(estimatedCost * 0.33),
        equipment: equipmentMatch ? parseInt(equipmentMatch[1].replace(/,/g, "")) : Math.round(estimatedCost * 0.12),
        overhead: overheadMatch ? parseInt(overheadMatch[1].replace(/,/g, "")) : Math.round(estimatedCost * 0.08),
      },
      timeline: timelineMatch ? parseInt(timelineMatch[1]) : this.calculateFallbackTimeline(request),
      confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 85,
      assumptions: this.extractAssumptions(content),
      recommendations: this.extractRecommendations(content),
      risks: this.extractRisks(content),
    };
  }

  private extractAssumptions(content: string): string[] {
    const assumptionsSection = content.match(/assumptions?[:\s]*(.*?)(?=recommendations?|risks?|$)/is);
    if (assumptionsSection) {
      const assumptions = assumptionsSection[1]
        .split(/\n|•|-/)
        .map(item => item.trim())
        .filter(item => item.length > 10)
        .slice(0, 6);
      
      if (assumptions.length > 0) return assumptions;
    }
    
    return [
      "Standard construction materials and methods",
      "Normal weather conditions during construction",
      "Adequate skilled workforce availability",
      "No major regulatory or permit delays",
      "Site is accessible and prepared for construction",
      "Current market prices remain stable",
    ];
  }

  private extractRecommendations(content: string): string[] {
    const recommendationsSection = content.match(/recommendations?[:\s]*(.*?)(?=risks?|assumptions?|$)/is);
    if (recommendationsSection) {
      const recommendations = recommendationsSection[1]
        .split(/\n|•|-/)
        .map(item => item.trim())
        .filter(item => item.length > 10)
        .slice(0, 5);
      
      if (recommendations.length > 0) return recommendations;
    }
    
    return [
      "Secure material contracts early to lock in pricing",
      "Schedule critical path activities during favorable weather",
      "Maintain 10-15% contingency budget for unforeseen costs",
      "Pre-qualify and book skilled contractors in advance",
      "Implement regular progress monitoring and cost tracking",
    ];
  }

  private extractRisks(content: string): string[] {
    const risksSection = content.match(/risks?[:\s]*(.*?)$/is);
    if (risksSection) {
      const risks = risksSection[1]
        .split(/\n|•|-/)
        .map(item => item.trim())
        .filter(item => item.length > 10)
        .slice(0, 5);
      
      if (risks.length > 0) return risks;
    }
    
    return [
      "Weather delays during construction season",
      "Material price volatility and supply chain disruptions",
      "Skilled labor shortages in specialized trades",
      "Permit approval delays or requirement changes",
      "Site conditions different from initial assessment",
    ];
  }

  private generateFallbackEstimation(request: AIEstimationRequest): AIEstimationResponse {
    const baseRate = this.getBaseRateByType(request.projectType);
    const locationMultiplier = this.getLocationMultiplier(request.location);
    const sizeMultiplier = this.getSizeMultiplier(request.size);
    
    const estimatedCost = Math.round(request.size * baseRate * locationMultiplier * sizeMultiplier);
    const timeline = Math.round((request.size / 1000) * this.getTimelineMultiplier(request.projectType));
    
    return {
      estimatedCost,
      costBreakdown: {
        materials: Math.round(estimatedCost * 0.47),
        labor: Math.round(estimatedCost * 0.33),
        equipment: Math.round(estimatedCost * 0.12),
        overhead: Math.round(estimatedCost * 0.08),
      },
      timeline,
      confidence: 75,
      assumptions: [
        "Standard construction materials and methods",
        "Normal weather conditions during construction",
        "Adequate skilled workforce availability",
        "No major regulatory or permit delays",
      ],
      recommendations: [
        "Consider bulk material purchasing for cost savings",
        "Schedule critical path activities early",
        "Maintain 10% contingency for unforeseen costs",
      ],
      risks: [
        "Weather delays during construction season",
        "Material price volatility",
        "Skilled labor availability",
      ],
    };
  }

  private generateFallbackMaterialList(_request: AIEstimationRequest): Material[] {
    const baseMaterials = [
      { name: "Concrete", category: "concrete", unit: "cubic yard", basePrice: 120 },
      { name: "Rebar", category: "steel", unit: "ton", basePrice: 800 },
      { name: "Lumber", category: "lumber", unit: "board foot", basePrice: 2.5 },
      { name: "Electrical Wire", category: "electrical", unit: "linear foot", basePrice: 1.2 },
      { name: "PVC Pipe", category: "plumbing", unit: "linear foot", basePrice: 3.5 },
      { name: "Roofing Shingles", category: "roofing", unit: "square", basePrice: 150 },
    ];

    return baseMaterials.map((material, index) => ({
      id: `material_${index}`,
      name: material.name,
      category: material.category as any,
      unit: material.unit,
      basePrice: material.basePrice,
      currentPrice: material.basePrice * (0.9 + Math.random() * 0.2),
      availability: "available" as any,
      leadTime: 7 + Math.floor(Math.random() * 14),
      priceHistory: [],
    }));
  }

  private generateFallbackWorkforceRequirements(_request: AIEstimationRequest): WorkforceRequirement[] {
    const baseWorkforce = [
      { skillType: "general_labor", requiredCount: 4, duration: 60, hourlyRate: 25 },
      { skillType: "carpenter", requiredCount: 2, duration: 45, hourlyRate: 35 },
      { skillType: "electrician", requiredCount: 1, duration: 20, hourlyRate: 45 },
      { skillType: "plumber", requiredCount: 1, duration: 15, hourlyRate: 42 },
    ];

    return baseWorkforce.map((worker, index) => ({
      id: `workforce_${index}`,
      projectId: "temp",
      skillType: worker.skillType as any,
      requiredCount: worker.requiredCount,
      duration: worker.duration,
      hourlyRate: worker.hourlyRate,
      availability: "available" as any,
    }));
  }

  private calculateFallbackCost(request: AIEstimationRequest): number {
    const baseRate = this.getBaseRateByType(request.projectType);
    const locationMultiplier = this.getLocationMultiplier(request.location);
    const sizeMultiplier = this.getSizeMultiplier(request.size);
    
    return Math.round(request.size * baseRate * locationMultiplier * sizeMultiplier);
  }

  private calculateFallbackTimeline(request: AIEstimationRequest): number {
    return Math.round((request.size / 1000) * this.getTimelineMultiplier(request.projectType));
  }

  private getBaseRateByType(type: ProjectType): number {
    switch (type) {
      case "residential_new": return 150;
      case "residential_renovation": return 120;
      case "commercial_new": return 200;
      case "commercial_renovation": return 180;
      case "infrastructure": return 300;
      case "industrial": return 250;
      default: return 150;
    }
  }

  private getLocationMultiplier(location: string): number {
    const lowerLocation = location.toLowerCase();
    if (lowerLocation.includes("new york") || lowerLocation.includes("san francisco") || lowerLocation.includes("los angeles")) {
      return 1.4;
    } else if (lowerLocation.includes("chicago") || lowerLocation.includes("boston") || lowerLocation.includes("seattle")) {
      return 1.2;
    } else if (lowerLocation.includes("texas") || lowerLocation.includes("florida") || lowerLocation.includes("arizona")) {
      return 0.9;
    }
    return 1.0;
  }

  private getSizeMultiplier(size: number): number {
    if (size > 10000) return 0.85; // Economies of scale
    if (size > 5000) return 0.9;
    if (size < 1000) return 1.2; // Small project premium
    return 1.0;
  }

  private getTimelineMultiplier(type: ProjectType): number {
    switch (type) {
      case "residential_new": return 45;
      case "residential_renovation": return 30;
      case "commercial_new": return 60;
      case "commercial_renovation": return 45;
      case "infrastructure": return 90;
      case "industrial": return 75;
      default: return 45;
    }
  }
}

export const aiEstimationService = AIEstimationService.getInstance();