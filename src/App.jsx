import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import NavigationHeader from './components/NavigationHeader';
import DashboardOverview from './components/DashboardOverview';
import ContentPlanModule from './components/ContentPlanModule';
import MarketingPlanModule from './components/MarketingPlanModule';
import ProductPlanModule from './components/ProductPlanModule';
import PromotionPlanModule, { DocExportPreviewModal } from './components/PromotionPlanModule';
import TodoListModule from './components/TodoListModule';
import KpiAnalyticsModule from './components/KpiAnalyticsModule';
import NotificationEngineModule from './components/NotificationEngineModule';
import SchemaViewerModal from './components/SchemaViewerModal';
import { supabase } from './lib/supabaseClient';
import {
  fetchContentItemsFromSupabase,
  fetchCampaignsFromSupabase,
  fetchMarketingPlansFromSupabase,
  fetchProductsFromSupabase,
  subscribeToContentItems,
  upsertContentItemToSupabase,
  deleteContentItemFromSupabase,
  deleteAllContentItemsFromSupabase,
  upsertCampaignToSupabase,
  upsertMarketingPlanToSupabase,
  upsertProductToSupabase,
  fetchContentGroupsFromSupabase,
  upsertContentGroupToSupabase,
  deleteContentGroupFromSupabase,
  subscribeToContentGroups,
  fetchCampaignIdeasFromSupabase,
  upsertCampaignIdeaToSupabase,
  deleteCampaignIdeaFromSupabase,
  subscribeToCampaignIdeas,
  fetchIdeaVaultFromSupabase,
  upsertIdeaVaultToSupabase,
  deleteIdeaVaultFromSupabase,
  subscribeToIdeaVault
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
  // Public Doc Preview Route Check (for shared read-only links)
  const docPreviewId = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('docPreview')
    : null;

  const [publicDocPlan, setPublicDocPlan] = useState(null);
  const [isLoadingPublicDoc, setIsLoadingPublicDoc] = useState(!!docPreviewId);
  const [publicDocError, setPublicDocError] = useState(null);

  useEffect(() => {
    if (!docPreviewId) return;
    async function loadPublicDoc() {
      setIsLoadingPublicDoc(true);
      try {
        const { data, error } = await supabase
          .from('promotion_plans')
          .select('*')
          .eq('id', docPreviewId)
          .single();

        if (error || !data) {
          setPublicDocError('ไม่พบเอกสารแผนแคมเปญนี้ หรือเอกสารอาจถูกลบไปแล้ว');
        } else {
          setPublicDocPlan({
            id: data.id,
            code: data.code,
            title: data.title,
            category: data.category,
            targetProductName: data.target_product_name,
            budget: data.budget,
            projectedSales: data.projected_sales,
            startDate: data.start_date,
            endDate: data.end_date,
            targetBranch: data.target_branch,
            docContent: data.doc_content
          });
        }
      } catch (err) {
        console.error('Failed to load public doc:', err);
        setPublicDocError('เกิดข้อผิดพลาดในการโหลดเอกสาร');
      } finally {
        setIsLoadingPublicDoc(false);
      }
    }
    loadPublicDoc();
  }, [docPreviewId]);

  // Global State
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [activeTeamId, setActiveTeamId] = useState('team-1');

  const [users, setUsers] = useState(INITIAL_USERS);
  const [activeUserId, setActiveUserId] = useState('user-1');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [schemaModalOpen, setSchemaModalOpen] = useState(false);

  // Module Data States (Pure Real Data from Supabase & User Entry)
  const [products, setProducts] = useState([]);
  const [marketingPlans, setMarketingPlans] = useState([]);
  const [campaignIdeas, setCampaignIdeas] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [contentItems, setContentItems] = useState([]);
  const [contentGroups, setContentGroups] = useState([]);
  const [ideaVault, setIdeaVault] = useState([]);

  const [notificationRules, setNotificationRules] = useState(INITIAL_NOTIFICATION_RULES);
  const [notificationLogs, setNotificationLogs] = useState(INITIAL_NOTIFICATION_LOGS);

  // Auto-fetch from Supabase DB on mount & Subscribe to Realtime Changes (Live Sync across Local & Production)
  React.useEffect(() => {
    const mapDbItems = (dbItems) => {
      if (!dbItems) return;
      setContentItems(dbItems.map(item => ({
        id: item.id,
        team_id: item.team_id || 'team-1',
        campaign_id: item.campaign_id || 'camp-1',
        creator_id: item.creator_id || 'user-2',
        title: item.title,
        caption: item.caption || '',
        visual_concept: item.visual_concept || '',
        platform: item.platforms || (item.platform ? item.platform.split(/[\s,]+/) : ['facebook']),
        group: item.group_name || 'Brand Vibe (Atmosphere)',
        subCategory: item.sub_category || '',
        status: item.status || 'draft',
        publish_date: item.publish_date ? item.publish_date.split('T')[0] : '2026-08-20',
        media_url: item.media_url || '',
        reference_url: item.reference_url || '',
        performance: { views: 0, likes: 0, comments: 0, shares: 0, ctr: 0 }
      })));
    };

    async function loadFromSupabase() {
      // 1. Content Items
      const dbItems = await fetchContentItemsFromSupabase();
      if (dbItems && dbItems.length > 0) {
        mapDbItems(dbItems);
      } else {
        setContentItems([]);
      }

      // 2. Campaigns
      const dbCampaigns = await fetchCampaignsFromSupabase();
      if (dbCampaigns) {
        setCampaigns(dbCampaigns.map(c => ({
          ...c,
          team_id: c.team_id || 'team-1',
          projectedSales: c.revenue_target || c.projectedSales || 0,
          budget: c.budget || 0,
          stages: c.stages || []
        })));
      }

      // 3. Marketing Plans
      const dbPlans = await fetchMarketingPlansFromSupabase();
      if (dbPlans) {
        setMarketingPlans(dbPlans.map(p => ({
          ...p,
          team_id: p.team_id || 'team-1',
          budget: p.total_budget || p.budget || 0
        })));
      }

      // 4. Products Catalog
      const dbProducts = await fetchProductsFromSupabase();
      if (dbProducts) {
        setProducts(dbProducts.map(prod => ({
          ...prod,
          team_id: prod.team_id || 'team-1'
        })));
      }
      // 5. Content Groups — dedup by name
      const dbGroups = await fetchContentGroupsFromSupabase();
      if (dbGroups) {
        const seen = new Set();
        setContentGroups(dbGroups
          .map(g => ({
            ...g,
            colorClass: g.color_class || 'bg-slate-500 text-white',
            subCategories: g.sub_categories || [],
            subCategoryColors: g.sub_category_colors || {}
          }))
          .filter(g => {
            const key = g.name?.trim().toLowerCase();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
          })
        );
      } else {
        setContentGroups([]);
      }

      // 6. Campaign Ideas
      const dbIdeas = await fetchCampaignIdeasFromSupabase();
      if (dbIdeas) {
        setCampaignIdeas(dbIdeas.map(i => ({
          ...i,
          campaignId: i.campaign_id || null
        })));
      }

      // 7. Idea Vault
      const dbVault = await fetchIdeaVaultFromSupabase();
      if (dbVault) {
        setIdeaVault(dbVault.map(v => ({
          ...v,
          isUsed: v.is_used || false
        })));
      }
    }

    loadFromSupabase();

    // Subscribe to Live Realtime DB changes (Broadcasts to all open tabs/clients on Local & Production)
    const unsubContentItems = subscribeToContentItems((freshDbItems) => {
      mapDbItems(freshDbItems);
    });

    const unsubContentGroups = subscribeToContentGroups((freshDbGroups) => {
      const seen = new Set();
      setContentGroups(freshDbGroups
        .map(g => ({ ...g, colorClass: g.color_class || 'bg-slate-500 text-white', subCategories: g.sub_categories || [] }))
        .filter(g => {
          const key = g.name?.trim().toLowerCase();
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        })
      );
    });

    const unsubCampaignIdeas = subscribeToCampaignIdeas((freshDbIdeas) => {
      setCampaignIdeas(freshDbIdeas.map(i => ({
        ...i,
        campaignId: i.campaign_id || null
      })));
    });

    const unsubIdeaVault = subscribeToIdeaVault((freshDbVault) => {
      setIdeaVault(freshDbVault.map(v => ({
        ...v,
        isUsed: v.is_used || false
      })));
    });

    return () => {
      if (unsubContentItems) unsubContentItems();
      if (unsubContentGroups) unsubContentGroups();
      if (unsubCampaignIdeas) unsubCampaignIdeas();
      if (unsubIdeaVault) unsubIdeaVault();
    };
  }, []);

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

  const handleClearAllContent = () => {
    setContentItems([]);
    deleteAllContentItemsFromSupabase();
    showSaveToast('ล้างรายการคอนเทนต์ทั้งหมดใน DB เรียบร้อยแล้ว!');
  };

  const handleAddContentGroup = (newGroup) => {
    setContentGroups(prev => [...prev, newGroup]);
    upsertContentGroupToSupabase(newGroup);
    showSaveToast('บันทึกกลุ่มคอนเทนต์ใหม่เรียบร้อยแล้ว!');
  };

  const handleDeleteContentGroup = (groupId) => {
    setContentGroups(prev => prev.filter(g => g.id !== groupId));
    deleteContentGroupFromSupabase(groupId);
    showSaveToast('ลบกลุ่มคอนเทนต์เรียบร้อยแล้ว!');
  };

  const handleUpdateContentGroups = (updatedGroups) => {
    setContentGroups(updatedGroups);
    // Since updatedGroups is the full array, we should ideally upsert all of them.
    // For simplicity, assuming the module only updates one at a time or reorders,
    // we'll loop and upsert all active groups to ensure they are synced.
    updatedGroups.forEach(g => upsertContentGroupToSupabase(g));
    showSaveToast('อัปเดตข้อมูลกลุ่มคอนเทนต์เรียบร้อยแล้ว!');
  };

  const handleAddVaultIdea = (newIdea) => {
    setIdeaVault(prev => [newIdea, ...prev]);
    upsertIdeaVaultToSupabase(newIdea);
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
      media_url: '',
      reference_url: '',
      performance: { views: 0, likes: 0, comments: 0, shares: 0, ctr: 0 }
    };

    setContentItems(prev => [newContent, ...prev]);
    upsertContentItemToSupabase(newContent);
    setIdeaVault(prev => prev.filter(v => v.id !== idea.id));
    deleteIdeaVaultFromSupabase(idea.id);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    showSaveToast('ย้ายไอเดียเป็นแผนคอนเทนต์และบันทึกเรียบร้อยแล้ว!');
  };

  // Handlers for Module 3: Marketing Plan
  const handleUpdateStrategyCanvas = (planId, updatedFields) => {
    setMarketingPlans(prev => {
      const updated = prev.map(m => m.id === planId ? { ...m, ...updatedFields } : m);
      const targetPlan = updated.find(m => m.id === planId);
      if (targetPlan) upsertMarketingPlanToSupabase(targetPlan);
      return updated;
    });
    showSaveToast('บันทึกกรอบกลยุทธ์การตลาด (Strategy Canvas) ลง DB เรียบร้อยแล้ว!');
  };

  const handleUpvoteIdea = (ideaId) => {
    setCampaignIdeas(prev => {
      const updated = prev.map(i => i.id === ideaId ? { ...i, upvotes: (i.upvotes || i.votes || 0) + 1, votes: (i.upvotes || i.votes || 0) + 1 } : i);
      const targetIdea = updated.find(i => i.id === ideaId);
      if (targetIdea) upsertCampaignIdeaToSupabase(targetIdea);
      return updated;
    });
  };

  const handleAddCampaignIdea = (newIdea) => {
    setCampaignIdeas(prev => [newIdea, ...prev]);
    upsertCampaignIdeaToSupabase(newIdea);
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

  // Notification Engine Triggering — always inject team_id so currentTeamLogs filter passes
  const handleTriggerNotification = (logEntry) => {
    const enrichedLog = {
      id: `log-${Date.now()}`,
      sent_at: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      stage: 'info',
      channel_name: 'LINE Group',
      message: 'แจ้งเตือนจากระบบ',
      ...logEntry,
      team_id: activeTeamId, // always override to ensure currentTeamLogs filter passes
    };
    setNotificationLogs(prev => [enrichedLog, ...prev]);
  };

  // Notification Rule Handlers
  const handleUpdateRuleTemplate = (ruleId, newTemplate) => {
    setNotificationRules(prev =>
      prev.map(r => r.id === ruleId ? { ...r, template: newTemplate, custom_template: newTemplate } : r)
    );
  };

  const handleToggleRuleActive = (ruleId) => {
    setNotificationRules(prev =>
      prev.map(r => r.id === ruleId ? { ...r, is_active: !r.is_active } : r)
    );
  };

  const handleGenerateDigest = () => {
    handleTriggerNotification({
      stage: 'digest',
      channel_name: 'LINE Group (Digest)',
      message: `[Digest] สรุปประจำวัน ${new Date().toLocaleDateString('th-TH')} — แคมเปญ ${currentTeamCampaigns.length} รายการ, คอนเทนต์ ${currentTeamContent.length} ชิ้น`,
    });
    showSaveToast('ส่ง Daily Digest ไปยัง LINE Group เรียบร้อยแล้ว!');
  };

  // Standalone Public View for docPreview share link
  if (docPreviewId) {
    if (isLoadingPublicDoc) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4 text-white">
          <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
          <p className="text-sm text-purple-200 font-bold">กำลังโหลดเอกสารแผนแคมเปญ...</p>
        </div>
      );
    }
    if (publicDocError || !publicDocPlan) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4 text-white p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-2">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">ไม่พบเอกสาร</h2>
          <p className="text-sm text-slate-400 max-w-md">{publicDocError || 'ไม่พบเอกสารที่ระบุ หรือเอกสารอาจถูกลบไปแล้ว'}</p>
        </div>
      );
    }
    return (
      <DocExportPreviewModal
        plan={publicDocPlan}
        isPublicStandalone={true}
        onClose={() => { window.location.href = window.location.pathname; }}
      />
    );
  }

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
              onClearAllContent={handleClearAllContent}
              onAddContentGroup={handleAddContentGroup}
              onDeleteContentGroup={handleDeleteContentGroup}
              onUpdateContentGroups={handleUpdateContentGroups}
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

          {activeTab === 'notification-engine' && (
            <NotificationEngineModule
              notificationRules={currentTeamRules}
              notificationLogs={currentTeamLogs}
              users={users}
              campaigns={currentTeamCampaigns}
              onUpdateRuleTemplate={handleUpdateRuleTemplate}
              onToggleRuleActive={handleToggleRuleActive}
              onTriggerNotification={handleTriggerNotification}
              onGenerateDigest={handleGenerateDigest}
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

