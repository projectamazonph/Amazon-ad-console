'use client';

import { useAdConsoleStore } from '@/engine/ad-console/store';
import { Sidebar } from './layout/Sidebar';
import { Topbar } from './layout/Topbar';
import { Dashboard } from './Dashboard';
import { CampaignManager } from './CampaignManager';
import { CampaignDetail } from './CampaignDetail';
import { CreateCampaignWizard } from './CreateCampaignWizard';
import { PortfolioOverview } from './PortfolioOverview';

export function AdConsole() {
  const view = useAdConsoleStore((s) => s.view);
  const selectedCampaign = useAdConsoleStore((s) => s.selectedCampaign());
  const state = useAdConsoleStore((s) => s.state);
  const draft = useAdConsoleStore((s) => s.draft);
  const wizardStep = useAdConsoleStore((s) => s.wizardStep);
  const showAddKeywordForm = useAdConsoleStore((s) => s.showAddKeywordForm);

  const store = useAdConsoleStore;

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard />;
      case 'campaigns':
        return <CampaignManager />;
      case 'detail':
        return selectedCampaign ? <CampaignDetail campaign={selectedCampaign} /> : <CampaignManager />;
      case 'create':
        return <CreateCampaignWizard />;
      case 'portfolio':
        return <PortfolioOverview />;
      default:
        return <Dashboard />;
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
