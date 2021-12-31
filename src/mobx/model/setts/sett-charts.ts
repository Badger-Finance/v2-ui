export interface SettChartData {
  address: string;
  height: number;
  timestamp: Date;
  balance: number;
  supply: number;
  ratio: number;
  value: number;
}

export enum ChartMode {
  Value = 'value',
  Ratio = 'ratio',
  AccountBalance = 'accountBalance',
  BoostMultiplier = 'boostMultiplier',
}

export enum SettChartTimeframe {
  Day = 'day',
  Week = 'week',
  Month = 'month',
}
