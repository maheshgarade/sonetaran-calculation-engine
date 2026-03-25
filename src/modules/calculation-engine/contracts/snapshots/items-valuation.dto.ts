export interface ItemValuationDTO {
  itemId: string;

  weight: number;
  purity: number;
  rate: number;

  value: number;
}

export interface ItemsValuationDTO {
  items: ItemValuationDTO[];

  totalWeight: number;
  totalValue: number;
}
