import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { WardGrid } from '@/components/wards/WardGrid';
import { HotspotsList } from '@/components/wards/HotspotsList';
import { Building2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Wards = () => {
  return (
    <Layout>
      <Helmet>
        <title>Ward Monsoon Preparedness - Delhi WaterWatch</title>
        <meta name="description" content="Monitor ward-level monsoon preparedness and flood response capacity across Delhi" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
            <Building2 className="h-7 w-7 text-primary" />
            Ward-Level Monsoon Preparedness
          </h1>
          <p className="text-muted-foreground">Monitor flood response readiness and resource allocation for water-logging hotspots across all wards</p>
        </div>

        {/* Explanatory Banner */}
        <Alert className="glass-card border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            <strong>Ward Readiness Score:</strong> Measures each ward's capacity to handle water-logging incidents based on identified flood hotspots, 
            active alerts, and available response resources (pumps, personnel, vehicles). Higher scores indicate better monsoon preparedness.
          </AlertDescription>
        </Alert>

        <WardGrid />

        {/* Marked Hotspots Section */}
        <div className="mt-8">
          <HotspotsList />
        </div>
      </motion.div>
    </Layout>
  );
};

export default Wards;
