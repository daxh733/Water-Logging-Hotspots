import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { WardGrid } from '@/components/wards/WardGrid';
import { HotspotsList } from '@/components/wards/HotspotsList';
import { Building2 } from 'lucide-react';

const Wards = () => {
  return (
    <Layout>
      <Helmet>
        <title>Wards - Delhi WaterWatch</title>
        <meta name="description" content="View monsoon readiness status and manage resources for all Delhi wards." />
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
            Ward Management
          </h1>
          <p className="text-muted-foreground">Monitor readiness and deploy resources across all wards</p>
        </div>

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
