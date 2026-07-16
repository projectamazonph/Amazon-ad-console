'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';
import { Sidebar } from './layout/Sidebar';
import { Topbar } from './layout/Topbar';
import { Dashboard } from './Dashboard';
import { CampaignManager } from './CampaignManager';
import { CampaignDetail } from './CampaignDetail';
import { CreateCampaignWizard } from './CreateCampaignWizard';
import { PortfolioOverview } from './PortfolioOverview';
import { DrillsPage } from './features/drills/DrillsPage';
import { MissionsPage } from './features/missions/MissionsPage';
import { ReportsPage } from './features/reports/ReportsPage';
import { BulkOpsPage } from './features/bulk/BulkOpsPage';
import { TrainerPage } from './features/trainer/TrainerPage';
import { IntegrityPage } from './features/integrity/IntegrityPage';

export function AdConsole() {
  const view = useAdConsoleStore((s) => s.view);
  const selectedCampaign = useAdConsoleStore((s) => s.selectedCampaign());

  const renderView = () => {
    switch (view) {
      case 'dashboard': return <Dashboard />;
      case 'campaigns': return <CampaignManager />;
      case 'detail': return selectedCampaign ? <CampaignDetail campaign={selectedCampaign} /> : <CampaignManager />;
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
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <div className="app-content">
          {renderView()}
        </div>
      </div>
    </div>
  );
}
