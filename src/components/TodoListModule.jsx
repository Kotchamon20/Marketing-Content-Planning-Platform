import React, { useState, useEffect } from 'react';
import { fetchTodoFollowupsFromSupabase, saveTodoFollowupToSupabase, deleteTodoFollowupFromSupabase } from '../services/dataService';
import {
  CheckSquare,
  Plus,
  Filter,
  Search,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit3,
  PenLine,
  Tag,
  Send,
  Sparkles,
  Layers,
  Building2,
  X,
  Flag,
  ListTodo,
  TrendingUp,
  LayoutGrid,
  List,
  FileCheck,
  BellRing,
  ExternalLink,
  Copy,
  Check,
  CheckCheck,
  PauseCircle,
  FolderCheck,
  FileText,
  ArrowUpDown,
  GripVertical,
  Megaphone,
  Utensils,
  Settings,
  ListChecks,
  RotateCcw,
  FolderPlus
} from 'lucide-react';
import LineFlexModal from './LineFlexModal';

// Default Groups matching user mockup
const DEFAULT_CHECKLIST_GROUPS = [
  {
    id: 'grp-branding',
    title: 'ด้านแบรนด์ดิ้งและการตลาด (Branding & Marketing)',
    icon: 'Megaphone',
    color: 'purple'
  },
  {
    id: 'grp-menu',
    title: 'ด้านเมนูอาหารและเครื่องดื่ม (Menu & Food)',
    icon: 'Utensils',
    color: 'purple'
  },
  {
    id: 'grp-operations',
    title: 'ด้านระบบและการปฏิบัติการ (System & Operations)',
    icon: 'Settings',
    color: 'purple'
  }
];

// Default Items matching user mockup screenshot
const DEFAULT_CHECKLIST_ITEMS = [
  {
    id: 'chk-1',
    groupId: 'grp-branding',
    title: 'ลิงก์ Google Drive รวบรวม Brand Identity (โลโก้, Mood & Tone, มินิแบรนด์ไกด์ไลน์ และข้อกำหนดการจัดวาง)',
    completed: true,
    branch: 'สาขาบางแสน',
    link: '',
    assignedTo: 'ทีมการตลาด (สนง.ใหญ่)',
    notes: 'รวมทั้งโลโก้ Mood & Tone และคู่มือแบรนด์ไกด์ไลน์'
  },
  {
    id: 'chk-2',
    groupId: 'grp-branding',
    title: 'แผนการตลาดภาพรวม (Master Plan) สำหรับสาขาบางแสนแบบละเอียด รวมถึงไทม์ไลน์การลงคอนเทนต์',
    completed: true,
    branch: 'สาขาบางแสน',
    link: '',
    assignedTo: 'ทีมการตลาด (สนง.ใหญ่)',
    notes: 'แผนเปิดตัวและไทม์ไลน์คอนเทนต์ 30 วันแรก'
  },
  {
    id: 'chk-3',
    groupId: 'grp-branding',
    title: 'ไฟล์วิดีโอรวมภาพนิ่ง เมนู และโรงคั่ว สำหรับนำไปเปิดแสดงบนจอทีวีภายในร้าน',
    completed: true,
    branch: 'สาขาบางแสน',
    link: '',
    assignedTo: 'ทีมมีเดีย / ตัดต่อ',
    notes: 'ความละเอียด Full HD สำหรับจอหน้าร้าน'
  },
  {
    id: 'chk-4',
    groupId: 'grp-branding',
    title: 'รูปแบบอาร์ตเวิร์กสำหรับป้ายโปรโมทหน้าโครงการ (ส่งให้สาขาตัดสินใจเลือกแบบ)',
    completed: true,
    branch: 'สาขาบางแสน',
    link: '',
    assignedTo: 'ทีมกราฟิก',
    notes: 'แบบป้าย Standee & X-Frame หน้าร้าน'
  },
  {
    id: 'chk-5',
    groupId: 'grp-branding',
    title: 'ลิสต์รายชื่ออินฟลูเอนเซอร์ (รวมถึง Micro-influencer) ที่สำนักงานใหญ่คัดกรองไว้ให้สาขาเลือกเชิญ',
    completed: true,
    branch: 'สาขาบางแสน',
    link: '',
    assignedTo: 'ทีม PR / การตลาด',
    notes: 'อินฟลูเอนเซอร์สายคาเฟ่โซนชลบุรี-บางแสน'
  },
  {
    id: 'chk-6',
    groupId: 'grp-menu',
    title: 'ไฟล์เมนูออนไลน์รูปแบบเดียวกับที่ใช้ในสาขาใหญ่',
    completed: true,
    branch: 'สาขาบางแสน',
    link: '',
    assignedTo: 'ทีมกราฟิก / สนง.ใหญ่',
    notes: 'QR Code & Digital Menu'
  },
  {
    id: 'chk-7',
    groupId: 'grp-menu',
    title: 'ไฟล์อาร์ตเวิร์กสำหรับผลิตเล่มเมนู (รอสาขาแทรกเมนู Signature ประจำสาขา)',
    completed: true,
    branch: 'สาขาบางแสน',
    link: '',
    assignedTo: 'ทีมกราฟิก',
    notes: 'เล่มเมนูหลัก A4 + Insert เมนูประจำสาขา'
  },
  {
    id: 'chk-8',
    groupId: 'grp-operations',
    title: 'สื่อและข้อมูลแนะนำขั้นตอนการสมัครระบบสมาชิก (CRM)',
    completed: true,
    branch: 'สาขาบางแสน',
    link: '',
    assignedTo: 'ทีม IT / CRM',
    notes: 'ป้ายตั้งโต๊ะสะสมแต้ม LINE Official'
  },
  {
    id: 'chk-9',
    groupId: 'grp-operations',
    title: 'รายละเอียดและรูปแบบการจัดโปรโมชั่นในช่วงเปิดร้าน',
    completed: true,
    branch: 'สาขาบางแสน',
    link: '',
    assignedTo: 'ทีมการตลาด (สนง.ใหญ่)',
    notes: 'โปรโมชั่น Grand Opening 1 แถม 1 & ส่วนลดพิเศษ'
  }
];

