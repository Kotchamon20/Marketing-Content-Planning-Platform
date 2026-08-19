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
  ArrowUpRight,
  ListTodo,
  TrendingUp,
  UserCheck,
  LayoutGrid,
  List
} from 'lucide-react';
import LineFlexModal from './LineFlexModal';

export default function TodoListModule({
  users = [],
  onTriggerNotification
}) {
  // Cleared Tasks Data State (Ready for User Real Data Entry)
  const [tasks, setTasks] = useState([]);

  // View Mode State: 'card' (default) | 'list'
  const [viewMode, setViewMode] = useState('card');

  // Filters State
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'pending' | 'in_progress' | 'completed'
  const [selectedPriority, setSelectedPriority] = useState('all'); // 'all' | 'high' | 'medium' | 'low'
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'Content Plan' | 'Marketing Plan' | 'Promotion Plan' | 'Product Campaign'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [lineModalItem, setLineModalItem] = useState(null);

  // Form Input State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Promotion Plan',
    priority: 'high',
    status: 'pending',
    assignedTo: 'ทีมการตลาด',
    dueDate: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Handlers for Add & Edit
  const handleOpenAddModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      category: 'Promotion Plan',
      priority: 'high',
      status: 'pending',
      assignedTo: 'ทีมการตลาด',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      description: ''
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      category: task.category,
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate,
      description: task.description
    });
    setShowAddModal(true);
  };

  const handleSaveForm = (e) => {
    e.preventDefault();

    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? {
        ...t,
        title: formData.title,
        category: formData.category,
        priority: formData.priority,
        status: formData.status,
        assignedTo: formData.assignedTo,
        dueDate: formData.dueDate,
        description: formData.description,
        completed: formData.status === 'completed'
      } : t));
    } else {
      const newTask = {
        id: `task-${Date.now()}`,
        title: formData.title,
        category: formData.category,
        priority: formData.priority,
        status: formData.status,
        assignedTo: formData.assignedTo,
        dueDate: formData.dueDate,
        description: formData.description,
        completed: formData.status === 'completed'
      };
      setTasks(prev => [newTask, ...prev]);
    }

    setShowAddModal(false);
  };

  // Toggle Task Completion
  const handleToggleTaskCompleted = (taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const nextCompleted = !t.completed;
      return {
        ...t,
        completed: nextCompleted,
        status: nextCompleted ? 'completed' : 'in_progress'
      };
    }));
  };

  // Delete Task
  const handleDeleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
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
      t.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchStatus && matchPriority && matchCategory && matchSearch;
  });

  // Calculate Metrics
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress' && !t.completed).length;
  const pendingCount = tasks.filter(t => t.status === 'pending' && !t.completed).length;
  const highPriorityCount = tasks.filter(t => t.priority === 'high' && !t.completed).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header Banner Panel */}
      <div className="glass-panel p-6 border-[#E2D2EA]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEBF3] border border-[#E2D2EA] text-xs font-bold text-purple-950 mb-2">
              <ListTodo className="w-3.5 h-3.5 text-purple-700" />
              <span>ระบบบริหารจัดการงาน To-Do List (Module: Task Management)</span>
            </div>
            <h2 className="text-xl font-bold text-purple-950 tracking-tight flex items-center gap-2">
              <span>รายการงานที่ต้องทำ (To-Do List & Task Action Items)</span>
            </h2>
            <p className="text-xs text-purple-800/80 font-medium mt-1">
              ติดตามสถานะงาน มอบหมายผู้รับผิดชอบ กำหนดวันเสร็จสิ้น สลับโหมด Card View / List View ได้อิสระ
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-2 cursor-pointer hover:opacity-95 self-start lg:self-auto"
          >
            <Plus className="w-4 h-4 text-pink-300" />
            <span>+ เพิ่มงาน To-Do ใหม่</span>
          </button>
        </div>

        {/* Metrics Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-purple-100/60">
          <div className="p-4 rounded-2xl bg-white border border-[#E2D2EA] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-purple-900 block">งานทั้งหมด</span>
              <span className="text-xl font-bold text-purple-950 font-mono">{totalCount} งาน</span>
              <span className="text-[10px] text-purple-700 font-medium block mt-0.5">รวมทุกหมวดหมู่การตลาด</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FFEBF3] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E2D2EA] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-purple-900 block">กำลังดำเนินการ (In Progress)</span>
              <span className="text-xl font-bold text-purple-950 font-mono">{inProgressCount} งาน</span>
              <span className="text-[10px] text-amber-700 font-bold block mt-0.5">รอดำเนินการอีก {pendingCount} งาน</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FEF9C3] text-amber-800 flex items-center justify-center border border-[#E2D2EA]">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E2D2EA] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-purple-900 block">ความสำคัญสูงมาก (High Priority)</span>
              <span className="text-xl font-bold text-rose-600 font-mono">{highPriorityCount} งาน</span>
              <span className="text-[10px] text-rose-700 font-bold block mt-0.5">ด่วนที่สุด ต้องเร่งเสร็จ</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center border border-rose-200">
              <Flag className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E2D2EA] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-purple-900 block">ทำเสร็จแล้ว (Completed)</span>
              <span className="text-xl font-bold text-emerald-700 font-mono">{completedCount} งาน</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">อัตราสำเร็จ {totalCount > 0 ? (completedCount / totalCount * 100).toFixed(0) : 0}%</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Control Panel */}
      <div className="glass-panel p-4 border-[#E2D2EA] space-y-3 text-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="font-bold text-purple-900 flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5 text-purple-600" />
              <span>สถานะงาน:</span>
            </span>

            {[
              { value: 'all', label: 'ทั้งหมด' },
              { value: 'pending', label: 'รอดำเนินการ' },
              { value: 'in_progress', label: 'กำลังทำ' },
              { value: 'completed', label: 'เสร็จสมบูรณ์' }
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value)}
                className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${selectedStatus === tab.value
                    ? 'bg-purple-950 text-white shadow-xs'
                    : 'bg-white text-purple-900 hover:bg-purple-50 border border-[#E2D2EA]'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-64">
            <Search className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่องาน ผู้รับผิดชอบ หรือรายละเอียด..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none text-xs"
            />
          </div>
        </div>

        {/* Secondary Filter Row & Layout Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-purple-100/60">
          <div className="flex flex-wrap items-center gap-3">
            {/* Priority Filter */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-[#E2D2EA]">
              <Flag className="w-3.5 h-3.5 text-purple-600" />
              <span className="font-bold text-purple-900">ระดับความด่วน:</span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-transparent font-bold text-purple-950 focus:outline-none text-xs"
              >
                <option value="all">ระดับทั้งหมด</option>
                <option value="high">สูงมาก (High)</option>
                <option value="medium">ปานกลาง (Medium)</option>
                <option value="low">ทั่วไป (Low)</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-[#E2D2EA]">
              <Tag className="w-3.5 h-3.5 text-purple-600" />
              <span className="font-bold text-purple-900">หมวดหมู่โมดูล:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent font-bold text-purple-950 focus:outline-none text-xs"
              >
                <option value="all">ทุกหมวดหมู่</option>
                <option value="Promotion Plan">แผนโปรโมท (Promotion Plan)</option>
                <option value="Content Plan">คอนเทนต์ (Content Plan)</option>
                <option value="Marketing Plan">กลยุทธ์ (Marketing Plan)</option>
                <option value="Product Campaign">แคมเปญสินค้า (Product Campaign)</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle Controls (Card View vs List View) */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E2D2EA] shadow-xs">
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer text-xs ${viewMode === 'card'
                  ? 'bg-purple-950 text-white shadow-xs'
                  : 'text-purple-900 hover:bg-purple-50'
                }`}
              title="แสดงผลรูปแบบ Card Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Card View</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer text-xs ${viewMode === 'list'
                  ? 'bg-purple-950 text-white shadow-xs'
                  : 'text-purple-900 hover:bg-purple-50'
                }`}
              title="แสดงผลรูปแบบ List รายการ"
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Task Displays Container (Card View vs List View) */}
      {filteredTasks.length === 0 ? (
        <div className="glass-panel p-12 text-center border-[#E2D2EA] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFEBF3] text-purple-800 flex items-center justify-center border border-[#E2D2EA] mx-auto">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-purple-950 text-sm">ยังไม่มีรายการงาน To-Do ในระบบ</h3>
          <p className="text-xs text-purple-800/80 max-w-md mx-auto">
            กดปุ่มด้านล่างเพื่อเริ่มสร้างรายการงาน To-Do การบ้านการตลาดใหม่
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl text-xs shadow-md hover:opacity-95 transition cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-pink-300" />
            <span>+ เพิ่มงาน To-Do ใหม่</span>
          </button>
        </div>
      ) : viewMode === 'card' ? (
        /* CARD VIEW MODE GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.map(task => (
            <div
              key={task.id}
              className={`glass-panel p-5 border flex flex-col justify-between space-y-4 hover:shadow-md transition ${task.completed
                  ? 'bg-purple-50/40 border-purple-200 opacity-80'
                  : 'bg-white border-[#E2D2EA]'
                }`}
            >
              <div>
                {/* Header Badge Row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${task.priority === 'high'
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : task.priority === 'medium'
                        ? 'bg-amber-100 text-amber-900 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                    {task.priority === 'high' ? 'ด่วนมาก' : task.priority === 'medium' ? 'ปานกลาง' : 'ทั่วไป'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(task)}
                      className="p-1 text-purple-600 hover:bg-purple-50 rounded-lg transition cursor-pointer"
                      title="แก้ไขงาน"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="ลบงาน"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Checkbox & Task Title */}
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTaskCompleted(task.id)}
                    className="mt-1 w-4 h-4 rounded text-purple-950 focus:ring-purple-500 cursor-pointer shrink-0"
                  />
                  <h3 className={`font-bold text-base text-purple-950 leading-snug ${task.completed ? 'line-through text-purple-400' : ''}`}>
                    {task.title}
                  </h3>
                </div>

                {/* Description Box */}
                <p className="mt-2.5 p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs text-purple-800/90 font-medium leading-relaxed">
                  {task.description}
                </p>

                {/* Metadata Row */}
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-purple-800 font-medium flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-purple-600" />
                      <span>มอบหมาย:</span>
                    </span>
                    <span className="font-bold text-purple-950">{task.assignedTo}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-purple-800 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-600" />
                      <span>กำหนดเสร็จ:</span>
                    </span>
                    <span className="font-mono font-bold text-purple-950">{task.dueDate}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-purple-100 flex items-center justify-between gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-md bg-[#FFEBF3] text-purple-950 text-[10px] font-bold border border-[#E2D2EA]">
                  {task.category}
                </span>

                <button
                  onClick={() => setLineModalItem({
                    id: task.id,
                    title: `[To-Do Work] ${task.title}`,
                    platform: task.assignedTo,
                    publish_date: task.dueDate,
                    assigned_to: task.assignedTo,
                    status: task.completed ? 'COMPLETED' : 'IN_PROGRESS',
                    media_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80'
                  })}
                  className="px-3 py-1.5 bg-[#FFEBF3] hover:bg-pink-200 text-purple-950 font-bold rounded-xl border border-[#E2D2EA] transition flex items-center gap-1.5 text-xs shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-purple-700" />
                  <span>ส่งเข้า LINE</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* LIST VIEW MODE ROWS */
        <div className="space-y-3">
          {filteredTasks.map(task => (
            <div
              key={task.id}
              className={`glass-panel p-4 border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${task.completed
                  ? 'bg-purple-50/40 border-purple-200 opacity-75'
                  : 'bg-white border-[#E2D2EA] hover:shadow-md'
                }`}
            >
              {/* Left Task Content & Checkbox */}
              <div className="flex items-start gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleTaskCompleted(task.id)}
                  className="mt-1 w-4 h-4 rounded text-purple-950 focus:ring-purple-500 cursor-pointer"
                />

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-bold text-sm text-purple-950 ${task.completed ? 'line-through text-purple-500' : ''}`}>
                      {task.title}
                    </h3>

                    {/* Priority Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${task.priority === 'high'
                        ? 'bg-rose-100 text-rose-800 border-rose-200'
                        : task.priority === 'medium'
                          ? 'bg-amber-100 text-amber-900 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                      {task.priority === 'high' ? 'ด่วนมาก' : task.priority === 'medium' ? 'ปานกลาง' : 'ทั่วไป'}
                    </span>

                    {/* Category Tag */}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFEBF3] text-purple-950 border border-[#E2D2EA]">
                      {task.category}
                    </span>
                  </div>

                  <p className="text-xs text-purple-800/80 font-medium">
                    {task.description}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-purple-800 pt-1 flex-wrap font-medium">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-purple-600" />
                      <span>มอบหมาย: <strong>{task.assignedTo}</strong></span>
                    </span>

                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-600" />
                      <span>กำหนดเสร็จ: <strong className="font-mono">{task.dueDate}</strong></span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 justify-end border-t md:border-t-0 pt-2 md:pt-0 border-purple-100">
                {/* LINE Alert Button */}
                <button
                  onClick={() => setLineModalItem({
                    id: task.id,
                    title: `[To-Do Work] ${task.title}`,
                    platform: task.assignedTo,
                    publish_date: task.dueDate,
                    assigned_to: task.assignedTo,
                    status: task.completed ? 'COMPLETED' : 'IN_PROGRESS',
                    media_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80'
                  })}
                  className="px-2.5 py-1.5 bg-[#FFEBF3] hover:bg-pink-200 text-purple-950 font-bold rounded-xl border border-[#E2D2EA] transition flex items-center gap-1 text-xs cursor-pointer shadow-xs"
                  title="แจ้งเตือนงานเข้า LINE Group"
                >
                  <Send className="w-3.5 h-3.5 text-purple-700" />
                  <span className="hidden sm:inline">ส่งเข้า LINE</span>
                </button>

                <button
                  onClick={() => handleOpenEditModal(task)}
                  className="p-1.5 text-purple-700 hover:bg-purple-50 rounded-xl transition cursor-pointer"
                  title="แก้ไขงาน To-Do"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  title="ลบงาน"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="glass-panel max-w-lg w-full p-6 space-y-4 border-[#E2D2EA] shadow-2xl bg-white/95 my-8">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFEBF3] text-purple-800 flex items-center justify-center border border-[#E2D2EA]">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-purple-950">
                  {editingTask ? 'แก้ไขงาน To-Do' : 'สร้างงาน To-Do ใหม่'}
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-purple-400 hover:text-purple-700 font-bold cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3 text-xs">
              <div>
                <label className="block text-purple-950 font-bold mb-1">หัวข้องาน (Task Title)</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น จัดทำอาร์ตเวิร์คโปรโมชัน หรือ เซ็ตอัปโฆษณา Facebook Ads"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-950 font-bold mb-1">หมวดหมู่โมดูล (Category)</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-bold focus:outline-none shadow-xs"
                  >
                    <option value="Promotion Plan">แผนโปรโมท (Promotion Plan)</option>
                    <option value="Content Plan">คอนเทนต์ (Content Plan)</option>
                    <option value="Marketing Plan">กลยุทธ์ (Marketing Plan)</option>
                    <option value="Product Campaign">แคมเปญสินค้า (Product Campaign)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-purple-950 font-bold mb-1">ระดับความด่วน (Priority)</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-bold focus:outline-none shadow-xs"
                  >
                    <option value="high">ด่วนมาก (High)</option>
                    <option value="medium">ปานกลาง (Medium)</option>
                    <option value="low">ทั่วไป (Low)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-purple-950 font-bold mb-1">ผู้รับผิดชอบ / ทีม (Assignee)</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ทีมกราฟิก / แอดมิน LINE OA / ทีมยิงแอด"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-purple-950 font-bold mb-1">กำหนดเสร็จ (Due Date)</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-950 font-bold mb-1">รายละเอียดงานเพิ่มเติม</label>
                <textarea
                  rows={3}
                  placeholder="ระบุข้อกำหนดเพิ่มเติม ลิงก์ไดรฟ์เก็บไฟล์ หรือคำแนะนำ..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-[#E2D2EA] rounded-xl text-purple-950 font-medium focus:outline-none shadow-xs"
                />
              </div>

              <div className="pt-3 border-t border-purple-100 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-purple-50 text-purple-900 rounded-xl font-bold hover:bg-purple-100 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 text-white font-bold rounded-xl shadow-md hover:opacity-95 transition cursor-pointer"
                >
                  {editingTask ? 'บันทึกการแก้ไข' : '+ เพิ่มงาน To-Do'}
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
