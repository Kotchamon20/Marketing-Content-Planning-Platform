import React, { useState, useEffect, useMemo } from 'react';
import {
  Calculator,
  DollarSign,
  PieChart,
  TrendingUp,
  TrendingDown,
  Building2,
  Calendar,
  Filter,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Search,
  Bot,
  RefreshCw,
  X,
  FileText,
  Download,
  Printer,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Megaphone,
  ShoppingBag,
  CreditCard,
  Receipt,
  User,
  Check,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { analyzeBudgetActualWithGroqAi } from '../services/groqAiService';
import {
  fetchActualExpensesFromSupabase,
  upsertActualExpenseToSupabase,
  deleteActualExpenseFromSupabase
} from '../services/dataService';

export default function BudgetActualModule({ onShowSaveToast }) {
  // Month & Year Filter States
  const [selectedMonth, setSelectedMonth] = useState('08');
  const [selectedYear, setSelectedYear] = useState('2026');
  const currentMonthKey = `${selectedYear}-${selectedMonth}`;

  // View Mode: 'branch' | 'channel' | 'ledger'
  const [viewMode, setViewMode] = useState('branch');

  // Filter States
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // AI Modal States
  const [showAiModal, setShowAiModal] = useState(false);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiResult, setAiResult] = useState('');

  // Add/Edit Expense Modal States
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteExpenseId, setDeleteExpenseId] = useState(null);

  // Expense Form States
  const [formDateMode, setFormDateMode] = useState('month'); // 'month' (Full Month) | 'day' (Specific Date)
  const [formSelectedMonth, setFormSelectedMonth] = useState(selectedMonth);
  const [formSelectedYear, setFormSelectedYear] = useState(selectedYear);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTitle, setFormTitle] = useState('');
  const [formBranchId, setFormBranchId] = useState('hq');
  const [formChannel, setFormChannel] = useState('Facebook');
  const [formActualAmount, setFormActualAmount] = useState('');
  const [formAllocatedBudget, setFormAllocatedBudget] = useState('');
  const [formPayer, setFormPayer] = useState('');
  const [formReceiptRef, setFormReceiptRef] = useState('');
  const [formNote, setFormNote] = useState('');

  // Thai Months Dictionary
  const thaiMonthsList = [
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

  // Format Display Date Helper (Supports Full Month & Specific Date)
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '-';
    
    // Check if format is YYYY-MM (Full Month)
    if (dateStr.length === 7 && dateStr.includes('-')) {
      const [y, m] = dateStr.split('-');
      const monthObj = thaiMonthsList.find(tm => tm.value === m);
      const thaiYear = Number(y) + 543;
      const shortYear = String(thaiYear).slice(-2);
      return {
        isFullMonth: true,
        text: `ทั้งเดือน ${monthObj?.short || m} ${shortYear}`,
        fullText: `ประจำเดือน ${monthObj?.label || m} พ.ศ. ${thaiYear}`
      };
    }

    // Specific date format YYYY-MM-DD
    if (dateStr.length === 10 && dateStr.includes('-')) {
      const [y, m, d] = dateStr.split('-');
      const monthObj = thaiMonthsList.find(tm => tm.value === m);
      const thaiYear = Number(y) + 543;
      const shortYear = String(thaiYear).slice(-2);
      return {
        isFullMonth: false,
        text: `${Number(d)} ${monthObj?.short || m} ${shortYear}`,
        fullText: `${Number(d)} ${monthObj?.label || m} ${thaiYear}`
      };
    }

    return { isFullMonth: false, text: dateStr, fullText: dateStr };
  };

  // Month Quick Tabs
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

  // Standard Branches
  const standardBranches = useMemo(() => [
    { id: 'hq', name: 'สำนักงานใหญ่ (NITAN)', short: 'HQ', color: 'bg-[#FFEBF3] text-purple-950 border-[#E2D2EA]' },
    { id: 'pratamnak', name: 'สาขาเขาพระตำหนัก', short: 'เขาพระตำหนัก', color: 'bg-[#E6F2FF] text-purple-950 border-[#E2D2EA]' },
    { id: 'naklua', name: 'สาขานาเกลือ', short: 'นาเกลือ', color: 'bg-[#FEF9C3] text-purple-950 border-[#E2D2EA]' }
  ], []);

  // Standard Channels
  const channelsList = [
    'Google',
    'Facebook',
    'TikTok',
    'Instagram',
    'Shopee',
    'Lazada',
    'Grab',
    'Influencer',
    'Offline / POSM',
    'Event / Workshop',
    'Line OA',
    'อื่นๆ'
  ];

  // Initial Expenses Data from LocalStorage / Supabase
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('nitan_budget_actual_expenses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse local expenses:', e);
      }
    }
    // Default initial mock transactions for current month
    return [
      {
        id: 'exp-1',
        monthYear: '2026-08',
        date: '2026-08-05',
        title: 'ยิงแอด Google Search Ads (Keyword Brand + Leads)',
        branchId: 'hq',
        branchName: 'สำนักงานใหญ่ (NITAN)',
        channel: 'Google',
        actualAmount: 18500,
        allocatedBudget: 20000,
        payer: 'ทีม Paid Ads',
        receiptRef: 'INV-GG-20260805',
        note: 'ผลลัพธ์ CPA ต่ำกว่าเป้า อัตราคลิกดี'
      },
      {
        id: 'exp-2',
        monthYear: '2026-08',
        date: '2026-08-10',
        title: 'ยิงแอด Facebook Feed & Story โปรโมชันประจำเดือน',
        branchId: 'hq',
        branchName: 'สำนักงานใหญ่ (NITAN)',
        channel: 'Facebook',
        actualAmount: 15400,
        allocatedBudget: 15000,
        payer: 'ทีม Paid Ads',
        receiptRef: 'FB-ADS-88310',
        note: 'เพิ่มงบช่วงสุดสัปดาห์ 400 บาท'
      },
      {
        id: 'exp-3',
        monthYear: '2026-08',
        date: '2026-08-12',
        title: 'จ้าง Micro Influencer รีวิวโปรหน้าร้านเขาพระตำหนัก',
        branchId: 'pratamnak',
        branchName: 'สาขาเขาพระตำหนัก',
        channel: 'Influencer',
        actualAmount: 12000,
        allocatedBudget: 15000,
        payer: 'คุณมิว',
        receiptRef: 'REC-INF-092',
        note: 'อินฟลูส่งงานครบ 2 คน ยอดวิวรวม 45k'
      },
      {
        id: 'exp-4',
        monthYear: '2026-08',
        date: '2026-08-15',
        title: 'พิมพ์ป้ายไวนิล & สแตนดี้หน้าร้านสาขานาเกลือ',
        branchId: 'naklua',
        branchName: 'สาขานาเกลือ',
        channel: 'Offline / POSM',
        actualAmount: 4800,
        allocatedBudget: 5000,
        payer: 'ผู้จัดการสาขา',
        receiptRef: 'PRINT-PATTAYA-441',
        note: 'ติดตั้งเรียบร้อยหน้าร้าน'
      },
      {
        id: 'exp-5',
        monthYear: '2026-08',
        date: '2026-08-18',
        title: 'Shopee In-App Ads & Flash Sale Fee',
        branchId: 'hq',
        branchName: 'สำนักงานใหญ่ (NITAN)',
        channel: 'Shopee',
        actualAmount: 8900,
        allocatedBudget: 10000,
        payer: 'ทีม E-Commerce',
        receiptRef: 'SP-ADS-20260818',
        note: 'ทำยอดขายแคมเปญทะลุ ฿120,000'
      },
      {
        id: 'exp-6',
        monthYear: '2026-08',
        date: '2026-08-20',
        title: 'TikTok Video Boost แคมเปญไวรัล',
        branchId: 'pratamnak',
        branchName: 'สาขาเขาพระตำหนัก',
        channel: 'TikTok',
        actualAmount: 9500,
        allocatedBudget: 8000,
        payer: 'ทีมคอนเทนต์',
        receiptRef: 'TT-PROMOTE-7721',
        note: 'คลิปได้ผลดีมาก จึงตัดสินใจเร่งสปีดงบ'
      }
    ];
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('nitan_budget_actual_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Load from Supabase on mount
  useEffect(() => {
    async function loadData() {
      const dbExpenses = await fetchActualExpensesFromSupabase();
      if (dbExpenses && dbExpenses.length > 0) {
        const mapped = dbExpenses.map(d => ({
          id: d.id,
          monthYear: d.month_year,
          date: d.date,
          title: d.title,
          branchId: d.branch_id,
          branchName: d.branch_name,
          channel: d.channel,
          actualAmount: Number(d.actual_amount) || 0,
          allocatedBudget: Number(d.allocated_budget) || 0,
          payer: d.payer || '',
          receiptRef: d.receipt_ref || '',
          note: d.note || ''
        }));
        setExpenses(mapped);
      }
    }
    loadData();
  }, []);

  // Read Branch Budgets Allocation from Module 3 data if available
  const monthlyBudgetData = useMemo(() => {
    const saved = localStorage.getItem('nitan_monthly_budgets_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed[currentMonthKey] || [];
      } catch (e) {
        console.error('Error reading monthly budgets:', e);
      }
    }
    return [];
  }, [currentMonthKey]);

  // Filtered Expenses by Month, Branch, Channel, and Search
  const monthExpenses = useMemo(() => {
    return expenses.filter(exp => (exp.monthYear || '2026-08') === currentMonthKey);
  }, [expenses, currentMonthKey]);

  const filteredExpenses = useMemo(() => {
    return monthExpenses.filter(exp => {
      if (selectedBranch !== 'all' && exp.branchId !== selectedBranch) return false;
      if (selectedChannel !== 'all' && exp.channel !== selectedChannel) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = exp.title?.toLowerCase().includes(query);
        const matchPayer = exp.payer?.toLowerCase().includes(query);
        const matchRef = exp.receiptRef?.toLowerCase().includes(query);
        const matchNote = exp.note?.toLowerCase().includes(query);
        if (!matchTitle && !matchPayer && !matchRef && !matchNote) return false;
      }
      return true;
    });
  }, [monthExpenses, selectedBranch, selectedChannel, searchQuery]);

  // Aggregated Metrics Calculations
  // Total Allocated: Sum of allocated from Branch Allocation Module or sum of item budgets
  const branchModuleAllocatedSum = monthlyBudgetData.reduce((sum, b) => {
    const full = b.manualFullBudget || (b.previousSales * 0.02) || 0;
    return sum + full;
  }, 0);

  const fallbackAllocatedSum = monthExpenses.reduce((sum, e) => sum + (e.allocatedBudget || 0), 0);
  const totalAllocatedBudget = branchModuleAllocatedSum > 0 ? branchModuleAllocatedSum : (fallbackAllocatedSum > 0 ? fallbackAllocatedSum : 120000);

  const totalActualSpend = monthExpenses.reduce((sum, e) => sum + (e.actualAmount || 0), 0);
  const totalVariance = totalAllocatedBudget - totalActualSpend; // Positive = Underbudget (Good), Negative = Overbudget
  const utilizationPercent = totalAllocatedBudget > 0 ? Math.round((totalActualSpend / totalAllocatedBudget) * 100) : 0;
  const isOverBudget = totalActualSpend > totalAllocatedBudget;

  // Branch Breakdown
  const branchBreakdowns = useMemo(() => {
    return standardBranches.map(branch => {
      const branchExps = monthExpenses.filter(e => e.branchId === branch.id);
      const actualSpend = branchExps.reduce((sum, e) => sum + (e.actualAmount || 0), 0);
      
      const moduleBranch = monthlyBudgetData.find(b => b.id === branch.id);
      let allocated = 0;
      if (moduleBranch) {
        allocated = moduleBranch.manualFullBudget || (moduleBranch.previousSales * 0.02) || 0;
      }
      if (allocated === 0) {
        const itemAllocated = branchExps.reduce((sum, e) => sum + (e.allocatedBudget || 0), 0);
        allocated = itemAllocated > 0 ? itemAllocated : (branch.id === 'hq' ? 60000 : branch.id === 'pratamnak' ? 35000 : 25000);
      }

      const variance = allocated - actualSpend;
      const pct = allocated > 0 ? Math.round((actualSpend / allocated) * 100) : 0;

      return {
        ...branch,
        allocated,
        actualSpend,
        variance,
        utilizationPercent: pct,
        isOver: actualSpend > allocated,
        expenseCount: branchExps.length,
        note: moduleBranch?.note || ''
      };
    });
  }, [standardBranches, monthExpenses, monthlyBudgetData]);

  // Channel Breakdown
  const channelBreakdowns = useMemo(() => {
    const channelMap = {};
    channelsList.forEach(ch => {
      channelMap[ch] = { channel: ch, actualSpend: 0, allocated: 0, count: 0 };
    });

    monthExpenses.forEach(exp => {
      const ch = exp.channel || 'อื่นๆ';
      if (!channelMap[ch]) {
        channelMap[ch] = { channel: ch, actualSpend: 0, allocated: 0, count: 0 };
      }
      channelMap[ch].actualSpend += exp.actualAmount || 0;
      channelMap[ch].allocated += exp.allocatedBudget || 0;
      channelMap[ch].count += 1;
    });

    return Object.values(channelMap)
      .filter(item => item.actualSpend > 0 || item.allocated > 0)
      .map(item => {
        const variance = item.allocated - item.actualSpend;
        const pct = item.allocated > 0 ? Math.round((item.actualSpend / item.allocated) * 100) : (item.actualSpend > 0 ? 100 : 0);
        return {
          ...item,
          variance,
          utilizationPercent: pct,
          isOver: item.actualSpend > item.allocated
        };
      })
      .sort((a, b) => b.actualSpend - a.actualSpend);
  }, [monthExpenses, channelsList]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setFormDateMode('month');
    setFormSelectedMonth(selectedMonth);
    setFormSelectedYear(selectedYear);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTitle('');
    setFormBranchId(standardBranches[0]?.id || 'hq');
    setFormChannel(channelsList[0] || 'Google');
    setFormActualAmount('');
    setFormAllocatedBudget('');
    setFormPayer('');
    setFormReceiptRef('');
    setFormNote('');
    setShowExpenseModal(true);
  };

  // Open Edit Modal
  const handleStartEdit = (item) => {
    setEditingExpense(item);
    const isMonthOnly = item.date?.length === 7 || item.dateMode === 'month';
    if (isMonthOnly) {
      setFormDateMode('month');
      setFormSelectedYear(item.date?.slice(0, 4) || selectedYear);
      setFormSelectedMonth(item.date?.slice(5, 7) || selectedMonth);
      setFormDate(`${item.date}-01`);
    } else {
      setFormDateMode('day');
      setFormDate(item.date || new Date().toISOString().split('T')[0]);
      setFormSelectedYear(item.date?.slice(0, 4) || selectedYear);
      setFormSelectedMonth(item.date?.slice(5, 7) || selectedMonth);
    }

    setFormTitle(item.title || '');
    setFormBranchId(item.branchId || 'hq');
    setFormChannel(item.channel || 'Google');
    setFormActualAmount(item.actualAmount || '');
    setFormAllocatedBudget(item.allocatedBudget || '');
    setFormPayer(item.payer || '');
    setFormReceiptRef(item.receiptRef || '');
    setFormNote(item.note || '');
    setShowExpenseModal(true);
  };

  // Save Expense Handler
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const actualNum = Number(formActualAmount) || 0;
    const allocatedNum = Number(formAllocatedBudget) || actualNum;
    const branchObj = standardBranches.find(b => b.id === formBranchId) || standardBranches[0];

    const finalDate = formDateMode === 'month'
      ? `${formSelectedYear}-${formSelectedMonth}`
      : formDate;

    const finalMonthYear = formDateMode === 'month'
      ? `${formSelectedYear}-${formSelectedMonth}`
      : (formDate ? formDate.slice(0, 7) : currentMonthKey);

    const expenseItem = {
      id: editingExpense ? editingExpense.id : `exp-${Date.now()}`,
      monthYear: finalMonthYear,
      date: finalDate,
      dateMode: formDateMode,
      title: formTitle.trim(),
      branchId: formBranchId,
      branchName: branchObj.name,
      channel: formChannel,
      actualAmount: actualNum,
      allocatedBudget: allocatedNum,
      payer: formPayer.trim(),
      receiptRef: formReceiptRef.trim(),
      note: formNote.trim()
    };

    if (editingExpense) {
      setExpenses(prev => prev.map(item => item.id === editingExpense.id ? expenseItem : item));
      onShowSaveToast?.(`บันทึกการแก้ไขรายการ "${expenseItem.title}" เรียบร้อยแล้ว!`);
    } else {
      setExpenses(prev => [expenseItem, ...prev]);
      onShowSaveToast?.(`เพิ่มรายการใช้จ่ายจริง "${expenseItem.title}" เรียบร้อยแล้ว!`);
    }

    await upsertActualExpenseToSupabase(expenseItem);
    setShowExpenseModal(false);
    setEditingExpense(null);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteExpenseId) return;
    setExpenses(prev => prev.filter(e => e.id !== deleteExpenseId));
    await deleteActualExpenseFromSupabase(deleteExpenseId);
    setDeleteExpenseId(null);
    onShowSaveToast?.('ลบรายการใช้จ่ายเรียบร้อยแล้ว!');
  };

  // Run AI Advisor
  const handleRunAiAnalysis = async () => {
    setShowAiModal(true);
    setIsAnalyzingAi(true);
    setAiResult('');

    const summary = {
      monthYear: currentMonthKey,
      totalAllocated: totalAllocatedBudget,
      totalActual: totalActualSpend,
      totalVariance,
      utilizationPercent
    };

    const res = await analyzeBudgetActualWithGroqAi(summary, monthExpenses);
    setAiResult(res);
    setIsAnalyzingAi(false);
  };

  // Export CSV Handler
  const handleExportCsv = () => {
    if (filteredExpenses.length === 0) {
      alert('ไม่มีรายการสำหรับส่งออก CSV');
      return;
    }

    const headers = ['วันที่', 'ชื่อรายการ', 'สาขา', 'ช่องทาง/ประเภท', 'งบใช้จริง (บาท)', 'งบที่ตั้งไว้ (บาท)', 'ส่วนต่าง (บาท)', 'ผู้เบิกจ่าย', 'เลขที่ใบเสร็จ', 'หมายเหตุ'];
    const rows = filteredExpenses.map(e => [
      `"${e.date}"`,
      `"${e.title?.replace(/"/g, '""') || ''}"`,
      `"${e.branchName || ''}"`,
      `"${e.channel || ''}"`,
      e.actualAmount || 0,
      e.allocatedBudget || 0,
      (e.allocatedBudget || 0) - (e.actualAmount || 0),
      `"${e.payer?.replace(/"/g, '""') || ''}"`,
      `"${e.receiptRef?.replace(/"/g, '""') || ''}"`,
      `"${e.note?.replace(/"/g, '""') || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nitan-budget-actual-${currentMonthKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Top Banner & Title Panel */}
      <div className="glass-panel p-6 border-[#E2D2EA]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEBF3] border border-[#E2D2EA] text-xs font-bold text-purple-950 mb-2">
              <Calculator className="w-3.5 h-3.5 text-purple-700" />
              <span>Budget Tracking & Variance Analysis</span>
            </div>
            <h2 className="text-xl font-bold text-purple-950 tracking-tight flex items-center gap-2">
              <span>ระบบติดตามงบประมาณที่ใช้จริง เทียบกับงบจัดสรร (Budget vs Actual)</span>
            </h2>
            <p className="text-xs text-purple-800/80 font-medium mt-1">
              บันทึกและวิเคราะห์ค่าใช้จ่ายจริงรายแคมเปญ / รายสาขา / รายสื่อโฆษณา เปรียบเทียบส่วนต่าง (Variance) คุมงบประมาณไม่ให้บานปลาย
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Groq AI Advisor Button */}
            <button
              onClick={handleRunAiAnalysis}
              className="px-3.5 py-2.5 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-2 cursor-pointer hover:opacity-95"
            >
              <Bot className="w-4 h-4 text-pink-300 animate-pulse" />
              <span>Groq AI วิเคราะห์งบประมาณ</span>
            </button>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2.5 bg-white hover:bg-purple-50 text-purple-950 font-bold rounded-xl text-xs transition border border-[#E2D2EA] flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="ส่งออกรายการเป็นไฟล์ CSV / Excel"
            >
              <Download className="w-4 h-4 text-purple-700" />
              <span>Export CSV</span>
            </button>

            {/* Add Expense Button */}
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] hover:opacity-90 text-purple-950 font-bold rounded-xl text-xs transition shadow-xs border border-[#E2D2EA] flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-purple-700" />
              <span>+ บันทึกการใช้จ่ายจริง</span>
            </button>
          </div>
        </div>

        {/* Month Quick Tabs Row */}
        <div className="mt-6 pt-4 border-t border-purple-100/60 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5 shrink-0 mr-1">
            <Calendar className="w-3.5 h-3.5 text-purple-700" />
            <span>เลือกเดือน:</span>
          </span>

          {quickMonthTabs.map(tab => {
            const isTabActive = tab.month === selectedMonth && tab.year === selectedYear;
            return (
              <button
                key={`${tab.year}-${tab.month}`}
                onClick={() => {
                  setSelectedMonth(tab.month);
                  setSelectedYear(tab.year);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isTabActive
                    ? 'bg-purple-950 text-white shadow-xs scale-[1.02]'
                    : 'bg-white text-purple-900 hover:bg-purple-50 border border-[#E2D2EA]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Top 4 Summary Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Allocated Budget */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-[#E2D2EA] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">งบประมาณที่จัดสรร (Budget)</span>
            <div className="w-9 h-9 rounded-xl bg-[#F0E6F5] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-purple-950 font-mono tracking-tight">
              ฿{totalAllocatedBudget.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="mt-1 text-xs text-purple-800 font-medium">
              เป้างบการตลาดรวมประจำเดือน
            </div>
          </div>
        </div>

        {/* Card 2: Total Actual Spend */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-[#E2D2EA] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">งบที่ใช้จริง (Actual Spent)</span>
            <div className="w-9 h-9 rounded-xl bg-[#FFEBF3] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
              <CreditCard className="w-4 h-4 text-purple-700" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-purple-950 font-mono tracking-tight">
              ฿{totalActualSpend.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="mt-1 text-xs text-purple-800 font-medium flex items-center gap-1">
              <span>บันทึกแล้ว {monthExpenses.length} รายการ</span>
            </div>
          </div>
        </div>

        {/* Card 3: Budget Variance (Remaining / Over) */}
        <div className={`glass-panel p-5 relative overflow-hidden transition-all ${
          isOverBudget ? 'border-rose-300 bg-rose-50/30' : 'border-[#E2D2EA]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
              {isOverBudget ? 'งบใช้เกินเป้า (Overbudget)' : 'งบคงเหลือ (Remaining Budget)'}
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              isOverBudget ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
            }`}>
              {isOverBudget ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-bold font-mono tracking-tight ${
              isOverBudget ? 'text-rose-600' : 'text-emerald-700'
            }`}>
              {totalVariance >= 0 ? '+' : ''}฿{totalVariance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="mt-1 text-xs font-medium">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isOverBudget ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isOverBudget ? `⚠️ เกินงบที่ตั้งไว้ ${(utilizationPercent - 100)}%` : `✅ เหลือโควตาใช้จ่ายได้อีก ${(100 - utilizationPercent)}%`}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Burn Rate / % Utilization */}
        <div className="glass-panel p-5 relative overflow-hidden group hover:border-[#E2D2EA] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">อัตราการใช้งบ (% Burn Rate)</span>
            <div className="w-9 h-9 rounded-xl bg-[#E6F2FF] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
              <PieChart className="w-4 h-4 text-purple-700" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-purple-950 font-mono tracking-tight flex items-center gap-2">
              <span>{utilizationPercent}%</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                utilizationPercent > 100
                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                  : utilizationPercent >= 80
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {utilizationPercent > 100 ? 'เกิน 100%' : utilizationPercent >= 80 ? 'ใกล้เต็มเพดาน' : 'ปกติ'}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="mt-2 w-full h-2 bg-purple-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  utilizationPercent > 100 ? 'bg-rose-500' : utilizationPercent >= 80 ? 'bg-amber-500' : 'bg-gradient-to-r from-purple-700 to-pink-500'
                }`}
                style={{ width: `${Math.min(100, utilizationPercent)}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Main View Switcher & Controls */}
      <div className="glass-panel p-4 border-[#E2D2EA] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          
          {/* Sub-Tabs View Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setViewMode('branch')}
              className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                viewMode === 'branch'
                  ? 'bg-purple-950 text-white shadow-xs'
                  : 'bg-white text-purple-900 hover:bg-purple-50 border border-[#E2D2EA]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>1. เปรียบเทียบตามสาขา ({branchBreakdowns.length})</span>
            </button>

            <button
              onClick={() => setViewMode('channel')}
              className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                viewMode === 'channel'
                  ? 'bg-purple-950 text-white shadow-xs'
                  : 'bg-white text-purple-900 hover:bg-purple-50 border border-[#E2D2EA]'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>2. เปรียบเทียบตามช่องทางสื่อ ({channelBreakdowns.length})</span>
            </button>

            <button
              onClick={() => setViewMode('ledger')}
              className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                viewMode === 'ledger'
                  ? 'bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white shadow-xs'
                  : 'bg-white text-purple-900 hover:bg-purple-50 border border-[#E2D2EA]'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-pink-300" />
              <span>3. สมุดบันทึกรายจ่ายย่อย ({monthExpenses.length} รายการ)</span>
            </button>
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none text-xs"
            >
              <option value="all">🏢 ทุกสาขา</option>
              {standardBranches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none text-xs"
            >
              <option value="all">📢 ทุกช่องทาง</option>
              {channelsList.map(ch => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>

            <div className="relative">
              <input
                type="text"
                placeholder="ค้นหารายการ, ผู้เบิก..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 pr-3 py-1.5 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none text-xs w-36 sm:w-44"
              />
              <Search className="w-3.5 h-3.5 text-purple-400 absolute left-2 top-2.5" />
            </div>
          </div>

        </div>
      </div>

      {/* VIEW 1: BY BRANCH COMPARISON CARDS & TABLE */}
      {viewMode === 'branch' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {branchBreakdowns.map(branch => (
              <div
                key={branch.id}
                className="glass-panel overflow-hidden border-[#E2D2EA] flex flex-col justify-between shadow-xs hover:shadow-md transition"
              >
                <div>
                  {/* Card Header */}
                  <div className={`p-4 border-b flex items-center justify-between ${branch.color}`}>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-700" />
                      <div>
                        <h3 className="font-bold text-sm text-purple-950">{branch.name}</h3>
                        <span className="text-[10px] text-purple-800 font-medium block">
                          บันทึกใช้จ่ายแล้ว {branch.expenseCount} รายการ
                        </span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      branch.isOver
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {branch.isOver ? 'เกินงบ' : 'คุมงบได้ดี'}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-purple-50/50 rounded-xl border border-purple-100">
                      <span className="text-purple-900 font-medium">งบจัดสรร (Budget):</span>
                      <span className="font-mono font-bold text-purple-950">
                        ฿{branch.allocated.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-purple-50/50 rounded-xl border border-purple-100">
                      <span className="text-purple-900 font-medium">งบใช้จริง (Actual Spent):</span>
                      <span className="font-mono font-bold text-purple-950">
                        ฿{branch.actualSpend.toLocaleString()}
                      </span>
                    </div>

                    <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
                      branch.isOver ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
                    }`}>
                      <span className={`font-bold ${branch.isOver ? 'text-rose-900' : 'text-emerald-900'}`}>
                        {branch.isOver ? 'ส่วนต่างเกินงบ:' : 'งบคงเหลือ:'}
                      </span>
                      <span className={`font-mono font-black text-sm ${branch.isOver ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {branch.variance >= 0 ? '+' : ''}฿{branch.variance.toLocaleString()}
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-purple-900">
                        <span>สัดส่วนการใช้งบ</span>
                        <span className={branch.isOver ? 'text-rose-600' : 'text-purple-950'}>
                          {branch.utilizationPercent}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            branch.isOver ? 'bg-rose-500' : branch.utilizationPercent >= 80 ? 'bg-amber-500' : 'bg-purple-700'
                          }`}
                          style={{ width: `${Math.min(100, branch.utilizationPercent)}%` }}
                        />
                      </div>
                    </div>

                    {/* Branch Note */}
                    {branch.note && (
                      <div className="p-2 bg-[#FCFAF7] rounded-lg border border-purple-100 text-[11px] text-purple-900 italic">
                        📝 หมายเหตุสาขา: {branch.note}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-[#FCFAF7] border-t border-purple-100 flex items-center justify-end text-xs">
                  <button
                    onClick={() => {
                      setSelectedBranch(branch.id);
                      setViewMode('ledger');
                    }}
                    className="text-purple-700 hover:text-purple-950 font-bold flex items-center gap-1 cursor-pointer transition"
                  >
                    <span>ดูรายการใช้จ่ายสาขานี้</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: BY CHANNEL BREAKDOWN TABLE */}
      {viewMode === 'channel' && (
        <div className="glass-panel p-6 space-y-4 border-[#E2D2EA]">
          <div className="flex items-center justify-between pb-3 border-b border-purple-100/60">
            <div>
              <h3 className="font-bold text-purple-950 text-base flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-purple-600" />
                <span>ตารางเปรียบเทียบงบประมาณตามช่องทางสื่อ & ประเภทค่าใช้จ่าย (By Media Channel)</span>
              </h3>
              <p className="text-xs text-purple-800/80 font-medium mt-0.5">
                ติดตามประสิทธิภาพและคุมงบโฆษณาแยกราย Platform (Google, Meta, TikTok, Shopee, Influencer, POSM)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-purple-100/80 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FCFAF7] border-b border-purple-100 text-purple-900 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">ช่องทาง / สื่อโฆษณา</th>
                  <th className="py-3.5 px-4 text-right">งบประมาณที่ตั้งไว้ (Budget)</th>
                  <th className="py-3.5 px-4 text-right bg-pink-50/50 text-pink-950 font-black">งบใช้จริง (Actual Spent)</th>
                  <th className="py-3.5 px-4 text-right">ส่วนต่าง (Variance)</th>
                  <th className="py-3.5 px-4 text-center">% การใช้งบ</th>
                  <th className="py-3.5 px-4 text-center">จำนวนรายการ</th>
                  <th className="py-3.5 px-4 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 text-purple-950 font-medium">
                {channelBreakdowns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-purple-400 font-bold">
                      ยังไม่มีข้อมูลการใช้จ่ายในเดือนนี้ สามารถคลิก "+ บันทึกการใช้จ่ายจริง" เพื่อเริ่มต้น
                    </td>
                  </tr>
                ) : (
                  channelBreakdowns.map(item => (
                    <tr key={item.channel} className="hover:bg-purple-50/40 transition">
                      <td className="py-3.5 px-4 font-bold text-purple-950 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-600" />
                        <span>{item.channel}</span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-purple-900">
                        ฿{item.allocated.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-black text-pink-950 bg-pink-50/30">
                        ฿{item.actualSpend.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        <span className={item.isOver ? 'text-rose-600' : 'text-emerald-700'}>
                          {item.variance >= 0 ? '+' : ''}฿{item.variance.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                          item.isOver
                            ? 'bg-rose-100 text-rose-800 font-black'
                            : item.utilizationPercent >= 80
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-900'
                        }`}>
                          {item.utilizationPercent}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono">
                        {item.count} รายการ
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {item.isOver ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>เกินงบ</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>ตามแผน</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: DETAILED EXPENSE LEDGER TRANSACTIONS TABLE */}
      {viewMode === 'ledger' && (
        <div className="glass-panel p-6 space-y-4 border-[#E2D2EA]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-purple-100/60">
            <div>
              <h3 className="font-bold text-purple-950 text-base flex items-center gap-2">
                <Receipt className="w-4 h-4 text-purple-600" />
                <span>สมุดบันทึกรายการใช้จ่ายจริง (Detailed Expense Ledger)</span>
              </h3>
              <p className="text-xs text-purple-800/80 font-medium mt-0.5">
                บันทึกประวัติค่าใช้จ่าย ใบเสร็จ ผู้เบิกจ่าย และหมายเหตุ สามารถเพิ่ม แก้ไข และลบได้ทุกรายการ
              </p>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5 text-pink-300" />
              <span>+ เพิ่มรายการใหม่</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-purple-100/80 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FCFAF7] border-b border-purple-100 text-purple-900 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">วันที่จ่าย</th>
                  <th className="py-3.5 px-4">ชื่อรายการ / แคมเปญ</th>
                  <th className="py-3.5 px-4">สาขา</th>
                  <th className="py-3.5 px-4">ช่องทาง</th>
                  <th className="py-3.5 px-4 text-right bg-pink-50/50 text-pink-950 font-black">งบใช้จริง (บาท)</th>
                  <th className="py-3.5 px-4 text-right">งบตั้งไว้ (บาท)</th>
                  <th className="py-3.5 px-4 text-right">ส่วนต่าง</th>
                  <th className="py-3.5 px-4 text-left">ผู้เบิก / เลขที่ Ref</th>
                  <th className="py-3.5 px-4 text-left">หมายเหตุ (Note)</th>
                  <th className="py-3.5 px-4 text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 text-purple-950 font-medium">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-xs text-purple-400 font-bold">
                      {searchQuery || selectedBranch !== 'all' || selectedChannel !== 'all'
                        ? 'ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา'
                        : 'ยังไม่มีรายการใช้จ่ายในเดือนนี้ คลิกปุ่ม "+ บันทึกการใช้จ่ายจริง" ด้านบนเพื่อเริ่มบันทึก'}
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map(exp => {
                    const variance = (exp.allocatedBudget || 0) - (exp.actualAmount || 0);
                    const isOver = (exp.actualAmount || 0) > (exp.allocatedBudget || 0);
                    const dateFormatted = formatDisplayDate(exp.date);

                    return (
                      <tr key={exp.id} className="hover:bg-purple-50/40 transition">
                        <td className="py-3.5 px-4 font-mono text-purple-900 whitespace-nowrap">
                          {dateFormatted.isFullMonth ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFEBF3] text-purple-950 border border-[#E2D2EA]" title={dateFormatted.fullText}>
                              <Calendar className="w-3 h-3 text-purple-700" />
                              <span>{dateFormatted.text}</span>
                            </span>
                          ) : (
                            <span className="font-bold text-purple-950">
                              {dateFormatted.text}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-purple-950">
                          {exp.title}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFEBF3] text-purple-950 border border-[#E2D2EA]">
                            {exp.branchName || 'สำนักงานใหญ่'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-purple-900 border border-[#E2D2EA]">
                            {exp.channel}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-black text-pink-950 bg-pink-50/30 whitespace-nowrap">
                          ฿{(exp.actualAmount || 0).toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-purple-900 whitespace-nowrap">
                          ฿{(exp.allocatedBudget || 0).toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap">
                          <span className={isOver ? 'text-rose-600' : 'text-emerald-700'}>
                            {variance >= 0 ? '+' : ''}฿{variance.toLocaleString()}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-purple-900 text-[11px]">
                          <div>{exp.payer || '-'}</div>
                          {exp.receiptRef && (
                            <span className="text-[10px] text-purple-700/80 font-mono">Ref: {exp.receiptRef}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-left">
                          {exp.note ? (
                            <span className="text-[11px] text-purple-950 font-normal bg-purple-50/70 px-2 py-0.5 rounded-lg border border-purple-100 block max-w-xs truncate" title={exp.note}>
                              {exp.note}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic text-[11px]">-</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleStartEdit(exp)}
                              className="p-1 text-purple-600 hover:bg-purple-100 rounded-md transition cursor-pointer"
                              title="แก้ไขรายการ"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteExpenseId(exp.id)}
                              className="p-1 text-rose-500 hover:bg-rose-100 rounded-md transition cursor-pointer"
                              title="ลบรายการ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Add / Edit Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#12072B]/60 backdrop-blur-md p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="glass-panel max-w-md w-full p-6 space-y-4 border border-[#E2D2EA] my-8 shadow-2xl bg-white/98 rounded-3xl">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <h3 className="text-base font-bold text-purple-950 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-purple-600" />
                <span>{editingExpense ? 'แก้ไขรายการใช้จ่ายจริง' : 'บันทึกรายการใช้จ่ายจริง (New Expense)'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowExpenseModal(false)}
                className="text-purple-400 hover:text-purple-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
              
              {/* Date Selection: Full Month vs Specific Day Toggle */}
              <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-purple-950 font-bold text-[11px]">
                    ช่วงเวลา / วันที่เกิดค่าใช้จ่าย *
                  </label>

                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-[#E2D2EA]">
                    <button
                      type="button"
                      onClick={() => setFormDateMode('month')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                        formDateMode === 'month'
                          ? 'bg-purple-950 text-white shadow-xs'
                          : 'text-purple-900 hover:bg-purple-50'
                      }`}
                    >
                      <Calendar className="w-3 h-3" />
                      <span>เลือกเป็นเดือนเต็ม</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormDateMode('day')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                        formDateMode === 'day'
                          ? 'bg-purple-950 text-white shadow-xs'
                          : 'text-purple-900 hover:bg-purple-50'
                      }`}
                    >
                      <span>ระบุวันเจาะจง</span>
                    </button>
                  </div>
                </div>

                {formDateMode === 'month' ? (
                  <div className="space-y-1.5 animate-in fade-in duration-150">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-purple-800 text-[10px] font-medium mb-0.5">ประจำเดือน</label>
                        <select
                          value={formSelectedMonth}
                          onChange={(e) => setFormSelectedMonth(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-bold focus:outline-none text-xs"
                        >
                          {thaiMonthsList.map(m => (
                            <option key={m.value} value={m.value}>{m.label} ({m.short})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-purple-800 text-[10px] font-medium mb-0.5">ปี (ค.ศ. / พ.ศ.)</label>
                        <select
                          value={formSelectedYear}
                          onChange={(e) => setFormSelectedYear(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-bold focus:outline-none text-xs font-mono"
                        >
                          <option value="2025">2025 / 2568</option>
                          <option value="2026">2026 / 2569</option>
                          <option value="2027">2027 / 2570</option>
                        </select>
                      </div>
                    </div>

                    <div className="text-[11px] text-purple-900 font-bold flex items-center gap-1.5 pt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>
                        บันทึกเป็น: <strong>{formatDisplayDate(`${formSelectedYear}-${formSelectedMonth}`).fullText}</strong>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 animate-in fade-in duration-150">
                    <label className="block text-purple-800 text-[10px] font-medium mb-0.5">เลือกวันที่ระบุชัดเจน</label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-purple-950 font-bold mb-1">ชื่อรายการค่าใช้จ่าย / แคมเปญ *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ยิงแอด Facebook Feed ปลายเดือน, จ้างอินฟลู TikTok..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-950 font-bold mb-1">สาขา</label>
                  <select
                    value={formBranchId}
                    onChange={(e) => setFormBranchId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none text-xs"
                  >
                    {standardBranches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-purple-950 font-bold mb-1">ช่องทาง / ประเภท</label>
                  <select
                    value={formChannel}
                    onChange={(e) => setFormChannel(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none text-xs"
                  >
                    {channelsList.map(ch => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-950 font-bold mb-1">ยอดเงินใช้จริง (บาท) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="0.01"
                    placeholder="เช่น 15000"
                    value={formActualAmount}
                    onChange={(e) => setFormActualAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-pink-50/60 border border-pink-200 rounded-xl text-purple-950 font-bold font-mono focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-purple-950 font-bold mb-1">งบที่ตั้งไว้สำหรับรายการนี้ (บาท)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="เช่น 20000"
                    value={formAllocatedBudget}
                    onChange={(e) => setFormAllocatedBudget(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium font-mono focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-950 font-bold mb-1">ผู้เบิกจ่าย / รับผิดชอบ</label>
                  <input
                    type="text"
                    placeholder="เช่น ทีม Paid Ads, คุณมิว"
                    value={formPayer}
                    onChange={(e) => setFormPayer(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-purple-950 font-bold mb-1">เลขที่ใบเสร็จ / Ref ID</label>
                  <input
                    type="text"
                    placeholder="เช่น INV-2026-081"
                    value={formReceiptRef}
                    onChange={(e) => setFormReceiptRef(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-950 font-bold mb-1">บันทึกหมายเหตุ (Note)</label>
                <textarea
                  rows={2}
                  placeholder="ระบุรายละเอียดเพิ่มเติม หรือเหตุผลการใช้งบ..."
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none text-xs resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 bg-purple-50 text-purple-900 rounded-xl font-bold hover:bg-purple-100 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  {editingExpense ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Groq AI Budget Variance Advisor Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#12072B]/60 backdrop-blur-md p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="glass-panel max-w-2xl w-full p-6 space-y-4 border border-[#E2D2EA] shadow-2xl bg-white/98 rounded-3xl my-8">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFEBF3] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <Bot className="w-4 h-4 text-purple-700" />
                </div>
                <h3 className="text-base font-bold text-purple-950">
                  Groq AI วิเคราะห์ผลการใช้งบประมาณจริงเทียบงบจัดสรร (Budget vs Actual)
                </h3>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-purple-400 hover:text-purple-700 font-bold cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {isAnalyzingAi ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-purple-950">Groq AI กำลังคำนวณส่วนต่างงบประมาณ และเตรียมข้อเสนอแนะการคุมงบ...</p>
              </div>
            ) : (
              <div className="prose prose-purple max-w-none text-xs leading-relaxed space-y-3 max-h-96 overflow-y-auto pr-1">
                <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 whitespace-pre-wrap font-sans text-purple-950">
                  {aiResult}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-purple-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-5 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs transition shadow-md cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Confirm Delete Expense Modal */}
      {deleteExpenseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="glass-panel max-w-sm w-full p-6 space-y-4 border-[#E2D2EA] shadow-2xl bg-white/95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-purple-950 text-sm">ยืนยันการลบรายการใช้จ่ายนี้?</h3>
                <p className="text-xs text-purple-800/80">ยอดใช้จ่ายและหลักฐานของรายการนี้จะถูกลบออกจากระบบ</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setDeleteExpenseId(null)}
                className="px-4 py-2 bg-purple-50 text-purple-900 rounded-xl font-bold hover:bg-purple-100 transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                ยืนยันลบรายการ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
