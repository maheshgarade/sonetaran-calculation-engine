derivedFinancials

duration: {string: ""},

ltv: {available: {amt: 0, percentage: 0}, used: {amt: 0, percentage: 0}}

profitLossSnapshot: {
fundingDue: {
customer: {breakdown: [{}], interest: {total: 0, monthly: 0}, principal, total: 0, },
vyapari: {breakdown: [{}], interest: {total: 0, monthly: 0}, principal, total: 0, },
dukandar: {breakdown: [{}], interest: {total: 0, monthly: 0}, principal, total: 0, },
overBorrowed: {breakdown: [{}], interest: {total: 0, monthly: 0}, principal, total: 0, },
},
totalFundingDue: 0,
monthlyMargin: 0,
totalMargin: 0
},

itemsAndValuation: {items: [{}], totalValue: {today: 0, kalamCreation: 0}, totalWeight: {gross: 0, net: 0}},

transferHistory: [{
startDate: '',
endDate: '',
durationString: '',
fundingStatus: '',
funderType: '',
funderName: '',
interest: {rate: 1.5, type: "simple", compoundFrequency: null, extraMonths: null},
terms: {"duration": "monthly_15", "graceDays": 1}
}]

---

// Calculation logic
monthlyProfit = customer monthly interest - (vyapari monthly interest + overborrwed monthly interest);
totalProfit = customer total interest - (vyapari total interest + overborrwed total interest);
totalFunding = dukandar total due + overborrwed total due
