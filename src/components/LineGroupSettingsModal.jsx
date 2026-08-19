import React, { useState, useEffect } from 'react';
import { Settings, Users, MessageSquare, CheckCircle2, Save, ShieldAlert, Sparkles } from 'lucide-react';

export default function LineGroupSettingsModal({ isOpen, onClose }) {
  const [contentGroupId, setContentGroupId] = useState('');
  const [marketingGroupId, setMarketingGroupId] = useState('');
  const [branchGroupId, setBranchGroupId] = useState('');
  const [adminGroupId, setAdminGroupId] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem('nitan_line_group_settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          setContentGroupId(parsed.content_group_id || '');
          setMarketingGroupId(parsed.marketing_group_id || '');
          setBranchGroupId(parsed.branch_group_id || '');
          setAdminGroupId(parsed.admin_group_id || '');
        }
      } catch (err) {
        console.error('Error reading LINE group settings:', err);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveSettings = (e) => {
    e.preventDefault();

    const payload = {
      content_group_id: contentGroupId.trim(),
      marketing_group_id: marketingGroupId.trim(),
      branch_group_id: branchGroupId.trim(),
      admin_group_id: adminGroupId.trim(),
      updated_at: new Date().toISOString()
    };

    localStorage.setItem('nitan_line_group_settings', JSON.stringify(payload));
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="glass-panel max-w-md w-full p-6 space-y-4 border-[#E2D2EA]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-purple-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFEBF3] text-purple-900 flex items-center justify-center border border-[#E2D2EA]">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-purple-950 leading-none">
                ตั้งค่า Group ID รายฝ่าย (Group Routing)
              </h3>
              <p className="text-xs text-purple-800/80 font-medium mt-1">
                ระบุ Group ID ของแต่ละทีม เพื่อให้ยิงส่ง Flex Card ตรงถึงกลุ่มที่เกี่ยวข้อง
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-purple-400 hover:text-purple-700 font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
          
          {/* Department 1 */}
          <div>
            <label className="block text-purple-950 font-bold mb-1 flex items-center gap-1.5">
              <span>🎨 กลุ่มทีม Content & Graphic Design</span>
            </label>
            <input
              type="text"
              placeholder="เช่น C1234567890abcdef1234567890..."
              value={contentGroupId}
              onChange={(e) => setContentGroupId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-mono text-[11px] focus:outline-none"
            />
          </div>

          {/* Department 2 */}
          <div>
            <label className="block text-purple-950 font-bold mb-1 flex items-center gap-1.5">
              <span>📢 กลุ่มทีม Marketing & Media Planning</span>
            </label>
            <input
              type="text"
              placeholder="เช่น C234567890abcdef234567890..."
              value={marketingGroupId}
              onChange={(e) => setMarketingGroupId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-mono text-[11px] focus:outline-none"
            />
          </div>

          {/* Department 3 */}
          <div>
            <label className="block text-purple-950 font-bold mb-1 flex items-center gap-1.5">
              <span>🏢 กลุ่มทีมสาขาหน้าร้าน / Sales Representatives</span>
            </label>
            <input
              type="text"
              placeholder="เช่น C34567890abcdef34567890..."
              value={branchGroupId}
              onChange={(e) => setBranchGroupId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-mono text-[11px] focus:outline-none"
            />
          </div>

          {/* Department 4 */}
          <div>
            <label className="block text-purple-950 font-bold mb-1 flex items-center gap-1.5">
              <span>👑 กลุ่มผู้บริหาร / Management (Escalation Alert)</span>
            </label>
            <input
              type="text"
              placeholder="เช่น C4567890abcdef4567890..."
              value={adminGroupId}
              onChange={(e) => setAdminGroupId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-mono text-[11px] focus:outline-none"
            />
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>บันทึกการตั้งค่า Group ID เรียบร้อยแล้ว!</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-purple-50 text-purple-900 rounded-xl font-bold hover:bg-purple-100 transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] text-purple-950 font-bold rounded-xl shadow-xs border border-[#E2D2EA] hover:opacity-90 transition cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-purple-700" />
              <span>บันทึกตั้งค่ากลุ่ม</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
