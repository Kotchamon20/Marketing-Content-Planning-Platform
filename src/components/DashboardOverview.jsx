import React, { useState } from 'react';
import LineFlexModal from './LineFlexModal';
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  MessageSquare, 
  Plus, 
  Send, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Layers,
  Sparkles,
  Megaphone,
  CheckSquare,
  Package,
  Flag,
  ListTodo,
  BellRing,
  CalendarDays,
  User,
  Check
} from 'lucide-react';

export default function DashboardOverview({
  campaigns = [],
  contentItems = [],
  marketingPlans = [],
  notificationLogs = [],
  onNavigateTab,
  onTriggerNotification
}) {
  const [showLineModal, setShowLineModal] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Today's Tasks & Content Posts
  const todayContent = contentItems.filter(c => c.publish_date === todayStr || c.status === 'scheduled');
  
  // 2. Product Plan Arrived / Active Campaigns
  const activeCampaigns = campaigns.filter(c => c.status === 'active' || c.stage_status === 't_minus_2' || c.stage_status === 'overdue');
  const overdueCampaigns = campaigns.filter(c => c.stage_status === 'overdue');

  // 3. Upcoming To-Do & Action Items (Default high priority / pending items)
  const publishedContent = contentItems.filter(c => c.status === 'published');
  const scheduledContent = contentItems.filter(c => c.status === 'scheduled');
  const draftContent = contentItems.filter(c => c.status === 'draft');

  const totalRevenue = marketingPlans.reduce((sum, p) => sum + (p.actual_revenue || 0), 0);
  const totalBudget = campaigns.reduce((sum, c) => sum + Number(c.budget || 0), 0);
  const roiPercentage = totalBudget > 0 ? ((totalRevenue / totalBudget) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner Hero (Palette #61 Whisper-Soft Pastel Theme) */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#F5EEF8] via-[#FFF0F6] to-[#EEF6FF] text-purple-950 p-8 border border-[#E2D2EA] shadow-xs">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-[#E2D2EA] text-xs font-bold text-purple-950">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>ศูนย์รวมการบริหารและติดตามภาพรวมแผนการตลาด (Command Center)</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-purple-950">
            ภาพรวมงานสำคัญประจำวัน & แผนการตลาด
          </h1>
          
          <p className="text-xs sm:text-sm text-purple-900/80 font-medium leading-relaxed max-w-2xl">
            เช็กงานที่ต้องทำวันนี้ แคมเปญ Product Plan ที่มาถึง และรายการงาน To-Do ที่กำลังจะมาถึงในจุดเดียว
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('content-plan')}
              className="px-4 py-2.5 bg-white text-purple-950 hover:bg-purple-50 font-bold rounded-xl text-xs transition shadow-xs border border-[#E2D2EA] flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-purple-700" />
              <span>สร้างคอนเทนต์ใหม่</span>
            </button>

            <button
              onClick={() => onNavigateTab('todo-list')}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-2 cursor-pointer hover:opacity-95"
            >
              <CheckSquare className="w-4 h-4 text-pink-300" />
              <span>ดู To-Do List & ติดตามงาน</span>
            </button>
          </div>
        </div>

        {/* Decorative Circle Elements */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -top-12 w-48 h-48 bg-pink-400/20 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Card 1 */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-pink-300 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-purple-900 uppercase tracking-wider">แคมเปญที่กำลังรัน</span>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200 group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-purple-950 tracking-tight">{activeCampaigns.length} <span className="text-xs font-bold text-purple-800">แคมเปญ</span></div>
            <div className="mt-2.5 flex items-center gap-2 text-xs">
              {overdueCampaigns.length > 0 ? (
                <span className="text-rose-800 flex items-center gap-1 font-extrabold bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  {overdueCampaigns.length} เลยกำหนด (Overdue)
                </span>
              ) : (
                <span className="text-emerald-800 flex items-center gap-1 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 font-extrabold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ดำเนินงานตามแผน
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-pink-300 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-purple-900 uppercase tracking-wider">สถานะคอนเทนต์</span>
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-purple-700 flex items-center justify-center border border-pink-200 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-purple-950 tracking-tight">{contentItems.length} <span className="text-xs font-bold text-purple-800">รายการ</span></div>
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold border border-emerald-300">โพสต์แล้ว {publishedContent.length}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-900 font-extrabold border border-sky-300">ตั้งเวลา {scheduledContent.length}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold border border-amber-300">Draft {draftContent.length}</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-pink-300 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-purple-900 uppercase tracking-wider">เป้าหมายยอดขาย / ROI</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-purple-950 tracking-tight">฿{totalRevenue.toLocaleString()}</div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-emerald-800 font-extrabold bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">+{roiPercentage}% ROI</span>
              <span className="text-purple-800 text-[10px] font-bold">จากงบ ฿{totalBudget.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>

      {/* THREE KEY HIGH-PRIORITY ACTION PANELS (ตามคำขอผู้ใช้) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* PANEL 1: งานที่ต้องทำวันนี้ (Tasks Due Today) */}
        <div className="glass-panel p-6 border-[#E2D2EA] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-purple-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFEBF3] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-purple-950 text-sm">1. งานที่ต้องทำวันนี้ (Due Today)</h3>
                  <span className="text-[10px] text-purple-700 font-medium">{todayStr}</span>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFEBF3] text-purple-950 border border-[#E2D2EA]">
                {todayContent.length} รายการ
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {todayContent.length === 0 ? (
                <div className="p-6 bg-purple-50/50 rounded-2xl border border-purple-100 text-center space-y-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                  <p className="text-xs text-purple-950 font-bold">วันนี้ไม่มีรายการโพสต์ หรือ งานค้างด่วน</p>
                  <p className="text-[11px] text-purple-800">สามารถคลิกปุ่มด้านล่างเพื่อเพิ่มคอนเทนต์ใหม่</p>
                </div>
              ) : (
                todayContent.slice(0, 4).map(item => (
                  <div key={item.id} className="p-3 bg-white rounded-xl border border-[#E2D2EA] space-y-1 hover:shadow-xs transition">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-950 text-xs truncate max-w-[180px]">{item.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFEBF3] text-purple-950 border border-[#E2D2EA]">{item.platform}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-purple-800">
                      <span>ผู้รับผิดชอบ: {item.assigned_to}</span>
                      <span className="font-mono font-bold text-purple-950">{item.publish_date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('content-plan')}
            className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-950 font-bold rounded-xl text-xs border border-[#E2D2EA] transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>ไปที่ Module 1: Content Plan</span>
            <ArrowRight className="w-3.5 h-3.5 text-purple-700" />
          </button>
        </div>

        {/* PANEL 2: Product Plan ที่มาถึง (Arrived Product Campaigns & Readiness) */}
        <div className="glass-panel p-6 border-[#E2D2EA] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-purple-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E6F2FF] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-purple-950 text-sm">2. Product Plan ที่มาถึง</h3>
                  <span className="text-[10px] text-purple-700 font-medium">ความพร้อมแคมเปญสินค้า</span>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F2FF] text-purple-950 border border-[#E2D2EA]">
                {campaigns.length} แคมเปญ
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {campaigns.length === 0 ? (
                <div className="p-6 bg-purple-50/50 rounded-2xl border border-purple-100 text-center space-y-2">
                  <Package className="w-6 h-6 text-purple-400 mx-auto" />
                  <p className="text-xs text-purple-950 font-bold">ยังไม่มีแผน Product Plan ในระบบ</p>
                  <p className="text-[11px] text-purple-800">สร้างแผนแคมเปญสินค้าเตรียมความพร้อมได้ที่ Module 2</p>
                </div>
              ) : (
                campaigns.slice(0, 3).map(camp => (
                  <div key={camp.id} className="p-3 bg-white rounded-xl border border-[#E2D2EA] space-y-1.5 hover:shadow-xs transition">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-950 text-xs">{camp.name}</span>
                      {camp.stage_status === 't_minus_2' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">T-2 Alert</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">Active</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-purple-800 font-medium">
                      <span>ช่วงเวลา: {camp.start_date} - {camp.end_date}</span>
                      <span className="font-mono font-bold text-purple-950">฿{Number(camp.budget).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('product-plan')}
            className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-950 font-bold rounded-xl text-xs border border-[#E2D2EA] transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>ไปที่ Module 2: Product Plan & Readiness</span>
            <ArrowRight className="w-3.5 h-3.5 text-purple-700" />
          </button>
        </div>

        {/* PANEL 3: To-Do ที่กำลังจะมาถึง (Upcoming To-Do Action Items) */}
        <div className="glass-panel p-6 border-[#E2D2EA] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-purple-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FEF9C3] text-amber-800 flex items-center justify-center border border-[#E2D2EA]">
                  <ListTodo className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-purple-950 text-sm">3. To-Do ที่กำลังจะมาถึง</h3>
                  <span className="text-[10px] text-purple-700 font-medium">รายการงานการบ้าน & ติดตามไฟล์</span>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF9C3] text-amber-900 border border-[#E2D2EA]">
                To-Do Module
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-[#E2D2EA] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-950 text-xs flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5 text-purple-700" />
                    <span>รายการงาน To-Do List</span>
                  </span>
                  <span className="text-[10px] font-bold text-purple-800">สลับโหมด Card/List</span>
                </div>
                <p className="text-[11px] text-purple-800 font-medium">
                  จัดการรายการงานการบ้าน มอบหมายผู้รับผิดชอบ และตั้งวันสิ้นสุด
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E2D2EA] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-950 text-xs flex items-center gap-1">
                    <BellRing className="w-3.5 h-3.5 text-amber-600" />
                    <span>บันทึกงานติดตาม (Follow-Up)</span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-900">ทวงงานเข้า LINE</span>
                </div>
                <p className="text-[11px] text-purple-800 font-medium">
                  บันทึกงานค้างที่ต้องตามกับทีมงาน หรือซัพพลายเออร์
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('todo-list')}
            className="w-full py-2.5 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs shadow-md hover:opacity-95 transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>ไปที่ Module 5: To-Do List & ติดตามไฟล์งาน</span>
            <ArrowRight className="w-3.5 h-3.5 text-pink-300" />
          </button>
        </div>

      </div>

      {/* Timeline Overview & Overlap Tracker Section */}
      <div className="glass-panel p-6 border-[#E2D2EA]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-purple-950 text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-700" />
              <span>Timeline ภาพรวมแคมเปญ & การตรวจเช็กช่วงเวลาซ้อนทับ</span>
            </h3>
            <p className="text-xs text-purple-800 mt-0.5 font-bold">
              ตรวจสอบว่าแคมเปญไหนเปิดตัวชนกัน เพื่อจัดสรรงบและกำลังคนไม่ให้กระจุกตัว
            </p>
          </div>
          <button 
            onClick={() => onNavigateTab('product-plan')}
            className="text-xs text-purple-700 hover:text-purple-950 font-extrabold flex items-center gap-1 cursor-pointer"
          >
            <span>ดูรายละเอียดแผน</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4 pt-2">
          {campaigns.length === 0 ? (
            <div className="p-8 bg-purple-50/50 rounded-2xl border border-purple-100 text-center text-xs text-purple-400 font-medium">
              ยังไม่มีข้อมูลแคมเปญในระบบ สามารถสร้างแคมเปญใหม่ได้ที่โมดูล Product Plan & Readiness
            </div>
          ) : (
            campaigns.map((camp) => (
              <div 
                key={camp.id}
                className="p-4 rounded-2xl bg-white border border-[#E2D2EA] hover:shadow-xs transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-purple-950 text-sm">{camp.name}</span>
                      {camp.stage_status === 'overdue' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" /> Overdue
                        </span>
                      )}
                      {camp.stage_status === 't_minus_2' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" /> T-2 Alert
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-purple-800 mt-1 font-bold">
                      ช่วงเวลา: {camp.start_date} ถึง {camp.end_date} • งบประมาณ: ฿{Number(camp.budget).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold flex items-center gap-1 ${camp.image_ready ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
                      {camp.image_ready ? 'ภาพพร้อม' : 'ยังไม่มีภาพ'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold flex items-center gap-1 ${camp.scheduled ? 'bg-sky-100 text-sky-900 border border-sky-300' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
                      {camp.scheduled ? 'ตั้งเวลาแล้ว' : 'ยังไม่ตั้งเวลา'}
                    </span>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="w-full bg-purple-100 h-2.5 rounded-full overflow-hidden relative">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      camp.stage_status === 'overdue' 
                        ? 'bg-rose-500' 
                        : camp.stage_status === 't_minus_2'
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-purple-950 to-pink-600'
                    }`}
                    style={{ width: camp.posted ? '100%' : camp.scheduled ? '70%' : camp.image_ready ? '40%' : '15%' }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Live LINE Flex Card Notification Modal */}
      <LineFlexModal 
        isOpen={showLineModal} 
        onClose={() => setShowLineModal(false)} 
        defaultCampaign={campaigns[0]}
      />

    </div>
  );
}
