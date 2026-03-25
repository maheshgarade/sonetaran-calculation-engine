import { FunderType } from "@/modules/calculation-engine/enums/funder-type.enum";
import { DurationResult } from "@/modules/calculation-engine/core/duration/duration.types";

export interface TransferHistoryEntryDTO {
  funderType: FunderType;

  principal: number;

  startDate: Date;
  endDate?: Date | null;

  duration: DurationResult;

  isActive: boolean;
}

export interface TransferHistoryDTO {
  history: TransferHistoryEntryDTO[];

  totalFunded: number;
}
