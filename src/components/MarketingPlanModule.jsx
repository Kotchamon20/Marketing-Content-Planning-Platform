import React, { useState } from 'react';
import { 
  Compass, 
  Target, 
  PieChart, 
  ThumbsUp, 
  Plus, 
  Layers, 
  Users, 
  ShieldAlert, 
  AlertCircle,
  Zap, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Video,
  Facebook,
  Camera,
  MessageSquare
} from 'lucide-react';

import BranchBudgetAllocation from './BranchBudgetAllocation';

export default function MarketingPlanModule({
  marketingPlans,
  campaignIdeas,
  campaigns,
  onUpdateStrategyCanvas,
  onUpvoteIdea,
  onAddCampaignIdea
}) {
  const [activeSubTab, setActiveSubTab] = useState('budget'); // 'budget' | 'canvas' | 'brainstorm'
  const currentPlan = marketingPlans[0] || {};

  // Editable Strategy Canvas State
  const [stpSeg, setStpSeg] = useState(currentPlan.stp_segmentation || '');
  const [stpTar, setStpTar] = useState(currentPlan.stp_targeting || '');
  const [stpPos, setStpPos] = useState(currentPlan.stp_positioning || '');

  // New Idea State
  const [showAddIdeaModal, setShowAddIdeaModal] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaDesc, setNewIdeaDesc] = useState('');
  const [newIdeaCategory, setNewIdeaCategory] = useState('Viral Campaign');

  // Budget slider allocations (FR-2.3)
  const [budgetTikTok, setBudgetTikTok] = useState(currentPlan.budget_channels?.tiktok || 70000);
  const [budgetFB, setBudgetFB] = useState(currentPlan.budget_channels?.facebook || 35000);
  const [budgetIG, setBudgetIG] = useState(currentPlan.budget_channels?.instagram || 30000);
  const [budgetLINE, setBudgetLINE] = useState(currentPlan.budget_channels?.line_oa || 15000);

  const totalCalculatedBudget = budgetTikTok + budgetFB + budgetIG + budgetLINE;

  const handleSaveStrategy = () => {
    onUpdateStrategyCanvas(currentPlan.id, {
      stp_segmentation: stpSeg,
      stp_targeting: stpTar,
      stp_positioning: stpPos
    });
    alert('บันทึกข้อมูล Strategy Canvas สำเร็จ!');
  };

  const handleCreateIdea = (e) => {
    e.preventDefault();
    if (!newIdeaTitle.trim()) return;

    const newIdea = {
      id: `idea-${Date.now()}`,
      marketing_plan_id: currentPlan.id,
      team_id: 'team-1',
      title: newIdeaTitle,
      description: newIdeaDesc,
      suggested_by: 'user-1',
      category: newIdeaCategory,
      upvotes: 1,
      is_approved: false
    };

    onAddCampaignIdea(newIdea);
    setNewIdeaTitle('');
    setNewIdeaDesc('');
    setShowAddIdeaModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Module Header & Sub-tab navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-pink-100 text-pink-600 border border-pink-200 shadow-sm">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-rose-950">Module 2: Marketing Plan & Brainstorming</h2>
              <p className="text-xs text-rose-800 font-bold">กรอกแผนการตลาด STP/SWOT/Customer Journey, ระดมไอเดียโหวตแคมเปญ และจัดสรรงบช่องทาง</p>
            </div>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-1.5 bg-pink-50 p-1.5 rounded-2xl border border-pink-200 flex-wrap shadow-inner">
          <button
            onClick={() => setActiveSubTab('canvas')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'canvas' ? 'bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] text-purple-950 border border-[#E2D2EA] shadow-xs scale-[1.02]' : 'text-purple-900/80 hover:text-purple-950 hover:bg-pink-100/50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Strategy Canvas (FR-2.1)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('brainstorm')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'brainstorm' ? 'bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] text-purple-950 border border-[#E2D2EA] shadow-xs scale-[1.02]' : 'text-purple-900/80 hover:text-purple-950 hover:bg-pink-100/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>กระดานไอเดีย (FR-2.2)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('budget')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'budget' ? 'bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] text-purple-950 border border-[#E2D2EA] shadow-xs scale-[1.02]' : 'text-purple-900/80 hover:text-purple-950 hover:bg-pink-100/50'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>จัดสรรงบประมาณ (FR-2.3)</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: STRATEGY CANVAS (STP / SWOT / JOURNEY) (FR-2.1) */}
      {activeSubTab === 'canvas' && (
        <div className="space-y-6">
          
          {/* Plan Meta Banner */}
          <div className="glass-panel p-6 border-pink-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-pink-100 text-rose-800 border border-pink-200">
                  Active Strategy Plan
                </span>
                <h3 className="text-xl font-black text-rose-950 mt-2">{currentPlan.title}</h3>
                <p className="text-xs text-rose-800 mt-1 max-w-3xl font-bold">{currentPlan.objective}</p>
              </div>

              <button
                onClick={handleSaveStrategy}
                className="px-5 py-2.5 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] hover:opacity-90 text-purple-950 font-bold rounded-xl text-xs transition shadow-xs border border-[#E2D2EA] flex items-center gap-2 self-start md:self-auto cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>บันทึก Strategy Canvas</span>
              </button>
            </div>
          </div>

          {/* STP Strategy Section Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Segmentation */}
            <div className="glass-panel p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-950 font-extrabold text-sm">
                <Users className="w-4 h-4 text-pink-600" />
                <span>1. Segmentation (การแบ่งกลุ่มตลาด)</span>
              </div>
              <textarea
                rows={4}
                value={stpSeg}
                onChange={(e) => setStpSeg(e.target.value)}
                className="w-full bg-pink-50/60 border border-pink-200 text-rose-950 text-xs p-3 rounded-xl focus:outline-none focus:border-pink-500 leading-relaxed font-bold shadow-sm"
                placeholder="ระบุกลุ่มผู้บริโภค ช่วงอายุ พฤติกรรม..."
              />
            </div>

            {/* Targeting */}
            <div className="glass-panel p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-950 font-extrabold text-sm">
                <Target className="w-4 h-4 text-pink-600" />
                <span>2. Targeting (กลุ่มเป้าหมายหลัก)</span>
              </div>
              <textarea
                rows={4}
                value={stpTar}
                onChange={(e) => setStpTar(e.target.value)}
                className="w-full bg-pink-50/60 border border-pink-200 text-rose-950 text-xs p-3 rounded-xl focus:outline-none focus:border-pink-500 leading-relaxed font-bold shadow-sm"
                placeholder="ระบุ Target Group หลัก ช่องทางมีส่วนร่วม..."
              />
            </div>

            {/* Positioning */}
            <div className="glass-panel p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-950 font-extrabold text-sm">
                <Award className="w-4 h-4 text-pink-600" />
                <span>3. Positioning (จุดยืนของแบรนด์)</span>
              </div>
              <textarea
                rows={4}
                value={stpPos}
                onChange={(e) => setStpPos(e.target.value)}
                className="w-full bg-pink-50/60 border border-pink-200 text-rose-950 text-xs p-3 rounded-xl focus:outline-none focus:border-pink-500 leading-relaxed font-bold shadow-sm"
                placeholder="ระบุตำแหน่งสินค้า เปรียบเทียบคู่แข่ง..."
              />
            </div>

          </div>

          {/* SWOT Analysis Grid */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-black text-rose-950 text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-pink-600" />
              <span>SWOT Analysis (จุดแข็ง จุดอ่อน โอกาส อุปสรรค)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="font-black text-emerald-900 flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Strengths (จุดแข็ง)
                </div>
                <p className="text-emerald-900 leading-relaxed font-bold">{currentPlan.swot?.strengths}</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="font-black text-amber-900 flex items-center gap-1.5 text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-600" /> Weaknesses (จุดอ่อน)
                </div>
                <p className="text-amber-900 leading-relaxed font-bold">{currentPlan.swot?.weaknesses}</p>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-2">
                <div className="font-black text-sky-900 flex items-center gap-1.5 text-sm">
                  <TrendingUp className="w-4 h-4 text-sky-600" /> Opportunities (โอกาส)
                </div>
                <p className="text-sky-900 leading-relaxed font-bold">{currentPlan.swot?.opportunities}</p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                <div className="font-black text-rose-900 flex items-center gap-1.5 text-sm">
                  <ShieldAlert className="w-4 h-4 text-rose-600" /> Threats (อุปสรรค)
                </div>
                <p className="text-rose-900 leading-relaxed font-bold">{currentPlan.swot?.threats}</p>
              </div>
            </div>
          </div>

          {/* Customer Journey Stage */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-black text-rose-950 text-base flex items-center gap-2">
              <Compass className="w-5 h-5 text-pink-600" />
              <span>Customer Journey (5 Stage Funnel)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              {['Awareness', 'Consideration', 'Purchase', 'Retention', 'Advocacy'].map((stage, idx) => (
                <div key={stage} className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-200 space-y-1">
                  <div className="font-black text-pink-600 text-[10px] uppercase">Stage {idx + 1}</div>
                  <div className="font-extrabold text-rose-950 text-sm">{stage}</div>
                  <p className="text-rose-800 text-[11px] font-bold leading-tight">
                    {idx === 0 && 'สร้างการรับรู้ผ่าน TikTok Short VDO'}
                    {idx === 1 && 'รีวิวผลลัพธ์จาก KOL / Creator'}
                    {idx === 2 && 'ข้อเสนอพิเศษ 9.9 แถมกระเป๋า'}
                    {idx === 3 && 'LINE OA แบบประเมิน & Re-order'}
                    {idx === 4 && 'กิจกรรม UGC แจกรางวัล'}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: BRAINSTORMING BOARD (FR-2.2) */}
      {activeSubTab === 'brainstorm' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-rose-950 text-base flex items-center gap-2">
                <Zap className="w-5 h-5 text-pink-600" />
                <span>กระดานระดมไอเดีย & Upvote แคมเปญ (FR-2.2)</span>
              </h3>
              <p className="text-xs text-rose-800 mt-1 font-bold">
                เสนอไอเดียแคมเปญใหม่ กดโหวตร่วมกันในทีม ไอเดียที่ผ่านจะได้รับการอนุมัติผลิตจริง
              </p>
            </div>

            <button
              onClick={() => setShowAddIdeaModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] hover:opacity-90 text-purple-950 font-bold rounded-xl text-xs transition flex items-center gap-2 cursor-pointer shadow-xs border border-[#E2D2EA]"
            >
              <Plus className="w-4 h-4" />
              <span>เสนอไอเดียใหม่</span>
            </button>
          </div>

          {/* Ideas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaignIdeas.map(idea => (
              <div key={idea.id} className="glass-panel p-5 flex flex-col justify-between space-y-4 shadow-sm border-pink-200">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-pink-100 text-rose-800 border border-pink-200">
                      {idea.category}
                    </span>

                    {idea.is_approved && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        อนุมัติแล้ว
                      </span>
                    )}
                  </div>

                  <h4 className="font-black text-rose-950 text-sm leading-snug">{idea.title}</h4>
                  <p className="text-xs text-rose-800 mt-2 font-bold leading-relaxed">{idea.description}</p>
                </div>

                <div className="pt-3 border-t border-pink-100 flex items-center justify-between">
                  <div className="text-[10px] text-rose-700 font-bold">
                    เสนอโดย: <span className="font-extrabold text-rose-950">{idea.suggested_by}</span>
                  </div>

                  <button
                    onClick={() => onUpvoteIdea(idea.id)}
                    className="px-3 py-1.5 bg-pink-100 hover:bg-pink-200 text-rose-900 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm border border-pink-300 active:scale-95"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-pink-600" />
                    <span>{idea.upvotes} โหวต</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: BRANCH BUDGET ALLOCATION (MKT 2%) (FR-2.3) */}
      {activeSubTab === 'budget' && (
        <BranchBudgetAllocation />
      )}

      {/* MODAL: CREATE IDEA */}
      {showAddIdeaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-pink-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-rose-950">เสนอไอเดียแคมเปญใหม่</h3>
            
            <form onSubmit={handleCreateIdea} className="space-y-3 text-xs">
              <div>
                <label className="block text-rose-800 font-extrabold mb-1">ชื่อไอเดีย / Concept</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น แคมเปญแจกเซรั่มฟรี 1,000 ชิ้น"
                  value={newIdeaTitle}
                  onChange={(e) => setNewIdeaTitle(e.target.value)}
                  className="w-full bg-pink-50/60 border border-pink-200 text-rose-950 p-2.5 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-rose-800 font-extrabold mb-1">รายละเอียดไอเดีย</label>
                <textarea
                  rows={3}
                  placeholder="อธิบายกิมมิกหรือแนวคิดแคมเปญ..."
                  value={newIdeaDesc}
                  onChange={(e) => setNewIdeaDesc(e.target.value)}
                  className="w-full bg-pink-50/60 border border-pink-200 text-rose-950 p-2.5 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-rose-800 font-extrabold mb-1">หมวดหมู่</label>
                <select
                  value={newIdeaCategory}
                  onChange={(e) => setNewIdeaCategory(e.target.value)}
                  className="w-full bg-pink-50/60 border border-pink-200 text-rose-950 p-2.5 rounded-xl font-bold"
                >
                  <option value="Viral Campaign">Viral Campaign</option>
                  <option value="KOL Review">KOL Review</option>
                  <option value="Flash Sale 9.9">Flash Sale 9.9</option>
                  <option value="UGC Contest">UGC Contest</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => setShowAddIdeaModal(false)}
                  className="px-4 py-2 bg-pink-100 text-rose-800 rounded-xl hover:bg-pink-200 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] hover:opacity-90 text-purple-950 font-bold rounded-xl shadow-xs border border-[#E2D2EA] cursor-pointer"
                >
                  บันทึกไอเดีย
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
