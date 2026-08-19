import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Filter,
  Search,
  Calendar,
  DollarSign,
  Package,
  Building2,
  CheckCircle2,
  Clock,
  Send,
  Trash2,
  Edit3,
  Sparkles,
  Percent,
  Layers,
  ArrowRight,
  Gift,
  Share2,
  Megaphone,
  X,
  AlertCircle,
  TrendingUp,
  Settings,
  Save,
  Check,
  FileText,
  Copy,
  Printer,
  FileCode
} from 'lucide-react';
import LineFlexModal from './LineFlexModal';

export default function PromotionPlanModule({
  products = [],
  campaigns = [],
  onTriggerNotification
}) {
  // Dynamic Promo Categories State (Add, Edit, Delete categories)
  const [categories, setCategories] = useState([
    { id: 'cat-1', name: 'Product Promotion', label: 'แผนโปรโมทสินค้า (Product)' },
    { id: 'cat-2', name: 'Branch Promotion', label: 'แผนโปรโมทสาขา (Branch)' },
    { id: 'cat-3', name: 'Brand Campaign', label: 'แคมเปญแบรนด์ (Brand)' },
    { id: 'cat-4', name: 'Seasonal Promo', label: 'โปรโมชันตามเทศกาล (Seasonal)' }
  ]);

  // Clean Initial Promotion Plans Data State (Cleared Mockup Data)
  const [promotionPlans, setPromotionPlans] = useState([]);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageCategoriesModal, setShowManageCategoriesModal] = useState(false);
  const [viewDocPlan, setViewDocPlan] = useState(null); // Doc Format Viewer Modal State
  const [editingPlan, setEditingPlan] = useState(null);
  const [lineModalItem, setLineModalItem] = useState(null);

  // Category Manager Modal Inputs State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Form State for Add / Edit Plan Modal
  const [formData, setFormData] = useState({
    title: '',
    category: 'Product Promotion',
    targetProductName: 'Sunscreen Aqua Gel (กันแดดสูตรน้ำ)',
    targetBranch: 'ทุกสาขา',
    status: 'planned',
    discountOffer: 'Discount 20% Off',
    startDate: '',
    endDate: '',
    budget: 10000,
    projectedSales: 150000,
    description: '',
    channelsStr: 'Facebook Ads, TikTok, หน้าร้าน',
    docContent: ''
  });

  // Category Management Handlers
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const newCatName = newCategoryName.trim();
    const newCat = {
      id: `cat-${Date.now()}`,
      name: newCatName,
      label: newCatName
    };

    setCategories(prev => [...prev, newCat]);
    setNewCategoryName('');
  };

  const handleStartEditCategory = (cat) => {
    setEditingCategoryId(cat.id);
    setEditingCategoryName(cat.name);
  };

  const handleSaveEditCategory = (catId) => {
    if (!editingCategoryName.trim()) return;

    const updatedName = editingCategoryName.trim();
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, name: updatedName, label: updatedName } : c));
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  const handleDeleteCategory = (catId) => {
    setCategories(prev => prev.filter(c => c.id !== catId));
  };

  // Open Add Plan Modal
  const handleOpenAddModal = () => {
    setEditingPlan(null);
    setFormData({
      title: '',
      category: categories[0]?.name || 'Product Promotion',
      targetProductName: products[0]?.name || 'สินค้าโปรโมชัน',
      targetBranch: 'ทุกสาขา',
      status: 'planned',
      discountOffer: 'Discount 20% Off',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      budget: 15000,
      projectedSales: 200000,
      description: '',
      channelsStr: 'Facebook Ads, TikTok Shop, หน้าร้าน',
      docContent: `=====================================================\nเอกสารบรีฟแผนโปรโมชัน (CAMPAIGN STRATEGY & PROMOTION DOC)\n=====================================================\n\n1. วัตถุประสงค์เชิงกลยุทธ์ (Strategic Objectives)\n- \n\n2. กลุ่มเป้าหมายหลัก (Target Audience)\n- \n\n3. เงื่อนไขและข้อเสนอโปรโมชัน (Offer Terms)\n- \n\n4. สื่อและสคริปต์โฆษณา (Creative & Script Brief)\n- `
    });
    setShowAddModal(true);
  };

  // Open Edit Plan Modal
  const handleOpenEditModal = (plan) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      category: plan.category,
      targetProductName: plan.targetProductName,
      targetBranch: plan.targetBranch,
      status: plan.status,
      discountOffer: plan.discountOffer,
      startDate: plan.startDate,
      endDate: plan.endDate,
      budget: plan.budget,
      projectedSales: plan.projectedSales,
      description: plan.description,
      channelsStr: plan.channels.join(', '),
      docContent: plan.docContent || ''
    });
    setShowAddModal(true);
  };

  // Save Add or Edit Plan
  const handleSaveForm = (e) => {
    e.preventDefault();
    const channelsList = formData.channelsStr.split(',').map(c => c.trim()).filter(Boolean);

    if (editingPlan) {
      setPromotionPlans(prev => prev.map(p => p.id === editingPlan.id ? {
        ...p,
        title: formData.title,
        category: formData.category,
        targetProductName: formData.targetProductName,
        targetBranch: formData.targetBranch,
        status: formData.status,
        discountOffer: formData.discountOffer,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: Number(formData.budget) || 0,
        projectedSales: Number(formData.projectedSales) || 0,
        description: formData.description,
        channels: channelsList,
        docContent: formData.docContent
      } : p));
    } else {
      const newPlan = {
        id: `promo-${Date.now()}`,
        code: `PROMO-2026-${Math.floor(100 + Math.random() * 900)}`,
        title: formData.title,
        category: formData.category,
        targetProductId: 'prod-custom',
        targetProductName: formData.targetProductName,
        targetBranch: formData.targetBranch,
        status: formData.status,
        discountOffer: formData.discountOffer,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: Number(formData.budget) || 0,
        projectedSales: Number(formData.projectedSales) || 0,
        channels: channelsList,
        description: formData.description,
        docContent: formData.docContent,
        checklist: [
          { task: 'จัดเตรียมอาร์ตเวิร์คโปรโมชัน', completed: true },
          { task: 'เซ็ตอัปส่วนลดในระบบPOS/ออนไลน์', completed: false }
        ]
      };
      setPromotionPlans(prev => [newPlan, ...prev]);
    }

    setShowAddModal(false);
  };

  // Delete Plan
  const handleDeletePlan = (id) => {
    setPromotionPlans(prev => prev.filter(p => p.id !== id));
  };

  // Toggle Checklist item
  const handleToggleChecklist = (planId, taskIdx) => {
    setPromotionPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      const updatedChecklist = p.checklist.map((item, idx) => 
        idx === taskIdx ? { ...item, completed: !item.completed } : item
      );
      return { ...p, checklist: updatedChecklist };
    }));
  };

  // Filtered Logic
  const filteredPlans = promotionPlans.filter(plan => {
    const matchCategory = selectedCategory === 'all' || plan.category === selectedCategory;
    const matchProduct = selectedProduct === 'all' || plan.targetProductName.toLowerCase().includes(selectedProduct.toLowerCase());
    const matchBranch = selectedBranch === 'all' || plan.targetBranch === selectedBranch || plan.targetBranch === 'ทุกสาขา';
    const matchStatus = selectedStatus === 'all' || plan.status === selectedStatus;
    const matchSearch = !searchQuery || 
      plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.targetProductName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchProduct && matchBranch && matchStatus && matchSearch;
  });

  // Calculate Metrics
  const totalBudget = filteredPlans.reduce((sum, p) => sum + p.budget, 0);
  const totalSalesImpact = filteredPlans.reduce((sum, p) => sum + p.projectedSales, 0);
  const activeCount = promotionPlans.filter(p => p.status === 'active').length;
  const productPromoCount = promotionPlans.filter(p => p.category === 'Product Promotion').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Banner & Title Panel */}
      <div className="glass-panel p-6 border-[#E2D2EA]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEBF3] border border-[#E2D2EA] text-xs font-bold text-purple-950 mb-2">
              <Megaphone className="w-3.5 h-3.5 text-purple-700" />
              <span>ระบบบริหารแผนการโปรโมท (Module: Promotion Plan & Doc Brief System)</span>
            </div>
            <h2 className="text-xl font-bold text-purple-950 tracking-tight flex items-center gap-2">
              <span>แผนการโปรโมทสินค้า การตลาด และแคมเปญส่งเสริมการขาย</span>
            </h2>
            <p className="text-xs text-purple-800/80 font-medium mt-1">
              วางแผนข้อเสนอโปรโมชัน (Discounts / Buy 1 Get 1) พร้อมระบบรองรับเอกสาร Campaign Brief ในรูปแบบ Doc Format
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowManageCategoriesModal(true)}
              className="px-3.5 py-2.5 bg-white hover:bg-purple-50 text-purple-950 font-bold rounded-xl text-xs transition border border-[#E2D2EA] flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Settings className="w-4 h-4 text-purple-700" />
              <span>จัดการประเภทแผนโปรโมท</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-2 cursor-pointer hover:opacity-95"
            >
              <Plus className="w-4 h-4 text-pink-300" />
              <span>+ สร้างแผนโปรโมทใหม่</span>
            </button>
          </div>
        </div>

        {/* Top Summary Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-purple-100/60">
          <div className="p-4 rounded-2xl bg-white border border-[#E2D2EA] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-purple-900 block">แคมเปญโปรโมททั้งหมด</span>
              <span className="text-xl font-bold text-purple-950 font-mono">{promotionPlans.length} แผน</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">กำลังรันอยู่ {activeCount} แผน</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FFEBF3] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
              <Tag className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E2D2EA] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-purple-900 block">โปรโมทระดับสินค้า (Product)</span>
              <span className="text-xl font-bold text-purple-950 font-mono">{productPromoCount} แผน</span>
              <span className="text-[10px] text-purple-700 font-medium block mt-0.5">กระตุ้นยอดขาย SKU หลัก</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#E6F2FF] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E2D2EA] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-purple-900 block">งบประมาณโปรโมชันรวม</span>
              <span className="text-xl font-bold text-purple-950 font-mono">฿{totalBudget.toLocaleString()}</span>
              <span className="text-[10px] text-purple-700 font-medium block mt-0.5">งบสื่อ + สื่อสิ่งพิมพ์ POSM</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F0E6F5] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E2D2EA] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-purple-900 block">เป้าหมายยอดขายรวมที่คาดหวัง</span>
              <span className="text-xl font-bold text-purple-950 font-mono">฿{totalSalesImpact.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">ROI คาดการณ์ +{(totalBudget > 0 ? (totalSalesImpact / totalBudget * 100).toFixed(0) : '0')}%</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FEF9C3] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar & Controls Panel */}
      <div className="glass-panel p-4 border-[#E2D2EA] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          
          {/* Category Filter Tabs with Edit/Add capability */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="font-bold text-purple-900 flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5 text-purple-600" />
              <span>กรองประเภทแผน:</span>
            </span>

            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-purple-950 text-white shadow-xs'
                  : 'bg-white text-purple-900 hover:bg-purple-50 border border-[#E2D2EA]'
              }`}
            >
              ทั้งหมด
            </button>

            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.name
                    ? 'bg-purple-950 text-white shadow-xs'
                    : 'bg-white text-purple-900 hover:bg-purple-50 border border-[#E2D2EA]'
                }`}
              >
                {cat.label || cat.name}
              </button>
            ))}

            <button
              onClick={() => setShowManageCategoriesModal(true)}
              className="px-2.5 py-1.5 rounded-xl font-bold bg-[#FFEBF3] hover:bg-pink-200 text-purple-950 border border-[#E2D2EA] transition flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
              title="แก้ไข / เพิ่มประเภทแผนโปรโมท"
            >
              <Plus className="w-3.5 h-3.5 text-purple-700" />
              <span>เพิ่ม/แก้ไขประเภท</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-64">
            <Search className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อแผน หรือรหัสโปรโมชัน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none text-xs"
            />
          </div>
        </div>

        {/* Secondary Filters Dropdown Row */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-purple-100/60 text-xs">
          {/* Product Filter */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-[#E2D2EA]">
            <Package className="w-3.5 h-3.5 text-purple-600" />
            <span className="font-bold text-purple-900">เลือกโปรโมทสินค้า:</span>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="bg-transparent font-bold text-purple-950 focus:outline-none text-xs"
            >
              <option value="all">สินค้าทั้งหมด (All Products)</option>
              {products.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-[#E2D2EA]">
            <Building2 className="w-3.5 h-3.5 text-purple-600" />
            <span className="font-bold text-purple-900">เลือกสาขา:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent font-bold text-purple-950 focus:outline-none text-xs"
            >
              <option value="all">ทุกสาขา (All Branches)</option>
              <option value="NITAN หลัก">NITAN หลัก (สำนักงานใหญ่)</option>
              <option value="NITAN เขาพระตำหนัก">NITAN เขาพระตำหนัก</option>
              <option value="NITAN นาเกลือ">NITAN นาเกลือ</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-[#E2D2EA]">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span className="font-bold text-purple-900">สถานะ:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-bold text-purple-950 focus:outline-none text-xs"
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="active">กำลังดำเนินการ (Active)</option>
              <option value="planned">วางแผนล่วงหน้า (Planned)</option>
              <option value="completed">เสร็จสิ้น (Completed)</option>
            </select>
          </div>

          <span className="ml-auto text-purple-700 font-bold text-[11px]">
            พบ {filteredPlans.length} แผนการโปรโมท
          </span>
        </div>
      </div>

      {/* Promotion Plans Cards Grid */}
      {filteredPlans.length === 0 ? (
        <div className="glass-panel p-12 text-center border-[#E2D2EA] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFEBF3] text-purple-800 flex items-center justify-center border border-[#E2D2EA] mx-auto">
            <Megaphone className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-purple-950 text-sm">ยังไม่มีแผนการโปรโมทในระบบ</h3>
          <p className="text-xs text-purple-800/80 max-w-md mx-auto">
            กดปุ่มด้านล่างเพื่อเริ่มสร้างแผนการโปรโมทสินค้าหรือแคมเปญส่งเสริมการขายใหม่
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs shadow-md hover:opacity-95 transition cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-pink-300" />
            <span>+ สร้างแผนโปรโมทใหม่</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPlans.map(plan => {
            const completedTasksCount = plan.checklist.filter(c => c.completed).length;
            const totalTasksCount = plan.checklist.length;
            const progressPercent = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount * 100).toFixed(0) : 0;

            return (
              <div key={plan.id} className="glass-panel p-5 border-[#E2D2EA] flex flex-col justify-between space-y-4 hover:shadow-md transition">
                <div>
                  {/* Header Badge Row */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-white shadow-xs">
                        {plan.code}
                      </span>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFEBF3] text-purple-950 border border-[#E2D2EA]">
                        {plan.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        plan.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : plan.status === 'planned'
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${plan.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        <span>{plan.status === 'active' ? 'Active' : plan.status === 'planned' ? 'Planned' : 'Completed'}</span>
                      </span>

                      <button
                        onClick={() => handleOpenEditModal(plan)}
                        className="p-1 text-purple-600 hover:bg-purple-50 rounded-lg transition cursor-pointer"
                        title="แก้ไขแผนโปรโมท"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="ลบแผนโปรโมท"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Plan Title & Offer Box */}
                  <h3 className="font-bold text-purple-950 text-base leading-snug">
                    {plan.title}
                  </h3>

                  <div className="mt-3 p-3 bg-purple-50/70 rounded-xl border border-purple-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-900 font-bold flex items-center gap-1">
                        <Gift className="w-3.5 h-3.5 text-purple-700" />
                        <span>ข้อเสนอโปรโมชัน (Offer):</span>
                      </span>
                      <span className="font-mono font-extrabold text-pink-700 bg-white px-2 py-0.5 rounded border border-purple-200 shadow-xs">
                        {plan.discountOffer}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-dashed border-purple-200/80 text-[11px]">
                      <div>
                        <span className="text-purple-800 font-medium block">สินค้าเป้าหมาย:</span>
                        <span className="font-bold text-purple-950 flex items-center gap-1 mt-0.5">
                          <Package className="w-3 h-3 text-purple-600 shrink-0" />
                          <span className="truncate">{plan.targetProductName}</span>
                        </span>
                      </div>

                      <div>
                        <span className="text-purple-800 font-medium block">สาขาที่จัดโปรโมชัน:</span>
                        <span className="font-bold text-purple-950 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-purple-600 shrink-0" />
                          <span>{plan.targetBranch}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Channels & Date Range */}
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-purple-800 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                        <span>ระยะเวลาโปรโมชัน:</span>
                      </span>
                      <span className="font-mono font-bold text-purple-950">
                        {plan.startDate} ถึง {plan.endDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-purple-800 font-bold">ช่องทางที่สื่อสาร:</span>
                      {plan.channels.map((ch, cIdx) => (
                        <span key={cIdx} className="px-2 py-0.5 rounded-md bg-white border border-[#E2D2EA] text-[10px] font-bold text-purple-950 shadow-xs">
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Financial Impact Row */}
                  <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] rounded-xl border border-[#E2D2EA] text-xs">
                    <div>
                      <span className="text-purple-800 text-[10px] font-medium block">งบโปรโมชันที่จัดสรร:</span>
                      <span className="font-mono font-bold text-purple-950">฿{plan.budget.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-purple-800 text-[10px] font-medium block">เป้าหมายยอดขาย (Sales):</span>
                      <span className="font-mono font-bold text-emerald-800">฿{plan.projectedSales.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Checklist Progress Bar */}
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-bold text-purple-950">
                      <span>รายการจัดเตรียมแคมเปญ (Checklist):</span>
                      <span className="font-mono">{completedTasksCount}/{totalTasksCount} ({progressPercent}%)</span>
                    </div>

                    <div className="w-full h-1.5 bg-purple-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-950 via-pink-600 to-purple-900 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                    </div>

                    <div className="space-y-1 pt-1">
                      {plan.checklist.map((item, idx) => (
                        <label key={idx} className="flex items-center gap-2 text-[11px] text-purple-900 cursor-pointer hover:bg-purple-50/50 p-1 rounded transition">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => handleToggleChecklist(plan.id, idx)}
                            className="rounded text-purple-900 focus:ring-purple-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span className={item.completed ? 'line-through text-purple-400 font-medium' : 'font-semibold'}>
                            {item.task}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-purple-100 flex items-center justify-between text-xs flex-wrap gap-2">
                  {/* Doc Brief Format Button */}
                  <button
                    onClick={() => setViewDocPlan(plan)}
                    className="px-3 py-1.5 bg-[#E6F2FF] hover:bg-blue-100 text-purple-950 font-bold rounded-xl border border-[#E2D2EA] transition flex items-center gap-1.5 text-xs shadow-xs cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-purple-700" />
                    <span>ดูเอกสาร Doc แคมเปญ</span>
                  </button>

                  <button
                    onClick={() => setLineModalItem({
                      id: plan.id,
                      title: plan.title,
                      platform: plan.channels.join(', '),
                      publish_date: `${plan.startDate} - ${plan.endDate}`,
                      assigned_to: plan.targetBranch,
                      status: plan.status.toUpperCase(),
                      media_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80'
                    })}
                    className="px-3 py-1.5 bg-[#FFEBF3] hover:bg-pink-200 text-purple-950 font-bold rounded-xl border border-[#E2D2EA] transition flex items-center gap-1.5 text-xs shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-purple-700" />
                    <span>ยิงส่งแผนโปรโมทเข้า LINE</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Add or Edit Promotion Plan Modal (with Doc Brief Support) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="glass-panel max-w-2xl w-full p-6 space-y-4 border-[#E2D2EA] shadow-2xl bg-white/95 my-8">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFEBF3] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <Megaphone className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-purple-950">
                  {editingPlan ? 'แก้ไขแผนการโปรโมท & เอกสาร Doc' : 'สร้างแผนการโปรโมทสินค้า/แคมเปญใหม่'}
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-purple-400 hover:text-purple-700 font-bold cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3 text-xs">
              <div>
                <label className="block text-purple-950 font-bold mb-1">ชื่อแผนโปรโมชัน / แคมเปญ</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ซื้อ 1 แถม 1 Sunscreen Aqua Gel หรือ ลด 30% หน้าร้านเขาพระตำหนัก"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-950 font-bold mb-1">ประเภทแผนโปรโมท (Category)</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-bold focus:outline-none shadow-xs"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>
                        {cat.label || cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-purple-950 font-bold mb-1">สถานะแคมเปญ (Status)</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-bold focus:outline-none shadow-xs"
                  >
                    <option value="planned">วางแผนล่วงหน้า (Planned)</option>
                    <option value="active">กำลังดำเนินการ (Active)</option>
                    <option value="completed">เสร็จสิ้น (Completed)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-950 font-bold mb-1">สินค้าเป้าหมาย (Target Product)</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น Sunscreen Aqua Gel หรือ สินค้าทุกรายการ"
                    value={formData.targetProductName}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetProductName: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-purple-950 font-bold mb-1">สาขาที่จัดโปรโมชัน (Target Branch)</label>
                  <select
                    value={formData.targetBranch}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetBranch: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-bold focus:outline-none shadow-xs"
                  >
                    <option value="ทุกสาขา">ทุกสาขา (All Branches)</option>
                    <option value="NITAN หลัก">NITAN หลัก (สำนักงานใหญ่)</option>
                    <option value="NITAN เขาพระตำหนัก">NITAN เขาพระตำหนัก</option>
                    <option value="NITAN นาเกลือ">NITAN นาเกลือ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-purple-950 font-bold mb-1">ข้อเสนอโปรโมชัน / ส่วนลด (Offer Description)</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ซื้อ 1 แถม 1 หรือ ลด 30% ทุกบิล หรือ สะสมพอยต์ X3"
                  value={formData.discountOffer}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountOffer: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#FFEBF3] border border-[#E2D2EA] rounded-xl text-purple-950 font-bold focus:outline-none shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-950 font-bold mb-1">วันที่เริ่มต้น</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-purple-950 font-bold mb-1">วันที่สิ้นสุด</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-950 font-bold mb-1">งบโปรโมชัน (บาท)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-mono font-bold focus:outline-none shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-purple-950 font-bold mb-1">เป้าหมายยอดขาย (บาท)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.projectedSales}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectedSales: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-mono font-bold focus:outline-none shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-950 font-bold mb-1">ช่องทางที่สื่อสาร (คั่นด้วยจุลภาค ,)</label>
                <input
                  type="text"
                  placeholder="เช่น Facebook Ads, TikTok Shop, Shopee, หน้าร้าน"
                  value={formData.channelsStr}
                  onChange={(e) => setFormData(prev => ({ ...prev, channelsStr: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none shadow-xs"
                />
              </div>

              {/* Rich Document / Brief Format Section */}
              <div className="pt-2">
                <label className="block text-purple-950 font-bold mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-purple-700" />
                    <span>เนื้อหาเอกสารแผนแคมเปญ (Doc Format / Campaign Brief):</span>
                  </span>
                  <span className="text-[10px] text-purple-700 font-medium">รองรับข้อความจัดรูปเล่มสไตล์ Google Doc / Notion</span>
                </label>
                <textarea
                  rows={8}
                  placeholder="ใส่เอกสารบรีฟกลยุทธ์ สคริปต์ หรือข้อกำหนดการจัดโปรโมชันสไตล์ Word/Doc..."
                  value={formData.docContent}
                  onChange={(e) => setFormData(prev => ({ ...prev, docContent: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-[#FCFAF7] border border-[#E2D2EA] rounded-xl text-purple-950 font-mono text-xs leading-relaxed focus:outline-none shadow-inner"
                />
              </div>

              <div className="pt-3 border-t border-purple-100 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-purple-50 text-purple-900 rounded-xl font-bold hover:bg-purple-100 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl shadow-md hover:opacity-95 transition cursor-pointer"
                >
                  {editingPlan ? 'บันทึกการแก้ไข' : '+ เพิ่มแผนโปรโมทใหม่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Dynamic Category Manager Modal */}
      {showManageCategoriesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="glass-panel max-w-lg w-full p-6 space-y-4 border-[#E2D2EA] shadow-2xl bg-white/95 my-8">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFEBF3] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-purple-950">จัดการประเภทแผนโปรโมท (Dynamic Categories)</h3>
                  <p className="text-xs text-purple-800/80">เพิ่ม แก้ไข หรือลบหมวดหมู่ประเภทแผนโปรโมทสำหรับกรอกและคัดกรอง</p>
                </div>
              </div>
              <button onClick={() => setShowManageCategoriesModal(false)} className="text-purple-400 hover:text-purple-700 font-bold cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add New Category Form */}
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="เช่น Flash Sale 9.9 / VIP Influencer Pack / โปรโมชันวันแม่"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 text-xs font-medium focus:outline-none shadow-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-950 hover:bg-purple-900 text-white font-bold rounded-xl text-xs transition flex items-center gap-1 cursor-pointer shadow-xs shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ เพิ่มประเภท</span>
              </button>
            </form>

            {/* Categories List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pt-2">
              <span className="text-xs font-bold text-purple-900 block">รายการประเภทแผนโปรโมทปัจจุบัน ({categories.length}):</span>
              
              {categories.map(cat => {
                const isEditing = editingCategoryId === cat.id;

                return (
                  <div key={cat.id} className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 flex items-center justify-between gap-2 text-xs">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        className="flex-1 px-2.5 py-1 bg-white border border-purple-300 rounded-lg text-purple-950 font-bold focus:outline-none text-xs"
                      />
                    ) : (
                      <span className="font-bold text-purple-950">{cat.label || cat.name}</span>
                    )}

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveEditCategory(cat.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>บันทึก</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEditCategory(cat)}
                          className="p-1 text-purple-600 hover:bg-purple-100 rounded-md transition cursor-pointer"
                          title="แก้ไขชื่อประเภท"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1 text-rose-500 hover:bg-rose-100 rounded-md transition cursor-pointer"
                        title="ลบประเภทนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-purple-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowManageCategoriesModal(false)}
                className="px-5 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs transition shadow-md cursor-pointer"
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Doc Format Full Campaign Brief Viewer Modal */}
      {viewDocPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="glass-panel max-w-3xl w-full p-6 space-y-4 border-[#E2D2EA] shadow-2xl bg-white/95 my-8">
            {/* Doc Header */}
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-950 via-pink-900 to-purple-900 text-white flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5 text-pink-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-white font-mono">{viewDocPlan.code}</span>
                    <h3 className="text-base font-bold text-purple-950">เอกสารแผนแคมเปญโปรโมท (Campaign Doc Brief)</h3>
                  </div>
                  <p className="text-xs text-purple-800/80 font-medium">{viewDocPlan.title}</p>
                </div>
              </div>

              <button onClick={() => setViewDocPlan(null)} className="w-8 h-8 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold transition flex items-center justify-center cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Doc Metadata Badge Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100">
                <span className="text-purple-800 text-[10px] block">ประเภทแผน:</span>
                <span className="font-bold text-purple-950">{viewDocPlan.category}</span>
              </div>
              <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100">
                <span className="text-purple-800 text-[10px] block">สินค้าเป้าหมาย:</span>
                <span className="font-bold text-purple-950">{viewDocPlan.targetProductName}</span>
              </div>
              <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100">
                <span className="text-purple-800 text-[10px] block">งบจัดสรร:</span>
                <span className="font-bold text-purple-950 font-mono">฿{viewDocPlan.budget.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100">
                <span className="text-purple-800 text-[10px] block">เป้าหมายยอดขาย:</span>
                <span className="font-bold text-emerald-800 font-mono">฿{viewDocPlan.projectedSales.toLocaleString()}</span>
              </div>
            </div>

            {/* Doc Document Body Container */}
            <div className="p-5 rounded-2xl bg-[#FCFAF7] border border-purple-200/90 shadow-inner max-h-96 overflow-y-auto">
              <pre className="font-mono text-xs text-purple-950 whitespace-pre-wrap leading-relaxed">
                {viewDocPlan.docContent || `ไม่มีเนื้อหาเอกสารบรีฟในขณะนี้ (สามารถกดปุ่มแก้ไขเพื่อกรอกเนื้อหา Doc Brief ได้)`}
              </pre>
            </div>

            {/* Doc Footer Action Controls */}
            <div className="pt-3 border-t border-purple-100 flex items-center justify-between gap-2 text-xs">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(viewDocPlan.docContent || viewDocPlan.title);
                  alert('คัดลอกข้อความเอกสาร Doc สำเร็จ!');
                }}
                className="px-3.5 py-2 bg-white hover:bg-purple-50 text-purple-950 border border-[#E2D2EA] font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Copy className="w-3.5 h-3.5 text-purple-700" />
                <span>คัดลอกข้อความเอกสาร</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenEditModal(viewDocPlan);
                    setViewDocPlan(null);
                  }}
                  className="px-4 py-2 bg-[#FFEBF3] hover:bg-pink-200 text-purple-950 font-bold rounded-xl border border-[#E2D2EA] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-purple-700" />
                  <span>แก้ไขเอกสาร Doc นี้</span>
                </button>

                <button
                  onClick={() => setViewDocPlan(null)}
                  className="px-5 py-2 bg-purple-950 text-white font-bold rounded-xl transition shadow-md cursor-pointer"
                >
                  ปิดเอกสาร
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* LINE Flex Modal Integration */}
      {lineModalItem && (
        <LineFlexModal
          contentItem={lineModalItem}
          onClose={() => setLineModalItem(null)}
          onSuccessTrigger={onTriggerNotification}
        />
      )}

    </div>
  );
}
