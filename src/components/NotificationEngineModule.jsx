import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Settings,
  Bell,
  AlertTriangle,
  CheckCircle2,
  QrCode,
  Smartphone,
  Send,
  Sparkles,
  Clock,
  RefreshCw,
  FileText,
  UserCheck,
  Users,
  Layers,
  Database
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { fetchAutoSavedGroupFullInfo } from '../services/lineNotificationService';

export default function NotificationEngineModule({
  notificationRules,
  notificationLogs,
  users,
  campaigns,
  onUpdateRuleTemplate,
  onToggleRuleActive,
  onTriggerNotification,
  onGenerateDigest
}) {
  const [activeSubTab, setActiveSubTab] = useState('flex_preview'); // 'flex_preview' | 'rules' | 'line_pairing' | 'digest'
  const [selectedRuleId, setSelectedRuleId] = useState(notificationRules[0]?.id || '');
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || '');

  // Custom template state for live edit
  const activeRule = notificationRules.find(r => r.id === selectedRuleId) || notificationRules[0];
  const activeCampaign = campaigns.find(c => c.id === selectedCampaignId) || campaigns[0];

  const [templateText, setTemplateText] = useState(activeRule?.template || '');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [connectedLineGroup, setConnectedLineGroup] = useState(null);
  const [isLoadingGroup, setIsLoadingGroup] = useState(false);

  useEffect(() => {
    const fetchLineGroup = async () => {
      setIsLoadingGroup(true);
      const info = await fetchAutoSavedGroupFullInfo();
      if (info) {
        setConnectedLineGroup(info);
      } else {
        setConnectedLineGroup(null);
      }
      setIsLoadingGroup(false);
    };

    if (activeSubTab === 'line_pairing') {
      fetchLineGroup();
    }
  }, [activeSubTab]);

  const handleTemplateSave = () => {
    onUpdateRuleTemplate(selectedRuleId, templateText);
    alert('บันทึกแม่แบบข้อความสำเร็จ!');
  };

  const handleSendTestMessage = () => {
    setIsSendingTest(true);
    setTimeout(() => {
      onTriggerNotification(selectedCampaignId);
      setIsSendingTest(false);
    }, 600);
  };

  // Replaced template for live preview
  const previewMessage = templateText
    .replace('{campaign_name}', activeCampaign?.name || 'แคมเปญ 9.9 Mega Launch')
    .replace('{days_left}', activeCampaign?.stage_status === 't_minus_2' ? '2' : '5');

  // Placeholder when no campaigns exist
  const MOCK_CAMPAIGN = {
    id: '__mock__',
    name: 'ตัวอย่างแคมเปญ (Demo)',
    stage_status: 'active',
    start_date: '2026-09-01',
    end_date: '2026-09-30',
  };
  const displayCampaign = activeCampaign || MOCK_CAMPAIGN;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 border-pink-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-pink-100 text-pink-600 border border-pink-200 shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-rose-950">LINE Notification Engine</h2>
              <p className="text-xs text-rose-700/80 font-medium">ผูกบัญชี LINE (FR-4.1), ตั้งกฎแจ้งเตือน (FR-4.2), Flex Message (FR-4.3), Escalation (FR-4.4) และ Digest (FR-4.5)</p>
            </div>
          </div>
        </div>

        {/* Sub Nav */}
        <div className="flex items-center gap-1.5 bg-pink-50 p-1.5 rounded-2xl border border-pink-200 flex-wrap shadow-inner">
          <button
            onClick={() => setActiveSubTab('flex_preview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${activeSubTab === 'flex_preview' ? 'bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] text-purple-950 border border-[#E2D2EA] shadow-xs scale-[1.02]' : 'text-purple-900/80 hover:text-purple-950 hover:bg-pink-100/50'
              }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>LINE Flex Preview (FR-4.1)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('rules')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${activeSubTab === 'rules' ? 'bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] text-purple-950 border border-[#E2D2EA] shadow-xs scale-[1.02]' : 'text-purple-900/80 hover:text-purple-950 hover:bg-pink-100/50'
              }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>กฎเวลาแจ้งเตือน (FR-4.2)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('line_pairing')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${activeSubTab === 'line_pairing' ? 'bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] text-purple-950 border border-[#E2D2EA] shadow-xs scale-[1.02]' : 'text-purple-900/80 hover:text-purple-950 hover:bg-pink-100/50'
              }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>ผูกบัญชี LINE รายฝ่าย (FR-4.3)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('digest')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${activeSubTab === 'digest' ? 'bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] text-purple-950 border border-[#E2D2EA] shadow-xs scale-[1.02]' : 'text-purple-900/80 hover:text-purple-950 hover:bg-pink-100/50'
              }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>สรุปประจำวัน Daily Digest (FR-4.4)</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: DYNAMIC FLEX MESSAGE & MOBILE SIMULATOR (FR-4.3 & FR-4.4) */}
      {activeSubTab === 'flex_preview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left Column: Template Configurator */}
          <div className="glass-panel p-6 space-y-5">
            <h3 className="font-bold text-rose-950 text-base border-b border-pink-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-600" />
              <span>เครื่องมือปรับแต่งข้อความไดนามิก (FR-4.3)</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-rose-700 font-bold mb-1">เลือกกฎการแจ้งเตือน</label>
                <select
                  value={selectedRuleId}
                  onChange={(e) => {
                    setSelectedRuleId(e.target.value);
                    const rule = notificationRules.find(r => r.id === e.target.value);
                    if (rule) setTemplateText(rule.template);
                  }}
                  className="w-full bg-white/90 border border-pink-200 text-rose-950 p-2.5 rounded-xl font-medium shadow-sm"
                >
                  {notificationRules.map(r => (
                    <option key={r.id} value={r.id}>
                      [{r.stage.toUpperCase()}] {r.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-rose-700 font-bold mb-1">เลือกแคมเปญจำลองการทดสอบ</label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full bg-white/90 border border-pink-200 text-rose-950 p-2.5 rounded-xl font-medium shadow-sm"
                >
                  {campaigns.length === 0 ? (
                    <option value="">ยังไม่มีแคมเปญในระบบ (จะใช้ข้อมูลตัวอย่างแทน)</option>
                  ) : campaigns.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} (สถานะปัจจุบัน: {(c.stage_status || 'active').toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-rose-700 font-bold">ข้อความแม่แบบ (Dynamic Template)</label>
                  <span className="text-[10px] text-pink-600 font-bold">ใช้ Variable: &#123;campaign_name&#125;, &#123;days_left&#125;</span>
                </div>
                <textarea
                  rows={4}
                  value={templateText}
                  onChange={(e) => setTemplateText(e.target.value)}
                  className="w-full bg-white/90 border border-pink-200 text-rose-950 p-3 rounded-xl focus:outline-none focus:border-pink-500 font-mono text-xs leading-relaxed font-medium shadow-sm"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleTemplateSave}
                  className="px-4 py-2 bg-pink-100 hover:bg-pink-200 text-rose-800 font-bold rounded-xl border border-pink-200 transition shadow-sm"
                >
                  บันทึกแม่แบบ
                </button>

                <button
                  onClick={handleSendTestMessage}
                  disabled={isSendingTest}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] hover:opacity-90 text-purple-950 font-bold rounded-xl transition shadow-xs border border-[#E2D2EA] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSendingTest ? 'กำลังส่งข้อมูล...' : 'ทดสอบส่งข้อความ LINE OA จริง'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Mobile Simulator */}
          <div className="glass-panel p-6 flex flex-col items-center justify-center">
            <div className="text-center mb-4">
              <h4 className="font-bold text-rose-950 text-sm">LINE Official Account Screen Preview</h4>
              <p className="text-xs text-rose-700/80 mt-0.5 font-medium">จำลองการแสดงผลบนแอปพลิเคชัน LINE ของทีมงาน</p>
            </div>

            {/* Mobile Phone Mockup */}
            <div className="w-72 bg-pink-950 border-4 border-pink-900 rounded-[2.5rem] p-3 shadow-2xl relative overflow-hidden">

              {/* Phone Speaker Notch */}
              <div className="w-24 h-4 bg-pink-900 rounded-b-xl mx-auto mb-2 flex items-center justify-center">
                <div className="w-8 h-1 bg-pink-800 rounded-full" />
              </div>

              {/* LINE App Header */}
              <div className="bg-[#06c755] text-white p-2.5 rounded-t-xl flex items-center justify-between text-xs font-bold shadow-md">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                    🟢
                  </div>
                  <span>Nitan Marketing Hub</span>
                </div>
                <span className="text-[10px] opacity-80">OA Official</span>
              </div>

              {/* Chat Body */}
              <div className="bg-[#8cabd9] p-3 min-h-[360px] max-h-[400px] overflow-y-auto space-y-3 font-sans">

                {/* System Timestamp */}
                <div className="text-center">
                  <span className="text-[9px] bg-black/20 text-white px-2 py-0.5 rounded-full font-medium">วันนี้ 11:45 น.</span>
                </div>

                {/* LINE Flex Message Card Container */}
                <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-pink-100 text-slate-900 text-[11px] animate-in zoom-in-95 duration-200">

                  {/* Card Header Banner */}
                  <div className={`p-3 text-white font-bold flex items-center justify-between ${displayCampaign.stage_status === 'overdue' ? 'bg-rose-600' : 'bg-pink-600'
                    }`}>
                    <span className="flex items-center gap-1">
                      {displayCampaign.stage_status === 'overdue' ? 'OVERDUE ALERT' : 'WORKFLOW ALERT'}
                    </span>
                    <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded">T-MINUS</span>
                  </div>

                  {/* Card Body */}
                  <div className="p-3 space-y-2">
                    <div className="font-extrabold text-slate-800 text-xs">{displayCampaign.name}</div>

                    <p className="text-slate-600 leading-snug bg-pink-50 p-2 rounded-lg border border-pink-100 font-mono text-[10px]">
                      {previewMessage}
                    </p>

                    <div className="space-y-1 text-[10px] text-slate-500 pt-1 border-t border-pink-100">
                      <div className="flex justify-between">
                        <span>กำหนดการเริ่ม:</span>
                        <span className="font-semibold text-slate-700">{displayCampaign.start_date || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>สถานะปัจจุบัน:</span>
                        <span className="font-bold text-rose-600 uppercase">{displayCampaign.stage_status || 'active'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div className="border-t border-pink-100 bg-pink-50 p-2 text-center">
                    <button className="w-full py-1.5 bg-[#06c755] text-white font-bold rounded-lg text-[10px] shadow-sm">
                      กดอัปเดตสถานะงานทันที
                    </button>
                  </div>

                </div>

              </div>

              {/* Phone Home Bar */}
              <div className="w-20 h-1 bg-pink-800 rounded-full mx-auto mt-3 mb-1" />
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 2: NOTIFICATION RULES CONFIGURATOR (FR-4.2) */}
      {activeSubTab === 'rules' && (
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h3 className="font-bold text-rose-950 text-base flex items-center gap-2 mb-1">
              <Settings className="w-5 h-5 text-pink-600" />
              <span>ตั้งค่ากฎการแจ้งเตือนตามช่วงเวลา (FR-4.2)</span>
            </h3>
            <p className="text-xs text-rose-700/80 font-medium">
              กำหนดระยะเวลาล่วงหน้าก่อนถึง deadline (เช่น T-5 วัน, T-2 วัน, T-0 วัน) พร้อมเลือกกลุ่มผู้รับ
            </p>
          </div>

          <div className="space-y-4">
            {notificationRules.map(rule => (
              <div key={rule.id} className="glass-panel p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-pink-100 text-rose-800 border border-pink-200 uppercase">
                      Stage: {rule.stage}
                    </span>
                    <span className="text-xs text-rose-700 font-medium">({rule.offset_days} วัน จากวันเริ่มแคมเปญ)</span>
                  </div>
                  <h4 className="font-bold text-rose-950 text-sm mt-1">{rule.title}</h4>
                  <p className="text-xs text-rose-700/80 font-medium">ผู้รับผิดชอบหลัก: <span className="text-pink-700 font-bold">{rule.target_role}</span></p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleRuleActive(rule.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm ${rule.is_active
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-pink-100/60 text-pink-400 border border-pink-200'
                      }`}
                  >
                    {rule.is_active ? 'เปิดใช้งาน (Active)' : 'ปิดใช้งาน (Disabled)'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: LINE PAIRING & USER BINDING (FR-4.1) */}
      {activeSubTab === 'line_pairing' && (
        <div className="glass-panel p-6 space-y-6">
          <div>
            <h3 className="font-bold text-rose-950 text-base flex items-center gap-2 mb-1">
              <QrCode className="w-5 h-5 text-pink-600" />
              <span>การเชื่อมต่อบัญชี LINE OA & LINE Notify (FR-4.1)</span>
            </h3>
            <p className="text-xs text-rose-700/80 font-medium">
              ผู้ใช้งานผูกบัญชี LINE เพื่อรับการแจ้งเตือนงานส่วนตัวและแจ้งเตือนด่วนของทีม
            </p>
          </div>

          <div className="max-w-md mx-auto">

            {/* QR Code pairing wizard */}
            <div className="p-6 rounded-3xl bg-white/90 border border-pink-200 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
              {isLoadingGroup ? (
                <div className="flex flex-col items-center justify-center space-y-3 py-10">
                  <RefreshCw className="w-8 h-8 text-pink-400 animate-spin" />
                  <div className="text-sm font-bold text-rose-900">กำลังตรวจสอบข้อมูลกลุ่มจากฐานข้อมูล...</div>
                </div>
              ) : connectedLineGroup ? (
                <div className="flex flex-col items-center space-y-4 w-full">
                  <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner border border-emerald-200">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-700 text-base">ระบบเชื่อมต่อกลุ่ม LINE แล้ว!</h4>
                    <p className="text-xs text-slate-600 mt-1 font-medium bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-200 inline-block">
                      กลุ่ม: {connectedLineGroup.group_name || 'Nitan Marketing'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2 break-all">ID: {connectedLineGroup.group_id}</p>
                  </div>
                  <div className="pt-2 w-full">
                    <button
                      onClick={() => setConnectedLineGroup(null)}
                      className="text-[10px] text-rose-500 hover:text-rose-700 font-bold underline"
                    >
                      ต้องการเปลี่ยนกลุ่ม? (สแกนใหม่)
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-40 h-40 bg-pink-50 p-3 rounded-2xl shadow-inner border border-pink-200 flex items-center justify-center">
                    {/* Simulated QR Code graphic */}
                    <div className="w-full h-full bg-rose-950 rounded-xl p-2 flex flex-col justify-between items-center text-white text-[9px]">
                      <div className="font-bold text-emerald-400 mt-2">LINE OA SCAN</div>
                      <div className="w-20 h-20 bg-pink-500/20 border-2 border-pink-400 rounded flex items-center justify-center">
                        <QrCode className="w-12 h-12 text-pink-400" />
                      </div>
                      <div className="text-pink-300 mb-1">@nitan_marketing_oa</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-rose-950 text-sm">สแกน QR Code เพื่อเชื่อมต่อ LINE Official Account</h4>
                    <p className="text-xs text-rose-700/80 mt-1 max-w-xs font-medium mx-auto">
                      เปิดแอป LINE แล้วสแกนเพื่อรับรหัส OTP ผูกบัญชีเข้ากับระบบ Marketing Platform
                    </p>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 4: DAILY & WEEKLY DIGEST SUMMARY (FR-4.5) */}
      {activeSubTab === 'digest' && (
        <div className="glass-panel p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-rose-950 text-base flex items-center gap-2 mb-1">
                <FileText className="w-5 h-5 text-pink-600" />
                <span>สรุปรายวัน / รายสัปดาห์ (Digest Report) (FR-4.5)</span>
              </h3>
              <p className="text-xs text-rose-700/80 font-medium">
                รวมงานที่ต้องทำทั้งหมดและสรุปยอดส่งเข้า LINE ในครั้งเดียว ไม่รบกวนเวลาทำงาน
              </p>
            </div>

            <button
              onClick={onGenerateDigest}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>สร้างและยิง Digest รายงานสรุปทันที</span>
            </button>
          </div>

          {/* Digest Output Box */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed space-y-3">
            <div className="text-emerald-400 font-bold">
              [Nitan Marketing Digest Summary] - ประจำวันที่ {new Date().toLocaleDateString('th-TH')}
            </div>
            <p>--------------------------------------------------</p>
            <p>แคมเปญที่ดำเนินงานอยู่: 2 แคมเปญ</p>
            <p>แคมเปญที่เลยกำหนด (Overdue): 1 แคมเปญ (ดันยอด Sunscreen Aqua Gel)</p>
            <p>คอนเทนต์รอตั้งเวลา/โพสต์สัปดาห์นี้: 3 รายการ</p>
            <p>รวมยอดขายแคมเปญล่าสุด: ฿1,900,000 บาท (+284% ROI)</p>
            <p>--------------------------------------------------</p>
            <p className="text-slate-400 text-[11px]">
              *ระบบส่ง Digest อัตโนมัติทุกวันเวลา 08:30 น. และวันจันทร์เวลา 09:00 น.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
