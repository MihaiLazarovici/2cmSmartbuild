import * as SQLite from "expo-sqlite";
import { Project, ProjectEstimate, RiskAssessment, HistoricalProject } from "../types/construction";

export class DatabaseService {
  private static instance: DatabaseService;
  private db: SQLite.SQLiteDatabase | null = null;

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initializeDatabase(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync("smartbuild.db");
      await this.createTables();
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Database initialization failed:", error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      -- Projects table
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        location TEXT NOT NULL,
        start_date TEXT NOT NULL,
        estimated_end_date TEXT NOT NULL,
        actual_end_date TEXT,
        status TEXT NOT NULL,
        budget REAL NOT NULL,
        estimated_cost REAL NOT NULL,
        actual_cost REAL DEFAULT 0,
        owner_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- Project estimates table
      CREATE TABLE IF NOT EXISTS project_estimates (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        total_cost REAL NOT NULL,
        materials_cost REAL NOT NULL,
        labor_cost REAL NOT NULL,
        equipment_cost REAL NOT NULL,
        overhead_cost REAL NOT NULL,
        timeline INTEGER NOT NULL,
        confidence INTEGER NOT NULL,
        method TEXT NOT NULL,
        created_by TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
      );

      -- Risk assessments table
      CREATE TABLE IF NOT EXISTS risk_assessments (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        overall_risk_score INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
      );

      -- Risks table
      CREATE TABLE IF NOT EXISTS risks (
        id TEXT PRIMARY KEY,
        assessment_id TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        probability INTEGER NOT NULL,
        impact INTEGER NOT NULL,
        risk_score INTEGER NOT NULL,
        mitigation TEXT NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY (assessment_id) REFERENCES risk_assessments (id) ON DELETE CASCADE
      );

      -- Materials table
      CREATE TABLE IF NOT EXISTS materials (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        unit TEXT NOT NULL,
        base_price REAL NOT NULL,
        current_price REAL NOT NULL,
        supplier TEXT,
        availability TEXT NOT NULL,
        lead_time INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- Workforce requirements table
      CREATE TABLE IF NOT EXISTS workforce_requirements (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        skill_type TEXT NOT NULL,
        required_count INTEGER NOT NULL,
        duration INTEGER NOT NULL,
        hourly_rate REAL NOT NULL,
        availability TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
      );

      -- Historical projects table
      CREATE TABLE IF NOT EXISTS historical_projects (
        id TEXT PRIMARY KEY,
        project_type TEXT NOT NULL,
        size REAL NOT NULL,
        location TEXT NOT NULL,
        estimated_cost REAL NOT NULL,
        actual_cost REAL NOT NULL,
        estimated_duration INTEGER NOT NULL,
        actual_duration INTEGER NOT NULL,
        completed_at TEXT NOT NULL,
        success_factors TEXT,
        challenges TEXT
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects (owner_id);
      CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status);
      CREATE INDEX IF NOT EXISTS idx_project_estimates_project_id ON project_estimates (project_id);
      CREATE INDEX IF NOT EXISTS idx_risk_assessments_project_id ON risk_assessments (project_id);
      CREATE INDEX IF NOT EXISTS idx_risks_assessment_id ON risks (assessment_id);
      CREATE INDEX IF NOT EXISTS idx_workforce_requirements_project_id ON workforce_requirements (project_id);
      CREATE INDEX IF NOT EXISTS idx_historical_projects_type ON historical_projects (project_type);
    `);
  }

  // Project operations
  async saveProject(project: Project): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync(`
      INSERT OR REPLACE INTO projects (
        id, name, description, type, location, start_date, estimated_end_date,
        actual_end_date, status, budget, estimated_cost, actual_cost,
        owner_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      project.id,
      project.name,
      project.description,
      project.type,
      project.location,
      project.startDate.toISOString(),
      project.estimatedEndDate.toISOString(),
      project.actualEndDate?.toISOString() || null,
      project.status,
      project.budget,
      project.estimatedCost,
      project.actualCost,
      project.ownerId,
      project.createdAt.toISOString(),
      project.updatedAt.toISOString(),
    ]);
  }

  async getProjectsByOwner(ownerId: string): Promise<Project[]> {
    if (!this.db) throw new Error("Database not initialized");

    const rows = await this.db.getAllAsync(`
      SELECT * FROM projects WHERE owner_id = ? ORDER BY created_at DESC
    `, [ownerId]);

    return rows.map(this.mapRowToProject);
  }

  async getProjectById(id: string): Promise<Project | null> {
    if (!this.db) throw new Error("Database not initialized");

    const row = await this.db.getFirstAsync(`
      SELECT * FROM projects WHERE id = ?
    `, [id]);

    return row ? this.mapRowToProject(row) : null;
  }

  async deleteProject(id: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync("DELETE FROM projects WHERE id = ?", [id]);
  }

