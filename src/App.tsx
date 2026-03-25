import { useEffect } from "react";
import "./App.css";
import { mockData } from "./mockData";
import { CalculationEngine } from "./modules/calculation-engine/orchestrators/calculation.engine";
import type {
  FundingData,
  FundingSlice,
} from "./modules/funding/funding.types";
import type { KalamType } from "./modules/kalams/kalam.types";

function App() {
  useEffect(() => {
    // Example: take the first Kalam entry
    const kalam = mockData.data[1].kalam;
    const fundingSlices = mockData.data[1].fundingDetails;
    // const itemDetails = mockData.data[0].itemDetails;
    // const fundingDetails = mockData.data[0].fundingDetails;

    const profitLossSnapshot: FundingData =
      CalculationEngine.calculateProfitLossSnapshot(
        fundingSlices as FundingSlice[],
        kalam as KalamType,
      );
    console.log("📊 Profit/Loss Snapshot:", profitLossSnapshot);
  }, []);

  return <div></div>;
}

export default App;
