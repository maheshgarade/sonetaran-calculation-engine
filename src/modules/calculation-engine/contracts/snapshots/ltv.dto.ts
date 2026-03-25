export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface LTVDTO {
  principal: number;
  collateralValue: number;

  ltv: number;

  riskLevel: RiskLevel;
}
