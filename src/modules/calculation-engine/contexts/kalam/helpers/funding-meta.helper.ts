export function buildFundingMeta({
  rate,
  type,
  compoundFrequency,
  extraMonths,
  duration,
  graceDays,
  monthly,
  total,
}: {
  rate: number;
  type: string;
  compoundFrequency?: string | null;
  extraMonths?: number | null;
  duration: string;
  graceDays?: number | null;
  monthly: number;
  total: number;
}) {
  return {
    interest: {
      rate,
      type,
      compoundFrequency: compoundFrequency ?? null,
      extraMonths: extraMonths ?? null,
      monthly,
      total,
    },
    terms: {
      duration,
      graceDays: graceDays ?? 0,
    },
  };
}
