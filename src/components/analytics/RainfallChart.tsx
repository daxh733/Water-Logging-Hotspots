import { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { BarChart3, Calendar, TrendingUp, CloudRain, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { rainfallData } from '@/data/mockData';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type ViewMode = 'yearly' | 'monthly';

// Year-wise monthly data (from IMD Delhi reports)
const yearlyMonthlyData: Record<number, number[]> = {
  2019: [5, 8, 12, 15, 25, 65, 180, 200, 110, 30, 8, 3],   // Total: 661mm
  2020: [3, 6, 10, 12, 20, 70, 220, 190, 100, 25, 5, 2],   // Total: 663mm
  2021: [4, 7, 15, 18, 28, 80, 210, 185, 95, 28, 6, 3],    // Total: 679mm
  2022: [6, 9, 14, 16, 22, 75, 195, 205, 105, 32, 7, 4],   // Total: 690mm
  2023: [7, 10, 16, 20, 30, 90, 265, 240, 115, 38, 9, 5],  // Total: 845mm (highest)
  2024: [5, 8, 13, 17, 24, 82, 230, 215, 108, 35, 7, 3],   // Total: 747mm
  2025: [6, 9, 14, 18, 26, 85, 250, 220, 120, 35, 8, 4],   // Total: 795mm (predicted)
};

export function RainfallChart() {
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  const yearlyData = useMemo<ChartData<'bar'>>(() => ({
    labels: rainfallData.map(d => d.year.toString()),
    datasets: [
      {
        label: 'Total Rainfall (mm)',
        data: rainfallData.map(d => d.total),
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'hsl(210 100% 50% / 0.8)';
          
          const dataIndex = context.dataIndex;
          const isPrediction = rainfallData[dataIndex]?.isPrediction;
          
          if (isPrediction) {
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, 'hsl(210 100% 50% / 0.2)');
            gradient.addColorStop(1, 'hsl(210 100% 50% / 0.4)');
            return gradient;
          }
          
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'hsl(210 100% 50% / 0.6)');
          gradient.addColorStop(1, 'hsl(210 100% 50% / 0.9)');
          return gradient;
        },
        borderColor: rainfallData.map(d => 
          d.isPrediction 
            ? 'hsl(210 100% 50% / 0.5)' 
            : 'hsl(210 100% 50% / 1)'
        ),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: 'hsl(210 100% 50% / 1)',
      },
    ],
  }), []);

  const monthlyData = useMemo<ChartData<'bar'>>(() => {
    // Get monthly data for selected year
    const monthlyRainfall = yearlyMonthlyData[selectedYear] || yearlyMonthlyData[2024];

    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: `${selectedYear} Rainfall (mm)`,
          data: monthlyRainfall,
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return 'hsl(210 100% 50% / 0.8)';
            
            // Different colors for different seasons
            const month = context.dataIndex;
            let colorPair;
            
            if (month >= 5 && month <= 8) {
              // Monsoon months (June-Sep) - Blue gradient
              colorPair = ['hsl(210 100% 50% / 0.6)', 'hsl(210 100% 50% / 0.9)'];
            } else if (month >= 3 && month <= 4) {
              // Pre-monsoon (Apr-May) - Orange gradient
              colorPair = ['hsl(38 92% 50% / 0.5)', 'hsl(38 92% 50% / 0.8)'];
            } else if (month === 9) {
              // Post-monsoon (Oct) - Purple gradient
              colorPair = ['hsl(280 65% 60% / 0.5)', 'hsl(280 65% 60% / 0.8)'];
            } else {
              // Winter/Dry months - Gray gradient
              colorPair = ['hsl(215 16% 47% / 0.3)', 'hsl(215 16% 47% / 0.5)'];
            }
            
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, colorPair[0]);
            gradient.addColorStop(1, colorPair[1]);
            return gradient;
          },
          borderColor: (context) => {
            const month = context.dataIndex;
            if (month >= 5 && month <= 8) return 'hsl(210 100% 50% / 1)';
            if (month >= 3 && month <= 4) return 'hsl(38 92% 50% / 1)';
            if (month === 9) return 'hsl(280 65% 60% / 1)';
            return 'hsl(215 16% 47% / 0.5)';
          },
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  }, [selectedYear]);

  const options: ChartOptions<'bar'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'hsl(0 0% 100%)',
        titleColor: 'hsl(222 47% 11%)',
        bodyColor: 'hsl(222 47% 11%)',
        borderColor: 'hsl(214 20% 88%)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        displayColors: false,
        titleFont: {
          weight: 600,
        },
        callbacks: {
          label: (context) => `${context.parsed.y} mm`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'hsl(215 16% 47%)',
          font: {
            weight: 500,
          },
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'hsl(214 20% 94%)',
        },
        ticks: {
          color: 'hsl(215 16% 47%)',
          callback: (value) => `${value}`,
        },
        border: {
          display: false,
        },
      },
    },
  }), []);

  // Calculate stats for selected year
  const selectedYearData = yearlyMonthlyData[selectedYear] || yearlyMonthlyData[2024];
  const yearTotal = selectedYearData.reduce((sum, val) => sum + val, 0);
  const peakMonth = selectedYearData.indexOf(Math.max(...selectedYearData));
  const peakMonthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][peakMonth];
  const peakMonthValue = selectedYearData[peakMonth];

  // Calculate overall stats
  const recordedData = rainfallData.filter(d => !d.isPrediction);
  const avgRainfall = Math.round(recordedData.reduce((sum, d) => sum + d.total, 0) / recordedData.length);
  const maxRainfall = Math.max(...recordedData.map(d => d.total));
  const maxYear = recordedData.find(d => d.total === maxRainfall)?.year;
  const current2024 = rainfallData.find(d => d.year === 2024)?.total || 0;
  const avgDiff = ((current2024 - avgRainfall) / avgRainfall * 100).toFixed(1);
  const isAboveAvg = current2024 > avgRainfall;

  // Risk insight
  const riskInsight = isAboveAvg 
    ? `2024 rainfall is ${Math.abs(parseFloat(avgDiff))}% above historical average, indicating elevated flood risk this season.`
    : `2024 rainfall is ${Math.abs(parseFloat(avgDiff))}% below historical average, suggesting moderate flood conditions.`;

  // Year comparison
  const yearVsAvg = ((yearTotal - avgRainfall) / avgRainfall * 100).toFixed(1);
  const isYearAboveAvg = yearTotal > avgRainfall;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="glass-card-elevated rounded-2xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl gradient-primary shadow-lg">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">Rainfall Analytics</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {viewMode === 'yearly' ? 'Historical monsoon data 2019-2025' : `Monthly breakdown for ${selectedYear}`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-xl overflow-hidden border border-border bg-secondary/30 p-0.5">
                <Button
                  size="sm"
                  variant={viewMode === 'yearly' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('yearly')}
                  className="rounded-lg h-8"
                >
                  <Calendar className="h-4 w-4 mr-1.5" />
                  Yearly
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'monthly' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('monthly')}
                  className="rounded-lg h-8"
                >
                  <TrendingUp className="h-4 w-4 mr-1.5" />
                  Monthly
                </Button>
              </div>

              {viewMode === 'monthly' && (
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl bg-card border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {rainfallData.map(d => (
                    <option key={d.year} value={d.year}>
                      {d.year} {d.isPrediction ? '(Predicted)' : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          {/* Stats Row - Dynamic based on view mode */}
          {viewMode === 'yearly' ? (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <CloudRain className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Average</span>
                </div>
                <p className="text-2xl font-bold text-primary">{avgRainfall}</p>
                <p className="text-xs text-muted-foreground">mm / year</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Peak</span>
                </div>
                <p className="text-2xl font-bold text-success">{maxRainfall}</p>
                <p className="text-xs text-muted-foreground">mm in {maxYear}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/10">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-warning" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">2024</span>
                </div>
                <p className="text-2xl font-bold text-warning">{current2024}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className={isAboveAvg ? 'text-destructive' : 'text-success'}>
                    {isAboveAvg ? '+' : ''}{avgDiff}%
                  </span>
                  vs avg
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <CloudRain className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Year Total</span>
                </div>
                <p className="text-2xl font-bold text-primary">{yearTotal}</p>
                <p className="text-xs text-muted-foreground">mm in {selectedYear}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Peak Month</span>
                </div>
                <p className="text-2xl font-bold text-success">{peakMonthValue}</p>
                <p className="text-xs text-muted-foreground">{peakMonthName} {selectedYear}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/10">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-warning" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">vs Average</span>
                </div>
                <p className="text-2xl font-bold text-warning">{isYearAboveAvg ? '+' : ''}{yearVsAvg}%</p>
                <p className="text-xs text-muted-foreground">{isYearAboveAvg ? 'Above' : 'Below'} avg</p>
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="h-[320px] mb-4">
            <Bar data={viewMode === 'yearly' ? yearlyData : monthlyData} options={options} />
          </div>

          {/* Legend */}
          {viewMode === 'yearly' ? (
            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded bg-gradient-to-t from-primary/60 to-primary/90 border border-primary" />
                <span className="text-xs">Recorded Data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded bg-gradient-to-t from-primary/20 to-primary/40 border border-primary/50 border-dashed" />
                <span className="text-xs">Predicted</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded bg-gradient-to-t from-primary/60 to-primary/90 border border-primary" />
                <span className="text-xs">Monsoon (Jun-Sep)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded bg-gradient-to-t from-warning/50 to-warning/80 border border-warning" />
                <span className="text-xs">Pre-Monsoon</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded bg-gradient-to-t from-purple-400/50 to-purple-400/80 border border-purple-400" />
                <span className="text-xs">Post-Monsoon</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded bg-gradient-to-t from-gray-400/30 to-gray-400/50 border border-gray-400/50" />
                <span className="text-xs">Dry Season</span>
              </div>
            </div>
          )}

          {/* Insight Card */}
          <div className={`insight-card flex items-start gap-3 ${isAboveAvg ? 'bg-warning/5 border-warning/15' : 'bg-success/5 border-success/15'}`}>
            <div className={`p-1.5 rounded-lg ${isAboveAvg ? 'bg-warning/10' : 'bg-success/10'}`}>
              {isAboveAvg ? (
                <AlertTriangle className="h-4 w-4 text-warning" />
              ) : (
                <Info className="h-4 w-4 text-success" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground mb-0.5">
                {viewMode === 'yearly' ? 'Risk Insight' : `${selectedYear} Analysis`}
              </p>
              <p className="text-xs text-muted-foreground">
                {viewMode === 'yearly' 
                  ? riskInsight 
                  : `${selectedYear} recorded ${yearTotal}mm total rainfall, which is ${Math.abs(parseFloat(yearVsAvg))}% ${isYearAboveAvg ? 'above' : 'below'} the historical average. Peak rainfall occurred in ${peakMonthName} with ${peakMonthValue}mm.`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
