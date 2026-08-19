import React, { useState, useEffect } from 'react';
import { Send, Smartphone, Sparkles, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Database } from 'lucide-react';
import { sendLineFlexCardAlert, fetchAutoSavedGroupFromDb } from '../services/lineNotificationService';
import { supabase } from '../lib/supabaseClient';

export default function LineFlexModal({ isOpen, onClose, defaultCampaign }) {
  const [targetId, setTargetId] = useState('');
  const [dbStatusText, setDbStatusText] = useState('กำลังตรวจสอบกลุ่ม LINE ในฐานข้อมูล DB...');
  const [isLoadingDb, setIsLoadingDb] = useState(false);

  const [campaignName, setCampaignName] = useState(defaultCampaign?.name || 'แคมเปญเปิดตัว 9.9 Nitan Radiance Serum Mega Launch');
  const [platform, setPlatform] = useState('TikTok / Facebook');
  const [publishDate, setPublishDate] = useState('18 ส.ค. 2026 (10:00 น.)');
  const [assignedTo, setAssignedTo] = useState('ทีมงาน Marketing Nitan');
  const [status, setStatus] = useState('T-2 (เหลือเวลา 2 วัน)');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80');

  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  const isValidLineId = (id) => typeof id === 'string' && /^(C|U)[a-fA-F0-9]{32}$/.test(id.trim());

  // Function to load latest active group from Supabase DB
  const loadGroupFromDb = async () => {
    setIsLoadingDb(true);
    setDbStatusText('กำลังดึงข้อมูลจาก Supabase Database...');

    const autoId = await fetchAutoSavedGroupFromDb();
    setIsLoadingDb(false);

    if (autoId && isValidLineId(autoId)) {
      setTargetId(autoId);
      setDbStatusText('✨ เชื่อมต่อกลุ่ม LINE จากฐานข้อมูล DB อัตโนมัติเรียบร้อยแล้ว');
    } else {
      setDbStatusText('💡 ยังไม่พบบอทในกลุ่ม LINE! ดึงบอทเข้ากลุ่ม 1 ครั้ง หรือวางรหัส C... 32 หลักที่นี่');
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadGroupFromDb();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = async (e) => {
    const val = e.target.value;
    setTargetId(val);

    const trimmed = val.trim();
    if (isValidLineId(trimmed)) {
      localStorage.setItem('nitan_line_target_id', trimmed);
      // Auto save to Supabase DB line_groups table
      try {
        await supabase.from('line_groups').upsert({
          group_id: trimmed,
          group_name: 'กลุ่มทีมงาน Nitan Marketing',
          is_active: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'group_id' });
        setDbStatusText('✨ บันทึก Group ID เข้าฐานข้อมูล DB สำเร็จเรียบร้อยแล้ว');
      } catch (err) {
        console.warn('Could not save to line_groups table:', err);
      }
    }
  };

  const handleSendPushAlert = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setSendResult(null);

    const alertPayload = {
      title: 'Nitan Content Alert',
      campaignName,
      platform,
      publishDate,
      assignedTo,
      status,
      imageUrl
    };

    const res = await sendLineFlexCardAlert(targetId, alertPayload);
    setIsSending(false);

    if (res.success) {
      setSendResult({
        success: true,
        message: 'ส่งข้อความ Flex Card เข้า LINE สำเร็จเรียบร้อยแล้ว!'
      });
    } else {
      setSendResult({
        success: false,
        message: res.error || 'ไม่สามารถส่งข้อความได้ กรุณาดึงบอทเข้ากลุ่มแชทในแอป LINE 1 ครั้ง'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="glass-panel max-w-3xl w-full p-6 space-y-5 border-[#E2D2EA] bg-white/95 shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-purple-950 flex items-center gap-2">
                <span>ระบบยิงแจ้งเตือน LINE Flex Card จริง</span>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full border border-purple-200 font-bold">
                  LINE Official Account
                </span>
              </h3>
              <p className="text-xs text-purple-800/80 font-medium">
                ยิงส่งการ์ด Flex Message สวยงามตรงเข้ากลุ่ม LINE ทีมงาน (LINE Official Account)
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold transition flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Column 1: Config Form */}
          <form onSubmit={handleSendPushAlert} className="space-y-3 text-xs">
            
            {/* Group ID Input + DB Sync */}
            <div className="p-3 rounded-xl bg-purple-50/70 border border-[#E2D2EA] space-y-2">
              <div className="flex items-center justify-between text-purple-950 font-bold">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-purple-700" />
                  <span>Group ID ปลายทาง (LINE Group)</span>
                </span>

                {isValidLineId(targetId) ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>พร้อมยิงส่ง</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                    รอใส่ C... 32 หลัก
                  </span>
                )}
              </div>

              <div className="relative flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="วาง Group ID ที่ขึ้นต้นด้วย C... (เช่น C1234567890...)"
                  value={targetId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-mono text-[11px] focus:outline-none focus:border-purple-500 shadow-xs"
                />

                <button
                  type="button"
                  onClick={loadGroupFromDb}
                  disabled={isLoadingDb}
                  className="px-2.5 py-2 bg-white hover:bg-purple-50 text-purple-900 border border-[#E2D2EA] rounded-xl font-bold transition flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
                  title="ดึงข้อมูลล่าสุดจาก Supabase DB"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-purple-700 ${isLoadingDb ? 'animate-spin' : ''}`} />
                  <span className="text-[10px]">ดึง DB</span>
                </button>
              </div>

              <p className="text-[10px] text-purple-800 font-medium">
                {dbStatusText}
              </p>
            </div>

            <div>
              <label className="block text-purple-950 font-bold mb-1">ชื่อแคมเปญ / หัวข้อคอนเทนต์</label>
              <input
                type="text"
                required
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-purple-950 font-bold mb-1">ช่องทาง (Platform)</label>
                <input
                  type="text"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-purple-950 font-bold mb-1">กำหนดโพสต์</label>
                <input
                  type="text"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-purple-950 font-bold mb-1">ผู้รับผิดชอบ</label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-purple-950 font-bold mb-1">สถานะแจ้งเตือน</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none"
                >
                  <option value="T-5 (เหลือเวลา 5 วัน)">T-5 (เหลือเวลา 5 วัน)</option>
                  <option value="T-2 (เหลือเวลา 2 วัน)">T-2 (เหลือเวลา 2 วัน)</option>
                  <option value="T-0 (กำหนดโพสต์วันนี้!)">T-0 (กำหนดโพสต์วันนี้!)</option>
                  <option value="งานเกินกำหนด (Overdue)">งานเกินกำหนด (Overdue)</option>
                </select>
              </div>
            </div>



            {/* Notification Result Banner */}
            {sendResult && (
              <div className={`p-3 rounded-xl border text-xs font-medium ${
                sendResult.success 
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}>
                <div className="flex items-center gap-2 font-bold mb-0.5">
                  {sendResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                  <span>{sendResult.success ? 'ส่งแจ้งเตือนสำเร็จ!' : 'เกิดข้อความแจ้งเตือน'}</span>
                </div>
                <p className="text-[11px]">{sendResult.message}</p>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSending}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลังยิงส่งเข้ากลุ่ม LINE...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>ยิงส่งแจ้งเตือน Flex Card เข้า LINE จริง</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Column 2: Live Preview of LINE Flex Card */}
          <div className="bg-[#8492A6]/10 p-4 rounded-2xl border border-purple-100/80 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-purple-900 mb-3 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>ตัวอย่างการ์ดที่จะได้รับใน LINE Group:</span>
            </span>

            {/* Mock iPhone LINE Chat Screen */}
            <div className="w-full max-w-[280px] bg-[#72849B] rounded-3xl p-3 shadow-xl border-4 border-slate-700 space-y-3">
              <div className="text-[10px] text-white/70 text-center font-medium">LINE Group Chat</div>

              {/* Flex Card Container */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                {/* Header */}
                <div className="bg-[#F5EEF8] p-3 border-b border-purple-100">
                  <span className="font-bold text-purple-950 text-xs flex items-center gap-1">
                    <span>Nitan Content Alert</span>
                  </span>
                </div>



                {/* Content Body */}
                <div className="p-3 space-y-2 text-[11px]">
                  <div className="font-bold text-purple-950 text-xs leading-snug">
                    {campaignName}
                  </div>

                  <div className="space-y-1 text-[10px] text-purple-900">
                    <div className="flex justify-between">
                      <span className="text-purple-500">ช่องทาง</span>
                      <span className="font-bold">{platform}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-500">โพสต์วัน</span>
                      <span className="font-bold">{publishDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-500">ผู้ดูแล</span>
                      <span className="font-bold">{assignedTo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-500">สถานะ</span>
                      <span className="font-bold text-pink-600">{status}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="w-full py-1.5 bg-[#CDB4DB] text-purple-950 font-bold rounded-lg text-center text-[10px] shadow-xs">
                      🔗 เปิดระบบวางแผน Nitan
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
