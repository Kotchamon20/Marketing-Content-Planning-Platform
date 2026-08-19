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
  Sparkles
} from 'lucide-react';

export default function DashboardOverview({
  campaigns,
  contentItems,
  marketingPlans,
  notificationLogs,
  onNavigateTab,
  onTriggerNotification
}) {
  const [showLineModal, setShowLineModal] = useState(false);

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const overdueCampaigns = campaigns.filter(c => c.stage_status === 'overdue');
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
            <span>Real-Time Campaign & LINE Alert Command Center</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-purple-950">
            ภาพรวมการวางแผนการตลาด & คอนเทนต์
          </h1>
          
          <p className="text-xs sm:text-sm text-purple-900/80 font-medium leading-relaxed max-w-2xl">
            ติดตามแคมเปญ เช็กกำหนดโพสต์ ตรวจสอบการทับซ้อนของไทม์ไลน์ และจัดการแจ้งเตือนอัตโนมัติผ่าน LINE OA สำหรับทุกฝ่าย
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
              onClick={() => setShowLineModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] hover:opacity-90 text-purple-950 font-bold rounded-xl text-xs border border-[#E2D2EA] transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4 text-purple-700" />
              <span>ทดสอบส่ง LINE Alert</span>
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
            <span className="text-xs font-black text-rose-900 uppercase tracking-wider">แคมเปญที่ดำเนินงาน</span>
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center border border-pink-200 group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-rose-950 tracking-tight">{activeCampaigns.length} <span className="text-xs font-bold text-rose-800">แคมเปญ</span></div>
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
            <span className="text-xs font-black text-rose-900 uppercase tracking-wider">สถานะคอนเทนต์</span>
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center border border-pink-200 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-rose-950 tracking-tight">{contentItems.length} <span className="text-xs font-bold text-rose-800">รายการ</span></div>
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
            <span className="text-xs font-black text-rose-900 uppercase tracking-wider">ยอดขายรวม / ROI</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-950 tracking-tight">฿{totalRevenue.toLocaleString()}</div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-emerald-800 font-extrabold bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">+{roiPercentage}% ROI</span>
              <span className="text-rose-800 text-[10px] font-bold">จากงบ ฿{totalBudget.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Section: Overlap Timeline (FR-2.4) & Stage Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timeline Overview & Overlap Tracker */}
        <div className="lg:col-span-2 glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-rose-950 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-pink-600" />
                <span>Timeline ภาพรวมแคมเปญ & ตรวจสอบช่วงเวลาซ้อนทับ (FR-2.4)</span>
              </h3>
              <p className="text-xs text-rose-800 mt-0.5 font-bold">
                ตรวจสอบว่าแคมเปญไหนเปิดตัวชนกัน เพื่อจัดสรรงบและกำลังคนไม่ให้กระจุกตัว
              </p>
            </div>
            <button 
              onClick={() => onNavigateTab('marketing-plan')}
              className="text-xs text-pink-600 hover:text-pink-700 font-extrabold flex items-center gap-1 cursor-pointer"
            >
              <span>ดูรายละเอียดแผน</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4 pt-2">
            {campaigns.map((camp) => (
              <div 
                key={camp.id}
                className="p-4 rounded-2xl bg-white border border-pink-200 hover:border-pink-300 transition shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-rose-950 text-sm">{camp.name}</span>
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
                    <p className="text-xs text-rose-800 mt-1 font-bold">
                      ช่วงเวลา: {camp.start_date} ถึง {camp.end_date} • งบประมาณ: ฿{Number(camp.budget).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold flex items-center gap-1 ${camp.image_ready ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-pink-50 text-rose-700 border border-pink-200'}`}>
                      {camp.image_ready ? 'ภาพพร้อม' : 'ยังไม่มีภาพ'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold flex items-center gap-1 ${camp.scheduled ? 'bg-sky-100 text-sky-900 border border-sky-300' : 'bg-pink-50 text-rose-700 border border-pink-200'}`}>
                      {camp.scheduled ? 'ตั้งเวลาแล้ว' : 'ยังไม่ตั้งเวลา'}
                    </span>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="w-full bg-pink-100 h-2.5 rounded-full overflow-hidden relative">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      camp.stage_status === 'overdue' 
                        ? 'bg-rose-500' 
                        : camp.stage_status === 't_minus_2'
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-pink-500 to-rose-500'
                    }`}
                    style={{ width: camp.posted ? '100%' : camp.scheduled ? '70%' : camp.image_ready ? '40%' : '15%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Recent Notification Feed & Trigger */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-rose-950 text-base flex items-center gap-2">
                <Zap className="w-5 h-5 text-pink-600" />
                <span>การแจ้งเตือน LINE ล่าสุด</span>
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold border border-emerald-300">
                Live Engine
              </span>
            </div>

            <div className="space-y-3">
              {notificationLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="p-3.5 rounded-2xl bg-white border border-pink-200 text-xs space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-rose-950 font-black">
                    <span>{log.recipient_name}</span>
                    <span className="text-[10px] text-rose-700 font-bold">{log.sent_at.split(' ')[1]}</span>
                  </div>
                  <p className="text-rose-900 font-bold leading-snug line-clamp-2">{log.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-pink-100 mt-4">
            <button
              onClick={() => onTriggerNotification('camp-2')}
              className="w-full py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>ทดสอบยิง Escalation Alert ด่วน</span>
            </button>
          </div>
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
