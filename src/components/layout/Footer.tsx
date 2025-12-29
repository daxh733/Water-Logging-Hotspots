import { ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="glass-card border-t border-border/50 mt-8">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">About</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            <a href="#" className="hover:text-foreground transition-colors">Data Sources</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>Data sources:</span>
            <a href="https://mausam.imd.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
              IMD <ExternalLink className="h-3 w-3" />
            </a>
            <span>•</span>
            <a href="#" className="flex items-center gap-1 hover:text-primary transition-colors">
              OpenCity Delhi <ExternalLink className="h-3 w-3" />
            </a>
            <span>•</span>
            <a href="https://datameet.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
              DataMeet <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        
        <div className="text-center mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            © 2024 Delhi WaterWatch. Built for flood management and citizen safety.
          </p>
        </div>
      </div>
    </footer>
  );
}
