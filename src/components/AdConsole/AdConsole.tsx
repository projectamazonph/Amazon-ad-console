'use client';

import { Button } from '@astryxdesign/core/Button';
import { useAdConsoleStore } from '@/engine/ad-console/store';

import { Topbar } from './layout/Topbar';
import { Sidebar } from './layout/Sidebar';
import { ErrorBoundary } from './ErrorBoundary';
import { Dashboard } from './Dashboard';
import { CampaignManager } from './CampaignManager';
import { CampaignDetail } from './CampaignDetail';
import { CreateCampaignWizard } from './wizard/CreateCampaignWizard';
import { PortfolioOverview } from './PortfolioOverview';
import { DrillsPage } from './features/drills/DrillsPage';
import { MissionsPage } from './features/missions/MissionsPage';
import { ReportsPage } from './features/reports/ReportsPage';
import { BulkOpsPage } from './features/bulk/BulkOpsPage';
import { TrainerPage } from './features/trainer/TrainerPage';
import { IntegrityPage } from './features/integrity/IntegrityPage';

export function AdConsole() {
  const view = useAdConsoleStore((s) => s.view);
  const setView = useAdConsoleStore((s) => s.setView);
  const selectedCampaign = useAdConsoleStore((s) => s.selectedCampaign());

  const renderView = () => {
    switch (view) {
      case 'dashboard': return <Dashboard />;
      case 'campaigns': return <CampaignManager />;
      case 'detail': return selectedCampaign ? <CampaignDetail campaign={selectedCampaign} /> : (
    <div className="empty" style={{ marginTop: 80 }}>
      
      <h3>Campaign not found</h3>
      <p>The campaign you selected may have been archived or deleted.</p>
      <Button label="Back to campaigns" variant="primary" onClick={() => setView('campaigns')} />
    </div>
  );
      case 'create': return <CreateCampaignWizard />;
      case 'portfolio': return <PortfolioOverview />;
      case 'drills': return <DrillsPage />;
      case 'missions': return <MissionsPage />;
      case 'reports': return <ReportsPage />;
      case 'bulk': return <BulkOpsPage />;
      case 'trainer': return <TrainerPage />;
      case 'integrity': return <IntegrityPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Topbar />
      <div className="app-body">
        <Sidebar />
        <main id="main-content" className="app-main" tabIndex={-1}>
          <ErrorBoundary>
            <div className="app-content">{renderView()}</div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
