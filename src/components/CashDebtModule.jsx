import React, { useState, useEffect, useMemo } from 'react';
import {
  Banknote,
  Wallet,
  Coins,
  CreditCard,
  Plus,
  Filter,
  Search,
  Calendar,
  Clock,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit3,
  Sparkles,
  Layers,
  Building2,
  X,
  FileText,
  Copy,
  Check,
  RotateCcw,
  ArrowUpDown,
  Percent,
  Calculator,
  ShieldAlert,
  Flame,
  Snowflake,
  DollarSign,
  ChevronRight,
  ArrowRight,
  Info,
  ExternalLink,
  Users,
  Briefcase
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// Cash Debt Category Configuration
export const DEBT_CATEGORIES = {
  personal_loan: {
    id: 'personal_loan',
    label: 'สินเชื่อส่วนบุคคล (Bank Loan)',
    shortLabel: 'สินเชื่อบุคคล',
    color: 'bg-blue-100 text-blue-900 border-blue-200',
    icon: Building2
  },
  cash_card: {
    id: 'cash_card',
    label: 'บัตรกดเงินสด / วงเงินหมุนเวียน (Cash Card)',
    shortLabel: 'บัตรกดเงินสด',
    color: 'bg-purple-100 text-purple-900 border-purple-200',
    icon: CreditCard
  },
  peer_director: {
    id: 'peer_director',
    label: 'ยืมบุคคล / กรรมการ / ญาติมิตร (Peer/Director)',
    shortLabel: 'ยืมบุคคล/กรรมการ',
    color: 'bg-amber-100 text-amber-900 border-amber-200',
    icon: Users
  },
  business_loan: {
    id: 'business_loan',
    label: 'สินเชื่อธุรกิจ / OD เงินเบิกเกินบัญชี (Business Loan)',
    shortLabel: 'สินเชื่อธุรกิจ/OD',
    color: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    icon: Briefcase
  },
  quick_loan: {
    id: 'quick_loan',
    label: 'เงินกู้ด่วน / อื่นๆ (Other Cash Loan)',
    shortLabel: 'เงินกู้ด่วน/อื่นๆ',
    color: 'bg-rose-100 text-rose-900 border-rose-200',
    icon: Coins
  }
};

// Debt Status Configuration
export const DEBT_STATUS_CONFIG = {
  active: {
    id: 'active',
    label: 'กำลังผ่อนชำระ',
    badge: 'bg-rose-50 text-rose-800 border-rose-300 font-bold',
    dot: 'bg-rose-500'
  },
  paid_off: {
    id: 'paid_off',
    label: 'ปิดยอดแล้ว (ชำระหมด)',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
    dot: 'bg-emerald-500'
  },
  frozen: {
    id: 'frozen',
    label: 'พักชำระหนี้',
    badge: 'bg-amber-50 text-amber-900 border-amber-300 font-bold',
    dot: 'bg-amber-500'
  },
  negotiating: {
    id: 'negotiating',
    label: 'ปรับโครงสร้างหนี้',
    badge: 'bg-indigo-50 text-indigo-900 border-indigo-300 font-bold',
    dot: 'bg-indigo-500'
  }
};

// Priority Configuration (Snowball / Avalanche focus)
export const DEBT_PRIORITY_CONFIG = {
  urgent: { id: 'urgent', label: '🔴 ด่วนที่สุด (ดอกเบี้ยสูง)', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  high: { id: 'high', label: '🟠 สำคัญสูง', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  medium: { id: 'medium', label: '🟡 ปานกลาง', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  low: { id: 'low', label: '🟢 ทั่วไป / ดอกเบี้ยต่ำ', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
};

// Default Initial Sample Cash Debts (Realistic Data)
const DEFAULT_CASH_DEBTS = [
  {
    id: 'debt-kbank-express',
    name: 'สินเชื่อเงินด่วน KBank Express Loan',
    category: 'personal_loan',
    creditorName: 'ธนาคารกสิกรไทย (KBank)',
    accountNumber: 'xxx-2-84910-x',
    originalPrincipal: 150000,
    currentBalance: 88500,
    interestRate: 18.0, // % ต่อปี
    monthlyPayment: 5400,
    dueDay: 5, // ทุกวันที่ 5
    startDate: '2025-06-05',
    status: 'active',
    priority: 'high',
    contactInfo: 'K-Contact Center 02-888-8888',
    notes: 'สินเชื่อหมุนเวียนเสริมสภาพคล่อง ตัดบัญชีอัตโนมัติทุกวันที่ 5',
    paymentHistory: [
      { id: 'pay-1', date: '2026-09-05', amount: 5400, note: 'จ่ายค่างวด ก.ย. 69' },
      { id: 'pay-2', date: '2026-08-05', amount: 10000, note: 'จ่ายค่างวด + โปะเงินต้น 4,600' }
    ]
  },
  {
    id: 'debt-scb-speedy',
    name: 'บัตรกดเงินสด SCB Speedy Cash',
    category: 'cash_card',
    creditorName: 'ธนาคารไทยพาณิชย์ (SCB)',
    accountNumber: 'xxx-4-19283-x',
    originalPrincipal: 80000,
    currentBalance: 42000,
    interestRate: 25.0, // % ต่อปี
    monthlyPayment: 3500,
    dueDay: 12,
    startDate: '2025-09-12',
    status: 'active',
    priority: 'urgent',
    contactInfo: 'SCB Call Center 02-777-7777',
    notes: 'วงเงินหมุนเวียนเบิกถอนเงินสด ดอกเบี้ยสูง 25% ควรวางแผนปิดยอดเป็นลำดับแรก (Avalanche)',
    paymentHistory: [
      { id: 'pay-3', date: '2026-09-12', amount: 3500, note: 'จ่ายขั้นต่ำ ก.ย. 69' }
    ]
  },
  {
    id: 'debt-director-loan',
    name: 'เงินกู้ยืมกรรมการเสริมสภาพคล่อง (Director Loan)',
    category: 'peer_director',
    creditorName: 'คุณกชมน (กรรมการบริษัท)',
    accountNumber: 'สัญญาเงินกู้ยืม บจก. ฉบับที่ 01/68',
    originalPrincipal: 200000,
    currentBalance: 120000,
    interestRate: 0.0, // ไม่มีดอกเบี้ย
    monthlyPayment: 10000,
    dueDay: 25,
    startDate: '2025-04-01',
    status: 'active',
    priority: 'medium',
    contactInfo: 'ฝ่ายบัญชีและการเงิน บจก.',
    notes: 'ยืมกรรมการสำรองจ่ายค่าอุปกรณ์และตกแต่งหน้าร้านสาขาบางแสน ผ่อนชำระคืนทุกสิ้นเดือน',
    paymentHistory: [
      { id: 'pay-4', date: '2026-08-25', amount: 10000, note: 'คืนเงินยืมกรรมการ ส.ค. 69' },
      { id: 'pay-5', date: '2026-09-25', amount: 10000, note: 'คืนเงินยืมกรรมการ ก.ย. 69' }
    ]
  },
  {
    id: 'debt-ktb-sme',
    name: 'สินเชื่อธุรกิจ Krungthai SME Cash',
    category: 'business_loan',
    creditorName: 'ธนาคารกรุงไทย (KTB)',
    accountNumber: 'xxx-1-99201-x',
    originalPrincipal: 300000,
    currentBalance: 215000,
    interestRate: 11.5,
    monthlyPayment: 8800,
    dueDay: 28,
    startDate: '2025-01-28',
    status: 'active',
    priority: 'medium',
    contactInfo: 'KTB SME Center 02-111-1111',
    notes: 'สินเชื่อเพื่อผู้ประกอบการ ระยะเวลา 36 งวด ผ่อนตรงเวลาทุกงวด',
    paymentHistory: []
  },
  {
    id: 'debt-firstchoice-closed',
    name: 'บัตรกดเงินสด Krungsri First Choice',
    category: 'cash_card',
    creditorName: 'กรุงศรี เฟิร์สช้อยส์',
    accountNumber: 'xxx-8-33120-x',
    originalPrincipal: 50000,
    currentBalance: 0,
    interestRate: 24.0,
    monthlyPayment: 2500,
    dueDay: 18,
    startDate: '2024-11-18',
    status: 'paid_off',
    priority: 'low',
    contactInfo: 'First Choice 02-345-6789',
    notes: 'ปิดยอดหนี้ครบสมบูรณ์แล้วเมื่อ พ.ค. 69',
    paymentHistory: [
      { id: 'pay-6', date: '2026-05-18', amount: 24500, note: 'ปิดยอดหนี้คงเหลือทั้งหมด 100%' }
    ]
  }
];

export default function CashDebtModule({ onShowSaveToast }) {
  // Navigation Tabs inside Module: 'cards' | 'table' | 'strategy' | 'schedule'
  const [activeTab, setActiveTab] = useState('cards');

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('active'); // default to 'active' or 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('balance_desc'); // 'balance_desc' | 'interest_desc' | 'due_day_asc' | 'monthly_desc' | 'name_asc'

  // Debts State with LocalStorage Persistence
  const [debts, setDebts] = useState(() => {
    const saved = localStorage.getItem('nitan_cash_debts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.warn('Error reading nitan_cash_debts:', e);
      }
    }
    return DEFAULT_CASH_DEBTS;
  });

  // Save to LocalStorage whenever debts state updates
  useEffect(() => {
    localStorage.setItem('nitan_cash_debts', JSON.stringify(debts));
  }, [debts]);

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);

  const [showPaydownModal, setShowPaydownModal] = useState(false);
  const [targetPaydownDebt, setTargetPaydownDebt] = useState(null);
  const [paydownAmount, setPaydownAmount] = useState('');
  const [paydownNote, setPaydownNote] = useState('');
  const [paydownDate, setPaydownDate] = useState(new Date().toISOString().split('T')[0]);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    category: 'personal_loan',
    creditorName: '',
    accountNumber: '',
    originalPrincipal: '',
    currentBalance: '',
    interestRate: '',
    monthlyPayment: '',
    dueDay: 5,
    startDate: new Date().toISOString().split('T')[0],
    status: 'active',
    priority: 'high',
    contactInfo: '',
    notes: ''
  });

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingDebt(null);
    setFormData({
      name: '',
      category: 'personal_loan',
      creditorName: '',
      accountNumber: '',
      originalPrincipal: '',
      currentBalance: '',
      interestRate: '',
      monthlyPayment: '',
      dueDay: 5,
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
      priority: 'high',
      contactInfo: '',
      notes: ''
    });
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (debt) => {
    setEditingDebt(debt);
    setFormData({
      name: debt.name || '',
      category: debt.category || 'personal_loan',
      creditorName: debt.creditorName || '',
      accountNumber: debt.accountNumber || '',
      originalPrincipal: debt.originalPrincipal || '',
      currentBalance: debt.currentBalance || '',
      interestRate: debt.interestRate || '',
      monthlyPayment: debt.monthlyPayment || '',
      dueDay: debt.dueDay || 5,
      startDate: debt.startDate || new Date().toISOString().split('T')[0],
      status: debt.status || 'active',
      priority: debt.priority || 'high',
      contactInfo: debt.contactInfo || '',
      notes: debt.notes || ''
    });
    setShowAddModal(true);
  };

  // Save Add / Edit
  const handleSaveDebt = (e) => {
    e.preventDefault();
    const originalPrincipal = Number(formData.originalPrincipal) || 0;
    const currentBalance = Number(formData.currentBalance) || 0;
    const interestRate = Number(formData.interestRate) || 0;
    const monthlyPayment = Number(formData.monthlyPayment) || 0;
    const dueDay = Number(formData.dueDay) || 1;

    const payload = {
      ...formData,
      originalPrincipal,
      currentBalance,
      interestRate,
      monthlyPayment,
      dueDay,
      status: currentBalance <= 0 ? 'paid_off' : formData.status
    };

    if (editingDebt) {
      setDebts(prev => prev.map(d => (d.id === editingDebt.id ? { ...d, ...payload } : d)));
      onShowSaveToast?.(`อัปเดตรายการหนี้ "${payload.name}" เรียบร้อยแล้ว`);
    } else {
      const newDebt = {
        id: `debt-${Date.now()}`,
        ...payload,
        paymentHistory: []
      };
      setDebts(prev => [newDebt, ...prev]);
      onShowSaveToast?.(`เพิ่มรายการหนี้เงินสด "${payload.name}" เรียบร้อยแล้ว`);
    }

    setShowAddModal(false);
  };

  // Delete Debt
  const handleDeleteDebt = (debtId) => {
    const target = debts.find(d => d.id === debtId);
    if (confirm(`คุณต้องการลบรายการหนี้ "${target?.name || ''}" ใช่หรือไม่?`)) {
      setDebts(prev => prev.filter(d => d.id !== debtId));
      onShowSaveToast?.('ลบรายการหนี้เรียบร้อยแล้ว');
    }
  };

  // Quick Status Toggle
  const handleUpdateStatus = (debtId, newStatus) => {
    setDebts(prev => prev.map(d => {
      if (d.id !== debtId) return d;
      return {
        ...d,
        status: newStatus,
        currentBalance: newStatus === 'paid_off' ? 0 : (d.currentBalance === 0 ? d.originalPrincipal : d.currentBalance)
      };
    }));
    onShowSaveToast?.('อัปเดตสถานะหนี้เรียบร้อยแล้ว');
  };

  // Open Paydown / Record Payment Modal
  const handleOpenPaydown = (debt) => {
    setTargetPaydownDebt(debt);
    setPaydownAmount(debt.monthlyPayment ? String(debt.monthlyPayment) : '');
    setPaydownNote(`จ่ายค่างวดประจำงวด ${new Date().toLocaleDateString('th-TH', { month: 'short', year: '2-digit' })}`);
    setPaydownDate(new Date().toISOString().split('T')[0]);
    setShowPaydownModal(true);
  };

  // Submit Paydown Payment
  const handleSubmitPaydown = (e) => {
    e.preventDefault();
    if (!targetPaydownDebt) return;
    const amount = Number(paydownAmount) || 0;
    if (amount <= 0) {
      alert('กรุณาระบุจำนวนเงินที่ถูกต้อง');
      return;
    }

    setDebts(prev => prev.map(d => {
      if (d.id !== targetPaydownDebt.id) return d;
      const newBalance = Math.max(0, (d.currentBalance || 0) - amount);
      const isPaidOff = newBalance <= 0;
      const newHistory = [
        {
          id: `pay-${Date.now()}`,
          date: paydownDate,
          amount,
          note: paydownNote || 'บันทึกชำระลดหนี้'
        },
        ...(d.paymentHistory || [])
      ];

      return {
        ...d,
        currentBalance: newBalance,
        status: isPaidOff ? 'paid_off' : d.status,
        paymentHistory: newHistory
      };
    }));

    onShowSaveToast?.(`บันทึกชำระลดหนี้ ฿${amount.toLocaleString()} สำเร็จ`);
    setShowPaydownModal(false);
  };

  // Reset to default sample debts
  const handleResetDefaults = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลหนี้เงินสดเป็นตัวอย่างเริ่มต้นหรือไม่?')) {
      setDebts(DEFAULT_CASH_DEBTS);
      localStorage.setItem('nitan_cash_debts', JSON.stringify(DEFAULT_CASH_DEBTS));
      onShowSaveToast?.('คืนค่าข้อมูลตัวอย่างหนี้เงินสดเรียบร้อยแล้ว');
    }
  };

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    let text = `💵 สรุปรายการหนี้เงินสดรวม (Cash Debt Summary) - ไม่รวมผ่อนสินค้า\n`;
    text += `วันที่สรุป: ${new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}\n\n`;
    text += `📊 ยอดหนี้คงเหลือรวม: ฿${activeTotalBalance.toLocaleString()} บาท\n`;
    text += `💳 ยอดผ่อนจ่ายต่อเดือนรวม: ฿${activeMonthlyTotal.toLocaleString()} บาท/เดือน\n`;
    text += `📑 จำนวนเจ้าหนี้คงค้าง: ${activeDebts.length} รายการ (ปิดยอดแล้ว ${paidOffDebts.length} รายการ)\n\n`;
    text += `--- รายการหนี้เงินสดคงค้าง ---\n`;

    activeDebts.forEach((d, idx) => {
      const cat = DEBT_CATEGORIES[d.category]?.label || d.category;
      text += `${idx + 1}. ${d.name} (${d.creditorName || '-'})\n`;
      text += `   • ยอดคงเหลือ: ฿${d.currentBalance?.toLocaleString()} (จากเงินต้น ฿${d.originalPrincipal?.toLocaleString()})\n`;
      text += `   • ดอกเบี้ย: ${d.interestRate}% ต่อปี | จ่ายต่องวด: ฿${d.monthlyPayment?.toLocaleString()}/ด (ตัดรอบวันที่ ${d.dueDay || '-'})\n`;
      if (d.notes) text += `   • หมายเหตุ: ${d.notes}\n`;
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    onShowSaveToast?.('คัดลอกสรุปรายการหนี้เงินสดไปยัง Clipboard แล้ว!');
  };

  // Calculations & Metrics
  const activeDebts = useMemo(() => debts.filter(d => d.status === 'active' || d.status === 'frozen' || d.status === 'negotiating'), [debts]);
  const paidOffDebts = useMemo(() => debts.filter(d => d.status === 'paid_off'), [debts]);

  const totalOriginalPrincipal = useMemo(() => debts.reduce((sum, d) => sum + (Number(d.originalPrincipal) || 0), 0), [debts]);
  const activeTotalBalance = useMemo(() => activeDebts.reduce((sum, d) => sum + (Number(d.currentBalance) || 0), 0), [activeDebts]);
  const activeMonthlyTotal = useMemo(() => activeDebts.reduce((sum, d) => sum + (Number(d.monthlyPayment) || 0), 0), [activeDebts]);

  // Weighted Average Interest Rate
  const weightedInterestRate = useMemo(() => {
    if (activeTotalBalance === 0) return 0;
    const weightedSum = activeDebts.reduce((sum, d) => sum + ((d.currentBalance || 0) * (d.interestRate || 0)), 0);
    return (weightedSum / activeTotalBalance).toFixed(2);
  }, [activeDebts, activeTotalBalance]);

  // Estimated Monthly Interest
  const estimatedMonthlyInterest = useMemo(() => {
    return activeDebts.reduce((sum, d) => {
      const annualRate = (d.interestRate || 0) / 100;
      const monthlyRate = annualRate / 12;
      return sum + ((d.currentBalance || 0) * monthlyRate);
    }, 0);
  }, [activeDebts]);

  const totalPaidOffAmount = useMemo(() => {
    return debts.reduce((sum, d) => {
      const orig = Number(d.originalPrincipal) || 0;
      const curr = Number(d.currentBalance) || 0;
      return sum + Math.max(0, orig - curr);
    }, 0);
  }, [debts]);

  const paidOffPercentage = totalOriginalPrincipal > 0
    ? Math.min(100, Math.round((totalPaidOffAmount / totalOriginalPrincipal) * 100))
    : 0;

  // Filtered & Sorted Debts
  const filteredDebts = useMemo(() => {
    return debts
      .filter(d => {
        const matchCat = selectedCategory === 'all' || d.category === selectedCategory;
        const matchStatus = selectedStatus === 'all'
          ? true
          : selectedStatus === 'active'
          ? (d.status === 'active' || d.status === 'frozen' || d.status === 'negotiating')
          : d.status === selectedStatus;

        const matchSearch = !searchQuery ||
          (d.name && d.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (d.creditorName && d.creditorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (d.accountNumber && d.accountNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (d.notes && d.notes.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchCat && matchStatus && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'balance_desc') return (b.currentBalance || 0) - (a.currentBalance || 0);
        if (sortBy === 'balance_asc') return (a.currentBalance || 0) - (b.currentBalance || 0);
        if (sortBy === 'interest_desc') return (b.interestRate || 0) - (a.interestRate || 0);
        if (sortBy === 'due_day_asc') return (a.dueDay || 0) - (b.dueDay || 0);
        if (sortBy === 'monthly_desc') return (b.monthlyPayment || 0) - (a.monthlyPayment || 0);
        if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '', 'th');
        return 0;
      });
  }, [debts, selectedCategory, selectedStatus, searchQuery, sortBy]);

  // Debt Payoff Strategies
  // 1. Avalanche: Highest Interest First (Saves the most money on interest)
  const avalancheSorted = useMemo(() => {
    return [...activeDebts].sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0));
  }, [activeDebts]);

  // 2. Snowball: Lowest Balance First (Quick psychological wins)
  const snowballSorted = useMemo(() => {
    return [...activeDebts].sort((a, b) => (a.currentBalance || 0) - (b.currentBalance || 0));
  }, [activeDebts]);

  // Group by Due Dates of Month for Schedule
  const dueDaysGroups = useMemo(() => {
    const groups = {
      early: { label: 'ต้นเดือน (วันที่ 1 - 10)', items: [], total: 0 },
      mid: { label: 'กลางเดือน (วันที่ 11 - 20)', items: [], total: 0 },
      late: { label: 'ปลายเดือน (วันที่ 21 - 31)', items: [], total: 0 }
    };

    activeDebts.forEach(d => {
      const day = d.dueDay || 1;
      const payment = d.monthlyPayment || 0;
      if (day <= 10) {
        groups.early.items.push(d);
        groups.early.total += payment;
      } else if (day <= 20) {
        groups.mid.items.push(d);
        groups.mid.total += payment;
      } else {
        groups.late.items.push(d);
        groups.late.total += payment;
      }
    });

    return groups;
  }, [activeDebts]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header Banner */}
      <div className="glass-panel p-6 border-[#E2D2EA]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFEBF3] border border-[#E2D2EA] text-xs font-bold text-purple-950">
                <Banknote className="w-3.5 h-3.5 text-purple-700" />
                <span>โมดูลแสดงรายการหนี้เงินสด (Cash Debt List Module)</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-900 border border-rose-200 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-rose-700" />
                <span>เฉพาะหนี้เงินสด • ไม่รวมยอดผ่อนสินค้า</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-purple-950 tracking-tight flex items-center gap-2">
              <span>รายการหนี้เงินสดรวม & แผนบริหารสภาพคล่อง</span>
            </h2>

            <p className="text-xs text-purple-800/80 font-medium">
              สรุปภาพรวมยอดหนี้เงินสดคงเหลือรวมทั้งหมด สินเชื่อส่วนบุคคล บัตรกดเงินสด เงินกู้ยืมกรรมการ และยอดที่ต้องผ่อนจ่ายต่องวด
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopySummary}
              className="px-3.5 py-2.5 bg-white hover:bg-purple-50 text-purple-950 font-bold rounded-xl text-xs border border-[#E2D2EA] transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="คัดลอกสรุปรายการหนี้เงินสด"
            >
              <Copy className="w-3.5 h-3.5 text-purple-700" />
              <span>คัดลอกสรุป</span>
            </button>

            <button
              onClick={handleResetDefaults}
              className="p-2.5 bg-white hover:bg-purple-50 text-purple-900 font-bold rounded-xl text-xs border border-[#E2D2EA] transition shadow-xs cursor-pointer"
              title="รีเซ็ตเป็นข้อมูลตัวอย่างเริ่มต้น"
            >
              <RotateCcw className="w-4 h-4 text-purple-600" />
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-2 cursor-pointer hover:opacity-95"
            >
              <Plus className="w-4 h-4 text-pink-300" />
              <span>+ เพิ่มรายการหนี้เงินสด</span>
            </button>
          </div>
        </div>

        {/* Top 4 KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-purple-100/60">
          
          {/* Card 1: Total Cash Debt Outstanding */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-[#FFF0F6] border border-[#E2D2EA] flex flex-col justify-between shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-purple-900 block">ยอดหนี้เงินสดคงเหลือรวม</span>
                <span className="text-2xl font-black text-rose-700 font-mono tracking-tight mt-0.5 block">
                  ฿{activeTotalBalance.toLocaleString()}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200 shrink-0">
                <Banknote className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-purple-100/50">
              <div className="flex items-center justify-between text-[11px] text-purple-800 font-medium mb-1">
                <span>ชำระคืนแล้ว {paidOffPercentage}%</span>
                <span className="font-mono text-purple-950 font-bold">฿{totalPaidOffAmount.toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-purple-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"
                  style={{ width: `${paidOffPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Total Monthly Payment */}
          <div className="p-4 rounded-2xl bg-white border border-[#E2D2EA] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-purple-900 block">ยอดผ่อนชำระรวมต่องวด</span>
              <span className="text-2xl font-black text-purple-950 font-mono tracking-tight mt-0.5 block">
                ฿{activeMonthlyTotal.toLocaleString()}
              </span>
              <span className="text-[10px] text-purple-700 font-medium block mt-1">
                ภาระที่ต้องจ่ายในแต่ละเดือน
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FFEBF3] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Interest Estimation */}
          <div className="p-4 rounded-2xl bg-white border border-[#E2D2EA] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-purple-900 block">ดอกเบี้ยเฉลี่ย (ถ่วงน้ำหนัก)</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-black text-amber-700 font-mono tracking-tight">
                  {weightedInterestRate}%
                </span>
                <span className="text-xs font-bold text-purple-800">ต่อปี</span>
              </div>
              <span className="text-[10px] text-amber-800 font-bold block mt-1">
                ~฿{Math.round(estimatedMonthlyInterest).toLocaleString()}/เดือน (ดอกเบี้ยประเมิน)
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FEF9C3] text-amber-800 flex items-center justify-center border border-amber-200">
              <Percent className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Active Creditors */}
          <div className="p-4 rounded-2xl bg-white border border-[#E2D2EA] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-purple-900 block">จำนวนรายการเจ้าหนี้เงินสด</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-purple-950 font-mono tracking-tight">
                  {activeDebts.length}
                </span>
                <span className="text-xs font-bold text-purple-800">บัญชี</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                ปิดยอดหนี้หมดแล้ว {paidOffDebts.length} บัญชี
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center border border-purple-200">
              <Layers className="w-5 h-5" />
            </div>
          </div>

        </div>
      </div>

      {/* SUB-NAVIGATION TABS BAR */}
      <div className="p-2 rounded-2xl bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] border border-[#E2D2EA] flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap ${
              activeTab === 'cards'
                ? 'bg-purple-950 text-white scale-[1.02]'
                : 'bg-white text-purple-950 hover:bg-purple-50 border border-[#E2D2EA]'
            }`}
          >
            <Wallet className="w-4 h-4 text-pink-300" />
            <span>1. การ์ดรายการหนี้ (Account Cards)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">{activeDebts.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('table')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap ${
              activeTab === 'table'
                ? 'bg-purple-950 text-white scale-[1.02]'
                : 'bg-white text-purple-950 hover:bg-purple-50 border border-[#E2D2EA]'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>2. ตารางสรุปหนี้เงินสด (Summary Table)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-950 font-mono">{debts.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('strategy')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap ${
              activeTab === 'strategy'
                ? 'bg-purple-950 text-white scale-[1.02]'
                : 'bg-white text-purple-950 hover:bg-purple-50 border border-[#E2D2EA]'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-400" />
            <span>3. กลยุทธ์ปลดหนี้ (Avalanche & Snowball)</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap ${
              activeTab === 'schedule'
                ? 'bg-purple-950 text-white scale-[1.02]'
                : 'bg-white text-purple-950 hover:bg-purple-50 border border-[#E2D2EA]'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>4. ปฏิทินรอบชำระประจำเดือน (Due Timeline)</span>
          </button>
        </div>
      </div>

      {/* FILTER & CONTROLS BAR (Used across Cards & Table) */}
      {(activeTab === 'cards' || activeTab === 'table') && (
        <div className="glass-panel p-4 border-[#E2D2EA] flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-purple-900 flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5 text-purple-700" />
              <span>กรองสถานะ:</span>
            </span>
            {[
              { id: 'active', label: 'กำลังผ่อนชำระ (Active)' },
              { id: 'all', label: 'ทั้งหมด' },
              { id: 'paid_off', label: 'ปิดยอดแล้ว' },
              { id: 'frozen', label: 'พักชำระ' }
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  selectedStatus === st.id
                    ? 'bg-purple-950 text-white shadow-xs'
                    : 'bg-white text-purple-900 border border-[#E2D2EA] hover:bg-purple-50'
                }`}
              >
                <span>{st.label}</span>
              </button>
            ))}
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อหนี้ / เจ้าหนี้..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-[#E2D2EA] rounded-xl text-xs text-purple-950 focus:outline-none focus:ring-1 focus:ring-purple-400 w-48 sm:w-56"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#E2D2EA] rounded-xl text-xs font-bold text-purple-950 focus:outline-none"
            >
              <option value="all">ทุกหมวดหมู่หนี้</option>
              {Object.values(DEBT_CATEGORIES).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.shortLabel}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#E2D2EA] rounded-xl text-xs font-bold text-purple-950 focus:outline-none"
            >
              <option value="balance_desc">เรียง: ยอดคงเหลือ มาก ➔ น้อย</option>
              <option value="balance_asc">เรียง: ยอดคงเหลือ น้อย ➔ มาก</option>
              <option value="interest_desc">เรียง: ดอกเบี้ยสูงสุด (Avalanche)</option>
              <option value="due_day_asc">เรียง: วันตัดรอบ (1-31)</option>
              <option value="monthly_desc">เรียง: ยอดจ่ายต่องวด สูงสุด</option>
            </select>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: CARDS VIEW */}
      {/* ======================================================== */}
      {activeTab === 'cards' && (
        <div className="space-y-4">
          {filteredDebts.length === 0 ? (
            <div className="glass-panel p-12 text-center border-[#E2D2EA] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFEBF3] text-purple-800 flex items-center justify-center border border-[#E2D2EA] mx-auto">
                <Banknote className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-purple-950 text-sm">ไม่พบรายการหนี้เงินสดที่ตรงกับเงื่อนไข</h3>
              <p className="text-xs text-purple-800/80 max-w-md mx-auto">
                เพิ่มรายการเงินกู้ยืม สินเชื่อเงินสด หรือบัตรกดเงินสดที่คุณต้องการติดตาม
              </p>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-purple-950 text-white font-bold rounded-xl text-xs cursor-pointer inline-flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ เพิ่มรายการหนี้เงินสด</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDebts.map(debt => {
                const isPaidOff = debt.status === 'paid_off' || debt.currentBalance === 0;
                const cat = DEBT_CATEGORIES[debt.category] || DEBT_CATEGORIES.personal_loan;
                const CatIcon = cat.icon || Building2;
                const statusInfo = DEBT_STATUS_CONFIG[debt.status] || DEBT_STATUS_CONFIG.active;

                const orig = Number(debt.originalPrincipal) || 0;
                const curr = Number(debt.currentBalance) || 0;
                const paidPercentage = orig > 0 ? Math.min(100, Math.round(((orig - curr) / orig) * 100)) : 0;

                return (
                  <div
                    key={debt.id}
                    className={`p-5 rounded-2xl border transition-all duration-200 bg-white relative flex flex-col justify-between ${
                      isPaidOff
                        ? 'border-emerald-200/80 bg-emerald-50/15'
                        : debt.priority === 'urgent'
                        ? 'border-rose-300 bg-rose-50/10 shadow-xs hover:border-rose-400'
                        : 'border-[#E2D2EA] hover:border-purple-300 hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Row: Category Pill, Priority, Status Dropdown & Action Buttons */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cat.color}`}>
                            <CatIcon className="w-3 h-3" />
                            <span>{cat.shortLabel}</span>
                          </span>

                          {debt.interestRate > 0 ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                              ดบ. {debt.interestRate}%
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              ดบ. 0%
                            </span>
                          )}
                        </div>

                        {/* Edit & Delete */}
                        <div className="flex items-center gap-1 text-purple-400">
                          <button
                            onClick={() => handleOpenEditModal(debt)}
                            className="p-1 hover:text-purple-700 hover:bg-purple-50 rounded-lg cursor-pointer transition"
                            title="แก้ไขข้อมูล"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDebt(debt.id)}
                            className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition"
                            title="ลบรายการ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Debt Title & Creditor */}
                      <div>
                        <h4 className="text-sm font-black text-purple-950 leading-tight">
                          {debt.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-purple-800/80">
                          <span className="font-semibold">{debt.creditorName || 'ไม่ระบุเจ้าหนี้'}</span>
                          {debt.accountNumber && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-[10px] text-purple-600 font-bold">{debt.accountNumber}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Outstanding Balance Box */}
                      <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100/90 space-y-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[11px] font-bold text-purple-900">ยอดคงเหลือ:</span>
                          <span className={`text-xl font-black font-mono ${isPaidOff ? 'text-emerald-700' : 'text-rose-700'}`}>
                            ฿{curr.toLocaleString()}
                          </span>
                        </div>

                        {/* Pay-down Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-purple-700 font-medium mb-1">
                            <span>เงินต้น ฿{orig.toLocaleString()}</span>
                            <span>คืนแล้ว {paidPercentage}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-purple-200/60 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 rounded-full ${
                                isPaidOff ? 'bg-emerald-500' : 'bg-gradient-to-r from-purple-600 to-pink-500'
                              }`}
                              style={{ width: `${paidPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Monthly Payment & Due Date */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="p-2.5 rounded-xl bg-white border border-[#E2D2EA]">
                          <span className="text-[10px] font-bold text-purple-800/70 block">จ่ายต่องวด (ผ่อน/ขั้นต่ำ)</span>
                          <span className="font-mono font-black text-purple-950 text-sm">
                            ฿{(debt.monthlyPayment || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-[#E2D2EA]">
                          <span className="text-[10px] font-bold text-purple-800/70 block">วันครบกำหนดชำระ</span>
                          <span className="font-mono font-bold text-purple-950 text-xs flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-purple-600" />
                            <span>ทุกวันที่ {debt.dueDay || '-'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Notes / Remarks */}
                      {debt.notes && (
                        <p className="text-[11px] text-purple-800/80 line-clamp-2 italic bg-[#FFF0F6]/40 p-2 rounded-lg border border-[#E2D2EA]/60">
                          📝 {debt.notes}
                        </p>
                      )}
                    </div>

                    {/* Card Footer: Status Switcher & Paydown Button */}
                    <div className="mt-4 pt-3 border-t border-purple-100/60 flex items-center justify-between gap-2">
                      <select
                        value={debt.status}
                        onChange={e => handleUpdateStatus(debt.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold border transition cursor-pointer focus:outline-none ${statusInfo.badge}`}
                      >
                        <option value="active">🔴 กำลังผ่อน</option>
                        <option value="paid_off">✅ ปิดยอดแล้ว</option>
                        <option value="frozen">⏸️ พักชำระ</option>
                        <option value="negotiating">🔄 ปรับโครงสร้าง</option>
                      </select>

                      {!isPaidOff && (
                        <button
                          onClick={() => handleOpenPaydown(debt)}
                          className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl text-[11px] transition flex items-center gap-1 shadow-xs cursor-pointer hover:opacity-95"
                        >
                          <Coins className="w-3 h-3" />
                          <span>บันทึกจ่ายลดหนี้</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: TABLE / LIST SUMMARY VIEW */}
      {/* ======================================================== */}
      {activeTab === 'table' && (
        <div className="glass-panel overflow-hidden border-[#E2D2EA] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] text-purple-950 font-black border-b border-[#E2D2EA]">
                  <th className="p-3.5">ชื่อรายการหนี้ / เจ้าหนี้</th>
                  <th className="p-3.5">หมวดหมู่</th>
                  <th className="p-3.5 text-right">เงินต้นเริ่มต้น</th>
                  <th className="p-3.5 text-right">ยอดคงเหลือ</th>
                  <th className="p-3.5 text-center">ดอกเบี้ย</th>
                  <th className="p-3.5 text-right">ผ่อนต่องวด</th>
                  <th className="p-3.5 text-center">วันตัดรอบ</th>
                  <th className="p-3.5 text-center">สถานะ</th>
                  <th className="p-3.5 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {filteredDebts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-purple-400 font-medium">
                      ไม่พบรายการหนี้เงินสดตามเงื่อนไขที่เลือก
                    </td>
                  </tr>
                ) : (
                  filteredDebts.map(debt => {
                    const isPaidOff = debt.status === 'paid_off' || debt.currentBalance === 0;
                    const cat = DEBT_CATEGORIES[debt.category] || DEBT_CATEGORIES.personal_loan;
                    const statusInfo = DEBT_STATUS_CONFIG[debt.status] || DEBT_STATUS_CONFIG.active;

                    return (
                      <tr
                        key={debt.id}
                        className={`transition hover:bg-purple-50/50 ${
                          isPaidOff ? 'bg-emerald-50/10' : ''
                        }`}
                      >
                        {/* Name & Creditor */}
                        <td className="p-3.5">
                          <div className="font-bold text-purple-950 text-xs">{debt.name}</div>
                          <div className="text-[10px] text-purple-700 flex items-center gap-1.5 mt-0.5">
                            <span>{debt.creditorName}</span>
                            {debt.accountNumber && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-purple-900 font-bold">{debt.accountNumber}</span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-3.5">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${cat.color}`}>
                            {cat.shortLabel}
                          </span>
                        </td>

                        {/* Original Principal */}
                        <td className="p-3.5 text-right font-mono font-bold text-purple-900/80">
                          ฿{(debt.originalPrincipal || 0).toLocaleString()}
                        </td>

                        {/* Current Balance */}
                        <td className="p-3.5 text-right font-mono font-black text-sm">
                          <span className={isPaidOff ? 'text-emerald-700' : 'text-rose-700'}>
                            ฿{(debt.currentBalance || 0).toLocaleString()}
                          </span>
                        </td>

                        {/* Interest Rate */}
                        <td className="p-3.5 text-center font-mono font-bold">
                          {debt.interestRate > 0 ? (
                            <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              {debt.interestRate}%
                            </span>
                          ) : (
                            <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              0%
                            </span>
                          )}
                        </td>

                        {/* Monthly Installment */}
                        <td className="p-3.5 text-right font-mono font-bold text-purple-950">
                          ฿{(debt.monthlyPayment || 0).toLocaleString()}
                        </td>

                        {/* Due Day */}
                        <td className="p-3.5 text-center font-mono font-bold text-purple-900">
                          วันที่ {debt.dueDay || '-'}
                        </td>

                        {/* Status Dropdown */}
                        <td className="p-3.5 text-center">
                          <select
                            value={debt.status}
                            onChange={e => handleUpdateStatus(debt.id, e.target.value)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-extrabold border cursor-pointer ${statusInfo.badge}`}
                          >
                            <option value="active">กำลังผ่อน</option>
                            <option value="paid_off">ปิดยอดแล้ว</option>
                            <option value="frozen">พักชำระ</option>
                            <option value="negotiating">ปรับโครงสร้าง</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {!isPaidOff && (
                              <button
                                onClick={() => handleOpenPaydown(debt)}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition"
                                title="บันทึกจ่ายลดหนี้"
                              >
                                <Coins className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEditModal(debt)}
                              className="p-1.5 hover:text-purple-700 hover:bg-purple-100 rounded-lg text-purple-500 transition"
                              title="แก้ไข"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDebt(debt.id)}
                              className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-purple-500 transition"
                              title="ลบ"
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
              {filteredDebts.length > 0 && (
                <tfoot>
                  <tr className="bg-[#FFEBF3]/50 font-black text-xs text-purple-950 border-t-2 border-[#E2D2EA]">
                    <td colSpan={2} className="p-3.5 font-bold">รวมยอดทั้งหมด ({filteredDebts.length} รายการ)</td>
                    <td className="p-3.5 text-right font-mono text-purple-900">
                      ฿{filteredDebts.reduce((sum, d) => sum + (d.originalPrincipal || 0), 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right font-mono text-rose-700 text-sm">
                      ฿{filteredDebts.reduce((sum, d) => sum + (d.currentBalance || 0), 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-center font-mono">{weightedInterestRate}%</td>
                    <td className="p-3.5 text-right font-mono">
                      ฿{filteredDebts.reduce((sum, d) => sum + (d.monthlyPayment || 0), 0).toLocaleString()}
                    </td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: DEBT PAYOFF STRATEGY (Avalanche vs Snowball) */}
      {/* ======================================================== */}
      {activeTab === 'strategy' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 border-[#E2D2EA] space-y-4">
            <div className="flex items-center gap-2 text-purple-950 font-bold">
              <Sparkles className="w-4 h-4 text-purple-700" />
              <h3 className="text-base font-black">เปรียบเทียบกลยุทธ์การปลดหนี้เงินสด (Debt Payoff Strategies)</h3>
            </div>
            <p className="text-xs text-purple-800/80">
              การเลือกจ่ายหนี้ตามลำดับกลยุทธ์จะช่วยให้คุณประหยัดเงินดอกเบี้ยได้หลักหมื่นถึงหลักแสนบาท หรือช่วยปิดยอดหนี้ก้อนแรกให้หมดได้เร็วขึ้น
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              
              {/* Strategy A: Avalanche Method (Highest Interest First) */}
              <div className="p-5 rounded-2xl bg-white border border-rose-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-rose-100">
                  <div className="flex items-center gap-2 text-rose-900 font-black text-sm">
                    <Flame className="w-4 h-4 text-rose-600" />
                    <span>1. กลยุทธ์ Avalanche (โปะดอกเบี้ยสูงสุดก่อน)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-900 border border-rose-200">
                    ประหยัดเงินดอกเบี้ยได้มากที่สุด
                  </span>
                </div>

                <p className="text-xs text-purple-900/80 leading-relaxed">
                  จ่ายค่างวดขั้นต่ำทุกรายการ แล้วนำเงินก้อนพิเศษทั้งหมดไป <strong>"โปะหนี้ก้อนที่มีดอกเบี้ย % สูงที่สุดก่อน"</strong> เมื่อปิดหมดแล้ว ค่อยนำเงินไปโปะหนี้ลำดับถัดไป
                </p>

                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-purple-950 block">ลำดับหนี้ที่ควรโปะก่อนตามวิธี Avalanche:</span>
                  {avalancheSorted.map((d, index) => (
                    <div key={d.id} className="p-2.5 rounded-xl bg-rose-50/40 border border-rose-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div>
                          <strong className="text-purple-950 block">{d.name}</strong>
                          <span className="text-[10px] text-purple-700 font-mono">คงเหลือ ฿{(d.currentBalance || 0).toLocaleString()}</span>
                        </div>
                      </div>
                      <span className="font-mono font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md text-xs">
                        ดบ. {d.interestRate}%/ปี
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategy B: Snowball Method (Lowest Balance First) */}
              <div className="p-5 rounded-2xl bg-white border border-blue-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-blue-100">
                  <div className="flex items-center gap-2 text-blue-900 font-black text-sm">
                    <Snowflake className="w-4 h-4 text-blue-600" />
                    <span>2. กลยุทธ์ Snowball (ปิดยอดน้อยสุดก่อน)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-200">
                    สร้างกำลังใจ ปิดบัญชีเร็วสุด
                  </span>
                </div>

                <p className="text-xs text-purple-900/80 leading-relaxed">
                  จ่ายค่างวดขั้นต่ำทุกรายการ แล้วนำเงินพิเศษไป <strong>"โปะหนี้ก้อนที่มียอดคงเหลือน้อยที่สุดให้หมดเร็วที่สุด"</strong> เพื่อลดจำนวนเจ้าหนี้ให้เร็วและสร้างความมั่นใจ
                </p>

                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-purple-950 block">ลำดับหนี้ที่ควรโปะก่อนตามวิธี Snowball:</span>
                  {snowballSorted.map((d, index) => (
                    <div key={d.id} className="p-2.5 rounded-xl bg-blue-50/40 border border-blue-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div>
                          <strong className="text-purple-950 block">{d.name}</strong>
                          <span className="text-[10px] text-purple-700 font-mono">ดบ. {d.interestRate}%/ปี</span>
                        </div>
                      </div>
                      <span className="font-mono font-black text-blue-900 bg-blue-100 px-2 py-0.5 rounded-md text-xs">
                        ฿{(d.currentBalance || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: MONTHLY PAYMENT SCHEDULE (Due Timeline) */}
      {/* ======================================================== */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 border-[#E2D2EA] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-purple-950 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-700" />
                  <span>ไทม์ไลน์รอบวันครบกำหนดชำระหนี้ในแต่ละเดือน</span>
                </h3>
                <p className="text-xs text-purple-800/80 mt-1">
                  วางแผนเตรียมเงินสดสำรองให้เพียงพอกับแต่ละช่วงของเดือน (ต้นเดือน, กลางเดือน, ปลายเดือน)
                </p>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-right">
                <span className="text-[10px] font-bold text-purple-800 block">ยอดรวมที่ต้องเตรียมต่อเดือน</span>
                <span className="text-lg font-black text-purple-950 font-mono">฿{activeMonthlyTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* 3 Phases Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              
              {/* Phase 1: 1 - 10 */}
              <div className="p-4 rounded-2xl bg-white border border-[#E2D2EA] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-purple-100">
                  <span className="font-bold text-purple-950 text-xs">{dueDaysGroups.early.label}</span>
                  <span className="font-mono font-bold text-rose-700 text-xs">฿{dueDaysGroups.early.total.toLocaleString()}</span>
                </div>
                {dueDaysGroups.early.items.length === 0 ? (
                  <p className="text-[11px] text-purple-400 py-4 text-center">ไม่มียอดตัดรอบช่วงนี้</p>
                ) : (
                  dueDaysGroups.early.items.map(d => (
                    <div key={d.id} className="p-2.5 rounded-xl bg-purple-50/40 border border-purple-100/60 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-purple-950">
                        <span>{d.name}</span>
                        <span className="font-mono text-purple-900">฿{(d.monthlyPayment || 0).toLocaleString()}</span>
                      </div>
                      <div className="text-[10px] text-purple-700 font-mono">
                        ครบกำหนดวันที่ {d.dueDay} ของทุกเดือน
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Phase 2: 11 - 20 */}
              <div className="p-4 rounded-2xl bg-white border border-[#E2D2EA] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-purple-100">
                  <span className="font-bold text-purple-950 text-xs">{dueDaysGroups.mid.label}</span>
                  <span className="font-mono font-bold text-rose-700 text-xs">฿{dueDaysGroups.mid.total.toLocaleString()}</span>
                </div>
                {dueDaysGroups.mid.items.length === 0 ? (
                  <p className="text-[11px] text-purple-400 py-4 text-center">ไม่มียอดตัดรอบช่วงนี้</p>
                ) : (
                  dueDaysGroups.mid.items.map(d => (
                    <div key={d.id} className="p-2.5 rounded-xl bg-purple-50/40 border border-purple-100/60 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-purple-950">
                        <span>{d.name}</span>
                        <span className="font-mono text-purple-900">฿{(d.monthlyPayment || 0).toLocaleString()}</span>
                      </div>
                      <div className="text-[10px] text-purple-700 font-mono">
                        ครบกำหนดวันที่ {d.dueDay} ของทุกเดือน
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Phase 3: 21 - 31 */}
              <div className="p-4 rounded-2xl bg-white border border-[#E2D2EA] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-purple-100">
                  <span className="font-bold text-purple-950 text-xs">{dueDaysGroups.late.label}</span>
                  <span className="font-mono font-bold text-rose-700 text-xs">฿{dueDaysGroups.late.total.toLocaleString()}</span>
                </div>
                {dueDaysGroups.late.items.length === 0 ? (
                  <p className="text-[11px] text-purple-400 py-4 text-center">ไม่มียอดตัดรอบช่วงนี้</p>
                ) : (
                  dueDaysGroups.late.items.map(d => (
                    <div key={d.id} className="p-2.5 rounded-xl bg-purple-50/40 border border-purple-100/60 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-purple-950">
                        <span>{d.name}</span>
                        <span className="font-mono text-purple-900">฿{(d.monthlyPayment || 0).toLocaleString()}</span>
                      </div>
                      <div className="text-[10px] text-purple-700 font-mono">
                        ครบกำหนดวันที่ {d.dueDay} ของทุกเดือน
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD / EDIT CASH DEBT MODAL */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="glass-panel max-w-xl w-full p-6 space-y-4 border-[#E2D2EA] shadow-2xl bg-white/95 my-8">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <h3 className="text-base font-bold text-purple-950 flex items-center gap-1.5">
                <Banknote className="w-5 h-5 text-purple-700" />
                <span>{editingDebt ? 'แก้ไขข้อมูลหนี้เงินสด' : 'เพิ่มรายการหนี้เงินสดใหม่'}</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-purple-400 font-bold hover:text-purple-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDebt} className="space-y-3.5 text-xs">
              {/* Name */}
              <div>
                <label className="block font-bold mb-1 text-purple-950">
                  ชื่อรายการหนี้ / สัญญาเงินกู้ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สินเชื่อเงินด่วน KBank, บัตรกดเงินสด SCB, ยืมกรรมการ..."
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-400 bg-white"
                />
              </div>

              {/* Category & Creditor Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-purple-950">หมวดหมู่หนี้เงินสด</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl font-bold bg-white"
                  >
                    {Object.values(DEBT_CATEGORIES).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-purple-950">ชื่อเจ้าหนี้ / สถาบันการเงิน</label>
                  <input
                    type="text"
                    placeholder="เช่น ธนาคารกสิกรไทย, คุณกชมน..."
                    value={formData.creditorName}
                    onChange={e => setFormData({ ...formData, creditorName: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl bg-white"
                  />
                </div>
              </div>

              {/* Original Principal & Current Balance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-purple-950">ยอดเงินต้นเริ่มต้น (บาท)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="เช่น 150000"
                    value={formData.originalPrincipal}
                    onChange={e => setFormData({ ...formData, originalPrincipal: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-purple-950">
                    ยอดหนี้คงเหลือปัจจุบัน (บาท) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    placeholder="เช่น 88500"
                    value={formData.currentBalance}
                    onChange={e => setFormData({ ...formData, currentBalance: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl bg-white font-mono font-bold text-rose-700"
                  />
                </div>
              </div>

              {/* Interest Rate & Monthly Installment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-purple-950">ดอกเบี้ย (% ต่อปี)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="เช่น 18.0"
                    value={formData.interestRate}
                    onChange={e => setFormData({ ...formData, interestRate: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-purple-950">ผ่อนชำระ/ขั้นต่ำต่องวด</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="เช่น 5400"
                    value={formData.monthlyPayment}
                    onChange={e => setFormData({ ...formData, monthlyPayment: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-purple-950">วันตัดรอบ/ชำระ (1-31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="เช่น 5"
                    value={formData.dueDay}
                    onChange={e => setFormData({ ...formData, dueDay: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl bg-white font-mono"
                  />
                </div>
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-purple-950">สถานะหนี้</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl font-bold bg-white"
                  >
                    <option value="active">🔴 กำลังผ่อนชำระ (Active)</option>
                    <option value="paid_off">✅ ปิดยอดแล้ว (Paid Off)</option>
                    <option value="frozen">⏸️ พักชำระหนี้ (Frozen)</option>
                    <option value="negotiating">🔄 ปรับโครงสร้างหนี้ (Restructuring)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-purple-950">ลำดับความสำคัญ (โปะหนี้)</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl font-bold bg-white"
                  >
                    <option value="urgent">🔴 ด่วนที่สุด (ดอกเบี้ยสูงมาก)</option>
                    <option value="high">🟠 สำคัญสูง</option>
                    <option value="medium">🟡 ปานกลาง</option>
                    <option value="low">🟢 ทั่วไป / ดอกเบี้ยต่ำ</option>
                  </select>
                </div>
              </div>

              {/* Account Number & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-purple-950">เลขที่บัญชี / เลขที่สัญญา (ถ้ามี)</label>
                  <input
                    type="text"
                    placeholder="เช่น xxx-2-84910-x"
                    value={formData.accountNumber}
                    onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-purple-950">เบอร์ติดต่อ / ช่องทางชำระ</label>
                  <input
                    type="text"
                    placeholder="เช่น Call Center 02-xxx-xxxx"
                    value={formData.contactInfo}
                    onChange={e => setFormData({ ...formData, contactInfo: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl bg-white"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold mb-1 text-purple-950">หมายเหตุเพิ่มเติม</label>
                <textarea
                  rows={2}
                  placeholder="บันทึกรายละเอียด วัตถุประสงค์ หรือเงื่อนไขการผ่อนชำระ..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl bg-white"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 flex justify-end gap-2 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-purple-50 text-purple-900 font-bold rounded-xl hover:bg-purple-100 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl hover:opacity-95 shadow-xs cursor-pointer"
                >
                  {editingDebt ? 'บันทึกการแก้ไข' : 'เพิ่มรายการหนี้'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: RECORD PAYDOWN / PAYMENT MODAL */}
      {/* ======================================================== */}
      {showPaydownModal && targetPaydownDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="glass-panel max-w-md w-full p-6 space-y-4 border-[#E2D2EA] shadow-2xl bg-white/95 my-8">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <h3 className="text-base font-bold text-purple-950 flex items-center gap-1.5">
                <Coins className="w-5 h-5 text-emerald-600" />
                <span>บันทึกการจ่ายชำระลดหนี้</span>
              </h3>
              <button
                onClick={() => setShowPaydownModal(false)}
                className="text-purple-400 font-bold hover:text-purple-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 text-xs space-y-1">
              <div className="font-bold text-purple-950">{targetPaydownDebt.name}</div>
              <div className="flex items-center justify-between text-purple-800 pt-1">
                <span>ยอดหนี้คงเหลือปัจจุบัน:</span>
                <span className="font-mono font-black text-rose-700 text-sm">
                  ฿{(targetPaydownDebt.currentBalance || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitPaydown} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-purple-950">
                  จำนวนเงินที่จ่าย (บาท) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="เช่น 5400"
                  value={paydownAmount}
                  onChange={e => setPaydownAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl bg-white font-mono font-bold text-emerald-700 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-purple-950">วันที่ชำระ</label>
                <input
                  type="date"
                  value={paydownDate}
                  onChange={e => setPaydownDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-purple-950">บันทึกช่วยจำ / รายละเอียด</label>
                <input
                  type="text"
                  placeholder="เช่น จ่ายค่างวดประจำเดือน, โปะเงินต้นเพิ่ม..."
                  value={paydownNote}
                  onChange={e => setPaydownNote(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl bg-white"
                />
              </div>

              {/* Quick payoff button if amount < balance */}
              {Number(paydownAmount) < targetPaydownDebt.currentBalance && (
                <button
                  type="button"
                  onClick={() => setPaydownAmount(String(targetPaydownDebt.currentBalance))}
                  className="w-full py-1.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 text-[11px] font-bold rounded-xl border border-purple-200 transition cursor-pointer"
                >
                  ⚡ เลือกจ่ายปิดยอดหนี้ทั้งหมด (฿{(targetPaydownDebt.currentBalance || 0).toLocaleString()})
                </button>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setShowPaydownModal(false)}
                  className="px-4 py-2 bg-purple-50 text-purple-900 font-bold rounded-xl hover:bg-purple-100 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:opacity-95 shadow-xs cursor-pointer"
                >
                  ยืนยันการจ่ายชำระ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
