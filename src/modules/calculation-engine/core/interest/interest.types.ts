export enum InterestUnit {
  MONTH = "month",
  YEAR = "year",
  DAYS = "days",
}

export interface InterestBreakdown {
  duration: number;
  interest: number;
  principal: number;
  rate: number;
  roi: number;
  total: number;
  unit: InterestUnit;
}

export interface PeriodicInterest {
  month: number;
  interest: number;
}
