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
  BarChart
} from 'lucide-react';

export default function ProductPlanModule({
  campaigns,
  products,
  onToggleStageChecklist,
  onAddCampaign
}) {
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);
  
  // New campaign state
  const [name, setName] = useState('');
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [startDate, setStartDate] = useState('2026-08-25');
  const [endDate, setEndDate] = useState('2026-09-05');
  const [budget, setBudget] = useState(50000);
  const [revenueTarget, setRevenueTarget] = useState(800000);

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCamp = {
      id: `camp-${Date.now()}`,
      team_id: 'team-1',
      product_id: productId,
      marketing_plan_id: 'mkt-plan-1',
      name,
      description: 'แคมเปญใหม่ผูกกับสินค้า',
      start_date: startDate,
      end_date: endDate,
      budget: Number(budget),
      revenue_target: Number(revenueTarget),
      actual_revenue: 0,
      image_ready: false,
      scheduled: false,
      posted: false,
      stage_status: 't_minus_5',
      status: 'planning'
    };

    onAddCampaign(newCamp);
    setName('');
    setShowAddCampaignModal(false);
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
              <h2 className="text-xl font-black text-rose-950">Module 3: Product Plan & Campaign Readiness</h2>
              <p className="text-xs text-rose-800 font-bold">ผูกแคมเปญกับสินค้า ตรวจสอบสถานะการเตรียมงาน (FR-3.2) และดูยอดขาย ROI (FR-3.4)</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddCampaignModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] hover:opacity-90 text-purple-950 font-bold rounded-xl text-xs transition shadow-xs border border-[#E2D2EA] flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>สร้างแคมเปญใหม่</span>
        </button>
      </div>

      {/* Campaign List Grid */}
      <div className="space-y-4">
        {campaigns.map((camp) => {
          const product = products.find(p => p.id === camp.product_id) || products[0] || { name: 'Product', sku: 'N/A', price: 0, image_url: '' };
          const roi = camp.budget > 0 ? (((camp.actual_revenue - camp.budget) / camp.budget) * 100).toFixed(0) : 0;

          return (
            <div 
              key={camp.id}
              className="glass-panel p-6 hover:border-pink-300 transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* Left: Product & Campaign Meta Info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                  <div className="flex items-start gap-4">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-pink-200 shadow-sm flex-shrink-0" 
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] uppercase font-bold text-rose-800 bg-pink-100 px-2.5 py-0.5 rounded-full border border-pink-200">
                          {product.sku}
                        </span>
                        {getStageBadge(camp.stage_status)}
                      </div>
                      <h3 className="font-extrabold text-rose-950 text-base">{camp.name}</h3>
                      <p className="text-xs text-rose-900 mt-1 font-bold">
                        สินค้า: <span className="text-rose-950 font-black">{product.name}</span> (ราคา ฿{product.price})
                      </p>
                      <p className="text-xs text-rose-800 mt-0.5 font-bold">
                        ระยะเวลา: {camp.start_date} ถึง {camp.end_date}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stage Checklist Controls (FR-3.2) */}
                <div className="p-4 rounded-2xl bg-white border border-pink-200 space-y-2 lg:w-80 shadow-sm">
                  <div className="text-xs font-black text-rose-950 border-b border-pink-100 pb-1.5 flex items-center justify-between">
                    <span>ติดตามสถานะเตรียมงาน (FR-3.2)</span>
                    <span className="text-[10px] text-rose-700 font-bold">คลิกทำเครื่องหมาย</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {/* Item 1: Image Ready */}
                    <button
                      onClick={() => onToggleStageChecklist(camp.id, 'image_ready')}
                      className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition cursor-pointer font-bold ${
                        camp.image_ready ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' : 'bg-pink-50/70 text-rose-900 hover:bg-pink-100'
                      }`}
                    >
                      <span className="flex items-center gap-2 font-bold">
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                        <span>1. ภาพและอาร์ตเวิร์กพร้อม (Image Ready)</span>
                      </span>
                      {camp.image_ready ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-pink-400" />}
                    </button>

                    {/* Item 2: Scheduled */}
                    <button
                      onClick={() => onToggleStageChecklist(camp.id, 'scheduled')}
                      className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition cursor-pointer font-bold ${
                        camp.scheduled ? 'bg-sky-100 text-sky-950 border border-sky-300' : 'bg-pink-50/70 text-rose-900 hover:bg-pink-100'
                      }`}
                    >
                      <span className="flex items-center gap-2 font-bold">
                        <Clock className="w-4 h-4 text-sky-600" />
                        <span>2. ตั้งเวลาโพสต์ในระบบแล้ว (Scheduled)</span>
                      </span>
                      {camp.scheduled ? <CheckSquare className="w-4 h-4 text-sky-600" /> : <Square className="w-4 h-4 text-pink-400" />}
                    </button>

                    {/* Item 3: Posted */}
                    <button
                      onClick={() => onToggleStageChecklist(camp.id, 'posted')}
                      className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition cursor-pointer font-bold ${
                        camp.posted ? 'bg-purple-100 text-purple-950 border border-purple-300' : 'bg-pink-50/70 text-rose-900 hover:bg-pink-100'
                      }`}
                    >
                      <span className="flex items-center gap-2 font-bold">
                        <Send className="w-4 h-4 text-purple-600" />
                        <span>3. โพสต์จริงเรียบร้อยแล้ว (Posted)</span>
                      </span>
                      {camp.posted ? <CheckSquare className="w-4 h-4 text-purple-600" /> : <Square className="w-4 h-4 text-pink-400" />}
                    </button>

                  </div>
                </div>

                {/* ROI & Performance Stats (FR-3.4) */}
                <div className="p-4 rounded-2xl bg-white border border-pink-200 flex flex-col justify-center space-y-2 min-w-[180px] shadow-sm">
                  <div className="text-xs font-black text-rose-900 flex items-center justify-between">
                    <span>สรุปผล ROI / ยอดขาย (FR-3.4)</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>

                  <div>
                    <div className="text-xl font-black text-rose-950">฿{Number(camp.actual_revenue).toLocaleString()}</div>
                    <div className="text-[11px] text-rose-800 font-bold mt-0.5">
                      เป้าหมาย: ฿{Number(camp.revenue_target).toLocaleString()}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-pink-100 flex items-center justify-between text-xs font-bold">
                    <span className="text-rose-800">งบแคมเปญ:</span>
                    <span className="font-black text-rose-950">฿{Number(camp.budget).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-rose-800 font-bold">ผลตอบแทน:</span>
                    <span className="font-black text-emerald-600">+{roi}% ROI</span>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD CAMPAIGN */}
      {showAddCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-pink-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-rose-950">สร้างแคมเปญสินค้าใหม่</h3>
            
            <form onSubmit={handleCreateCampaign} className="space-y-3 text-xs">
              <div>
                <label className="block text-rose-800 font-extrabold mb-1">ชื่อแคมเปญ</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น แคมเปญเปิดตัว ครีมกันแดดฉ่ำวาว"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-pink-50/60 border border-pink-200 text-rose-950 p-2.5 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-rose-800 font-extrabold mb-1">เลือกสินค้าที่เกี่ยวข้อง</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full bg-pink-50/60 border border-pink-200 text-rose-950 p-2.5 rounded-xl font-bold cursor-pointer"
                >
                  {products.map(prod => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} (SKU: {prod.sku}) - ฿{prod.price}
                    </option>
                  ))}
                </select>
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

              <div className="flex justify-end gap-2 pt-3 border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => setShowAddCampaignModal(false)}
                  className="px-4 py-2 bg-pink-100 text-rose-800 rounded-xl hover:bg-pink-200 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] hover:opacity-90 text-purple-950 font-bold rounded-xl shadow-xs border border-[#E2D2EA] cursor-pointer"
                >
                  บันทึกแคมเปญ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
