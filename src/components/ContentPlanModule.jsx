import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import LineFlexModal from './LineFlexModal';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Filter, 
  Lightbulb, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Tag, 
  Eye, 
  ThumbsUp, 
  Share2, 
  Sparkles, 
  Trash2, 
  Edit3, 
  ArrowRight,
  Send,
  BarChart2,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Video,
  Camera,
  Facebook,
  MessageSquare,
  AlertCircle,
  X,
  Award,
  Layers,
  Link as LinkIcon,
  ExternalLink,
  Save,
  Image as ImageIcon,
  FolderPlus,
  Folder,
  Check,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  SlidersHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  FileSpreadsheet,
  ClipboardPaste,
  Upload,
  TableProperties,
  Type,
  Undo2,
  Copy,
  Download
} from 'lucide-react';

export default function ContentPlanModule({
  contentItems,
  contentGroups = [],
  ideaVault,
  campaigns,
  onAddContentItem,
  onUpdateContentStatus,
  onEditContentItem,
  onAddContentGroup,
  onDeleteContentGroup,
  onAddVaultIdea,
  onConvertVaultIdeaToContent,
  onDeleteContentItem
}) {
  const [activeSubTab, setActiveSubTab] = useState('calendar'); // 'calendar' | 'vault' | 'analytics'
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list' | 'table'
  
  // Sidebar Visibility & Collapsing States (Horizontal Hide/Show & Vertical Accordion)
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [groupsCollapsed, setGroupsCollapsed] = useState(false);

  // Multi-Select Google Calendar Style Group Filter (selectedGroupNames)
  const [selectedGroupNames, setSelectedGroupNames] = useState([]);

  // Other Filter States
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calendar Month State (August 2026)
  const [currentMonth, setCurrentMonth] = useState(7); // 0-indexed: 7 = August
  const [currentYear, setCurrentYear] = useState(2026);

  // File Upload Ref for Excel Import (.xlsx / .csv)
  const fileInputRef = useRef(null);

  // Modal States
  const [showAddContentModal, setShowAddContentModal] = useState(false);
  const [showAddIdeaModal, setShowAddIdeaModal] = useState(false);
  const [showManageGroupsModal, setShowManageGroupsModal] = useState(false);
  const [showBulkPasteModal, setShowBulkPasteModal] = useState(false); // Bulk Table Import Modal
  const [selectedDetailContent, setSelectedDetailContent] = useState(null); // Content Item for Detail Modal
  const [isEditingModal, setIsEditingModal] = useState(false); // Toggle Edit Mode inside Detail Modal

  // Bulk Table Import States
  const [bulkRawText, setBulkRawText] = useState('');
  const [parsedBulkItems, setParsedBulkItems] = useState([]);

  // Spreadsheet Data Grid State (Cell Selection, Range, Undo Stack)
  const [selectedGridCell, setSelectedGridCell] = useState(null); // { row: number, col: number }
  const [gridUndoStack, setGridUndoStack] = useState([]);

  // Group Option Popover State
  const [activeGroupOptions, setActiveGroupOptions] = useState(null);

  // Calendar Drag and Drop States
  const [draggedContentItem, setDraggedContentItem] = useState(null);
  const [dragOverDay, setDragOverDay] = useState(null);

  // LINE Flex Alert Modal State
  const [lineModalItem, setLineModalItem] = useState(null);

  // Edit Content State inside Detail Modal
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editPlatform, setEditPlatform] = useState('tiktok');
  const [editGroup, setEditGroup] = useState('');
  const [editPublishDate, setEditPublishDate] = useState('');
  const [editMediaUrl, setEditMediaUrl] = useState('');
  const [editReferenceUrl, setEditReferenceUrl] = useState('');
  const [editStatus, setEditStatus] = useState('draft');
  const [editCampaignId, setEditCampaignId] = useState('');

  // New Content Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newPlatform, setNewPlatform] = useState('tiktok');
  const [newGroup, setNewGroup] = useState(contentGroups[0]?.name || 'Promotion (โปรโมชัน)');
  const [newPublishDate, setNewPublishDate] = useState('2026-08-20T10:00');
  const [newMediaUrl, setNewMediaUrl] = useState('https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80');
  const [newReferenceUrl, setNewReferenceUrl] = useState('');
  const [newCampaignId, setNewCampaignId] = useState(campaigns[0]?.id || '');

  // New Content Group Form State
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('bg-pink-50 text-rose-800 border-pink-200');

  // New Idea Form State
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaNotes, setNewIdeaNotes] = useState('');
  const [newIdeaTags, setNewIdeaTags] = useState('TikTok, Review');
  const [newIdeaPlatforms, setNewIdeaPlatforms] = useState(['tiktok', 'instagram']);

  // Preset Sample Image URLs for quick selection
  const SAMPLE_IMAGES = [
    { label: 'Radiance Serum', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80' },
    { label: 'Sunscreen Gel', url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80' },
    { label: 'Night Repair Cream', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80' },
    { label: 'PR Box Gift', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80' }
  ];

  // Preset Group Color Badges & Checkbox Styling
  const GROUP_COLORS = [
    { label: 'Rose Pink', value: 'bg-rose-50 text-rose-800 border-rose-200', checkBg: 'bg-rose-500 border-rose-500', checkBorder: 'border-rose-400' },
    { label: 'Amber Gold', value: 'bg-amber-50 text-amber-800 border-amber-200', checkBg: 'bg-amber-500 border-amber-500', checkBorder: 'border-amber-400' },
    { label: 'Purple Violet', value: 'bg-purple-50 text-purple-800 border-purple-200', checkBg: 'bg-purple-500 border-purple-500', checkBorder: 'border-purple-400' },
    { label: 'Emerald Green', value: 'bg-emerald-50 text-emerald-800 border-emerald-200', checkBg: 'bg-emerald-500 border-emerald-500', checkBorder: 'border-emerald-400' },
    { label: 'Sky Blue', value: 'bg-sky-50 text-sky-800 border-sky-200', checkBg: 'bg-sky-500 border-sky-500', checkBorder: 'border-sky-400' },
    { label: 'Indigo Teal', value: 'bg-indigo-50 text-indigo-800 border-indigo-200', checkBg: 'bg-indigo-500 border-indigo-500', checkBorder: 'border-indigo-400' }
  ];

  // Excel File Upload Handler (.xlsx, .xls, .csv)
  const handleExcelFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const dataStr = evt.target.result;
        const workbook = XLSX.read(dataStr, { type: 'binary' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (!rawData || rawData.length === 0) return;

        const items = [];
        rawData.forEach((row, index) => {
          if (!row || row.length === 0) return;

          const firstCell = String(row[0] || '').toLowerCase();
          if (index === 0 && (firstCell.includes('title') || firstCell.includes('ชื่อ') || firstCell.includes('หัวข้อ') || firstCell.includes('topic'))) {
            return;
          }

          const title = String(row[0] || `[Content #${index + 1}]`);
          const caption = String(row[1] || '');

          let platform = 'tiktok';
          let group = contentGroups[0]?.name || 'Promotion (โปรโมชัน)';
          let publish_date = '2026-08-20T10:00';
          let media_url = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80';
          let reference_url = '';

          row.forEach((colVal, cIdx) => {
            if (cIdx === 0 || cIdx === 1) return;
            const strVal = String(colVal || '').trim();
            const lower = strVal.toLowerCase();

            if (['tiktok', 'facebook', 'instagram', 'line_oa', 'youtube'].includes(lower)) {
              platform = lower;
            }
            const matchedGrp = contentGroups.find(g => g.name.toLowerCase().includes(lower) || lower.includes(g.name.toLowerCase()));
            if (matchedGrp) {
              group = matchedGrp.name;
            }
            if (strVal.includes('2026') || strVal.includes('2025') || strVal.match(/\d{2}\/\d{2}/)) {
              publish_date = strVal.includes('T') ? strVal : `${strVal}T10:00`;
            }
            if (strVal.startsWith('http')) {
              reference_url = strVal;
            }
          });

          items.push({
            id: `cnt-${Date.now()}-${index}`,
            team_id: 'team-1',
            campaign_id: campaigns[0]?.id || 'camp-1',
            creator_id: 'user-2',
            title,
            caption,
            platform,
            group,
            status: 'draft',
            publish_date,
            media_url,
            reference_url,
            performance: { views: 0, likes: 0, comments: 0, shares: 0, ctr: 0 }
          });
        });

        setParsedBulkItems(items);
        setShowBulkPasteModal(true);
      } catch (err) {
        console.error('Error reading Excel file:', err);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Export Content Items to Excel File (.xlsx)
  const handleExportToExcel = () => {
    const exportData = filteredContent.map((item, idx) => ({
      '#': idx + 1,
      'ชื่อคอนเทนต์ (Title)': item.title,
      'รายละเอียดแคปชัน (Caption)': item.caption || '',
      'กลุ่มคอนเทนต์ (Group)': item.group || '',
      'แพลตฟอร์ม (Platform)': item.platform || '',
      'สถานะ (Status)': item.status || '',
      'กำหนดการโพสต์ (Publish Date)': item.publish_date || '',
      'ลิงก์อ้างอิง (Reference Link)': item.reference_url || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Content Plan');

    XLSX.writeFile(workbook, `Nitan_Content_Plan_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Calendar Drag & Drop Handlers
  const handleCalendarDragStart = (e, item) => {
    setDraggedContentItem(item);
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCalendarDragOver = (e, dayNum) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverDay !== dayNum) {
      setDragOverDay(dayNum);
    }
  };

  const handleCalendarDragLeave = (e) => {
    e.preventDefault();
  };

  const handleCalendarDrop = (e, targetDayNum) => {
    e.preventDefault();
    setDragOverDay(null);
    
    if (!draggedContentItem) return;

    const formattedDay = targetDayNum < 10 ? `0${targetDayNum}` : `${targetDayNum}`;
    const formattedMonth = (currentMonth + 1) < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
    
    let originalTime = '10:00';
    if (draggedContentItem.publish_date && draggedContentItem.publish_date.includes('T')) {
      originalTime = draggedContentItem.publish_date.split('T')[1].substring(0, 5);
    }

    const newPublishDateStr = `${currentYear}-${formattedMonth}-${formattedDay}T${originalTime}`;

    const updatedItem = {
      ...draggedContentItem,
      publish_date: newPublishDateStr
    };

    if (onEditContentItem) {
      onEditContentItem(updatedItem);
    }

    setDraggedContentItem(null);
  };

  // Helper to extract Google Calendar style checkbox colors for a group
  const getGroupCheckboxColor = (groupColorClass) => {
    if (groupColorClass?.includes('amber')) return { bg: 'bg-amber-500 border-amber-500', border: 'border-amber-400' };
    if (groupColorClass?.includes('purple')) return { bg: 'bg-purple-500 border-purple-500', border: 'border-purple-400' };
    if (groupColorClass?.includes('emerald')) return { bg: 'bg-emerald-500 border-emerald-500', border: 'border-emerald-400' };
    if (groupColorClass?.includes('sky')) return { bg: 'bg-sky-500 border-sky-500', border: 'border-sky-400' };
    if (groupColorClass?.includes('indigo')) return { bg: 'bg-indigo-500 border-indigo-500', border: 'border-indigo-400' };
    return { bg: 'bg-rose-500 border-rose-500', border: 'border-rose-400' };
  };

  // Google Calendar style group checkbox toggle
  const toggleGroupSelection = (groupName) => {
    const allGroupNames = contentGroups.map(g => g.name);

    if (selectedGroupNames.length === 0) {
      setSelectedGroupNames(allGroupNames.filter(n => n !== groupName));
    } else if (selectedGroupNames.includes(groupName)) {
      const updated = selectedGroupNames.filter(n => n !== groupName);
      setSelectedGroupNames(updated);
    } else {
      const updated = [...selectedGroupNames, groupName];
      if (updated.length === allGroupNames.length) {
        setSelectedGroupNames([]);
      } else {
        setSelectedGroupNames(updated);
      }
    }
  };

  const isGroupChecked = (groupName) => {
    return selectedGroupNames.length === 0 || selectedGroupNames.includes(groupName);
  };

  const handleSelectAllGroups = () => {
    setSelectedGroupNames([]);
  };

  const handleClearAllGroups = () => {
    setSelectedGroupNames(['__NONE__']);
  };

  // Push Undo Snapshot
  const pushGridUndoSnapshot = () => {
    setGridUndoStack(prev => [...prev.slice(-15), JSON.parse(JSON.stringify(contentItems))]);
  };

  const handleGridUndo = () => {
    if (gridUndoStack.length === 0) return;
    const previousItems = gridUndoStack[gridUndoStack.length - 1];
    setGridUndoStack(prev => prev.slice(0, prev.length - 1));
    
    previousItems.forEach(prevItem => {
      onEditContentItem && onEditContentItem(prevItem);
    });
  };

  // Column keys mapping for spreadsheet grid paste
  const GRID_COLUMN_KEYS = ['title', 'caption', 'group', 'platform', 'status', 'publish_date', 'reference_url'];

  // Spreadsheet Paste Handler (Multi-cell, multi-row, tab & newline split)
  const handleGridCellPaste = (e, startRowIdx = 0, startColIdx = 0) => {
    const pasteText = e.clipboardData?.getData('text/plain') || '';
    if (!pasteText) return;
    e.preventDefault();

    pushGridUndoSnapshot();

    const lines = pasteText.trim().split(/\r?\n/);
    const targetItems = [...filteredContent];

    lines.forEach((line, rOffset) => {
      const targetRowIdx = startRowIdx + rOffset;
      const cols = line.split('\t');

      let itemToEdit = targetItems[targetRowIdx];
      let isNew = false;

      if (!itemToEdit) {
        itemToEdit = {
          id: `cnt-${Date.now()}-${rOffset}`,
          team_id: 'team-1',
          campaign_id: campaigns[0]?.id || 'camp-1',
          creator_id: 'user-2',
          title: '',
          caption: '',
          platform: 'tiktok',
          group: contentGroups[0]?.name || 'Promotion (โปรโมชัน)',
          status: 'draft',
          publish_date: '2026-08-20T10:00',
          media_url: '',
          reference_url: '',
          performance: { views: 0, likes: 0, comments: 0, shares: 0, ctr: 0 }
        };
        isNew = true;
      }

      const updatedObj = { ...itemToEdit };

      cols.forEach((cellVal, cOffset) => {
        const targetColIdx = startColIdx + cOffset;
        const key = GRID_COLUMN_KEYS[targetColIdx];
        if (!key) return;

        const val = cellVal.trim();
        if (key === 'platform') {
          const lower = val.toLowerCase();
          if (['tiktok', 'facebook', 'instagram', 'line_oa', 'youtube'].includes(lower)) {
            updatedObj[key] = lower;
          } else {
            updatedObj[key] = 'tiktok';
          }
        } else if (key === 'group') {
          const matchedGrp = contentGroups.find(g => g.name.toLowerCase().includes(val.toLowerCase()) || val.toLowerCase().includes(g.name.toLowerCase()));
          if (matchedGrp) {
            updatedObj[key] = matchedGrp.name;
          } else {
            updatedObj[key] = val || contentGroups[0]?.name || 'Promotion (โปรโมชัน)';
          }
        } else if (key === 'status') {
          const lower = val.toLowerCase();
          if (['draft', 'scheduled', 'published'].includes(lower)) {
            updatedObj[key] = lower;
          } else if (val.includes('ร่าง')) {
            updatedObj[key] = 'draft';
          } else if (val.includes('ตั้งเวลา')) {
            updatedObj[key] = 'scheduled';
          } else if (val.includes('โพสต์แล้ว')) {
            updatedObj[key] = 'published';
          }
        } else {
          updatedObj[key] = val;
        }
      });

      if (isNew) {
        if (onAddContentItem) onAddContentItem(updatedObj);
      } else {
        if (onEditContentItem) onEditContentItem(updatedObj);
      }
    });
  };

  // Copy selected row or entire grid as tab-separated TSV text
  const handleGridCopyAll = () => {
    const tsvLines = filteredContent.map(item => {
      return [
        item.title || '',
        item.caption || '',
        item.group || '',
        item.platform || '',
        item.status || '',
        item.publish_date || '',
        item.reference_url || ''
      ].join('\t');
    });

    const fullTSV = tsvLines.join('\n');
    navigator.clipboard.writeText(fullTSV);
  };

  // Inline Table Add New Row Handler (Creates a fresh row directly in the table view)
  const handleAddInlineTableRow = () => {
    pushGridUndoSnapshot();
    const newItem = {
      id: `cnt-${Date.now()}`,
      team_id: 'team-1',
      campaign_id: campaigns[0]?.id || 'camp-1',
      creator_id: 'user-2',
      title: '',
      caption: '',
      platform: 'tiktok',
      group: contentGroups[0]?.name || 'Promotion (โปรโมชัน)',
      status: 'draft',
      publish_date: '2026-08-20T10:00',
      media_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
      reference_url: '',
      performance: { views: 0, likes: 0, comments: 0, shares: 0, ctr: 0 }
    };

    if (onAddContentItem) {
      onAddContentItem(newItem);
    }
  };

  // Bulk Table Parser logic for Google Sheets / Excel Paste
  const handleParseBulkText = (textToParse) => {
    setBulkRawText(textToParse);
    if (!textToParse.trim()) {
      setParsedBulkItems([]);
      return;
    }

    const lines = textToParse.trim().split(/\r?\n/);
    const items = [];

    lines.forEach((line, index) => {
      if (!line.trim()) return;
      
      let cols = line.split('\t');
      if (cols.length === 1 && line.includes(',')) {
        cols = line.split(',');
      }

      cols = cols.map(c => c.trim().replace(/^["']|["']$/g, ''));

      if (index === 0 && (
        cols[0].toLowerCase().includes('title') || 
        cols[0].toLowerCase().includes('ชื่อ') || 
        cols[0].toLowerCase().includes('หัวข้อ') ||
        cols[0].toLowerCase().includes('topic')
      )) {
        return;
      }

      const title = cols[0] || `[Content #${index + 1}]`;
      const caption = cols[1] || '';
      
      let platform = 'tiktok';
      let group = contentGroups[0]?.name || 'Promotion (โปรโมชัน)';
      let publish_date = '2026-08-20T10:00';
      let media_url = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80';
      let reference_url = '';

      cols.forEach((col, cIdx) => {
        if (cIdx === 0 || cIdx === 1) return;
        const lower = col.toLowerCase();
        
        if (['tiktok', 'facebook', 'instagram', 'line_oa', 'youtube'].includes(lower)) {
          platform = lower;
        }
        const matchedGrp = contentGroups.find(g => g.name.toLowerCase().includes(lower) || lower.includes(g.name.toLowerCase()));
        if (matchedGrp) {
          group = matchedGrp.name;
        }
        if (col.includes('2026') || col.includes('2025') || col.match(/\d{2}\/\d{2}/)) {
          if (col.includes('T')) {
            publish_date = col;
          } else {
            publish_date = `${col}T10:00`;
          }
        }
        if (col.startsWith('http')) {
          reference_url = col;
        }
      });

      items.push({
        id: `cnt-${Date.now()}-${index}`,
        team_id: 'team-1',
        campaign_id: campaigns[0]?.id || 'camp-1',
        creator_id: 'user-2',
        title,
        caption,
        platform,
        group,
        status: 'draft',
        publish_date,
        media_url,
        reference_url,
        performance: { views: 0, likes: 0, comments: 0, shares: 0, ctr: 0 }
      });
    });

    setParsedBulkItems(items);
  };

  const handleConfirmBulkImport = () => {
    if (parsedBulkItems.length === 0) return;
    parsedBulkItems.forEach(item => {
      onAddContentItem(item);
    });
    setBulkRawText('');
    setParsedBulkItems([]);
    setShowBulkPasteModal(false);
  };

  // Sample Table text for demo
  const handlePasteSampleTable = () => {
    const sampleText = `[TikTok VDO] เผยเคล็ดลับผิวกระจ่างใสใน 7 วัน	กู้ผิวหมองคล้ำเร่งด่วน! เซรั่มนิทานเข้มข้น x10 #NitanSkincare	tiktok	Lutein (ลูทีน / สินค้า)	2026-08-22T10:00
[IG Carousel] 5 สัญญาณเตือนที่บอกว่าผิวคุณขาดน้ำ	เช็ค 5 ข้อนี้เลย! สไลด์ขวาเพื่อดูวิธีดูแลผิว	instagram	Educational (สาระน่ารู้)	2026-08-24T14:30
[LINE Broadcast] แจกโค้ดลับรอบโปร 9.9 ลด 200.-	สิทธิ์พิเศษเฉพาะสมาชิกนิทาน กดรับสิทธิ์เลย!	line_oa	Promotion (โปรโมชัน)	2026-08-25T09:00`;
    handleParseBulkText(sampleText);
  };

  // Open Detail Modal Handler
  const handleOpenDetailModal = (item) => {
    setSelectedDetailContent(item);
    setIsEditingModal(false);
    
    setEditTitle(item.title || '');
    setEditCaption(item.caption || '');
    setEditPlatform(item.platform || 'tiktok');
    setEditGroup(item.group || contentGroups[0]?.name || 'Promotion (โปรโมชัน)');
    setEditPublishDate(item.publish_date ? item.publish_date.substring(0, 16) : '2026-08-20T10:00');
    setEditMediaUrl(item.media_url || '');
    setEditReferenceUrl(item.reference_url || '');
    setEditStatus(item.status || 'draft');
    setEditCampaignId(item.campaign_id || campaigns[0]?.id || '');
  };

  // Save Edits Handler
  const handleSaveDetailEdits = (e) => {
    e.preventDefault();
    if (!selectedDetailContent) return;

    const updatedItem = {
      ...selectedDetailContent,
      title: editTitle,
      caption: editCaption,
      platform: editPlatform,
      group: editGroup,
      publish_date: editPublishDate,
      media_url: editMediaUrl,
      reference_url: editReferenceUrl,
      status: editStatus,
      campaign_id: editCampaignId
    };

    if (onEditContentItem) {
      onEditContentItem(updatedItem);
    }
    setSelectedDetailContent(updatedItem);
    setIsEditingModal(false);
  };

  // Create Content Group Handler
  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const groupObj = {
      id: `grp-${Date.now()}`,
      name: newGroupName.trim(),
      color: newGroupColor
    };

    if (onAddContentGroup) {
      onAddContentGroup(groupObj);
    }
    setNewGroupName('');
  };

  // Filter content
  const filteredContent = contentItems.filter(item => {
    const matchesPlatform = selectedPlatform === 'all' || item.platform === selectedPlatform;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesGroup = isGroupChecked(item.group);
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.caption.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlatform && matchesStatus && matchesGroup && matchesSearch;
  });

  const handleCreateContent = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem = {
      id: `cnt-${Date.now()}`,
      team_id: 'team-1',
      campaign_id: newCampaignId,
      creator_id: 'user-2',
      title: newTitle,
      caption: newCaption,
      platform: newPlatform,
      group: newGroup || contentGroups[0]?.name || 'Promotion (โปรโมชัน)',
      status: 'draft',
      publish_date: newPublishDate,
      media_url: newMediaUrl,
      reference_url: newReferenceUrl,
      performance: { views: 0, likes: 0, comments: 0, shares: 0, ctr: 0 }
    };

    onAddContentItem(newItem);
    setNewTitle('');
    setNewCaption('');
    setNewReferenceUrl('');
    setShowAddContentModal(false);
  };

  const handleCreateIdea = (e) => {
    e.preventDefault();
    if (!newIdeaTitle.trim()) return;

    const newIdea = {
      id: `vault-${Date.now()}`,
      team_id: 'team-1',
      title: newIdeaTitle,
      notes: newIdeaNotes,
      platforms: newIdeaPlatforms,
      tags: newIdeaTags.split(',').map(t => t.trim()),
      is_used: false,
      created_at: new Date().toISOString().split('T')[0]
    };

    onAddVaultIdea(newIdea);
    setNewIdeaTitle('');
    setNewIdeaNotes('');
    setShowAddIdeaModal(false);
  };

  const getPlatformBadge = (platform) => {
    switch (platform) {
      case 'tiktok':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium badge-platform-tiktok flex items-center gap-1"><Video className="w-3 h-3" /> TikTok</span>;
      case 'facebook':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium badge-platform-facebook flex items-center gap-1"><Facebook className="w-3 h-3" /> Facebook</span>;
      case 'instagram':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium badge-platform-instagram flex items-center gap-1"><Camera className="w-3 h-3" /> Instagram</span>;
      case 'line_oa':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium badge-platform-line flex items-center gap-1"><MessageSquare className="w-3 h-3" /> LINE OA</span>;
      default:
        return <span className="bg-pink-50 text-rose-700 px-2 py-0.5 rounded-full text-[10px] font-medium">{platform}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> โพสต์แล้ว</span>;
      case 'scheduled':
        return <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> ตั้งเวลาแล้ว</span>;
      case 'draft':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1"><FileText className="w-3 h-3" /> ร่าง (Draft)</span>;
      default:
        return null;
    }
  };

  const getGroupBadge = (groupName) => {
    if (!groupName) return null;
    const groupObj = contentGroups.find(g => g.name === groupName);
    const colorClass = groupObj?.color || 'bg-pink-50 text-rose-800 border-pink-200';
    return (
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium border ${colorClass} truncate max-w-[110px]`}>
        🏷️ {groupName}
      </span>
    );
  };

  // Helper for generating monthly calendar days
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
  const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

  const getContentForDate = (dayNum) => {
    const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    const formattedMonth = (currentMonth + 1) < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

    return filteredContent.filter(item => {
      return item.publish_date && item.publish_date.startsWith(dateStr);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Hidden File Input for Excel Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleExcelFileUpload}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />

      {/* Module Header & Sub-tab navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-pink-50 text-pink-600 border border-pink-100 shadow-sm">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-rose-950">Module 1: Content Plan & Calendar</h2>
              <p className="text-xs text-rose-700/80 font-medium">นำเข้าไฟล์ Excel (.xlsx/.csv) ปฏิทินหมวดหมู่ ตารางสเปรดชีต Editable Data Grid และส่งออกข้อมูล</p>
            </div>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-1.5 bg-pink-50/60 p-1.5 rounded-2xl border border-pink-100/80 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('calendar')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'calendar' 
                ? 'bg-white text-rose-600 shadow-sm border border-pink-100 scale-[1.02]' 
                : 'text-rose-700/70 hover:text-rose-950 hover:bg-pink-100/50'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>คอนเทนต์คาเลนดาร์ (FR-1.1)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('vault')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'vault' 
                ? 'bg-white text-rose-600 shadow-sm border border-pink-100 scale-[1.02]' 
                : 'text-rose-700/70 hover:text-rose-950 hover:bg-pink-100/50'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>คลังไอเดีย (FR-1.2)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'analytics' 
                ? 'bg-white text-rose-600 shadow-sm border border-pink-100 scale-[1.02]' 
                : 'text-rose-700/70 hover:text-rose-950 hover:bg-pink-100/50'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Performance ย้อนหลัง (FR-1.4)</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: CONTENT CALENDAR & LIST & TABLE VIEW (FR-1.1 & FR-1.3) */}
      {activeSubTab === 'calendar' && (
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              
              {/* Show/Hide Sidebar Toggle Button */}
              <button
                onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-2 cursor-pointer shadow-sm ${
                  isSidebarVisible 
                    ? 'bg-pink-100/80 text-rose-900 border-pink-300' 
                    : 'bg-white text-rose-800 border-pink-200 hover:bg-pink-50'
                }`}
                title={isSidebarVisible ? "ซ่อนแถบปฏิทินของฉัน (Hide Sidebar)" : "แสดงแถบปฏิทินของฉัน (Show Sidebar)"}
              >
                {isSidebarVisible ? <PanelLeftClose className="w-4 h-4 text-pink-600" /> : <PanelLeftOpen className="w-4 h-4 text-pink-600" />}
                <span className="font-bold">
                  {isSidebarVisible ? "ซ่อนแถบข้าง" : "ปฏิทินของฉัน"}
                </span>
              </button>

              {/* Search input */}
              <div className="relative flex-1 md:w-56">
                <Search className="w-4 h-4 text-pink-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อหรือแคปชัน..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-pink-200/80 text-rose-950 text-xs py-2 pl-9 pr-3 rounded-xl focus:outline-none focus:border-pink-400 shadow-sm font-medium"
                />
              </div>

              {/* Platform Filter */}
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="bg-white border border-pink-200 text-rose-900 text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-pink-400 cursor-pointer shadow-sm font-semibold"
              >
                <option value="all">ทุกแพลตฟอร์ม</option>
                <option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="line_oa">LINE OA</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-white border border-pink-200 text-rose-900 text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-pink-400 cursor-pointer shadow-sm font-semibold"
              >
                <option value="all">ทุกสถานะ</option>
                <option value="draft">Draft (ร่าง)</option>
                <option value="scheduled">Scheduled (ตั้งเวลา)</option>
                <option value="published">Published (โพสต์แล้ว)</option>
              </select>

            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
              
              {/* VIEW SWITCHER: CALENDAR vs LIST vs TABLE VIEW */}
              <div className="flex items-center bg-pink-50/60 p-1 rounded-xl border border-pink-200/80">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'calendar' ? 'bg-white text-rose-600 shadow-sm' : 'text-rose-700/70 hover:text-rose-950'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>ปฏิทิน</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'list' ? 'bg-white text-rose-600 shadow-sm' : 'text-rose-700/70 hover:text-rose-950'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>รายการ</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'table' ? 'bg-white text-rose-600 shadow-sm' : 'text-rose-700/70 hover:text-rose-950'
                  }`}
                >
                  <TableProperties className="w-3.5 h-3.5" />
                  <span>มุมมองตาราง</span>
                </button>
              </div>

              {/* UPLOAD EXCEL FILE BUTTON */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/90 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                title="เลือกไฟล์ .xlsx หรือ .csv เพื่อนำเข้าข้อมูลเข้าปฏิทิน"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>📥 นำเข้าไฟล์ Excel</span>
              </button>

              {/* EXPORT TO EXCEL BUTTON */}
              <button
                onClick={handleExportToExcel}
                className="px-3.5 py-2.5 bg-pink-50 hover:bg-pink-100 text-rose-900 border border-pink-200/90 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                title="ส่งออกตารางคอนเทนต์ปัจจุบันเป็นไฟล์ Excel (.xlsx)"
              >
                <Download className="w-4 h-4 text-pink-600" />
                <span>📤 ส่งออก Excel</span>
              </button>

              <button
                onClick={() => setShowAddContentModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] hover:opacity-90 text-purple-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs border border-[#E2D2EA]"
              >
                <Plus className="w-4 h-4" />
                <span>สร้างคอนเทนต์ใหม่</span>
              </button>
            </div>
          </div>

          {/* MAIN LAYOUT WITH SIDEBAR + CALENDAR / LIST / TABLE VIEW */}
          <div className="flex flex-col lg:flex-row items-start gap-6">
            
            {/* GOOGLE CALENDAR STYLE NARROWER SIDEBAR */}
            {isSidebarVisible && (
              <div className="w-full lg:w-56 shrink-0 glass-panel p-3.5 space-y-3.5 text-xs font-medium sticky top-24 transition-all duration-300">
                
                {/* Accordion Header */}
                <div className="flex items-center justify-between font-bold text-rose-950 border-b border-pink-100 pb-2.5">
                  <div className="flex items-center gap-1.5 text-xs">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-pink-500" />
                    <span>ปฏิทินของฉัน</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setGroupsCollapsed(!groupsCollapsed)}
                      className="p-1 text-rose-500 hover:bg-pink-50 rounded-lg transition cursor-pointer"
                      title="ซ่อน/แสดง รายการ"
                    >
                      {groupsCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                    </button>
                    <button 
                      onClick={() => setIsSidebarVisible(false)}
                      className="p-1 text-rose-400 hover:text-rose-600 hover:bg-pink-50 rounded-lg transition cursor-pointer"
                      title="ซ่อนแถบข้าง"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {!groupsCollapsed && (
                  <div className="space-y-2.5">
                    
                    {/* Select All / Clear All Row */}
                    <div className="flex items-center justify-between text-[10px] font-semibold text-rose-600 px-1">
                      <button 
                        onClick={handleSelectAllGroups}
                        className="hover:underline hover:text-pink-600 cursor-pointer"
                      >
                        เลือกทั้งหมด
                      </button>
                      <button 
                        onClick={handleClearAllGroups}
                        className="hover:underline hover:text-rose-700 cursor-pointer"
                      >
                        ล้างการเลือก
                      </button>
                    </div>

                    {/* Group Items Checklist */}
                    <div className="space-y-1 max-h-[420px] overflow-y-auto pr-0.5">
                      {contentGroups.map(grp => {
                        const checked = isGroupChecked(grp.name);
                        const colorOpts = getGroupCheckboxColor(grp.color);

                        return (
                          <div 
                            key={grp.id}
                            onClick={() => toggleGroupSelection(grp.name)}
                            className={`flex items-center justify-between p-1.5 rounded-xl transition-all cursor-pointer group/row ${
                              checked ? 'bg-pink-50/70 border border-pink-200/80 shadow-xs' : 'bg-white hover:bg-pink-50/30 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              
                              {/* Custom Google Calendar Checkbox Box */}
                              <div className={`w-3.5 h-3.5 rounded-[4px] flex items-center justify-center transition-colors border shrink-0 ${
                                checked ? `${colorOpts.bg} text-white shadow-xs` : `${colorOpts.border} bg-white`
                              }`}>
                                {checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>

                              {/* Label */}
                              <span className={`truncate text-[11px] ${
                                checked ? 'font-bold text-rose-950' : 'font-medium text-rose-800'
                              }`}>
                                {grp.name}
                              </span>
                            </div>

                            {/* 3-Dots Options Menu Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveGroupOptions(activeGroupOptions === grp.id ? null : grp.id);
                              }}
                              className="p-1 rounded-lg text-rose-400 hover:text-rose-700 opacity-0 group-hover/row:opacity-100 transition cursor-pointer relative shrink-0"
                              title="ตัวเลือกหมวดหมู่"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {/* Group Options Popover Menu */}
                            {activeGroupOptions === grp.id && (
                              <div 
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-2 top-8 z-30 bg-white border border-pink-200 rounded-2xl shadow-xl p-1.5 text-[11px] w-36 space-y-1 animate-in fade-in duration-150"
                              >
                                <button
                                  onClick={() => {
                                    setActiveGroupOptions(null);
                                    setShowManageGroupsModal(true);
                                  }}
                                  className="w-full text-left px-2 py-1.5 hover:bg-pink-50 text-rose-800 rounded-lg font-semibold flex items-center gap-1.5"
                                >
                                  <Edit3 className="w-3 h-3 text-pink-500" />
                                  <span>แก้ไขกลุ่ม</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveGroupOptions(null);
                                    if (onDeleteContentGroup) onDeleteContentGroup(grp.id);
                                  }}
                                  className="w-full text-left px-2 py-1.5 hover:bg-rose-50 text-rose-600 rounded-lg font-semibold flex items-center gap-1.5"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>ลบหมวดหมู่นี้</span>
                                </button>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>

                    {/* Add New Group Button */}
                    <button
                      onClick={() => setShowManageGroupsModal(true)}
                      className="w-full mt-2 py-1.5 px-2.5 rounded-xl border border-dashed border-pink-300 text-rose-700 hover:bg-pink-50 transition font-semibold text-[11px] flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-pink-500" />
                      <span>+ เพิ่มหมวดหมู่ใหม่</span>
                    </button>

                  </div>
                )}

              </div>
            )}

            {/* MAIN CONTENT AREA: CALENDAR / LIST / TABLE VIEW */}
            <div className="flex-1 min-w-0 w-full space-y-4">
              
              {/* VIEW MODE 1: VISUAL MONTHLY CALENDAR GRID */}
              {viewMode === 'calendar' && (
                <div className="glass-panel p-6 space-y-4">
                  
                  {/* Calendar Header Navigation */}
                  <div className="flex items-center justify-between border-b border-pink-100/80 pb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-rose-950 text-lg flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-pink-500" />
                        <span>{monthNames[currentMonth]} {currentYear}</span>
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-50 text-rose-800 border border-pink-200">
                        {filteredContent.length} รายการที่แสดง
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (currentMonth === 0) {
                            setCurrentMonth(11);
                            setCurrentYear(currentYear - 1);
                          } else {
                            setCurrentMonth(currentMonth - 1);
                          }
                        }}
                        className="p-2 bg-pink-50/60 hover:bg-pink-100/80 text-rose-800 rounded-xl border border-pink-200/80 cursor-pointer transition"
                        title="เดือนก่อนหน้า"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentMonth(7);
                          setCurrentYear(2026);
                        }}
                        className="px-3 py-1.5 bg-pink-50/60 hover:bg-pink-100/80 text-rose-800 rounded-xl border border-pink-200/80 text-xs font-semibold cursor-pointer transition"
                      >
                        วันนี้ (ส.ค. 2026)
                      </button>
                      <button
                        onClick={() => {
                          if (currentMonth === 11) {
                            setCurrentMonth(0);
                            setCurrentYear(currentYear + 1);
                          } else {
                            setCurrentMonth(currentMonth + 1);
                          }
                        }}
                        className="p-2 bg-pink-50/60 hover:bg-pink-100/80 text-rose-800 rounded-xl border border-pink-200/80 cursor-pointer transition"
                        title="เดือนถัดไป"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid Container */}
                  <div className="border border-pink-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                    
                    {/* Days of Week Header */}
                    <div className="grid grid-cols-7 bg-pink-50/50 border-b border-pink-100 text-center text-xs font-semibold text-rose-900 py-2.5">
                      <div className="text-rose-500">อาทิตย์</div>
                      <div>จันทร์</div>
                      <div>อังคาร</div>
                      <div>พุธ</div>
                      <div>พฤหัสบดี</div>
                      <div>ศุกร์</div>
                      <div className="text-pink-500">เสาร์</div>
                    </div>

                    {/* Days Cells Grid */}
                    <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-pink-100/60 bg-white">
                      
                      {/* Empty lead cells before 1st day of month */}
                      {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                        <div key={`empty-${idx}`} className="min-h-[110px] bg-pink-50/10 p-2 text-pink-200" />
                      ))}

                      {/* Calendar Days 1 to daysInMonth */}
                      {Array.from({ length: daysInMonth }).map((_, idx) => {
                        const dayNum = idx + 1;
                        const dateItems = getContentForDate(dayNum);
                        const isToday = dayNum === 16 && currentMonth === 7 && currentYear === 2026;
                        const isTargetHover = dragOverDay === dayNum;

                        return (
                          <div 
                            key={`day-${dayNum}`}
                            onDragOver={(e) => handleCalendarDragOver(e, dayNum)}
                            onDragLeave={handleCalendarDragLeave}
                            onDrop={(e) => handleCalendarDrop(e, dayNum)}
                            className={`min-h-[110px] p-2 transition-all flex flex-col justify-between group relative ${
                              isTargetHover 
                                ? 'bg-purple-100/80 border-2 border-dashed border-purple-400 scale-[0.99] shadow-inner' 
                                : isToday ? 'bg-pink-50/60' : 'bg-white hover:bg-pink-50/30'
                            }`}
                          >
                            {/* Day Number Row */}
                            <div className="flex items-center justify-between mb-1.5">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                isToday ? 'bg-rose-500 text-white shadow-sm' : 'text-rose-900'
                              }`}>
                                {dayNum}
                              </span>

                              <button
                                onClick={() => {
                                  const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                                  const formattedMonth = (currentMonth + 1) < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
                                  setNewPublishDate(`${currentYear}-${formattedMonth}-${formattedDay}T10:00`);
                                  setShowAddContentModal(true);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 bg-pink-50 hover:bg-pink-100 text-rose-700 rounded-lg text-[10px] font-medium border border-pink-200 transition cursor-pointer"
                                title="เพิ่มคอนเทนต์วันนี้"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Content Item Badges for Date */}
                            <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[95px] pr-0.5">
                              {dateItems.map(item => (
                                <div 
                                  key={item.id}
                                  draggable="true"
                                  onDragStart={(e) => handleCalendarDragStart(e, item)}
                                  onDragEnd={() => { setDraggedContentItem(null); setDragOverDay(null); }}
                                  onClick={() => handleOpenDetailModal(item)}
                                  className={`p-2 rounded-xl bg-pink-50/70 hover:bg-pink-100/90 border border-pink-200/90 text-[10px] space-y-1 transition-colors group/item cursor-grab active:cursor-grabbing select-none shadow-2xs ${
                                    draggedContentItem?.id === item.id ? 'opacity-40 scale-95 border-dashed border-rose-400' : ''
                                  }`}
                                  title="ลากเพื่อย้ายวันที่กำหนดโพสต์ หรือคลิกเพื่อดูรายละเอียด"
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    {getPlatformBadge(item.platform)}
                                    <div className="flex items-center gap-1">
                                      {item.reference_url && (
                                        <LinkIcon className="w-3 h-3 text-pink-400" title="มีลิงก์แนบ" />
                                      )}
                                      <span className={`w-2 h-2 rounded-full ${
                                        item.status === 'published' ? 'bg-emerald-400' : item.status === 'scheduled' ? 'bg-sky-400' : 'bg-amber-400'
                                      }`} title={item.status} />
                                    </div>
                                  </div>

                                  {/* Title */}
                                  <div className="font-semibold text-rose-950 line-clamp-1 leading-tight">{item.title}</div>
                                  
                                  {/* Group Badge Tag */}
                                  {item.group && (
                                    <div className="pt-0.5">{getGroupBadge(item.group)}</div>
                                  )}
                                </div>
                              ))}
                            </div>

                          </div>
                        );
                      })}
                    </div>

                  </div>
                </div>
              )}

              {/* VIEW MODE 2: PIPELINE LIST CARD VIEW (FR-1.3) */}
              {viewMode === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredContent.length === 0 ? (
                    <div className="col-span-full glass-panel p-12 text-center text-rose-400 font-medium">
                      ไม่พบคอนเทนต์ที่ตรงตามเงื่อนไขที่เลือก
                    </div>
                  ) : (
                    filteredContent.map(item => (
                      <div key={item.id} className="glass-panel p-5 flex flex-col justify-between space-y-4 hover:border-pink-200 transition shadow-sm">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                            {getPlatformBadge(item.platform)}
                            {item.group && getGroupBadge(item.group)}
                            {getStatusBadge(item.status)}
                          </div>

                          <h3 
                            onClick={() => handleOpenDetailModal(item)}
                            className="font-bold text-rose-950 text-sm line-clamp-2 leading-snug cursor-pointer hover:text-pink-600 transition flex items-center justify-between gap-1"
                          >
                            <span>{item.title}</span>
                          </h3>
                          <p className="text-xs text-rose-800 mt-2 line-clamp-3 leading-relaxed font-medium">{item.caption}</p>
                          
                          <div className="mt-3 pt-3 border-t border-pink-100/80 text-[11px] text-rose-700 font-medium flex items-center justify-between">
                            <span className="flex items-center gap-1 font-medium">
                              <Clock className="w-3.5 h-3.5 text-pink-400" />
                              {new Date(item.publish_date).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>

                            <button
                              onClick={() => handleOpenDetailModal(item)}
                              className="px-2.5 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-rose-700 text-[10px] font-semibold border border-pink-200 transition flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3 text-pink-500" />
                              <span>ดูและแก้ไข</span>
                            </button>
                          </div>
                        </div>

                        {/* Quick Status Switcher Pipeline */}
                        <div className="pt-3 border-t border-pink-100/80 flex items-center justify-between gap-2">
                          <div className="text-[10px] text-rose-700 font-medium">เปลี่ยนสถานะ:</div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onUpdateContentStatus(item.id, 'draft')}
                              disabled={item.status === 'draft'}
                              className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                                item.status === 'draft' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-pink-50 text-rose-700 hover:bg-pink-100'
                              }`}
                            >
                              Draft
                            </button>
                            <button
                              onClick={() => onUpdateContentStatus(item.id, 'scheduled')}
                              disabled={item.status === 'scheduled'}
                              className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                                item.status === 'scheduled' ? 'bg-sky-50 text-sky-800 border border-sky-200' : 'bg-pink-50 text-rose-700 hover:bg-pink-100'
                              }`}
                            >
                              Scheduled
                            </button>
                            <button
                              onClick={() => onUpdateContentStatus(item.id, 'published')}
                              disabled={item.status === 'published'}
                              className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                                item.status === 'published' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-pink-50 text-rose-700 hover:bg-pink-100'
                              }`}
                            >
                              Published
                            </button>
                          </div>

                          <button
                            onClick={() => onDeleteContentItem(item.id)}
                            className="p-1 text-rose-400 hover:text-rose-600 transition cursor-pointer"
                            title="ลบคอนเทนต์"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    ))
                  )}
                </div>
              )}

              {/* VIEW MODE 3: INTERACTIVE EDITABLE SPREADSHEET DATA GRID */}
              {viewMode === 'table' && (
                <div className="glass-panel p-5 space-y-4">
                  
                  {/* Spreadsheet Grid Header Bar with Undo, Copy & Paste shortcuts */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-100 pb-3">
                    <div className="flex items-center gap-2">
                      <TableProperties className="w-5 h-5 text-pink-500" />
                      <div>
                        <h3 className="font-bold text-rose-950 text-sm">ตาราง Editable Data Grid สเปรดชีตสมบูรณ์แบบ</h3>
                        <p className="text-[11px] text-rose-700/80 font-medium">รองรับ Paste (Ctrl+V) จาก Excel / Sheets, Undo (Ctrl+Z) และแก้ไขข้อมูลสดได้ทุก Cell</p>
                      </div>
                    </div>

                    {/* Toolbar Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      
                      {/* Undo Button */}
                      <button
                        onClick={handleGridUndo}
                        disabled={gridUndoStack.length === 0}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                          gridUndoStack.length > 0 
                            ? 'bg-white hover:bg-pink-50 text-rose-900 border-pink-200' 
                            : 'bg-pink-50 text-pink-300 border-pink-100 cursor-not-allowed'
                        }`}
                        title="ย้อนกลับการแก้ไข (Ctrl / Cmd + Z)"
                      >
                        <Undo2 className="w-3.5 h-3.5 text-pink-500" />
                        <span>ย้อนกลับ (Ctrl+Z)</span>
                      </button>

                      {/* Import Excel File Button */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="นำเข้าจากไฟล์ Excel (.xlsx / .csv)"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>เลือกไฟล์ Excel</span>
                      </button>

                      {/* Export Excel Button */}
                      <button
                        onClick={handleExportToExcel}
                        className="px-2.5 py-1.5 bg-white hover:bg-pink-50 text-rose-900 border border-pink-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="ส่งออกตารางคอนเทนต์ปัจจุบันเป็นไฟล์ Excel (.xlsx)"
                      >
                        <Download className="w-3.5 h-3.5 text-pink-500" />
                        <span>ส่งออก Excel</span>
                      </button>

                      {/* Copy Table Button */}
                      <button
                        onClick={handleGridCopyAll}
                        className="px-2.5 py-1.5 bg-white hover:bg-pink-50 text-rose-900 border border-pink-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="คัดลอกตารางทั้งหมดไปยัง Clipboard (Copy Tab-Separated)"
                      >
                        <Copy className="w-3.5 h-3.5 text-rose-500" />
                        <span>คัดลอกตาราง (Cmd+C)</span>
                      </button>

                      {/* Insert Row Button */}
                      <button
                        onClick={handleAddInlineTableRow}
                        className="px-3 py-1.5 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] hover:opacity-90 text-purple-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs border border-[#E2D2EA] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ แทรกแถวใหม่</span>
                      </button>
                    </div>
                  </div>

                  {/* Spreadsheet Grid Container */}
                  <div className="border border-pink-200 rounded-2xl overflow-hidden shadow-xs bg-white focus:outline-none">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse select-none">
                        <thead className="bg-pink-100/70 text-rose-950 font-bold text-[11px] border-b border-pink-200 sticky top-0">
                          <tr>
                            <th className="p-3 w-8 text-center text-rose-400">#</th>
                            <th className="p-3 min-w-[180px]">
                              <span className="flex items-center gap-1"><Type className="w-3.5 h-3.5 text-pink-500" /> ชื่อคอนเทนต์ (Title)</span>
                            </th>
                            <th className="p-3 min-w-[200px]">
                              <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-pink-500" /> แคปชัน (Caption)</span>
                            </th>
                            <th className="p-3 min-w-[140px]">
                              <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-pink-500" /> กลุ่มคอนเทนต์ (Group)</span>
                            </th>
                            <th className="p-3 min-w-[120px]">
                              <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5 text-pink-500" /> แพลตฟอร์ม</span>
                            </th>
                            <th className="p-3 min-w-[120px]">
                              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-pink-500" /> สถานะ</span>
                            </th>
                            <th className="p-3 min-w-[140px]">
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-pink-500" /> กำหนดโพสต์</span>
                            </th>
                            <th className="p-3 min-w-[140px]">
                              <span className="flex items-center gap-1"><LinkIcon className="w-3.5 h-3.5 text-pink-500" /> ลิงก์อ้างอิง</span>
                            </th>
                            <th className="p-3 text-center w-20">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-pink-100 font-medium">
                          {filteredContent.map((item, rowIdx) => (
                            <tr key={item.id} className="hover:bg-pink-50/40 transition group">
                              <td className="p-3 text-center text-rose-400 font-semibold">{rowIdx + 1}</td>
                              
                              {/* 0. Title Cell */}
                              <td className="p-1">
                                <input
                                  type="text"
                                  placeholder="พิมพ์ชื่อคอนเทนต์..."
                                  value={item.title}
                                  onFocus={() => setSelectedGridCell({ row: rowIdx, col: 0 })}
                                  onPaste={(e) => handleGridCellPaste(e, rowIdx, 0)}
                                  onChange={(e) => {
                                    pushGridUndoSnapshot();
                                    onEditContentItem && onEditContentItem({ ...item, title: e.target.value });
                                  }}
                                  className={`w-full p-2 rounded-xl font-bold text-rose-950 text-xs focus:outline-none transition ${
                                    selectedGridCell?.row === rowIdx && selectedGridCell?.col === 0
                                      ? 'bg-white border-2 border-rose-500 shadow-sm'
                                      : 'bg-pink-50/20 hover:bg-pink-50/60 border border-pink-100'
                                  }`}
                                />
                              </td>

                              {/* 1. Caption Cell */}
                              <td className="p-1">
                                <input
                                  type="text"
                                  placeholder="พิมพ์แคปชัน..."
                                  value={item.caption || ''}
                                  onFocus={() => setSelectedGridCell({ row: rowIdx, col: 1 })}
                                  onPaste={(e) => handleGridCellPaste(e, rowIdx, 1)}
                                  onChange={(e) => {
                                    pushGridUndoSnapshot();
                                    onEditContentItem && onEditContentItem({ ...item, caption: e.target.value });
                                  }}
                                  className={`w-full p-2 rounded-xl font-medium text-rose-900 text-xs focus:outline-none transition ${
                                    selectedGridCell?.row === rowIdx && selectedGridCell?.col === 1
                                      ? 'bg-white border-2 border-rose-500 shadow-sm'
                                      : 'bg-pink-50/20 hover:bg-pink-50/60 border border-pink-100'
                                  }`}
                                />
                              </td>

                              {/* 2. Group Select Cell */}
                              <td className="p-1">
                                <select
                                  value={item.group || contentGroups[0]?.name || ''}
                                  onFocus={() => setSelectedGridCell({ row: rowIdx, col: 2 })}
                                  onPaste={(e) => handleGridCellPaste(e, rowIdx, 2)}
                                  onChange={(e) => {
                                    pushGridUndoSnapshot();
                                    onEditContentItem && onEditContentItem({ ...item, group: e.target.value });
                                  }}
                                  className={`w-full p-2 rounded-xl font-semibold text-[11px] cursor-pointer focus:outline-none transition border shadow-xs ${
                                    selectedGridCell?.row === rowIdx && selectedGridCell?.col === 2
                                      ? 'bg-white border-2 border-rose-500 shadow-sm'
                                      : 'bg-pink-50/50 hover:bg-pink-100/80 border-pink-200 text-rose-900'
                                  }`}
                                >
                                  {contentGroups.map(g => (
                                    <option key={g.id} value={g.name}>
                                      🏷️ {g.name}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* 3. Platform Select Cell */}
                              <td className="p-1">
                                <select
                                  value={item.platform}
                                  onFocus={() => setSelectedGridCell({ row: rowIdx, col: 3 })}
                                  onPaste={(e) => handleGridCellPaste(e, rowIdx, 3)}
                                  onChange={(e) => {
                                    pushGridUndoSnapshot();
                                    onEditContentItem && onEditContentItem({ ...item, platform: e.target.value });
                                  }}
                                  className={`w-full p-2 rounded-xl font-semibold text-[11px] cursor-pointer focus:outline-none transition border shadow-xs ${
                                    selectedGridCell?.row === rowIdx && selectedGridCell?.col === 3
                                      ? 'bg-white border-2 border-rose-500 shadow-sm'
                                      : 'bg-pink-50/50 hover:bg-pink-100/80 border-pink-200 text-rose-900'
                                  }`}
                                >
                                  <option value="tiktok">TikTok</option>
                                  <option value="facebook">Facebook</option>
                                  <option value="instagram">Instagram</option>
                                  <option value="line_oa">LINE OA</option>
                                  <option value="youtube">YouTube</option>
                                </select>
                              </td>

                              {/* 4. Status Select Cell */}
                              <td className="p-1">
                                <select
                                  value={item.status}
                                  onFocus={() => setSelectedGridCell({ row: rowIdx, col: 4 })}
                                  onPaste={(e) => handleGridCellPaste(e, rowIdx, 4)}
                                  onChange={(e) => {
                                    pushGridUndoSnapshot();
                                    onUpdateContentStatus(item.id, e.target.value);
                                  }}
                                  className={`w-full p-2 rounded-xl font-bold text-[11px] cursor-pointer focus:outline-none border shadow-xs ${
                                    selectedGridCell?.row === rowIdx && selectedGridCell?.col === 4
                                      ? 'bg-white border-2 border-rose-500 shadow-sm text-rose-950'
                                      : item.status === 'published' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : item.status === 'scheduled' ? 'bg-sky-50 text-sky-800 border-sky-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}
                                >
                                  <option value="draft">Draft (ร่าง)</option>
                                  <option value="scheduled">Scheduled (ตั้งเวลา)</option>
                                  <option value="published">Published (โพสต์แล้ว)</option>
                                </select>
                              </td>

                              {/* 5. Date Picker Cell */}
                              <td className="p-1">
                                <input
                                  type="datetime-local"
                                  value={item.publish_date ? item.publish_date.substring(0, 16) : '2026-08-20T10:00'}
                                  onFocus={() => setSelectedGridCell({ row: rowIdx, col: 5 })}
                                  onPaste={(e) => handleGridCellPaste(e, rowIdx, 5)}
                                  onChange={(e) => {
                                    pushGridUndoSnapshot();
                                    onEditContentItem && onEditContentItem({ ...item, publish_date: e.target.value });
                                  }}
                                  className={`w-full p-1.5 rounded-xl font-medium text-rose-900 text-[11px] focus:outline-none transition ${
                                    selectedGridCell?.row === rowIdx && selectedGridCell?.col === 5
                                      ? 'bg-white border-2 border-rose-500 shadow-sm'
                                      : 'bg-pink-50/20 hover:bg-pink-50/60 border border-pink-100'
                                  }`}
                                />
                              </td>

                              {/* 6. Reference URL Cell */}
                              <td className="p-1">
                                <input
                                  type="url"
                                  placeholder="วางลิงก์แนบ..."
                                  value={item.reference_url || ''}
                                  onFocus={() => setSelectedGridCell({ row: rowIdx, col: 6 })}
                                  onPaste={(e) => handleGridCellPaste(e, rowIdx, 6)}
                                  onChange={(e) => {
                                    pushGridUndoSnapshot();
                                    onEditContentItem && onEditContentItem({ ...item, reference_url: e.target.value });
                                  }}
                                  className={`w-full p-2 rounded-xl font-mono text-rose-900 text-[10px] focus:outline-none transition ${
                                    selectedGridCell?.row === rowIdx && selectedGridCell?.col === 6
                                      ? 'bg-white border-2 border-rose-500 shadow-sm'
                                      : 'bg-pink-50/20 hover:bg-pink-50/60 border border-pink-100'
                                  }`}
                                />
                              </td>

                              {/* 7. Row Actions */}
                              <td className="p-1 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleOpenDetailModal(item)}
                                    className="p-1.5 bg-pink-50 hover:bg-pink-100 text-rose-700 rounded-lg transition border border-pink-200 cursor-pointer"
                                    title="เปิดดูการ์ดเต็ม"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      pushGridUndoSnapshot();
                                      onDeleteContentItem(item.id);
                                    }}
                                    className="p-1.5 text-rose-400 hover:text-rose-600 transition cursor-pointer"
                                    title="ลบแถวนี้"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}

                          {/* INSTANT INLINE + ADD NEW ROW BUTTON */}
                          <tr className="hover:bg-pink-50/50 transition bg-pink-50/20">
                            <td colSpan={9} className="p-0">
                              <button
                                onClick={handleAddInlineTableRow}
                                className="w-full py-3 px-4 text-left font-bold text-rose-700 hover:text-pink-600 text-xs flex items-center gap-2 cursor-pointer transition border-t border-pink-100"
                              >
                                <Plus className="w-4 h-4 text-pink-500" />
                                <span>+ แทรกแถวใหม่ (Add Row)</span>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* SUB-TAB 2: IDEA VAULT (FR-1.2) */}
      {activeSubTab === 'vault' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-rose-950 text-base flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-pink-500" />
                <span>คลังไอเดียคอนเทนต์ (Idea Vault)</span>
              </h3>
              <p className="text-xs text-rose-700/80 font-medium mt-1">
                บันทึกไอเดียที่ยังไม่ได้ใช้ ติด Tag แพลตฟอร์ม แล้วแปลงเป็น Content Plan ได้ทันที
              </p>
            </div>
            <button
              onClick={() => setShowAddIdeaModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] hover:opacity-90 text-purple-950 font-bold rounded-xl text-xs transition flex items-center gap-2 cursor-pointer shadow-xs border border-[#E2D2EA]"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มไอเดียใหม่</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ideaVault.map(idea => (
              <div key={idea.id} className="glass-panel p-5 flex flex-col justify-between space-y-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap mb-2">
                    {idea.platforms.map(plat => (
                      <span key={plat} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-pink-50 text-rose-800 uppercase border border-pink-200">
                        {plat}
                      </span>
                    ))}
                    {idea.is_used && (
                      <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        นำไปใช้แล้ว
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-rose-950 text-sm">{idea.title}</h4>
                  <p className="text-xs text-rose-800 font-medium mt-2 leading-relaxed">{idea.notes}</p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {idea.tags.map(tag => (
                      <span key={tag} className="text-[10px] text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200 flex items-center gap-1 font-medium">
                        <Tag className="w-2.5 h-2.5 text-pink-400" /> #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-pink-100">
                  <button
                    onClick={() => onConvertVaultIdeaToContent(idea)}
                    disabled={idea.is_used}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      idea.is_used 
                        ? 'bg-pink-50 text-pink-300 cursor-not-allowed border border-pink-100'
                        : 'bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] hover:opacity-90 text-purple-950 font-bold border border-[#E2D2EA] shadow-xs'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{idea.is_used ? 'ใช้งานแล้ว' : 'แปลงเป็น Content Plan (Draft)'}</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PERFORMANCE ANALYTICS (FR-1.4) */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h3 className="font-bold text-rose-950 text-base flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-pink-500" />
              <span>Performance ย้อนหลังของคอนเทนต์ที่โพสต์แล้ว (FR-1.4)</span>
            </h3>
            <p className="text-xs text-rose-700/80 font-medium">
              วิเคราะห์ความคุ้มค่า ยอดวิว การมีส่วนร่วม (Engagement) และ CTR รายคอนเทนต์
            </p>
          </div>

          <div className="glass-panel p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-rose-900">
                <thead className="bg-pink-50/70 text-rose-900 uppercase text-[10px] font-bold border-b border-pink-100">
                  <tr>
                    <th className="p-3">ชื่อคอนเทนต์</th>
                    <th className="p-3">แพลตฟอร์ม</th>
                    <th className="p-3">กลุ่มคอนเทนต์</th>
                    <th className="p-3">วันที่โพสต์</th>
                    <th className="p-3 text-right">ยอดวิว (Views)</th>
                    <th className="p-3 text-right">ยอดไลก์ (Likes)</th>
                    <th className="p-3 text-right">การแชร์ (Shares)</th>
                    <th className="p-3 text-right">CTR (%)</th>
                    <th className="p-3 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100/60 font-medium">
                  {contentItems.filter(c => c.status === 'published').map(item => (
                    <tr key={item.id} className="hover:bg-pink-50/40 transition">
                      <td className="p-3 font-bold text-rose-950">{item.title}</td>
                      <td className="p-3">{getPlatformBadge(item.platform)}</td>
                      <td className="p-3">{getGroupBadge(item.group)}</td>
                      <td className="p-3 text-rose-800">{new Date(item.publish_date).toLocaleDateString('th-TH')}</td>
                      <td className="p-3 text-right font-bold text-rose-600">{item.performance.views.toLocaleString()}</td>
                      <td className="p-3 text-right text-pink-700 font-medium">{item.performance.likes.toLocaleString()}</td>
                      <td className="p-3 text-right text-rose-600 font-medium">{item.performance.shares.toLocaleString()}</td>
                      <td className="p-3 text-right font-bold text-pink-600">{item.performance.ctr}%</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleOpenDetailModal(item)}
                          className="p-1.5 bg-pink-50 hover:bg-pink-100 text-rose-700 rounded-lg transition shadow-sm cursor-pointer border border-pink-200"
                          title="ดูและแก้ไขคอนเทนต์"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CONTENT ITEM DETAIL & EDIT MODAL */}
      {selectedDetailContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white border border-pink-100 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-5 bg-white border-b border-pink-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-pink-50 text-pink-500 border border-pink-100">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    {getPlatformBadge(selectedDetailContent.platform)}
                    {selectedDetailContent.group && getGroupBadge(selectedDetailContent.group)}
                    {getStatusBadge(selectedDetailContent.status)}
                  </div>
                  <h3 className="font-bold text-rose-950 text-base">
                    {isEditingModal ? 'แก้ไขข้อมูลคอนเทนต์ (Edit Content)' : 'รายละเอียดคอนเทนต์ (Content Details)'}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Instant LINE Alert Button */}
                <button
                  onClick={() => setLineModalItem(selectedDetailContent)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FFEBF3] hover:bg-[#FFD6E8] text-purple-950 border border-[#E2D2EA] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="ยิงส่งการ์ด Flex Message แจ้งเตือนคอนเทนต์นี้เข้ากลุ่ม LINE"
                >
                  <Send className="w-3.5 h-3.5 text-purple-700" />
                  <span>📲 ยิงเข้า LINE</span>
                </button>

                {/* Mode Switcher Button */}
                <button
                  onClick={() => setIsEditingModal(!isEditingModal)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs border ${
                    isEditingModal ? 'bg-pink-50 text-rose-800 border-pink-200' : 'bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] text-purple-950 border-[#E2D2EA]'
                  }`}
                >
                  {isEditingModal ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                  <span>{isEditingModal ? 'ดูรายละเอียด' : 'แก้ไขข้อมูล'}</span>
                </button>

                <button
                  onClick={() => setSelectedDetailContent(null)}
                  className="p-1.5 rounded-xl text-rose-400 hover:bg-pink-50 hover:text-rose-700 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            {isEditingModal ? (
              /* FORM: EDIT CONTENT */
              <form onSubmit={handleSaveDetailEdits} className="p-6 overflow-y-auto space-y-4 text-xs text-rose-900">
                <div>
                  <label className="block text-rose-800 font-bold mb-1">หัวข้อคอนเทนต์ / Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-pink-50/40 border border-pink-200 text-rose-950 p-2.5 rounded-xl focus:outline-none focus:border-pink-400 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-rose-800 font-bold mb-1">รายละเอียดแคปชัน & ข้อความโปรโมต / Caption</label>
                  <textarea
                    rows={4}
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    className="w-full bg-pink-50/40 border border-pink-200 text-rose-950 p-2.5 rounded-xl focus:outline-none focus:border-pink-400 font-medium leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-rose-800 font-bold mb-1">แพลตฟอร์มสื่อสาร</label>
                    <select
                      value={editPlatform}
                      onChange={(e) => setEditPlatform(e.target.value)}
                      className="w-full bg-pink-50/40 border border-pink-200 text-rose-950 p-2.5 rounded-xl font-medium cursor-pointer"
                    >
                      <option value="tiktok">TikTok</option>
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="line_oa">LINE OA</option>
                      <option value="youtube">YouTube</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-rose-800 font-bold mb-1">กลุ่มคอนเทนต์ (Content Group)</label>
                    <select
                      value={editGroup}
                      onChange={(e) => setEditGroup(e.target.value)}
                      className="w-full bg-pink-50/40 border border-pink-200 text-rose-950 p-2.5 rounded-xl font-medium cursor-pointer"
                    >
                      {contentGroups.map(g => (
                        <option key={g.id} value={g.name}>
                          🏷️ {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-rose-800 font-bold mb-1">กำหนดการโพสต์ (Date & Time)</label>
                    <input
                      type="datetime-local"
                      value={editPublishDate}
                      onChange={(e) => setEditPublishDate(e.target.value)}
                      className="w-full bg-pink-50/40 border border-pink-200 text-rose-950 p-2 rounded-xl font-medium"
                    />
                  </div>
                </div>

                {/* Media Image URL Attachment */}
                <div className="space-y-2 pt-2 border-t border-pink-100">
                  <label className="block text-rose-800 font-bold flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-pink-500" />
                    <span>แนบลิงก์รูปภาพประกอบ (Media Image URL)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={editMediaUrl}
                    onChange={(e) => setEditMediaUrl(e.target.value)}
                    className="w-full bg-pink-50/40 border border-pink-200 text-rose-950 p-2.5 rounded-xl focus:outline-none focus:border-pink-400 font-mono text-[11px]"
                  />
                  {/* Image Sample Presets */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-rose-600 font-medium">เลือกรูปตัวอย่าง:</span>
                    {SAMPLE_IMAGES.map((sample, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setEditMediaUrl(sample.url)}
                        className="px-2 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-rose-800 text-[10px] font-medium transition border border-pink-200 cursor-pointer"
                      >
                        {sample.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* External Link / Reference Attachment */}
                <div className="space-y-1.5 pt-2 border-t border-pink-100">
                  <label className="block text-rose-800 font-bold flex items-center gap-1.5">
                    <LinkIcon className="w-4 h-4 text-pink-500" />
                    <span>แนบลิงก์อ้างอิงเพิ่มเติม (เช่น Canva, Google Drive, Notion, คลิปต้นฉบับ)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://canva.com/design/... หรือ https://drive.google.com/..."
                    value={editReferenceUrl}
                    onChange={(e) => setEditReferenceUrl(e.target.value)}
                    className="w-full bg-pink-50/40 border border-pink-200 text-rose-950 p-2.5 rounded-xl focus:outline-none focus:border-pink-400 font-mono text-[11px]"
                  />
                </div>

                {/* Submit Edits Bar */}
                <div className="flex justify-end gap-2 pt-4 border-t border-pink-100">
                  <button
                    type="button"
                    onClick={() => setIsEditingModal(false)}
                    className="px-4 py-2 bg-pink-50 text-rose-800 rounded-xl hover:bg-pink-100 font-semibold"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] hover:opacity-90 text-purple-950 font-bold rounded-xl shadow-xs border border-[#E2D2EA] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>บันทึกการแก้ไข</span>
                  </button>
                </div>
              </form>
            ) : (
              /* VIEW MODE: CONTENT DETAILS */
              <div className="p-6 overflow-y-auto space-y-5 text-xs text-rose-900">
                
                {/* Top Banner Image & Campaign Info */}
                <div className="relative rounded-2xl overflow-hidden border border-pink-100 bg-pink-50/50 shadow-inner max-h-56 flex items-center justify-center">
                  <img 
                    src={selectedDetailContent.media_url || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80'} 
                    alt={selectedDetailContent.title}
                    className="w-full h-52 object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-4">
                    <div className="text-white space-y-1 w-full flex items-end justify-between">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-pink-500 text-white shadow-sm inline-flex items-center gap-1 mb-1">
                          <Layers className="w-3 h-3" />
                          {campaigns.find(c => c.id === selectedDetailContent.campaign_id)?.name || 'Nitan Campaign'}
                        </span>
                        <h4 className="text-sm font-bold text-white line-clamp-1">{selectedDetailContent.title}</h4>
                      </div>

                      {selectedDetailContent.media_url && (
                        <a 
                          href={selectedDetailContent.media_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-md text-[10px] font-medium border border-white/30 transition flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> ดูรูปขนาดเต็ม
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* External Link Attachment Bar (If Present) */}
                {selectedDetailContent.reference_url && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#F5EEF8] via-[#FFF0F6] to-[#EEF6FF] text-purple-950 border border-[#E2D2EA] flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-pink-200" />
                      <div>
                        <div className="font-bold text-xs">มีเอกสาร / ลิงก์อ้างอิงแนบกับคอนเทนต์นี้</div>
                        <div className="text-[10px] text-pink-100 font-mono truncate max-w-xs">{selectedDetailContent.reference_url}</div>
                      </div>
                    </div>
                    <a
                      href={selectedDetailContent.reference_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-white text-rose-700 hover:bg-pink-50 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>เปิดลิงก์แนบ</span>
                    </a>
                  </div>
                )}

                {/* Title & Publish Date */}
                <div className="glass-panel p-4 space-y-2 border-pink-100">
                  <h4 className="font-bold text-rose-950 text-base leading-snug">{selectedDetailContent.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-rose-700 font-medium pt-1 border-t border-pink-100/80">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-4 h-4 text-pink-500" />
                      กำหนดการโพสต์: <span className="font-semibold text-rose-950">{new Date(selectedDetailContent.publish_date).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' })}</span>
                    </span>
                  </div>
                </div>

                {/* Caption Box */}
                <div className="space-y-1.5">
                  <label className="font-bold text-rose-950 text-xs flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-pink-500" />
                    <span>รายละเอียดแคปชัน & ข้อความโปรโมต (Caption)</span>
                  </label>
                  <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 text-rose-900 leading-relaxed font-medium whitespace-pre-wrap">
                    {selectedDetailContent.caption}
                  </div>
                </div>

                {/* Performance Stats (If Published) */}
                {selectedDetailContent.status === 'published' && selectedDetailContent.performance && (
                  <div className="space-y-2">
                    <label className="font-bold text-rose-950 text-xs flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-pink-500" />
                      <span>สรุปผลตอบรับและ Performance (Real-Time Stats)</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-2xl bg-pink-50/50 border border-pink-100 text-center">
                        <div className="text-[10px] text-rose-600 font-semibold uppercase">ยอดวิว (Views)</div>
                        <div className="text-base font-bold text-rose-950 mt-0.5">{selectedDetailContent.performance.views.toLocaleString()}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-pink-50/50 border border-pink-100 text-center">
                        <div className="text-[10px] text-pink-600 font-semibold uppercase">ยอดไลก์ (Likes)</div>
                        <div className="text-base font-bold text-rose-950 mt-0.5">{selectedDetailContent.performance.likes.toLocaleString()}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-pink-50/50 border border-pink-100 text-center">
                        <div className="text-[10px] text-rose-600 font-semibold uppercase">การแชร์ (Shares)</div>
                        <div className="text-base font-bold text-rose-950 mt-0.5">{selectedDetailContent.performance.shares.toLocaleString()}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-pink-50/50 border border-pink-100 text-center">
                        <div className="text-[10px] text-emerald-600 font-semibold uppercase">CTR (%)</div>
                        <div className="text-base font-bold text-emerald-600 mt-0.5">{selectedDetailContent.performance.ctr}%</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Switcher Pipeline */}
                <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-2">
                  <label className="font-semibold text-rose-950 text-xs block">เปลี่ยนสถานะคอนเทนต์ใน Pipeline:</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        onUpdateContentStatus(selectedDetailContent.id, 'draft');
                        setSelectedDetailContent(prev => ({ ...prev, status: 'draft' }));
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        selectedDetailContent.status === 'draft' ? 'bg-amber-500 text-white shadow-sm' : 'bg-white text-rose-800 border border-pink-200 hover:bg-pink-50'
                      }`}
                    >
                      Draft (ร่าง)
                    </button>
                    <button
                      onClick={() => {
                        onUpdateContentStatus(selectedDetailContent.id, 'scheduled');
                        setSelectedDetailContent(prev => ({ ...prev, status: 'scheduled' }));
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        selectedDetailContent.status === 'scheduled' ? 'bg-sky-500 text-white shadow-sm' : 'bg-white text-rose-800 border border-pink-200 hover:bg-pink-50'
                      }`}
                    >
                      Scheduled (ตั้งเวลา)
                    </button>
                    <button
                      onClick={() => {
                        onUpdateContentStatus(selectedDetailContent.id, 'published');
                        setSelectedDetailContent(prev => ({ ...prev, status: 'published' }));
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        selectedDetailContent.status === 'published' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white text-rose-800 border border-pink-200 hover:bg-pink-50'
                      }`}
                    >
                      Published (โพสต์แล้ว)
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* Modal Footer */}
            <div className="p-4 bg-pink-50/40 border-t border-pink-100 flex items-center justify-between">
              <button
                onClick={() => {
                  onDeleteContentItem(selectedDetailContent.id);
                  setSelectedDetailContent(null);
                }}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>ลบคอนเทนต์นี้</span>
              </button>

              <button
                onClick={() => setSelectedDetailContent(null)}
                className="px-5 py-2 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] hover:opacity-90 text-purple-950 font-bold rounded-xl transition shadow-xs border border-[#E2D2EA] cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: BULK TABLE PASTE / IMPORT MODAL */}
      {showBulkPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-3xl bg-white border border-pink-100 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-rose-950">นำเข้าคอนเทนต์ทีละหลายรายการ (Excel / Sheets Bulk Import)</h3>
                  <p className="text-xs text-rose-700/80 font-medium">นำเข้าจากไฟล์ Excel (.xlsx / .csv) หรือคัดลอกตารางมาวางเพื่อเพิ่มพร้อมกันทีเดียว</p>
                </div>
              </div>
              <button
                onClick={() => setShowBulkPasteModal(false)}
                className="p-1 rounded-xl text-rose-400 hover:bg-pink-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="overflow-y-auto space-y-4 flex-1 pr-1 text-xs">
              
              {/* Presets & Help Bar */}
              <div className="flex items-center justify-between gap-2 bg-pink-50/50 p-3 rounded-2xl border border-pink-100 flex-wrap">
                <div className="text-[11px] text-rose-800 font-medium flex items-center gap-1.5">
                  <ClipboardPaste className="w-4 h-4 text-pink-500" />
                  <span>เลือกไฟล์ Excel หรือวางข้อความตาราง (คอลัมน์: ชื่อคอนเทนต์ | แคปชัน | แพลตฟอร์ม | กลุ่ม | วันที่)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-600 rounded-lg text-[11px] font-bold transition cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>📥 เลือกไฟล์ Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePasteSampleTable}
                    className="px-2.5 py-1 bg-white hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-lg text-[11px] font-semibold transition cursor-pointer shadow-xs"
                  >
                    📋 วางตารางตัวอย่าง
                  </button>
                  <button
                    type="button"
                    onClick={() => handleParseBulkText('')}
                    className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-pink-200 rounded-lg text-[11px] font-semibold transition cursor-pointer shadow-xs"
                  >
                    🧹 ล้างข้อมูล
                  </button>
                </div>
              </div>

              {/* Raw Textarea input */}
              <div>
                <textarea
                  rows={4}
                  placeholder={`คัดลอกแถวตารางจาก Google Sheets / Excel แล้วกด Ctrl+V หรือ Cmd+V วางลงที่นี่...
ตัวอย่าง:
[TikTok VDO] เผยผิวฉ่ำใน 7 วัน	กู้ผิวหมองคล้ำเร่งด่วน!	tiktok	Lutein (ลูทีน / สินค้า)	2026-08-22T10:00
[IG Photo] 5 เคล็ดลับทากันแดด	สไลด์ขวาเพื่อดูวิธีดูแลผิว	instagram	Educational	2026-08-24T14:30`}
                  value={bulkRawText}
                  onChange={(e) => handleParseBulkText(e.target.value)}
                  className="w-full bg-pink-50/30 border border-pink-200 text-rose-950 p-3 rounded-2xl font-mono text-[11px] focus:outline-none focus:border-pink-400 leading-relaxed shadow-inner"
                />
              </div>

              {/* Parsed Live Preview Table */}
              {parsedBulkItems.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-pink-100">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-950">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>พบรายการที่จะนำเข้า ({parsedBulkItems.length} รายการ):</span>
                    </span>
                  </div>

                  <div className="border border-pink-200 rounded-2xl overflow-hidden shadow-xs max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-[11px] text-rose-900">
                      <thead className="bg-pink-100/70 text-rose-950 uppercase font-bold text-[10px] border-b border-pink-200 sticky top-0">
                        <tr>
                          <th className="p-2.5">#</th>
                          <th className="p-2.5">ชื่อคอนเทนต์ (Title)</th>
                          <th className="p-2.5">แคปชัน (Caption)</th>
                          <th className="p-2.5">แพลตฟอร์ม</th>
                          <th className="p-2.5">กลุ่มคอนเทนต์</th>
                          <th className="p-2.5">กำหนดการโพสต์</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-pink-100 font-medium bg-white">
                        {parsedBulkItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-pink-50/50 transition">
                            <td className="p-2.5 text-rose-400 font-bold">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-rose-950 line-clamp-1">{item.title}</td>
                            <td className="p-2.5 text-rose-800 line-clamp-1">{item.caption || '-'}</td>
                            <td className="p-2.5">{getPlatformBadge(item.platform)}</td>
                            <td className="p-2.5">{getGroupBadge(item.group)}</td>
                            <td className="p-2.5 font-bold text-rose-700">
                              {new Date(item.publish_date).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-pink-50/60 border-t border-pink-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowBulkPasteModal(false)}
                className="px-4 py-2 bg-white text-rose-800 border border-pink-200 rounded-xl font-bold hover:bg-pink-50 transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkImport}
                disabled={parsedBulkItems.length === 0}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md ${
                  parsedBulkItems.length === 0
                    ? 'bg-pink-100 text-pink-300 cursor-not-allowed border border-pink-200'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/20'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>ยืนยันนำเข้า ({parsedBulkItems.length} รายการ)</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: CREATE CONTENT ITEM (SINGLE) */}
      {showAddContentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-pink-100 rounded-3xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-rose-950">สร้างรายการคอนเทนต์ใหม่</h3>
            
            <form onSubmit={handleCreateContent} className="space-y-3 text-xs">
              <div>
                <label className="block text-rose-800 font-semibold mb-1">หัวข้อคอนเทนต์ / Title</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น [TikTok VDO] เผยผิวฉ่ำวาวใน 7 วัน"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-pink-50/40 border border-pink-200 text-rose-950 p-2.5 rounded-xl focus:outline-none focus:border-pink-400 font-semibold"
                />
              </div>

              <div>
                <label className="block text-rose-800 font-semibold mb-1">แคปชัน / Caption</label>
                <textarea
                  rows={3}
                  placeholder="ใส่รายละเอียดแคปชัน แฮชแท็ก หรือโปรโมชัน..."
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  className="w-full bg-pink-50/40 border border-pink-200 text-rose-950 p-2.5 rounded-xl focus:outline-none focus:border-pink-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-rose-800 font-semibold mb-1">แพลตฟอร์ม</label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    className="w-full bg-pink-50/40 border border-pink-200 text-rose-950 p-2.5 rounded-xl font-medium cursor-pointer"
                  >
                    <option value="tiktok">TikTok</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="line_oa">LINE OA</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </div>

                <div>
                  <label className="block text-rose-800 font-semibold mb-1">กลุ่มคอนเทนต์ (Group)</label>
                  <select
                    value={newGroup}
                    onChange={(e) => setNewGroup(e.target.value)}
                    className="w-full bg-pink-50/40 border border-pink-200 text-rose-950 p-2.5 rounded-xl font-medium cursor-pointer"
                  >
                    {contentGroups.map(g => (
                      <option key={g.id} value={g.name}>
                        🏷️ {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-rose-800 font-semibold mb-1">วันที่และเวลาโพสต์</label>
                  <input
                    type="datetime-local"
                    value={newPublishDate}
                    onChange={(e) => setNewPublishDate(e.target.value)}
                    className="w-full bg-pink-50/40 border border-pink-200 text-rose-950 p-2 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Attach Media Image URL */}
              <div>
                <label className="block text-rose-800 font-semibold mb-1">แนบลิงก์รูปภาพประกอบ (Image URL)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  className="w-full bg-pink-50/40 border border-pink-200 text-rose-950 p-2.5 rounded-xl font-mono text-[11px]"
                />
              </div>

              {/* Attach External Reference URL */}
              <div>
                <label className="block text-rose-800 font-semibold mb-1">แนบลิงก์อ้างอิง / เอกสาร (เช่น Drive, Canva)</label>
                <input
                  type="url"
                  placeholder="https://canva.com/... หรือ https://drive.google.com/..."
                  value={newReferenceUrl}
                  onChange={(e) => setNewReferenceUrl(e.target.value)}
                  className="w-full bg-pink-50/40 border border-pink-200 text-rose-950 p-2.5 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => setShowAddContentModal(false)}
                  className="px-4 py-2 bg-pink-50 text-rose-800 rounded-xl hover:bg-pink-100 font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] hover:opacity-90 text-purple-950 font-bold rounded-xl shadow-xs border border-[#E2D2EA] cursor-pointer"
                >
                  บันทึกคอนเทนต์
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: MANAGE CONTENT GROUPS MODAL */}
      {showManageGroupsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-pink-100 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-pink-500" />
                <h3 className="text-base font-bold text-rose-950">จัดการกลุ่มคอนเทนต์ (Manage Content Groups)</h3>
              </div>
              <button
                onClick={() => setShowManageGroupsModal(false)}
                className="p-1 rounded-xl text-rose-400 hover:bg-pink-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Existing Groups */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              <label className="text-xs font-semibold text-rose-900 block">รายการกลุ่มปัจจุบัน ({contentGroups.length}):</label>
              {contentGroups.map(grp => (
                <div key={grp.id} className="p-2.5 rounded-xl bg-pink-50/40 border border-pink-100 flex items-center justify-between text-xs">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${grp.color}`}>
                    🏷️ {grp.name}
                  </span>
                  <button
                    onClick={() => onDeleteContentGroup && onDeleteContentGroup(grp.id)}
                    className="p-1 text-rose-400 hover:text-rose-600 transition cursor-pointer"
                    title="ลบกลุ่มนี้"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Group Form */}
            <form onSubmit={handleCreateGroup} className="space-y-3 pt-3 border-t border-pink-100 text-xs">
              <label className="text-xs font-semibold text-rose-950 block">เพิ่มกลุ่มคอนเทนต์ใหม่:</label>
              <div>
                <label className="block text-rose-800 font-semibold mb-1">ชื่อกลุ่ม (Group Name)</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น Promotion 9.9, Lutein Skincare, Branding"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full bg-pink-50/40 border border-pink-200 text-rose-950 p-2.5 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block text-rose-800 font-semibold mb-1">เลือกโทนสีประจำกลุ่ม</label>
                <select
                  value={newGroupColor}
                  onChange={(e) => setNewGroupColor(e.target.value)}
                  className="w-full bg-pink-50/40 border border-pink-200 text-rose-950 p-2.5 rounded-xl font-medium cursor-pointer"
                >
                  {GROUP_COLORS.map(c => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManageGroupsModal(false)}
                  className="px-4 py-2 bg-pink-50 text-rose-800 rounded-xl font-semibold"
                >
                  ปิด
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] hover:opacity-90 text-purple-950 font-bold rounded-xl shadow-xs border border-[#E2D2EA] cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มกลุ่ม</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: CREATE IDEA */}
      {showAddIdeaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-pink-100 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-rose-950">บันทึกไอเดียลงคลัง (Idea Vault)</h3>
            
            <form onSubmit={handleCreateIdea} className="space-y-3 text-xs">
              <div>
                <label className="block text-rose-800 font-semibold mb-1">ชื่อไอเดีย</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ทำคลิปเปรียบเทียบเนื้อครีม ก่อน-หลัง"
                  value={newIdeaTitle}
                  onChange={(e) => setNewIdeaTitle(e.target.value)}
                  className="w-full bg-pink-50/40 border border-pink-200 text-rose-950 p-2.5 rounded-xl focus:outline-none focus:border-pink-400 font-semibold"
                />
              </div>

              <div>
                <label className="block text-rose-800 font-semibold mb-1">บันทึกเพิ่มเติม</label>
                <textarea
                  rows={3}
                  placeholder="รายละเอียดไอเดีย อุปกรณ์ที่ต้องใช้ เทคนิค..."
                  value={newIdeaNotes}
                  onChange={(e) => setNewIdeaNotes(e.target.value)}
                  className="w-full bg-pink-50/40 border border-pink-200 text-rose-950 p-2.5 rounded-xl focus:outline-none focus:border-pink-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-rose-800 font-semibold mb-1">แท็ก (คั่นด้วยเครื่องหมายจุลภาค)</label>
                <input
                  type="text"
                  placeholder="Review, ASMR, Viral"
                  value={newIdeaTags}
                  onChange={(e) => setNewIdeaTags(e.target.value)}
                  className="w-full bg-pink-50/40 border border-pink-200 text-rose-950 p-2.5 rounded-xl font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => setShowAddIdeaModal(false)}
                  className="px-4 py-2 bg-pink-50 text-rose-800 rounded-xl hover:bg-pink-100 font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] hover:opacity-90 text-purple-950 font-bold rounded-xl shadow-xs border border-[#E2D2EA] cursor-pointer"
                >
                  บันทึกไอเดีย
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LINE Flex Alert Modal for Content Items */}
      <LineFlexModal 
        isOpen={!!lineModalItem} 
        onClose={() => setLineModalItem(null)} 
        defaultCampaign={lineModalItem ? { name: lineModalItem.title } : null}
      />

    </div>
  );
}
