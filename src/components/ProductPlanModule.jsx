import React, { useState } from 'react';
import {
  Package,
  CheckSquare,
  Square,
  AlertTriangle,
  TrendingUp,
  Clock,
  Plus,
  DollarSign,
  Sparkles,
  Layers,
  Image as ImageIcon,
  CalendarCheck,
  Send,
  BarChart,
  Tag,
  Check,
  X,
  Edit2,
  Trash2,
  GripVertical,
  Calendar
} from 'lucide-react';

export default function ProductPlanModule({
  campaigns = [],
  products = [],
  onToggleStageChecklist,
  onAddCampaign,
  onEditCampaign,
  onDeleteCampaign,
  onReorderCampaigns,
  onAddProduct,
  onEditProduct,
  onDeleteProduct
}) {
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductCatalog, setShowProductCatalog] = useState(false);

  // Drag and drop state
  const [draggedCampId, setDraggedCampId] = useState(null);
  const [dragOverCampId, setDragOverCampId] = useState(null);

  // Form campaign state
  const [name, setName] = useState('');
  const [productId, setProductId] = useState('');
  const [startDate, setStartDate] = useState('2026-08-25');
  const [endDate, setEndDate] = useState('2026-09-05');
  const [budget, setBudget] = useState(50000);
  const [revenueTarget, setRevenueTarget] = useState(800000);
  const [actualRevenue, setActualRevenue] = useState(0);

  // Inline quick-add product inside campaign modal
  const [showInlineAddProduct, setShowInlineAddProduct] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdImage, setNewProdImage] = useState('');

  // Combined & deduplicated list of all previously created products
  const allAvailableProducts = React.useMemo(() => {
    const map = new Map();

    // 1. From props.products
    (products || []).forEach(p => {
      if (p && p.id && p.name) map.set(p.id, p);
    });

    // 2. From localStorage (nitan_products_list)
    try {
      const saved = localStorage.getItem('nitan_products_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.forEach(p => {
          if (p && p.name && !p.name.includes('สินค้าทุกรายการ') && !p.name.includes('All Products')) {
            const id = p.id || `prod-local-${p.name}`;
            if (!map.has(id)) {
              map.set(id, { id, name: p.name, sku: p.sku || 'SKU-001', price: p.price || 0, image_url: p.image_url || '' });
            }
          }
        });
      }
    } catch (e) { }

    // 3. Fallback default products if totally empty
    if (map.size === 0) {
      const defaults = [
        { id: 'prod-def-1', name: 'Nitan Signature Coffee Beans (House Blend)', sku: 'COFFEE-HB-01', price: 350, image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&auto=format&fit=crop&q=60' },
        { id: 'prod-def-2', name: 'Nitan Hydrating Sunscreen SPF50+ PA++++', sku: 'SUN-SPF50-02', price: 490, image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=60' },
        { id: 'prod-def-3', name: 'Nitan Deep Recovery Serum', sku: 'SERUM-REC-03', price: 890, image_url: 'https://images.unsplash.com/photo-1608248597359-598d1a1b1812?w=300&auto=format&fit=crop&q=60' }
      ];
      defaults.forEach(d => map.set(d.id, d));
    }

    return Array.from(map.values());
  }, [products]);


  const openCreateModal = () => {
    setEditingCampaign(null);
    setName('');
    setProductId('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0]);
    setBudget(50000);
    setRevenueTarget(800000);
    setActualRevenue(0);
    setShowInlineAddProduct(false);
    setShowAddCampaignModal(true);
  };

  const openEditModal = (camp) => {
    setEditingCampaign(camp);
    setName(camp.name || '');
    setProductId(camp.product_id || '');
    setStartDate(camp.start_date || new Date().toISOString().split('T')[0]);
    setEndDate(camp.end_date || new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0]);
    setBudget(camp.budget ?? 50000);
    setRevenueTarget(camp.revenue_target ?? camp.projectedSales ?? 800000);
    setActualRevenue(camp.actual_revenue ?? 0);
    setShowInlineAddProduct(false);
    setShowAddCampaignModal(true);
  };

  const handleDelete = (campaignId, campaignName) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบแคมเปญ "${campaignName}"?`)) {
      if (onDeleteCampaign) {
        onDeleteCampaign(campaignId);
      }
    }
  };

  const openProductModal = (product = null) => {
    setEditingProduct(product);
    setNewProdName(product?.name || '');
    setNewProdSku(product?.sku || '');
    setNewProdPrice(product?.price || '');
    setNewProdImage(product?.image_url || '');
    setShowAddProductModal(true);
  };

  const handleQuickAddProduct = (e) => {
    e?.preventDefault();
    if (!newProdName.trim()) {
      alert('กรุณาระบุชื่อสินค้า');
      return;
    }

    if (editingProduct) {
      // Edit existing product
      const updated = {
        ...editingProduct,
        name: newProdName.trim(),
        sku: newProdSku.trim() || editingProduct.sku,
        price: Number(newProdPrice) || editingProduct.price,
        image_url: newProdImage.trim() || editingProduct.image_url
      };
      if (onEditProduct) onEditProduct(updated);
    } else {
      // Create new product
      const createdProduct = {
        id: `prod-${Date.now()}`,
        team_id: 'team-1',
        name: newProdName.trim(),
        sku: newProdSku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        price: Number(newProdPrice) || 0,
        image_url: newProdImage.trim() || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=60'
      };
      if (onAddProduct) onAddProduct(createdProduct);
      setProductId(createdProduct.id);
    }

    setNewProdName('');
    setNewProdSku('');
    setNewProdPrice('');
    setNewProdImage('');
    setEditingProduct(null);
    setShowAddProductModal(false);
  };

  const handleSaveCampaign = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    let targetProdId = productId;

    // If user filled in inline new product name without clicking add button, auto-create it
    if (showInlineAddProduct && newProdName.trim()) {
      const createdProduct = {
        id: `prod-${Date.now()}`,
        team_id: 'team-1',
        name: newProdName.trim(),
        sku: newProdSku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        price: Number(newProdPrice) || 0,
        image_url: newProdImage.trim() || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=60'
      };
      if (onAddProduct) onAddProduct(createdProduct);
      targetProdId = createdProduct.id;
    }

    if (editingCampaign) {
      // Edit existing campaign
      const updated = {
        ...editingCampaign,
        name,
        product_id: targetProdId || editingCampaign.product_id,
        start_date: startDate,
        end_date: endDate,
        budget: Number(budget),
        revenue_target: Number(revenueTarget),
        actual_revenue: Number(actualRevenue)
      };
      if (onEditCampaign) onEditCampaign(updated);
    } else {
      // Create new campaign
      const newCamp = {
        id: `camp-${Date.now()}`,
        team_id: 'team-1',
        product_id: targetProdId || allAvailableProducts[0]?.id || '',
        marketing_plan_id: 'mkt-plan-1',
        name,
        description: 'แคมเปญใหม่ผูกกับสินค้า',
        start_date: startDate,
        end_date: endDate,
        budget: Number(budget),
        revenue_target: Number(revenueTarget),
        actual_revenue: Number(actualRevenue) || 0,
        image_ready: false,
        scheduled: false,
        posted: false,
        stage_status: 't_minus_5',
        status: 'planning'
      };
      if (onAddCampaign) onAddCampaign(newCamp);
    }

    setName('');
    setShowAddCampaignModal(false);
    setShowInlineAddProduct(false);
    setEditingCampaign(null);
  };

  const getStageBadge = (stage) => {
    switch (stage) {
      case 'overdue':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-900 border border-rose-300 animate-pulse flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>เลยกำหนด (OVERDUE)</span>
          </span>
        );
      case 't_minus_0':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>วันจริง (T-0 Launch)</span>
          </span>
        );
      case 't_minus_2':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>เตือนตั้งเวลา (T-2 Days)</span>
          </span>
        );
      case 't_minus_5':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-pink-100 text-rose-900 border border-pink-300 flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4 text-pink-600" />
            <span>เตรียมอาร์ตเวิร์ก (T-5 Days)</span>
          </span>
        );
      default:
        return null;
    }
  };

  // Sort by date handler
  const handleSortByDate = () => {
    const sorted = [...campaigns].sort((a, b) => {
      const dateA = a.start_date || '9999-99-99';
      const dateB = b.start_date || '9999-99-99';
      return dateA.localeCompare(dateB);
    });
    if (onReorderCampaigns) {
      onReorderCampaigns(sorted);
    }
  };

  // Drag & drop handlers
  const handleDragStart = (e, campId) => {
    setDraggedCampId(campId);
    e.dataTransfer.setData('text/plain', campId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, campId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCampId !== campId) {
      setDragOverCampId(campId);
    }
  };

  const handleDragLeave = (e, campId) => {
    if (dragOverCampId === campId) {
      setDragOverCampId(null);
    }
  };

  const handleDrop = (e, targetCampId) => {
    e.preventDefault();
    if (!draggedCampId || draggedCampId === targetCampId) {
      setDraggedCampId(null);
      setDragOverCampId(null);
      return;
    }

    const fromIndex = campaigns.findIndex(c => c.id === draggedCampId);
    const toIndex = campaigns.findIndex(c => c.id === targetCampId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const updated = [...campaigns];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      if (onReorderCampaigns) {
        onReorderCampaigns(updated);
      }
    }

    setDraggedCampId(null);
    setDragOverCampId(null);
  };

  const handleDragEnd = () => {
    setDraggedCampId(null);
    setDragOverCampId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-pink-100 text-pink-600 border border-pink-200 shadow-sm">
              <Package className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-rose-950">Product Plan &amp; Campaign Readiness</h2>
              <p className="text-xs text-rose-800 font-bold">ผูกแคมเปญกับสินค้า ตรวจสอบสถานะการเตรียมงาน (FR-3.2) และดูยอดขาย ROI (FR-3.4)</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
          {/* Button: Sort by upcoming date */}
          <button
            onClick={handleSortByDate}
            className="px-3.5 py-2.5 bg-white hover:bg-pink-50 text-rose-900 font-bold rounded-xl text-xs transition border border-pink-200 shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="จัดเรียงแคมเปญตามวันที่เริ่มงานที่จะถึงก่อน (Upcoming First)"
          >
            <Calendar className="w-3.5 h-3.5 text-pink-600" />
            <span>📅 เรียงตามวันที่ใกล้ถึงก่อน</span>
          </button>

          {/* Button: Manage Products */}
          <button
            onClick={() => setShowProductCatalog(!showProductCatalog)}
            className={`px-4 py-2.5 font-bold rounded-xl text-xs transition border shadow-xs flex items-center gap-1.5 cursor-pointer ${showProductCatalog
                ? 'bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-200'
                : 'bg-white hover:bg-pink-50 text-rose-900 border-pink-200'
              }`}
          >
            <Tag className="w-3.5 h-3.5 text-pink-600" />
            <span>จัดการสินค้า ({allAvailableProducts.length})</span>
          </button>

          {/* Button: Create Campaign */}
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] hover:opacity-90 text-purple-950 font-bold rounded-xl text-xs transition shadow-xs border border-[#E2D2EA] flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างแคมเปญใหม่</span>
          </button>
        </div>
      </div>

      {/* Product Catalog Panel */}
      {showProductCatalog && (
        <div className="glass-panel p-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-rose-950 flex items-center gap-2">
              <Tag className="w-4 h-4 text-pink-600" />
              รายการสินค้าทั้งหมด ({allAvailableProducts.length} รายการ)
            </h3>
            <button
              onClick={() => openProductModal()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              + เพิ่มสินค้าใหม่
            </button>
          </div>

          {allAvailableProducts.length === 0 ? (
            <p className="text-xs text-rose-700 font-bold text-center py-4">ยังไม่มีสินค้าในระบบ</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {allAvailableProducts.map(prod => (
                <div key={prod.id} className="bg-white/80 border border-pink-200 rounded-2xl p-3 flex items-center gap-3 hover:border-pink-300 transition group">
                  <img
                    src={prod.image_url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=60'}
                    alt={prod.name}
                    className="w-10 h-10 rounded-xl object-cover border border-pink-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-rose-950 truncate">{prod.name}</p>
                    <p className="text-[10px] text-rose-700 font-bold">{prod.sku} · ฿{Number(prod.price).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                    <button
                      onClick={() => openProductModal(prod)}
                      className="p-1.5 bg-pink-100 hover:bg-pink-200 rounded-lg cursor-pointer"
                      title="แก้ไขสินค้า"
                    >
                      <Edit2 className="w-3 h-3 text-pink-700" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`ลบสินค้า "${prod.name}" ออกจากระบบ?`)) {
                          if (onDeleteProduct) onDeleteProduct(prod.id);
                        }
                      }}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer"
                      title="ลบสินค้า"
                    >
                      <Trash2 className="w-3 h-3 text-rose-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Campaign List Grid — 2 columns */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {campaigns.length === 0 ? (
          <div className="glass-panel p-8 text-center text-rose-800 font-bold text-sm">
            <Package className="w-10 h-10 text-pink-400 mx-auto mb-2 opacity-60" />
            <p>ยังไม่มีแคมเปญสินค้าในระบบ</p>
            <p className="text-xs text-rose-600 font-normal mt-1">คลิกปุ่ม "สร้างแคมเปญใหม่" ด้านบนเพื่อเริ่มต้นสร้างแคมเปญ</p>
          </div>
        ) : (
          campaigns.map((camp) => {
            const product = camp.product_id ? (allAvailableProducts.find(p => p.id === camp.product_id) || null) : null;
            const roi = camp.budget > 0 ? (((camp.actual_revenue - camp.budget) / camp.budget) * 100).toFixed(0) : 0;
            const isDragging = draggedCampId === camp.id;
            const isDragOver = dragOverCampId === camp.id && !isDragging;

            return (
              <div
                key={camp.id}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, camp.id)}
                onDragOver={(e) => handleDragOver(e, camp.id)}
                onDragLeave={(e) => handleDragLeave(e, camp.id)}
                onDrop={(e) => handleDrop(e, camp.id)}
                onDragEnd={handleDragEnd}
                className={`glass-panel p-5 transition-all duration-200 flex flex-col group select-none ${
                  isDragging
                    ? 'opacity-40 scale-[0.98] border-2 border-dashed border-rose-400 bg-pink-50/40 shadow-inner'
                    : isDragOver
                    ? 'ring-2 ring-pink-500 border-pink-400 bg-pink-50/80 scale-[1.01] shadow-lg'
                    : 'hover:border-pink-300 hover:shadow-md'
                }`}
              >
                {/* Top: Campaign info + optional product */}
                <div className="flex items-start gap-3 mb-4">
                  {/* Drag Handle Icon ⠿ (No number badge) */}
                  <div
                    className="cursor-grab active:cursor-grabbing p-1 text-rose-300 hover:text-pink-600 rounded-lg hover:bg-pink-100/60 transition shrink-0 self-center"
                    title="คลิกลากเพื่อจัดเรียงลำดับแคมเปญ (Drag & Drop)"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {product && (
                    <img
                      src={product.image_url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=60'}
                      alt={product.name}
                      className="w-12 h-12 rounded-xl object-cover border border-pink-200 shadow-sm flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      {product && (
                        <span className="text-[9px] uppercase font-bold text-rose-800 bg-pink-100 px-2 py-0.5 rounded-full border border-pink-200">
                          {product.sku || 'SKU'}
                        </span>
                      )}
                      {getStageBadge(camp.stage_status)}
                    </div>
                    <h3 className="font-extrabold text-rose-950 text-sm leading-tight truncate">{camp.name}</h3>
                    {product && (
                      <p className="text-[11px] text-rose-900 mt-0.5 font-bold truncate">
                        📦 {product.name} · ฿{Number(product.price).toLocaleString()}
                      </p>
                    )}
                    <p className="text-[11px] text-rose-700 mt-0.5 font-semibold">
                      📅 {camp.start_date} — {camp.end_date}
                    </p>
                  </div>
                </div>

                {/* Middle: Stage Checklist */}
                <div className="rounded-2xl bg-white/80 border border-pink-200 p-3 space-y-1.5 mb-3">
                  <div className="text-[10px] font-black text-rose-800 pb-1 border-b border-pink-100 flex justify-between">
                    <span>สถานะเตรียมงาน (FR-3.2)</span>
                    <span className="text-rose-500 font-bold">คลิกทำเครื่องหมาย</span>
                  </div>
                  <button
                    onClick={() => onToggleStageChecklist(camp.id, 'image_ready')}
                    className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between transition cursor-pointer text-[11px] font-bold ${camp.image_ready ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-pink-50/70 text-rose-900 hover:bg-pink-100'}`}
                  >
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>1. ภาพพร้อม (Image Ready)</span>
                    </span>
                    {camp.image_ready ? <CheckSquare className="w-3.5 h-3.5 text-emerald-600" /> : <Square className="w-3.5 h-3.5 text-pink-400" />}
                  </button>
                  <button
                    onClick={() => onToggleStageChecklist(camp.id, 'scheduled')}
                    className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between transition cursor-pointer text-[11px] font-bold ${camp.scheduled ? 'bg-sky-100 text-sky-900 border border-sky-300' : 'bg-pink-50/70 text-rose-900 hover:bg-pink-100'}`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-600" />
                      <span>2. ตั้งเวลาโพสต์แล้ว (Scheduled)</span>
                    </span>
                    {camp.scheduled ? <CheckSquare className="w-3.5 h-3.5 text-sky-600" /> : <Square className="w-3.5 h-3.5 text-pink-400" />}
                  </button>
                  <button
                    onClick={() => onToggleStageChecklist(camp.id, 'posted')}
                    className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between transition cursor-pointer text-[11px] font-bold ${camp.posted ? 'bg-purple-100 text-purple-900 border border-purple-300' : 'bg-pink-50/70 text-rose-900 hover:bg-pink-100'}`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-purple-600" />
                      <span>3. โพสต์จริงแล้ว (Posted)</span>
                    </span>
                    {camp.posted ? <CheckSquare className="w-3.5 h-3.5 text-purple-600" /> : <Square className="w-3.5 h-3.5 text-pink-400" />}
                  </button>
                </div>

                {/* Bottom: ROI Stats */}
                <div className="rounded-2xl bg-white/80 border border-pink-200 p-3 grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-rose-700 font-bold">ยอดขายจริง</span>
                    <span className="font-black text-rose-950 text-base">฿{Number(camp.actual_revenue).toLocaleString()}</span>
                    <span className="text-[10px] text-rose-600">เป้า: ฿{Number(camp.revenue_target).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col items-end justify-center">
                    <span className="text-[10px] text-rose-700 font-bold">งบแคมเปญ</span>
                    <span className="font-black text-rose-950">฿{Number(camp.budget).toLocaleString()}</span>
                    <span className="font-extrabold text-emerald-600 text-sm mt-0.5">+{roi}% ROI</span>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="mt-auto pt-3 border-t border-pink-100/80 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(camp)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-pink-50 hover:bg-pink-100 text-rose-800 border border-pink-200 rounded-xl text-[11px] font-bold transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-pink-600" />
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(camp.id, camp.name)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-[11px] font-bold transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    ลบ
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: ADD / EDIT CAMPAIGN */}
      {showAddCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-pink-200 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-rose-950">
                {editingCampaign ? 'แก้ไขแคมเปญสินค้า' : 'สร้างแคมเปญสินค้าใหม่'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddCampaignModal(false);
                  setEditingCampaign(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="space-y-3 text-xs">
              <div>
                <label className="block text-rose-800 font-extrabold mb-1">ชื่อแคมเปญ *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น แคมเปญเปิดตัว ครีมกันแดดฉ่ำวาว"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-pink-50/60 border border-pink-200 text-rose-950 p-2.5 rounded-xl font-bold focus:outline-pink-400"
                />
              </div>

              {/* Related Product Selection / Quick Add */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-rose-800 font-extrabold text-xs">
                    เลือกสินค้าที่เกี่ยวข้อง <span className="font-normal text-rose-500">(ไม่บังคับ)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowInlineAddProduct(!showInlineAddProduct)}
                    className="text-[11px] text-pink-700 hover:text-pink-900 font-bold flex items-center gap-1 bg-pink-100/80 hover:bg-pink-200/80 px-2.5 py-1 rounded-lg cursor-pointer transition shadow-xs"
                  >
                    {showInlineAddProduct ? (
                      <><X className="w-3 h-3" /><span>ปิดฟอร์มเพิ่มสินค้า</span></>
                    ) : (
                      <><Plus className="w-3 h-3" /><span>+ สร้างสินค้าใหม่</span></>
                    )}
                  </button>
                </div>

                {/* Always visible dropdown showing all previously created and available products */}
                <select
                  value={productId}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setShowInlineAddProduct(true);
                    } else {
                      setProductId(e.target.value);
                    }
                  }}
                  className="w-full bg-pink-50/60 border border-pink-200 text-rose-950 p-2.5 rounded-xl font-bold cursor-pointer text-xs focus:ring-2 focus:ring-pink-300 focus:outline-none"
                >
                  <option value="">-- ไม่เลือกสินค้า (ข้ามขั้นตอนนี้) --</option>
                  {allAvailableProducts.map(prod => (
                    <option key={prod.id} value={prod.id}>
                      📦 {prod.name} (SKU: {prod.sku || 'N/A'}) - ฿{Number(prod.price || 0).toLocaleString()}
                    </option>
                  ))}
                  <option value="__add_new__">➕ + สร้างสินค้าใหม่เข้าสู่ระบบ...</option>
                </select>

                {/* Selected Product Card Preview */}
                {(() => {
                  const selectedProd = allAvailableProducts.find(p => p.id === productId);
                  if (!selectedProd) return null;
                  return (
                    <div className="mt-2 p-2 bg-pink-50/50 border border-pink-200/70 rounded-xl flex items-center gap-2.5">
                      <img
                        src={selectedProd.image_url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=60'}
                        alt={selectedProd.name}
                        className="w-9 h-9 rounded-lg object-cover border border-pink-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-rose-950 truncate">{selectedProd.name}</p>
                        <p className="text-[10px] text-rose-800 font-semibold">SKU: {selectedProd.sku} • ฿{Number(selectedProd.price).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Inline Quick Add Product Sub-Form */}
                {showInlineAddProduct && (
                  <div className="mt-2.5 bg-gradient-to-br from-pink-50/90 to-purple-50/90 border border-pink-300 rounded-2xl p-3.5 space-y-2.5 animate-in fade-in duration-150 shadow-sm">
                    <div className="flex items-center justify-between border-b border-pink-200/80 pb-1.5">
                      <span className="text-[11px] font-black text-rose-900 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-pink-600" />
                        ระบุข้อมูลสินค้าใหม่
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowInlineAddProduct(false)}
                        className="text-gray-400 hover:text-gray-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-[10px] font-bold text-rose-900 mb-0.5">ชื่อสินค้าใหม่ *</label>
                        <input
                          type="text"
                          placeholder="เช่น เมล็ดกาแฟ House Blend หรือ ครีมกันแดดฉ่ำวาว"
                          value={newProdName}
                          onChange={(e) => setNewProdName(e.target.value)}
                          className="w-full bg-white border border-pink-200 text-rose-950 p-2 rounded-lg font-bold text-xs focus:ring-2 focus:ring-pink-300 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-rose-900 mb-0.5">รหัสสินค้า (SKU)</label>
                          <input
                            type="text"
                            placeholder="เช่น SKU-001"
                            value={newProdSku}
                            onChange={(e) => setNewProdSku(e.target.value)}
                            className="w-full bg-white border border-pink-200 text-rose-950 p-2 rounded-lg font-bold text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-rose-900 mb-0.5">ราคา (บาท)</label>
                          <input
                            type="number"
                            placeholder="เช่น 350"
                            value={newProdPrice}
                            onChange={(e) => setNewProdPrice(e.target.value)}
                            className="w-full bg-white border border-pink-200 text-rose-950 p-2 rounded-lg font-bold text-xs focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-rose-900 mb-0.5">URL รูปภาพสินค้า (ไม่บังคับ)</label>
                        <input
                          type="url"
                          placeholder="https://..."
                          value={newProdImage}
                          onChange={(e) => setNewProdImage(e.target.value)}
                          className="w-full bg-white border border-pink-200 text-rose-950 p-2 rounded-lg font-bold text-xs focus:outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleQuickAddProduct}
                        className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>บันทึกสินค้าใหม่และเลือกทันที</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-rose-800 font-extrabold mb-1">วันเริ่มแคมเปญ</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-pink-50/60 border border-pink-200 text-rose-950 p-2 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-rose-800 font-extrabold mb-1">วันสิ้นสุดแคมเปญ</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-pink-50/60 border border-pink-200 text-rose-950 p-2 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-rose-800 font-extrabold mb-1">งบประมาณ (บาท)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-pink-50/60 border border-pink-200 text-rose-950 p-2 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-rose-800 font-extrabold mb-1">เป้ายอดขาย (บาท)</label>
                  <input
                    type="number"
                    value={revenueTarget}
                    onChange={(e) => setRevenueTarget(e.target.value)}
                    className="w-full bg-pink-50/60 border border-pink-200 text-rose-950 p-2 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Actual Revenue field in Edit mode */}
              {editingCampaign && (
                <div>
                  <label className="block text-rose-800 font-extrabold mb-1">ยอดขายที่ทำได้จริง (บาท) - Actual Revenue</label>
                  <input
                    type="number"
                    value={actualRevenue}
                    onChange={(e) => setActualRevenue(e.target.value)}
                    className="w-full bg-emerald-50 border border-emerald-300 text-emerald-950 p-2 rounded-xl font-bold"
                    placeholder="ระบุยอดขายจริงเพื่อคำนวณ ROI"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCampaignModal(false);
                    setEditingCampaign(null);
                  }}
                  className="px-4 py-2 bg-pink-100 text-rose-800 rounded-xl hover:bg-pink-200 font-bold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] hover:opacity-90 text-purple-950 font-bold rounded-xl shadow-xs border border-[#E2D2EA] cursor-pointer"
                >
                  {editingCampaign ? 'บันทึกการแก้ไข' : 'บันทึกแคมเปญ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-pink-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-rose-950 flex items-center gap-2">
                <Tag className="w-5 h-5 text-pink-600" />
                {editingProduct ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่เข้าสู่ระบบ'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddProductModal(false);
                  setEditingProduct(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-rose-800 font-extrabold mb-1">ชื่อสินค้า *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น เมล็ดกาแฟ House Blend หรือ ครีมกันแดดฉ่ำวาว"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-pink-50/60 border border-pink-200 text-rose-950 p-2.5 rounded-xl font-bold focus:outline-pink-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-rose-800 font-extrabold mb-1">รหัสสินค้า (SKU)</label>
                  <input
                    type="text"
                    placeholder="เช่น SKU-001"
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    className="w-full bg-pink-50/60 border border-pink-200 text-rose-950 p-2.5 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-rose-800 font-extrabold mb-1">ราคาต่อชิ้น (บาท)</label>
                  <input
                    type="number"
                    placeholder="เช่น 350"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full bg-pink-50/60 border border-pink-200 text-rose-950 p-2.5 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-rose-800 font-extrabold mb-1">URL รูปภาพสินค้า (ไม่บังคับ)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  className="w-full bg-pink-50/60 border border-pink-200 text-rose-950 p-2.5 rounded-xl font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddProductModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 bg-pink-100 text-rose-800 rounded-xl hover:bg-pink-200 font-bold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl transition cursor-pointer shadow-sm"
                >
                  {editingProduct ? 'บันทึกการแก้ไขสินค้า' : 'บันทึกสินค้า'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
