import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { AlertsPanel } from '@/components/alerts/AlertsPanel';
import { AlertTriangle, Bell, Settings, X, Volume2, Mail, Phone, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const Alerts = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    soundEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    criticalAlerts: true,
    highAlerts: true,
    mediumAlerts: true,
    lowAlerts: false,
    email: '',
    phone: '',
  });

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    toast.success('Alert settings saved successfully!');
    setSettingsOpen(false);
  };

  return (
    <Layout>
      <Helmet>
        <title>Alerts - Delhi WaterWatch</title>
        <meta name="description" content="Real-time alerts and notifications for water-logging incidents across Delhi." />
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
              <Bell className="h-7 w-7 text-primary" />
              Alerts Center
            </h1>
            <p className="text-muted-foreground">Real-time notifications and incident management</p>
          </div>
          
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Alert Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Alert Settings
                </DialogTitle>
                <DialogDescription>
                  Configure how you receive alerts and notifications
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Notification Methods */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Notification Methods</h4>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound" className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                      Sound Alerts
                    </Label>
                    <Switch
                      id="sound"
                      checked={settings.soundEnabled}
                      onCheckedChange={(val) => handleSettingChange('soundEnabled', val)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email Notifications
                    </Label>
                    <Switch
                      id="email"
                      checked={settings.emailNotifications}
                      onCheckedChange={(val) => handleSettingChange('emailNotifications', val)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms" className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      SMS Notifications
                    </Label>
                    <Switch
                      id="sms"
                      checked={settings.smsNotifications}
                      onCheckedChange={(val) => handleSettingChange('smsNotifications', val)}
                    />
                  </div>
                </div>

                {/* Alert Types */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Alert Types</h4>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="critical" className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-destructive" />
                      Critical Alerts
                    </Label>
                    <Switch
                      id="critical"
                      checked={settings.criticalAlerts}
                      onCheckedChange={(val) => handleSettingChange('criticalAlerts', val)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="high" className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-warning" />
                      High Priority
                    </Label>
                    <Switch
                      id="high"
                      checked={settings.highAlerts}
                      onCheckedChange={(val) => handleSettingChange('highAlerts', val)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="medium" className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      Medium Priority
                    </Label>
                    <Switch
                      id="medium"
                      checked={settings.mediumAlerts}
                      onCheckedChange={(val) => handleSettingChange('mediumAlerts', val)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="low" className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                      Low Priority
                    </Label>
                    <Switch
                      id="low"
                      checked={settings.lowAlerts}
                      onCheckedChange={(val) => handleSettingChange('lowAlerts', val)}
                    />
                  </div>
                </div>

                {/* Contact Info */}
                {(settings.emailNotifications || settings.smsNotifications) && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Contact Information</h4>
                    {settings.emailNotifications && (
                      <div>
                        <Label htmlFor="emailInput" className="text-xs text-muted-foreground">Email Address</Label>
                        <Input
                          id="emailInput"
                          type="email"
                          placeholder="your@email.com"
                          value={settings.email}
                          onChange={(e) => handleSettingChange('email', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    )}
                    {settings.smsNotifications && (
                      <div>
                        <Label htmlFor="phoneInput" className="text-xs text-muted-foreground">Phone Number</Label>
                        <Input
                          id="phoneInput"
                          type="tel"
                          placeholder="+91 9876543210"
                          value={settings.phone}
                          onChange={(e) => handleSettingChange('phone', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setSettingsOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 gradient-primary text-primary-foreground" onClick={handleSaveSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-[600px]">
            <AlertsPanel />
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-warning/20">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Alert Summary</h3>
                <p className="text-sm text-muted-foreground">Last 24 hours overview</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
                  <span className="font-medium">Critical Alerts</span>
                </div>
                <span className="text-2xl font-bold text-destructive">1</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-warning/10 border border-warning/20">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-warning" />
                  <span className="font-medium">High Priority</span>
                </div>
                <span className="text-2xl font-bold text-warning">2</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-primary" />
                  <span className="font-medium">Medium Priority</span>
                </div>
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary border border-border">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-muted-foreground" />
                  <span className="font-medium">Low Priority</span>
                </div>
                <span className="text-2xl font-bold">1</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Alerts;