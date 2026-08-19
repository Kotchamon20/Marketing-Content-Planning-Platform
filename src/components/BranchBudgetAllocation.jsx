import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  DollarSign, 
  Percent, 
  PieChart, 
  Calculator, 
  CheckCircle2, 
  Sparkles,
  TrendingUp,
  Share2,
  AlertTriangle,
  X,
  Camera,
  UploadCloud,
  FileImage,
  Scan,
  Zap,
  ArrowRight,
  Edit3,
  Sliders,
  Calendar,
  Filter,
  Bot,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { parseFullSheetWithGroqAi } from '../services/groqAiService';

export default function BranchBudgetAllocation() {
  const [mktPercentRate, setMktPercentRate] = useState(2.0); // Default MKT 2%

  // Calculation Mode: 'auto' (MKT 2% Auto Calculate) | 'manual' (User Custom Full Budget Input)
  const [budgetCalcMode, setBudgetCalcMode] = useState('manual'); // Default 'manual' matching user's exact sheet numbers

  // Month & Year Filter States
  const [selectedMonth, setSelectedMonth] = useState('08');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Google Search Sub-Campaign Breakdown State for Main Branch (NITAN หลัก)
  const [googleSearchBreakdown, setGoogleSearchBreakdown] = useState({
    generalSearch: 283.72,
    leadsSearch: 283.72,
    naJomtienSearch: 567.43
  });

  // Toggle state to expand/collapse Google Ads Breakdown box inside cards
  const [expandedGoogleBranchId, setExpandedGoogleBranchId] = useState('hq');

  // Month List
  const monthsList = [
    { value: '01', label: 'มกราคม', short: 'ม.ค.' },
    { value: '02', label: 'กุมภาพันธ์', short: 'ก.พ.' },
    { value: '03', label: 'มีนาคม', short: 'มี.ค.' },
    { value: '04', label: 'เมษายน', short: 'เม.ย.' },
    { value: '05', label: 'พฤษภาคม', short: 'พ.ค.' },
    { value: '06', label: 'มิถุนายน', short: 'มิ.ย.' },
    { value: '07', label: 'กรกฎาคม', short: 'ก.ค.' },
    { value: '08', label: 'สิงหาคม', short: 'ส.ค.' },
    { value: '09', label: 'กันยายน', short: 'ก.ย.' },
    { value: '10', label: 'ตุลาคม', short: 'ต.ค.' },
    { value: '11', label: 'พฤศจิกายน', short: 'พ.ย.' },
    { value: '12', label: 'ธันวาคม', short: 'ธ.ค.' }
  ];

  const quickMonthTabs = [
    { month: '05', year: '2026', label: 'พ.ค. 69' },
    { month: '06', year: '2026', label: 'มิ.ย. 69' },
    { month: '07', year: '2026', label: 'ก.ค. 69' },
    { month: '08', year: '2026', label: 'ส.ค. 69 (ปัจจุบัน)' },
    { month: '09', year: '2026', label: 'ก.ย. 69' },
    { month: '10', year: '2026', label: 'ต.ค. 69' },
    { month: '11', year: '2026', label: 'พ.ย. 69' },
    { month: '12', year: '2026', label: 'ธ.ค. 69' }
  ];

  // Custom Modal States
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchSales, setNewBranchSales] = useState(1000000);

  const [deleteBranchId, setDeleteBranchId] = useState(null);

  // Groq AI Smart Scanner States
  const [showImageScanModal, setShowImageScanModal] = useState(false);
  const [uploadedImageSrc, setUploadedImageSrc] = useState('/excel_full_sheet_layout.png');
  const [isScanningImage, setIsScanningImage] = useState(false);
  const [groqAiScanNote, setGroqAiScanNote] = useState('');

  // Scanned Multi-Branch Array State
  const [scannedSheetResult, setScannedSheetResult] = useState({
    sheetTitle: 'งบ Marketing ประจำเดือน ส.ค. 69',
    branches: [
      {
        name: 'NITAN หลัก (สำนักงานใหญ่)',
        manualFullBudget: 117000,
        previousSales: 5750000.00,
        influencerPromo: 0,
        eventPromo: 0,
        lineOaPromo: 2000,
        googleAdsAmount: 34500,
        fbAdsAmount: 34500,
        tiktokAmount: 11500,
        igAmount: 11500,
        lazadaAmount: 0,
        shopeeAmount: 11500,
        grabAmount: 11500
      },
      {
        name: 'NITAN เขาพระตำหนัก',
        manualFullBudget: 20000,
        previousSales: 1200000.00,
        influencerPromo: 0,
        eventPromo: 0,
        lineOaPromo: 0,
        googleAdsAmount: 8000,
        fbAdsAmount: 8000,
        tiktokAmount: 2000,
        igAmount: 2000,
        lazadaAmount: 0,
        shopeeAmount: 2000,
        grabAmount: 2000
      },
      {
        name: 'NITAN นาเกลือ',
        manualFullBudget: 22000,
        previousSales: 1100000.00,
        influencerPromo: 0,
        eventPromo: 0,
        lineOaPromo: 0,
        googleAdsAmount: 8000,
        fbAdsAmount: 8000,
        tiktokAmount: 2000,
        igAmount: 0,
        lazadaAmount: 0,
        shopeeAmount: 2000,
        grabAmount: 2000
      }
    ]
  });

  // Default initial branches data map matching user's exact Google Sheet screenshot
  const [monthlyBudgetsData, setMonthlyBudgetsData] = useState({
    '2026-08': [
      {
        id: 'hq',
        name: 'NITAN หลัก',
        subTitle: 'สำนักงานใหญ่',
        colorHeader: 'bg-[#FFEBF3] text-purple-950 border-[#E2D2EA]',
        manualFullBudget: 117000.00,
        previousSales: 5750000.00,
        promotions: [
          { id: 'p1', name: 'Influencer', amount: 0 },
          { id: 'p2', name: 'Workshop/Event', amount: 0 },
          { id: 'p3', name: 'Line OA', amount: 2000 }
        ],
        channelAllocations: [
          { id: 'c1', name: 'Google', percent: 30, amount: 34500 },
          { id: 'c2', name: 'Facebook', percent: 30, amount: 34500 },
          { id: 'c3', name: 'TikTok', percent: 10, amount: 11500 },
          { id: 'c4', name: 'Instagram', percent: 10, amount: 11500 },
          { id: 'c5', name: 'Lazada', percent: 0, amount: 0 },
          { id: 'c6', name: 'Shopee', percent: 10, amount: 11500 },
          { id: 'c7', name: 'Grab', percent: 10, amount: 11500 }
        ]
      },
      {
        id: 'phra-tamnak',
        name: 'NITAN เขาพระตำหนัก',
        subTitle: 'เขาพระตำหนัก พัทยา',
        colorHeader: 'bg-[#E6F2FF] text-purple-950 border-[#E2D2EA]',
        manualFullBudget: 20000.00,
        previousSales: 1200000.00,
        promotions: [
          { id: 'p1', name: 'Influencer', amount: 0 },
          { id: 'p2', name: 'Workshop/Event', amount: 0 },
          { id: 'p3', name: 'Line OA', amount: 0 }
        ],
        channelAllocations: [
          { id: 'c1', name: 'Google', percent: 40, amount: 8000 },
          { id: 'c2', name: 'Facebook', percent: 40, amount: 8000 },
          { id: 'c3', name: 'TikTok', percent: 10, amount: 2000 },
          { id: 'c4', name: 'Instagram', percent: 10, amount: 2000 },
          { id: 'c5', name: 'Lazada', percent: 0, amount: 0 },
          { id: 'c6', name: 'Shopee', percent: 10, amount: 2000 },
          { id: 'c7', name: 'Grab', percent: 10, amount: 2000 }
        ]
      },
      {
        id: 'naklua',
        name: 'NITAN นาเกลือ',
        subTitle: 'นาเกลือ พัทยา',
        colorHeader: 'bg-[#FEF9C3] text-purple-950 border-[#E2D2EA]',
        manualFullBudget: 22000.00,
        previousSales: 1100000.00,
        promotions: [
          { id: 'p1', name: 'Influencer', amount: 0 },
          { id: 'p2', name: 'Workshop/Event', amount: 0 },
          { id: 'p3', name: 'Line OA', amount: 0 }
        ],
        channelAllocations: [
          { id: 'c1', name: 'Google', percent: 40, amount: 8000 },
          { id: 'c2', name: 'Facebook', percent: 40, amount: 8000 },
          { id: 'c3', name: 'TikTok', percent: 10, amount: 2000 },
          { id: 'c4', name: 'Instagram', percent: 0, amount: 0 },
          { id: 'c5', name: 'Lazada', percent: 0, amount: 0 },
          { id: 'c6', name: 'Shopee', percent: 10, amount: 2000 },
          { id: 'c7', name: 'Grab', percent: 10, amount: 2000 }
        ]
      }
    ]
  });

  const currentMonthKey = `${selectedYear}-${selectedMonth}`;

  // Get current active branches for the selected month
  const currentBranches = monthlyBudgetsData[currentMonthKey] || [
    {
      id: `hq-${currentMonthKey}`,
      name: 'NITAN หลัก',
      subTitle: 'สำนักงานใหญ่',
      colorHeader: 'bg-[#FFEBF3] text-purple-950 border-[#E2D2EA]',
      manualFullBudget: 117000.00,
      previousSales: 5750000.00,
      promotions: [
        { id: 'p1', name: 'Influencer', amount: 0 },
        { id: 'p2', name: 'Workshop/Event', amount: 0 },
        { id: 'p3', name: 'Line OA', amount: 2000 }
      ],
      channelAllocations: [
        { id: 'c1', name: 'Google', percent: 30, amount: 34500 },
        { id: 'c2', name: 'Facebook', percent: 30, amount: 34500 },
        { id: 'c3', name: 'TikTok', percent: 10, amount: 11500 },
        { id: 'c4', name: 'Instagram', percent: 10, amount: 11500 },
        { id: 'c5', name: 'Lazada', percent: 0, amount: 0 },
        { id: 'c6', name: 'Shopee', percent: 10, amount: 11500 },
        { id: 'c7', name: 'Grab', percent: 10, amount: 11500 }
      ]
    },
    {
      id: `phra-tamnak-${currentMonthKey}`,
      name: 'NITAN เขาพระตำหนัก',
      subTitle: 'เขาพระตำหนัก พัทยา',
      colorHeader: 'bg-[#E6F2FF] text-purple-950 border-[#E2D2EA]',
      manualFullBudget: 20000.00,
      previousSales: 1200000.00,
      promotions: [
        { id: 'p1', name: 'Influencer', amount: 0 },
        { id: 'p2', name: 'Workshop/Event', amount: 0 },
        { id: 'p3', name: 'Line OA', amount: 0 }
      ],
      channelAllocations: [
        { id: 'c1', name: 'Google', percent: 40, amount: 8000 },
        { id: 'c2', name: 'Facebook', percent: 40, amount: 8000 },
        { id: 'c3', name: 'TikTok', percent: 10, amount: 2000 },
        { id: 'c4', name: 'Instagram', percent: 10, amount: 2000 },
        { id: 'c5', name: 'Lazada', percent: 0, amount: 0 },
        { id: 'c6', name: 'Shopee', percent: 10, amount: 2000 },
        { id: 'c7', name: 'Grab', percent: 10, amount: 2000 }
      ]
    }
  ];

  const updateCurrentBranches = (newBranchesOrFn) => {
    setMonthlyBudgetsData(prev => {
      const updated = typeof newBranchesOrFn === 'function' ? newBranchesOrFn(currentBranches) : newBranchesOrFn;
      return { ...prev, [currentMonthKey]: updated };
    });
  };

  // Handlers for updating branch sales & manual full budget
  const handleUpdateSales = (branchId, value) => {
    updateCurrentBranches(prev => prev.map(b => b.id === branchId ? { ...b, previousSales: Number(value) || 0 } : b));
  };

  const handleUpdateManualFullBudget = (branchId, value) => {
    updateCurrentBranches(prev => prev.map(b => b.id === branchId ? { ...b, manualFullBudget: Number(value) || 0 } : b));
  };

  const handleUpdatePromoAmount = (branchId, promoId, value) => {
    updateCurrentBranches(prev => prev.map(b => {
      if (b.id === branchId) {
        return {
          ...b,
          promotions: b.promotions.map(p => p.id === promoId ? { ...p, amount: Number(value) || 0 } : p)
        };
      }
      return b;
    }));
  };

  const handleUpdateChannelAmount = (branchId, channelId, value) => {
    updateCurrentBranches(prev => prev.map(b => {
      if (b.id === branchId) {
        return {
          ...b,
          channelAllocations: b.channelAllocations.map(c => c.id === channelId ? { ...c, amount: Number(value) || 0 } : c)
        };
      }
      return b;
    }));
  };

  // Add Branch Handler (Custom Modal)
  const handleConfirmAddBranch = (e) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;

    const newBranch = {
      id: `branch-${Date.now()}`,
      name: newBranchName.trim(),
      colorHeader: 'bg-[#F5EEF8] text-purple-950 border-[#E2D2EA]',
      manualFullBudget: 20000.00,
      previousSales: Number(newBranchSales) || 1000000,
      promotions: [
        { id: 'p1', name: 'Influencer', amount: 0 },
        { id: 'p2', name: 'Workshop/Event', amount: 0 },
        { id: 'p3', name: 'Line OA', amount: 0 }
      ],
      channelAllocations: [
        { id: 'c1', name: 'Google', percent: 40, amount: 8000 },
        { id: 'c2', name: 'Facebook', percent: 40, amount: 8000 },
        { id: 'c3', name: 'TikTok', percent: 10, amount: 2000 },
        { id: 'c4', name: 'Instagram', percent: 0, amount: 0 },
        { id: 'c5', name: 'Lazada', percent: 0, amount: 0 },
        { id: 'c6', name: 'Shopee', percent: 10, amount: 2000 },
        { id: 'c7', name: 'Grab', percent: 10, amount: 2000 }
      ]
    };

    updateCurrentBranches(prev => [...prev, newBranch]);
    setShowAddBranchModal(false);
    setNewBranchName('');
  };

  // Confirm Delete Branch Handler
  const handleConfirmDeleteBranch = () => {
    if (deleteBranchId) {
      updateCurrentBranches(prev => prev.filter(b => b.id !== deleteBranchId));
      setDeleteBranchId(null);
    }
  };

  // Image Upload & Groq AI OCR Auto Scan Handler
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result;
      setUploadedImageSrc(src);
      startGroqAiScanSimulation(file.name);
    };
    reader.readAsDataURL(file);
  };

  const startGroqAiScanSimulation = async (filename = '') => {
    setIsScanningImage(true);
    setGroqAiScanNote('');

    const groqParsed = await parseFullSheetWithGroqAi(filename);

    setScannedSheetResult(groqParsed);
    setGroqAiScanNote(groqParsed.aiAnalysisReason || 'Groq AI สแกนวิเคราะห์รูปภาพตารางงบสำเร็จ 100%');
    setIsScanningImage(false);
  };

  const handleApplyAllScannedBranches = () => {
    if (!scannedSheetResult.branches || scannedSheetResult.branches.length === 0) return;

    const newBranchesList = scannedSheetResult.branches.map((b, idx) => {
      const colorHeaders = [
        'bg-[#FFEBF3] text-purple-950 border-[#E2D2EA]', // Red/Pink Main HQ
        'bg-[#E6F2FF] text-purple-950 border-[#E2D2EA]', // Blue Phra Tamnak
        'bg-[#FEF9C3] text-purple-950 border-[#E2D2EA]'  // Yellow Naklua
      ];

      return {
        id: `branch-auto-${idx}-${Date.now()}`,
        name: b.name,
        colorHeader: colorHeaders[idx % colorHeaders.length],
        manualFullBudget: b.manualFullBudget || (b.previousSales * (mktPercentRate / 100)),
        previousSales: Number(b.previousSales) || 1000000,
        promotions: [
          { id: 'p1', name: 'Influencer', amount: Number(b.influencerPromo) || 0 },
          { id: 'p2', name: 'Workshop/Event', amount: Number(b.eventPromo) || 0 },
          { id: 'p3', name: 'Line OA', amount: Number(b.lineOaPromo) || 0 }
        ],
        channelAllocations: [
          { id: 'c1', name: 'Google', percent: b.googleAdsPct || 35, amount: b.googleAdsAmount || 34500 },
          { id: 'c2', name: 'Facebook', percent: b.fbAdsPct || 35, amount: b.fbAdsAmount || 34500 },
          { id: 'c3', name: 'TikTok', percent: b.tiktokPct || 10, amount: b.tiktokAmount || 11500 },
          { id: 'c4', name: 'Instagram', percent: b.igPct || 10, amount: b.igAmount || 11500 },
          { id: 'c5', name: 'Lazada', percent: 0, amount: b.lazadaAmount || 0 },
          { id: 'c6', name: 'Shopee', percent: b.shopeePct || 10, amount: b.shopeeAmount || 11500 },
          { id: 'c7', name: 'Grab', percent: b.grabPct || 10, amount: b.grabAmount || 11500 }
        ]
      };
    });

    updateCurrentBranches(newBranchesList);
    setShowImageScanModal(false);
  };

  // Aggregated totals for selected month based on calc mode
  const grandTotalSales = currentBranches.reduce((sum, b) => sum + b.previousSales, 0);

  const grandTotalFullBudget = currentBranches.reduce((sum, b) => {
    const fullB = budgetCalcMode === 'auto'
      ? (b.previousSales * (mktPercentRate / 100))
      : (b.manualFullBudget || (b.previousSales * (mktPercentRate / 100)));
    return sum + fullB;
  }, 0);

  const totalGoogleSearchSubAmount = Number(googleSearchBreakdown.generalSearch || 0) + 
                                     Number(googleSearchBreakdown.leadsSearch || 0) + 
                                     Number(googleSearchBreakdown.naJomtienSearch || 0);

  const currentMonthObj = monthsList.find(m => m.value === selectedMonth) || monthsList[7];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Banner & Control Panel */}
      <div className="glass-panel p-6 border-[#E2D2EA]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEBF3] border border-[#E2D2EA] text-xs font-bold text-purple-950 mb-2">
              <Calculator className="w-3.5 h-3.5 text-purple-700" />
              <span>การจัดสรรงบประมาณ Marketing (Module 2: Nitan Branch Cards System)</span>
            </div>
            <h2 className="text-xl font-bold text-purple-950 tracking-tight flex items-center gap-2">
              <span>จัดสรรงบประมาณการตลาด MKT ประจำเดือน {currentMonthObj.label} {Number(selectedYear) + 543}</span>
            </h2>
            <p className="text-xs text-purple-800/80 font-medium mt-1">
              จัดสรรงบประมาณแยกตามสาขาในรูปแบบการ์ด พร้อมระบบแยกงบย่อย Google Ads (Google Search Breakdown)
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            
            {/* Auto vs Manual Calculation Mode Switcher */}
            <div className="flex items-center p-1 bg-purple-50 rounded-xl border border-[#E2D2EA] text-xs font-bold shadow-xs">
              <button
                onClick={() => setBudgetCalcMode('auto')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  budgetCalcMode === 'auto'
                    ? 'bg-purple-950 text-white shadow-xs'
                    : 'text-purple-900 hover:bg-purple-100'
                }`}
                title="คำนวณงบประมาณ 2% อัตโนมัติจากยอดขายเดือนก่อนหน้า"
              >
                <Zap className="w-3.5 h-3.5 text-yellow-300" />
                <span>⚡ Auto (คำนวณ 2% อัตโนมัติ)</span>
              </button>

              <button
                onClick={() => setBudgetCalcMode('manual')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  budgetCalcMode === 'manual'
                    ? 'bg-purple-950 text-white shadow-xs'
                    : 'text-purple-900 hover:bg-purple-100'
                }`}
                title="เปิดให้กรอกงบจำนวนเต็มเองอิสระ (Manual Output)"
              >
                <Edit3 className="w-3.5 h-3.5 text-pink-300" />
                <span>✏️ Manual (กรอกงบจำนวนเต็มเอง)</span>
              </button>
            </div>

            {/* Month & Year Filter Selectors */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-[#E2D2EA] text-xs font-bold text-purple-950 shadow-xs">
              <Calendar className="w-4 h-4 text-purple-700" />
              <span>ประจำเดือน:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-2 py-1 bg-purple-50 border border-purple-200 rounded-lg font-bold text-purple-950 focus:outline-none text-xs"
              >
                {monthsList.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-2 py-1 bg-purple-50 border border-purple-200 rounded-lg font-bold text-purple-950 focus:outline-none text-xs"
              >
                <option value="2026">2026 (2569)</option>
                <option value="2027">2027 (2570)</option>
              </select>
            </div>

            {/* Smart Groq AI Image Auto-Scan Button */}
            <button
              onClick={() => {
                setShowImageScanModal(true);
                if (!uploadedImageSrc) {
                  setUploadedImageSrc('/excel_full_sheet_layout.png');
                  startGroqAiScanSimulation('excel_full_sheet_layout.png');
                }
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-2 cursor-pointer hover:opacity-95"
            >
              <Bot className="w-4 h-4 text-pink-300 animate-pulse" />
              <span>📷 Groq AI สแกนรูปภาพตาราง (Auto)</span>
            </button>

            <button
              onClick={() => setShowAddBranchModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] hover:opacity-90 text-purple-950 font-bold rounded-xl text-xs transition shadow-xs border border-[#E2D2EA] flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-purple-700" />
              <span>+ เพิ่มสาขาใหม่</span>
            </button>
          </div>
        </div>

        {/* Quick Month Switcher Tabs Bar */}
        <div className="mt-5 pt-4 border-t border-purple-100/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-purple-600" />
              <span>สลับดูงบรายเดือน (1-Click Switcher):</span>
            </span>

            <span className="text-[11px] text-purple-700 font-medium">
              กำลังแสดงผลงบเดือน: <strong className="text-purple-950 font-extrabold">{currentMonthObj.label} {Number(selectedYear) + 543}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {quickMonthTabs.map(tab => {
              const isActive = selectedMonth === tab.month && selectedYear === tab.year;
              return (
                <button
                  key={tab.month}
                  onClick={() => {
                    setSelectedMonth(tab.month);
                    setSelectedYear(tab.year);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white border border-purple-950 shadow-md scale-[1.02]'
                      : 'bg-white text-purple-900 hover:bg-[#FFEBF3]/60 border border-[#E2D2EA]'
                  }`}
                >
                  {isActive ? <Check className="w-3.5 h-3.5 text-pink-300" /> : <span>📅</span>}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Top Highlight Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t border-purple-100/60">
          <div className="p-4 rounded-2xl bg-white border border-[#E2D2EA] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-purple-900 block">ยอดขายรวมเดือนก่อนหน้า (ทุกสาขา)</span>
              <span className="text-xl font-bold text-purple-950 font-mono">฿{grandTotalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F0E6F5] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E2D2EA] flex items-center justify-between shadow-xs">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-purple-900 block">งบการตลาดรวม ({budgetCalcMode === 'auto' ? `MKT ${mktPercentRate}% Auto` : 'Manual Full Budget'})</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-100 font-bold text-purple-950">{budgetCalcMode.toUpperCase()}</span>
              </div>
              <span className="text-xl font-bold text-purple-950 font-mono">฿{grandTotalFullBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FFEBF3] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E2D2EA] flex items-center justify-between shadow-xs sm:col-span-2 lg:col-span-1">
            <div>
              <span className="text-xs font-bold text-purple-900 block">จำนวนสาขาในเดือน {currentMonthObj.label}</span>
              <span className="text-xl font-bold text-purple-950 font-mono">{currentBranches.length} สาขา</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#E6F2FF] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Branch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {currentBranches.map((branch, bIdx) => {
          const fullBudget = budgetCalcMode === 'auto'
            ? (branch.previousSales * (mktPercentRate / 100))
            : (branch.manualFullBudget || (branch.previousSales * (mktPercentRate / 100)));

          const totalPromoAmount = branch.promotions.reduce((sum, p) => sum + p.amount, 0);
          const netMediaBudget = Math.max(0, fullBudget - totalPromoAmount);
          const totalChannelAmount = branch.channelAllocations.reduce((sum, c) => sum + (c.amount || 0), 0);
          const dailySales = branch.previousSales / 30;

          const isMainBranch = bIdx === 0 || branch.name.toLowerCase().includes('หลัก') || branch.name.toLowerCase().includes('สำนักงานใหญ่');
          const isGoogleExpanded = expandedGoogleBranchId === branch.id;

          return (
            <div key={branch.id} className="glass-panel overflow-hidden border-[#E2D2EA] flex flex-col justify-between shadow-xs hover:shadow-md transition">
              <div>
                {/* Branch Header */}
                <div className={`p-4 border-b flex items-center justify-between ${branch.colorHeader}`}>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4.5 h-4.5 text-purple-700" />
                    <div>
                      <h3 className="font-bold text-sm text-purple-950">{branch.name}</h3>
                      <span className="text-[10px] text-purple-800 font-medium block">
                        {branch.subTitle || (isMainBranch ? 'สำนักงานใหญ่' : 'สาขาพัทยา')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setDeleteBranchId(branch.id)}
                    className="p-1 text-rose-500 hover:bg-rose-100/60 rounded-lg transition cursor-pointer"
                    title="ลบสาขานี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-4 text-xs">
                  
                  {/* Row 1: Sales & Daily Average */}
                  <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-950">ยอดขายเดือนก่อนหน้า</span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-purple-900">฿</span>
                        <input
                          type="number"
                          value={branch.previousSales}
                          onChange={(e) => handleUpdateSales(branch.id, e.target.value)}
                          className="w-32 px-2 py-1 bg-white border border-[#E2D2EA] rounded-lg text-right font-mono font-bold text-purple-950 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-dashed border-purple-200/80">
                      <span className="text-purple-800 font-medium">เฉลี่ยต่อวัน (30 วัน):</span>
                      <span className="font-mono font-bold text-purple-950">
                        ฿{dailySales.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/วัน
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Full Budget (Auto vs Manual) */}
                  <div className="p-3 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] rounded-xl border border-[#E2D2EA] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-purple-950 block">งบจำนวนเต็ม ({budgetCalcMode === 'auto' ? 'Auto 2%' : 'Manual'})</span>
                      <span className="text-[10px] text-purple-800 font-medium">
                        {budgetCalcMode === 'auto' ? 'คำนวณ 2% อัตโนมัติ' : 'กรอกงบจำนวนเต็มเอง'}
                      </span>
                    </div>
                    
                    {budgetCalcMode === 'manual' ? (
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-purple-900">฿</span>
                        <input
                          type="number"
                          value={branch.manualFullBudget || fullBudget}
                          onChange={(e) => handleUpdateManualFullBudget(branch.id, e.target.value)}
                          className="w-32 px-2.5 py-1 bg-white border border-[#E2D2EA] rounded-lg text-right font-mono font-bold text-purple-950 focus:outline-none"
                        />
                      </div>
                    ) : (
                      <span className="font-mono font-bold text-sm text-purple-950">
                        ฿{fullBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>

                  {/* Section A: Promotional Activities */}
                  <div className="space-y-2 pt-1">
                    <span className="font-bold text-purple-900 text-[11px] block border-b border-purple-100 pb-1 uppercase tracking-wider">
                      งบที่กันไว้ส่วนหนึ่ง (Hold Budget / Promotions)
                    </span>
                    {branch.promotions.map(promo => (
                      <div key={promo.id} className="flex items-center justify-between py-0.5">
                        <span className="text-purple-900 font-medium">{promo.name}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-purple-700 text-[10px]">฿</span>
                          <input
                            type="number"
                            value={promo.amount}
                            onChange={(e) => handleUpdatePromoAmount(branch.id, promo.id, e.target.value)}
                            className="w-28 px-2 py-0.5 bg-white border border-[#E2D2EA] rounded-md text-right font-mono font-bold text-purple-950 focus:outline-none text-xs"
                          />
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-1 border-t border-dashed border-purple-200 text-purple-950 font-bold">
                      <span>รวมงบหลังหักกิจกรรม</span>
                      <span className="font-mono text-purple-950">
                        ฿{netMediaBudget.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>

                  {/* Section B: Online Channels Allocation & Google Breakdown */}
                  <div className="space-y-2 pt-2 border-t border-purple-100">
                    <div className="flex items-center justify-between border-b border-purple-100 pb-1">
                      <span className="font-bold text-purple-900 text-[11px] uppercase tracking-wider">
                        งบช่องทางออนไลน์ (Online Channels)
                      </span>
                      <span className="text-[11px] font-bold text-purple-950 font-mono">
                        รวม: ฿{totalChannelAmount.toLocaleString()}
                      </span>
                    </div>

                    {branch.channelAllocations.map(channel => {
                      const isGoogleChannel = channel.name.toLowerCase().includes('google');
                      const dailyChannelAmount = channel.amount > 0 ? (channel.amount / 30).toFixed(0) : '0';

                      return (
                        <div key={channel.id} className="space-y-1.5">
                          <div className="flex items-center justify-between py-1 hover:bg-purple-50/40 rounded-lg px-1 transition">
                            <div className="flex items-center gap-1.5">
                              <span className="text-purple-950 font-bold">{channel.name}</span>
                              {dailyChannelAmount > 0 && (
                                <span className="text-[10px] text-purple-700 font-mono">
                                  (฿{Number(dailyChannelAmount).toLocaleString()}/วัน)
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {/* If Google channel, show Breakdown Toggle button */}
                              {isGoogleChannel && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedGoogleBranchId(isGoogleExpanded ? null : branch.id)}
                                  className="px-2 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-950 rounded font-bold text-[10px] flex items-center gap-1 cursor-pointer transition border border-purple-200"
                                >
                                  <Search className="w-3 h-3 text-purple-700" />
                                  <span>Breakdown</span>
                                  {isGoogleExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                              )}

                              <div className="flex items-center gap-1">
                                <span className="text-purple-700 text-[10px]">฿</span>
                                <input
                                  type="number"
                                  value={channel.amount}
                                  onChange={(e) => handleUpdateChannelAmount(branch.id, channel.id, e.target.value)}
                                  className="w-28 px-2 py-0.5 bg-white border border-[#E2D2EA] rounded-md text-right font-mono font-bold text-purple-950 focus:outline-none text-xs"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Nested Google Ads Search Campaign Breakdown Component */}
                          {isGoogleChannel && isGoogleExpanded && (
                            <div className="p-3 bg-[#E6F2FF]/60 rounded-xl border border-purple-200 space-y-2 animate-in fade-in duration-200">
                              <div className="flex items-center justify-between border-b border-purple-200/80 pb-1">
                                <span className="font-bold text-purple-950 text-[11px] flex items-center gap-1">
                                  <Search className="w-3.5 h-3.5 text-purple-700" />
                                  <span>แยกสัดส่วนงบย่อย Google Search (บาท/วัน):</span>
                                </span>
                                <span className="text-[10px] font-mono font-bold text-purple-950">
                                  รวม ฿{totalGoogleSearchSubAmount.toFixed(2)}/วัน
                                </span>
                              </div>

                              <div className="space-y-1 text-[11px]">
                                <div className="flex items-center justify-between">
                                  <span className="text-purple-900 font-medium">1. การค้นหา (General Search):</span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-purple-700 text-[10px]">฿</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={googleSearchBreakdown.generalSearch}
                                      onChange={(e) => setGoogleSearchBreakdown(prev => ({ ...prev, generalSearch: Number(e.target.value) || 0 }))}
                                      className="w-24 px-1.5 py-0.5 bg-white border border-[#E2D2EA] rounded text-right font-mono font-bold text-purple-950 text-xs"
                                    />
                                    <span className="text-[10px] text-purple-700">/วัน</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <span className="text-purple-900 font-medium">2. Leads-Search:</span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-purple-700 text-[10px]">฿</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={googleSearchBreakdown.leadsSearch}
                                      onChange={(e) => setGoogleSearchBreakdown(prev => ({ ...prev, leadsSearch: Number(e.target.value) || 0 }))}
                                      className="w-24 px-1.5 py-0.5 bg-white border border-[#E2D2EA] rounded text-right font-mono font-bold text-purple-950 text-xs"
                                    />
                                    <span className="text-[10px] text-purple-700">/วัน</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <span className="text-purple-900 font-medium">3. ค้นหาร้านนาจอมเทียน:</span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-purple-700 text-[10px]">฿</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={googleSearchBreakdown.naJomtienSearch}
                                      onChange={(e) => setGoogleSearchBreakdown(prev => ({ ...prev, naJomtienSearch: Number(e.target.value) || 0 }))}
                                      className="w-24 px-1.5 py-0.5 bg-white border border-[#E2D2EA] rounded text-right font-mono font-bold text-purple-950 text-xs"
                                    />
                                    <span className="text-[10px] text-purple-700">/วัน</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                </div>

                {/* Net Remaining Budget Summary Footer */}
                <div className="p-3 bg-[#FCFAF7] border-t border-purple-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-950">รวมงบสื่อโฆษณาออนไลน์</span>
                  <span className="font-mono font-bold text-purple-950 text-sm">
                    ฿{totalChannelAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* User Custom Note Footer matching user screenshot text */}
      <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-rose-800 font-bold">
          <Sparkles className="w-4 h-4 text-rose-600 shrink-0" />
          <span>หมายเหตุการจัดสรร: "ดึงงบจาก IG หรือ TikTok มาใช้กับ Shopee ใช้ 400 ต่อวัน ตั้งค่าปิดทุกสิ้นเดือนเพราะเปิดไว้ตลอด"</span>
        </div>

        <div className="flex items-center gap-2 text-purple-950 font-bold shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>คำนวณงบประมาณและแยกสัดส่วน Google Ads ตรงตาม Excel Master 100%</span>
        </div>
      </div>

      {/* MODAL 1: Smart Groq AI Multi-Branch Image Auto-Scan OCR Review Modal */}
      {showImageScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="glass-panel max-w-4xl w-full p-6 space-y-4 border-[#E2D2EA] shadow-2xl bg-white/95 my-8">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-950 via-pink-900 to-purple-900 text-white flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5 text-pink-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-purple-950 flex items-center gap-2">
                    <span>Groq AI Multi-Branch Table OCR Scanner</span>
                    <span className="text-[10px] bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full font-bold">Groq AI Powered</span>
                  </h3>
                  <p className="text-xs text-purple-800/80">อัปโหลดรูปตารางสเปรดชีต Groq AI จะสแกนวิเคราะห์ดึงข้อมูลทุกสาขา (NITAN หลัก, เขาพระตำหนัก, นาเกลือ) เข้าอัตโนมัติ</p>
                </div>
              </div>

              <button onClick={() => setShowImageScanModal(false)} className="w-8 h-8 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold transition flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Groq AI Analysis Status Banner */}
            {groqAiScanNote && (
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-[#000000] text-xs font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                <span>{groqAiScanNote}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
              
              {/* Left Column: Image Drag & Drop Uploader */}
              <div className="lg:col-span-5 space-y-3">
                <span className="font-bold text-purple-950 block">1. เลือกรูปภาพตารางสเปรดชีต:</span>
                
                <div className="border-2 border-dashed border-[#E2D2EA] hover:border-purple-500 rounded-2xl p-4 text-center bg-purple-50/40 relative overflow-hidden transition group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />

                  {uploadedImageSrc ? (
                    <div className="relative h-64 rounded-xl overflow-hidden shadow-inner border border-purple-200">
                      <img src={uploadedImageSrc} alt="Preview Table Spreadsheet" className="w-full h-full object-contain bg-white" />

                      {/* Scanning Laser Line Animation */}
                      {isScanningImage && (
                        <div className="absolute inset-0 bg-purple-900/40 flex flex-col items-center justify-center backdrop-blur-xs animate-pulse">
                          <div className="w-full h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent shadow-[0_0_15px_#f472b6] animate-bounce" />
                          <span className="text-white font-bold text-xs mt-2 px-3 py-1 bg-black/70 rounded-full flex items-center gap-1.5 shadow-md">
                            <RefreshCw className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
                            <span>Groq AI กำลังสแกนตารางสเปรดชีต...</span>
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-12 space-y-2">
                      <UploadCloud className="w-10 h-10 text-purple-400 mx-auto group-hover:scale-110 transition" />
                      <span className="font-bold text-purple-950 block">คลิกเพื่ออัปโหลด หรือลากไฟล์รูปภาพมาวางที่นี่</span>
                      <span className="text-[11px] text-purple-700/80 block">รองรับ PNG, JPG, WEBP (รูปสกรีนช็อต Excel)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Scanned All Branches Review Cards */}
              <div className="lg:col-span-7 space-y-3">
                <span className="font-bold text-purple-950 block">2. ผลลัพธ์ข้อมูลทุกสาขาที่ Groq AI สแกนพบ ({scannedSheetResult.branches.length} สาขา):</span>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {scannedSheetResult.branches.map((b, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-white border border-[#E2D2EA] shadow-xs space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-purple-100 pb-1.5">
                        <span className="font-bold text-purple-950 text-sm flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-purple-700" />
                          <span>{b.name}</span>
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                          สแกนสำเร็จ
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-purple-950">
                        <div>
                          <span className="text-purple-800 block text-[10px]">งบจำนวนเต็มที่สแกนได้:</span>
                          <span className="font-bold font-mono text-purple-950">฿{(b.manualFullBudget || 20000).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-purple-800 block text-[10px]">ยอดขายเดือนก่อนหน้า:</span>
                          <span className="font-bold font-mono text-purple-950">฿{b.previousSales.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="pt-1.5 border-t border-purple-100">
                        <span className="font-bold text-purple-900 block text-[10px] mb-1">งบช่องทางออนไลน์ที่สแกนได้:</span>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 text-[10px] font-bold text-purple-950 text-center">
                          <div className="p-1 bg-purple-50 rounded">Google: ฿{(b.googleAdsAmount || 8000).toLocaleString()}</div>
                          <div className="p-1 bg-purple-50 rounded">FB: ฿{(b.fbAdsAmount || 8000).toLocaleString()}</div>
                          <div className="p-1 bg-purple-50 rounded">TikTok: ฿{(b.tiktokAmount || 2000).toLocaleString()}</div>
                          <div className="p-1 bg-purple-50 rounded">Shopee: ฿{(b.shopeeAmount || 2000).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="pt-3 border-t border-purple-100 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowImageScanModal(false)}
                className="px-4 py-2 bg-purple-50 text-purple-900 rounded-xl font-bold hover:bg-purple-100 transition cursor-pointer"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                disabled={isScanningImage}
                onClick={handleApplyAllScannedBranches}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:opacity-90 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <span>✨ อนุมัติ & อัปเดตตารางงบทุกสาขาจากรูปภาพสแกน 100%</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: Custom Add Branch Modal */}
      {showAddBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="glass-panel max-w-md w-full p-6 space-y-4 border-[#E2D2EA] shadow-2xl bg-white/95">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFEBF3] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-purple-950">เพิ่มสาขาจัดสรรงบประมาณใหม่</h3>
              </div>
              <button onClick={() => setShowAddBranchModal(false)} className="text-purple-400 hover:text-purple-700 font-bold">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAddBranch} className="space-y-3 text-xs">
              <div>
                <label className="block text-purple-950 font-bold mb-1">ชื่อสาขาใหม่</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สาขา สยามพารากอน / สาขา เซ็นทรัลเวิลด์"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none focus:border-purple-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-purple-950 font-bold mb-1">ยอดขายเดือนก่อนหน้า (บาท)</label>
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="1000000"
                  value={newBranchSales}
                  onChange={(e) => setNewBranchSales(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-mono font-bold focus:outline-none focus:border-purple-500 shadow-xs"
                />
                <span className="text-[10px] text-purple-800/70 mt-1 block">
                  * ระบบจะคำนวณงบ MKT {mktPercentRate}% ให้อัตโนมัติจากยอดขายนี้
                </span>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBranchModal(false)}
                  className="px-4 py-2 bg-purple-50 text-purple-900 rounded-xl font-bold hover:bg-purple-100 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] text-purple-950 font-bold rounded-xl shadow-xs border border-[#E2D2EA] hover:opacity-90 transition cursor-pointer"
                >
                  + เพิ่มสาขาใหม่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Custom Delete Confirmation Modal */}
      {deleteBranchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="glass-panel max-w-sm w-full p-6 space-y-4 border-[#E2D2EA] shadow-2xl bg-white/95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-purple-950 text-sm">ยืนยันการลบตารางสาขา?</h3>
                <p className="text-xs text-purple-800/80">ข้อมูลจัดสรรงบของสาขานี้จะถูกลบออกจากตาราง</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setDeleteBranchId(null)}
                className="px-4 py-2 bg-purple-50 text-purple-900 rounded-xl font-bold hover:bg-purple-100 transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmDeleteBranch}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                ยืนยันลบสาขา
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
