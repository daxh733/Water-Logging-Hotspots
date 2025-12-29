import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { RainfallChart } from '@/components/analytics/RainfallChart';
import { BarChart3, TrendingUp, CloudRain, Droplets, FileDown } from 'lucide-react';
import { rainfallData } from '@/data/mockData';
import { Button } from '@/components/ui/button';

const Analytics = () => {
  const latestYear = rainfallData[rainfallData.length - 2];
  const avgRainfall = Math.round(rainfallData.slice(0, -1).reduce((sum, d) => sum + d.total, 0) / (rainfallData.length - 1));
  const maxRainfall = Math.max(...rainfallData.slice(0, -1).map(d => d.total));
  const peakMonth = 'July';

  const analyticsStats = [
    { label: '2024 Total', value: `${latestYear.total} mm`, icon: CloudRain, color: 'text-primary' },
    { label: 'Avg (2019-24)', value: `${avgRainfall} mm`, icon: TrendingUp, color: 'text-success' },
    { label: 'Peak Year', value: `${maxRainfall} mm`, icon: Droplets, color: 'text-warning' },
    { label: 'Peak Month', value: peakMonth, icon: BarChart3, color: 'text-accent' },
  ];

  // PDF Download Handler
  const handlePDFDownload = () => {
    const pdfUrl = 'https://mausam.imd.gov.in/newdelhi/mcdata/delhi_forecast.pdf';
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.target = '_blank';
    link.download = 'delhi_weather_forecast.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <Helmet>
        <title>Analytics - Delhi WaterWatch</title>
        <meta name="description" content="Rainfall analytics and historical data for Delhi monsoon seasons from 2019-2025." />
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header with PDF Button */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-primary" />
              Analytics
            </h1>
            <p className="text-muted-foreground">Historical rainfall data and predictions for monsoon planning</p>
          </div>

          {/* PDF Download Button */}
          <Button
            onClick={handlePDFDownload}
            className="flex items-center gap-2 rounded-full"
            variant="outline"
          >
            <FileDown className="h-4 w-4" />
            <span>Download IMD Forecast</span>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {analyticsStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="glass-card p-4 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Chart */}
        <RainfallChart />

        {/* Additional insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 glass-card rounded-xl p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <h3 className="font-semibold text-lg">Key Insights</h3>
            
            {/* Additional PDF Link in Insights Section */}
            <button
              onClick={handlePDFDownload}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <FileDown className="h-4 w-4" />
              Official IMD Report
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h4 className="font-medium mb-2 text-primary">2023 Record Year</h4>
              <p className="text-sm text-muted-foreground">
                2023 recorded the highest monsoon rainfall at 738mm, causing significant waterlogging incidents across the city.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <h4 className="font-medium mb-2 text-success">2025 Prediction</h4>
              <p className="text-sm text-muted-foreground">
                Based on IMD forecasts, 2025 is expected to receive around 675mm rainfall, slightly above the 6-year average.
              </p>
            </div>
          </div>

          {/* Data Source Info */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              📊 Data Source: India Meteorological Department (IMD), New Delhi
            </p>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Analytics;
