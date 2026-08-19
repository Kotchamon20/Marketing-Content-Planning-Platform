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
  X
} from 'lucide-react';
import { analyzeKpiWithGroqAi } from '../services/groqAiService';

export default function KpiAnalyticsModule({ campaigns = [], products = [] }) {
  // Groq AI KPI Analytics Modal States
  const [showGroqAiKpiModal, setShowGroqAiKpiModal] = useState(false);
  const [isAnalyzingGroqAiKpi, setIsAnalyzingGroqAiKpi] = useState(false);
  const [groqAiKpiResult, setGroqAiKpiResult] = useState('');

  // Analysis Mode: 'ecommerce' (E-Commerce Sales Campaign) | 'content' (Online Content & Social Post)
  const [kpiAnalysisMode, setKpiAnalysisMode] = useState('ecommerce');

  // Dynamic Categories State (Add, Edit, Delete categories)
  const [categories, setCategories] = useState([
    { id: 'shopee', name: '🛒 Shopee & E-Commerce' },
    { id: 'branch', name: '🏢 โปรโมชันสาขาหน้าร้าน' },
    { id: 'social', name: '📱 Social Media & Influencers' }
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

  // Initial KPI Items State (With standard E-Commerce and Content post metrics)
  const [kpiItems, setKpiItems] = useState([
    {
      id: 'kpi-1',
      title: 'Shopee 9.9 Mega Flash Sale',
      category: 'shopee',
      subGroup: 'Shopee Official Store',
      targetRevenue: 300000,
      actualRevenue: 278000,
      ordersCount: 920,
      conversionRate: 4.8,
      roas: 5.2,
      cpa: 185,
      aov: 650,
      reach: 250000,
      engagementRate: 5.4,
      vtr: 38.0,
      ctr: 3.2,
      status: 'on_track',
      startDate: '2026-09-01',
      endDate: '2026-09-10'
    },
    {
      id: 'kpi-2',
      title: 'Shopee Live Influencer Campaign',
      category: 'shopee',
      subGroup: 'Shopee Live',
      targetRevenue: 150000,
      actualRevenue: 165000,
      ordersCount: 540,
      conversionRate: 6.1,
      roas: 6.8,
      cpa: 140,
      aov: 720,
      reach: 180000,
      engagementRate: 8.2,
      vtr: 45.5,
      ctr: 4.5,
      status: 'exceeded',
      startDate: '2026-08-10',
      endDate: '2026-08-20'
    },
    {
      id: 'kpi-3',
      title: 'โปรโมชันฉลองเปิดสาขา สยามพารากอน',
      category: 'branch',
      subGroup: 'สาขา สยามพารากอน',
      targetRevenue: 200000,
      actualRevenue: 185000,
      ordersCount: 480,
      conversionRate: 12.5,
      roas: 4.1,
      cpa: 210,
      aov: 850,
      reach: 95000,
      engagementRate: 4.2,
      vtr: 30.0,
      ctr: 2.8,
      status: 'on_track',
      startDate: '2026-08-01',
      endDate: '2026-08-31'
    },
    {
      id: 'kpi-4',
      title: 'โปรโมชันพิเศษหน้าร้าน เซ็นทรัลเวิลด์',
      category: 'branch',
      subGroup: 'สาขา เซ็นทรัลเวิลด์',
      targetRevenue: 180000,
      actualRevenue: 162000,
      ordersCount: 410,
      conversionRate: 10.8,
      roas: 3.9,
      cpa: 225,
      aov: 790,
      reach: 88000,
      engagementRate: 4.0,
      vtr: 28.5,
      ctr: 2.5,
      status: 'on_track',
      startDate: '2026-08-05',
      endDate: '2026-08-28'
    },
    {
      id: 'kpi-5',
      title: 'TikTok Viral Skincare Challenge (VDO Clip)',
      category: 'social',
      subGroup: 'TikTok Organics',
      targetRevenue: 100000,
      actualRevenue: 124000,
      ordersCount: 380,
      conversionRate: 3.9,
      roas: 7.1,
      cpa: 95,
      aov: 580,
      reach: 450000,
      engagementRate: 9.8,
      vtr: 52.0,
      ctr: 5.1,
      status: 'exceeded',
      startDate: '2026-08-01',
      endDate: '2026-08-25'
    }
  ]);

  // New KPI Item Form State
  const [newKpiTitle, setNewKpiTitle] = useState('');
  const [newKpiCategory, setNewKpiCategory] = useState(categories[0]?.id || 'shopee');
  const [newKpiSubGroup, setNewKpiSubGroup] = useState('Shopee Official Store');
  const [newKpiTargetRevenue, setNewKpiTargetRevenue] = useState(100000);
  const [newKpiActualRevenue, setNewKpiActualRevenue] = useState(0);
  const [newKpiReach, setNewKpiReach] = useState(50000);
  const [newKpiER, setNewKpiER] = useState(5.0);

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

  // Filter Items
  const filteredKpiItems = kpiItems.filter(item => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (selectedBranch !== 'all' && item.subGroup !== selectedBranch) return false;
    return true;
  });

  // Aggregates for E-Commerce Mode
  const totalTargetRevenue = filteredKpiItems.reduce((acc, i) => acc + i.targetRevenue, 0);
  const totalActualRevenue = filteredKpiItems.reduce((acc, i) => acc + i.actualRevenue, 0);
  const totalOrders = filteredKpiItems.reduce((acc, i) => acc + i.ordersCount, 0);
  const avgRoas = (filteredKpiItems.reduce((acc, i) => acc + i.roas, 0) / (filteredKpiItems.length || 1)).toFixed(1);
  const avgCpa = Math.round(filteredKpiItems.reduce((acc, i) => acc + i.cpa, 0) / (filteredKpiItems.length || 1));
  const overallAchievementPercent = totalTargetRevenue > 0 
    ? Math.min(100, Math.round((totalActualRevenue / totalTargetRevenue) * 100))
    : 0;

  // Aggregates for Online Content Post Mode
  const totalReach = filteredKpiItems.reduce((acc, i) => acc + (i.reach || 0), 0);
  const avgER = (filteredKpiItems.reduce((acc, i) => acc + (i.engagementRate || 0), 0) / (filteredKpiItems.length || 1)).toFixed(1);
  const avgVTR = (filteredKpiItems.reduce((acc, i) => acc + (i.vtr || 0), 0) / (filteredKpiItems.length || 1)).toFixed(1);
  const avgCTR = (filteredKpiItems.reduce((acc, i) => acc + (i.ctr || 0), 0) / (filteredKpiItems.length || 1)).toFixed(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner & Mode Switcher */}
      <div className="glass-panel p-6 border-[#E2D2EA]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEBF3] border border-[#E2D2EA] text-xs font-bold text-purple-950 mb-2">
              <BarChart3 className="w-3.5 h-3.5 text-purple-700" />
              <span>Module 4: KPI & Performance Analytics</span>
            </div>
            <h2 className="text-xl font-bold text-purple-950 tracking-tight">
              การวัดผล KPI ตามหลักการตลาดออนไลน์ (E-Commerce & Social Content)
            </h2>

            {/* Standard 3-Group KPI Mode Selector */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <button
                onClick={() => {
                  setKpiAnalysisMode('ecommerce');
                  setActiveCategory('shopee');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  kpiAnalysisMode === 'ecommerce' && (activeCategory === 'shopee' || activeCategory === 'all')
                    ? 'bg-purple-950 text-white border-purple-950 shadow-xs'
                    : 'bg-white text-purple-900 border-[#E2D2EA] hover:bg-purple-50'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>🛒 1. KPI แคมเปญการขายสินค้าออนไลน์ (Shopee & E-Commerce)</span>
              </button>

              <button
                onClick={() => {
                  setKpiAnalysisMode('ecommerce');
                  setActiveCategory('branch');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  activeCategory === 'branch'
                    ? 'bg-purple-950 text-white border-purple-950 shadow-xs'
                    : 'bg-white text-purple-900 border-[#E2D2EA] hover:bg-purple-50'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>🏢 2. KPI โปรโมชันสาขาหน้าร้าน (Branch Promotions)</span>
              </button>

              <button
                onClick={() => {
                  setKpiAnalysisMode('content');
                  setActiveCategory('social');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  kpiAnalysisMode === 'content' || activeCategory === 'social'
                    ? 'bg-purple-950 text-white border-purple-950 shadow-xs'
                    : 'bg-white text-purple-900 border-[#E2D2EA] hover:bg-purple-50'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>📱 3. KPI สำหรับโพสต์และโซเชียลมีเดีย (Social Media & Facebook)</span>
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
              <span>🤖 Groq AI วิเคราะห์ผลงาน KPI</span>
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
        
        {kpiAnalysisMode === 'ecommerce' ? (
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
                <div className="mt-1 text-xs text-purple-800 font-medium flex items-center justify-between">
                  <span>เป้าหมาย: ฿{totalTargetRevenue.toLocaleString()}</span>
                  <span className="font-bold text-emerald-600">{overallAchievementPercent}%</span>
                </div>
                <div className="w-full bg-purple-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" style={{ width: `${overallAchievementPercent}%` }} />
                </div>
              </div>
            </div>

            {/* E-Commerce Metric Card 2 */}
            <div className="glass-panel p-5 relative overflow-hidden group hover:border-[#E2D2EA] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">เฉลี่ยผลตอบแทน ROAS</span>
                <div className="w-9 h-9 rounded-xl bg-[#E6F2FF] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-purple-950 tracking-tight">
                  {avgRoas}x <span className="text-xs font-medium text-purple-800">(ROAS)</span>
                </div>
                <div className="mt-1 text-xs text-purple-800 font-medium">
                  อัตราส่วนกำไรขั้นต้นคุ้มค่าโฆษณา
                </div>
              </div>
            </div>

            {/* E-Commerce Metric Card 3 */}
            <div className="glass-panel p-5 relative overflow-hidden group hover:border-[#E2D2EA] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">ต้นทุนต่อออเดอร์ (CPA)</span>
                <div className="w-9 h-9 rounded-xl bg-[#FFEBF3] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-purple-950 tracking-tight">
                  ฿{avgCpa} <span className="text-xs font-medium text-purple-800">/ Order</span>
                </div>
                <div className="mt-1 text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>คำนวณจาก {totalOrders.toLocaleString()} ออเดอร์</span>
                </div>
              </div>
            </div>

            {/* E-Commerce Metric Card 4 */}
            <div className="glass-panel p-5 relative overflow-hidden group hover:border-[#E2D2EA] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">สถานะ KPI ผ่านเกณฑ์</span>
                <div className="w-9 h-9 rounded-xl bg-[#F0F7FF] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-purple-950 tracking-tight">
                  {filteredKpiItems.filter(i => i.actualRevenue >= i.targetRevenue).length} / {filteredKpiItems.length}
                </div>
                <div className="mt-1 text-xs text-purple-800 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>แคมเปญบรรลุเป้ายอดขาย</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Content Post Metric Card 1 */}
            <div className="glass-panel p-5 relative overflow-hidden group hover:border-[#E2D2EA] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">การเข้าถึงรวม (Reach / Impression)</span>
                <div className="w-9 h-9 rounded-xl bg-[#F0E6F5] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-purple-950 tracking-tight">
                  {totalReach.toLocaleString()} <span className="text-xs font-medium text-purple-800">Views</span>
                </div>
                <div className="mt-1 text-xs text-purple-800 font-medium">
                  ยอดการมองเห็นโพสต์และวิดีโอรวม
                </div>
              </div>
            </div>

            {/* Content Post Metric Card 2 */}
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

            {/* Content Post Metric Card 3 */}
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

            {/* Content Post Metric Card 4 */}
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

      </div>

      {/* Main Detailed Breakdown Table */}
      <div className="glass-panel p-6 space-y-4 border-[#E2D2EA]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-purple-100/60">
          <div>
            <h3 className="font-bold text-purple-950 text-base flex items-center gap-2">
              <Filter className="w-4 h-4 text-purple-600" />
              <span>
                ตารางวิเคราะห์ KPI: {kpiAnalysisMode === 'ecommerce' ? 'แคมเปญการขายสินค้าออนไลน์ (E-Commerce)' : 'โพสต์และโซเชียลมีเดีย (Online Content Post)'}
              </span>
            </h3>
            <p className="text-xs text-purple-800/80 font-medium mt-0.5">
              วิเคราะห์ตัวเลขตามหลักการตลาด {kpiAnalysisMode === 'ecommerce' ? 'ROAS / CPA / Conversion Rate / AOV' : 'Reach / Engagement ER% / VTR% / CTR%'}
            </p>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-2xl border border-purple-100/80 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FCFAF7] border-b border-purple-100 text-purple-900 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">ชื่อแคมเปญ / โพสต์</th>
                <th className="py-3 px-4">หมวด / ช่องทาง</th>
                
                {kpiAnalysisMode === 'ecommerce' ? (
                  <>
                    <th className="py-3 px-4 text-right">เป้ายอดขาย (Target)</th>
                    <th className="py-3 px-4 text-right">ยอดขายจริง (Actual)</th>
                    <th className="py-3 px-4 text-center">บรรลุเป้า %</th>
                    <th className="py-3 px-4 text-right">ออเดอร์</th>
                    <th className="py-3 px-4 text-right">ROAS</th>
                    <th className="py-3 px-4 text-right">CPA (บาท/ออเดอร์)</th>
                    <th className="py-3 px-4 text-right">CR %</th>
                  </>
                ) : (
                  <>
                    <th className="py-3 px-4 text-right">Reach / Views</th>
                    <th className="py-3 px-4 text-right">Engagement ER%</th>
                    <th className="py-3 px-4 text-right">Video VTR%</th>
                    <th className="py-3 px-4 text-right">Click CTR%</th>
                    <th className="py-3 px-4 text-right">ออเดอร์สะสม</th>
                  </>
                )}

                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 text-purple-950 font-medium">
              {filteredKpiItems.map(item => {
                const percent = Math.round((item.actualRevenue / item.targetRevenue) * 100);
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

                    {kpiAnalysisMode === 'ecommerce' ? (
                      <>
                        <td className="py-3.5 px-4 text-right font-mono text-purple-900">
                          ฿{item.targetRevenue.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold font-mono text-purple-950">
                          ฿{item.actualRevenue.toLocaleString()}
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
                    ) : (
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

                    <td className="py-3.5 px-4 text-center">
                      {isExceeded ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ผ่านเกณฑ์</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <span>กำลังดำเนินการ</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setDeleteKpiId(item.id)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                        title="ลบรายการนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Manage Categories (เพิ่ม / แก้ไข / ลบ หมวดหมู่) */}
      {showManageCategoriesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="glass-panel max-w-lg w-full p-6 space-y-4 border-[#E2D2EA]">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <h3 className="text-base font-bold text-purple-950 flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-600" />
                <span>จัดการหมวดหมู่ / ช่องทางการตลาด (CRUD)</span>
              </h3>
              <button onClick={() => setShowManageCategoriesModal(false)} className="text-purple-400 hover:text-purple-700 font-bold">✕</button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <span className="text-xs font-bold text-purple-900 block">หมวดหมู่ที่มีอยู่ในระบบ:</span>
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 text-xs">
                  {editingCatId === cat.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <input
                        type="text"
                        value={editingCatName}
                        onChange={(e) => setEditingCatName(e.target.value)}
                        className="px-2 py-1 bg-white border border-[#E2D2EA] rounded-lg font-bold text-purple-950 flex-1 text-xs"
                      />
                      <button onClick={() => handleUpdateCategory(cat.id)} className="px-2.5 py-1 bg-purple-600 text-white rounded-lg font-bold text-xs">บันทึก</button>
                    </div>
                  ) : (
                    <span className="font-bold text-purple-950">{cat.name}</span>
                  )}

                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingCatId(cat.id); setEditingCatName(cat.name); }} className="p-1 text-purple-600 hover:bg-purple-100 rounded-lg transition"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteCatId(cat.id)} className="p-1 text-rose-500 hover:bg-rose-100 rounded-lg transition"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddCategory} className="pt-3 border-t border-purple-100 space-y-2">
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
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] text-purple-950 font-bold rounded-xl text-xs shadow-xs border border-[#E2D2EA] whitespace-nowrap cursor-pointer">
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

      {/* MODAL 2: Add New KPI Target */}
      {showAddKpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="glass-panel max-w-md w-full p-6 space-y-4 border-[#E2D2EA]">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <h3 className="text-base font-bold text-purple-950 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                <span>กำหนดเป้าหมาย KPI ใหม่</span>
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
                    className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none"
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

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddKpiModal(false)} className="px-4 py-2 bg-purple-50 text-purple-900 rounded-xl font-bold hover:bg-purple-100 transition cursor-pointer">ยกเลิก</button>
                <button type="submit" className="px-5 py-2 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] text-purple-950 font-bold rounded-xl shadow-xs border border-[#E2D2EA] hover:opacity-90 transition cursor-pointer">บันทึก KPI</button>
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

      {/* MODAL 4: Confirm Delete KPI Item Modal (ไม่ใช้ confirm ของ Google/Browser) */}
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
      {/* MODAL 5: Groq AI KPI Performance Advisor Modal */}
      {showGroqAiKpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="glass-panel max-w-2xl w-full p-6 space-y-4 border-[#E2D2EA] shadow-2xl bg-white/95 my-8">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-900 to-pink-800 text-white flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5 text-pink-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-purple-950 flex items-center gap-2">
                    <span>Groq AI KPI Performance Advisor: วิเคราะห์ผลงาน & ROAS</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">LLaMA 3.3 / GPT-OSS</span>
                  </h3>
                  <p className="text-xs text-purple-800/80">วิเคราะห์ผลตอบแทน CPA, ROAS, Engagement และข้อแนะนำปรับปรุงด้วย Groq AI Engine</p>
                </div>
              </div>

              <button onClick={() => setShowGroqAiKpiModal(false)} className="w-8 h-8 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold transition flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            {isAnalyzingGroqAiKpi ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
                <RefreshCw className="w-10 h-10 text-purple-600 animate-spin" />
                <span className="font-bold text-purple-950 text-sm">Groq AI กำลังประมวลผลวิเคราะห์ผลงาน KPI...</span>
                <span className="text-xs text-purple-700/80">ประมวลผลคำแนะนำด้วย Groq AI Engine (openai/gpt-oss-120b)</span>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-[#E2D2EA] max-h-96 overflow-y-auto font-sans text-xs text-purple-950 leading-relaxed whitespace-pre-wrap">
                {groqAiKpiResult}
              </div>
            )}

            <div className="pt-3 border-t border-purple-100 flex justify-end">
              <button
                onClick={() => setShowGroqAiKpiModal(false)}
                className="px-5 py-2 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] text-purple-950 font-bold rounded-xl text-xs border border-[#E2D2EA] shadow-xs cursor-pointer"
              >
                ปิดหน้าต่างวิเคราะห์
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
