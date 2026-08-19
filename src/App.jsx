import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2 } from 'lucide-react';
import NavigationHeader from './components/NavigationHeader';
import DashboardOverview from './components/DashboardOverview';
import ContentPlanModule from './components/ContentPlanModule';
import MarketingPlanModule from './components/MarketingPlanModule';
import ProductPlanModule from './components/ProductPlanModule';
import PromotionPlanModule from './components/PromotionPlanModule';
import TodoListModule from './components/TodoListModule';
import KpiAnalyticsModule from './components/KpiAnalyticsModule';
import SchemaViewerModal from './components/SchemaViewerModal';
import {
  upsertContentItemToSupabase,
  deleteContentItemFromSupabase,
  upsertCampaignToSupabase,
  upsertProductToSupabase
} from './services/dataService';

import {
  INITIAL_TEAMS,
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_MARKETING_PLANS,
  INITIAL_CAMPAIGN_IDEAS,
  INITIAL_CAMPAIGNS,
  INITIAL_CONTENT_ITEMS,
  INITIAL_CONTENT_GROUPS,
  INITIAL_IDEA_VAULT,
  INITIAL_NOTIFICATION_RULES,
  INITIAL_NOTIFICATION_LOGS
} from './data/initialData';

export default function App() {
  // Global State
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [activeTeamId, setActiveTeamId] = useState('team-1');

  const [users, setUsers] = useState(INITIAL_USERS);
  const [activeUserId, setActiveUserId] = useState('user-1');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [schemaModalOpen, setSchemaModalOpen] = useState(false);

  // Module Data States with localStorage persistence (Auto-save for Local & Production)
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('nitan_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [marketingPlans, setMarketingPlans] = useState(() => {
    const saved = localStorage.getItem('nitan_marketingPlans');
    return saved ? JSON.parse(saved) : INITIAL_MARKETING_PLANS;
  });

  const [campaignIdeas, setCampaignIdeas] = useState(() => {
    const saved = localStorage.getItem('nitan_campaignIdeas');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGN_IDEAS;
  });

  const [campaigns, setCampaigns] = useState(() => {
    const saved = localStorage.getItem('nitan_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });

  const [contentItems, setContentItems] = useState(() => {
    const saved = localStorage.getItem('nitan_contentItems');
    return saved ? JSON.parse(saved) : INITIAL_CONTENT_ITEMS;
  });

  const [contentGroups, setContentGroups] = useState(() => {
    const saved = localStorage.getItem('nitan_contentGroups');
    return saved ? JSON.parse(saved) : INITIAL_CONTENT_GROUPS;
  });

  const [ideaVault, setIdeaVault] = useState(() => {
    const saved = localStorage.getItem('nitan_ideaVault');
    return saved ? JSON.parse(saved) : INITIAL_IDEA_VAULT;
  });

  const [notificationRules, setNotificationRules] = useState(INITIAL_NOTIFICATION_RULES);
  const [notificationLogs, setNotificationLogs] = useState(INITIAL_NOTIFICATION_LOGS);

  // Auto-Sync to localStorage on changes
  React.useEffect(() => {
    localStorage.setItem('nitan_products', JSON.stringify(products));
    localStorage.setItem('nitan_marketingPlans', JSON.stringify(marketingPlans));
    localStorage.setItem('nitan_campaignIdeas', JSON.stringify(campaignIdeas));
    localStorage.setItem('nitan_campaigns', JSON.stringify(campaigns));
    localStorage.setItem('nitan_contentItems', JSON.stringify(contentItems));
    localStorage.setItem('nitan_contentGroups', JSON.stringify(contentGroups));
    localStorage.setItem('nitan_ideaVault', JSON.stringify(ideaVault));
  }, [products, marketingPlans, campaignIdeas, campaigns, contentItems, contentGroups, ideaVault]);

  // Filtered by Tenant (team_id)
  const currentTeamContent = contentItems.filter(c => c.team_id === activeTeamId);
  const currentTeamCampaigns = campaigns.filter(c => c.team_id === activeTeamId);
  const currentTeamProducts = products.filter(p => p.team_id === activeTeamId);
  const currentTeamMarketingPlans = marketingPlans.filter(m => m.team_id === activeTeamId);
  const currentTeamIdeas = campaignIdeas.filter(i => i.team_id === activeTeamId);
  const currentTeamVault = ideaVault.filter(v => v.team_id === activeTeamId);
  const currentTeamRules = notificationRules.filter(r => r.team_id === activeTeamId);
  const currentTeamLogs = notificationLogs.filter(l => l.team_id === activeTeamId);

  // Global Auto-Save UX Notification Toast State
  const [saveToast, setSaveToast] = useState(null);

  const showSaveToast = (message, type = 'success') => {
    const id = Date.now();
    setSaveToast({ id, message, type });
    setTimeout(() => {
      setSaveToast(prev => (prev?.id === id ? null : prev));
    }, 3500);
  };

  // Handlers for Module 1: Content Plan
  const handleAddContentItem = (newItem) => {
    setContentItems(prev => [newItem, ...prev]);
    upsertContentItemToSupabase(newItem);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    showSaveToast('บันทึกเพิ่มคอนเทนต์ใหม่ลง DB และ LocalStorage เรียบร้อยแล้ว!');
  };

  const handleUpdateContentStatus = (id, newStatus) => {
    setContentItems(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, status: newStatus } : item);
      const targetItem = updated.find(i => i.id === id);
      if (targetItem) upsertContentItemToSupabase(targetItem);
      return updated;
    });
    showSaveToast('อัปเดตสถานะคอนเทนต์ลง DB เรียบร้อยแล้ว!');
  };

  const handleEditContentItem = (updatedItem) => {
    setContentItems(prev => prev.map(item => item.id === updatedItem.id ? { ...item, ...updatedItem } : item));
    upsertContentItemToSupabase(updatedItem);
    showSaveToast('บันทึกการแก้ไขคอนเทนต์เรียบร้อยแล้ว!');
  };

  const handleDeleteContentItem = (id) => {
    setContentItems(prev => prev.filter(item => item.id !== id));
    deleteContentItemFromSupabase(id);
    showSaveToast('ลบคอนเทนต์เรียบร้อยแล้ว!');
  };

  const handleAddContentGroup = (newGroup) => {
    setContentGroups(prev => [...prev, newGroup]);
    showSaveToast('บันทึกกลุ่มคอนเทนต์ใหม่เรียบร้อยแล้ว!');
  };

  const handleDeleteContentGroup = (groupId) => {
    setContentGroups(prev => prev.filter(g => g.id !== groupId));
    showSaveToast('ลบกลุ่มคอนเทนต์เรียบร้อยแล้ว!');
  };

  const handleAddVaultIdea = (newIdea) => {
    setIdeaVault(prev => [newIdea, ...prev]);
    showSaveToast('บันทึกไอเดียลง คลังไอเดีย (Idea Vault) เรียบร้อยแล้ว!');
  };

  const handleConvertVaultIdeaToContent = (idea) => {
    const newContent = {
      id: `cnt-${Date.now()}`,
      team_id: activeTeamId,
      campaign_id: currentTeamCampaigns[0]?.id || '',
      creator_id: activeUserId,
      title: `[Draft Plan] ${idea.title}`,
      caption: idea.notes,
      platform: idea.platforms[0] || 'tiktok',
      status: 'draft',
      publish_date: new Date(Date.now() + 86400000 * 3).toISOString(),
      media_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
      performance: { views: 0, likes: 0, comments: 0, shares: 0, ctr: 0 }
    };

    setContentItems(prev => [newContent, ...prev]);
    setIdeaVault(prev => prev.filter(v => v.id !== idea.id));
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    showSaveToast('ย้ายไอเดียเป็นแผนคอนเทนต์และบันทึกเรียบร้อยแล้ว!');
  };

  // Handlers for Module 3: Marketing Plan
  const handleUpdateStrategyCanvas = (planId, updatedFields) => {
    setMarketingPlans(prev => prev.map(m => m.id === planId ? { ...m, ...updatedFields } : m));
    showSaveToast('บันทึกกรอบกลยุทธ์การตลาด (Strategy Canvas) เรียบร้อยแล้ว!');
  };

  const handleUpvoteIdea = (ideaId) => {
    setCampaignIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, upvotes: i.upvotes + 1 } : i));
  };

  const handleAddCampaignIdea = (newIdea) => {
    setCampaignIdeas(prev => [newIdea, ...prev]);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    showSaveToast('บันทึกไอเดียแคมเปญใหม่เรียบร้อยแล้ว!');
  };

  // Handlers for Module 2: Product Plan
  const handleToggleStageChecklist = (campaignId, stageId, itemIndex) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id !== campaignId) return c;
      const updatedStages = c.stages.map(s => {
        if (s.id !== stageId) return s;
        const updatedChecklist = [...s.checklist];
        updatedChecklist[itemIndex] = {
          ...updatedChecklist[itemIndex],
          completed: !updatedChecklist[itemIndex].completed
        };
        return { ...s, checklist: updatedChecklist };
      });
      const updatedCampaign = { ...c, stages: updatedStages };
      upsertCampaignToSupabase(updatedCampaign);
      return updatedCampaign;
    }));
    showSaveToast('บันทึกสถานะ Checklist สินค้าลง DB เรียบร้อยแล้ว!');
  };

  const handleAddCampaign = (newCampaign) => {
    setCampaigns(prev => [newCampaign, ...prev]);
    upsertCampaignToSupabase(newCampaign);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    showSaveToast('บันทึกเพิ่มแคมเปญสินค้าใหม่ลง DB เรียบร้อยแล้ว!');
  };

  // Notification Engine Triggering Simulation
  const handleTriggerNotification = (logEntry) => {
    setNotificationLogs(prev => [logEntry, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#FCFAF7] text-purple-950 font-sans selection:bg-purple-200 selection:text-purple-950 flex flex-col justify-between">
      
      <div>
        {/* Navigation Bar */}
        <NavigationHeader
          teams={teams}
          activeTeamId={activeTeamId}
          onSelectTeam={setActiveTeamId}
          users={users}
          activeUserId={activeUserId}
          onSelectUser={setActiveUserId}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          notificationLogs={currentTeamLogs}
          onOpenSchemaModal={() => setSchemaModalOpen(true)}
        />

        {/* Main Content Area - Full Widescreen Layout */}
        <main className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              campaigns={currentTeamCampaigns}
              contentItems={currentTeamContent}
              marketingPlans={currentTeamMarketingPlans}
              notificationLogs={currentTeamLogs}
              onNavigateTab={setActiveTab}
              onTriggerNotification={handleTriggerNotification}
            />
          )}

          {activeTab === 'content-plan' && (
            <ContentPlanModule
              contentItems={currentTeamContent}
              contentGroups={contentGroups}
              ideaVault={currentTeamVault}
              campaigns={currentTeamCampaigns}
              onAddContentItem={handleAddContentItem}
              onUpdateContentStatus={handleUpdateContentStatus}
              onEditContentItem={handleEditContentItem}
              onDeleteContentItem={handleDeleteContentItem}
              onAddContentGroup={handleAddContentGroup}
              onDeleteContentGroup={handleDeleteContentGroup}
              onAddVaultIdea={handleAddVaultIdea}
              onConvertVaultIdeaToContent={handleConvertVaultIdeaToContent}
            />
          )}

          {activeTab === 'product-plan' && (
            <ProductPlanModule
              campaigns={currentTeamCampaigns}
              products={currentTeamProducts}
              onToggleStageChecklist={handleToggleStageChecklist}
              onAddCampaign={handleAddCampaign}
            />
          )}

          {activeTab === 'marketing-plan' && (
            <MarketingPlanModule
              marketingPlans={currentTeamMarketingPlans}
              campaignIdeas={currentTeamIdeas}
              campaigns={currentTeamCampaigns}
              onUpdateStrategyCanvas={handleUpdateStrategyCanvas}
              onUpvoteIdea={handleUpvoteIdea}
              onAddCampaignIdea={handleAddCampaignIdea}
            />
          )}

          {activeTab === 'promotion-plan' && (
            <PromotionPlanModule
              products={currentTeamProducts}
              campaigns={currentTeamCampaigns}
              onTriggerNotification={handleTriggerNotification}
              onShowSaveToast={showSaveToast}
            />
          )}

          {activeTab === 'todo-list' && (
            <TodoListModule
              users={users}
              onTriggerNotification={handleTriggerNotification}
              onShowSaveToast={showSaveToast}
            />
          )}

          {activeTab === 'kpi-analytics' && (
            <KpiAnalyticsModule
              campaigns={currentTeamCampaigns}
              products={currentTeamProducts}
              onShowSaveToast={showSaveToast}
            />
          )}

        </main>
      </div>

      {/* Global Floating Auto-Save UX Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-none">
          <div className="px-4 py-3 bg-gradient-to-r from-purple-950 via-purple-900 to-pink-950 text-white rounded-2xl shadow-2xl border border-pink-400/40 flex items-center gap-3 font-bold text-xs backdrop-blur-md">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/40 shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <div>
              <span className="flex items-center gap-1 text-[10px] text-pink-300 font-extrabold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                💾 AUTO-SAVE SUPABASE & LOCAL STORAGE
              </span>
              <span className="text-white text-xs block font-semibold">{saveToast.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Database Schema Modal */}
      <SchemaViewerModal
        isOpen={schemaModalOpen}
        onClose={() => setSchemaModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-purple-100 bg-white/80 backdrop-blur-md py-6 mt-12 text-center text-xs text-purple-900">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse shadow-xs" />
            <span className="font-extrabold text-purple-950">Marketing & Content Planning Platform</span>
            <span className="text-purple-900 bg-[#FFEBF3] px-2.5 py-0.5 rounded-full border border-[#E2D2EA] font-bold">v1.0 Pastel</span>
          </div>
          <p className="text-purple-800/80 font-medium">
            ระบบบริหารจัดการการตลาด คอนเทนต์ แคมเปญสินค้า และแจ้งเตือนอัตโนมัติผ่าน LINE
          </p>
        </div>
      </footer>

    </div>
  );
}
