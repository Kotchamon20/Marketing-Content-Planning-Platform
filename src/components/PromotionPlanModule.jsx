import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import JoditEditor from 'jodit-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  fetchPromotionPlansFromSupabase,
  upsertPromotionPlanToSupabase,
  deletePromotionPlanFromSupabase
} from '../services/dataService';
import { supabase } from '../lib/supabaseClient';

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
  FileCode,
  Download,
  ImageIcon,
  FileDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Link,
  CheckCircle,
  ExternalLink,
  GripVertical
} from 'lucide-react';

import LineFlexModal from './LineFlexModal';

const compressImage = (file, maxWidth = 1000, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress as JPEG to drastically shrink file sizes compared to raw PNG
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function PromotionPlanModule({
  products = [],
  campaigns = [],
  onTriggerNotification,
  onShowSaveToast
}) {
  // Local Branches State for Promotions
  const [branchesList, setBranchesList] = useState(() => {
    const saved = localStorage.getItem('nitan_promotion_branches');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.filter(b => b.name !== 'ทุกสาขา' && !b.name.includes('All Branches'));
    }
    return [
      { id: 'b-2', name: 'NITAN หลัก' },
      { id: 'b-3', name: 'NITAN เขาพระตำหนัก' },
      { id: 'b-4', name: 'NITAN นาเกลือ' }
    ];
  });

  // Dynamic Promo Categories State (Add, Edit, Delete categories)
  const [categories, setCategories] = useState([
    { id: 'cat-1', name: 'Product Promotion', label: 'แผนโปรโมทสินค้า (Product)' },
    { id: 'cat-2', name: 'Branch Promotion', label: 'แผนโปรโมทสาขา (Branch)' },
    { id: 'cat-3', name: 'Brand Campaign', label: 'แคมเปญแบรนด์ (Brand)' },
    { id: 'cat-4', name: 'Seasonal Promo', label: 'โปรโมชันตามเทศกาล (Seasonal)' }
  ]);

  // Dynamic Related Products State with localStorage Persistence
  const [productsList, setProductsList] = useState(() => {
    const saved = localStorage.getItem('nitan_products_list');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.filter(p => !p.name.includes('สินค้าทุกรายการ') && !p.name.includes('All Products') && p.name !== 'ไม่ระบุ (ไม่เจาะจงสินค้า)');
    }
    return [];
  });

  // Clean Initial Promotion Plans Data State
  const [promotionPlans, setPromotionPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  React.useEffect(() => {
    async function loadPlans() {
      setIsLoadingPlans(true);
      const data = await fetchPromotionPlansFromSupabase();
      if (data) {
        const formattedData = data.map(dbPlan => ({
          id: dbPlan.id,
          code: `PROMO-${dbPlan.id.substring(0, 6).toUpperCase()}`,
          title: dbPlan.title,
          category: dbPlan.category,
          targetProductId: dbPlan.product_id,
          targetProductName: dbPlan.product_name,
          targetBranch: dbPlan.target_branch,
          status: dbPlan.status,
          discountOffer: dbPlan.discount_text,
          startDate: dbPlan.start_date,
          endDate: dbPlan.end_date,
          budget: dbPlan.budget,
          projectedSales: dbPlan.projected_sales,
          channels: dbPlan.channels || [],
          description: dbPlan.description,
          docContent: dbPlan.doc_content,
          checklist: [
            { task: 'จัดเตรียมอาร์ตเวิร์คโปรโมชัน', completed: false },
            { task: 'เสร็จแล้ว', completed: false }
          ]
        }));
        // Sort by nearest upcoming date by default
        formattedData.sort((a, b) => {
          const dateA = a.startDate || a.start_date || '9999-99-99';
          const dateB = b.startDate || b.start_date || '9999-99-99';
          return dateA.localeCompare(dateB);
        });
        setPromotionPlans(formattedData);
      }
      setIsLoadingPlans(false);
    }
    loadPlans();
  }, []);

  React.useEffect(() => {
    localStorage.setItem('nitan_products_list', JSON.stringify(productsList));
    localStorage.setItem('nitan_promotion_branches', JSON.stringify(branchesList));
  }, [productsList, branchesList]);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Drag and drop state
  const [draggedPlanId, setDraggedPlanId] = useState(null);
  const [dragOverPlanId, setDragOverPlanId] = useState(null);

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageCategoriesModal, setShowManageCategoriesModal] = useState(false);
  const [showManageProductsModal, setShowManageProductsModal] = useState(false);
  const [showManageBranchesModal, setShowManageBranchesModal] = useState(false);
  const [viewDocPlan, setViewDocPlan] = useState(null); // Doc Format Viewer Modal State
  const [editingPlan, setEditingPlan] = useState(null);
  const [lineModalItem, setLineModalItem] = useState(null);
  const [exportPreviewPlan, setExportPreviewPlan] = useState(null); // Export Preview Modal

  // Category Manager Modal Inputs State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Product Manager Modal Inputs State
  const [newProductName, setNewProductName] = useState('');
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingProductName, setEditingProductName] = useState('');

  // Branch Manager Modal Inputs State
  const [newBranchName, setNewBranchName] = useState('');
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [editingBranchName, setEditingBranchName] = useState('');

  // Form State for Add / Edit Plan Modal
  const [formData, setFormData] = useState({
    title: '',
    category: 'Product Promotion',
    targetProductName: 'Sunscreen Aqua Gel (กันแดดสูตรน้ำ)',
    targetBranch: 'ทุกสาขา',
    status: 'planned',
    discountOffer: '',
    startDate: '',
    endDate: '',
    budget: '',
    projectedSales: '',
    description: '',
    channelsStr: '',
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

  // Product Management Handlers
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    const newProd = {
      id: `prod-${Date.now()}`,
      name: newProductName.trim()
    };

    setProductsList(prev => [...prev, newProd]);
    setNewProductName('');
  };

  const handleStartEditProduct = (prod) => {
    setEditingProductId(prod.id);
    setEditingProductName(prod.name);
  };

  const handleSaveEditProduct = (prodId) => {
    if (!editingProductName.trim()) return;

    const updatedName = editingProductName.trim();
    setProductsList(prev => prev.map(p => p.id === prodId ? { ...p, name: updatedName } : p));
    setEditingProductId(null);
    setEditingProductName('');
  };

  const handleDeleteProduct = (prodId) => {
    setProductsList(prev => prev.filter(p => p.id !== prodId));
  };

  // Branch Management Handlers
  const handleAddBranch = (e) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;

    const newBranch = {
      id: `b-${Date.now()}`,
      name: newBranchName.trim()
    };

    setBranchesList(prev => [...prev, newBranch]);
    setNewBranchName('');
  };

  const handleStartEditBranch = (branch) => {
    setEditingBranchId(branch.id);
    setEditingBranchName(branch.name);
  };

  const handleSaveEditBranch = (branchId) => {
    if (!editingBranchName.trim()) return;

    const updatedName = editingBranchName.trim();
    setBranchesList(prev => prev.map(b => b.id === branchId ? { ...b, name: updatedName } : b));
    setEditingBranchId(null);
    setEditingBranchName('');
  };

  const handleDeleteBranch = (branchId) => {
    setBranchesList(prev => prev.filter(b => b.id !== branchId));
  };

  // Open Add Plan Modal
  const handleOpenAddModal = () => {
    setEditingPlan(null);
    setFormData({
      title: '',
      category: categories[0]?.name || 'Product Promotion',
      targetProductName: productsList[0]?.name || 'สินค้าทุกรายการ (All Products)',
      targetBranch: 'ทุกสาขา',
      status: 'planned',
      discountOffer: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      budget: '',
      projectedSales: '',
      description: '',
      channelsStr: '',
      docContent: ''
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
      status: plan.status || 'planned',
      discountOffer: plan.discountOffer || '',
      startDate: plan.startDate || '',
      endDate: plan.endDate || '',
      budget: plan.budget ?? '',
      projectedSales: plan.projectedSales ?? '',
      description: plan.description || '',
      channelsStr: plan.channels ? plan.channels.join(', ') : '',
      docContent: plan.docContent || ''
    });
    setShowAddModal(true);
  };

  // Save Add or Edit Plan
  const handleSaveForm = async (e) => {
    e.preventDefault();
    const channelsList = formData.channelsStr.split(',').map(c => c.trim()).filter(Boolean);

    let planToSave;

    if (editingPlan) {
      planToSave = {
        ...editingPlan,
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
      };
      setPromotionPlans(prev => prev.map(p => p.id === editingPlan.id ? planToSave : p));
    } else {
      planToSave = {
        id: `promo-${Date.now()}`,
        code: `PROMO-${String(Date.now()).substring(0, 6)}`,
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
          { task: 'จัดเตรียมอาร์ตเวิร์คโปรโมชัน', completed: false },
          { task: 'เสร็จแล้ว', completed: false }
        ]
      };
      setPromotionPlans(prev => [planToSave, ...prev]);
    }

    setShowAddModal(false);

    // Sync to Supabase
    const savedData = await upsertPromotionPlanToSupabase(planToSave);
    if (!editingPlan && savedData && savedData[0] && savedData[0].id) {
      // Update local state with the real UUID generated by Supabase
      setPromotionPlans(prev => prev.map(p => p.id === planToSave.id ? { ...p, id: savedData[0].id } : p));
    }
  };

  // Delete Plan
  const handleDeletePlan = async (id) => {
    setPromotionPlans(prev => prev.filter(p => p.id !== id));
    await deletePromotionPlanFromSupabase(id);
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

  // Available Channels for Filter
  const availableChannels = useMemo(() => {
    const channelSet = new Set([
      'Facebook',
      'TikTok',
      'Instagram',
      'Line OA',
      'Shopee',
      'Lazada',
      'Grab',
      'Google',
      'Influencer',
      'Offline / POSM / หน้าร้าน',
      'Event / Workshop'
    ]);

    promotionPlans.forEach(p => {
      if (Array.isArray(p.channels)) {
        p.channels.forEach(ch => {
          if (ch && typeof ch === 'string' && ch.trim()) {
            channelSet.add(ch.trim());
          }
        });
      }
    });

    return Array.from(channelSet);
  }, [promotionPlans]);

  // Filtered Logic with Auto-sorting by upcoming date
  const filteredPlans = promotionPlans
    .filter(plan => {
      const matchCategory = selectedCategory === 'all' || plan.category === selectedCategory;
      const matchProduct = selectedProduct === 'all' || (plan.targetProductName && plan.targetProductName.toLowerCase().includes(selectedProduct.toLowerCase()));
      const matchBranch = selectedBranch === 'all' || plan.targetBranch === selectedBranch || plan.targetBranch === 'ทุกสาขา';
      const matchStatus = selectedStatus === 'all' || plan.status === selectedStatus;
      
      const matchChannel = selectedChannel === 'all' || (() => {
        const query = selectedChannel.toLowerCase();
        if (Array.isArray(plan.channels)) {
          if (plan.channels.some(c => typeof c === 'string' && c.toLowerCase().includes(query))) return true;
        }
        if (typeof plan.channelsStr === 'string' && plan.channelsStr.toLowerCase().includes(query)) return true;
        if (typeof plan.description === 'string' && plan.description.toLowerCase().includes(query)) return true;
        return false;
      })();

      const matchSearch = !searchQuery ||
        (plan.title && plan.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (plan.code && plan.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (plan.targetProductName && plan.targetProductName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (Array.isArray(plan.channels) && plan.channels.some(c => typeof c === 'string' && c.toLowerCase().includes(searchQuery.toLowerCase())));

      return matchCategory && matchProduct && matchBranch && matchStatus && matchChannel && matchSearch;
    })
    .sort((a, b) => {
      const dateA = a.startDate || a.start_date || '9999-99-99';
      const dateB = b.startDate || b.start_date || '9999-99-99';
      return dateA.localeCompare(dateB);
    });

  // Sort by date (nearest upcoming first)
  const handleSortByDate = () => {
    setPromotionPlans(prev => {
      const sorted = [...prev].sort((a, b) => {
        const dateA = a.startDate || a.start_date || '9999-99-99';
        const dateB = b.startDate || b.start_date || '9999-99-99';
        return dateA.localeCompare(dateB);
      });
      return sorted;
    });
    if (onShowSaveToast) {
      onShowSaveToast('จัดเรียงแผนโปรโมทตามวันที่เริ่มงานที่จะถึงก่อนเรียบร้อยแล้ว!');
    }
  };

  // Drag & Drop handlers for prioritizing promotion plans
  const handlePlanDragStart = (e, planId) => {
    setDraggedPlanId(planId);
    e.dataTransfer.setData('text/plain', planId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handlePlanDragOver = (e, planId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverPlanId !== planId) {
      setDragOverPlanId(planId);
    }
  };

  const handlePlanDragLeave = (e, planId) => {
    if (dragOverPlanId === planId) {
      setDragOverPlanId(null);
    }
  };

  const handlePlanDrop = (e, targetPlanId) => {
    e.preventDefault();
    if (!draggedPlanId || draggedPlanId === targetPlanId) {
      setDraggedPlanId(null);
      setDragOverPlanId(null);
      return;
    }

    setPromotionPlans(prev => {
      const fromIndex = prev.findIndex(p => p.id === draggedPlanId);
      const toIndex = prev.findIndex(p => p.id === targetPlanId);

      if (fromIndex !== -1 && toIndex !== -1) {
        const updated = [...prev];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        return updated;
      }
      return prev;
    });

    if (onShowSaveToast) {
      onShowSaveToast('จัดลำดับแผนโปรโมทเรียบร้อยแล้ว!');
    }

    setDraggedPlanId(null);
    setDragOverPlanId(null);
  };

  const handlePlanDragEnd = () => {
    setDraggedPlanId(null);
    setDragOverPlanId(null);
  };

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
              <span>ระบบบริหารแผนการโปรโมท (Promotion Plan & Doc Brief System)</span>
            </div>
            <h2 className="text-xl font-bold text-purple-950 tracking-tight flex items-center gap-2">
              <span>แผนการโปรโมทสินค้า การตลาด และแคมเปญส่งเสริมการขาย</span>
            </h2>
            <p className="text-xs text-purple-800/80 font-medium mt-1">
              วางแผนข้อเสนอโปรโมชัน (Discounts / Buy 1 Get 1) พร้อมระบบรองรับเอกสาร Campaign Brief ในรูปแบบ Doc Format
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Button: Sort by upcoming date */}
            <button
              onClick={handleSortByDate}
              className="px-3.5 py-2.5 bg-white hover:bg-purple-50 text-purple-950 font-bold rounded-xl text-xs transition border border-[#E2D2EA] flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="จัดเรียงแผนโปรโมทตามวันที่เริ่มงานที่จะถึงก่อน (Upcoming First)"
            >
              <Calendar className="w-4 h-4 text-purple-700" />
              <span>📅 เรียงตามวันที่ใกล้ถึงก่อน</span>
            </button>

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
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${selectedCategory === 'all'
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
                className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${selectedCategory === cat.name
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
          {/* Product Filter with Add/Edit/Delete capability */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-[#E2D2EA]">
            <Package className="w-3.5 h-3.5 text-purple-600" />
            <span className="font-bold text-purple-900">เลือกสินค้าที่เกี่ยวข้อง:</span>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="bg-transparent font-bold text-purple-950 focus:outline-none text-xs"
            >
              <option value="all">สินค้าทั้งหมด (All Products)</option>
              {productsList.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>

            <button
              onClick={() => setShowManageProductsModal(true)}
              className="px-2 py-0.5 rounded-lg font-bold bg-[#FFEBF3] hover:bg-pink-200 text-purple-950 border border-[#E2D2EA] transition flex items-center gap-1 cursor-pointer text-[11px]"
              title="จัดการตัวเลือกสินค้า (เพิ่ม / แก้ไข / ลบ)"
            >
              <Settings className="w-3 h-3 text-purple-700" />
              <span>เพิ่ม/ลด/แก้ไข</span>
            </button>
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
              {branchesList && branchesList.length > 0 ? branchesList.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              )) : (
                <>
                  <option value="NITAN หลัก">NITAN หลัก (สำนักงานใหญ่)</option>
                  <option value="NITAN เขาพระตำหนัก">NITAN เขาพระตำหนัก</option>
                  <option value="NITAN นาเกลือ">NITAN นาเกลือ</option>
                </>
              )}
            </select>
            <button
              onClick={() => setShowManageBranchesModal(true)}
              className="p-1.5 text-purple-400 hover:text-purple-600 hover:bg-white rounded-lg transition"
              title="จัดการสาขา"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Channel Filter */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-[#E2D2EA]">
            <Share2 className="w-3.5 h-3.5 text-purple-600" />
            <span className="font-bold text-purple-900">ช่องทางสื่อสาร:</span>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="bg-transparent font-bold text-purple-950 focus:outline-none text-xs"
            >
              <option value="all">ทุกช่องทาง (All Channels)</option>
              {availableChannels.map(ch => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
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

          {(selectedCategory !== 'all' || selectedProduct !== 'all' || selectedBranch !== 'all' || selectedChannel !== 'all' || selectedStatus !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedProduct('all');
                setSelectedBranch('all');
                setSelectedChannel('all');
                setSelectedStatus('all');
                setSearchQuery('');
              }}
              className="px-2.5 py-1 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold transition flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>ล้างตัวกรอง</span>
            </button>
          )}

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
            const isDragging = draggedPlanId === plan.id;
            const isDragOver = dragOverPlanId === plan.id && !isDragging;

            return (
              <div
                key={plan.id}
                draggable="true"
                onDragStart={(e) => handlePlanDragStart(e, plan.id)}
                onDragOver={(e) => handlePlanDragOver(e, plan.id)}
                onDragLeave={(e) => handlePlanDragLeave(e, plan.id)}
                onDrop={(e) => handlePlanDrop(e, plan.id)}
                onDragEnd={handlePlanDragEnd}
                className={`glass-panel p-5 border-[#E2D2EA] flex flex-col justify-between space-y-4 transition-all duration-200 select-none ${
                  isDragging
                    ? 'opacity-40 scale-[0.98] border-2 border-dashed border-purple-400 bg-purple-50/40 shadow-inner'
                    : isDragOver
                    ? 'ring-2 ring-purple-500 border-purple-400 bg-purple-50/80 scale-[1.01] shadow-lg'
                    : 'hover:shadow-md'
                }`}
              >
                <div>
                  {/* Header Badge Row with Drag Handle */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Drag Handle Icon ⠿ (No number badge) */}
                      <div
                        className="cursor-grab active:cursor-grabbing p-1 text-purple-400 hover:text-purple-700 -ml-1 pr-1 transition"
                        title="คลิกลากเพื่อจัดเรียงลำดับ (Drag & Drop)"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-white shadow-xs">
                        {plan.code}
                      </span>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFEBF3] text-purple-950 border border-[#E2D2EA]">
                        {plan.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${plan.status === 'active'
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
                    {plan.discountOffer && (
                      <div className="flex items-center justify-between">
                        <span className="text-purple-900 font-bold flex items-center gap-1">
                          <Gift className="w-3.5 h-3.5 text-purple-700" />
                          <span>ข้อเสนอโปรโมชัน (Offer):</span>
                        </span>
                        <span className="font-mono font-extrabold text-pink-700 bg-white px-2 py-0.5 rounded border border-purple-200 shadow-xs">
                          {plan.discountOffer}
                        </span>
                      </div>
                    )}

                    <div className={`grid grid-cols-2 gap-2 text-[11px] ${plan.discountOffer ? 'pt-1 border-t border-dashed border-purple-200/80' : ''}`}>
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
      {showAddModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="glass-panel max-w-7xl w-full p-6 flex flex-col border-[#E2D2EA] shadow-2xl bg-white/95 max-h-[95vh] rounded-2xl">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3 shrink-0">
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

            <form onSubmit={handleSaveForm} className="flex-1 overflow-hidden flex flex-col mt-4 min-h-0">
              <div className="flex-1 overflow-y-auto pr-2 text-xs flex flex-col lg:flex-row gap-8 min-h-0">

                {/* Left Side: Form Fields */}
                <div className="w-full lg:w-[380px] xl:w-[420px] space-y-5 shrink-0">
                  <div>
                    <label className="block text-purple-950 font-bold mb-1.5 text-sm">ชื่อแผนโปรโมชัน / แคมเปญ</label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น ซื้อ 1 แถม 1 Sunscreen Aqua Gel"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-purple-950 font-bold mb-1.5">ประเภทแผนโปรโมท</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-bold focus:outline-none shadow-sm"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>
                            {cat.label || cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-purple-950 font-bold mb-1.5">สถานะแคมเปญ</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-bold focus:outline-none shadow-sm"
                      >
                        <option value="planned">วางแผนล่วงหน้า</option>
                        <option value="active">กำลังดำเนินการ</option>
                        <option value="completed">เสร็จสิ้น</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-purple-950 font-bold mb-1.5 flex items-center justify-between">
                        <span>สินค้าเป้าหมาย</span>
                        <button
                          type="button"
                          onClick={() => setShowManageProductsModal(true)}
                          className="text-[9px] text-pink-600 hover:text-pink-700 font-bold underline flex items-center gap-0.5 shrink-0"
                        >
                          <Settings className="w-2.5 h-2.5" />
                          <span>จัดการ</span>
                        </button>
                      </label>
                      <select
                        value={formData.targetProductName}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetProductName: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-bold focus:outline-none shadow-sm text-xs"
                      >
                        <option value="ไม่ระบุ (ไม่เจาะจงสินค้า)">ไม่ระบุ (ไม่เจาะจงสินค้า)</option>
                        <option value="สินค้าทุกรายการ (All Products)">สินค้าทุกรายการ (All Products)</option>
                        {productsList.map(p => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-purple-950 font-bold mb-1.5">สาขาที่จัดโปรโมชัน</label>
                      <select
                        value={formData.targetBranch}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetBranch: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-bold focus:outline-none shadow-sm text-xs"
                      >
                        <option value="ทุกสาขา">ทุกสาขา (All Branches)</option>
                        {branchesList && branchesList.length > 0 ? branchesList.map(b => (
                          <option key={b.id} value={b.name}>{b.name}</option>
                        )) : (
                          <>
                            <option value="NITAN หลัก">NITAN หลัก (สนงญ)</option>
                            <option value="NITAN เขาพระตำหนัก">เขาพระตำหนัก</option>
                            <option value="NITAN นาเกลือ">นาเกลือ</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-purple-950 font-bold mb-1.5">ข้อเสนอโปรโมชัน / ส่วนลด (Offer Description)</label>
                    <input
                      type="text"
                      placeholder="เช่น ซื้อ 1 แถม 1 หรือ สะสมพอยต์ (ไม่ระบุก็ได้)"
                      value={formData.discountOffer}
                      onChange={(e) => setFormData(prev => ({ ...prev, discountOffer: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-[#FFEBF3] border border-pink-200 rounded-xl text-purple-950 font-bold focus:outline-none focus:ring-2 focus:ring-pink-300 shadow-sm placeholder:text-pink-400 placeholder:font-medium"
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-purple-950 font-bold mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-purple-600" />
                          <span>เลือกระยะเวลาจัดโปรโมชัน</span>
                        </span>
                        <span className="text-[10px] text-purple-600 font-medium">หรือเลือกแค่เดือนด้านล่าง 👇</span>
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-purple-900 text-[11px] font-bold mb-1">เริ่มต้นวันที่</label>
                          <input
                            type="date"
                            required
                            value={formData.startDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none shadow-sm text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-purple-900 text-[11px] font-bold mb-1">สิ้นสุดวันที่</label>
                          <input
                            type="date"
                            required
                            value={formData.endDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none shadow-sm text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F6EDFA] p-3 rounded-xl border border-purple-100 flex items-center justify-between gap-3">
                      <div className="text-xs font-bold text-purple-900">
                        ⚡ ทางลัด: เลือกแบบเต็มเดือน
                      </div>
                      <input
                        type="month"
                        onChange={(e) => {
                          const val = e.target.value; // e.g., "2026-08"
                          if (val) {
                            const [year, month] = val.split('-');
                            const firstDay = `${year}-${month}-01`;
                            const lastDay = new Date(year, month, 0).getDate();
                            const endDay = `${year}-${month}-${lastDay}`;
                            setFormData(prev => ({ ...prev, startDate: firstDay, endDate: endDay }));
                          }
                        }}
                        className="flex-1 max-w-[160px] px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-purple-950 font-bold focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-purple-950 font-bold mb-1.5">งบโปรโมชัน (บาท)</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={formData.budget}
                        onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-mono font-bold focus:outline-none shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-purple-950 font-bold mb-1.5">เป้าหมายยอดขาย (บาท)</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={formData.projectedSales}
                        onChange={(e) => setFormData(prev => ({ ...prev, projectedSales: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-mono font-bold focus:outline-none shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-purple-950 font-bold mb-1.5">ช่องทางที่สื่อสาร (คั่นด้วยจุลภาค ,)</label>
                    <input
                      type="text"
                      placeholder="เช่น Facebook Ads, TikTok Shop, Shopee, หน้าร้าน"
                      value={formData.channelsStr}
                      onChange={(e) => setFormData(prev => ({ ...prev, channelsStr: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none shadow-sm"
                    />
                  </div>

                </div>

                {/* Right Side: Rich Text Editor */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex-1 flex flex-col h-full min-h-[450px]">
                    <label className="block text-purple-950 font-bold mb-1 flex items-center justify-between shrink-0">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-purple-700" />
                        <span>เนื้อหาเอกสารแผนแคมเปญ (Doc Format / Campaign Brief):</span>
                      </span>
                      <span className="text-[10px] text-purple-700 font-medium hidden xl:inline">รองรับตารางจาก AI และ Notion</span>
                    </label>
                    <div className="bg-white border border-[#E2D2EA] rounded-xl overflow-hidden shadow-inner text-purple-950 font-sans flex-1 flex flex-col min-h-0">
                      <JoditEditor
                        value={formData.docContent}
                        config={{
                          readonly: false,
                          height: 680,
                          minHeight: 680,
                          askBeforePasteHTML: false,
                          askBeforePasteFromWord: false,
                          defaultActionOnPaste: 'insert_as_html',
                          placeholder: "ใส่เอกสารบรีฟ... วางตารางจาก AI หรือ Word ได้เลย",
                          buttons: [
                            'source', '|',
                            'bold', 'strikethrough', 'underline', 'italic', '|',
                            'ul', 'ol', '|',
                            'outdent', 'indent', '|',
                            'font', 'fontsize', 'brush', 'paragraph', '|',
                            'image', 'video', 'table', 'link', '|',
                            'align', 'undo', 'redo', '|',
                            'hr', 'eraser', 'fullsize'
                          ],
                          uploader: {
                            insertImageAsBase64URI: true
                          },
                          showXPathInStatusbar: false,
                          showWordsCounter: false,
                          showCharsCounter: false,
                          imageProcessor: {
                            replaceDataURIToBlobIdInView: true
                          },
                          events: {
                            beforeUpload: async function (files) {
                              if (files && files.length > 0) {
                                for (let i = 0; i < files.length; i++) {
                                  const file = files[i];
                                  if (file.type.startsWith('image/')) {
                                    try {
                                      const compressed = await compressImage(file);
                                      this.selection.insertHTML(`<img src="${compressed}" style="max-width: 100%; height: auto;" />`);
                                    } catch (err) {
                                      console.error('File compression failed:', err);
                                    }
                                  }
                                }
                                return false;
                              }
                            },
                            drop: async function (event) {
                              const files = event.dataTransfer?.files;
                              if (files && files.length > 0) {
                                const file = files[0];
                                if (file.type.startsWith('image/')) {
                                  event.preventDefault();
                                  try {
                                    const compressed = await compressImage(file);
                                    this.selection.insertHTML(`<img src="${compressed}" style="max-width: 100%; height: auto;" />`);
                                  } catch (err) {
                                    console.error('Image compression failed:', err);
                                  }
                                  return false;
                                }
                              }
                            },
                            paste: async function (event) {
                              const clipboardData = event.clipboardData || window.clipboardData;
                              if (clipboardData && clipboardData.items) {
                                for (let i = 0; i < clipboardData.items.length; i++) {
                                  const item = clipboardData.items[i];
                                  if (item.type.indexOf('image') !== -1) {
                                    const file = item.getAsFile();
                                    if (file) {
                                      event.preventDefault();
                                      try {
                                        const compressed = await compressImage(file);
                                        this.selection.insertHTML(`<img src="${compressed}" style="max-width: 100%; height: auto;" />`);
                                      } catch (err) {
                                        console.error('Image compression failed:', err);
                                      }
                                      return false;
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }}
                        onBlur={(newContent) => setFormData(prev => ({ ...prev, docContent: newContent }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions Footer */}
              <div className="pt-4 border-t border-purple-100 flex justify-end gap-2 text-xs shrink-0 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-purple-50 text-purple-900 rounded-xl font-bold hover:bg-purple-100 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl shadow-md hover:opacity-95 transition cursor-pointer text-sm"
                >
                  {editingPlan ? 'บันทึกการแก้ไข' : '+ เพิ่มแผนโปรโมทใหม่'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
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

      {/* MODAL 2.5: Dynamic Product Manager Modal (เพิ่ม/แก้ไข/ลบ สินค้าที่เกี่ยวข้อง) */}
      {showManageProductsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="glass-panel max-w-lg w-full p-6 space-y-4 border-[#E2D2EA] shadow-2xl bg-white/95 my-8">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFEBF3] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-purple-950">
                  จัดการตัวเลือกสินค้าที่เกี่ยวข้อง (Add / Edit / Delete Products)
                </h3>
              </div>
              <button onClick={() => setShowManageProductsModal(false)} className="text-purple-400 hover:text-purple-700 font-bold cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add New Product Form */}
            <form onSubmit={handleAddProduct} className="space-y-2 text-xs">
              <label className="block text-purple-950 font-bold">เพิ่มสินค้าที่เกี่ยวข้องใหม่:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  placeholder="เช่น Sunscreen Aqua Gel 50ml หรือ เซรั่มสลายฝ้า"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs transition shadow-md shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-pink-300" />
                  <span>+ เพิ่มสินค้า</span>
                </button>
              </div>
            </form>

            {/* Products List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pt-2">
              <span className="text-xs font-bold text-purple-900 block">รายการสินค้าที่เกี่ยวข้องในระบบ ({productsList.length}):</span>

              {productsList.map(prod => {
                const isEditing = editingProductId === prod.id;

                return (
                  <div key={prod.id} className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 flex items-center justify-between gap-2 text-xs">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingProductName}
                        onChange={(e) => setEditingProductName(e.target.value)}
                        className="flex-1 px-2.5 py-1 bg-white border border-purple-300 rounded-lg text-purple-950 font-bold focus:outline-none text-xs"
                      />
                    ) : (
                      <span className="font-bold text-purple-950">{prod.name}</span>
                    )}

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveEditProduct(prod.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>บันทึก</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEditProduct(prod)}
                          className="p-1 text-purple-600 hover:bg-purple-100 rounded-md transition cursor-pointer"
                          title="แก้ไขชื่อสินค้า"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-1 text-rose-500 hover:bg-rose-100 rounded-md transition cursor-pointer"
                        title="ลบสินค้านี้"
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
                onClick={() => setShowManageProductsModal(false)}
                className="px-5 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs transition shadow-md cursor-pointer"
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Doc Format Full Campaign Brief Viewer Modal */}
      {viewDocPlan && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="glass-panel max-w-4xl w-full p-6 flex flex-col border-[#E2D2EA] shadow-2xl bg-white/95 max-h-[95vh] rounded-2xl">
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

            <div className="p-6 mt-4 mb-4 rounded-2xl bg-[#FCFAF7] border border-purple-200/90 shadow-inner flex-1 min-h-[50vh] max-h-[75vh] overflow-y-auto">
              <div
                className="font-sans text-sm md:text-base text-purple-950 prose prose-purple max-w-none 
                  [&>ol]:list-decimal [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:ml-4 
                  [&>h1]:text-xl [&>h1]:font-bold [&>h2]:text-lg [&>h2]:font-bold
                  [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-purple-300 [&_table]:my-4
                  [&_th]:border [&_th]:border-purple-300 [&_th]:bg-purple-100 [&_th]:p-2 [&_th]:text-left [&_th]:font-bold
                  [&_td]:border [&_td]:border-purple-200 [&_td]:p-2 [&_td]:align-top"
                dangerouslySetInnerHTML={{
                  __html: viewDocPlan.docContent || `<p class="text-purple-600/60 italic">ไม่มีเนื้อหาเอกสารบรีฟในขณะนี้ (สามารถกดปุ่มแก้ไขเพื่อกรอกเนื้อหา Doc Brief ได้)</p>`
                }}
              />
            </div>

            <div className="pt-3 border-t border-purple-100 flex items-center justify-between gap-2 text-xs shrink-0 flex-wrap">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(viewDocPlan.docContent || viewDocPlan.title);
                  alert('คัดลอกข้อความเอกสาร Doc สำเร็จ!');
                }}
                className="px-3.5 py-2 bg-white hover:bg-purple-50 text-purple-950 border border-[#E2D2EA] font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Copy className="w-3.5 h-3.5 text-purple-700" />
                <span>คัดลอกข้อความ</span>
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setExportPreviewPlan(viewDocPlan)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export (รูป / PDF)</span>
                </button>

                <button
                  onClick={() => {
                    handleOpenEditModal(viewDocPlan);
                    setViewDocPlan(null);
                  }}
                  className="px-4 py-2 bg-[#FFEBF3] hover:bg-pink-200 text-purple-950 font-bold rounded-xl border border-[#E2D2EA] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-purple-700" />
                  <span>แก้ไข Doc</span>
                </button>

                <button
                  onClick={() => setViewDocPlan(null)}
                  className="px-5 py-2 bg-purple-950 text-white font-bold rounded-xl transition shadow-md cursor-pointer"
                >
                  ปิด
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* MODAL 4: Dynamic Branch Manager Modal */}
      {showManageBranchesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="glass-panel max-w-lg w-full p-6 space-y-4 border-[#E2D2EA] shadow-2xl bg-white/95 my-8">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFEBF3] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-purple-950">จัดการสาขา (Branches)</h3>
                  <p className="text-xs text-purple-800/80">เพิ่มแก้ไขรายชื่อสาขาที่ใช้จัดโปรโมชัน</p>
                </div>
              </div>
              <button onClick={() => setShowManageBranchesModal(false)} className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-full transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBranch} className="flex gap-2">
              <input
                type="text"
                placeholder="เพิ่มสาขาใหม่..."
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#FCFAF7] border border-purple-200 rounded-xl text-purple-950 font-medium focus:outline-none focus:border-purple-400 text-sm"
              />
              <button type="submit" disabled={!newBranchName.trim()} className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold rounded-xl transition disabled:opacity-50 cursor-pointer">
                เพิ่ม
              </button>
            </form>

            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
              <span className="text-xs font-bold text-purple-900 block">รายการสาขาในระบบ ({branchesList.length}):</span>

              {branchesList.map(branch => {
                const isEditing = editingBranchId === branch.id;

                if (isEditing) {
                  return (
                    <div key={branch.id} className="flex items-center gap-2 bg-purple-50 p-2 rounded-xl border border-purple-200">
                      <input
                        type="text"
                        autoFocus
                        value={editingBranchName}
                        onChange={(e) => setEditingBranchName(e.target.value)}
                        className="flex-1 px-2 py-1 bg-white border border-purple-200 rounded-lg text-purple-950 text-sm focus:outline-none"
                      />
                      <button onClick={() => handleSaveEditBranch(branch.id)} className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 cursor-pointer">
                        บันทึก
                      </button>
                      <button onClick={() => setEditingBranchId(null)} className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-lg hover:bg-purple-200 cursor-pointer">
                        ยกเลิก
                      </button>
                    </div>
                  );
                }

                return (
                  <div key={branch.id} className="flex items-center justify-between p-2.5 bg-white border border-purple-100 rounded-xl hover:bg-purple-50/50 transition">
                    <span className="font-semibold text-purple-950 text-sm">{branch.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEditBranch(branch)}
                        className="p-1 text-purple-400 hover:bg-purple-100 rounded transition cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBranch(branch.id)}
                        className="p-1 text-rose-400 hover:bg-rose-100 rounded transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowManageBranchesModal(false)}
                className="px-5 py-2 bg-purple-950 text-white font-bold rounded-xl shadow-md hover:opacity-90 cursor-pointer"
              >
                เสร็จสิ้น
              </button>
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

      {/* MODAL 5: Export Preview Modal (Image / PDF) */}
      {exportPreviewPlan && createPortal(
        <DocExportPreviewModal
          plan={exportPreviewPlan}
          onClose={() => setExportPreviewPlan(null)}
        />,
        document.body
      )}

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Helper: Split HTML string into atomic semantic DOM blocks
───────────────────────────────────────────────────────────── */
function splitHtmlIntoBlocks(html) {
  if (!html) return [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const container = doc.body.firstElementChild;
    if (!container) return [];

    const blocks = [];
    Array.from(container.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) blocks.push(`<p>${text}</p>`);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if ((node.tagName === 'UL' || node.tagName === 'OL') && node.children.length > 2) {
          // Break large lists into individual LIs so long list items paginate smoothly
          Array.from(node.children).forEach((li) => {
            const tag = node.tagName.toLowerCase();
            blocks.push(`<${tag} class="list-item-block">${li.outerHTML}</${tag}>`);
          });
        } else {
          blocks.push(node.outerHTML);
        }
      }
    });
    return blocks.length > 0 ? blocks : [html];
  } catch (e) {
    return [html];
  }
}

/* ─────────────────────────────────────────────────────────────
   DocExportPreviewModal — Smart Content-Aware Multi-Page A4 Preview
   Automatically paginates at block boundaries so text lines are never cut
───────────────────────────────────────────────────────────── */
export function DocExportPreviewModal({ plan, onClose, isPublicStandalone = false }) {
  const [docPages, setDocPages] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [showPngPicker, setShowPngPicker] = useState(false);
  const [selectedPages, setSelectedPages] = useState([]);
  const [shareUrl, setShareUrl] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const measureHeaderRef = useRef(null);
  const measureBlocksRef = useRef([]);
  const pageRefs = useRef([]);
  const pickerRef = useRef(null);

  // A4 standard at 96 dpi
  const A4_W = 794;
  const A4_H = 1123;
  const PAD_H = 54;
  const PAD_LR = 54;

  const metaRows = React.useMemo(() => [
    { label: 'ประเภทแผน',      value: plan.category || '-' },
    { label: 'สินค้าเป้าหมาย', value: plan.targetProductName || '-' },
    { label: 'งบจัดสรร',       value: `฿${plan.budget?.toLocaleString() ?? '-'}` },
    { label: 'เป้าหมายยอดขาย', value: `฿${plan.projectedSales?.toLocaleString() ?? '-'}` },
    { label: 'ช่วงเวลา',       value: plan.startDate && plan.endDate ? `${plan.startDate} → ${plan.endDate}` : '-' },
    { label: 'สาขา',           value: plan.targetBranch || '-' },
  ], [plan]);

  const S = {
    docBody: {
      fontFamily: "'Sarabun','Noto Sans Thai',sans-serif",
      fontSize: 12.5,
      color: '#1a0030',
      lineHeight: 1.6,
      width: '100%',
      wordBreak: 'break-word',
      overflowWrap: 'break-word',
    },
    header: { borderBottom: '2px solid #4f0074', paddingBottom: 12, marginBottom: 14 },
    headerTop: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 },
    badge: { background: '#4f0074', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace' },
    title: { fontSize: 16, fontWeight: 700, color: '#1a0030', margin: 0 },
    subtitle: { fontSize: 10.5, color: '#7e22ce', marginTop: 2 },
    metaGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 16 },
    metaCell: { background: '#f5f0ff', border: '1px solid #e2d2ea', borderRadius: 6, padding: '6px 8px' },
    metaLabel: { fontSize: 8.5, color: '#7e22ce', fontWeight: 700, display: 'block', marginBottom: 1, textTransform: 'uppercase', letterSpacing: '0.04em' },
    metaValue: { fontSize: 11.5, fontWeight: 700, color: '#1a0030' },
  };

  // Split HTML into blocks
  const blocks = React.useMemo(() => {
    return splitHtmlIntoBlocks(plan.docContent || '<p style="color:#9333ea;font-style:italic">ไม่มีเนื้อหาเอกสาร Doc</p>');
  }, [plan.docContent]);

  // ── Auto-Pagination Engine ────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      const headerH = measureHeaderRef.current ? measureHeaderRef.current.offsetHeight : 190;
      const footerH = 36;
      const page1Budget = A4_H - (PAD_H * 2) - headerH - footerH - 14;
      const pageNBudget = A4_H - (PAD_H * 2) - 46 - footerH - 14;

      if (!blocks || blocks.length === 0) {
        setDocPages([[]]);
        return;
      }

      const pages = [];
      let currentPage = [];
      let currentH = 0;
      let isPage1 = true;
      let maxH = page1Budget;

      blocks.forEach((blockHtml, idx) => {
        const blockEl = measureBlocksRef.current[idx];
        const blockH = blockEl ? blockEl.offsetHeight + 6 : 40;

        if (currentPage.length === 0 || (currentH + blockH <= maxH)) {
          currentPage.push(blockHtml);
          currentH += blockH;
        } else {
          pages.push(currentPage);
          currentPage = [blockHtml];
          isPage1 = false;
          maxH = pageNBudget;
          currentH = blockH;
        }
      });

      if (currentPage.length > 0) {
        pages.push(currentPage);
      }

      setDocPages(pages);
    }, 60);

    return () => clearTimeout(timer);
  }, [blocks, plan.title, plan.code, plan.category, plan.budget, plan.projectedSales, plan.startDate, plan.endDate, plan.targetBranch]);

  const numPages = docPages.length || 1;

  // ── Print ─────────────────────────────────────────────────
  const handlePrint = useCallback(() => {
    const metaHTML = metaRows
      .map(r => `<div class="mc"><span class="ml">${r.label}</span><span class="mv">${r.value}</span></div>`)
      .join('');
    const docBody = plan.docContent || '<p style="color:#9333ea;font-style:italic">ไม่มีเนื้อหาเอกสาร Doc</p>';
    const win = window.open('', '_blank', 'width=960,height=800');
    if (!win) { alert('กรุณาอนุญาต pop-up ในเบราว์เซอร์'); return; }
    win.document.write(`<!DOCTYPE html><html lang="th"><head><meta charset="utf-8">
<title>${plan.title || 'เอกสาร'}</title>
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
<style>
@page{size:A4 portrait;margin:12mm 14mm}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Sarabun','Noto Sans Thai',sans-serif;font-size:12.5px;color:#1a0030;line-height:1.6;background:#fff}
.hd{border-bottom:2px solid #4f0074;padding-bottom:10px;margin-bottom:12px;break-inside:avoid}
.ht{display:flex;align-items:center;gap:8px;margin-bottom:4px}
.cb{background:#4f0074;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;font-family:monospace}
.dt{font-size:16px;font-weight:700}
.ds{font-size:10.5px;color:#7e22ce;margin-top:2px}
.mg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:14px;break-inside:avoid;page-break-inside:avoid}
.mc{background:#f5f0ff;border:1px solid #e2d2ea;border-radius:6px;padding:6px 8px}
.ml{font-size:8.5px;color:#7e22ce;font-weight:700;display:block;margin-bottom:1px;text-transform:uppercase}
.mv{font-size:11.5px;font-weight:700}
.bc h1{font-size:15px;font-weight:700;margin:12px 0 6px;break-after:avoid;page-break-after:avoid}
.bc h2{font-size:13px;font-weight:700;margin:10px 0 4px;color:#3b0764;border-left:3px solid #7c3aed;padding-left:6px;break-after:avoid;page-break-after:avoid}
.bc h3{font-size:12px;font-weight:700;margin:8px 0 3px;color:#4f0074;break-after:avoid;page-break-after:avoid}
.bc p{margin:4px 0 6px}
.bc ul,.bc ol{margin-left:18px;margin-bottom:6px}
.bc li{margin-bottom:2px;break-inside:avoid;page-break-inside:avoid}
.bc table{width:100%;border-collapse:collapse;margin:10px 0;font-size:11.5px;break-inside:avoid;page-break-inside:avoid}
.bc th{background:#ede9fe;border:1px solid #c4b5fd;padding:5px 7px;text-align:left;font-weight:700}
.bc td{border:1px solid #ddd6fe;padding:4px 7px;vertical-align:top}
.bc tr:nth-child(even) td{background:#faf5ff}
.bc img{max-width:100%;height:auto}
.ft{margin-top:20px;padding-top:8px;border-top:1px solid #e5e7eb;font-size:9.5px;color:#9ca3af;display:flex;justify-content:space-between}
</style></head><body>
<div class="hd"><div class="ht"><span class="cb">${plan.code||'DOC'}</span><span class="dt">${plan.title||'เอกสาร'}</span></div><div class="ds">เอกสารแผนแคมเปญโปรโมท (Campaign Doc Brief)</div></div>
<div class="mg">${metaHTML}</div>
<div class="bc">${docBody}</div>
<div class="ft"><span>NITAN Marketing Platform</span><span>สร้างเมื่อ ${new Date().toLocaleDateString('th-TH')}</span></div>
</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 700);
  }, [plan, metaRows]);

  // ── Export PDF ────────────────────────────────────────────
  const handleExportPDF = useCallback(async () => {
    setIsExporting(true); setExportType('pdf');
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < docPages.length; i++) {
        const pageEl = pageRefs.current[i];
        if (!pageEl) continue;
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: A4_W,
          height: A4_H,
        });
        if (i > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfW, pdfH);
      }
      pdf.save(`${(plan.title||'doc').replace(/\s+/g,'_')}.pdf`);
    } catch (err) {
      console.error(err); alert('เกิดข้อผิดพลาดในการ Export PDF');
    } finally { setIsExporting(false); setExportType(null); }
  }, [docPages, plan]);

  // ── Export PNG ────────────────────────────────────────────
  const handleExportImage = useCallback(async (pagesToExport) => {
    setIsExporting(true); setExportType('image'); setShowPngPicker(false);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const targetIndices = (!pagesToExport || pagesToExport.length === 0)
        ? docPages.map((_, i) => i)
        : pagesToExport;

      const canvases = [];
      for (const idx of targetIndices) {
        const pageEl = pageRefs.current[idx];
        if (!pageEl) continue;
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: A4_W,
          height: A4_H,
        });
        canvases.push(canvas);
      }

      if (canvases.length === 1) {
        const link = document.createElement('a');
        link.download = `${(plan.title||'doc').replace(/\s+/g,'_')}_p${targetIndices[0]+1}.png`;
        link.href = canvases[0].toDataURL('image/png');
        link.click();
      } else if (canvases.length > 1) {
        const merged = document.createElement('canvas');
        merged.width = canvases[0].width;
        merged.height = canvases.reduce((sum, c) => sum + c.height, 0);
        const ctx = merged.getContext('2d');
        let currentY = 0;
        canvases.forEach((c) => {
          ctx.drawImage(c, 0, currentY);
          currentY += c.height;
        });
        const link = document.createElement('a');
        link.download = `${(plan.title||'doc').replace(/\s+/g,'_')}_p${targetIndices.map(p=>p+1).join('-')}.png`;
        link.href = merged.toDataURL('image/png');
        link.click();
      }
    } catch (err) {
      console.error(err); alert('เกิดข้อผิดพลาดในการ Export รูป');
    } finally { setIsExporting(false); setExportType(null); }
  }, [docPages, plan]);

  const togglePage = useCallback((idx) => {
    setSelectedPages(prev =>
      prev.includes(idx) ? prev.filter(p => p !== idx) : [...prev, idx].sort((a,b)=>a-b)
    );
  }, []);

  const openPngPicker = useCallback(() => {
    setSelectedPages(Array.from({ length: numPages }, (_, i) => i));
    setShowPngPicker(v => !v);
  }, [numPages]);

  // ── Share Link ───────────────────────────────────────────
  const handleCreateShareLink = useCallback(async () => {
    setIsSharing(true);
    try {
      const planId = plan.id;
      if (!planId) throw new Error('กรุณาบันทึกเอกสารแผนก่อนแชร์ลิงก์');
      const origin = window.location.origin;
      const path = window.location.pathname;
      const url = `${origin}${path}?docPreview=${planId}`;
      setShareUrl(url);

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 3000);
      }
    } catch (err) {
      console.error('Share link error:', err);
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setIsSharing(false);
    }
  }, [plan]);

  const handleCopyShareUrl = useCallback(() => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    });
  }, [shareUrl]);

  return (
    <div className={isPublicStandalone ? "min-h-screen w-full flex flex-col bg-slate-900 animate-in fade-in duration-200" : "fixed inset-0 z-[60] flex flex-col bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"}>
      <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 bg-purple-950 shadow-xl shrink-0 gap-2 sm:gap-3 flex-wrap">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
          <Eye className="w-4 h-4 sm:w-5 h-5 text-pink-300 shrink-0" />
          <div className="min-w-0">
            <p className="text-white font-bold text-xs sm:text-sm leading-tight truncate">
              {isPublicStandalone ? "NITAN Campaign Brief (Preview)" : "Preview ก่อน Export"}
            </p>
            <p className="text-purple-300 text-[10px] sm:text-xs truncate">{plan.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap">
          <span className="px-2 sm:px-2.5 py-1 bg-purple-800 border border-purple-700 text-purple-200 text-[9px] sm:text-[10px] font-bold rounded-lg">
            {numPages} หน้า
          </span>

          <button onClick={handlePrint} disabled={isExporting}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-purple-700 hover:bg-purple-600 border border-purple-600 text-white text-[11px] sm:text-xs font-bold rounded-lg transition cursor-pointer disabled:opacity-50">
            <Printer className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden xs:inline sm:inline">พิมพ์</span>
          </button>

          <div className="relative" ref={pickerRef}>
            <button
              onClick={openPngPicker}
              disabled={isExporting}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] sm:text-xs font-bold rounded-lg transition cursor-pointer disabled:opacity-50"
            >
              {isExporting && exportType==='image'
                ? <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin"/>
                : <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5"/>}
              <span>PNG</span>
              <span className="ml-0.5 text-emerald-200 text-[9px]">▾</span>
            </button>

            {showPngPicker && (
              <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-purple-200 rounded-xl shadow-2xl p-3 sm:p-4 min-w-[200px] sm:min-w-[220px] animate-in fade-in slide-in-from-top-1 duration-150">
                <p className="text-[11px] font-bold text-purple-900 mb-2.5 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-purple-600"/>
                  เลือกหน้าที่ต้องการ Export
                </p>
                <div className="flex gap-2 mb-2.5">
                  <button
                    onClick={() => setSelectedPages(Array.from({ length: numPages }, (_, i) => i))}
                    className="flex-1 text-[10px] font-bold px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg transition cursor-pointer"
                  >
                    ทั้งหมด
                  </button>
                  <button
                    onClick={() => setSelectedPages([])}
                    className="flex-1 text-[10px] font-bold px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition cursor-pointer"
                  >
                    ยกเลิกทั้งหมด
                  </button>
                </div>
                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {Array.from({ length: numPages }, (_, i) => (
                    <label
                      key={i}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition ${
                        selectedPages.includes(i)
                          ? 'bg-emerald-50 border border-emerald-300'
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPages.includes(i)}
                        onChange={() => togglePage(i)}
                        className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-gray-800">หน้า {i + 1}</span>
                      {i === 0 && (
                        <span className="ml-auto text-[9px] text-purple-500 font-medium bg-purple-50 px-1 py-0.5 rounded-md">ปก</span>
                      )}
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => {
                    if (selectedPages.length === 0) { alert('กรุณาเลือกอย่างน้อย 1 หน้า'); return; }
                    handleExportImage(selectedPages);
                  }}
                  disabled={selectedPages.length === 0}
                  className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition cursor-pointer disabled:opacity-40"
                >
                  <ImageIcon className="w-3.5 h-3.5"/>
                  Export {selectedPages.length > 0 ? `${selectedPages.length} หน้า` : ''} เป็น PNG
                </button>
                <button
                  onClick={() => setShowPngPicker(false)}
                  className="mt-1 w-full text-[10px] text-gray-400 hover:text-gray-600 py-1 cursor-pointer transition"
                >
                  ยกเลิก
                </button>
              </div>
            )}
          </div>

          <button onClick={handleExportPDF} disabled={isExporting}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[11px] sm:text-xs font-bold rounded-lg transition cursor-pointer disabled:opacity-50">
            {isExporting && exportType==='pdf' ? <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin"/> : <FileDown className="w-3 h-3 sm:w-3.5 sm:h-3.5"/>}
            <span>PDF</span>
          </button>

          {!isPublicStandalone && (
            <button
              onClick={handleCreateShareLink}
              disabled={isSharing || isExporting}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-[11px] sm:text-xs font-bold rounded-lg transition cursor-pointer disabled:opacity-50"
            >
              {isSharing ? <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin"/> : <Link className="w-3 h-3 sm:w-3.5 sm:h-3.5"/>}
              <span className="hidden xs:inline sm:inline">แชร์</span>
            </button>
          )}

          {!isPublicStandalone && (
            <button onClick={onClose}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[11px] sm:text-xs font-bold rounded-lg transition cursor-pointer">
              <X className="w-3 h-3 sm:w-3.5 sm:h-3.5"/><span>ปิด</span>
            </button>
          )}
        </div>
      </div>

      {shareUrl && (
        <div className="shrink-0 bg-sky-950 border-b border-sky-800 px-3 sm:px-5 py-2 sm:py-2.5 flex items-center gap-2 sm:gap-3 flex-wrap">
          <Link className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-300 shrink-0"/>
          <span className="text-sky-200 text-[11px] sm:text-xs font-bold shrink-0">ลิงก์สาธารณะ:</span>
          <input
            readOnly
            value={shareUrl}
            className="flex-1 min-w-0 bg-sky-900 border border-sky-700 text-sky-100 text-[11px] sm:text-xs rounded-lg px-2.5 py-1.5 font-mono truncate outline-none"
            onClick={e => e.target.select()}
          />
          <button
            onClick={handleCopyShareUrl}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition cursor-pointer shrink-0 ${
              shareCopied ? 'bg-emerald-500 text-white' : 'bg-sky-600 hover:bg-sky-500 text-white'
            }`}
          >
            {shareCopied ? <><CheckCircle className="w-3.5 h-3.5"/><span>คัดลอกแล้ว!</span></> : <><Copy className="w-3.5 h-3.5"/><span>คัดลอก</span></>}
          </button>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-sky-700 hover:bg-sky-600 text-sky-100 text-[11px] sm:text-xs font-bold rounded-lg transition shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5"/>
            <span>เปิด</span>
          </a>
        </div>
      )}

      <div className="flex-1 overflow-y-auto bg-slate-200 py-4 sm:py-8 flex flex-col items-center gap-6 sm:gap-8 px-2 sm:px-4">
        {docPages.map((pageBlocks, pageIdx) => (
          <div key={pageIdx} className="w-full max-w-[794px] relative shrink-0" style={{ marginTop: pageIdx === 0 ? 0 : 12 }}>
            {/* Page number badge */}
            <div className="absolute -top-7 left-0 right-0 flex justify-center items-center pointer-events-none">
              <span className="bg-purple-700 text-white text-[10px] font-bold px-3 py-0.5 rounded-full tracking-wider shadow-md">
                หน้า {pageIdx + 1} / {docPages.length}
              </span>
            </div>

            {/* Responsive White Page Card */}
            <div
              ref={(el) => (pageRefs.current[pageIdx] = el)}
              className="w-full bg-white rounded-xl shadow-xl border border-purple-100/80 p-4 sm:p-10 md:p-12 flex flex-col justify-between transition-all md:min-h-[1123px] box-border"
            >
              <div style={{ width: '100%', paddingTop: 4 }}>
                {pageIdx === 0 ? (
                  <>
                    {/* Header */}
                    <div style={S.header}>
                      <div style={S.headerTop}>
                        <span style={S.badge}>{plan.code || 'DOC'}</span>
                        <h1 style={S.title}>{plan.title || 'เอกสารแผนแคมเปญ'}</h1>
                      </div>
                      <div style={S.subtitle}>เอกสารแผนแคมเปญโปรโมท (Campaign Doc Brief)</div>
                    </div>

                    {/* Meta grid */}
                    <div style={S.metaGrid}>
                      {metaRows.map((r, i) => (
                        <div key={i} style={S.metaCell}>
                          <span style={S.metaLabel}>{r.label}</span>
                          <span style={S.metaValue}>{r.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  /* Page 2+ Mini Continuation Header */
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderBottom: '2px solid #e9d5ff', paddingBottom: 10, marginBottom: 20,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={S.badge}>{plan.code || 'DOC'}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1a0030' }}>{plan.title} (ต่อ)</span>
                    </div>
                    <span style={{ fontSize: 10.5, color: '#7e22ce', fontWeight: 600 }}>หน้า {pageIdx + 1}</span>
                  </div>
                )}

                <div
                  className="[&_h1]:text-[15px] [&_h1]:font-bold [&_h1]:mt-3 [&_h1]:mb-1.5 [&_h1]:text-[#1a0030]
                    [&_h2]:text-[13px] [&_h2]:font-bold [&_h2]:mt-2.5 [&_h2]:mb-1 [&_h2]:text-[#3b0764] [&_h2]:border-l-[3px] [&_h2]:border-violet-600 [&_h2]:pl-2
                    [&_h3]:text-xs [&_h3]:font-bold [&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-[#4f0074]
                    [&_p]:mb-1.5 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:mb-0.5
                    [&_table]:w-full [&_table]:border-collapse [&_table]:text-[11.5px] [&_table]:my-2
                    [&_th]:bg-purple-100 [&_th]:border [&_th]:border-purple-300 [&_th]:p-1.5 [&_th]:font-bold [&_th]:text-left
                    [&_td]:border [&_td]:border-purple-200 [&_td]:p-1.5 [&_td]:align-top
                    [&_strong]:font-bold [&_em]:italic [&_img]:max-w-full [&_img]:h-auto"
                  style={S.docBody}
                  dangerouslySetInnerHTML={{
                    __html: pageBlocks.join('') || '<p style="color:#9333ea;font-style:italic">ไม่มีเนื้อหาเอกสาร Doc</p>'
                  }}
                />
              </div>

              <div style={{
                borderTop: '1px solid #f3e8ff',
                paddingTop: 8,
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 10,
                color: '#9ca3af',
                fontWeight: 500,
              }}>
                <span>NITAN Marketing Platform</span>
                <span>หน้า {pageIdx + 1} / {docPages.length}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        position: 'fixed', top: 0, left: '-9999px',
        width: A4_W - PAD_LR * 2,
        pointerEvents: 'none', visibility: 'hidden', zIndex: -1,
      }}>
        <div ref={measureHeaderRef} style={S.docBody}>
          <div style={S.header}>
            <div style={S.headerTop}>
              <span style={S.badge}>{plan.code || 'DOC'}</span>
              <h1 style={S.title}>{plan.title || 'เอกสารแผนแคมเปญ'}</h1>
            </div>
            <div style={S.subtitle}>เอกสารแผนแคมเปญโปรโมท (Campaign Doc Brief)</div>
          </div>
          <div style={S.metaGrid}>
            {metaRows.map((r, i) => (
              <div key={i} style={S.metaCell}>
                <span style={S.metaLabel}>{r.label}</span>
                <span style={S.metaValue}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={S.docBody}
          className="[&_h1]:text-[15px] [&_h1]:font-bold [&_h1]:mt-3 [&_h1]:mb-1.5 [&_h1]:text-[#1a0030]
            [&_h2]:text-[13px] [&_h2]:font-bold [&_h2]:mt-2.5 [&_h2]:mb-1 [&_h2]:text-[#3b0764] [&_h2]:border-l-[3px] [&_h2]:border-violet-600 [&_h2]:pl-2
            [&_h3]:text-xs [&_h3]:font-bold [&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-[#4f0074]
            [&_p]:mb-1.5 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:mb-0.5
            [&_table]:w-full [&_table]:border-collapse [&_table]:text-[11.5px] [&_table]:my-2
            [&_th]:bg-purple-100 [&_th]:border [&_th]:border-purple-300 [&_th]:p-1.5 [&_th]:font-bold [&_th]:text-left
            [&_td]:border [&_td]:border-purple-200 [&_td]:p-1.5 [&_td]:align-top
            [&_strong]:font-bold [&_em]:italic [&_img]:max-w-full [&_img]:h-auto"
        >
          {blocks.map((bHtml, bIdx) => (
            <div
              key={bIdx}
              ref={(el) => (measureBlocksRef.current[bIdx] = el)}
              dangerouslySetInnerHTML={{ __html: bHtml }}
            />
          ))}
        </div>
      </div>

      <div className="shrink-0 bg-purple-900/95 px-6 py-2 flex items-center justify-center text-[11px] text-purple-300">
        <span>📄 ระบบคำนวณและตัดแบ่งหน้าตามย่อหน้าอัตโนมัติ &nbsp;·&nbsp; รวม {numPages} หน้า &nbsp;·&nbsp; ข้อความจะไม่ถูกตัดขาดหรือทับซ้อน</span>
      </div>
    </div>
  );
}


