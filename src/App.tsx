import { useEffect } from "react";
import "./App.css";
import { mockData } from "./mockData";
import type { FundingSlice } from "./modules/funding/funding.types";
import type { KalamType } from "./modules/kalams/kalam.types";
import { ProfitLossSnapshot } from "./modules/calculation-engine/contexts/kalam/snapshots/profit-loss.snapshot";
import { FundingData } from "./modules/kalams/kalam-snapshot.model";

function App() {
  useEffect(() => {
    // Example: take the first Kalam entry
    const kalam = mockData.data[1].kalam;
    const fundingSlices = mockData.data[1].fundingDetails;
    // const itemDetails = mockData.data[0].itemDetails;

    const profitLossSnapshot: FundingData = ProfitLossSnapshot.compute(
      fundingSlices as unknown as FundingSlice[],
      kalam as KalamType,
    );
    console.log("📊 Profit/Loss Snapshot:", profitLossSnapshot);
  }, []);
}

export default App;
