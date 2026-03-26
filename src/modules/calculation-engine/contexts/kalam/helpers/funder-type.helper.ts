import { FunderType } from "@/modules/calculation-engine/enums/funder-type.enum";

/**
 * Normalizes funderType coming from DB or external sources
 * into a strict FunderType enum.
 */
export const normalizeFunderType = (value?: string | null): FunderType => {
  if (!value) {
    throw new Error("Invalid funderType: value is missing");
  }

  const normalized = value.toString().trim().toUpperCase();

  switch (normalized) {
    case "VYAPARI":
      return FunderType.VYAPARI;

    case "DUKANDAR":
      return FunderType.DUKANDAR;

    default:
      throw new Error(`Invalid funderType: ${value}`);
  }
};