export default function TodoListModule({
  users = [],
  onTriggerNotification,
  onShowSaveToast
}) {
  // Main Section Sub-Tab State: 'tasks' | 'followup' | 'files' | 'checklist'
  const [activeSection, setActiveSection] = useState('tasks');

  // View Mode State for Tasks: 'card' (default) | 'list'
  const [viewMode, setViewMode] = useState('card');

  // View Mode & Sorting State for Follow-up: 'list' (default) | 'card'
  const [followupViewMode, setFollowupViewMode] = useState('list');
  const [followupSortBy, setFollowupSortBy] = useState('status'); // 'status' | 'custom' | 'date_desc' | 'date_asc' | 'title'

  // Drag & Drop State for Follow-Up
  const [draggedFollowupId, setDraggedFollowupId] = useState(null);
  const [dragOverFollowupId, setDragOverFollowupId] = useState(null);

  // 1. Tasks State with localStorage Persistence
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('nitan_todo_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [followupItems, setFollowupItems] = useState([]);

  // Fetch Follow-ups from DB on mount
  useEffect(() => {
    const loadFollowups = async () => {
      const data = await fetchTodoFollowupsFromSupabase();
      setFollowupItems(data);
    };
    loadFollowups();
  }, []);

  // 3. File Submission Tracker State
  const [fileTrackers, setFileTrackers] = useState(() => {
    const saved = localStorage.getItem('nitan_todo_files');
    return saved ? JSON.parse(saved) : [];
  });

  // 4. Checklist & Groups State with localStorage Persistence
  const [checklistGroups, setChecklistGroups] = useState(() => {
    const saved = localStorage.getItem('nitan_todo_checklist_groups');
    return saved ? JSON.parse(saved) : DEFAULT_CHECKLIST_GROUPS;
  });

  const [checklists, setChecklists] = useState(() => {
    const saved = localStorage.getItem('nitan_todo_checklists');
    return saved ? JSON.parse(saved) : DEFAULT_CHECKLIST_ITEMS;
  });

  // Checklist Branch & Filter State
  const [selectedChecklistBranch, setSelectedChecklistBranch] = useState('สาขาบางแสน');
  const [selectedChecklistGroup, setSelectedChecklistGroup] = useState('all');
  const [selectedChecklistStatus, setSelectedChecklistStatus] = useState('all'); // 'all' | 'pending' | 'completed'

  React.useEffect(() => {
    localStorage.setItem('nitan_todo_tasks', JSON.stringify(tasks));
    localStorage.setItem('nitan_todo_files', JSON.stringify(fileTrackers));
    localStorage.setItem('nitan_todo_checklist_groups', JSON.stringify(checklistGroups));
    localStorage.setItem('nitan_todo_checklists', JSON.stringify(checklists));
  }, [tasks, fileTrackers, checklistGroups, checklists]);

  // Filters State
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedFollowupStatus, setSelectedFollowupStatus] = useState('all');
  const [selectedFileStatus, setSelectedFileStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals State
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddFollowupModal, setShowAddFollowupModal] = useState(false);
  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [showAddChecklistModal, setShowAddChecklistModal] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);

  const [editingTask, setEditingTask] = useState(null);
  const [editingFollowup, setEditingFollowup] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [editingChecklist, setEditingChecklist] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);

  const [lineModalItem, setLineModalItem] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Form States
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    category: 'Promotion Plan',
    priority: 'high',
    status: 'pending',
    assignedTo: 'ทีมการตลาด',
    dueDate: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [followupFormData, setFollowupFormData] = useState({
    title: '',
    targetPerson: '',
    status: 'following',
    notes: ''
  });

  const [fileFormData, setFileFormData] = useState({
    fileName: '',
    fileType: 'ภาพกราฟิก AI/PSD',
    assignedCreator: 'คุณเจนนี่ (Content Creator)',
    driveUrl: '',
    deliveryStatus: 'not_submitted',
    remarks: ''
  });

  const [checklistFormData, setChecklistFormData] = useState({
    title: '',
    groupId: DEFAULT_CHECKLIST_GROUPS[0]?.id || 'grp-branding',
    branch: 'สาขาบางแสน',
    assignedTo: 'ทีมการตลาด (สนง.ใหญ่)',
    link: '',
    dueDate: '',
    notes: '',
    completed: false
  });

  const [groupFormData, setGroupFormData] = useState({
    title: '',
    icon: 'Megaphone',
    color: 'purple'
  });

  // --- Handlers for 1. To-Do Tasks ---
  const handleOpenAddTask = () => {
    setEditingTask(null);
    setTaskFormData({
      title: '',
      category: 'Promotion Plan',
      priority: 'high',
      status: 'pending',
      assignedTo: 'ทีมการตลาด',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      description: ''
    });
    setShowAddTaskModal(true);
  };

  const handleOpenEditTask = (task) => {
    setEditingTask(task);
    setTaskFormData({
      title: task.title,
      category: task.category,
      priority: task.priority || 'high',
      status: task.status || (task.completed ? 'completed' : 'pending'),
      assignedTo: task.assignedTo || 'ทีมการตลาด',
      dueDate: task.dueDate || new Date().toISOString().split('T')[0],
      description: task.description || ''
    });
    setShowAddTaskModal(true);
  };

  const handleSaveTask = (e) => {
    e.preventDefault();
    const isCompleted = taskFormData.status === 'completed';
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? {
        ...t,
        ...taskFormData,
        completed: isCompleted
      } : t));
    } else {
      setTasks(prev => [{
        id: `task-${Date.now()}`,
        ...taskFormData,
        completed: isCompleted
      }, ...prev]);
    }
    setShowAddTaskModal(false);
    onShowSaveToast?.('บันทึกข้อมูลงาน To-Do เรียบร้อยแล้ว!');
  };

  const handleToggleTaskCompleted = (taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const nextCompleted = !t.completed;
      return {
        ...t,
        completed: nextCompleted,
        status: nextCompleted ? 'completed' : 'pending'
      };
    }));
    onShowSaveToast?.('อัปเดตสถานะงานเรียบร้อยแล้ว!');
  };

  const handleDeleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    onShowSaveToast?.('ลบรายการงานเรียบร้อยแล้ว!');
  };

  // --- Handlers for 2. Follow-Up Watchlist ---
  const handleOpenAddFollowup = () => {
    setEditingFollowup(null);
    setFollowupFormData({
      title: '',
      targetPerson: '',
      status: 'following',
      notes: ''
    });
    setShowAddFollowupModal(true);
  };

  const handleOpenEditFollowup = (followup) => {
    setEditingFollowup(followup);
    setFollowupFormData({
      title: followup.title,
      targetPerson: followup.targetPerson || '',
      status: followup.status || 'following',
      notes: followup.notes || ''
    });
    setShowAddFollowupModal(true);
  };

  const handleSaveFollowup = async (e) => {
    e.preventDefault();
    let newItem;
    if (editingFollowup) {
      newItem = {
        ...editingFollowup,
        ...followupFormData
      };
      setFollowupItems(prev => prev.map(f => f.id === editingFollowup.id ? newItem : f));
    } else {
      newItem = {
        id: `fol-${Date.now()}`,
        ...followupFormData,
        createdAt: new Date().toISOString()
      };
      setFollowupItems(prev => [newItem, ...prev]);
    }
    setShowAddFollowupModal(false);

    // Save to Supabase
    await saveTodoFollowupToSupabase(newItem);
    onShowSaveToast?.('บันทึกงานติดตามลงฐานข้อมูลแล้ว!');
  };

  const handleDeleteFollowup = async (id) => {
    setFollowupItems(prev => prev.filter(f => f.id !== id));
    await deleteTodoFollowupFromSupabase(id);
    onShowSaveToast?.('ลบงานติดตามเรียบร้อยแล้ว!');
  };

  const handleUpdateFollowupStatus = async (itemId, newStatus) => {
    let updatedItem = null;
    setFollowupItems(prev => prev.map(f => {
      if (f.id === itemId) {
        updatedItem = { ...f, status: newStatus };
        return updatedItem;
      }
      return f;
    }));
    if (updatedItem) {
      await saveTodoFollowupToSupabase(updatedItem);
      onShowSaveToast?.('อัปเดตสถานะงานติดตามเรียบร้อยแล้ว!');
    }
  };

  // Drag & Drop handlers for Follow-Up watchlist
  const handleFollowupDragStart = (e, id) => {
    setDraggedFollowupId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleFollowupDragOver = (e, id) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverFollowupId !== id) {
      setDragOverFollowupId(id);
    }
  };

  const handleFollowupDragLeave = (e, id) => {
    if (dragOverFollowupId === id) {
      setDragOverFollowupId(null);
    }
  };

  const handleFollowupDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedFollowupId || draggedFollowupId === targetId) {
      setDraggedFollowupId(null);
      setDragOverFollowupId(null);
      return;
    }

    setFollowupItems(prev => {
      const fromIndex = prev.findIndex(f => f.id === draggedFollowupId);
      const toIndex = prev.findIndex(f => f.id === targetId);

      if (fromIndex !== -1 && toIndex !== -1) {
        const updated = [...prev];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        return updated;
      }
      return prev;
    });

    setFollowupSortBy('custom');
    onShowSaveToast?.('จัดลำดับงานติดตามเรียบร้อยแล้ว!');

    setDraggedFollowupId(null);
    setDragOverFollowupId(null);
  };

  const handleFollowupDragEnd = () => {
    setDraggedFollowupId(null);
    setDragOverFollowupId(null);
  };

  // --- Handlers for 3. File Submission Tracker ---
  const handleOpenAddFile = () => {
    setEditingFile(null);
    setFileFormData({
      fileName: '',
      fileType: 'ภาพกราฟิก AI/PSD',
      assignedCreator: 'คุณเจนนี่ (Content Creator)',
      driveUrl: '',
      deliveryStatus: 'not_submitted',
      remarks: ''
    });
    setShowAddFileModal(true);
  };

  const handleOpenEditFile = (file) => {
    setEditingFile(file);
    setFileFormData({
      fileName: file.fileName,
      fileType: file.fileType,
      assignedCreator: file.assignedCreator,
      driveUrl: file.driveUrl || '',
      deliveryStatus: file.deliveryStatus,
      remarks: file.remarks || ''
    });
    setShowAddFileModal(true);
  };

  const handleSaveFile = (e) => {
    e.preventDefault();
    const nowStr = new Date().toLocaleString('th-TH');

    if (editingFile) {
      setFileTrackers(prev => prev.map(f => f.id === editingFile.id ? {
        ...f,
        ...fileFormData,
        submittedAt: fileFormData.deliveryStatus === 'submitted' ? nowStr : f.submittedAt
      } : f));
    } else {
      setFileTrackers(prev => [{
        id: `file-${Date.now()}`,
        ...fileFormData,
        submittedAt: fileFormData.deliveryStatus === 'submitted' ? nowStr : 'ยังไม่ส่ง'
      }, ...prev]);
    }
    setShowAddFileModal(false);
  };

  const handleToggleFileStatus = (fileId) => {
    const nowStr = new Date().toLocaleString('th-TH');
    setFileTrackers(prev => prev.map(f => {
      if (f.id !== fileId) return f;
      const isNowSubmitted = f.deliveryStatus !== 'submitted';
      return {
        ...f,
        deliveryStatus: isNowSubmitted ? 'submitted' : 'not_submitted',
        submittedAt: isNowSubmitted ? nowStr : 'ยังไม่ส่ง'
      };
    }));
  };

  const handleDeleteFile = (id) => {
    setFileTrackers(prev => prev.filter(f => f.id !== id));
  };

  const handleCopyLink = (url, id) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- Handlers for 4. Branch Checklist ---
  const handleToggleChecklistItem = (itemId) => {
    setChecklists(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, completed: !item.completed };
      }
      return item;
    }));
  };

  const handleOpenAddChecklist = (defaultGroupId) => {
    setEditingChecklist(null);
    setChecklistFormData({
      title: '',
      groupId: defaultGroupId || checklistGroups[0]?.id || 'grp-branding',
      branch: selectedChecklistBranch === 'all' ? 'สาขาบางแสน' : selectedChecklistBranch,
      assignedTo: 'ทีมการตลาด (สนง.ใหญ่)',
      link: '',
      dueDate: '',
      notes: '',
      completed: false
    });
    setShowAddChecklistModal(true);
  };

  const handleOpenEditChecklist = (item) => {
    setEditingChecklist(item);
    setChecklistFormData({
      title: item.title,
      groupId: item.groupId,
      branch: item.branch || selectedChecklistBranch,
      assignedTo: item.assignedTo || 'ทีมการตลาด (สนง.ใหญ่)',
      link: item.link || '',
      dueDate: item.dueDate || '',
      notes: item.notes || '',
      completed: Boolean(item.completed)
    });
    setShowAddChecklistModal(true);
  };

  const handleSaveChecklist = (e) => {
    e.preventDefault();
    if (!checklistFormData.title.trim()) return;

    if (editingChecklist) {
      setChecklists(prev => prev.map(c => c.id === editingChecklist.id ? {
        ...c,
        ...checklistFormData
      } : c));
      onShowSaveToast?.('แก้ไขรายการ Checklist เรียบร้อยแล้ว!');
    } else {
      const newItem = {
        id: `chk-${Date.now()}`,
        ...checklistFormData
      };
      setChecklists(prev => [...prev, newItem]);
      onShowSaveToast?.('เพิ่มรายการ Checklist ใหม่เรียบร้อยแล้ว!');
    }
    setShowAddChecklistModal(false);
  };

  const handleDeleteChecklist = (itemId) => {
    setChecklists(prev => prev.filter(c => c.id !== itemId));
    onShowSaveToast?.('ลบรายการ Checklist เรียบร้อยแล้ว!');
  };

  const handleOpenAddGroup = () => {
    setEditingGroup(null);
    setGroupFormData({
      title: '',
      icon: 'Megaphone',
      color: 'purple'
    });
    setShowAddGroupModal(true);
  };

  const handleOpenEditGroup = (group) => {
    setEditingGroup(group);
    setGroupFormData({
      title: group.title,
      icon: group.icon || 'Megaphone',
      color: group.color || 'purple'
    });
    setShowAddGroupModal(true);
  };

  const handleSaveGroup = (e) => {
    e.preventDefault();
    if (!groupFormData.title.trim()) return;

    if (editingGroup) {
      setChecklistGroups(prev => prev.map(g => g.id === editingGroup.id ? {
        ...g,
        ...groupFormData
      } : g));
      onShowSaveToast?.('แก้ไขหมวดหมู่เรียบร้อยแล้ว!');
    } else {
      const newGroup = {
        id: `grp-${Date.now()}`,
        ...groupFormData
      };
      setChecklistGroups(prev => [...prev, newGroup]);
      onShowSaveToast?.('เพิ่มหมวดหมู่ Checklist ใหม่เรียบร้อยแล้ว!');
    }
    setShowAddGroupModal(false);
  };

  const handleDeleteGroup = (groupId) => {
    if (confirm('คุณต้องการลบหมวดหมู่นี้และรายการที่เกี่ยวข้องทั้งหมดหรือไม่?')) {
      setChecklistGroups(prev => prev.filter(g => g.id !== groupId));
      setChecklists(prev => prev.filter(c => c.groupId !== groupId));
      onShowSaveToast?.('ลบหมวดหมู่เรียบร้อยแล้ว!');
    }
  };

  const handleCheckAllChecklist = (completedState) => {
    setChecklists(prev => prev.map(item => {
      const matchesBranch = selectedChecklistBranch === 'all' || item.branch === selectedChecklistBranch;
      if (matchesBranch) {
        return { ...item, completed: completedState };
      }
      return item;
    }));
    onShowSaveToast?.(completedState ? 'ทำเครื่องหมายเสร็จทั้งหมดแล้ว!' : 'ยกเลิกเครื่องหมายทั้งหมดแล้ว!');
  };

  const handleResetChecklistDefaults = () => {
    if (confirm('ต้องการรีเซ็ตข้อมูล Checklist ให้เป็นค่าเริ่มต้นตามตัวอย่างทั้งหมดหรือไม่?')) {
      setChecklistGroups(DEFAULT_CHECKLIST_GROUPS);
      setChecklists(DEFAULT_CHECKLIST_ITEMS);
      localStorage.setItem('nitan_todo_checklist_groups', JSON.stringify(DEFAULT_CHECKLIST_GROUPS));
      localStorage.setItem('nitan_todo_checklists', JSON.stringify(DEFAULT_CHECKLIST_ITEMS));
      onShowSaveToast?.('คืนค่าข้อมูล Checklist เริ่มต้นเรียบร้อยแล้ว!');
    }
  };

  const handleCopyChecklistSummary = () => {
    const relevantItems = checklists.filter(item => selectedChecklistBranch === 'all' || item.branch === selectedChecklistBranch);
    const branchLabel = selectedChecklistBranch === 'all' ? 'ทุกสาขา' : selectedChecklistBranch;
    
    let summaryText = `📋 Checklist เตรียมเอกสาร/ข้อมูล (${branchLabel})\n`;
    summaryText += `ความคืบหน้า: ${relevantItems.filter(i => i.completed).length}/${relevantItems.length} รายการ (${Math.round((relevantItems.filter(i => i.completed).length / (relevantItems.length || 1)) * 100)}%)\n\n`;

    checklistGroups.forEach(grp => {
      const grpItems = relevantItems.filter(i => i.groupId === grp.id);
      if (grpItems.length > 0) {
        summaryText += `🔹 ${grp.title}\n`;
        grpItems.forEach(item => {
          summaryText += `  ${item.completed ? '✅' : '⬜'} ${item.title}\n`;
          if (item.link) summaryText += `     🔗 ลิงก์: ${item.link}\n`;
        });
        summaryText += '\n';
      }
    });

    navigator.clipboard.writeText(summaryText);
    onShowSaveToast?.('คัดลอกสรุปรายการ Checklist สำหรับแชร์แล้ว!');
  };

  // Helper to render icon by name
  const renderGroupIcon = (iconName) => {
    switch (iconName) {
      case 'Megaphone':
        return <Megaphone className="w-4 h-4 text-purple-700" />;
      case 'Utensils':
        return <Utensils className="w-4 h-4 text-purple-700" />;
      case 'Settings':
        return <Settings className="w-4 h-4 text-purple-700" />;
      case 'Building2':
        return <Building2 className="w-4 h-4 text-purple-700" />;
      case 'FileCheck':
        return <FileCheck className="w-4 h-4 text-purple-700" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-purple-700" />;
      case 'FolderCheck':
        return <FolderCheck className="w-4 h-4 text-purple-700" />;
      default:
        return <ListChecks className="w-4 h-4 text-purple-700" />;
    }
  };

  // Filtered Logic for 1. Tasks
  const filteredTasks = tasks.filter(t => {
    const matchStatus = selectedStatus === 'all' ||
      (selectedStatus === 'completed' && t.completed) ||
      (selectedStatus === 'in_progress' && t.status === 'in_progress' && !t.completed) ||
      (selectedStatus === 'pending' && t.status === 'pending' && !t.completed);

    const matchPriority = selectedPriority === 'all' || t.priority === selectedPriority;
    const matchCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchSearch = !searchQuery ||
      (t.title && t.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.assignedTo && t.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchStatus && matchPriority && matchCategory && matchSearch;
  });

  // Status weight for sorting: Following (1) -> Hold (2) -> Completed (3)
  const FOLLOWUP_STATUS_ORDER = {
    following: 1,
    hold: 2,
    completed: 3
  };

  // Filtered & Sorted Logic for 2. Follow-Up Watchlist
  const filteredFollowupItems = followupItems
    .filter(f => {
      const matchStatus = selectedFollowupStatus === 'all' || f.status === selectedFollowupStatus;
      const matchSearch = !searchQuery ||
        (f.title && f.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (f.targetPerson && f.targetPerson.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (f.notes && f.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchStatus && matchSearch;
    })
    .sort((a, b) => {
      if (followupSortBy === 'status') {
        const orderA = FOLLOWUP_STATUS_ORDER[a.status] || 99;
        const orderB = FOLLOWUP_STATUS_ORDER[b.status] || 99;
        if (orderA !== orderB) return orderA - orderB;
        // Secondary sort: Newest first
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      } else if (followupSortBy === 'date_desc') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      } else if (followupSortBy === 'date_asc') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      } else if (followupSortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '', 'th');
      }
      return 0;
    });

  // Filtered Logic for 3. File Submission Tracker
  const filteredFiles = fileTrackers.filter(f => {
    const matchStatus = selectedFileStatus === 'all' || f.deliveryStatus === selectedFileStatus;
    const matchSearch = !searchQuery ||
      (f.fileName && f.fileName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.assignedCreator && f.assignedCreator.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.fileType && f.fileType.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.remarks && f.remarks.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchSearch;
  });

  // Filtered Logic for 4. Branch Checklist
  const branchFilteredChecklists = checklists.filter(item => {
    const matchBranch = selectedChecklistBranch === 'all' || item.branch === selectedChecklistBranch;
    const matchGroup = selectedChecklistGroup === 'all' || item.groupId === selectedChecklistGroup;
    const matchStatus = selectedChecklistStatus === 'all' ||
      (selectedChecklistStatus === 'completed' && item.completed) ||
      (selectedChecklistStatus === 'pending' && !item.completed);
    const matchSearch = !searchQuery ||
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.assignedTo && item.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchBranch && matchGroup && matchStatus && matchSearch;
  });

  // Unique branches extracted from checklists
  const availableBranches = Array.from(new Set([
    'สาขาบางแสน',
    'สาขาอารีย์',
    'สาขาพัทยา',
    'สาขาเชียงใหม่',
    'งาน Event นอกสถานที่',
    ...checklists.map(c => c.branch).filter(Boolean)
  ]));

  // Calculate Metrics
  const submittedFilesCount = fileTrackers.filter(f => f.deliveryStatus === 'submitted' || f.deliveryStatus === 'approved').length;
  const pendingFilesCount = fileTrackers.filter(f => f.deliveryStatus === 'not_submitted').length;
  const followupActiveCount = followupItems.filter(f => f.status !== 'completed').length;
  const followupHoldCount = followupItems.filter(f => f.status === 'hold').length;

  const relevantChecklists = checklists.filter(c => selectedChecklistBranch === 'all' || c.branch === selectedChecklistBranch);
  const checklistCompletedCount = relevantChecklists.filter(c => c.completed).length;
  const checklistTotalCount = relevantChecklists.length;
  const checklistPercent = checklistTotalCount > 0 ? Math.round((checklistCompletedCount / checklistTotalCount) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header Banner Panel */}
      <div className="glass-panel p-6 border-[#E2D2EA]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEBF3] border border-[#E2D2EA] text-xs font-bold text-purple-950 mb-2">
              <ListTodo className="w-3.5 h-3.5 text-purple-700" />
              <span>ระบบบริหารจัดการงาน To-Do, บันทึกการติดตาม & ติดตามไฟล์งาน</span>
            </div>
            <h2 className="text-xl font-bold text-purple-950 tracking-tight flex items-center gap-2">
              <span>รายการงานการตลาด • ติดตามงานค้าง • ติดตามไฟล์งาน • เช็คลิสต์งานสาขา</span>
            </h2>
            <p className="text-xs text-purple-800/80 font-medium mt-1">
              ติดตามงานการบ้าน ติดตามงานกับทีมงาน ติดตามการส่งไฟล์งาน และเตรียมความพร้อมส่งมอบงานสาขาได้ในจุดเดียว
            </p>
          </div>

          {/* Quick Action Button depending on Active Section */}
          <div>
            {activeSection === 'tasks' && (
              <button
                onClick={handleOpenAddTask}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-2 cursor-pointer hover:opacity-95"
              >
                <Plus className="w-4 h-4 text-pink-300" />
                <span>+ เพิ่มงาน To-Do ใหม่</span>
              </button>
            )}

            {activeSection === 'followup' && (
              <button
                onClick={handleOpenAddFollowup}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-2 cursor-pointer hover:opacity-95"
              >
                <BellRing className="w-4 h-4 text-pink-300" />
                <span>+ บันทึกงานที่ต้องติดตาม</span>
              </button>
            )}

            {activeSection === 'files' && (
              <button
                onClick={handleOpenAddFile}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-2 cursor-pointer hover:opacity-95"
              >
                <FolderCheck className="w-4 h-4 text-pink-300" />
                <span>+ เพิ่มรายการติดตามไฟล์งาน</span>
              </button>
            )}

            {activeSection === 'checklist' && (
              <button
                onClick={() => handleOpenAddChecklist()}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-2 cursor-pointer hover:opacity-95"
              >
                <Plus className="w-4 h-4 text-pink-300" />
                <span>+ เพิ่มรายการ Checklist</span>
              </button>
            )}
          </div>
        </div>

        {/* Top Summary Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-purple-100/60">
          <div className="p-4 rounded-2xl bg-white border border-[#E2D2EA] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-purple-900 block">งาน To-Do ในระบบ</span>
              <span className="text-xl font-bold text-purple-950 font-mono">{tasks.length} งาน</span>
              <span className="text-[10px] text-purple-700 font-medium block mt-0.5">เสร็จแล้ว {tasks.filter(t => t.completed).length} งาน</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FFEBF3] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E2D2EA] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-purple-900 block">งานที่ต้องติดตามต่อ (Follow-Up)</span>
              <span className="text-xl font-bold text-amber-700 font-mono">{followupActiveCount} งาน</span>
              <span className="text-[10px] text-amber-800 font-bold block mt-0.5">
                กำลังตาม {followupItems.filter(f => f.status === 'following').length} • Hold {followupHoldCount} งาน
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FEF9C3] text-amber-800 flex items-center justify-center border border-[#E2D2EA]">
              <BellRing className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E2D2EA] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-purple-900 block">ไฟล์งานที่ส่งแล้ว (Submitted)</span>
              <span className="text-xl font-bold text-emerald-700 font-mono">{submittedFilesCount} ไฟล์</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">พร้อมใช้งานโฆษณา/สื่อ</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E2D2EA] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-purple-900 block">Checklist ส่งมอบสาขา</span>
              <span className="text-xl font-bold text-purple-950 font-mono">{checklistCompletedCount}/{checklistTotalCount} รายการ</span>
              <span className="text-[10px] text-purple-800 font-bold block mt-0.5">
                ความพร้อม {checklistPercent}% ({selectedChecklistBranch})
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FFEBF3] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
              <ListChecks className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* PROMINENT 4-IN-1 SECTION NAV TAB BAR */}
      <div className="p-2 rounded-2xl bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] border border-[#E2D2EA] flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 sm:pb-0">
          <button
            onClick={() => setActiveSection('tasks')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap ${activeSection === 'tasks'
                ? 'bg-purple-950 text-white scale-[1.02]'
                : 'bg-white text-purple-950 hover:bg-purple-50 border border-[#E2D2EA]'
              }`}
          >
            <CheckSquare className="w-4 h-4 text-pink-300" />
            <span>1. รายการงาน To-Do List</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">{tasks.length}</span>
          </button>

          <button
            onClick={() => setActiveSection('followup')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap ${activeSection === 'followup'
                ? 'bg-purple-950 text-white scale-[1.02]'
                : 'bg-white text-purple-950 hover:bg-purple-50 border border-[#E2D2EA]'
              }`}
          >
            <BellRing className="w-4 h-4 text-amber-400" />
            <span>2. ส่วนบันทึกงานที่ต้องติดตาม (Follow-Up)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 font-mono">{followupItems.length}</span>
          </button>

          <button
            onClick={() => setActiveSection('files')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap ${activeSection === 'files'
                ? 'bg-purple-950 text-white scale-[1.02]'
                : 'bg-white text-purple-950 hover:bg-purple-50 border border-[#E2D2EA]'
              }`}
          >
            <FolderCheck className="w-4 h-4 text-emerald-300" />
            <span>3. ส่วนติดตามไฟล์งาน</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-900 font-mono">{fileTrackers.length}</span>
          </button>

          <button
            onClick={() => setActiveSection('checklist')}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap ${activeSection === 'checklist'
                ? 'bg-purple-950 text-white scale-[1.02]'
                : 'bg-white text-purple-950 hover:bg-purple-50 border border-[#E2D2EA]'
              }`}
          >
            <ListChecks className="w-4 h-4 text-pink-300" />
            <span>4. Checklist ส่งมอบงานสาขา / นอก สนง.ใหญ่</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-900 font-mono">
              {checklistCompletedCount}/{checklistTotalCount}
            </span>
          </button>
        </div>
      </div>

      {/* SECTION 1: TO-DO TASKS */}
      {activeSection === 'tasks' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="glass-panel p-4 border-[#E2D2EA] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-purple-900">กรองสถานะ:</span>
              {['all', 'pending', 'in_progress', 'completed'].map(st => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                    selectedStatus === st
                      ? 'bg-purple-950 text-white shadow-xs'
                      : 'bg-white text-purple-900 border border-[#E2D2EA] hover:bg-purple-50'
                  }`}
                >
                  {st === 'all' && 'ทั้งหมด'}
                  {st === 'pending' && 'รอดำเนินการ'}
                  {st === 'in_progress' && 'กำลังทำ'}
                  {st === 'completed' && 'เสร็จสิ้น'}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white border border-[#E2D2EA] rounded-xl p-0.5">
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'card' ? 'bg-purple-950 text-white' : 'text-purple-900 hover:bg-purple-50'
                  }`}
                  title="Card View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'list' ? 'bg-purple-950 text-white' : 'text-purple-900 hover:bg-purple-50'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleOpenAddTask}
                className="px-3.5 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer hover:opacity-95 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-pink-300" />
                <span>+ สร้าง To-Do</span>
              </button>
            </div>
          </div>

          {/* Task Items Render */}
          {filteredTasks.length === 0 ? (
            <div className="glass-panel p-12 text-center border-[#E2D2EA] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFEBF3] text-purple-800 flex items-center justify-center border border-[#E2D2EA] mx-auto">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-purple-950 text-sm">ไม่พบรายการงาน To-Do ที่ตรงกับเงื่อนไข</h3>
              <p className="text-xs text-purple-800/80 max-w-md mx-auto">
                เริ่มต้นเพิ่มรายการงานที่คุณต้องการวางแผน หรือปรับตัวกรองเพื่อดูงานอื่นๆ
              </p>
              <button
                onClick={handleOpenAddTask}
                className="px-4 py-2 bg-purple-950 text-white font-bold rounded-xl text-xs cursor-pointer inline-flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>+ เพิ่มงาน To-Do แรกของคุณ</span>
              </button>
            </div>
          ) : viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 bg-white relative flex flex-col justify-between ${
                    task.completed
                      ? 'border-emerald-200/80 bg-emerald-50/20'
                      : 'border-[#E2D2EA] hover:border-purple-300 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleTaskCompleted(task.id)}
                          className={`w-5 h-5 rounded-lg flex items-center justify-center transition border cursor-pointer ${
                            task.completed
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-[#E2D2EA] hover:border-purple-400 bg-purple-50/30'
                          }`}
                        >
                          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900">
                          {task.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-purple-400">
                        <button
                          onClick={() => handleOpenEditTask(task)}
                          className="p-1 hover:text-purple-700 hover:bg-purple-50 rounded-lg cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className={`text-sm font-bold leading-snug ${
                      task.completed ? 'line-through text-purple-900/40' : 'text-purple-950'
                    }`}>
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-xs text-purple-800/80 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-purple-100/60 flex items-center justify-between text-[11px] text-purple-800/80 font-medium">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-purple-600" />
                      {task.assignedTo || 'ไม่ระบุ'}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-purple-900 font-bold">
                      <Calendar className="w-3 h-3 text-purple-600" />
                      {task.dueDate || '-'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel overflow-hidden border-[#E2D2EA]">
              <div className="divide-y divide-purple-100">
                {filteredTasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-3.5 flex items-center justify-between gap-4 transition hover:bg-purple-50/40 ${
                      task.completed ? 'bg-emerald-50/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => handleToggleTaskCompleted(task.id)}
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition border cursor-pointer flex-shrink-0 ${
                          task.completed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-[#E2D2EA] hover:border-purple-400 bg-purple-50/30'
                        }`}
                      >
                        {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                      <div className="min-w-0">
                        <h4 className={`text-xs font-bold truncate ${
                          task.completed ? 'line-through text-purple-900/40' : 'text-purple-950'
                        }`}>
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-purple-700">
                          <span className="font-bold">{task.category}</span>
                          <span>•</span>
                          <span>{task.assignedTo}</span>
                          <span>•</span>
                          <span className="font-mono">{task.dueDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleOpenEditTask(task)}
                        className="p-1.5 hover:text-purple-700 hover:bg-purple-100 rounded-lg text-purple-400 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-purple-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: FOLLOW-UP WATCHLIST */}
      {activeSection === 'followup' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 border-[#E2D2EA] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-purple-900 flex items-center gap-1.5 mr-1">
                <BellRing className="w-3.5 h-3.5 text-amber-600" />
                <span>กรองสถานะ:</span>
              </span>
              {[
                { id: 'all', label: 'ทั้งหมด' },
                { id: 'following', label: 'กำลังตามงาน' },
                { id: 'hold', label: 'Hold งาน' },
                { id: 'completed', label: 'เรียบร้อยแล้ว' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setSelectedFollowupStatus(st.id)}
                  className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                    selectedFollowupStatus === st.id
                      ? 'bg-purple-950 text-white shadow-xs'
                      : 'bg-white text-purple-900 border border-[#E2D2EA] hover:bg-purple-50'
                  }`}
                >
                  {st.label}
                  {st.id !== 'all' && (
                    <span className="ml-1 text-[10px] opacity-80">
                      ({followupItems.filter(f => f.status === st.id).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white border border-[#E2D2EA] px-2.5 py-1 rounded-xl text-purple-950 font-bold">
                <ArrowUpDown className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-[11px]">เรียงลำดับ:</span>
                <select
                  value={followupSortBy}
                  onChange={e => setFollowupSortBy(e.target.value)}
                  className="bg-transparent text-xs font-bold text-purple-900 outline-none cursor-pointer"
                >
                  <option value="status">ตามสถานะงาน (กำลังตาม ➔ Hold ➔ เสร็จ)</option>
                  <option value="custom">ลำดับตามการลากจัด (Custom)</option>
                  <option value="date_desc">สร้างล่าสุดก่อน</option>
                  <option value="date_asc">สร้างเก่าสุดก่อน</option>
                  <option value="title">ตามชื่อ ก-ฮ</option>
                </select>
              </div>

              <button
                onClick={handleOpenAddFollowup}
                className="px-3.5 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer hover:opacity-95 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-pink-300" />
                <span>+ บันทึกงานติดตาม</span>
              </button>
            </div>
          </div>

          {filteredFollowupItems.length === 0 ? (
            <div className="glass-panel p-12 text-center border-[#E2D2EA] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF9C3] text-amber-800 flex items-center justify-center border border-[#E2D2EA] mx-auto">
                <BellRing className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-purple-950 text-sm">ไม่พบงานที่ต้องติดตาม</h3>
              <p className="text-xs text-purple-800/80 max-w-md mx-auto">
                บันทึกประเด็นที่ต้องทวงถาม เช่น ตามงานกราฟิกจากฟรีแลนซ์, ตามใบเสนอราคา, หรือตรวจแบบป้าย
              </p>
              <button
                onClick={handleOpenAddFollowup}
                className="px-4 py-2 bg-purple-950 text-white font-bold rounded-xl text-xs cursor-pointer inline-flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>+ บันทึกงานติดตามแรก</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredFollowupItems.map(item => {
                const isFollowing = item.status === 'following';
                const isHold = item.status === 'hold';
                const isDone = item.status === 'completed';

                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={e => handleFollowupDragStart(e, item.id)}
                    onDragOver={e => handleFollowupDragOver(e, item.id)}
                    onDragLeave={e => handleFollowupDragLeave(e, item.id)}
                    onDrop={e => handleFollowupDrop(e, item.id)}
                    onDragEnd={handleFollowupDragEnd}
                    className={`p-4 rounded-2xl border transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      dragOverFollowupId === item.id ? 'border-purple-500 ring-2 ring-purple-200' : 'border-[#E2D2EA]'
                    } ${
                      isDone
                        ? 'bg-emerald-50/20 border-emerald-200'
                        : isHold
                        ? 'bg-amber-50/20 border-amber-200'
                        : 'bg-white hover:border-purple-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="cursor-grab text-purple-300 hover:text-purple-600 mt-1 flex-shrink-0">
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className={`text-sm font-bold ${isDone ? 'line-through text-purple-900/40' : 'text-purple-950'}`}>
                            {item.title}
                          </h4>
                          {item.targetPerson && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 flex items-center gap-1">
                              <User className="w-2.5 h-2.5" />
                              {item.targetPerson}
                            </span>
                          )}
                        </div>

                        {item.notes && (
                          <p className="text-xs text-purple-800/80 font-medium">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                      <select
                        value={item.status}
                        onChange={e => handleUpdateFollowupStatus(item.id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border cursor-pointer outline-none ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : isHold
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-purple-100 text-purple-900 border-purple-300'
                        }`}
                      >
                        <option value="following">⏳ กำลังตามงาน</option>
                        <option value="hold">⏸️ Hold งาน</option>
                        <option value="completed">✅ ติดตามเรียบร้อย</option>
                      </select>

                      <button
                        onClick={() => handleOpenEditFollowup(item)}
                        className="p-1.5 hover:text-purple-700 hover:bg-purple-50 rounded-lg text-purple-400 cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFollowup(item.id)}
                        className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-purple-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: FILE SUBMISSION TRACKER */}
      {activeSection === 'files' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 border-[#E2D2EA] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-purple-900 flex items-center gap-1.5 mr-1">
                <FolderCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>กรองสถานะ:</span>
              </span>
              {[
                { id: 'all', label: 'ทั้งหมด' },
                { id: 'not_submitted', label: 'ยังไม่ส่งไฟล์' },
                { id: 'submitted', label: 'ส่งไฟล์แล้ว' },
                { id: 'needs_revision', label: 'รอแก้ไข' },
                { id: 'approved', label: 'อนุมัติแล้ว' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setSelectedFileStatus(st.id)}
                  className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                    selectedFileStatus === st.id
                      ? 'bg-purple-950 text-white shadow-xs'
                      : 'bg-white text-purple-900 border border-[#E2D2EA] hover:bg-purple-50'
                  }`}
                >
                  {st.label}
                  {st.id !== 'all' && (
                    <span className="ml-1 text-[10px] opacity-80">
                      ({fileTrackers.filter(f => f.deliveryStatus === st.id).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleOpenAddFile}
              className="px-3.5 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer hover:opacity-95 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-pink-300" />
              <span>+ เพิ่มรายการติดตามไฟล์งาน</span>
            </button>
          </div>

          {filteredFiles.length === 0 ? (
            <div className="glass-panel p-12 text-center border-[#E2D2EA] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-[#E2D2EA] mx-auto">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-purple-950 text-sm">
                {fileTrackers.length === 0
                  ? 'ยังไม่มีรายการติดตามไฟล์งานในระบบ'
                  : 'ไม่พบไฟล์ที่ตรงกับตัวกรอง'}
              </h3>
              <p className="text-xs text-purple-800/80 max-w-md mx-auto">
                กดปุ่มเพื่อเริ่มบันทึกรายการไฟล์งาน เช่น ภาพกราฟิก, วิดีโอ TikTok, สื่อ POSM เพื่อเช็กสถานะส่งแล้ว/ยังไม่ส่ง
              </p>
              <button
                onClick={handleOpenAddFile}
                className="px-4 py-2 bg-purple-950 text-white font-bold rounded-xl text-xs cursor-pointer inline-flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>+ เพิ่มรายการติดตามไฟล์งาน</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFiles.map(file => {
                const isSubmitted = file.deliveryStatus === 'submitted' || file.deliveryStatus === 'approved';

                return (
                  <div
                    key={file.id}
                    className={`p-4 rounded-2xl border transition-all duration-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isSubmitted
                        ? 'border-emerald-200 bg-emerald-50/15'
                        : 'border-[#E2D2EA] hover:border-purple-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <button
                        onClick={() => handleToggleFileStatus(file.id)}
                        className={`w-6 h-6 rounded-xl flex items-center justify-center border transition flex-shrink-0 cursor-pointer mt-0.5 ${
                          isSubmitted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-purple-300 hover:border-purple-500 bg-purple-50/40 text-transparent'
                        }`}
                        title={isSubmitted ? 'คลิกเพื่อเปลี่ยนเป็นยังไม่ส่ง' : 'คลิกเพื่อยืนยันว่าส่งไฟล์แล้ว'}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className={`text-sm font-bold ${isSubmitted ? 'text-purple-950' : 'text-purple-950 font-extrabold'}`}>
                            {file.fileName}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-200/60">
                            {file.fileType}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-purple-800/80">
                          <span className="flex items-center gap-1 font-medium">
                            <User className="w-3 h-3 text-purple-600" />
                            <span>ผู้ทำ: <strong className="text-purple-950">{file.assignedCreator}</strong></span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-purple-600" />
                            <span>สถานะส่ง: </span>
                            <span className={`font-bold px-1.5 py-0.2 rounded text-[11px] ${
                              isSubmitted ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'
                            }`}>
                              {file.submittedAt || (isSubmitted ? 'ส่งแล้ว' : 'ยังไม่ส่ง')}
                            </span>
                          </span>
                        </div>

                        {file.remarks && (
                          <p className="text-xs text-purple-800/70 font-medium">
                            {file.remarks}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-end md:self-center flex-shrink-0">
                      {file.driveUrl ? (
                        <a
                          href={file.driveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-950 font-bold rounded-xl border border-[#E2D2EA] text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-purple-700" />
                          <span>เปิดดูไฟล์</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-purple-400 italic">ไม่มีลิงก์ไฟล์</span>
                      )}

                      <button
                        onClick={() => handleOpenEditFile(file)}
                        className="p-1.5 hover:text-purple-700 hover:bg-purple-50 rounded-lg text-purple-400 cursor-pointer"
                        title="แก้ไข"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-purple-400 cursor-pointer"
                        title="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setLineModalItem({
                          id: file.id,
                          title: `[File Status] ${file.fileName}`,
                          platform: file.assignedCreator,
                          publish_date: file.submittedAt,
                          assigned_to: file.assignedCreator,
                          status: isSubmitted ? 'FILE_DELIVERED' : 'FILE_PENDING',
                          media_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80'
                        })}
                        className="px-3.5 py-1.5 bg-[#FFEBF3] hover:bg-pink-200 text-purple-950 font-bold rounded-xl border border-[#E2D2EA] text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5 text-purple-700" />
                        <span>ยิงสถานะไฟล์เข้า LINE</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: BRANCH CHECKLIST (เช็คลิสต์เตรียมเอกสาร/ข้อมูล สาขา & งานนอก สนง.ใหญ่) */}
      {activeSection === 'checklist' && (
        <div className="space-y-6">

          {/* Checklist Main Header Card */}
          <div className="glass-panel p-5 border-[#E2D2EA] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFEBF3] text-purple-900 border border-[#E2D2EA] flex items-center justify-center shadow-xs">
                  <ListChecks className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-purple-950 tracking-tight flex items-center gap-2">
                    <span>Checklist เตรียมเอกสาร/ข้อมูล</span>
                    <span className="text-purple-900 bg-[#FFEBF3] px-2.5 py-0.5 rounded-lg border border-[#E2D2EA] text-xs font-bold">
                      ({selectedChecklistBranch})
                    </span>
                  </h3>
                  <p className="text-xs text-purple-800/80 font-medium mt-0.5">
                    รายการงานและเอกสารสำคัญที่สำนักงานใหญ่ต้องเตรียมและส่งมอบให้สาขา
                  </p>
                </div>
              </div>

              {/* Branch Selector and Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white border border-[#E2D2EA] px-3 py-1.5 rounded-xl shadow-xs">
                  <Building2 className="w-3.5 h-3.5 text-purple-700" />
                  <span className="text-xs font-bold text-purple-900">เลือกสาขา:</span>
                  <select
                    value={selectedChecklistBranch}
                    onChange={e => setSelectedChecklistBranch(e.target.value)}
                    className="bg-transparent text-xs font-bold text-purple-950 outline-none cursor-pointer"
                  >
                    {availableBranches.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                    <option value="all">🌐 แสดงทุกสาขารวมกัน</option>
                  </select>
                </div>

                <button
                  onClick={() => handleOpenAddChecklist()}
                  className="px-3.5 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition hover:opacity-95"
                >
                  <Plus className="w-3.5 h-3.5 text-pink-300" />
                  <span>+ เพิ่มรายการ</span>
                </button>

                <button
                  onClick={handleOpenAddGroup}
                  className="px-3 py-2 bg-white hover:bg-purple-50 text-purple-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition border border-[#E2D2EA] shadow-xs"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-purple-700" />
                  <span>+ เพิ่มกลุ่มใหม่</span>
                </button>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-purple-900 flex items-center gap-1.5">
                  <span>ความพร้อมการส่งมอบงาน:</span>
                  <strong className="text-purple-950">{checklistCompletedCount} จาก {checklistTotalCount} รายการ</strong>
                </span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold border ${
                  checklistPercent === 100
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-[#FFEBF3] text-purple-900 border-[#E2D2EA]'
                }`}>
                  {checklistPercent}% {checklistPercent === 100 ? 'เสร็จสมบูรณ์ 🎉' : 'ดำเนินการ'}
                </span>
              </div>
              <div className="w-full bg-purple-100/60 rounded-full h-2.5 overflow-hidden border border-purple-200/40">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    checklistPercent === 100
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : 'bg-gradient-to-r from-purple-950 via-pink-900 to-purple-800'
                  }`}
                  style={{ width: `${checklistPercent}%` }}
                />
              </div>
            </div>

            {/* Sub Filter & Utility Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-purple-100/60">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-purple-900">กรองสถานะ:</span>
                {[
                  { id: 'all', label: 'ทั้งหมด' },
                  { id: 'pending', label: 'ยังไม่เสร็จ' },
                  { id: 'completed', label: 'เสร็จแล้ว' }
                ].map(st => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedChecklistStatus(st.id)}
                    className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                      selectedChecklistStatus === st.id
                        ? 'bg-purple-950 text-white shadow-xs'
                        : 'bg-white text-purple-900 border border-[#E2D2EA] hover:bg-purple-50'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}

                <span className="text-purple-300 mx-1">|</span>

                <span className="font-bold text-purple-900">หมวดหมู่:</span>
                <select
                  value={selectedChecklistGroup}
                  onChange={e => setSelectedChecklistGroup(e.target.value)}
                  className="bg-white border border-[#E2D2EA] px-2.5 py-1 rounded-xl text-xs font-bold text-purple-950 outline-none cursor-pointer"
                >
                  <option value="all">ทุกหมวดหมู่ ({checklistGroups.length} กลุ่ม)</option>
                  {checklistGroups.map(grp => (
                    <option key={grp.id} value={grp.id}>{grp.title}</option>
                  ))}
                </select>
              </div>

              {/* Utility Tools */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleCheckAllChecklist(true)}
                  className="px-2.5 py-1 text-[11px] bg-white hover:bg-purple-50 text-purple-900 font-bold rounded-xl border border-[#E2D2EA] cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <CheckCheck className="w-3 h-3 text-purple-700" />
                  <span>ติ๊กทั้งหมด</span>
                </button>
                <button
                  onClick={() => handleCheckAllChecklist(false)}
                  className="px-2.5 py-1 text-[11px] bg-white hover:bg-purple-50 text-purple-900 font-bold rounded-xl border border-[#E2D2EA] cursor-pointer shadow-xs"
                >
                  ยกเลิกทั้งหมด
                </button>
                <button
                  onClick={handleCopyChecklistSummary}
                  className="px-2.5 py-1 text-[11px] bg-[#FFEBF3] hover:bg-pink-100 text-purple-950 font-bold rounded-xl border border-[#E2D2EA] cursor-pointer flex items-center gap-1 shadow-xs"
                  title="คัดลอกสรุปรายการทั้งหมดสำหรับส่งใน LINE หรือแชท"
                >
                  <Copy className="w-3 h-3 text-purple-700" />
                  <span>คัดลอกสรุป</span>
                </button>
                <button
                  onClick={handleResetChecklistDefaults}
                  className="p-1 hover:text-purple-900 text-purple-400 rounded-lg cursor-pointer"
                  title="คืนค่าตัวอย่างเริ่มต้น"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* GROUPS ACCORDION / CARD SECTION - MATCHING PALETTE #61 */}
          <div className="space-y-6">
            {checklistGroups.map(group => {
              if (selectedChecklistGroup !== 'all' && selectedChecklistGroup !== group.id) {
                return null;
              }

              const groupItems = branchFilteredChecklists.filter(c => c.groupId === group.id);
              const totalGroupItems = checklists.filter(c => c.groupId === group.id && (selectedChecklistBranch === 'all' || c.branch === selectedChecklistBranch)).length;
              const completedGroupItems = checklists.filter(c => c.groupId === group.id && c.completed && (selectedChecklistBranch === 'all' || c.branch === selectedChecklistBranch)).length;
              const grpPercent = totalGroupItems > 0 ? Math.round((completedGroupItems / totalGroupItems) * 100) : 0;

              return (
                <div key={group.id} className="glass-panel p-4 sm:p-5 border-[#E2D2EA] space-y-3.5 bg-white/90">
                  {/* Group Header matching palette #61 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dashed border-purple-200/80 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-[#FFEBF3] border border-[#E2D2EA] flex items-center justify-center flex-shrink-0 text-purple-800">
                        {renderGroupIcon(group.icon)}
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-purple-950 tracking-tight">
                        {group.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFEBF3] text-purple-900 border border-[#E2D2EA] font-mono">
                        {completedGroupItems}/{totalGroupItems} เสร็จแล้ว ({grpPercent}%)
                      </span>
                      <button
                        onClick={() => handleOpenAddChecklist(group.id)}
                        className="p-1 hover:text-purple-900 hover:bg-purple-100 rounded-md text-purple-700 cursor-pointer text-xs font-bold flex items-center gap-1"
                        title="เพิ่มรายการในกลุ่มนี้"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">เพิ่มในกลุ่ม</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditGroup(group)}
                        className="p-1 hover:text-purple-900 hover:bg-purple-50 rounded-md text-purple-400 cursor-pointer"
                        title="แก้ไขชื่อกลุ่ม"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded-md text-purple-400 cursor-pointer"
                        title="ลบกลุ่มนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Group Items List */}
                  {groupItems.length === 0 ? (
                    <div className="p-4 text-center text-xs text-purple-400 italic bg-purple-50/20 rounded-2xl border border-purple-100/60">
                      ยังไม่มีรายการในกลุ่มนี้ {selectedChecklistStatus !== 'all' ? '(หรือถูกซ่อนตามตัวกรอง)' : ''}
                      <button
                        onClick={() => handleOpenAddChecklist(group.id)}
                        className="ml-2 text-purple-900 font-bold underline cursor-pointer hover:text-pink-900"
                      >
                        + เพิ่มรายการใหม่
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {groupItems.map(item => (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-2xl border transition-all duration-150 flex items-start justify-between gap-3.5 group ${
                            item.completed
                              ? 'bg-emerald-50/15 border-emerald-200/80 shadow-2xs'
                              : 'bg-white border-[#E2D2EA] hover:border-purple-300 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            {/* Checkbox with theme color */}
                            <button
                              type="button"
                              onClick={() => handleToggleChecklistItem(item.id)}
                              className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer transition active:scale-90 mt-0.5 ${
                                item.completed
                                  ? 'bg-gradient-to-r from-purple-950 to-pink-900 border border-purple-900 text-white shadow-xs'
                                  : 'border-2 border-[#E2D2EA] bg-white hover:border-purple-400'
                              }`}
                            >
                              {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>

                            <div className="space-y-1 min-w-0 flex-1">
                              <span
                                onClick={() => handleToggleChecklistItem(item.id)}
                                className={`text-xs sm:text-sm font-bold leading-relaxed cursor-pointer block select-none ${
                                  item.completed
                                    ? 'line-through text-purple-900/40'
                                    : 'text-purple-950'
                                }`}
                              >
                                {item.title}
                              </span>

                              {/* Badges and meta info */}
                              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] text-purple-800/80">
                                {item.branch && selectedChecklistBranch === 'all' && (
                                  <span className="font-bold text-purple-900 bg-[#FFEBF3] px-2 py-0.2 rounded-md border border-[#E2D2EA]">
                                    {item.branch}
                                  </span>
                                )}
                                {item.assignedTo && (
                                  <span className="flex items-center gap-1 font-medium text-purple-900 bg-purple-50 px-2 py-0.2 rounded-md border border-purple-100">
                                    <User className="w-2.5 h-2.5 text-purple-600" />
                                    {item.assignedTo}
                                  </span>
                                )}
                                {item.link && (
                                  <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 font-bold text-purple-900 hover:text-pink-900 bg-[#FFEBF3] px-2 py-0.2 rounded-md border border-[#E2D2EA]"
                                  >
                                    <ExternalLink className="w-2.5 h-2.5 text-purple-700" />
                                    <span>ลิงก์เอกสาร</span>
                                  </a>
                                )}
                                {item.notes && (
                                  <span className="text-purple-700/70 font-medium">
                                    • {item.notes}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action icons on hover/right */}
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 flex-shrink-0">
                            <button
                              onClick={() => handleOpenEditChecklist(item)}
                              className="p-1 hover:text-purple-700 hover:bg-purple-50 rounded-lg text-purple-400 cursor-pointer"
                              title="แก้ไข"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteChecklist(item.id)}
                              className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-purple-400 cursor-pointer"
                              title="ลบ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* MODAL 1: Add/Edit Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="glass-panel max-w-lg w-full p-6 space-y-4 border-[#E2D2EA] shadow-2xl bg-white/95 my-8">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <h3 className="text-base font-bold text-purple-950 flex items-center gap-1.5">
                <PenLine className="w-4 h-4 text-purple-700" />
                <span>{editingTask ? 'แก้ไขงาน To-Do' : 'สร้างงาน To-Do ใหม่'}</span>
              </h3>
              <button onClick={() => setShowAddTaskModal(false)} className="text-purple-400 font-bold hover:text-purple-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-purple-950">หัวข้องาน</label>
                <input
                  type="text"
                  required
                  value={taskFormData.title}
                  onChange={e => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-400 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-purple-950">หมวดหมู่</label>
                  <select
                    value={taskFormData.category}
                    onChange={e => setTaskFormData({ ...taskFormData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl font-bold bg-white"
                  >
                    <option value="Promotion Plan">Promotion Plan</option>
                    <option value="Content Plan">Content Plan</option>
                    <option value="Marketing Plan">Marketing Plan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-purple-950">สถานะ (Status)</label>
                  <select
                    value={taskFormData.status}
                    onChange={e => setTaskFormData({ ...taskFormData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl font-bold bg-white"
                  >
                    <option value="pending">รอดำเนินการ</option>
                    <option value="in_progress">กำลังทำ</option>
                    <option value="completed">เสร็จสมบูรณ์</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1 text-purple-950">ผู้รับผิดชอบ</label>
                <input
                  type="text"
                  required
                  value={taskFormData.assignedTo}
                  onChange={e => setTaskFormData({ ...taskFormData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-400 bg-white"
                />
              </div>
              <div>
                <label className="block font-bold mb-1 text-purple-950">กำหนดส่ง (Due Date)</label>
                <input
                  type="date"
                  value={taskFormData.dueDate}
                  onChange={e => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-400 bg-white"
                />
              </div>
              <div>
                <label className="block font-bold mb-1 text-purple-950">รายละเอียดงาน</label>
                <textarea
                  rows={3}
                  value={taskFormData.description}
                  onChange={e => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-400 bg-white"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 bg-purple-50 text-purple-900 font-bold rounded-xl hover:bg-purple-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl hover:opacity-95 shadow-xs"
                >
                  {editingTask ? 'บันทึกการแก้ไข' : '+ บันทึกงาน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add/Edit Follow-up Modal */}
      {showAddFollowupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="glass-panel max-w-lg w-full p-6 space-y-4 border-[#E2D2EA] shadow-2xl bg-white/95 my-8">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <h3 className="text-base font-bold text-purple-950 flex items-center gap-1.5">
                <BellRing className="w-4 h-4 text-amber-600" />
                <span>{editingFollowup ? 'แก้ไขงานที่ต้องติดตาม' : 'บันทึกงานที่ต้องติดตาม (Follow-Up)'}</span>
              </h3>
              <button onClick={() => setShowAddFollowupModal(false)} className="text-purple-400 font-bold hover:text-purple-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveFollowup} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-purple-950">ชื่องานที่ต้องติดตาม</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ตามไฟล์วิดีโอ 9.9 จากเอเจนซี่ หรือ ใบเสนอราคาป้าย"
                  value={followupFormData.title}
                  onChange={e => setFollowupFormData({ ...followupFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-400 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-purple-950">ตามงานกับใคร</label>
                  <input
                    type="text"
                    placeholder="เช่น คุณส้ม ทีมกราฟิก (เว้นว่างได้)"
                    value={followupFormData.targetPerson}
                    onChange={e => setFollowupFormData({ ...followupFormData, targetPerson: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-purple-950">สถานะ</label>
                  <select
                    value={followupFormData.status}
                    onChange={e => setFollowupFormData({ ...followupFormData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl font-bold bg-white"
                  >
                    <option value="following">กำลังตามงาน</option>
                    <option value="hold">Hold งาน (พักไว้ชั่วคราว)</option>
                    <option value="completed">ติดตามเรียบร้อย</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1 text-purple-950">บันทึกความคืบหน้า</label>
                <textarea
                  rows={3}
                  placeholder="ระบุรายละเอียดเพิ่มเติม..."
                  value={followupFormData.notes}
                  onChange={e => setFollowupFormData({ ...followupFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-400 bg-white"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddFollowupModal(false)}
                  className="px-4 py-2 bg-purple-50 text-purple-900 font-bold rounded-xl hover:bg-purple-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl hover:opacity-95 shadow-xs"
                >
                  {editingFollowup ? 'บันทึกการแก้ไข' : '+ บันทึกงานติดตาม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add/Edit File Tracker Modal */}
      {showAddFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="glass-panel max-w-lg w-full p-6 space-y-4 border-[#E2D2EA] shadow-2xl bg-white/95 my-8">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <h3 className="text-base font-bold text-purple-950 flex items-center gap-1.5">
                <FolderCheck className="w-4 h-4 text-emerald-600" />
                <span>{editingFile ? 'แก้ไขรายการติดตามไฟล์งาน' : 'เพิ่มรายการติดตามไฟล์งาน'}</span>
              </h3>
              <button onClick={() => setShowAddFileModal(false)} className="text-purple-400 font-bold hover:text-purple-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveFile} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-purple-950">ชื่อไฟล์งาน / อาร์ตเวิร์ค</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ภาพปก Facebook Sunscreen Aqua Gel 1 แถม 1"
                  value={fileFormData.fileName}
                  onChange={e => setFileFormData({ ...fileFormData, fileName: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-400 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-purple-950">ประเภทไฟล์</label>
                  <select
                    value={fileFormData.fileType}
                    onChange={e => setFileFormData({ ...fileFormData, fileType: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl font-bold bg-white"
                  >
                    <option value="ภาพกราฟิก AI/PSD">ภาพกราฟิก AI/PSD</option>
                    <option value="วิดีโอ MP4">วิดีโอ MP4</option>
                    <option value="สื่อสิ่งพิมพ์ POSM">สื่อสิ่งพิมพ์ POSM</option>
                    <option value="เอกสาร Brief/PDF">เอกสาร Brief/PDF</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-purple-950">สถานะการส่งไฟล์</label>
                  <select
                    value={fileFormData.deliveryStatus}
                    onChange={e => setFileFormData({ ...fileFormData, deliveryStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl font-bold bg-white"
                  >
                    <option value="not_submitted">ยังไม่ส่งไฟล์</option>
                    <option value="submitted">ส่งไฟล์แล้ว</option>
                    <option value="needs_revision">รอแก้ไข</option>
                    <option value="approved">อนุมัติแล้ว</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-purple-950">ผู้จัดทำไฟล์</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น คุณเจนนี่"
                    value={fileFormData.assignedCreator}
                    onChange={e => setFileFormData({ ...fileFormData, assignedCreator: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-purple-950">ลิงก์ไฟล์ (Drive / Canva / Cloud)</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={fileFormData.driveUrl}
                    onChange={e => setFileFormData({ ...fileFormData, driveUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-400 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1 text-purple-950">หมายเหตุเพิ่มเติม</label>
                <textarea
                  rows={2}
                  placeholder="เช่น ไฟล์ขนาด 1080x1080px..."
                  value={fileFormData.remarks}
                  onChange={e => setFileFormData({ ...fileFormData, remarks: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-400 bg-white"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddFileModal(false)}
                  className="px-4 py-2 bg-purple-50 text-purple-900 font-bold rounded-xl hover:bg-purple-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl hover:opacity-95 shadow-xs"
                >
                  {editingFile ? 'บันทึกการแก้ไข' : '+ บันทึกติดตามไฟล์'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Add/Edit Checklist Item Modal */}
      {showAddChecklistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="glass-panel max-w-lg w-full p-6 space-y-4 border-[#E2D2EA] shadow-2xl bg-white/95 my-8">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <h3 className="text-base font-bold text-purple-950 flex items-center gap-1.5">
                <ListChecks className="w-4 h-4 text-purple-700" />
                <span>{editingChecklist ? 'แก้ไขรายการ Checklist' : 'เพิ่มรายการ Checklist ใหม่'}</span>
              </h3>
              <button onClick={() => setShowAddChecklistModal(false)} className="text-purple-400 font-bold hover:text-purple-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveChecklist} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1 text-purple-950">ชื่อรายการเอกสาร / งานที่ต้องส่งมอบ *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="เช่น ลิงก์ Google Drive รวบรวม Brand Identity, ไฟล์เมนูออนไลน์..."
                  value={checklistFormData.title}
                  onChange={e => setChecklistFormData({ ...checklistFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-400 font-medium text-purple-950 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-purple-950">กลุ่มหมวดหมู่ *</label>
                  <select
                    value={checklistFormData.groupId}
                    onChange={e => setChecklistFormData({ ...checklistFormData, groupId: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl font-bold bg-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-purple-950"
                  >
                    {checklistGroups.map(grp => (
                      <option key={grp.id} value={grp.id}>{grp.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-purple-950">สาขาที่เกี่ยวข้อง</label>
                  <select
                    value={checklistFormData.branch}
                    onChange={e => setChecklistFormData({ ...checklistFormData, branch: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl font-bold bg-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-purple-950"
                  >
                    {availableBranches.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-purple-950">ผู้รับผิดชอบจัดเตรียม</label>
                  <input
                    type="text"
                    placeholder="เช่น ทีมการตลาด, ทีมกราฟิก"
                    value={checklistFormData.assignedTo}
                    onChange={e => setChecklistFormData({ ...checklistFormData, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-400 font-medium text-purple-950 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-purple-950">ลิงก์เอกสาร / Google Drive (ถ้ามี)</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={checklistFormData.link}
                    onChange={e => setChecklistFormData({ ...checklistFormData, link: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-400 font-medium text-purple-950 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-purple-950">หมายเหตุ / คำอธิบายเพิ่มเติม</label>
                <input
                  type="text"
                  placeholder="เช่น สำหรับใช้เปิดจอทีวีภายในร้าน หรือ รอสาขาแทรกเมนู"
                  value={checklistFormData.notes}
                  onChange={e => setChecklistFormData({ ...checklistFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-400 font-medium text-purple-950 bg-white"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-[#FFEBF3] rounded-xl border border-[#E2D2EA]">
                <input
                  type="checkbox"
                  id="chkCompletedCheckbox"
                  checked={checklistFormData.completed}
                  onChange={e => setChecklistFormData({ ...checklistFormData, completed: e.target.checked })}
                  className="w-4 h-4 text-purple-900 rounded cursor-pointer accent-purple-950"
                />
                <label htmlFor="chkCompletedCheckbox" className="font-bold text-purple-950 cursor-pointer select-none">
                  ทำเครื่องหมายว่า "จัดเตรียม/ส่งมอบเรียบร้อยแล้ว"
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddChecklistModal(false)}
                  className="px-4 py-2 bg-purple-50 text-purple-900 font-bold rounded-xl hover:bg-purple-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl hover:opacity-95 shadow-xs"
                >
                  {editingChecklist ? 'บันทึกการแก้ไข' : '+ บันทึกรายการ Checklist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Add/Edit Group Modal */}
      {showAddGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="glass-panel max-w-md w-full p-6 space-y-4 border-[#E2D2EA] shadow-2xl bg-white/95 my-8">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <h3 className="text-base font-bold text-purple-950 flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-purple-700" />
                <span>{editingGroup ? 'แก้ไขกลุ่มหมวดหมู่' : 'สร้างกลุ่มหมวดหมู่ใหม่'}</span>
              </h3>
              <button onClick={() => setShowAddGroupModal(false)} className="text-purple-400 font-bold hover:text-purple-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveGroup} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1 text-purple-950">ชื่อกลุ่มหมวดหมู่ *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ด้านการเงินและบัญชี (Finance & Accounting)"
                  value={groupFormData.title}
                  onChange={e => setGroupFormData({ ...groupFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-400 font-medium text-purple-950 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-purple-950">ไอคอนประจำกลุ่ม</label>
                <select
                  value={groupFormData.icon}
                  onChange={e => setGroupFormData({ ...groupFormData, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2D2EA] rounded-xl font-bold bg-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-purple-950"
                >
                  <option value="Megaphone">📢 โทรโข่ง / การตลาด (Megaphone)</option>
                  <option value="Utensils">🍴 มีดส้อม / เมนูอาหาร (Utensils)</option>
                  <option value="Settings">⚙️ ฟันเฟือง / ระบบและปฏิบัติการ (Settings)</option>
                  <option value="Building2">🏢 อาคาร / สถานที่และสาขา (Building)</option>
                  <option value="FileCheck">📄 เอกสาร / สัญญา (FileCheck)</option>
                  <option value="Sparkles">✨ ดาวประกาย / กิจกรรมพิเศษ (Sparkles)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddGroupModal(false)}
                  className="px-4 py-2 bg-purple-50 text-purple-900 font-bold rounded-xl hover:bg-purple-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl hover:opacity-95 shadow-xs"
                >
                  {editingGroup ? 'บันทึกการแก้ไข' : '+ สร้างกลุ่มใหม่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LINE Flex Modal Integration */}
      {lineModalItem && (
        <LineFlexModal
          contentItem={lineModalItem}
          onClose={() => setLineModalItem(null)}
          onSuccessTrigger={onTriggerNotification}
        />
      )}

    </div>
  );
}
