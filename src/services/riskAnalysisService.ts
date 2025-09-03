import { getAnthropicChatResponse, getOpenAIChatResponse } from "../api/chat-service";
import { Project, Risk, RiskAssessment, RiskCategory } from "../types/construction";

export class RiskAnalysisService {
  private static instance: RiskAnalysisService;
  
  public static getInstance(): RiskAnalysisService {
    if (!RiskAnalysisService.instance) {
      RiskAnalysisService.instance = new RiskAnalysisService();
    }
    return RiskAnalysisService.instance;
  }

  async generateRiskAssessment(project: Project): Promise<Omit<RiskAssessment, "id" | "createdAt" | "updatedAt">> {
    try {
      const prompt = this.buildRiskAnalysisPrompt(project);
      
      // Use Anthropic for risk analysis as it's good at analytical tasks
      const response = await getAnthropicChatResponse(prompt);
      
      // Parse the AI response and structure it
      const assessment = this.parseRiskAssessmentResponse(response.content, project);
      
      return assessment;
    } catch (error) {
      console.error("Risk analysis failed:", error);
      // Fallback to rule-based risk assessment
      return this.generateFallbackRiskAssessment(project);
    }
  }

  async analyzeSpecificRisk(project: Project, riskCategory: RiskCategory): Promise<Risk> {
    try {
      const prompt = `Analyze the ${riskCategory} risk for this construction project:

Project: ${project.name}
Type: ${project.type}
Location: ${project.location}
Budget: $${project.budget.toLocaleString()}
Timeline: ${project.startDate.toLocaleDateString()} to ${project.estimatedEndDate.toLocaleDateString()}

Provide a detailed analysis of ${riskCategory} risks including:
1. Specific risk description
2. Probability (0-100%)
3. Impact severity (0-100%)
4. Mitigation strategies
5. Current status

Format as JSON with fields: description, probability, impact, mitigation, status.`;

      const response = await getOpenAIChatResponse(prompt);
      
      try {
        const riskData = JSON.parse(response.content);
        return {
          id: `risk_${Date.now()}`,
          category: riskCategory,
          description: riskData.description || `${riskCategory} risk analysis`,
          probability: riskData.probability || 50,
          impact: riskData.impact || 50,
          riskScore: Math.round((riskData.probability || 50) * (riskData.impact || 50) / 100),
          mitigation: riskData.mitigation || "Standard mitigation strategies apply",
          status: riskData.status || "identified",
        };
      } catch {
        return this.generateFallbackRisk(riskCategory);
      }
    } catch (error) {
      console.error(`${riskCategory} risk analysis failed:`, error);
      return this.generateFallbackRisk(riskCategory);
    }
  }

  async generateMitigationPlan(risks: Risk[]): Promise<string[]> {
    try {
      const riskDescriptions = risks.map(r => `${r.category}: ${r.description} (Score: ${r.riskScore})`).join("\n");
      
      const prompt = `Based on these identified construction project risks, generate a comprehensive mitigation plan:

${riskDescriptions}

Provide 5-8 specific, actionable mitigation strategies that address the highest priority risks. Focus on:
1. Preventive measures
2. Contingency planning
3. Risk monitoring
4. Response procedures

Format as a simple array of strings, each being a complete mitigation strategy.`;

      const response = await getAnthropicChatResponse(prompt);
      
      // Extract mitigation strategies from response
      const strategies = response.content
        .split(/\n|•|-/)
        .map(item => item.trim())
        .filter(item => item.length > 20)
        .slice(0, 8);
      
      return strategies.length > 0 ? strategies : this.getFallbackMitigationStrategies();
    } catch (error) {
      console.error("Mitigation plan generation failed:", error);
      return this.getFallbackMitigationStrategies();
    }
  }

  async assessWeatherRisk(location: string, startDate: Date, endDate: Date): Promise<{
    riskLevel: "low" | "medium" | "high";
    seasonalFactors: string[];
    recommendations: string[];
  }> {
    try {
      const prompt = `Analyze weather-related construction risks for ${location} from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}.

Consider:
1. Seasonal weather patterns
2. Historical weather data
3. Climate-related construction challenges
4. Regional weather risks

Provide risk level (low/medium/high), seasonal factors, and recommendations.
Format as JSON with fields: riskLevel, seasonalFactors (array), recommendations (array).`;

      const response = await getOpenAIChatResponse(prompt);
      
      try {
        const weatherData = JSON.parse(response.content);
        return {
          riskLevel: weatherData.riskLevel || "medium",
          seasonalFactors: weatherData.seasonalFactors || ["Seasonal weather variations"],
          recommendations: weatherData.recommendations || ["Monitor weather forecasts regularly"],
        };
      } catch {
        return this.getFallbackWeatherAssessment();
      }
    } catch (error) {
      console.error("Weather risk assessment failed:", error);
      return this.getFallbackWeatherAssessment();
    }
  }

