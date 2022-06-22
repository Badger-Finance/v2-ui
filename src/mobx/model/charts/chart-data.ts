import { MarketChartStats } from './market-chart-stats';
import { MarketDelta } from './market-delta';

export interface ChartData {
  from: Date;
  to: Date;
  data: MarketDelta[];
  stats: MarketChartStats;
}