  // Project estimate operations
  async saveProjectEstimate(estimate: ProjectEstimate): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync(`
      INSERT OR REPLACE INTO project_estimates (
        id, project_id, total_cost, materials_cost, labor_cost,
        equipment_cost, overhead_cost, timeline, confidence,
        method, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      estimate.id,
      estimate.projectId,
      estimate.totalCost,
      estimate.materialCosts.reduce((sum, m) => sum + m.totalCost, 0),
      estimate.laborCosts.reduce((sum, l) => sum + l.totalCost, 0),
      estimate.equipmentCosts.reduce((sum, e) => sum + e.totalCost, 0),
      estimate.overheadCosts.reduce((sum, o) => sum + o.amount, 0),
      estimate.timeline.totalDuration,
      estimate.confidence,
      estimate.method,
      estimate.createdBy,
      estimate.createdAt.toISOString(),
    ]);
  }

  async getEstimatesByProject(projectId: string): Promise<ProjectEstimate[]> {
    if (!this.db) throw new Error("Database not initialized");

    const rows = await this.db.getAllAsync(`
      SELECT * FROM project_estimates WHERE project_id = ? ORDER BY created_at DESC
    `, [projectId]);

    return rows.map(this.mapRowToEstimate);
  }

  // Risk assessment operations
  async saveRiskAssessment(assessment: RiskAssessment): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.withTransactionAsync(async () => {
      // Save risk assessment
      await this.db!.runAsync(`
        INSERT OR REPLACE INTO risk_assessments (
          id, project_id, overall_risk_score, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?)
      `, [
        assessment.id,
        assessment.projectId,
        assessment.overallRiskScore,
        assessment.createdAt.toISOString(),
        assessment.updatedAt.toISOString(),
      ]);

      // Delete existing risks for this assessment
      await this.db!.runAsync("DELETE FROM risks WHERE assessment_id = ?", [assessment.id]);

      // Save risks
      for (const risk of assessment.risks) {
        await this.db!.runAsync(`
          INSERT INTO risks (
            id, assessment_id, category, description, probability,
            impact, risk_score, mitigation, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          risk.id,
          assessment.id,
          risk.category,
          risk.description,
          risk.probability,
          risk.impact,
          risk.riskScore,
          risk.mitigation,
          risk.status,
        ]);
      }
    });
  }

  async getRiskAssessmentsByProject(projectId: string): Promise<RiskAssessment[]> {
    if (!this.db) throw new Error("Database not initialized");

    const assessmentRows = await this.db.getAllAsync(`
      SELECT * FROM risk_assessments WHERE project_id = ? ORDER BY created_at DESC
    `, [projectId]);

    const assessments: RiskAssessment[] = [];

    for (const assessmentRow of assessmentRows) {
      const row = assessmentRow as any;
      const riskRows = await this.db.getAllAsync(`
        SELECT * FROM risks WHERE assessment_id = ?
      `, [row.id]);

      const risks = riskRows.map(this.mapRowToRisk);

      assessments.push({
        id: row.id as string,
        projectId: row.project_id as string,
        risks,
        overallRiskScore: row.overall_risk_score as number,
        recommendations: [], // Recommendations are not stored in DB for simplicity
        createdAt: new Date(row.created_at as string),
        updatedAt: new Date(row.updated_at as string),
      });
    }

    return assessments;
  }

  // Historical project operations
  async saveHistoricalProject(project: HistoricalProject): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync(`
      INSERT OR REPLACE INTO historical_projects (
        id, project_type, size, location, estimated_cost, actual_cost,
        estimated_duration, actual_duration, completed_at,
        success_factors, challenges
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      project.id,
      project.projectType,
      project.size,
      project.location,
      project.estimatedCost,
      project.actualCost,
      project.estimatedDuration,
      project.actualDuration,
      project.completedAt.toISOString(),
      JSON.stringify(project.successFactors),
      JSON.stringify(project.challenges),
    ]);
  }

  async getHistoricalProjectsByType(projectType: string): Promise<HistoricalProject[]> {
    if (!this.db) throw new Error("Database not initialized");

    const rows = await this.db.getAllAsync(`
      SELECT * FROM historical_projects WHERE project_type = ? ORDER BY completed_at DESC
    `, [projectType]);

    return rows.map(this.mapRowToHistoricalProject);
  }

  // Helper methods to map database rows to objects
  private mapRowToProject(row: any): Project {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      location: row.location,
      startDate: new Date(row.start_date),
      estimatedEndDate: new Date(row.estimated_end_date),
      actualEndDate: row.actual_end_date ? new Date(row.actual_end_date) : undefined,
      status: row.status,
      budget: row.budget,
      estimatedCost: row.estimated_cost,
      actualCost: row.actual_cost,
      ownerId: row.owner_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToEstimate(row: any): ProjectEstimate {
    return {
      id: row.id,
      projectId: row.project_id,
      materialCosts: [], // Simplified - not storing detailed breakdown
      laborCosts: [],
      equipmentCosts: [],
      overheadCosts: [],
      totalCost: row.total_cost,
      timeline: {
        phases: [],
        totalDuration: row.timeline,
        criticalPath: [],
        milestones: [],
      },
      confidence: row.confidence,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      method: row.method,
    };
  }

  private mapRowToRisk(row: any) {
    return {
      id: row.id,
      category: row.category,
      description: row.description,
      probability: row.probability,
      impact: row.impact,
      riskScore: row.risk_score,
      mitigation: row.mitigation,
      status: row.status,
    };
  }

  private mapRowToHistoricalProject(row: any): HistoricalProject {
    return {
      id: row.id,
      projectType: row.project_type,
      size: row.size,
      location: row.location,
      estimatedCost: row.estimated_cost,
      actualCost: row.actual_cost,
      estimatedDuration: row.estimated_duration,
      actualDuration: row.actual_duration,
      completedAt: new Date(row.completed_at),
      successFactors: JSON.parse(row.success_factors || "[]"),
      challenges: JSON.parse(row.challenges || "[]"),
    };
  }

  async closeDatabase(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

export const databaseService = DatabaseService.getInstance();