  private buildRiskAnalysisPrompt(project: Project): string {
    return `You are a senior construction risk analyst with 25+ years of experience. Analyze this construction project for potential risks and provide a comprehensive risk assessment.

Project Details:
- Name: ${project.name}
- Type: ${project.type}
- Location: ${project.location}
- Budget: $${project.budget.toLocaleString()}
- Start Date: ${project.startDate.toLocaleDateString()}
- Estimated End Date: ${project.estimatedEndDate.toLocaleDateString()}
- Status: ${project.status}
- Description: ${project.description}

Analyze risks in these categories:
1. WEATHER - Seasonal conditions, extreme weather events
2. SUPPLY_CHAIN - Material availability, price volatility, delivery delays
3. WORKFORCE - Labor availability, skill shortages, productivity
4. REGULATORY - Permits, inspections, code changes
5. FINANCIAL - Budget overruns, payment delays, economic factors
6. TECHNICAL - Design issues, construction complexity, technology
7. SAFETY - Workplace safety, accident risks, compliance
8. ENVIRONMENTAL - Environmental impact, contamination, regulations

For each significant risk, provide:
- Category
- Detailed description
- Probability (0-100%)
- Impact severity (0-100%)
- Risk score (probability × impact / 100)
- Specific mitigation strategy
- Current status (identified/monitoring/mitigating/resolved)

Also provide:
- Overall risk score (average of individual risk scores)
- Top 5 recommendations for risk management
- Critical success factors

Format your response with clear sections and specific, actionable insights.`;
  }

  private parseRiskAssessmentResponse(content: string, project: Project): Omit<RiskAssessment, "id" | "createdAt" | "updatedAt"> {
    // Extract risks from the response
    const risks = this.extractRisksFromContent(content);
    
    // Calculate overall risk score
    const overallRiskScore = risks.length > 0 
      ? Math.round(risks.reduce((sum, risk) => sum + risk.riskScore, 0) / risks.length)
      : 50;
    
    // Extract recommendations
    const recommendations = this.extractRecommendationsFromContent(content);
    
    return {
      projectId: project.id,
      risks,
      overallRiskScore,
      recommendations,
    };
  }

  private extractRisksFromContent(content: string): Risk[] {
    const riskCategories: RiskCategory[] = [
      "weather", "supply_chain", "workforce", "regulatory", 
      "financial", "technical", "safety", "environmental"
    ];
    
    const risks: Risk[] = [];
    
    riskCategories.forEach(category => {
      // Look for category-specific content
      const categoryRegex = new RegExp(`${category.replace("_", "\\s*")}[:\\s]*(.*?)(?=${riskCategories.map(c => c.replace("_", "\\s*")).join("|")}|$)`, "is");
      const match = content.match(categoryRegex);
      
      if (match) {
        const categoryContent = match[1];
        
        // Extract probability and impact
        const probMatch = categoryContent.match(/probability[:\s]*(\d+)%?/i);
        const impactMatch = categoryContent.match(/impact[:\s]*(\d+)%?/i);
        const scoreMatch = categoryContent.match(/(?:risk\s*)?score[:\s]*(\d+)/i);
        
        const probability = probMatch ? parseInt(probMatch[1]) : 40 + Math.floor(Math.random() * 40);
        const impact = impactMatch ? parseInt(impactMatch[1]) : 40 + Math.floor(Math.random() * 40);
        const riskScore = scoreMatch ? parseInt(scoreMatch[1]) : Math.round(probability * impact / 100);
        
        // Extract description
        const descMatch = categoryContent.match(/description[:\s]*(.*?)(?=probability|impact|mitigation|$)/is);
        const description = descMatch ? descMatch[1].trim() : this.getDefaultRiskDescription(category);
        
        // Extract mitigation
        const mitigationMatch = categoryContent.match(/mitigation[:\s]*(.*?)(?=status|$)/is);
        const mitigation = mitigationMatch ? mitigationMatch[1].trim() : this.getDefaultMitigation(category);
        
        risks.push({
          id: `risk_${category}_${Date.now()}`,
          category,
          description,
          probability,
          impact,
          riskScore,
          mitigation,
          status: "identified",
        });
      }
    });
    
    // If no risks were extracted, generate fallback risks
    if (risks.length === 0) {
      return this.generateFallbackRisks();
    }
    
    return risks;
  }

  private extractRecommendationsFromContent(content: string): string[] {
    const recommendationsSection = content.match(/recommendations?[:\s]*(.*?)(?=critical|success|$)/is);
    if (recommendationsSection) {
      const recommendations = recommendationsSection[1]
        .split(/\n|•|-/)
        .map(item => item.trim())
        .filter(item => item.length > 15)
        .slice(0, 6);
      
      if (recommendations.length > 0) return recommendations;
    }
    
    return this.getFallbackRecommendations();
  }

  private generateFallbackRiskAssessment(project: Project): Omit<RiskAssessment, "id" | "createdAt" | "updatedAt"> {
    const risks = this.generateFallbackRisks();
    const overallRiskScore = Math.round(risks.reduce((sum, risk) => sum + risk.riskScore, 0) / risks.length);
    
    return {
      projectId: project.id,
      risks,
      overallRiskScore,
      recommendations: this.getFallbackRecommendations(),
    };
  }

