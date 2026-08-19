import React, { useState } from 'react';
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
  FolderCheck,
  FileText
} from 'lucide-react';
import LineFlexModal from './LineFlexModal';

export default function TodoListModule({
  users = [],
  onTriggerNotification
}) {
  // Main Section Sub-Tab State: 'tasks' | 'followup' | 'files'
  const [activeSection, setActiveSection] = useState('tasks');

  // View Mode State for Tasks: 'card' (default) | 'list'
  const [viewMode, setViewMode] = useState('card');

  // 1. Tasks State with localStorage Persistence
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('nitan_todo_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  // 2. Follow-Up Watchlist State
  const [followupItems, setFollowupItems] = useState(() => {
    const saved = localStorage.getItem('nitan_todo_followup');
    return saved ? JSON.parse(saved) : [];
  });

  // 3. File Submission Tracker State
  const [fileTrackers, setFileTrackers] = useState(() => {
    const saved = localStorage.getItem('nitan_todo_files');
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    localStorage.setItem('nitan_todo_tasks', JSON.stringify(tasks));
    localStorage.setItem('nitan_todo_followup', JSON.stringify(followupItems));
    localStorage.setItem('nitan_todo_files', JSON.stringify(fileTrackers));
  }, [tasks, followupItems, fileTrackers]);

  // Filters State
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals State
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddFollowupModal, setShowAddFollowupModal] = useState(false);
  const [showAddFileModal, setShowAddFileModal] = useState(false);

  const [editingTask, setEditingTask] = useState(null);
  const [editingFollowup, setEditingFollowup] = useState(null);
  const [editingFile, setEditingFile] = useState(null);

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
    targetPerson: 'คุณส้ม (ทีมกราฟิก)',
    nextFollowupDate: new Date().toISOString().split('T')[0],
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

  const handleSaveTask = (e) => {
    e.preventDefault();
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? {
        ...t,
        ...taskFormData,
        completed: taskFormData.status === 'completed'
      } : t));
    } else {
      setTasks(prev => [{
        id: `task-${Date.now()}`,
        ...taskFormData,
        completed: taskFormData.status === 'completed'
      }, ...prev]);
    }
    setShowAddTaskModal(false);
  };

  const handleToggleTaskCompleted = (taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const nextCompleted = !t.completed;
      return { ...t, completed: nextCompleted, status: nextCompleted ? 'completed' : 'in_progress' };
    }));
  };

  const handleDeleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // --- Handlers for 2. Follow-Up Watchlist ---
  const handleOpenAddFollowup = () => {
    setEditingFollowup(null);
    setFollowupFormData({
      title: '',
      targetPerson: 'คุณส้ม (ทีมกราฟิก)',
      nextFollowupDate: new Date().toISOString().split('T')[0],
      status: 'following',
      notes: ''
    });
    setShowAddFollowupModal(true);
  };

  const handleSaveFollowup = (e) => {
    e.preventDefault();
    if (editingFollowup) {
      setFollowupItems(prev => prev.map(f => f.id === editingFollowup.id ? {
        ...f,
        ...followupFormData
      } : f));
    } else {
      setFollowupItems(prev => [{
        id: `fol-${Date.now()}`,
        ...followupFormData,
        createdAt: new Date().toISOString().split('T')[0]
      }, ...prev]);
    }
    setShowAddFollowupModal(false);
  };

  const handleDeleteFollowup = (id) => {
    setFollowupItems(prev => prev.filter(f => f.id !== id));
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

  // Filtered Logic
  const filteredTasks = tasks.filter(t => {
    const matchStatus = selectedStatus === 'all' || 
      (selectedStatus === 'completed' && t.completed) ||
      (selectedStatus === 'in_progress' && t.status === 'in_progress' && !t.completed) ||
      (selectedStatus === 'pending' && t.status === 'pending' && !t.completed);

    const matchPriority = selectedPriority === 'all' || t.priority === selectedPriority;
    const matchCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchSearch = !searchQuery || 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());

    return matchStatus && matchPriority && matchCategory && matchSearch;
  });

  const filteredFiles = fileTrackers.filter(f => {
    const matchSearch = !searchQuery || 
      f.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.assignedCreator.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  // Calculate Metrics
  const submittedFilesCount = fileTrackers.filter(f => f.deliveryStatus === 'submitted' || f.deliveryStatus === 'approved').length;
  const pendingFilesCount = fileTrackers.filter(f => f.deliveryStatus === 'not_submitted').length;
  const followupActiveCount = followupItems.filter(f => f.status !== 'completed').length;

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
              <span>รายการงานการตลาด • ติดตามงานค้าง • ติดตามไฟล์งานสื่อโฆษณา</span>
            </h2>
            <p className="text-xs text-purple-800/80 font-medium mt-1">
              ติดตามงานการบ้าน ติดตามงานกับทีมงาน และติดตามการส่งไฟล์งานได้ในจุดเดียว
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
              <span className="text-[10px] text-amber-800 font-bold block mt-0.5">กำลังติดตามงานค้าง</span>
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
              <span className="text-xs font-bold text-purple-900 block">ไฟล์งานที่ยังไม่ส่ง (Pending)</span>
              <span className="text-xl font-bold text-rose-600 font-mono">{pendingFilesCount} ไฟล์</span>
              <span className="text-[10px] text-rose-700 font-bold block mt-0.5">รอรับไฟล์จากผู้รับผิดชอบ</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center border border-rose-200">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* PROMINENT 3-IN-1 SECTION NAV TAB BAR */}
      <div className="p-2 rounded-2xl bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] border border-[#E2D2EA] flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveSection('tasks')}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap ${
              activeSection === 'tasks'
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
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap ${
              activeSection === 'followup'
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
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap ${
              activeSection === 'files'
                ? 'bg-purple-950 text-white scale-[1.02]'
                : 'bg-white text-purple-950 hover:bg-purple-50 border border-[#E2D2EA]'
            }`}
          >
            <FolderCheck className="w-4 h-4 text-emerald-300" />
            <span>3. ส่วนติดตามไฟล์งาน</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-900 font-mono">{fileTrackers.length}</span>
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
                    selectedStatus === st ? 'bg-purple-950 text-white' : 'bg-white text-purple-900 border border-[#E2D2EA]'
                  }`}
                >
                  {st === 'all' ? 'ทั้งหมด' : st === 'pending' ? 'รอดำเนินการ' : st === 'in_progress' ? 'กำลังทำ' : 'เสร็จสมบูรณ์'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E2D2EA]">
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 text-xs cursor-pointer ${
                  viewMode === 'card' ? 'bg-purple-950 text-white' : 'text-purple-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Card View</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 text-xs cursor-pointer ${
                  viewMode === 'list' ? 'bg-purple-950 text-white' : 'text-purple-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
            </div>
          </div>

          {/* Tasks Container */}
          {filteredTasks.length === 0 ? (
            <div className="glass-panel p-12 text-center border-[#E2D2EA] space-y-3">
              <CheckSquare className="w-8 h-8 text-purple-400 mx-auto" />
              <h3 className="font-bold text-purple-950 text-sm">ยังไม่มีรายการงาน To-Do ในระบบ</h3>
              <button onClick={handleOpenAddTask} className="px-4 py-2 bg-purple-950 text-white font-bold rounded-xl text-xs cursor-pointer">
                + เพิ่มงาน To-Do ใหม่
              </button>
            </div>
          ) : (
            <div className={viewMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
              {filteredTasks.map(task => (
                <div key={task.id} className="glass-panel p-4 border border-[#E2D2EA] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFEBF3] text-purple-950 border border-[#E2D2EA]">{task.category}</span>
                    <button onClick={() => handleDeleteTask(task.id)} className="text-rose-500 hover:bg-rose-50 p-1 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="flex items-start gap-2">
                    <input type="checkbox" checked={task.completed} onChange={() => handleToggleTaskCompleted(task.id)} className="mt-1 rounded text-purple-950" />
                    <h4 className={`font-bold text-purple-950 text-sm ${task.completed ? 'line-through text-purple-400' : ''}`}>{task.title}</h4>
                  </div>
                  <p className="text-xs text-purple-800/80">{task.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: FOLLOW-UP WATCHLIST (ส่วนบันทึกงานที่ต้องติดตาม) */}
      {activeSection === 'followup' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 border-[#E2D2EA] flex items-center justify-between gap-3 text-xs">
            <span className="font-bold text-purple-950 flex items-center gap-1.5">
              <BellRing className="w-4 h-4 text-amber-600" />
              <span>รายการบันทึกงานที่ต้องตามต่อ (Follow-Up Watchlist)</span>
            </span>

            <button
              onClick={handleOpenAddFollowup}
              className="px-3.5 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-pink-300" />
              <span>+ บันทึกงานติดตามใหม่</span>
            </button>
          </div>

          {followupItems.length === 0 ? (
            <div className="glass-panel p-12 text-center border-[#E2D2EA] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF9C3] text-amber-800 flex items-center justify-center border border-[#E2D2EA] mx-auto">
                <BellRing className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-purple-950 text-sm">ยังไม่มีงานบันทึกติดตามในระบบ</h3>
              <p className="text-xs text-purple-800/80 max-w-md mx-auto">
                กดปุ่มเพื่อบันทึกงานที่ต้องตามกับทีมงาน ฟรีแลนซ์ หรือซัพพลายเออร์
              </p>
              <button
                onClick={handleOpenAddFollowup}
                className="px-4 py-2 bg-purple-950 text-white font-bold rounded-xl text-xs cursor-pointer inline-flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>+ บันทึกงานติดตามใหม่</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {followupItems.map(item => (
                <div key={item.id} className="glass-panel p-5 border border-[#E2D2EA] space-y-3 hover:shadow-xs transition">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.status === 'following' ? 'bg-amber-100 text-amber-900 border-amber-200' : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                    }`}>
                      {item.status === 'following' ? 'กำลังตามงาน' : 'ติดตามเรียบร้อย'}
                    </span>

                    <button onClick={() => handleDeleteFollowup(item.id)} className="text-rose-500 hover:bg-rose-50 p-1 rounded">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="font-bold text-purple-950 text-base">{item.title}</h4>

                  <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-800 font-medium">ตามงานกับใคร:</span>
                      <span className="font-bold text-purple-950">{item.targetPerson}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-800 font-medium">วันที่ต้องตามรอบถัดไป:</span>
                      <span className="font-mono font-bold text-amber-900">{item.nextFollowupDate}</span>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-purple-800/80 font-medium">บันทึก: {item.notes}</p>
                  )}

                  <div className="pt-2 border-t border-purple-100 flex justify-end">
                    <button
                      onClick={() => setLineModalItem({
                        id: item.id,
                        title: `[Follow-Up Alert] ตามงาน: ${item.title}`,
                        platform: item.targetPerson,
                        publish_date: item.nextFollowupDate,
                        assigned_to: item.targetPerson,
                        status: 'FOLLOW_UP',
                        media_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80'
                      })}
                      className="px-3.5 py-1.5 bg-[#FFEBF3] hover:bg-pink-200 text-purple-950 font-bold rounded-xl border border-[#E2D2EA] text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5 text-purple-700" />
                      <span>ยิงตามงานเข้า LINE</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: FILE SUBMISSION TRACKER (ส่วนติดตามไฟล์งาน - เช็กว่าส่งยัง) */}
      {activeSection === 'files' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 border-[#E2D2EA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="font-bold text-purple-950 flex items-center gap-1.5">
              <FolderCheck className="w-4 h-4 text-emerald-600" />
              <span>ตารางติดตามการส่งไฟล์งาน (File Delivery Status Tracker)</span>
            </span>

            <button
              onClick={handleOpenAddFile}
              className="px-3.5 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
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
              <h3 className="font-bold text-purple-950 text-sm">ยังไม่มีรายการติดตามไฟล์งานในระบบ</h3>
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
                  <div key={file.id} className="glass-panel p-4 border border-[#E2D2EA] space-y-3 hover:shadow-xs transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold border flex items-center gap-1.5 ${
                          isSubmitted 
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${isSubmitted ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                          <span>{isSubmitted ? 'ส่งไฟล์แล้ว 🟢' : 'ยังไม่ส่งไฟล์ 🟠'}</span>
                        </span>

                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFEBF3] text-purple-950 border border-[#E2D2EA]">
                          {file.fileType}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleFileStatus(file.id)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            isSubmitted ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {isSubmitted ? 'เปลี่ยนเป็น: ยังไม่ส่ง' : 'สลับเป็น: ส่งไฟล์แล้ว 🟢'}
                        </button>

                        <button onClick={() => handleDeleteFile(file.id)} className="text-rose-500 hover:bg-rose-50 p-1 rounded">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-purple-950 text-base">{file.fileName}</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-purple-50/70 rounded-xl border border-purple-100 text-xs">
                      <div>
                        <span className="text-purple-800 text-[10px] block">ผู้จัดทำไฟล์:</span>
                        <span className="font-bold text-purple-950">{file.assignedCreator}</span>
                      </div>
                      <div>
                        <span className="text-purple-800 text-[10px] block">เวลาที่ส่งไฟล์:</span>
                        <span className="font-mono font-bold text-purple-950">{file.submittedAt}</span>
                      </div>
                      <div>
                        <span className="text-purple-800 text-[10px] block">ลิงก์ไฟล์งาน (Drive/Cloud):</span>
                        {file.driveUrl ? (
                          <div className="flex items-center gap-1 mt-0.5">
                            <a href={file.driveUrl} target="_blank" rel="noreferrer" className="text-purple-950 font-bold hover:underline truncate flex items-center gap-1">
                              <ExternalLink className="w-3 h-3 text-purple-600 shrink-0" />
                              <span className="truncate">เปิดลิงก์ไฟล์</span>
                            </a>
                            <button onClick={() => handleCopyLink(file.driveUrl, file.id)} className="p-0.5 text-purple-600 hover:bg-purple-100 rounded">
                              {copiedId === file.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-purple-400 text-[11px]">ยังไม่มีลิงก์</span>
                        )}
                      </div>
                    </div>

                    {file.remarks && (
                      <p className="text-xs text-purple-800/80 font-medium">หมายเหตุ: {file.remarks}</p>
                    )}

                    <div className="pt-2 border-t border-purple-100 flex justify-end">
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

      {/* MODAL 1: Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="glass-panel max-w-lg w-full p-6 space-y-4 border-[#E2D2EA] shadow-2xl bg-white/95 my-8">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <h3 className="text-base font-bold text-purple-950">+ สร้างงาน To-Do ใหม่</h3>
              <button onClick={() => setShowAddTaskModal(false)} className="text-purple-400 font-bold"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">หัวข้องาน</label>
                <input type="text" required value={taskFormData.title} onChange={e => setTaskFormData({...taskFormData, title: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">หมวดหมู่</label>
                  <select value={taskFormData.category} onChange={e => setTaskFormData({...taskFormData, category: e.target.value})} className="w-full px-3 py-2 border rounded-xl font-bold">
                    <option value="Promotion Plan">Promotion Plan</option>
                    <option value="Content Plan">Content Plan</option>
                    <option value="Marketing Plan">Marketing Plan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">ผู้รับผิดชอบ</label>
                  <input type="text" required value={taskFormData.assignedTo} onChange={e => setTaskFormData({...taskFormData, assignedTo: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">รายละเอียดงาน</label>
                <textarea rows={3} value={taskFormData.description} onChange={e => setTaskFormData({...taskFormData, description: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddTaskModal(false)} className="px-4 py-2 bg-purple-50 font-bold rounded-xl">ยกเลิก</button>
                <button type="submit" className="px-5 py-2 bg-purple-950 text-white font-bold rounded-xl">+ บันทึกงาน</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Follow-up Modal */}
      {showAddFollowupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="glass-panel max-w-lg w-full p-6 space-y-4 border-[#E2D2EA] shadow-2xl bg-white/95 my-8">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <h3 className="text-base font-bold text-purple-950">+ บันทึกงานที่ต้องติดตาม (Follow-Up)</h3>
              <button onClick={() => setShowAddFollowupModal(false)} className="text-purple-400 font-bold"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveFollowup} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">ชื่องานที่ต้องติดตาม</label>
                <input type="text" required placeholder="เช่น ตามไฟล์วิดีโอ 9.9 จากเอเจนซี่ หรือ ใบเสนอราคาป้าย" value={followupFormData.title} onChange={e => setFollowupFormData({...followupFormData, title: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">ตามงานกับใคร</label>
                  <input type="text" required placeholder="เช่น คุณส้ม ทีมกราฟิก" value={followupFormData.targetPerson} onChange={e => setFollowupFormData({...followupFormData, targetPerson: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold mb-1">วันที่ต้องตามรอบถัดไป</label>
                  <input type="date" required value={followupFormData.nextFollowupDate} onChange={e => setFollowupFormData({...followupFormData, nextFollowupDate: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">บันทึกความคืบหน้า</label>
                <textarea rows={3} placeholder="ระบุรายละเอียดเพิ่มเติม..." value={followupFormData.notes} onChange={e => setFollowupFormData({...followupFormData, notes: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddFollowupModal(false)} className="px-4 py-2 bg-purple-50 font-bold rounded-xl">ยกเลิก</button>
                <button type="submit" className="px-5 py-2 bg-purple-950 text-white font-bold rounded-xl">+ บันทึกงานติดตาม</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add File Tracker Modal */}
      {showAddFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="glass-panel max-w-lg w-full p-6 space-y-4 border-[#E2D2EA] shadow-2xl bg-white/95 my-8">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <h3 className="text-base font-bold text-purple-950">+ เพิ่มรายการติดตามไฟล์งาน</h3>
              <button onClick={() => setShowAddFileModal(false)} className="text-purple-400 font-bold"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveFile} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">ชื่อไฟล์งาน / อาร์ตเวิร์ค</label>
                <input type="text" required placeholder="เช่น ภาพปก Facebook Sunscreen Aqua Gel 1 แถม 1" value={fileFormData.fileName} onChange={e => setFileFormData({...fileFormData, fileName: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">ประเภทไฟล์</label>
                  <select value={fileFormData.fileType} onChange={e => setFileFormData({...fileFormData, fileType: e.target.value})} className="w-full px-3 py-2 border rounded-xl font-bold">
                    <option value="ภาพกราฟิก AI/PSD">ภาพกราฟิก AI/PSD</option>
                    <option value="วิดีโอ MP4">วิดีโอ MP4</option>
                    <option value="สื่อสิ่งพิมพ์ POSM">สื่อสิ่งพิมพ์ POSM</option>
                    <option value="เอกสาร Brief/PDF">เอกสาร Brief/PDF</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">สถานะการส่งไฟล์</label>
                  <select value={fileFormData.deliveryStatus} onChange={e => setFileFormData({...fileFormData, deliveryStatus: e.target.value})} className="w-full px-3 py-2 border rounded-xl font-bold">
                    <option value="not_submitted">ยังไม่ส่งไฟล์ 🟠</option>
                    <option value="submitted">ส่งไฟล์แล้ว 🟢</option>
                    <option value="needs_revision">รอแก้ไข 🟡</option>
                    <option value="approved">อนุมัติแล้ว 🔵</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">ผู้จัดทำไฟล์</label>
                  <input type="text" required placeholder="เช่น คุณเจนนี่" value={fileFormData.assignedCreator} onChange={e => setFileFormData({...fileFormData, assignedCreator: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold mb-1">ลิงก์ไฟล์ (Drive / Canva / Cloud)</label>
                  <input type="url" placeholder="https://drive.google.com/..." value={fileFormData.driveUrl} onChange={e => setFileFormData({...fileFormData, driveUrl: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">หมายเหตุเพิ่มเติม</label>
                <textarea rows={2} placeholder="เช่น ไฟล์ขนาด 1080x1080px..." value={fileFormData.remarks} onChange={e => setFileFormData({...fileFormData, remarks: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddFileModal(false)} className="px-4 py-2 bg-purple-50 font-bold rounded-xl">ยกเลิก</button>
                <button type="submit" className="px-5 py-2 bg-purple-950 text-white font-bold rounded-xl">+ บันทึกติดตามไฟล์</button>
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
