import React, { useState } from 'react';
import { 
  BarChart3, 
  ShoppingBag, 
  Store, 
  Share2, 
  TrendingUp, 
  Target, 
  DollarSign, 
  Users, 
  Filter, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Sparkles, 
  Layers, 
  Eye, 
  Edit3,
  Trash2,
  Settings,
  MousePointer,
  Video,
  Activity,
  Bot,
  RefreshCw,
  X,
  Megaphone,
  Check
} from 'lucide-react';
import { analyzeKpiWithGroqAi } from '../services/groqAiService';

export default function KpiAnalyticsModule({ campaigns = [], products = [] }) {
  // Groq AI KPI Analytics Modal States
  const [showGroqAiKpiModal, setShowGroqAiKpiModal] = useState(false);
  const [isAnalyzingGroqAiKpi, setIsAnalyzingGroqAiKpi] = useState(false);
  const [groqAiKpiResult, setGroqAiKpiResult] = useState('');

  // Analysis Mode: 'ecommerce' | 'content' | 'ads' (Paid Ads Spend & Performance)
  const [kpiAnalysisMode, setKpiAnalysisMode] = useState('ecommerce');

  // Dynamic Categories State (Add, Edit, Delete categories)
  const [categories, setCategories] = useState([
    { id: 'shopee', name: 'Shopee & E-Commerce' },
    { id: 'branch', name: 'โปรโมชันสาขาหน้าร้าน' },
    { id: 'social', name: 'Social Media & Influencers' }
  ]);

  // Active Filter Category: 'all' or category id
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');

  // Modals State
  const [showAddKpiModal, setShowAddKpiModal] = useState(false);
  const [showManageCategoriesModal, setShowManageCategoriesModal] = useState(false);
  const [editingKpiItem, setEditingKpiItem] = useState(null);

  // Category Management Form State
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState('');

  // Initial KPI Items State with localStorage Persistence
  const [kpiItems, setKpiItems] = useState(() => {
    const saved = localStorage.getItem('nitan_kpi_items');
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    localStorage.setItem('nitan_kpi_items', JSON.stringify(kpiItems));
  }, [kpiItems]);

  // New KPI Item Form State (With Paid Ads Spend Tracking)
  const [newKpiTitle, setNewKpiTitle] = useState('');
  const [newKpiCategory, setNewKpiCategory] = useState(categories[0]?.id || 'shopee');
  const [newKpiSubGroup, setNewKpiSubGroup] = useState('Shopee Official Store');
  const [newKpiTargetRevenue, setNewKpiTargetRevenue] = useState(100000);
  const [newKpiActualRevenue, setNewKpiActualRevenue] = useState(0);
  const [newKpiReach, setNewKpiReach] = useState(50000);
  const [newKpiER, setNewKpiER] = useState(5.0);

  // Paid Ads Specific Form States
  const [newKpiIsAds, setNewKpiIsAds] = useState(true);
  const [newKpiAdsBudget, setNewKpiAdsBudget] = useState(30000);
  const [newKpiAdsSpend, setNewKpiAdsSpend] = useState(25000);
  const [newKpiAdsChannel, setNewKpiAdsChannel] = useState('Google Search Ads & Facebook Feed');

  // Category Management Handlers
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newId = `cat-${Date.now()}`;
    setCategories(prev => [...prev, { id: newId, name: newCatName.trim() }]);
    setNewCatName('');
  };

  const handleUpdateCategory = (id) => {
    if (!editingCatName.trim()) return;
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name: editingCatName.trim() } : c));
    setEditingCatId(null);
    setEditingCatName('');
  };

  const [deleteCatId, setDeleteCatId] = useState(null);
  const [deleteKpiId, setDeleteKpiId] = useState(null);

  const handleConfirmDeleteCategory = () => {
    if (!deleteCatId) return;
    const fallbackCat = categories.find(c => c.id !== deleteCatId)?.id || 'shopee';
    setKpiItems(prev => prev.map(item => item.category === deleteCatId ? { ...item, category: fallbackCat } : item));
    setCategories(prev => prev.filter(c => c.id !== deleteCatId));
    if (activeCategory === deleteCatId) setActiveCategory('all');
    setDeleteCatId(null);
  };

  const handleConfirmDeleteKpiItem = () => {
    if (deleteKpiId) {
      setKpiItems(prev => prev.filter(item => item.id !== deleteKpiId));
      setDeleteKpiId(null);
    }
  };

  const handleCreateKpiItem = (e) => {
    e.preventDefault();
    if (!newKpiTitle.trim()) return;

    const actualRevNum = Number(newKpiActualRevenue) || 0;
    const adsSpendNum = Number(newKpiAdsSpend) || 0;
    const calcOrders = Math.round(actualRevNum / 650) || 0;
    const calcRoas = adsSpendNum > 0 ? Number((actualRevNum / adsSpendNum).toFixed(2)) : 0;
    const calcCpa = calcOrders > 0 && adsSpendNum > 0 ? Math.round(adsSpendNum / calcOrders) : 180;

    const newItem = {
      id: `kpi-${Date.now()}`,
      title: newKpiTitle.trim(),
      category: newKpiCategory || categories[0]?.id || 'shopee',
      subGroup: newKpiSubGroup || 'Shopee Official Store',
      targetRevenue: Number(newKpiTargetRevenue) || 100000,
      actualRevenue: actualRevNum,
      ordersCount: calcOrders,
      conversionRate: 4.8,
      roas: calcRoas || 5.2,
      cpa: calcCpa,
      aov: 650,
      reach: Number(newKpiReach) || 50000,
      engagementRate: Number(newKpiER) || 5.0,
      vtr: 35.0,
      ctr: 3.0,
      isAdsRunning: newKpiIsAds,
      adsBudget: Number(newKpiAdsBudget) || 0,
      actualAdsSpend: adsSpendNum,
      adsChannel: newKpiAdsChannel || 'Online Ads',
      adsRoas: calcRoas,
      adsCpa: calcCpa,
      status: actualRevNum >= (Number(newKpiTargetRevenue) || 100000) ? 'exceeded' : 'on_track',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]
    };

    setKpiItems(prev => [newItem, ...prev]);
    setShowAddKpiModal(false);
    setNewKpiTitle('');
  };

  // Filter Items
  const filteredKpiItems = kpiItems.filter(item => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (selectedBranch !== 'all' && item.subGroup !== selectedBranch) return false;
    return true;
  });

  // Aggregates for E-Commerce Mode
  const totalTargetRevenue = filteredKpiItems.reduce((acc, i) => acc + (i.targetRevenue || 0), 0);
  const totalActualRevenue = filteredKpiItems.reduce((acc, i) => acc + (i.actualRevenue || 0), 0);
  const totalOrders = filteredKpiItems.reduce((acc, i) => acc + (i.ordersCount || 0), 0);
  const avgRoas = (filteredKpiItems.reduce((acc, i) => acc + (i.roas || 0), 0) / (filteredKpiItems.length || 1)).toFixed(1);
  const avgCpa = Math.round(filteredKpiItems.reduce((acc, i) => acc + (i.cpa || 0), 0) / (filteredKpiItems.length || 1));
  const overallAchievementPercent = totalTargetRevenue > 0 
    ? Math.min(100, Math.round((totalActualRevenue / totalTargetRevenue) * 100))
    : 0;

  // Aggregates for Online Content Post Mode
  const totalReach = filteredKpiItems.reduce((acc, i) => acc + (i.reach || 0), 0);
  const avgER = (filteredKpiItems.reduce((acc, i) => acc + (i.engagementRate || 0), 0) / (filteredKpiItems.length || 1)).toFixed(1);
  const avgVTR = (filteredKpiItems.reduce((acc, i) => acc + (i.vtr || 0), 0) / (filteredKpiItems.length || 1)).toFixed(1);
  const avgCTR = (filteredKpiItems.reduce((acc, i) => acc + (i.ctr || 0), 0) / (filteredKpiItems.length || 1)).toFixed(1);

  // Aggregates for Paid Ads Mode
  const paidAdsItems = filteredKpiItems.filter(i => i.isAdsRunning);
  const totalAdsBudget = filteredKpiItems.reduce((acc, i) => acc + (i.adsBudget || 0), 0);
  const totalAdsSpend = filteredKpiItems.reduce((acc, i) => acc + (i.actualAdsSpend || 0), 0);
  const totalAdsRevenue = paidAdsItems.reduce((acc, i) => acc + (i.actualRevenue || 0), 0);
  const overallAdsRoas = totalAdsSpend > 0 ? (totalAdsRevenue / totalAdsSpend).toFixed(2) : '0';
  const avgAdsCpa = paidAdsItems.length > 0 ? Math.round(totalAdsSpend / (totalOrders || 1)) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner & Mode Switcher */}
      <div className="glass-panel p-6 border-[#E2D2EA]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEBF3] border border-[#E2D2EA] text-xs font-bold text-purple-950 mb-2">
              <BarChart3 className="w-3.5 h-3.5 text-purple-700" />
              <span>Module 6: KPI & Performance Analytics</span>
            </div>
            <h2 className="text-xl font-bold text-purple-950 tracking-tight">
              การวัดผล KPI & วิเคราะห์ประสิทธิภาพการยิง Ads โฆษณาออนไลน์
            </h2>

            {/* Standard 3-Group KPI Mode Selector */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <button
                onClick={() => setKpiAnalysisMode('ecommerce')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  kpiAnalysisMode === 'ecommerce'
                    ? 'bg-purple-950 text-white border-purple-950 shadow-xs'
                    : 'bg-white text-purple-900 border-[#E2D2EA] hover:bg-purple-50'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>1. KPI ยอดขาย E-Commerce</span>
              </button>

              <button
                onClick={() => setKpiAnalysisMode('content')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  kpiAnalysisMode === 'content'
                    ? 'bg-purple-950 text-white border-purple-950 shadow-xs'
                    : 'bg-white text-purple-900 border-[#E2D2EA] hover:bg-purple-50'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>2. KPI โพสต์ Organic & โซเชียล</span>
              </button>

              <button
                onClick={() => setKpiAnalysisMode('ads')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  kpiAnalysisMode === 'ads'
                    ? 'bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white border-purple-950 shadow-xs'
                    : 'bg-white text-purple-900 border-[#E2D2EA] hover:bg-purple-50'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5 text-pink-300" />
                <span>3. วิเคราะห์ผลการยิง Ads & งบโฆษณา</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={async () => {
                setShowGroqAiKpiModal(true);
                setIsAnalyzingGroqAiKpi(true);
                setGroqAiKpiResult('');
                const res = await analyzeKpiWithGroqAi(filteredKpiItems, kpiAnalysisMode);
                setGroqAiKpiResult(res);
                setIsAnalyzingGroqAiKpi(false);
              }}
              className="px-3.5 py-2.5 bg-gradient-to-r from-purple-900 via-pink-800 to-purple-950 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-2 cursor-pointer hover:opacity-95"
            >
              <Bot className="w-4 h-4 text-pink-300 animate-pulse" />
              <span>Groq AI วิเคราะห์ผลงาน & ยิง Ads</span>
            </button>

            <button
              onClick={() => setShowManageCategoriesModal(true)}
              className="px-3.5 py-2.5 bg-white text-purple-950 hover:bg-purple-50 font-bold rounded-xl text-xs transition border border-[#E2D2EA] flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Settings className="w-4 h-4 text-purple-700" />
              <span>จัดการหมวดหมู่ ({categories.length})</span>
            </button>

            <button
              onClick={() => setShowAddKpiModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] hover:opacity-90 text-purple-950 font-bold rounded-xl text-xs transition shadow-xs border border-[#E2D2EA] flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-purple-700" />
              <span>+ เพิ่มเป้าหมาย KPI ใหม่</span>
            </button>
          </div>
        </div>

        {/* Dynamic Category Switcher Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-purple-100/60 overflow-x-auto">
          <button
            onClick={() => { setActiveCategory('all'); setSelectedBranch('all'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] text-purple-950 border border-[#E2D2EA] shadow-xs scale-[1.02]'
                : 'text-purple-900/80 hover:text-purple-950 hover:bg-[#FFEBF3]/30 border border-transparent'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-600" />
            <span>รวมทุกกลุ่ม ({kpiItems.length})</span>
          </button>

          {categories.map(cat => {
            const catCount = kpiItems.filter(i => i.category === cat.id).length;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setSelectedBranch('all'); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] text-purple-950 border border-[#E2D2EA] shadow-xs scale-[1.02]'
                    : 'text-purple-900/80 hover:text-purple-950 hover:bg-[#FFEBF3]/30 border border-transparent'
                }`}
              >
                <span>{cat.name}</span>
                <span className="px-1.5 py-0.2 bg-white/70 text-purple-950 rounded-full text-[10px] border border-[#E2D2EA]">
                  {catCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Metric Summary Cards Grid (Switching based on Mode) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {kpiAnalysisMode === 'ecommerce' && (
          <>
            {/* E-Commerce Metric Card 1 */}
            <div className="glass-panel p-5 relative overflow-hidden group hover:border-[#E2D2EA] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">ยอดขายจริง / เป้ายอดขาย</span>
                <div className="w-9 h-9 rounded-xl bg-[#F0E6F5] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-purple-950 tracking-tight">
                  ฿{totalActualRevenue.toLocaleString()}
                </div>
                <div className="mt-1 text-xs text-purple-800 font-medium">
                  จากเป้าหมาย ฿{totalTargetRevenue.toLocaleString()}
                </div>
              </div>
            </div>

            {/* E-Commerce Metric Card 2 */}
            <div className="glass-panel p-5 relative overflow-hidden group hover:border-[#E2D2EA] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">อัตราการบรรลุเป้าหมาย %</span>
                <div className="w-9 h-9 rounded-xl bg-[#FFEBF3] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-purple-950 tracking-tight">
                  {overallAchievementPercent}%
                </div>
                <div className="mt-1 text-xs text-purple-800 font-medium">
                  {overallAchievementPercent >= 100 ? 'บรรลุเป้ายอดขายแล้ว 🎉' : 'กำลังดำเนินการตามแผน'}
                </div>
              </div>
            </div>

            {/* E-Commerce Metric Card 3 */}
            <div className="glass-panel p-5 relative overflow-hidden group hover:border-[#E2D2EA] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">ผลตอบแทนสถิติ ROAS</span>
                <div className="w-9 h-9 rounded-xl bg-[#E6F2FF] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-purple-950 tracking-tight">
                  {avgRoas}x <span className="text-xs font-medium text-purple-800">(Average)</span>
                </div>
                <div className="mt-1 text-xs text-purple-800 font-medium">
                  อัตราส่วนยอดขายต่อค่าโฆษณา
                </div>
              </div>
            </div>

            {/* E-Commerce Metric Card 4 */}
            <div className="glass-panel p-5 relative overflow-hidden group hover:border-[#E2D2EA] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">ต้นทุนต่อออเดอร์ (CPA)</span>
                <div className="w-9 h-9 rounded-xl bg-[#F0F7FF] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-purple-950 tracking-tight">
                  ฿{avgCpa.toLocaleString()} <span className="text-xs font-medium text-purple-800">/order</span>
                </div>
                <div className="mt-1 text-xs text-purple-800 font-medium">
                  คำสั่งซื้อรวม {totalOrders} ออเดอร์
                </div>
              </div>
            </div>
          </>
        )}

        {kpiAnalysisMode === 'content' && (
          <>
            <div className="glass-panel p-5 relative overflow-hidden group hover:border-[#E2D2EA] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">ยอดการมองเห็น (Reach/Views)</span>
                <div className="w-9 h-9 rounded-xl bg-[#F0E6F5] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-purple-950 tracking-tight">
                  {totalReach.toLocaleString()} <span className="text-xs font-medium text-purple-800">Views</span>
                </div>
                <div className="mt-1 text-xs text-purple-800 font-medium">
                  ยอดการมองเห็นโพสต์รวม
                </div>
              </div>
            </div>

            <div className="glass-panel p-5 relative overflow-hidden group hover:border-[#E2D2EA] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">อัตราการมีส่วนร่วม (ER %)</span>
                <div className="w-9 h-9 rounded-xl bg-[#FFEBF3] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-purple-950 tracking-tight">
                  {avgER}% <span className="text-xs font-medium text-purple-800">(ER)</span>
                </div>
                <div className="mt-1 text-xs text-purple-800 font-medium">
                  (Likes + Comments + Shares) / Reach
                </div>
              </div>
            </div>

            <div className="glass-panel p-5 relative overflow-hidden group hover:border-[#E2D2EA] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">อัตราดูวิดีโอจนจบ (VTR %)</span>
                <div className="w-9 h-9 rounded-xl bg-[#E6F2FF] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <Video className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-purple-950 tracking-tight">
                  {avgVTR}% <span className="text-xs font-medium text-purple-800">(Completion)</span>
                </div>
                <div className="mt-1 text-xs text-purple-800 font-medium">
                  สัดส่วนผู้ชมคลิปจนจบวิดีโอ
                </div>
              </div>
            </div>

            <div className="glass-panel p-5 relative overflow-hidden group hover:border-[#E2D2EA] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">อัตราคลิกซื้อสินค้า (CTR %)</span>
                <div className="w-9 h-9 rounded-xl bg-[#F0F7FF] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <MousePointer className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-purple-950 tracking-tight">
                  {avgCTR}% <span className="text-xs font-medium text-purple-800">(CTR)</span>
                </div>
                <div className="mt-1 text-xs text-purple-800 font-medium">
                  ผู้สนใจคลิกลิงก์สั่งซื้อจากโพสต์
                </div>
              </div>
            </div>
          </>
        )}

        {kpiAnalysisMode === 'ads' && (
          <>
            {/* Paid Ads Metric Card 1 */}
            <div className="glass-panel p-5 relative overflow-hidden group hover:border-[#E2D2EA] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">งบยิง Ads ที่ใช้จริงรวม</span>
                <div className="w-9 h-9 rounded-xl bg-[#FFEBF3] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <Megaphone className="w-4 h-4 text-purple-700" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-purple-950 font-mono tracking-tight">
                  ฿{totalAdsSpend.toLocaleString()}
                </div>
                <div className="mt-1 text-xs text-purple-800 font-medium">
                  จากงบโฆษณาที่ตั้งไว้ ฿{totalAdsBudget.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Paid Ads Metric Card 2 */}
            <div className="glass-panel p-5 relative overflow-hidden group hover:border-[#E2D2EA] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">ผลตอบแทนการยิง Ads (ROAS)</span>
                <div className="w-9 h-9 rounded-xl bg-[#E6F2FF] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <TrendingUp className="w-4 h-4 text-purple-700" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-purple-950 font-mono tracking-tight">
                  {overallAdsRoas}x <span className="text-xs font-medium text-purple-800">(Ad Return)</span>
                </div>
                <div className="mt-1 text-xs text-purple-800 font-medium">
                  ยอดขายจาก Ads ฿{totalAdsRevenue.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Paid Ads Metric Card 3 */}
            <div className="glass-panel p-5 relative overflow-hidden group hover:border-[#E2D2EA] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">ต้นทุน Ads ต่อออเดอร์ (CPA)</span>
                <div className="w-9 h-9 rounded-xl bg-[#FEF9C3] text-amber-800 flex items-center justify-center border border-[#E2D2EA]">
                  <Activity className="w-4 h-4 text-amber-600" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-purple-950 font-mono tracking-tight">
                  ฿{avgAdsCpa.toLocaleString()} <span className="text-xs font-medium text-purple-800">/order</span>
                </div>
                <div className="mt-1 text-xs text-purple-800 font-medium">
                  แคมเปญยิง Ads {paidAdsItems.length} รายการ
                </div>
              </div>
            </div>

            {/* Paid Ads Metric Card 4 */}
            <div className="glass-panel p-5 relative overflow-hidden group hover:border-[#E2D2EA] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">ออเดอร์ที่ได้จากการยิง Ads</span>
                <div className="w-9 h-9 rounded-xl bg-[#F0E6F5] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <ShoppingBag className="w-4 h-4 text-purple-700" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-purple-950 font-mono tracking-tight">
                  {totalOrders.toLocaleString()} <span className="text-xs font-medium text-purple-800">คำสั่งซื้อ</span>
                </div>
                <div className="mt-1 text-xs text-purple-800 font-medium">
                  แปลงผลลัพธ์จากโฆษณา (Conversions)
                </div>
              </div>
            </div>
          </>
        )}

      </div>

      {/* Main Detailed Breakdown Table */}
      <div className="glass-panel p-6 space-y-4 border-[#E2D2EA]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-purple-100/60">
          <div>
            <h3 className="font-bold text-purple-950 text-base flex items-center gap-2">
              <Filter className="w-4 h-4 text-purple-600" />
              <span>
                ตารางวิเคราะห์ KPI: {
                  kpiAnalysisMode === 'ecommerce' 
                    ? 'แคมเปญการขายสินค้าออนไลน์ (E-Commerce)' 
                    : kpiAnalysisMode === 'content'
                    ? 'โพสต์และโซเชียลมีเดีย (Online Content Post)'
                    : 'รายงานวิเคราะห์การยิง Ads & งบโฆษณา (Paid Ads Performance)'
                }
              </span>
            </h3>
            <p className="text-xs text-purple-800/80 font-medium mt-0.5">
              {
                kpiAnalysisMode === 'ecommerce' 
                  ? 'วิเคราะห์ตัวเลขตามหลักการตลาด ROAS / CPA / Conversion Rate / AOV' 
                  : kpiAnalysisMode === 'content'
                  ? 'วิเคราะห์ตัวเลข Reach / Engagement ER% / VTR% / CTR%'
                  : 'วิเคราะห์สถานะการยิง Ads (มียิงไหม / ใช้เงินเท่าไหร่ / ได้ผลเท่าไหร่ และ ROAS)'
              }
            </p>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-2xl border border-purple-100/80 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FCFAF7] border-b border-purple-100 text-purple-900 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">ชื่อแคมเปญ / โพสต์</th>
                <th className="py-3 px-4">หมวด / กลุ่ม</th>
                
                {kpiAnalysisMode === 'ecommerce' && (
                  <>
                    <th className="py-3 px-4 text-right">เป้ายอดขาย (Target)</th>
                    <th className="py-3 px-4 text-right">ยอดขายจริง (Actual)</th>
                    <th className="py-3 px-4 text-center">บรรลุเป้า %</th>
                    <th className="py-3 px-4 text-right">ออเดอร์</th>
                    <th className="py-3 px-4 text-right">ROAS</th>
                    <th className="py-3 px-4 text-right">CPA (บาท/ออเดอร์)</th>
                    <th className="py-3 px-4 text-right">CR %</th>
                  </>
                )}

                {kpiAnalysisMode === 'content' && (
                  <>
                    <th className="py-3 px-4 text-right">Reach / Views</th>
                    <th className="py-3 px-4 text-right">Engagement ER%</th>
                    <th className="py-3 px-4 text-right">Video VTR%</th>
                    <th className="py-3 px-4 text-right">Click CTR%</th>
                    <th className="py-3 px-4 text-right">ออเดอร์สะสม</th>
                  </>
                )}

                {kpiAnalysisMode === 'ads' && (
                  <>
                    <th className="py-3 px-4 text-center">สถานะการยิง Ads</th>
                    <th className="py-3 px-4 text-right">งบ Ads ตั้งไว้</th>
                    <th className="py-3 px-4 text-right">งบ Ads จ่ายจริง</th>
                    <th className="py-3 px-4 text-right">ยอดขายได้จริง</th>
                    <th className="py-3 px-4 text-right">ROAS (เท่า)</th>
                    <th className="py-3 px-4 text-right">CPA (บาท/ออเดอร์)</th>
                    <th className="py-3 px-4 text-left">ช่องทางยิง Ads</th>
                  </>
                )}

                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 text-purple-950 font-medium">
              {filteredKpiItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs text-purple-400 font-bold">
                    ยังไม่มีรายการ KPI ในกลุ่มนี้ สามารถคลิกปุ่ม "+ เพิ่มเป้าหมาย KPI ใหม่" เพื่อเริ่มบันทึกข้อมูล
                  </td>
                </tr>
              ) : (
                filteredKpiItems.map(item => {
                  const percent = item.targetRevenue > 0 ? Math.round((item.actualRevenue / item.targetRevenue) * 100) : 0;
                  const isExceeded = item.actualRevenue >= item.targetRevenue;

                  return (
                    <tr key={item.id} className="hover:bg-purple-50/40 transition">
                      <td className="py-3.5 px-4 font-bold text-purple-950">
                        {item.title}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFEBF3] text-purple-900 border border-[#E2D2EA]">
                          {item.subGroup}
                        </span>
                      </td>

                      {kpiAnalysisMode === 'ecommerce' && (
                        <>
                          <td className="py-3.5 px-4 text-right font-mono text-purple-900">
                            ฿{item.targetRevenue?.toLocaleString()}
                          </td>

                          <td className="py-3.5 px-4 text-right font-bold font-mono text-purple-950">
                            ฿{item.actualRevenue?.toLocaleString()}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className={`font-bold text-[11px] ${isExceeded ? 'text-emerald-600' : 'text-purple-950'}`}>
                              {percent}%
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono font-bold text-purple-950">
                            {item.ordersCount}
                          </td>

                          <td className="py-3.5 px-4 text-right font-bold text-purple-900">
                            {item.roas}x
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono font-bold text-purple-900">
                            ฿{item.cpa}
                          </td>

                          <td className="py-3.5 px-4 text-right font-bold text-purple-900">
                            {item.conversionRate}%
                          </td>
                        </>
                      )}

                      {kpiAnalysisMode === 'content' && (
                        <>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-purple-950">
                            {item.reach?.toLocaleString()}
                          </td>

                          <td className="py-3.5 px-4 text-right font-bold text-purple-900">
                            {item.engagementRate}%
                          </td>

                          <td className="py-3.5 px-4 text-right font-bold text-purple-900">
                            {item.vtr}%
                          </td>

                          <td className="py-3.5 px-4 text-right font-bold text-purple-900">
                            {item.ctr}%
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono font-bold text-purple-950">
                            {item.ordersCount}
                          </td>
                        </>
                      )}

                      {kpiAnalysisMode === 'ads' && (
                        <>
                          <td className="py-3.5 px-4 text-center">
                            {item.isAdsRunning ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                🟢 มียิง Ads
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                ⚪ Organic
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono text-purple-900">
                            ฿{(item.adsBudget || 0).toLocaleString()}
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono font-bold text-purple-950">
                            ฿{(item.actualAdsSpend || 0).toLocaleString()}
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono font-bold text-purple-950">
                            ฿{item.actualRevenue?.toLocaleString()}
                          </td>

                          <td className="py-3.5 px-4 text-right font-bold text-purple-900">
                            {item.adsRoas || item.roas}x
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono font-bold text-purple-900">
                            ฿{item.adsCpa || item.cpa}
                          </td>

                          <td className="py-3.5 px-4 text-left font-bold text-purple-900 text-[11px]">
                            {item.adsChannel || 'Online Ads'}
                          </td>
                        </>
                      )}

                      <td className="py-3.5 px-4 text-center">
                        {isExceeded ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>ทะลุเป้า</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-950 border border-purple-300">
                            <Activity className="w-3 h-3 text-purple-700" />
                            <span>ตามแผน</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setDeleteKpiId(item.id)}
                          className="p-1 text-rose-500 hover:bg-rose-100 rounded-md transition cursor-pointer"
                          title="ลบรายการ KPI"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Groq AI Performance & Paid Ads Advisor Modal */}
      {showGroqAiKpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="glass-panel max-w-2xl w-full p-6 space-y-4 border-[#E2D2EA] shadow-2xl bg-white/95 my-8">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFEBF3] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <Bot className="w-4 h-4 text-purple-700" />
                </div>
                <h3 className="text-base font-bold text-purple-950">
                  Groq AI วิเคราะห์ผลงาน & ประสิทธิภาพการยิง Ads ({kpiAnalysisMode.toUpperCase()})
                </h3>
              </div>
              <button onClick={() => setShowGroqAiKpiModal(false)} className="text-purple-400 hover:text-purple-700 font-bold cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {isAnalyzingGroqAiKpi ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-purple-950">Groq AI กำลังประมวลผลตัวเลข ROAS, CPA และประสิทธิภาพโฆษณา...</p>
              </div>
            ) : (
              <div className="prose prose-purple max-w-none text-xs leading-relaxed space-y-3 max-h-96 overflow-y-auto pr-1">
                <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 whitespace-pre-wrap font-sans text-purple-950">
                  {groqAiKpiResult}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-purple-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGroqAiKpiModal(false)}
                className="px-5 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs transition shadow-md cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Manage Categories Modal */}
      {showManageCategoriesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="glass-panel max-w-lg w-full p-6 space-y-4 border-[#E2D2EA] shadow-2xl bg-white/95 my-8">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFEBF3] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <Settings className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-purple-950">จัดการหมวดหมู่ KPI (Categories)</h3>
              </div>
              <button onClick={() => setShowManageCategoriesModal(false)} className="text-purple-400 hover:text-purple-700 font-bold cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-2 text-xs">
              <span className="text-xs font-bold text-purple-950 block">+ เพิ่มหมวดหมู่ใหม่:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  placeholder="เช่น 🛍️ Lazada Official Store / 🎪 Pop-up Events"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium text-xs focus:outline-none"
                />
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs shadow-md shrink-0 cursor-pointer">
                  + เพิ่มหมวดหมู่
                </button>
              </div>
            </form>

            <div className="pt-2 flex justify-end">
              <button onClick={() => setShowManageCategoriesModal(false)} className="px-4 py-2 bg-purple-50 text-purple-900 rounded-xl font-bold text-xs hover:bg-purple-100 transition cursor-pointer">
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add New KPI Target (Includes Paid Ads Tracking) */}
      {showAddKpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="glass-panel max-w-md w-full p-6 space-y-4 border-[#E2D2EA] my-8 shadow-2xl bg-white/95">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <h3 className="text-base font-bold text-purple-950 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                <span>กำหนดเป้าหมาย KPI ใหม่ & ผลการยิง Ads</span>
              </h3>
              <button onClick={() => setShowAddKpiModal(false)} className="text-purple-400 hover:text-purple-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateKpiItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-purple-950 font-bold mb-1">ชื่อแคมเปญ / โพสต์คอนเทนต์</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น Shopee 10.10 Brand Day / TikTok Viral Clip"
                  value={newKpiTitle}
                  onChange={(e) => setNewKpiTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-950 font-bold mb-1">หมวดหมู่</label>
                  <select
                    value={newKpiCategory}
                    onChange={(e) => setNewKpiCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none text-xs"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-purple-950 font-bold mb-1">กลุ่ม / ชื่อสาขา</label>
                  <input
                    type="text"
                    required
                    value={newKpiSubGroup}
                    onChange={(e) => setNewKpiSubGroup(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-950 font-bold mb-1">เป้ายอดขาย (บาท)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newKpiTargetRevenue}
                    onChange={(e) => setNewKpiTargetRevenue(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-purple-950 font-bold mb-1">ยอดขายที่ทำได้จริง (บาท)</label>
                  <input
                    type="number"
                    min={0}
                    value={newKpiActualRevenue}
                    onChange={(e) => setNewKpiActualRevenue(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Paid Ads Toggle & Budget Section */}
              <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-950 text-xs flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-purple-700" />
                    <span>แคมเปญนี้มียิงโฆษณา (Paid Ads) หรือไม่?</span>
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => setNewKpiIsAds(!newKpiIsAds)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      newKpiIsAds ? 'bg-emerald-600 text-white shadow-xs' : 'bg-purple-200 text-purple-800'
                    }`}
                  >
                    {newKpiIsAds ? '🟢 มียิง Ads (Paid)' : '⚪ ไม่ได้ยิง Ads (Organic)'}
                  </button>
                </div>

                {newKpiIsAds && (
                  <div className="space-y-2 pt-1 border-t border-purple-200/60 animate-in fade-in duration-150">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-purple-900 font-bold mb-1 text-[11px]">งบ Ads ที่ตั้งไว้ (บาท)</label>
                        <input
                          type="number"
                          min={0}
                          value={newKpiAdsBudget}
                          onChange={(e) => setNewKpiAdsBudget(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#E2D2EA] rounded-lg text-purple-950 font-mono font-bold focus:outline-none text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-purple-900 font-bold mb-1 text-[11px]">งบ Ads ที่ใช้จริง (บาท)</label>
                        <input
                          type="number"
                          min={0}
                          value={newKpiAdsSpend}
                          onChange={(e) => setNewKpiAdsSpend(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#E2D2EA] rounded-lg text-purple-950 font-mono font-bold focus:outline-none text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-purple-900 font-bold mb-1 text-[11px]">ช่องทางที่ยิง Ads</label>
                      <input
                        type="text"
                        placeholder="เช่น Google Search Ads, Facebook Page Feed, TikTok Video"
                        value={newKpiAdsChannel}
                        onChange={(e) => setNewKpiAdsChannel(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#E2D2EA] rounded-lg text-purple-950 font-medium focus:outline-none text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddKpiModal(false)} className="px-4 py-2 bg-purple-50 text-purple-900 rounded-xl font-bold hover:bg-purple-100 transition cursor-pointer">ยกเลิก</button>
                <button type="submit" className="px-5 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl shadow-md transition cursor-pointer">บันทึก KPI</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteCatId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="glass-panel max-w-sm w-full p-6 space-y-4 border-[#E2D2EA] shadow-2xl bg-white/95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-purple-950 text-sm">ยืนยันการลบหมวดหมู่นี้?</h3>
                <p className="text-xs text-purple-800/80">หมวดหมู่และรายการในกลุ่มจะถูกย้ายไปยังหมวดหมู่หลัก</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setDeleteCatId(null)}
                className="px-4 py-2 bg-purple-50 text-purple-900 rounded-xl font-bold hover:bg-purple-100 transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmDeleteCategory}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                ยืนยันลบหมวดหมู่
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Confirm Delete KPI Item Modal */}
      {deleteKpiId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="glass-panel max-w-sm w-full p-6 space-y-4 border-[#E2D2EA] shadow-2xl bg-white/95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-purple-950 text-sm">ยืนยันการลบรายการ KPI นี้?</h3>
                <p className="text-xs text-purple-800/80">เป้าหมายและผลลัพธ์ของรายการนี้จะถูกลบออก</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setDeleteKpiId(null)}
                className="px-4 py-2 bg-purple-50 text-purple-900 rounded-xl font-bold hover:bg-purple-100 transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmDeleteKpiItem}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                ยืนยันลบรายการ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