  private generateFallbackRisks(): Risk[] {
    return [
      {
        id: "risk_weather_1",
        category: "weather",
        description: "Potential weather delays during construction season",
        probability: 65,
        impact: 40,
        riskScore: 26,
        mitigation: "Schedule critical outdoor work during favorable weather windows",
        status: "identified",
      },
      {
        id: "risk_supply_2",
        category: "supply_chain",
        description: "Material price volatility and availability issues",
        probability: 45,
        impact: 70,
        riskScore: 32,
        mitigation: "Secure material contracts early and maintain supplier relationships",
        status: "monitoring",
      },
      {
        id: "risk_workforce_3",
        category: "workforce",
        description: "Skilled labor shortage in specialized trades",
        probability: 55,
        impact: 60,
        riskScore: 33,
        mitigation: "Pre-book qualified contractors and maintain backup options",
        status: "identified",
      },
      {
        id: "risk_financial_4",
        category: "financial",
        description: "Budget overrun due to scope changes",
        probability: 40,
        impact: 85,
        riskScore: 34,
        mitigation: "Implement strict change order process and maintain contingency fund",
        status: "identified",
      },
    ];
  }

  private generateFallbackRisk(category: RiskCategory): Risk {
    const riskTemplates = {
      weather: { desc: "Weather-related construction delays", prob: 60, impact: 45 },
      supply_chain: { desc: "Material supply and pricing issues", prob: 50, impact: 65 },
      workforce: { desc: "Labor availability and skill challenges", prob: 55, impact: 60 },
      regulatory: { desc: "Permit and regulatory compliance risks", prob: 35, impact: 75 },
      financial: { desc: "Budget and financial management risks", prob: 45, impact: 80 },
      technical: { desc: "Technical and design complexity risks", prob: 40, impact: 70 },
      safety: { desc: "Workplace safety and accident risks", prob: 30, impact: 90 },
      environmental: { desc: "Environmental compliance and impact risks", prob: 25, impact: 85 },
    };
    
    const template = riskTemplates[category] || riskTemplates.technical;
    
    return {
      id: `risk_${category}_${Date.now()}`,
      category,
      description: template.desc,
      probability: template.prob,
      impact: template.impact,
      riskScore: Math.round(template.prob * template.impact / 100),
      mitigation: this.getDefaultMitigation(category),
      status: "identified",
    };
  }

  private getDefaultRiskDescription(category: RiskCategory): string {
    const descriptions = {
      weather: "Seasonal weather conditions may impact construction timeline",
      supply_chain: "Material availability and pricing volatility risks",
      workforce: "Skilled labor availability and productivity challenges",
      regulatory: "Permit approval and regulatory compliance requirements",
      financial: "Budget management and cost control challenges",
      technical: "Technical complexity and design implementation risks",
      safety: "Workplace safety and accident prevention requirements",
      environmental: "Environmental compliance and impact management",
    };
    
    return descriptions[category] || "General project risk factors";
  }

  private getDefaultMitigation(category: RiskCategory): string {
    const mitigations = {
      weather: "Monitor weather forecasts and schedule weather-sensitive work appropriately",
      supply_chain: "Establish reliable supplier relationships and maintain material inventory buffers",
      workforce: "Pre-qualify contractors and maintain backup labor resources",
      regulatory: "Submit permits early and maintain regular communication with authorities",
      financial: "Implement strict budget controls and maintain adequate contingency reserves",
      technical: "Conduct thorough design reviews and maintain technical expertise on team",
      safety: "Implement comprehensive safety protocols and regular training programs",
      environmental: "Ensure environmental compliance and implement monitoring procedures",
    };
    
    return mitigations[category] || "Implement standard risk management practices";
  }

  private getFallbackRecommendations(): string[] {
    return [
      "Implement comprehensive project monitoring and reporting systems",
      "Maintain adequate contingency reserves for unforeseen circumstances",
      "Establish clear communication protocols with all stakeholders",
      "Conduct regular risk assessment reviews throughout project lifecycle",
      "Develop and maintain strong supplier and contractor relationships",
      "Ensure proper insurance coverage for identified risks",
    ];
  }

  private getFallbackMitigationStrategies(): string[] {
    return [
      "Implement weekly risk review meetings with project team",
      "Maintain 15% budget contingency for unforeseen costs",
      "Establish backup suppliers for critical materials",
      "Create detailed weather monitoring and response procedures",
      "Develop workforce contingency plans with backup contractors",
      "Implement strict change order approval processes",
    ];
  }

  private getFallbackWeatherAssessment(): {
    riskLevel: "low" | "medium" | "high";
    seasonalFactors: string[];
    recommendations: string[];
  } {
    return {
      riskLevel: "medium",
      seasonalFactors: [
        "Seasonal temperature variations",
        "Precipitation patterns",
        "Wind conditions",
      ],
      recommendations: [
        "Monitor weather forecasts daily",
        "Schedule outdoor work during favorable conditions",
        "Maintain weather protection equipment",
      ],
    };
  }
}

export const riskAnalysisService = RiskAnalysisService.getInstance();