import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import JoditEditor from 'jodit-react';
import * as XLSX from 'xlsx';
import LineFlexModal from './LineFlexModal';
import { parseExcelWithGroqAi } from '../services/groqAiService';
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
  Download,
  Settings,
  RotateCcw,
  RefreshCw,
  Globe
} from 'lucide-react';

// Multi-Select Platform Dropdown Select Component (Lucide Icons Only)
const MultiPlatformSelectDropdown = ({ platformsList, selectedPlatforms, onChange, onOpenManage, renderPlatformIcon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePlatform = (id) => {
    if (selectedPlatforms.includes(id)) {
      if (selectedPlatforms.length > 1) {
        onChange(selectedPlatforms.filter(item => item !== id));
      }
    } else {
      onChange([...selectedPlatforms, id]);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-slate-200 focus:border-pink-500 text-slate-900 font-semibold text-xs h-11 px-3 rounded-2xl transition shadow-xs flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto scrollbar-none min-w-0 flex-1 py-1 pr-1">
          {selectedPlatforms.length === 0 ? (
            <span className="text-slate-400">-- เลือกแพลตฟอร์มสื่อสาร --</span>
          ) : (
            selectedPlatforms.map(platId => {
              const platObj = platformsList.find(p => p.id === platId) || { name: platId };
              return (
                <span
                  key={platId}
                  className="px-2.5 py-1 bg-slate-100/90 text-slate-800 border border-slate-200/80 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                >
                  {renderPlatformIcon(platId)}
                  <span>{platObj.name}</span>
                </span>
              );
            })
          )}
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 shrink-0 ml-2">
          {selectedPlatforms.length > 0 && (
            <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded-md border border-pink-100 whitespace-nowrap">
              {selectedPlatforms.length} ช่องทาง
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-pink-200 rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100 text-[11px]">
            <span className="font-bold text-slate-600">แพลตฟอร์มสื่อสาร (เลือกหลายช่องทางได้)</span>
            {onOpenManage && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenManage();
                }}
                className="text-pink-600 font-bold hover:underline cursor-pointer"
              >
                + จัดการแพลตฟอร์ม
              </button>
            )}
          </div>

          {platformsList.map(p => {
            const isChecked = selectedPlatforms.includes(p.id);
            return (
              <div
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${isChecked
                  ? 'bg-pink-50 text-rose-950 border border-pink-200 shadow-2xs'
                  : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${isChecked ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-300 bg-white'
                    }`}>
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  {renderPlatformIcon(p.id)}
                  <span>{p.name}</span>
                </div>
                {isChecked && (
                  <span className="text-[10px] text-rose-600 font-bold bg-white px-2 py-0.5 rounded-md border border-pink-100">
                    เลือกแล้ว
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const compressImage = (file, maxWidth = 1000, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress as JPEG to drastically shrink file sizes compared to raw PNG
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
  });
};

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
  onUpdateContentGroups,
  onAddVaultIdea,
  onConvertVaultIdeaToContent,
  onDeleteContentItem,
  onClearAllContent
}) {
  const [activeSubTab, setActiveSubTab] = useState('calendar'); // 'calendar' | 'vault' | 'analytics'
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list' | 'table'

  // Sidebar Visibility & Collapsing States (Horizontal Hide/Show & Vertical Accordion)
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [groupsCollapsed, setGroupsCollapsed] = useState(false);

  // 4 Standard Strategic Content Groups (Matching user request)
  const DEFAULT_CONTENT_GROUPS = React.useMemo(() => [
    {
      id: 'grp-product-plan',
      name: 'Product Plan & Campaign',
      color: 'bg-purple-50 text-purple-900 border-purple-200',
      subCategories: [
        'เปิดตัวสินค้าใหม่ (New Product Launch)',
        'พรีออเดอร์ (Pre-Order)',
        'จุดเด่นสเปกสินค้า (Product Highlights)',
        'แคมเปญใหญ่ประจำไตรมาส (Mega Campaign)'
      ]
    },
    {
      id: 'grp-promo-plan',
      name: 'แผนโปรโมท (Promotion Plan)',
      color: 'bg-rose-50 text-rose-900 border-rose-200',
      subCategories: [
        'โปรโมชัน Double Day (เช่น 8.8 / 9.9)',
        'คูปองส่วนลดพิเศษ (Special Coupon)',
        'แฟลชเซลล์ Flash Sale',
        'ของแถมพิเศษ (Gift With Purchase)'
      ]
    },
    {
      id: 'grp-always-on',
      name: 'คอนเทนต์ประจำ (Always-On)',
      color: 'bg-amber-50 text-amber-900 border-amber-200',
      subCategories: [
        '⭐ รีวิวจากผู้ใช้จริง (Customer Reviews & Testimonials)',
        '🧪 เกร็ดความรู้ส่วนผสม (Skincare Knowledge & Tips)',
        '✨ สไลด์ Before & After',
        '🎬 เบื้องหลังแบรนด์ (Behind The Scenes)',
        '💬 Q&A ตอบคำถามลูกค้ายอดฮิต (FAQ)'
      ]
    },
    {
      id: 'grp-general-mkt',
      name: 'การตลาดทั่วไป (General Marketing)',
      color: 'bg-sky-50 text-sky-900 border-sky-200',
      subCategories: [
        'ข่าวสารแบรนด์ & PR',
        'กิจกรรมแจกรางวัล (Giveaway & Contest)',
        'คอนเทนต์ไวรัลตามเทรนด์ (Trending & Viral Content)'
      ]
    }
  ], []);

  // Deduplicate by name — ป้องกันกลุ่มชื่อซ้ำแสดงซ้อนกัน
  const effectiveContentGroups = (() => {
    const groups = (contentGroups && contentGroups.length > 0) ? contentGroups : [];
    const seen = new Set();
    return groups.filter(g => {
      const key = g.name?.trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })();

  // Multi-Select Google Calendar Style Group Filter (selectedGroupNames)
  const [selectedGroupNames, setSelectedGroupNames] = useState([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Sub-Category Multi-Select Filter States & Card Collapse
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [subCategoryCardCollapsed, setSubCategoryCardCollapsed] = useState(false);

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
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [excelWorkbook, setExcelWorkbook] = useState(null);
  const [availableSheets, setAvailableSheets] = useState([]);
  const [selectedSheetName, setSelectedSheetName] = useState('');
  const [isParsingWithAi, setIsParsingWithAi] = useState(false);
  const [bulkTargetGroup, setBulkTargetGroup] = useState(''); // Mandatory Group for Bulk Import

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

  // Sub-Category Management States & Handlers
  const [newSubCategoryInput, setNewSubCategoryInput] = useState({});
  const [newSubCategoryColor, setNewSubCategoryColor] = useState({});  // { [groupId]: colorValue }
  const [editingSubCategory, setEditingSubCategory] = useState(null);

  // เปลี่ยนสี Tag ของหมวดหมู่ย่อย
  const handleSetSubCategoryColor = (groupId, subName, colorValue) => {
    const currentGroups = effectiveContentGroups.map(grp => {
      if (grp.id !== groupId) return grp;
      const existing = grp.subCategoryColors || {};
      return { ...grp, subCategoryColors: { ...existing, [subName]: colorValue } };
    });
    if (onUpdateContentGroups) onUpdateContentGroups(currentGroups);
  };

  // เปลี่ยนสี Tag ของกลุ่มหลัก
  const handleUpdateGroupColor = (groupId, colorValue) => {
    const currentGroups = effectiveContentGroups.map(grp =>
      grp.id === groupId ? { ...grp, colorClass: colorValue } : grp
    );
    if (onUpdateContentGroups) onUpdateContentGroups(currentGroups);
  };

  // State ควบคุมว่ากลุ่มไหนกำลังแสดง color palette
  const [openColorPalette, setOpenColorPalette] = useState(null); // groupId | 'new'
  // State ควบคุมว่า sub-category ไหนกำลังแสดง color palette (คีย์: `${groupId}__${subName}`)
  const [openSubColorPalette, setOpenSubColorPalette] = useState(null);

  const handleAddSubCategory = (groupId, customName) => {
    const nameToAdd = (customName || newSubCategoryInput[groupId] || '').trim();
    if (!nameToAdd) return;
    const colorToUse = newSubCategoryColor[groupId] || DEFAULT_SUB_CAT_COLOR;

    const currentGroups = effectiveContentGroups.map(grp => {
      if (grp.id === groupId) {
        const existingSubs = grp.subCategories || [];
        if (existingSubs.includes(nameToAdd)) return grp;
        const existingColors = grp.subCategoryColors || {};
        return {
          ...grp,
          subCategories: [...existingSubs, nameToAdd],
          subCategoryColors: { ...existingColors, [nameToAdd]: colorToUse }
        };
      }
      return grp;
    });

    if (onUpdateContentGroups) onUpdateContentGroups(currentGroups);
    setNewSubCategoryInput(prev => ({ ...prev, [groupId]: '' }));
    setNewSubCategoryColor(prev => ({ ...prev, [groupId]: DEFAULT_SUB_CAT_COLOR }));
  };

  const handleEditSubCategory = (groupId, oldName, newName) => {
    const trimmedNew = newName.trim();
    if (!trimmedNew || trimmedNew === oldName) {
      setEditingSubCategory(null);
      return;
    }

    const currentGroups = effectiveContentGroups.map(grp => {
      if (grp.id === groupId || grp.name === groupId) {
        const existingSubs = grp.subCategories || [];
        const existingColors = grp.subCategoryColors || {};
        const newColors = { ...existingColors };
        if (newColors[oldName]) {
          newColors[trimmedNew] = newColors[oldName];
          delete newColors[oldName];
        }
        return {
          ...grp,
          subCategories: existingSubs.map(s => s === oldName ? trimmedNew : s),
          subCategoryColors: newColors
        };
      }
      return grp;
    });

    if (onUpdateContentGroups) {
      onUpdateContentGroups(currentGroups);
    }
    setEditingSubCategory(null);
  };

  const handleDeleteSubCategory = (groupId, subNameToDelete) => {
    const currentGroups = effectiveContentGroups.map(grp => {
      if (grp.id === groupId || grp.name === groupId) {
        const existingSubs = grp.subCategories || [];
        const existingColors = grp.subCategoryColors || {};
        const newColors = { ...existingColors };
        delete newColors[subNameToDelete];

        return {
          ...grp,
          subCategories: existingSubs.filter(s => s !== subNameToDelete),
          subCategoryColors: newColors
        };
      }
      return grp;
    });

    if (onUpdateContentGroups) {
      onUpdateContentGroups(currentGroups);
    }
  };

  // ช่วยบันทึกหมวดหมู่ย่อยใหม่เข้าในกลุ่มคอนเทนต์ (Group) โดยอัตโนมัติหากยังไม่มีในระบบ
  const ensureSubCategoryRegistered = (groupName, subCatName) => {
    if (!subCatName || !subCatName.trim()) return;
    const trimmedSub = subCatName.trim();
    const grpObj = effectiveContentGroups.find(g => g.name === groupName);
    if (!grpObj) return;

    const existingSubs = grpObj.subCategories || [];
    const exists = existingSubs.some(s => s.toLowerCase() === trimmedSub.toLowerCase());
    if (!exists) {
      const updatedGroups = effectiveContentGroups.map(g => {
        if (g.name === groupName) {
          return {
            ...g,
            subCategories: [...(g.subCategories || []), trimmedSub]
          };
        }
        return g;
      });
      if (onUpdateContentGroups) {
        onUpdateContentGroups(updatedGroups);
      }
    }
  };
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editVisualConcept, setEditVisualConcept] = useState('');
  const [editPlatforms, setEditPlatforms] = useState(['facebook']);
  const [editGroup, setEditGroup] = useState('');
  const [editSubCategory, setEditSubCategory] = useState('');
  const [editPublishDate, setEditPublishDate] = useState('');
  const [editMediaUrl, setEditMediaUrl] = useState('');
  const [editReferenceUrl, setEditReferenceUrl] = useState('');
  const [editStatus, setEditStatus] = useState('draft');
  const [editCampaignId, setEditCampaignId] = useState('');

  // New Content Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newVisualConcept, setNewVisualConcept] = useState('');
  const [newPlatforms, setNewPlatforms] = useState(['facebook', 'instagram', 'tiktok']);
  const [newGroup, setNewGroup] = useState(effectiveContentGroups[0]?.name || 'Product Plan & Campaign');
  const [newSubCategory, setNewSubCategory] = useState('');
  const [newPublishDate, setNewPublishDate] = useState('2026-08-20');
  const [newMediaUrl, setNewMediaUrl] = useState('');
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
  const [newIdeaReferenceUrl, setNewIdeaReferenceUrl] = useState('');

  // Helper to render SVG Lucide Platform Icons (No Emojis)
  const renderPlatformIcon = (keyOrId) => {
    const k = String(keyOrId || '').toLowerCase().trim();
    if (k.includes('facebook') || k.includes('fb')) return <Facebook className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
    if (k.includes('instagram') || k.includes('ig')) return <Camera className="w-3.5 h-3.5 text-pink-600 shrink-0" />;
    if (k.includes('tiktok')) return <Video className="w-3.5 h-3.5 text-slate-900 shrink-0" />;
    if (k.includes('line')) return <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    if (k.includes('youtube') || k.includes('yt')) return <Video className="w-3.5 h-3.5 text-red-600 shrink-0" />;
    if (k.includes('lemon8') || k.includes('sparkles')) return <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    if (k.includes('twitter') || k.includes('x_') || k.includes('share')) return <Share2 className="w-3.5 h-3.5 text-slate-700 shrink-0" />;
    return <Globe className="w-3.5 h-3.5 text-pink-500 shrink-0" />;
  };

  // Default & Dynamic Platforms List (Lucide Icons Only)
  const DEFAULT_PLATFORMS = [
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'instagram', name: 'Instagram', color: 'bg-pink-50 text-pink-700 border-pink-200' },
    { id: 'tiktok', name: 'TikTok', color: 'bg-slate-100 text-slate-900 border-slate-300' },
    { id: 'line_oa', name: 'LINE OA', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'youtube', name: 'YouTube', color: 'bg-red-50 text-red-700 border-red-200' },
    { id: 'lemon8', name: 'Lemon8', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    { id: 'x_twitter', name: 'X (Twitter)', color: 'bg-zinc-100 text-zinc-900 border-zinc-300' },
    { id: 'threads', name: 'Threads', color: 'bg-purple-50 text-purple-900 border-purple-200' }
  ];

  const [platformsList, setPlatformsList] = useState(() => {
    try {
      const saved = localStorage.getItem('nitan_platformsList');
      return saved ? JSON.parse(saved) : DEFAULT_PLATFORMS;
    } catch (e) {
      return DEFAULT_PLATFORMS;
    }
  });

  const [showManagePlatformsModal, setShowManagePlatformsModal] = useState(false);
  const [newCustomPlatformName, setNewCustomPlatformName] = useState('');
  const [editingPlatformId, setEditingPlatformId] = useState(null);
  const [editPlatformNameInput, setEditPlatformNameInput] = useState('');

  const savePlatformsList = (newList) => {
    setPlatformsList(newList);
    try {
      localStorage.setItem('nitan_platformsList', JSON.stringify(newList));
    } catch (e) { }
  };

  const handleAddPlatform = (e) => {
    e?.preventDefault();
    const trimmed = newCustomPlatformName.trim();
    if (!trimmed) return;
    const id = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (platformsList.some(p => p.id === id || p.name.toLowerCase() === trimmed.toLowerCase())) {
      alert('แพลตฟอร์มนี้มีอยู่ในระบบแล้ว');
      return;
    }
    const newPlat = {
      id,
      name: trimmed,
      color: 'bg-pink-50 text-rose-800 border-pink-200'
    };
    savePlatformsList([...platformsList, newPlat]);
    setNewCustomPlatformName('');
  };

  const handleDeletePlatform = (id) => {
    if (platformsList.length <= 1) {
      alert('ต้องมีอย่างน้อย 1 แพลตฟอร์มในระบบ');
      return;
    }
    savePlatformsList(platformsList.filter(p => p.id !== id));
  };

  const handleEditPlatform = (id) => {
    const trimmed = editPlatformNameInput.trim();
    if (!trimmed) {
      setEditingPlatformId(null);
      return;
    }
    savePlatformsList(platformsList.map(p => p.id === id ? { ...p, name: trimmed } : p));
    setEditingPlatformId(null);
  };

  // Preset Sample Image URLs for quick selection
  const SAMPLE_IMAGES = [
    { label: 'Radiance Serum', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80' },
    { label: 'Sunscreen Gel', url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80' },
    { label: 'Night Repair Cream', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80' },
    { label: 'PR Box Gift', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80' }
  ];

  // Preset Group Color Badges & Checkbox Styling
  const GROUP_COLORS = [
    { label: 'Rose Pink', value: 'bg-rose-50 text-rose-800 border-rose-200', dot: 'bg-rose-400' },
    { label: 'Amber Gold', value: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-400' },
    { label: 'Purple Violet', value: 'bg-purple-50 text-purple-800 border-purple-200', dot: 'bg-purple-500' },
    { label: 'Emerald Green', value: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
    { label: 'Sky Blue', value: 'bg-sky-50 text-sky-800 border-sky-200', dot: 'bg-sky-400' },
    { label: 'Indigo', value: 'bg-indigo-50 text-indigo-800 border-indigo-200', dot: 'bg-indigo-500' },
    { label: 'Fuchsia', value: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200', dot: 'bg-fuchsia-500' },
    { label: 'Teal', value: 'bg-teal-50 text-teal-800 border-teal-200', dot: 'bg-teal-500' },
    { label: 'Orange', value: 'bg-orange-50 text-orange-800 border-orange-200', dot: 'bg-orange-400' },
    { label: 'Lime Green', value: 'bg-lime-50 text-lime-800 border-lime-200', dot: 'bg-lime-500' },
    { label: 'Cyan', value: 'bg-cyan-50 text-cyan-800 border-cyan-200', dot: 'bg-cyan-500' },
    { label: 'Warm Pink', value: 'bg-pink-50 text-pink-800 border-pink-200', dot: 'bg-pink-400' },
    { label: 'Violet', value: 'bg-violet-50 text-violet-800 border-violet-200', dot: 'bg-violet-500' },
    { label: 'Warm Brown', value: 'bg-stone-100 text-stone-700 border-stone-300', dot: 'bg-stone-500' },
    { label: 'Slate Gray', value: 'bg-slate-100 text-slate-700 border-slate-300', dot: 'bg-slate-500' },
    { label: 'Blue', value: 'bg-blue-50 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
  ];

  // สี Tag หมวดหมู่ย่อย (Sub-Category Badge Colors)
  const SUB_CATEGORY_COLORS = [
    { label: 'Amber Gold', value: 'bg-amber-50 text-amber-900 border-amber-400', dot: 'bg-amber-400' },
    { label: 'Soft Purple', value: 'bg-purple-50 text-purple-900 border-purple-300', dot: 'bg-purple-400' },
    { label: 'Sky Blue', value: 'bg-sky-50 text-sky-900 border-sky-400', dot: 'bg-sky-400' },
    { label: 'Emerald Green', value: 'bg-emerald-50 text-emerald-900 border-emerald-400', dot: 'bg-emerald-400' },
    { label: 'Rose Pink', value: 'bg-rose-50 text-rose-900 border-rose-300', dot: 'bg-rose-400' },
    { label: 'Orange', value: 'bg-orange-50 text-orange-900 border-orange-400', dot: 'bg-orange-400' },
    { label: 'Warm Brown', value: 'bg-stone-100 text-stone-800 border-stone-400', dot: 'bg-stone-500' },
    { label: 'Slate Gray', value: 'bg-slate-100 text-slate-800 border-slate-400', dot: 'bg-slate-500' },
    { label: 'Teal', value: 'bg-teal-50 text-teal-900 border-teal-400', dot: 'bg-teal-400' },
    { label: 'Indigo', value: 'bg-indigo-50 text-indigo-900 border-indigo-300', dot: 'bg-indigo-400' },
    { label: 'Blue', value: 'bg-blue-50 text-blue-900 border-blue-300', dot: 'bg-blue-400' },
    { label: 'Fuchsia', value: 'bg-fuchsia-50 text-fuchsia-900 border-fuchsia-300', dot: 'bg-fuchsia-400' },
    { label: 'Lime', value: 'bg-lime-50 text-lime-900 border-lime-400', dot: 'bg-lime-500' },
    { label: 'Cyan', value: 'bg-cyan-50 text-cyan-900 border-cyan-400', dot: 'bg-cyan-500' },
    { label: 'Pink', value: 'bg-pink-50 text-pink-900 border-pink-300', dot: 'bg-pink-400' },
    { label: 'Violet', value: 'bg-violet-50 text-violet-900 border-violet-300', dot: 'bg-violet-400' },
  ];
  const DEFAULT_SUB_CAT_COLOR = SUB_CATEGORY_COLORS[0].value;


  // Helper to parse Thai, Excel Serial, and Standard Date strings into YYYY-MM-DD format (Date Only, No Time)
  const parseThaiDateTime = (rawVal) => {
    if (rawVal === null || rawVal === undefined || rawVal === '') return '2026-08-20';

    // Handle Date object
    if (rawVal instanceof Date) {
      if (!isNaN(rawVal.getTime())) {
        const y = rawVal.getFullYear();
        const m = String(rawVal.getMonth() + 1).padStart(2, '0');
        const d = String(rawVal.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    }

    // Handle Excel Date Serial Number (e.g. 46237 or 46237.4166)
    if (typeof rawVal === 'number') {
      const jsDate = new Date(Math.round((rawVal - 25569) * 86400 * 1000));
      if (!isNaN(jsDate.getTime())) {
        const y = jsDate.getUTCFullYear();
        const m = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
        const d = String(jsDate.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    }

    const str = String(rawVal).trim();
    if (!str) return '2026-08-20';

    // If already in ISO YYYY-MM-DD
    if (str.match(/^\d{4}-\d{2}-\d{2}/)) {
      return str.substring(0, 10);
    }

    // Clean Thai day names (จ., อ., พ., พฤ., ศ., ส., อา.) and 'น.' suffix
    const cleaned = str
      .replace(/^(จ|อ|พ|พฤ|ศ|ส|อา)\.\s*/i, '')
      .replace(/\s*น\.$/i, '')
      .trim();

    // Match ISO YYYY-MM-DD
    const isoMatch = cleaned.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    let year = 2026;
    let month = '08';
    let day = '20';

    if (isoMatch) {
      year = parseInt(isoMatch[1], 10);
      month = isoMatch[2].padStart(2, '0');
      day = isoMatch[3].padStart(2, '0');
    } else {
      const dateMatch = cleaned.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
      if (dateMatch) {
        day = dateMatch[1].padStart(2, '0');
        month = dateMatch[2].padStart(2, '0');
        let rawYear = parseInt(dateMatch[3], 10);
        if (rawYear < 100) {
          year = rawYear >= 50 ? 2500 + rawYear - 543 : 2000 + rawYear;
        } else if (rawYear > 2500) {
          year = rawYear - 543;
        } else {
          year = rawYear;
        }
      }
    }

    return `${year}-${month}-${day}`;
  };

  // Helper to format date string for display (e.g. "31/08/2026" - Date Only, No Time)
  const formatDisplayDate = (rawVal) => {
    if (!rawVal) return '-';
    try {
      const parsedIso = parseThaiDateTime(rawVal);
      if (parsedIso && parsedIso.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [y, m, d] = parsedIso.split('-');
        return `${d}/${m}/${y}`;
      }
      return String(rawVal);
    } catch (e) {
      return String(rawVal);
    }
  };

  // Helper to format date value for <input type="date"> (e.g. "2026-08-31")
  const formatIsoDateInput = (rawVal) => {
    if (!rawVal) return '2026-08-20';
    try {
      const parsedIso = parseThaiDateTime(rawVal);
      if (parsedIso && parsedIso.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return parsedIso;
      }
      return '2026-08-20';
    } catch (e) {
      return '2026-08-20';
    }
  };

  // Helper to parse Platform string (supports multiple platforms per row)
  const parsePlatformString = (platStr) => {
    if (!platStr) return ['facebook'];
    const lower = String(platStr).toLowerCase();
    const result = [];

    if (lower.includes('facebook') || lower.includes('fb')) result.push('facebook');
    if (lower.includes('instagram') || lower.includes('ig')) result.push('instagram');
    if (lower.includes('tiktok') || lower.includes('tt')) result.push('tiktok');
    if (lower.includes('line')) result.push('line_oa');
    if (lower.includes('youtube') || lower.includes('yt')) result.push('youtube');
    if (lower.includes('lemon8') || lower.includes('lemon')) result.push('lemon8');
    if (lower.includes('twitter') || lower.includes('x_') || lower.includes('x (')) result.push('x_twitter');
    if (lower.includes('threads')) result.push('threads');

    // Custom platforms matching
    platformsList.forEach(p => {
      if (lower.includes(p.id) || lower.includes(p.name.toLowerCase())) {
        if (!result.includes(p.id)) result.push(p.id);
      }
    });

    return result.length > 0 ? result : ['facebook'];
  };

  // Helper to parse Status string
  const parseStatusString = (statStr) => {
    if (!statStr) return 'draft';
    const lower = String(statStr).toLowerCase();
    if (lower.includes('scheduled') || lower.includes('ตั้งเวลา')) return 'scheduled';
    if (lower.includes('published') || lower.includes('โพสต์แล้ว')) return 'published';
    return 'draft';
  };

  // Process 2D Array of Rows (from Excel file or TSV paste) into Content Item Objects
  const processTableRows = (rows) => {
    if (!rows || rows.length === 0) return [];

    let titleCol = 0;
    let subCategoryCol = 1;  // หมวดหมู่ย่อย (Sub-Category) — อ่านจากไฟล์โดยตรง
    let visualCol = 2;
    let captionCol = 3;
    let platformCol = 4;
    let statusCol = 5;
    let dateCol = 6;
    let mediaCol = 7;

    let startIndex = 0;

    // Detect dynamic header row in first 3 rows with strict column matching priority
    for (let rIdx = 0; rIdx < Math.min(3, rows.length); rIdx++) {
      const candidateRow = rows[rIdx];
      if (candidateRow && candidateRow.some(c => {
        const s = String(c || '').toLowerCase();
        return s.includes('title') || s.includes('หัวข้อ') || s.includes('sub') || s.includes('หมวดหมู่') || s.includes('visual') || s.includes('caption') || s.includes('แคปชัน') || s.includes('platform') || s.includes('แพลตฟอร์ม');
      })) {
        startIndex = rIdx + 1;
        candidateRow.forEach((colHeader, cIdx) => {
          const headerStr = String(colHeader || '').toLowerCase().trim();

          // 1. Media URL / Image Link (Check FIRST so "ลิงก์ภาพ" isn't misidentified as visualCol)
          if (headerStr.includes('url') || headerStr.includes('ลิงก์') || headerStr.includes('link') || headerStr.includes('ภาพลิงก์')) {
            mediaCol = cIdx;
          }
          // 2. Title / Topic
          else if (headerStr.includes('title') || headerStr.includes('หัวข้อ') || headerStr.includes('topic') || headerStr.includes('ชื่อคอนเทนต์')) {
            titleCol = cIdx;
          }
          // 3. Sub-Category / หมวดหมู่ย่อย (อ่านจากไฟล์โดยตรง)
          else if (
            headerStr.includes('sub') || headerStr.includes('หมวดหมู่ย่อย') ||
            headerStr.includes('sub-category') || headerStr.includes('subcategory') ||
            headerStr.includes('pillar') || headerStr.includes('หมวดหมู่') ||
            headerStr.includes('กลุ่ม') || headerStr.includes('group') || headerStr.includes('category')
          ) {
            subCategoryCol = cIdx;
          }
          // 4. Visual Concept / รูปแบบภาพ
          else if (headerStr.includes('visual') || headerStr.includes('รูปแบบ') || headerStr.includes('ไอเดียภาพ') || headerStr.includes('แนวภาพ') || (headerStr.includes('ภาพ') && !headerStr.includes('ลิงก์'))) {
            visualCol = cIdx;
          }
          // 5. Caption / Copywriting
          else if (headerStr.includes('caption') || headerStr.includes('แคปชัน') || headerStr.includes('copywriting') || headerStr.includes('ข้อความ')) {
            captionCol = cIdx;
          }
          // 6. Platform
          else if (headerStr.includes('platform') || headerStr.includes('แพลตฟอร์ม') || headerStr.includes('ช่องทาง')) {
            platformCol = cIdx;
          }
          // 7. Status
          else if (headerStr.includes('status') || headerStr.includes('สถานะ')) {
            statusCol = cIdx;
          }
          // 8. Publish Date
          else if (headerStr.includes('publish') || headerStr.includes('กำหนดวัน') || headerStr.includes('วันโพสต์') || headerStr.includes('date') || (headerStr.includes('วัน') && !headerStr.includes('หมวดหมู่'))) {
            dateCol = cIdx;
          }
        });
        break;
      }
    }

    const items = [];
    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      let title = String(row[titleCol] ?? '').trim();
      const subCategoryRaw = String(row[subCategoryCol] ?? '').trim(); // หมวดหมู่ย่อยจากไฟล์
      const visual_concept = String(row[visualCol] ?? '').trim();
      const caption = String(row[captionCol] ?? '').trim();
      const platformRaw = String(row[platformCol] ?? '').trim();
      const statusRaw = String(row[statusCol] ?? '').trim();
      const dateRaw = row[dateCol];
      const media_url = String(row[mediaCol] ?? '').trim();

      // If all fields are empty, skip row
      if (!title && !subCategoryRaw && !visual_concept && !caption && !platformRaw && !dateRaw && !media_url) continue;

      // Fallback for title if empty but other fields exist in row
      if (!title) {
        if (caption) {
          title = caption.length > 40 ? caption.substring(0, 40) + '...' : caption;
        } else if (visual_concept) {
          title = visual_concept.length > 40 ? visual_concept.substring(0, 40) + '...' : visual_concept;
        } else {
          title = `[Content #${items.length + 1}]`;
        }
      }

      // กลุ่มคอนเทนต์หลักใช้จาก bulkTargetGroup (ตั้งแต่ขั้น Group Selector ก่อน Import)
      const group = effectiveContentGroups[0]?.name || 'Brand Vibe (Atmosphere)';

      // Match subCategory กับรายการ subCategories จริงของ Group ที่เลือก (Fuzzy match)
      let matchedSubCategory = subCategoryRaw;
      const targetGroupObj = effectiveContentGroups.find(g => g.name === bulkTargetGroup);
      const targetSubCats = targetGroupObj?.subCategories || [];
      if (subCategoryRaw && targetSubCats.length > 0) {
        const exactMatch = targetSubCats.find(s => s.toLowerCase() === subCategoryRaw.toLowerCase());
        const partialMatch = targetSubCats.find(s =>
          s.toLowerCase().includes(subCategoryRaw.toLowerCase()) ||
          subCategoryRaw.toLowerCase().includes(s.toLowerCase())
        );
        matchedSubCategory = exactMatch || partialMatch || subCategoryRaw;
      }

      items.push({
        id: `cnt-${Date.now()}-${i}`,
        team_id: 'team-1',
        campaign_id: campaigns[0]?.id || 'camp-1',
        creator_id: 'user-2',
        title,
        caption,
        visual_concept,
        platform: parsePlatformString(platformRaw),
        group,
        subCategory: matchedSubCategory,  // อ่านจากไฟล์ + match กับ subCategories ในระบบ
        status: parseStatusString(statusRaw),
        publish_date: parseThaiDateTime(dateRaw),
        media_url: media_url.startsWith('http') ? media_url : (media_url ? `https://${media_url}` : ''),
        reference_url: '',
        performance: { views: 0, likes: 0, comments: 0, shares: 0, ctr: 0 }
      });
    }

    return items;
  };

  // TSV Parser for pasted multi-row multiline text with quotes
  const parseTSVTextToRows = (text) => {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentCell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === '\t' && !inQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') i++;
        currentRow.push(currentCell.trim());
        if (currentRow.some(c => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }

    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(c => c.length > 0)) {
        rows.push(currentRow);
      }
    }

    return rows;
  };

  // Helper to format a 2D row array into proper TSV text (handling multiline & quotes)
  const formatRowsToTSV = (rows) => {
    if (!Array.isArray(rows)) return '';
    return rows.map(row => {
      if (!Array.isArray(row)) return String(row || '');
      return row.map(cell => {
        if (cell === null || cell === undefined) return '';
        const str = String(cell);
        if (str.includes('\t') || str.includes('\n') || str.includes('"')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join('\t');
    }).join('\n');
  };

  // Reset Bulk Import state & file input (allow refresh/re-upload at any time)
  const handleResetBulkImport = () => {
    setBulkRawText('');
    setParsedBulkItems([]);
    setUploadedFileName('');
    setExcelWorkbook(null);
    setAvailableSheets([]);
    setSelectedSheetName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Process data from a given sheet inside an open workbook
  const processSheetData = (sheet, sheetName) => {
    if (!sheet) return;
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (!rawData || rawData.length === 0) return;

    const tsvText = formatRowsToTSV(rawData);
    setBulkRawText(tsvText);

    const items = processTableRows(rawData);
    setParsedBulkItems(items);
    setSelectedSheetName(sheetName);
  };

  // Handle switching active sheet from dropdown
  const handleSwitchSheet = (targetSheetName) => {
    if (!excelWorkbook || !excelWorkbook.Sheets[targetSheetName]) return;
    const targetSheet = excelWorkbook.Sheets[targetSheetName];
    processSheetData(targetSheet, targetSheetName);
  };

  // Import Content Items from Excel File (.xlsx / .csv)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset old state immediately
    setBulkRawText('');
    setParsedBulkItems([]);
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        setExcelWorkbook(workbook);

        const sheetNames = workbook.SheetNames || [];
        setAvailableSheets(sheetNames);

        if (sheetNames.length === 0) {
          alert('⚠️ ไม่พบ Sheet ในไฟล์ Excel ที่เลือก');
          return;
        }

        // Pick the sheet with maximum rows
        let chosenSheetName = sheetNames[0];
        let maxRows = 0;

        sheetNames.forEach(sName => {
          const s = workbook.Sheets[sName];
          const rows = XLSX.utils.sheet_to_json(s, { header: 1, defval: '' });
          if (rows && rows.length > maxRows) {
            maxRows = rows.length;
            chosenSheetName = sName;
          }
        });

        const worksheet = workbook.Sheets[chosenSheetName];
        processSheetData(worksheet, chosenSheetName);
        setShowBulkPasteModal(true);

      } catch (err) {
        console.error('Error reading Excel file:', err);
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ Excel: ' + err.message);
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Export Content Items to Excel File (.xlsx)
  const handleExportToExcel = () => {
    const exportData = filteredContent.map((item, idx) => ({
      '#': idx + 1,
      'หัวข้อคอนเทนต์ (Title)': item.title || '',
      'หมวดหมู่ (Pillar)': item.group || '',
      'หมวดหมู่ย่อย (Sub-Category)': item.subCategory || '',
      'รูปแบบ & ไอเดียภาพ (Visual)': item.visual_concept || '',
      'ไอเดีย Copywriting / แคปชัน (Caption)': item.caption || '',
      'แพลตฟอร์มเผยแพร่ (Platform)': item.platform || '',
      'สถานะ (Status)': item.status || '',
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

  const getGroupCheckboxColor = (groupColorClass) => {
    const classStr = groupColorClass || '';
    if (classStr.includes('amber')) return { bg: 'bg-amber-500 border-amber-500', border: 'border-amber-400' };
    if (classStr.includes('purple')) return { bg: 'bg-purple-500 border-purple-500', border: 'border-purple-400' };
    if (classStr.includes('emerald')) return { bg: 'bg-emerald-500 border-emerald-500', border: 'border-emerald-400' };
    if (classStr.includes('sky')) return { bg: 'bg-sky-500 border-sky-500', border: 'border-sky-400' };
    if (classStr.includes('indigo')) return { bg: 'bg-indigo-500 border-indigo-500', border: 'border-indigo-400' };
    if (classStr.includes('fuchsia')) return { bg: 'bg-fuchsia-500 border-fuchsia-500', border: 'border-fuchsia-400' };
    if (classStr.includes('teal')) return { bg: 'bg-teal-500 border-teal-500', border: 'border-teal-400' };
    if (classStr.includes('orange')) return { bg: 'bg-orange-500 border-orange-500', border: 'border-orange-400' };
    if (classStr.includes('lime')) return { bg: 'bg-lime-500 border-lime-500', border: 'border-lime-400' };
    if (classStr.includes('cyan')) return { bg: 'bg-cyan-500 border-cyan-500', border: 'border-cyan-400' };
    if (classStr.includes('pink')) return { bg: 'bg-pink-500 border-pink-500', border: 'border-pink-400' };
    if (classStr.includes('violet')) return { bg: 'bg-violet-500 border-violet-500', border: 'border-violet-400' };
    if (classStr.includes('stone')) return { bg: 'bg-stone-500 border-stone-500', border: 'border-stone-400' };
    if (classStr.includes('slate')) return { bg: 'bg-slate-500 border-slate-500', border: 'border-slate-400' };
    if (classStr.includes('blue')) return { bg: 'bg-blue-500 border-blue-500', border: 'border-blue-400' };
    return { bg: 'bg-rose-500 border-rose-500', border: 'border-rose-400' };
  };

  // Google Calendar style group checkbox toggle (Fixed uncheck behavior 100%)
  const toggleGroupSelection = (groupName) => {
    const allGroupNames = effectiveContentGroups.map(g => g.name);

    if (selectedGroupNames.length === 0) {
      setSelectedGroupNames(allGroupNames.filter(n => n !== groupName));
    } else if (selectedGroupNames.includes(groupName)) {
      const updated = selectedGroupNames.filter(n => n !== groupName);
      setSelectedGroupNames(updated.length === 0 ? ['__NONE__'] : updated);
    } else {
      const updated = selectedGroupNames.filter(n => n !== '__NONE__').concat(groupName);
      if (updated.length === allGroupNames.length) {
        setSelectedGroupNames([]);
      } else {
        setSelectedGroupNames(updated);
      }
    }
  };

  const isGroupChecked = (groupName) => {
    if (selectedGroupNames.length === 0) return true;
    if (selectedGroupNames.includes('__NONE__')) return false;
    return selectedGroupNames.includes(groupName);
  };

  // Dynamically calculate sub-categories belonging to currently CHECKED main groups
  const activeCheckedGroups = effectiveContentGroups.filter(g => isGroupChecked(g.name));
  const availableSubCategories = [];
  const _seenSubNames = new Set();
  activeCheckedGroups.flatMap(g =>
    (g.subCategories || []).map(s => ({ groupId: g.id, groupName: g.name, subName: s }))
  ).forEach(item => {
    const lowerName = item.subName.trim().toLowerCase();
    if (!_seenSubNames.has(lowerName)) {
      _seenSubNames.add(lowerName);
      availableSubCategories.push({ ...item, subName: item.subName.trim() });
    }
  });

  const allGlobalSubCategories = [];
  const _seenGlobalSubNames = new Set();
  effectiveContentGroups.flatMap(g => g.subCategories || []).forEach(sub => {
    const lowerName = sub.trim().toLowerCase();
    if (!_seenGlobalSubNames.has(lowerName)) {
      _seenGlobalSubNames.add(lowerName);
      allGlobalSubCategories.push(sub.trim());
    }
  });

  // Include dynamic subcategories from currently existing content items in the table
  (contentItems || []).forEach(item => {
    if (item.subCategory && item.subCategory.trim() !== '' && item.subCategory !== '-- ไม่ระบุ --') {
      const lowerName = item.subCategory.trim().toLowerCase();
      if (!_seenGlobalSubNames.has(lowerName)) {
        _seenGlobalSubNames.add(lowerName);
        allGlobalSubCategories.push(item.subCategory.trim());
      }
    }
  });

  const toggleSubCategorySelection = (subName) => {
    const allSubNames = availableSubCategories.map(s => s.subName);
    if (selectedSubCategories.length === 0) {
      setSelectedSubCategories(allSubNames.filter(s => s !== subName));
    } else if (selectedSubCategories.includes(subName)) {
      const updated = selectedSubCategories.filter(s => s !== subName);
      setSelectedSubCategories(updated.length === 0 ? ['__NONE__'] : updated);
    } else {
      const updated = selectedSubCategories.filter(s => s !== '__NONE__').concat(subName);
      if (updated.length === allSubNames.length) {
        setSelectedSubCategories([]);
      } else {
        setSelectedSubCategories(updated);
      }
    }
  };

  const isSubCategoryChecked = (subName) => {
    if (selectedSubCategories.length === 0) return true;
    if (selectedSubCategories.includes('__NONE__')) return false;
    return selectedSubCategories.includes(subName);
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

  // Column keys mapping for spreadsheet grid paste matching exact user spreadsheet layout
  const GRID_COLUMN_KEYS = ['title', 'group', 'visual_concept', 'caption', 'platform', 'status', 'publish_date', 'media_url'];

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
      group: effectiveContentGroups[0]?.name || 'Product Plan & Campaign',
      status: 'draft',
      publish_date: '2026-08-20',
      media_url: '',
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
    if (!textToParse || !textToParse.trim()) {
      setParsedBulkItems([]);
      return;
    }

    const rows = parseTSVTextToRows(textToParse);
    const items = processTableRows(rows);
    setParsedBulkItems(items);
  };

  // Groq AI Smart Table Parser Trigger with Smart Local Fallback
  const handleGroqAiParseTable = async () => {
    if (!bulkRawText || !bulkRawText.trim()) {
      alert('⚠️ ไม่พบข้อมูลข้อความตารางสำหรับให้ AI อ่าน กรุณาเลือกไฟล์ Excel หรือวางข้อมูลก่อน');
      return;
    }

    setIsParsingWithAi(true);
    try {
      const aiParsedItems = await parseExcelWithGroqAi(bulkRawText);
      if (aiParsedItems && aiParsedItems.length > 0) {
        setParsedBulkItems(aiParsedItems);
      } else {
        // Fallback to local parsing algorithm if Groq API is rate-limited (HTTP 429)
        const rows = parseTSVTextToRows(bulkRawText);
        const fallbackItems = processTableRows(rows);
        setParsedBulkItems(fallbackItems);
        alert('ℹ️ Groq API ติดโควต้าชั่วคราว (HTTP 429) ระบบได้ใช้อัลกอริทึมจัดตารางในเครื่องให้แทนโดยอัตโนมัติเรียบร้อยแล้วครับ');
      }
    } catch (e) {
      console.warn('Groq AI parse fallback error:', e);
      const rows = parseTSVTextToRows(bulkRawText);
      const fallbackItems = processTableRows(rows);
      setParsedBulkItems(fallbackItems);
    } finally {
      setIsParsingWithAi(false);
    }
  };

  const handleConfirmBulkImport = () => {
    if (parsedBulkItems.length === 0) return;

    if (!bulkTargetGroup || !bulkTargetGroup.trim()) {
      alert('⚠️ กรุณาเลือกกลุ่มคอนเทนต์ (Content Group / Pillar) ที่ต้องการนำเข้าก่อนทำรายการทุกครั้ง');
      return;
    }

    // Get the subCategories for the selected group
    const targetGroupObj = effectiveContentGroups.find(g => g.name === bulkTargetGroup);
    const targetSubCats = targetGroupObj?.subCategories || [];

    const itemsToImport = parsedBulkItems.map(item => {
      // Re-match subCategory against the target group's subCategories
      let linkedSubCategory = item.subCategory || '';
      if (linkedSubCategory && targetSubCats.length > 0) {
        const exactMatch = targetSubCats.find(s => s.toLowerCase() === linkedSubCategory.toLowerCase());
        const partialMatch = targetSubCats.find(s =>
          s.toLowerCase().includes(linkedSubCategory.toLowerCase()) ||
          linkedSubCategory.toLowerCase().includes(s.toLowerCase())
        );
        linkedSubCategory = exactMatch || partialMatch || linkedSubCategory;
      }

      return {
        ...item,
        group: bulkTargetGroup,
        subCategory: linkedSubCategory
      };
    });

    let groupsAcc = effectiveContentGroups;
    itemsToImport.forEach(item => {
      if (item.subCategory && item.subCategory.trim()) {
        const targetG = item.group;
        const sub = item.subCategory.trim();
        const gObj = groupsAcc.find(g => g.name === targetG);
        if (gObj) {
          const subs = gObj.subCategories || [];
          if (!subs.some(s => s.toLowerCase() === sub.toLowerCase())) {
            groupsAcc = groupsAcc.map(g => g.name === targetG ? { ...g, subCategories: [...(g.subCategories || []), sub] } : g);
          }
        }
      }
      onAddContentItem(item);
    });

    if (onUpdateContentGroups && groupsAcc !== effectiveContentGroups) {
      onUpdateContentGroups(groupsAcc);
    }

    setBulkRawText('');
    setParsedBulkItems([]);
    setShowBulkPasteModal(false);
  };

  // Confirm Clear All Content Handler
  const handleConfirmClearAllContent = () => {
    if (window.confirm('⚠️ คุณแน่ใจหรือไม่ว่าต้องการล้างรายการคอนเทนต์ทั้งหมดในตาราง? (การกระทำนี้จะลบข้อมูลคอนเทนต์เดิมทั้งหมดเพื่อเตรียมพร้อมสำหรับนำเข้าไฟล์ใหม่)')) {
      if (onClearAllContent) {
        onClearAllContent();
      }
    }
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
    setEditVisualConcept(item.visual_concept || '');

    const rawPlats = item.platform;
    let parsedPlats = ['facebook'];
    if (Array.isArray(rawPlats)) {
      parsedPlats = rawPlats;
    } else if (typeof rawPlats === 'string') {
      parsedPlats = parsePlatformString(rawPlats);
    }
    setEditPlatforms(parsedPlats);

    setEditGroup(item.group || contentGroups[0]?.name || 'Promotion (โปรโมชัน)');
    setEditSubCategory(item.subCategory || '');
    setEditPublishDate(item.publish_date ? item.publish_date.substring(0, 10) : '2026-08-20');
    setEditMediaUrl(item.media_url || '');
    setEditReferenceUrl(item.reference_url || '');
    setEditStatus(item.status || 'draft');
    setEditCampaignId(item.campaign_id || campaigns[0]?.id || '');
  };

  // Save Edits Handler
  const handleSaveDetailEdits = (e) => {
    e.preventDefault();
    if (!selectedDetailContent) return;

    if (!editGroup || !editGroup.trim()) {
      alert('⚠️ กรุณาเลือกกลุ่มคอนเทนต์ (Group / Pillar) ก่อนทำการบันทึกทุกครั้ง');
      return;
    }

    const updatedItem = {
      ...selectedDetailContent,
      title: editTitle,
      caption: editCaption,
      visual_concept: editVisualConcept,
      platform: editPlatforms.length > 0 ? editPlatforms : ['facebook'],
      group: editGroup,
      subCategory: editSubCategory,
      publish_date: editPublishDate,
      media_url: editMediaUrl,
      reference_url: editReferenceUrl,
      status: editStatus,
      campaign_id: editCampaignId
    };

    if (editSubCategory && editSubCategory.trim()) {
      ensureSubCategoryRegistered(editGroup, editSubCategory.trim());
    }

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

    // ตรวจสอบชื่อซ้ำ
    const isDuplicate = effectiveContentGroups.some(
      g => g.name.trim().toLowerCase() === newGroupName.trim().toLowerCase()
    );
    if (isDuplicate) {
      alert(`⚠️ มีกลุ่มชื่อ "${newGroupName.trim()}" อยู่แล้ว กรุณาใช้ชื่ออื่น`);
      return;
    }

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

  // Filter & Sort content: Date ascending (Day 1 first), with 'published' items moved to the end
  const filteredContent = contentItems
    .filter(item => {
      let matchesPlatform = selectedPlatform === 'all';
      if (!matchesPlatform) {
        const platQuery = selectedPlatform.toLowerCase();
        if (Array.isArray(item.platform)) {
          matchesPlatform = item.platform.some(p => String(p).toLowerCase().includes(platQuery));
        } else if (typeof item.platform === 'string') {
          matchesPlatform = item.platform.toLowerCase().includes(platQuery);
        }
      }

      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      const matchesGroup = isGroupChecked(item.group);
      const matchesSubCategory = !item.subCategory || isSubCategoryChecked(item.subCategory);
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.caption.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPlatform && matchesStatus && matchesGroup && matchesSubCategory && matchesSearch;
    })
    .sort((a, b) => {
      const isPubA = a.status === 'published';
      const isPubB = b.status === 'published';

      // Rule 1: 'published' items go to the end/bottom
      if (isPubA && !isPubB) return 1;
      if (!isPubA && isPubB) return -1;

      // Rule 2: Sort by Publish Date ascending (Day 1, 2, 3...)
      const dateA = parseThaiDateTime(a.publish_date);
      const dateB = parseThaiDateTime(b.publish_date);
      return dateA.localeCompare(dateB);
    });

  const handleCreateContent = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (!newGroup || !newGroup.trim()) {
      alert('⚠️ กรุณาเลือกกลุ่มคอนเทนต์ (Group / Pillar) ก่อนทำการบันทึกทุกครั้ง');
      return;
    }

    const newItem = {
      id: `cnt-${Date.now()}`,
      team_id: 'team-1',
      campaign_id: newCampaignId,
      creator_id: 'user-2',
      title: newTitle,
      caption: newCaption,
      visual_concept: newVisualConcept,
      platform: newPlatforms.length > 0 ? newPlatforms : ['facebook'],
      group: newGroup,
      subCategory: newSubCategory || '',
      status: 'draft',
      publish_date: newPublishDate,
      media_url: newMediaUrl,
      reference_url: newReferenceUrl,
      performance: { views: 0, likes: 0, comments: 0, shares: 0, ctr: 0 }
    };

    if (newSubCategory && newSubCategory.trim()) {
      ensureSubCategoryRegistered(newGroup, newSubCategory.trim());
    }

    onAddContentItem(newItem);
    setNewTitle('');
    setNewCaption('');
    setNewVisualConcept('');
    setNewReferenceUrl('');
    setNewSubCategory('');
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
      referenceUrl: newIdeaReferenceUrl,
      isUsed: false,
      created_at: new Date().toISOString().split('T')[0]
    };

    onAddVaultIdea(newIdea);
    setNewIdeaTitle('');
    setNewIdeaNotes('');
    setNewIdeaReferenceUrl('');
    setShowAddIdeaModal(false);
  };

  const renderSinglePlatformBadge = (platKey) => {
    const key = String(platKey || '').toLowerCase().trim();

    // Look up in platformsList
    const matched = platformsList.find(p =>
      p.id === key || p.name.toLowerCase() === key || key.includes(p.id) || key.includes(p.name.toLowerCase())
    );

    if (matched) {
      return (
        <span key={matched.id} className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border inline-flex items-center gap-1 ${matched.color}`}>
          <span>{matched.icon}</span> <span>{matched.name}</span>
        </span>
      );
    }

    if (key.includes('tiktok')) {
      return <span key="tiktok" className="px-2 py-0.5 rounded-full text-[10px] font-semibold badge-platform-tiktok inline-flex items-center gap-1"><Video className="w-3 h-3" /> TikTok</span>;
    }
    if (key.includes('facebook') || key === 'fb') {
      return <span key="facebook" className="px-2 py-0.5 rounded-full text-[10px] font-semibold badge-platform-facebook inline-flex items-center gap-1"><Facebook className="w-3 h-3" /> Facebook</span>;
    }
    if (key.includes('instagram') || key === 'ig') {
      return <span key="instagram" className="px-2 py-0.5 rounded-full text-[10px] font-semibold badge-platform-instagram inline-flex items-center gap-1"><Camera className="w-3 h-3" /> Instagram</span>;
    }
    if (key.includes('line')) {
      return <span key="line_oa" className="px-2 py-0.5 rounded-full text-[10px] font-semibold badge-platform-line inline-flex items-center gap-1"><MessageSquare className="w-3 h-3" /> LINE OA</span>;
    }
    if (key.includes('youtube') || key === 'yt') {
      return <span key="youtube" className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200 inline-flex items-center gap-1"><Video className="w-3 h-3 text-red-500" /> YouTube</span>;
    }
    return <span key={key} className="bg-pink-50 text-rose-800 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-pink-200">{platKey}</span>;
  };

  const getPlatformBadge = (platformInput) => {
    if (!platformInput) return renderSinglePlatformBadge('facebook');

    let plats = [];
    if (Array.isArray(platformInput)) {
      plats = platformInput;
    } else if (typeof platformInput === 'string') {
      plats = platformInput.split(/[\s,]+/);
    }

    const uniquePlats = [...new Set(plats.map(p => p.trim()).filter(Boolean))];
    if (uniquePlats.length === 0) return renderSinglePlatformBadge('facebook');

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {uniquePlats.map(plat => renderSinglePlatformBadge(plat))}
      </div>
    );
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
    const groupObj = effectiveContentGroups.find(g => g.name === groupName);
    const colorClass = groupObj?.colorClass || 'bg-purple-50 text-purple-900 border-purple-200';
    return (
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${colorClass} truncate max-w-[140px]`}>
        {groupName}
      </span>
    );
  };

  // แสดง Badge สำหรับหมวดหมู่ย่อย (Sub-Category) — สีจาก subCategoryColors map
  const getSubCategoryBadge = (subCat) => {
    if (!subCat || !subCat.trim()) return null;
    // หาสีจาก subCategoryColors ของทุก Group
    let colorClass = DEFAULT_SUB_CAT_COLOR;
    for (const grp of effectiveContentGroups) {
      const colors = grp.subCategoryColors || {};
      if (colors[subCat]) {
        colorClass = colors[subCat];
        break;
      }
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${colorClass} truncate max-w-[160px]`}>
        <Tag className="w-2.5 h-2.5 shrink-0" />
        {subCat}
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
        onChange={handleFileUpload}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />

      {/* Module Header & Sub-tab navigation */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 glass-panel p-4 md:p-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-pink-50 text-pink-600 border border-pink-100 shadow-sm">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-rose-950">Content Plan & Calendar</h2>
              <p className="text-xs text-rose-700/80 font-medium">นำเข้าไฟล์ Excel (.xlsx/.csv) ปฏิทินหมวดหมู่ ตารางสเปรดชีต Editable Data Grid และส่งออกข้อมูล</p>
            </div>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-1.5 bg-pink-50/60 p-1.5 rounded-2xl border border-pink-100/80 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('calendar')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${activeSubTab === 'calendar'
              ? 'bg-white text-rose-600 shadow-sm border border-pink-100 scale-[1.02]'
              : 'text-rose-700/70 hover:text-rose-950 hover:bg-pink-100/50'
              }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>คอนเทนต์คาเลนดาร์ (FR-1.1)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('vault')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${activeSubTab === 'vault'
              ? 'bg-white text-rose-600 shadow-sm border border-pink-100 scale-[1.02]'
              : 'text-rose-700/70 hover:text-rose-950 hover:bg-pink-100/50'
              }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>คลังไอเดีย (FR-1.2)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${activeSubTab === 'analytics'
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
          <div className="glass-panel p-3 md:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">

              {/* Show/Hide Sidebar Toggle Button */}
              <button
                onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-2 cursor-pointer shadow-sm ${isSidebarVisible
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
              <div className="flex items-center gap-1">
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="bg-white border border-pink-200 text-rose-900 text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-pink-400 cursor-pointer shadow-sm font-semibold"
                >
                  <option value="all">🌐 ทุกแพลตฟอร์ม</option>
                  {platformsList.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.icon} {p.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setShowManagePlatformsModal(true)}
                  className="p-2 bg-white hover:bg-pink-50 text-rose-700 border border-pink-200 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1"
                  title="เพิ่ม/ลบ/จัดการแพลตฟอร์ม"
                >
                  <Settings className="w-3.5 h-3.5 text-pink-500" />
                </button>
              </div>

              {/* Category / Content Group Filter */}
              <select
                value={selectedCategoryFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCategoryFilter(val);
                  if (val === 'all') {
                    setSelectedGroupNames([]);
                  } else {
                    setSelectedGroupNames([val]);
                  }
                }}
                className="bg-white border border-pink-200 text-rose-900 text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-pink-400 cursor-pointer shadow-sm font-semibold"
              >
                <option value="all">📁 ทุกหมวดหมู่กลุ่มคอนเทนต์ (All Groups)</option>
                {effectiveContentGroups.map(grp => (
                  <option key={grp.id} value={grp.name}>{grp.name}</option>
                ))}
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'calendar' ? 'bg-white text-rose-600 shadow-sm' : 'text-rose-700/70 hover:text-rose-950'
                    }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>ปฏิทิน</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'list' ? 'bg-white text-rose-600 shadow-sm' : 'text-rose-700/70 hover:text-rose-950'
                    }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>รายการ</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'table' ? 'bg-white text-rose-600 shadow-sm' : 'text-rose-700/70 hover:text-rose-950'
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
                <span>นำเข้าไฟล์ Excel</span>
              </button>

              {/* EXPORT TO EXCEL BUTTON */}
              <button
                onClick={handleExportToExcel}
                className="px-3.5 py-2.5 bg-pink-50 hover:bg-pink-100 text-rose-900 border border-pink-200/90 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                title="ส่งออกตารางคอนเทนต์ปัจจุบันเป็นไฟล์ Excel (.xlsx)"
              >
                <Download className="w-4 h-4 text-pink-600" />
                <span>ส่งออก Excel</span>
              </button>

              {/* CLEAR ALL CONTENT BUTTON */}
              {contentItems.length > 0 && (
                <button
                  onClick={handleConfirmClearAllContent}
                  className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/90 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  title="ล้างรายการคอนเทนต์ทั้งหมดในปฏิทินเพื่อเตรียมนำเข้าไฟล์ใหม่"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>ล้างตารางคอนเทนต์ ({contentItems.length})</span>
                </button>
              )}

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
              <div className="w-full lg:w-56 shrink-0 space-y-3 sticky top-24 transition-all duration-300">

                {/* Card 1: Main Category Groups */}
                <div className="glass-panel p-3.5 space-y-3.5 text-xs font-medium">
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
                      <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-0.5">
                        {effectiveContentGroups.map(grp => {
                          const checked = isGroupChecked(grp.name);
                          const colorOpts = getGroupCheckboxColor(grp.colorClass);

                          return (
                            <div key={grp.id} className="space-y-1">
                              <div
                                onClick={() => toggleGroupSelection(grp.name)}
                                className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer group/row relative ${checked ? 'bg-pink-50/70 border border-pink-200/80 shadow-xs' : 'bg-white hover:bg-pink-50/30 border border-transparent'
                                  }`}
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {/* Custom Google Calendar Checkbox Box */}
                                  <div className={`w-3.5 h-3.5 rounded-[4px] flex items-center justify-center transition-colors border shrink-0 ${checked ? `${colorOpts.bg} text-white shadow-xs` : `${colorOpts.border} bg-white`
                                    }`}>
                                    {checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                  </div>

                                  {/* Label */}
                                  <span className={`truncate text-[11px] ${checked ? 'font-bold text-rose-950' : 'font-medium text-rose-800'
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
                                  className="p-1 rounded-lg text-rose-400 hover:text-rose-700 opacity-0 group-hover/row:opacity-100 transition cursor-pointer shrink-0"
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

                {/* Card 2: Sub-Categories Card Box (Appears dynamically when main groups are checked) */}
                {availableSubCategories.length > 0 && (
                  <div className="glass-panel p-3.5 space-y-3 border-amber-200/90 shadow-sm bg-gradient-to-b from-white via-amber-50/20 to-purple-50/20 rounded-2xl animate-in fade-in duration-200 text-xs font-medium">
                    {/* Card Header */}
                    <div className="flex items-center justify-between font-bold text-purple-950 border-b border-amber-200/80 pb-2">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Tag className="w-3.5 h-3.5 text-amber-500" />
                        <span>หมวดหมู่ย่อย ({availableSubCategories.length})</span>
                      </div>
                      <button
                        onClick={() => setSubCategoryCardCollapsed(!subCategoryCardCollapsed)}
                        className="p-1 text-purple-700 hover:bg-amber-100/50 rounded-lg transition cursor-pointer"
                        title="ซ่อน/แสดง หมวดหมู่ย่อย"
                      >
                        {subCategoryCardCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {!subCategoryCardCollapsed && (
                      <div className="space-y-2">
                        {/* Select All / Clear All Sub-Categories */}
                        <div className="flex items-center justify-between text-[10px] font-semibold text-purple-800 px-1">
                          <button
                            onClick={() => setSelectedSubCategories([])}
                            className="hover:underline hover:text-amber-700 cursor-pointer"
                          >
                            เลือกย่อยทั้งหมด
                          </button>
                          <button
                            onClick={() => setSelectedSubCategories(['__NONE__'])}
                            className="hover:underline hover:text-rose-700 cursor-pointer"
                          >
                            ล้างการเลือกย่อย
                          </button>
                        </div>

                        {/* Sub-Category Checklist Items */}
                        <div className="space-y-1 max-h-[260px] overflow-y-auto pr-0.5">
                          {availableSubCategories.map((item, idx) => {
                            const checked = isSubCategoryChecked(item.subName);
                            const isEditingThis = editingSubCategory?.groupId === item.groupId && editingSubCategory?.oldName === item.subName;

                            if (isEditingThis) {
                              return (
                                <div key={idx} className="flex items-center gap-1 bg-white border border-amber-400 rounded-xl p-1 text-[11px] shadow-xs">
                                  <input
                                    type="text"
                                    autoFocus
                                    value={editingSubCategory.name}
                                    onChange={(e) => setEditingSubCategory({ ...editingSubCategory, name: e.target.value })}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleEditSubCategory(item.groupId, item.subName, editingSubCategory.name);
                                      if (e.key === 'Escape') setEditingSubCategory(null);
                                    }}
                                    className="flex-1 min-w-0 bg-amber-50/50 border border-amber-200 text-purple-950 px-1.5 py-0.5 rounded-md font-semibold text-[11px] focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleEditSubCategory(item.groupId, item.subName, editingSubCategory.name)}
                                    className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer shrink-0"
                                    title="บันทึก"
                                  >
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingSubCategory(null)}
                                    className="p-0.5 text-rose-500 hover:bg-rose-50 rounded cursor-pointer shrink-0"
                                    title="ยกเลิก"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={idx}
                                className={`flex items-center justify-between p-1.5 rounded-xl transition-all group/subitem ${checked ? 'bg-amber-100/80 border border-amber-300/80 shadow-2xs' : 'bg-white hover:bg-amber-50/40 border border-transparent'
                                  }`}
                              >
                                <div
                                  onClick={() => toggleSubCategorySelection(item.subName)}
                                  className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                                >
                                  <div className={`w-3.5 h-3.5 rounded-[4px] flex items-center justify-center transition-colors border shrink-0 ${checked ? 'bg-amber-500 border-amber-500 text-white shadow-2xs' : 'border-amber-400 bg-white'
                                    }`}>
                                    {checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                  </div>
                                  <span className={`truncate text-[11px] ${checked ? 'font-bold text-purple-950' : 'font-medium text-purple-900/70'
                                    }`}>
                                    {item.subName}
                                  </span>
                                </div>

                                {/* Quick Action Icons on Hover */}
                                <div className="flex items-center gap-0.5 opacity-0 group-hover/subitem:opacity-100 transition shrink-0 pl-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingSubCategory({ groupId: item.groupId, oldName: item.subName, name: item.subName });
                                    }}
                                    className="p-1 rounded text-purple-700 hover:bg-amber-200/60 transition cursor-pointer"
                                    title="แก้ไขชื่อหมวดหมู่ย่อย"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteSubCategory(item.groupId, item.subName);
                                    }}
                                    className="p-1 rounded text-rose-500 hover:bg-rose-100 transition cursor-pointer"
                                    title="ลบหมวดหมู่ย่อยนี้"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Button to open Manage Sub-Categories Modal */}
                        <button
                          type="button"
                          onClick={() => setShowManageGroupsModal(true)}
                          className="w-full mt-2 py-1.5 px-2 rounded-xl border border-dashed border-amber-300 text-purple-900 hover:bg-amber-100/50 transition font-semibold text-[10px] flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3 h-3 text-amber-600" />
                          <span>+ จัดการ/เพิ่มหมวดหมู่ย่อยเพิ่มเติม</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

            {/* MAIN CONTENT AREA: CALENDAR / LIST / TABLE VIEW */}
            <div className="flex-1 min-w-0 w-full space-y-4">

              {/* VIEW MODE 1: VISUAL MONTHLY CALENDAR GRID */}
              {viewMode === 'calendar' && (
                <div className="glass-panel p-3 md:p-6 space-y-4">

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

                  {/* Calendar Grid Container with Mobile Scroll */}
                  <div className="overflow-x-auto pb-2">
                    <div className="min-w-[700px] border border-pink-100 rounded-2xl overflow-hidden shadow-sm bg-white">

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
                              className={`min-h-[110px] p-2 transition-all flex flex-col justify-between group relative ${isTargetHover
                                ? 'bg-purple-100/80 border-2 border-dashed border-purple-400 scale-[0.99] shadow-inner'
                                : isToday ? 'bg-pink-50/60' : 'bg-white hover:bg-pink-50/30'
                                }`}
                            >
                              {/* Day Number Row */}
                              <div className="flex items-center justify-between mb-1.5">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isToday ? 'bg-rose-500 text-white shadow-sm' : 'text-rose-900'
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
                                    className={`p-2 rounded-xl bg-pink-50/70 hover:bg-pink-100/90 border border-pink-200/90 text-[10px] space-y-1 transition-colors group/item cursor-grab active:cursor-grabbing select-none shadow-2xs ${draggedContentItem?.id === item.id ? 'opacity-40 scale-95 border-dashed border-rose-400' : ''
                                      }`}
                                    title="ลากเพื่อย้ายวันที่กำหนดโพสต์ หรือคลิกเพื่อดูรายละเอียด"
                                  >
                                    <div className="flex items-center justify-between gap-1">
                                      {getPlatformBadge(item.platform)}
                                      <div className="flex items-center gap-1">
                                        {item.reference_url && (
                                          <LinkIcon className="w-3 h-3 text-pink-400" title="มีลิงก์แนบ" />
                                        )}
                                        <span className={`w-2 h-2 rounded-full ${item.status === 'published' ? 'bg-emerald-400' : item.status === 'scheduled' ? 'bg-sky-400' : 'bg-amber-400'
                                          }`} title={item.status} />
                                      </div>
                                    </div>

                                    {/* Title */}
                                    <div className="font-semibold text-rose-950 line-clamp-1 leading-tight">{item.title}</div>

                                    {/* Sub-Category Badge Tag */}
                                    {item.subCategory ? (
                                      <div className="pt-0.5">{getSubCategoryBadge(item.subCategory)}</div>
                                    ) : item.group ? (
                                      <div className="pt-0.5">{getGroupBadge(item.group)}</div>
                                    ) : null}
                                  </div>
                                ))}
                              </div>

                            </div>
                          );
                        })}
                      </div>

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
                            {item.subCategory ? getSubCategoryBadge(item.subCategory) : (item.group && getGroupBadge(item.group))}
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
                              <CalendarIcon className="w-3.5 h-3.5 text-pink-400" />
                              {formatDisplayDate(item.publish_date)}
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
                              className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${item.status === 'draft' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-pink-50 text-rose-700 hover:bg-pink-100'
                                }`}
                            >
                              Draft
                            </button>
                            <button
                              onClick={() => onUpdateContentStatus(item.id, 'scheduled')}
                              disabled={item.status === 'scheduled'}
                              className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${item.status === 'scheduled' ? 'bg-sky-50 text-sky-800 border border-sky-200' : 'bg-pink-50 text-rose-700 hover:bg-pink-100'
                                }`}
                            >
                              Scheduled
                            </button>
                            <button
                              onClick={() => onUpdateContentStatus(item.id, 'published')}
                              disabled={item.status === 'published'}
                              className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${item.status === 'published' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-pink-50 text-rose-700 hover:bg-pink-100'
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
                <div className="glass-panel p-3 md:p-5 space-y-4 overflow-hidden">

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
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer shadow-xs ${gridUndoStack.length > 0
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
                              <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-pink-500" /> หมวดหมู่ย่อย (Sub-Category)</span>
                            </th>
                            <th className="p-3 min-w-[120px]">
                              <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5 text-pink-500" /> แพลตฟอร์ม</span>
                            </th>
                            <th className="p-3 min-w-[120px]">
                              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-pink-500" /> สถานะ</span>
                            </th>
                            <th className="p-3 min-w-[140px]">
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-pink-500" /> กำหนดวันโพสต์</span>
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
                                  className={`w-full p-2 rounded-xl font-bold text-rose-950 text-xs focus:outline-none transition ${selectedGridCell?.row === rowIdx && selectedGridCell?.col === 0
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
                                  className={`w-full p-2 rounded-xl font-medium text-rose-900 text-xs focus:outline-none transition ${selectedGridCell?.row === rowIdx && selectedGridCell?.col === 1
                                    ? 'bg-white border-2 border-rose-500 shadow-sm'
                                    : 'bg-pink-50/20 hover:bg-pink-50/60 border border-pink-100'
                                    }`}
                                />
                              </td>

                              {/* 2. Sub-Category Select Cell */}
                              <td className="p-1">
                                <select
                                  value={item.subCategory || ''}
                                  onFocus={() => setSelectedGridCell({ row: rowIdx, col: 2 })}
                                  onPaste={(e) => handleGridCellPaste(e, rowIdx, 2)}
                                  onChange={(e) => {
                                    pushGridUndoSnapshot();
                                    onEditContentItem && onEditContentItem({ ...item, subCategory: e.target.value });
                                  }}
                                  className={`w-full p-2 rounded-xl font-semibold text-[11px] cursor-pointer focus:outline-none transition border shadow-xs ${selectedGridCell?.row === rowIdx && selectedGridCell?.col === 2
                                    ? 'bg-white border-2 border-rose-500 shadow-sm'
                                    : 'bg-pink-50/50 hover:bg-pink-100/80 border-pink-200 text-rose-900'
                                    }`}
                                >
                                  <option value="">-- ไม่ระบุ --</option>
                                  {allGlobalSubCategories.map(sub => (
                                    <option key={sub} value={sub}>
                                      {sub}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* 3. Platform Select Cell */}
                              <td className="p-1">
                                <select
                                  value={Array.isArray(item.platform) ? (item.platform[0] || 'facebook') : (item.platform || 'facebook')}
                                  onFocus={() => setSelectedGridCell({ row: rowIdx, col: 3 })}
                                  onPaste={(e) => handleGridCellPaste(e, rowIdx, 3)}
                                  onChange={(e) => {
                                    pushGridUndoSnapshot();
                                    onEditContentItem && onEditContentItem({ ...item, platform: [e.target.value] });
                                  }}
                                  className={`w-full p-2 rounded-xl font-semibold text-[11px] cursor-pointer focus:outline-none transition border shadow-xs ${selectedGridCell?.row === rowIdx && selectedGridCell?.col === 3
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
                                  className={`w-full p-2 rounded-xl font-bold text-[11px] cursor-pointer focus:outline-none border shadow-xs ${selectedGridCell?.row === rowIdx && selectedGridCell?.col === 4
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
                                  type="date"
                                  value={formatIsoDateInput(item.publish_date)}
                                  onFocus={() => setSelectedGridCell({ row: rowIdx, col: 5 })}
                                  onPaste={(e) => handleGridCellPaste(e, rowIdx, 5)}
                                  onChange={(e) => {
                                    pushGridUndoSnapshot();
                                    onEditContentItem && onEditContentItem({ ...item, publish_date: e.target.value });
                                  }}
                                  className={`w-full p-1.5 rounded-xl font-medium text-rose-900 text-[11px] focus:outline-none transition ${selectedGridCell?.row === rowIdx && selectedGridCell?.col === 5
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
                                  className={`w-full p-2 rounded-xl font-mono text-rose-900 text-[10px] focus:outline-none transition ${selectedGridCell?.row === rowIdx && selectedGridCell?.col === 6
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

                  <div
                    className="mt-2 text-xs text-rose-800 font-medium font-sans prose prose-pink max-w-none 
                      [&>ol]:list-decimal [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:ml-4 
                      [&>h1]:text-sm [&>h1]:font-bold [&>h2]:text-sm [&>h2]:font-bold
                      [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-pink-300 [&_table]:my-2
                      [&_th]:border [&_th]:border-pink-300 [&_th]:bg-pink-100 [&_th]:p-1.5 [&_th]:text-left [&_th]:font-bold
                      [&_td]:border [&_td]:border-pink-200 [&_td]:p-1.5 [&_td]:align-top"
                    dangerouslySetInnerHTML={{ __html: idea.notes }}
                  />

                  {idea.referenceUrl && (
                    <a
                      href={idea.referenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-pink-600 hover:text-pink-800 bg-pink-50 hover:bg-pink-100 px-2.5 py-1.5 rounded-lg transition"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[200px]">{idea.referenceUrl}</span>
                    </a>
                  )}

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
                    disabled={idea.isUsed}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${idea.isUsed
                      ? 'bg-pink-50 text-pink-300 cursor-not-allowed border border-pink-100'
                      : 'bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] hover:opacity-90 text-purple-950 font-bold border border-[#E2D2EA] shadow-xs'
                      }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{idea.isUsed ? 'ใช้งานแล้ว' : 'แปลงเป็น Content Plan (Draft)'}</span>
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
                      <td className="p-3 text-rose-800">{formatDisplayDate(item.publish_date)}</td>
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
                    {selectedDetailContent.subCategory
                      ? getSubCategoryBadge(selectedDetailContent.subCategory)
                      : (selectedDetailContent.group && getGroupBadge(selectedDetailContent.group))}
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
                  <span>ยิงเข้า LINE</span>
                </button>

                {/* Mode Switcher Button */}
                <button
                  onClick={() => setIsEditingModal(!isEditingModal)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs border ${isEditingModal ? 'bg-pink-50 text-rose-800 border-pink-200' : 'bg-gradient-to-r from-[#F0E6F5] via-[#FFEBF3] to-[#E6F2FF] text-purple-950 border-[#E2D2EA]'
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
                  <label className="block text-rose-800 font-bold mb-1 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-pink-500" />
                    <span>รูปแบบ & ไอเดียภาพ / Visual Concept</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="เช่น สไลด์ภาพ 5 หน้า Before & After, VDO สั้น 15s..."
                    value={editVisualConcept}
                    onChange={(e) => setEditVisualConcept(e.target.value)}
                    className="w-full bg-pink-50/40 border border-pink-200 text-rose-950 p-2.5 rounded-xl focus:outline-none focus:border-pink-400 font-medium leading-relaxed"
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
                  <div className="sm:col-span-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-rose-800 font-bold">แพลตฟอร์มสื่อสาร (เลือกหลายช่องทางได้)</label>
                      <button
                        type="button"
                        onClick={() => setShowManagePlatformsModal(true)}
                        className="text-[10px] font-bold text-pink-600 hover:underline cursor-pointer"
                      >
                        + จัดการแพลตฟอร์ม
                      </button>
                    </div>
                    <MultiPlatformSelectDropdown
                      platformsList={platformsList}
                      selectedPlatforms={editPlatforms}
                      onChange={setEditPlatforms}
                      onOpenManage={() => setShowManagePlatformsModal(true)}
                      renderPlatformIcon={renderPlatformIcon}
                    />
                  </div>

                  <div>
                    <label className="block text-rose-800 font-bold mb-1">กลุ่มคอนเทนต์ (Content Group)</label>
                    <select
                      value={editGroup}
                      onChange={(e) => {
                        const selG = e.target.value;
                        setEditGroup(selG);
                        const gObj = effectiveContentGroups.find(g => g.name === selG);
                        setEditSubCategory(gObj?.subCategories?.[0] || '');
                      }}
                      className="w-full bg-pink-50/40 border border-pink-200 text-rose-950 p-2.5 rounded-xl font-medium cursor-pointer"
                    >
                      {effectiveContentGroups.map(g => (
                        <option key={g.id} value={g.name}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sub-Category Input with Datalist in Edit Modal */}
                  <div>
                    <label className="block text-amber-800 font-bold mb-1 flex items-center justify-between text-xs">
                      <span>หมวดหมู่ย่อย (Sub-Category)</span>
                      <span className="text-[10px] text-amber-700/80 font-normal">* เลือกหรือพิมพ์ใหม่ได้</span>
                    </label>
                    {(() => {
                      const editGObj = effectiveContentGroups.find(g => g.name === editGroup);
                      const editSubCats = editGObj?.subCategories || [];
                      const editListId = "edit-sub-category-list";

                      return (
                        <div className="relative">
                          <input
                            type="text"
                            list={editListId}
                            placeholder="เลือกหรือพิมพ์หมวดหมู่ย่อย..."
                            value={editSubCategory}
                            onChange={(e) => setEditSubCategory(e.target.value)}
                            className="w-full bg-amber-50/60 border border-amber-300 text-amber-950 p-2.5 rounded-xl font-semibold cursor-text text-xs focus:outline-none focus:border-amber-500 shadow-2xs"
                          />
                          <datalist id={editListId}>
                            {editSubCats.map((sub, sIdx) => (
                              <option key={sIdx} value={sub} />
                            ))}
                          </datalist>
                        </div>
                      );
                    })()}
                  </div>

                  <div>
                    <label className="block text-rose-800 font-bold mb-1">กำหนดวันโพสต์ (Publish Date)</label>
                    <input
                      type="date"
                      value={formatIsoDateInput(editPublishDate)}
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

                {/* Campaign Info Header */}
                <div className="p-4 rounded-2xl border border-pink-100 bg-pink-50/50 shadow-inner">
                  <div className="space-y-1 w-full flex flex-col justify-center">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-pink-500 text-white shadow-sm inline-flex items-center gap-1 mb-1">
                        <Layers className="w-3 h-3" />
                        {campaigns.find(c => c.id === selectedDetailContent.campaign_id)?.name || 'Nitan Campaign'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-rose-950 line-clamp-2">{selectedDetailContent.title}</h4>
                  </div>
                </div>

                {/* Media URL / External Link (If Present) */}
                {selectedDetailContent.media_url && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#F5EEF8] via-[#FFF0F6] to-[#EEF6FF] text-purple-950 border border-[#E2D2EA] flex items-center justify-between shadow-xs mt-3">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-pink-200" />
                      <div>
                        <div className="font-bold text-xs">ลิงก์สื่อ / ภาพประกอบ</div>
                        <div className="text-[10px] text-pink-500 font-mono truncate max-w-xs">{selectedDetailContent.media_url}</div>
                      </div>
                    </div>
                    <a
                      href={selectedDetailContent.media_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-white hover:bg-pink-50 text-pink-700 rounded-xl text-[10px] font-bold border border-[#E2D2EA] transition flex items-center gap-1 shadow-2xs whitespace-nowrap"
                    >
                      เปิดดูสื่อ
                    </a>
                  </div>
                )}

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
                      <CalendarIcon className="w-4 h-4 text-pink-500" />
                      กำหนดวันโพสต์: <span className="font-semibold text-rose-950">{formatDisplayDate(selectedDetailContent.publish_date)}</span>
                    </span>
                  </div>
                </div>

                {/* Visual Concept Box */}
                {selectedDetailContent.visual_concept && (
                  <div className="space-y-1.5">
                    <label className="font-bold text-rose-950 text-xs flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-pink-500" />
                      <span>รูปแบบ & ไอเดียภาพ (Visual / Visual Concept)</span>
                    </label>
                    <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 text-rose-950 leading-relaxed font-semibold whitespace-pre-wrap">
                      {selectedDetailContent.visual_concept}
                    </div>
                  </div>
                )}

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
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${selectedDetailContent.status === 'draft' ? 'bg-amber-500 text-white shadow-sm' : 'bg-white text-rose-800 border border-pink-200 hover:bg-pink-50'
                        }`}
                    >
                      Draft (ร่าง)
                    </button>
                    <button
                      onClick={() => {
                        onUpdateContentStatus(selectedDetailContent.id, 'scheduled');
                        setSelectedDetailContent(prev => ({ ...prev, status: 'scheduled' }));
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${selectedDetailContent.status === 'scheduled' ? 'bg-sky-500 text-white shadow-sm' : 'bg-white text-rose-800 border border-pink-200 hover:bg-pink-50'
                        }`}
                    >
                      Scheduled (ตั้งเวลา)
                    </button>
                    <button
                      onClick={() => {
                        onUpdateContentStatus(selectedDetailContent.id, 'published');
                        setSelectedDetailContent(prev => ({ ...prev, status: 'published' }));
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${selectedDetailContent.status === 'published' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white text-rose-800 border border-pink-200 hover:bg-pink-50'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-md p-2 sm:p-4 animate-in fade-in">
          <div className="w-[96vw] max-w-[96vw] bg-white border border-pink-100 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[96vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-pink-100 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs">
                  <FileSpreadsheet className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">นำเข้าคอนเทนต์ทีละหลายรายการ (Excel / Sheets Bulk Import)</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">นำเข้าจากไฟล์ Excel (.xlsx / .csv) หรือคัดลอกตารางมาวางเพื่อเพิ่มพร้อมกันทีเดียว</p>
                </div>
              </div>
              <button
                onClick={() => setShowBulkPasteModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="overflow-y-auto space-y-4 flex-1 pr-1 text-xs">

              {/* STEP 1: Mandatory Content Group Selection Box */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-pink-50 border-2 border-amber-300/90 shadow-xs space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="font-black text-amber-950 text-xs flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] flex items-center justify-center font-black shadow-2xs">1</span>
                    <span>เลือกหมวดหมู่กลุ่มคอนเทนต์ที่ต้องการนำเข้า (Mandatory Content Group / Pillar):</span>
                    <span className="text-rose-500 font-extrabold">*</span>
                  </label>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-200">
                    *จำเป็นต้องเลือกก่อนนำเข้า
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-wrap pt-0.5">
                  <select
                    value={bulkTargetGroup || effectiveContentGroups[0]?.name || ''}
                    onChange={(e) => {
                      const newGrp = e.target.value;
                      setBulkTargetGroup(newGrp);
                      if (newGrp && parsedBulkItems.length > 0) {
                        setParsedBulkItems(prev => prev.map(item => ({ ...item, group: newGrp })));
                      }
                    }}
                    className="w-full sm:w-auto min-w-[320px] bg-white border-2 border-amber-400 text-amber-950 text-xs font-black p-2.5 rounded-xl cursor-pointer shadow-xs focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
                  >
                    {effectiveContentGroups.map(g => (
                      <option key={g.id || g.name} value={g.name}>{g.name}</option>
                    ))}
                  </select>

                  <span className="text-xs font-black text-emerald-700 bg-emerald-100/90 px-3 py-2 rounded-xl border border-emerald-300 flex items-center gap-1.5 shrink-0 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>นำเข้าบันทึกลงในหมวด: <strong className="underline text-emerald-950">{bulkTargetGroup || effectiveContentGroups[0]?.name}</strong></span>
                  </span>
                </div>
              </div>

              {/* Uploaded File Info & Sheet Switcher */}
              {uploadedFileName && (
                <div className="flex items-center justify-between bg-emerald-50 text-emerald-950 border border-emerald-200 p-3 rounded-2xl text-xs font-bold shadow-2xs flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>อ่านข้อมูลสำเร็จจากไฟล์: <strong className="text-emerald-900 font-extrabold text-sm underline decoration-emerald-300">{uploadedFileName}</strong> ({parsedBulkItems.length} รายการ)</span>
                  </div>
                  {availableSheets.length > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-emerald-800 font-bold">สลับ Sheet ตาราง:</span>
                      <select
                        value={selectedSheetName}
                        onChange={(e) => handleSwitchSheet(e.target.value)}
                        className="bg-white border border-emerald-300 text-emerald-950 font-bold text-xs py-1 px-3 rounded-xl cursor-pointer shadow-xs focus:ring-2 focus:ring-emerald-400"
                      >
                        {availableSheets.map(sName => (
                          <option key={sName} value={sName}>Sheet: {sName}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Presets & Help Bar */}
              <div className="flex items-center justify-between gap-2 bg-pink-50/50 p-3 rounded-2xl border border-pink-100 flex-wrap">
                <div className="text-[11px] text-slate-700 font-medium flex items-center gap-1.5">
                  <ClipboardPaste className="w-4 h-4 text-pink-500 shrink-0" />
                  <span>วางตารางจาก Google Sheets / Excel (คอลัมน์: 1. Title | 2. Sub-Category (หมวดหมู่ย่อย) | 3. Visual | 4. Caption | 5. Platform | 6. Status | 7. Date)</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Groq AI Table Parser Button */}
                  <button
                    type="button"
                    onClick={handleGroqAiParseTable}
                    disabled={isParsingWithAi || !bulkRawText.trim()}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition shadow-sm flex items-center gap-1.5 cursor-pointer ${isParsingWithAi
                      ? 'bg-purple-200 text-purple-700 animate-pulse cursor-wait'
                      : 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:opacity-95 text-white border border-purple-500 shadow-purple-500/20'
                      }`}
                    title="ใช้ Groq AI อ่านและสกัดโครงสร้างตารางให้อัตโนมัติ"
                  >
                    {isParsingWithAi ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Groq AI กำลังอ่านตาราง...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                        <span>🤖 ให้ AI ช่วยอ่านจัดตาราง</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-600 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>เลือกไฟล์ Excel ใหม่</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePasteSampleTable}
                    className="px-3 py-1.5 bg-white hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    วางตารางตัวอย่าง
                  </button>
                  <button
                    type="button"
                    onClick={handleResetBulkImport}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5"
                    title="ล้างข้อมูลและรีเฟรช input พร้อมสำหรับการนำเข้าใหม่"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                    <span>🔄 ล้างข้อมูล / รีเฟรชใหม่</span>
                  </button>
                </div>
              </div>

              {/* Raw Textarea input */}
              <div>
                <textarea
                  rows={3}
                  placeholder={`คัดลอกแถวตารางจาก Google Sheets / Excel แล้วกด Ctrl+V หรือ Cmd+V วางลงที่นี่...
ตัวอย่าง:
สุนทรียภาพแห่งการสกัดหยดแรก\tBrand Vibe\tVDO สั้น 15s แสงแดดตกกระทบบาริสต้า\tThe art of extraction ☕🖤 สัมผัสความพิถีพิถัน...\tFacebook, TikTok\tDraft\t03/08/26 09:00`}
                  value={bulkRawText}
                  onChange={(e) => handleParseBulkText(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 p-3 rounded-2xl font-mono text-[11px] focus:outline-none focus:border-pink-500 focus:bg-white leading-relaxed shadow-inner"
                />
              </div>

              {/* Parsed Live Preview Table */}
              {parsedBulkItems.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-pink-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>พบรายการที่จะนำเข้า ({parsedBulkItems.length} รายการ):</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleResetBulkImport}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-rose-500" />
                      <span>หากข้อมูลไม่ถูกต้อง กดรีเฟรชข้อมูลที่นี่</span>
                    </button>
                  </div>

                  <div className="border border-pink-200 rounded-2xl overflow-x-auto shadow-xs max-h-[50vh] overflow-y-auto bg-white">
                    <table className="w-full text-left text-xs border-collapse select-none min-w-full">
                      <thead className="bg-pink-100/90 text-slate-900 uppercase font-bold text-[10px] border-b border-pink-200 sticky top-0 z-10">
                        <tr>
                          <th className="p-3 w-10 text-center text-rose-400">#</th>
                          <th className="p-3 w-[15%] min-w-[140px]">หัวข้อคอนเทนต์ (Title)</th>
                          <th className="p-3 w-[13%] min-w-[130px]">หมวดหมู่ย่อย (Sub-Category)</th>
                          <th className="p-3 w-[18%] min-w-[150px]">รูปแบบ & ไอเดียภาพ (Visual)</th>
                          <th className="p-3 w-[28%] min-w-[220px] text-pink-700">ไอเดีย Copywriting / แคปชัน (Caption)</th>
                          <th className="p-3 w-[10%] min-w-[100px]">แพลตฟอร์ม</th>
                          <th className="p-3 w-[8%] min-w-[80px]">สถานะ</th>
                          <th className="p-3 w-[10%] min-w-[110px]">กำหนดวันโพสต์</th>
                          <th className="p-3 w-[8%] min-w-[90px]">ลิงก์ภาพ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-pink-100 font-medium bg-white">
                        {parsedBulkItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-pink-50/50 transition">
                            <td className="p-3 text-center text-rose-400 font-bold">{idx + 1}</td>
                            <td className="p-3 font-bold text-slate-900 leading-snug">{item.title}</td>
                            <td className="p-3">{item.subCategory ? getSubCategoryBadge(item.subCategory) : <span className="text-slate-400 italic text-[11px]">-</span>}</td>
                            <td className="p-3 text-slate-700 leading-snug">{item.visual_concept || '-'}</td>
                            <td className="p-3 text-slate-800 font-normal leading-relaxed whitespace-pre-line">{item.caption || '-'}</td>
                            <td className="p-3">{getPlatformBadge(item.platform)}</td>
                            <td className="p-3">{getStatusBadge(item.status || 'draft')}</td>
                            <td className="p-3 font-bold text-rose-700 whitespace-nowrap">
                              {formatDisplayDate(item.publish_date)}
                            </td>
                            <td className="p-3 font-mono text-[10px] text-pink-600 truncate max-w-[100px]">{item.media_url || '-'}</td>
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkPasteModal(false)}
                  className="px-4 py-2 bg-white text-rose-800 border border-pink-200 rounded-xl font-bold hover:bg-pink-50 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleResetBulkImport}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                  <span>🔄 รีเฟรช / อัปโหลดใหม่ (Reset)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleConfirmBulkImport}
                disabled={parsedBulkItems.length === 0 || !bulkTargetGroup}
                className={`px-5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer shadow-md ${parsedBulkItems.length === 0 || !bulkTargetGroup
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white border border-emerald-600'
                  }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ตกลงบันทึก ({parsedBulkItems.length} รายการ)</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: CREATE CONTENT ITEM (SINGLE - ULTRA PREMIUM EXTRA WIDE MODAL) */}
      {showAddContentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="w-[95vw] max-w-6xl bg-white border border-rose-100/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">

            {/* Modal Header Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">สร้างรายการคอนเทนต์ใหม่</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">วางแผนรายละเอียดคอนเทนต์ และเลือกหมวดหมู่กลยุทธ์ลงปฏิทิน</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddContentModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateContent} className="space-y-6 text-xs">

              {/* Row 1: Title (2 Cols) & Platform (1 Col) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <span>หัวข้อคอนเทนต์ / Title</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น [TikTok VDO] เผยผิวฉ่ำวาวใน 7 วัน ด้วยกลูต้าเซรั่ม"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 text-slate-900 font-semibold text-sm p-3.5 rounded-2xl transition shadow-xs placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      แพลตฟอร์มเผยแพร่ (เลือกหลายช่องทางได้)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowManagePlatformsModal(true)}
                      className="text-[10px] font-bold text-pink-600 hover:text-pink-700 underline cursor-pointer"
                    >
                      + จัดการแพลตฟอร์ม
                    </button>
                  </div>
                  <MultiPlatformSelectDropdown
                    platformsList={platformsList}
                    selectedPlatforms={newPlatforms}
                    onChange={setNewPlatforms}
                    onOpenManage={() => setShowManagePlatformsModal(true)}
                    renderPlatformIcon={renderPlatformIcon}
                  />
                </div>
              </div>

              {/* Row 2: Visual Concept & Caption (Multi-Column) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-pink-500" />
                    <span>รูปแบบ & ไอเดียภาพ (Visual / Visual Concept)</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="เช่น สไลด์ภาพ 5 หน้า Before & After, VDO สั้น 15s ทดลองเนื้อสัมผัสเซรั่ม..."
                    value={newVisualConcept}
                    onChange={(e) => setNewVisualConcept(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 text-slate-900 font-medium p-3.5 rounded-2xl transition shadow-xs leading-relaxed placeholder:text-slate-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-pink-500" />
                    <span>รายละเอียดแคปชัน & ไอเดีย Copywriting (Caption)</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="ใส่รายละเอียดแคปชัน แฮชแท็ก สิทธิพิเศษ หรือ Script ข้อความโฆษณา..."
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 text-slate-900 font-medium p-3.5 rounded-2xl transition shadow-xs leading-relaxed placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Row 3: Strategic Groups (Pillar) & Schedule Time (3 Cols Grid Card) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-gradient-to-r from-pink-50/60 via-purple-50/40 to-amber-50/50 border border-pink-100/90 shadow-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                    <span>กลุ่มคอนเทนต์ (Group / Pillar)</span>
                    <span className="text-rose-500 font-bold">* ต้องเลือก</span>
                  </label>
                  <select
                    value={newGroup}
                    onChange={(e) => {
                      const selectedG = e.target.value;
                      setNewGroup(selectedG);
                      const gObj = effectiveContentGroups.find(g => g.name === selectedG);
                      setNewSubCategory(gObj?.subCategories?.[0] || '');
                    }}
                    className="w-full bg-white border border-pink-200 text-slate-900 p-3 rounded-xl font-bold cursor-pointer focus:ring-2 focus:ring-pink-400 transition shadow-2xs"
                  >
                    {effectiveContentGroups.map(g => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub-Category Input with Datalist in Create Modal */}
                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-1.5 flex items-center justify-between">
                    <span>หมวดหมู่ย่อย (Sub-Category)</span>
                    <span className="text-[10px] text-amber-700/80 font-normal">* เลือกหรือพิมพ์ใหม่ได้</span>
                  </label>
                  {(() => {
                    const selectedGObj = effectiveContentGroups.find(g => g.name === newGroup);
                    const subCats = selectedGObj?.subCategories || [];
                    const listId = "new-sub-category-list";

                    return (
                      <div className="relative">
                        <input
                          type="text"
                          list={listId}
                          placeholder="เลือกหรือพิมพ์หมวดหมู่ย่อยใหม่..."
                          value={newSubCategory}
                          onChange={(e) => setNewSubCategory(e.target.value)}
                          className="w-full bg-white border border-amber-300 text-amber-950 p-3 rounded-xl font-bold cursor-text focus:ring-2 focus:ring-amber-400 transition shadow-2xs text-xs"
                        />
                        <datalist id={listId}>
                          {subCats.map((sub, sIdx) => (
                            <option key={sIdx} value={sub} />
                          ))}
                        </datalist>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">กำหนดวันโพสต์ (Publish Date)</label>
                  <input
                    type="date"
                    value={formatIsoDateInput(newPublishDate)}
                    onChange={(e) => setNewPublishDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-900 p-3 rounded-xl font-bold focus:ring-2 focus:ring-pink-400 transition shadow-2xs"
                  />
                </div>
              </div>

              {/* Row 4: Image & Reference URL Links (2 Cols Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Attach Media Image URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-pink-500" />
                    <span>แนบลิงก์รูปภาพประกอบ (Image URL)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... (เริ่มต้นเป็นว่างเปล่า)"
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-pink-500 text-slate-900 font-mono text-xs p-3 rounded-2xl transition shadow-xs"
                  />
                  {/* Image Sample Presets */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-2">
                    <span className="text-[11px] text-slate-500 font-bold">หรือเลือกรูปตัวอย่าง:</span>
                    {SAMPLE_IMAGES.map((sample, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setNewMediaUrl(sample.url)}
                        className="px-2.5 py-1 rounded-xl bg-pink-50 hover:bg-pink-500 hover:text-white text-pink-700 text-[11px] font-bold transition border border-pink-200/80 cursor-pointer shadow-2xs"
                      >
                        {sample.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Attach External Reference URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <LinkIcon className="w-4 h-4 text-pink-500" />
                    <span>แนบลิงก์อ้างอิง / เอกสาร (Canva, Drive, Notion)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://canva.com/... หรือ https://drive.google.com/..."
                    value={newReferenceUrl}
                    onChange={(e) => setNewReferenceUrl(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-pink-500 text-slate-900 font-mono text-xs p-3 rounded-2xl transition shadow-xs"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddContentModal(false)}
                  className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition text-xs cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-7 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-extrabold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition flex items-center gap-2 text-xs cursor-pointer"
                >
                  <Save className="w-4 h-4 text-white" />
                  <span>บันทึกคอนเทนต์ลงปฏิทิน</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: MANAGE CONTENT GROUPS & SUB-CATEGORIES MODAL */}
      {showManageGroupsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#12072B]/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-white border border-[#E2D2EA] rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-pink-100/70 border border-pink-200">
                  <FolderPlus className="w-5 h-5 text-rose-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-rose-950">จัดการกลุ่มคอนเทนต์ & หมวดหมู่ย่อย</h3>
                  <p className="text-[11px] text-rose-700/80 font-medium">เพิ่ม แก้ไข หรือลบ ทั้งกลุ่มหลักและหมวดหมู่ย่อย (Sub-Categories)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowManageGroupsModal(false)}
                className="p-1.5 rounded-xl text-rose-400 hover:text-rose-700 hover:bg-pink-50 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Existing Groups with Nested Sub-Categories */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              <label className="text-xs font-bold text-rose-950 block">รายการกลุ่มและหมวดหมู่ย่อยปัจจุบัน ({effectiveContentGroups.length} กลุ่ม):</label>

              {effectiveContentGroups.map(grp => {
                const subCats = grp.subCategories || [];

                return (
                  <div key={grp.id} className="p-3.5 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-2.5 shadow-2xs">
                    {/* Main Group Header Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${grp.colorClass}`}>
                          {grp.name}
                        </span>
                        <span className="text-[10px] text-purple-900/60 font-semibold">({subCats.length} หมวดย่อย)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {/* Color Palette Toggle Button */}
                        <button
                          type="button"
                          onClick={() => setOpenColorPalette(openColorPalette === grp.id ? null : grp.id)}
                          className={`p-1.5 rounded-lg transition cursor-pointer border ${grp.colorClass} hover:opacity-80`}
                          title="เปลี่ยนสีกลุ่ม"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                            <path strokeWidth="2" d="M12 2a10 10 0 0 1 0 20c-5 0-4-4-4-4s-4-1-4-6a10 10 0 0 1 8-10z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteContentGroup && onDeleteContentGroup(grp.id)}
                          className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-100/50 rounded-lg transition cursor-pointer"
                          title="ลบกลุ่มหลักนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Inline Color Palette Picker */}
                    {openColorPalette === grp.id && (
                      <div className="p-3 bg-white border border-purple-200 rounded-2xl shadow-lg space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                        <p className="text-[11px] font-bold text-purple-950">🎨 เลือกสีกลุ่ม "{grp.name}"</p>
                        <div className="flex flex-wrap gap-2">
                          {GROUP_COLORS.map(c => {
                            const isSelected = grp.color === c.value;
                            return (
                              <button
                                key={c.value}
                                type="button"
                                title={c.label}
                                onClick={() => {
                                  handleUpdateGroupColor(grp.id, c.value);
                                  setOpenColorPalette(null);
                                }}
                                className={`w-7 h-7 rounded-full ${c.dot} transition-all cursor-pointer shadow-sm hover:scale-110 ${isSelected
                                  ? 'ring-2 ring-offset-2 ring-purple-950 scale-110'
                                  : 'hover:ring-2 hover:ring-offset-1 hover:ring-purple-400'
                                  }`}
                              />
                            );
                          })}
                        </div>
                        <p className="text-[10px] text-purple-400">คลิกสีที่ต้องการ — บันทึกอัตโนมัติ</p>
                      </div>
                    )}

                    {/* Sub-Categories Chip List */}
                    <div className="pl-3 border-l-2 border-amber-300 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-purple-950">
                        <span>🏷️ หมวดหมู่ย่อยใต้ {grp.name}:</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 items-center">
                        {subCats.map((sub, sIdx) => {
                          const isEditingThis = editingSubCategory?.groupId === grp.id && editingSubCategory?.oldName === sub;
                          const subColor = (grp.subCategoryColors || {})[sub] || DEFAULT_SUB_CAT_COLOR;
                          const subPaletteKey = `${grp.id}__${sub}`;
                          const isSubPaletteOpen = openSubColorPalette === subPaletteKey;

                          if (isEditingThis) {
                            return (
                              <div key={sIdx} className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-1 bg-white border border-amber-400 rounded-xl px-2 py-1 text-xs shadow-xs">
                                  <input
                                    type="text"
                                    autoFocus
                                    value={editingSubCategory.name}
                                    onChange={(e) => setEditingSubCategory({ ...editingSubCategory, name: e.target.value })}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleEditSubCategory(grp.id, sub, editingSubCategory.name);
                                      if (e.key === 'Escape') setEditingSubCategory(null);
                                    }}
                                    className="w-36 bg-amber-50/50 border border-amber-200 text-purple-950 px-1.5 py-0.5 rounded-md font-semibold text-xs focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleEditSubCategory(grp.id, sub, editingSubCategory.name)}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                                    title="บันทึก"
                                  >
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingSubCategory(null)}
                                    className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                                    title="ยกเลิก"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div key={sIdx} className="flex flex-col gap-1">
                              <div
                                className={`group/sub flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold shadow-2xs border transition ${subColor}`}
                              >
                                <Tag className="w-2.5 h-2.5 shrink-0" />
                                <span>{sub}</span>
                                <div className="flex items-center gap-0.5 opacity-60 group-hover/sub:opacity-100 transition">
                                  {/* Color Dot Button — คลิกเปิด palette */}
                                  <button
                                    type="button"
                                    onClick={() => setOpenSubColorPalette(isSubPaletteOpen ? null : subPaletteKey)}
                                    className="p-0.5 rounded-full cursor-pointer hover:scale-125 transition-transform"
                                    title="เปลี่ยนสี"
                                  >
                                    <span className={`block w-2.5 h-2.5 rounded-full border border-white/60 ${SUB_CATEGORY_COLORS.find(c => c.value === subColor)?.dot || 'bg-amber-400'
                                      }`} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingSubCategory({ groupId: grp.id, oldName: sub, name: sub })}
                                    className="p-0.5 hover:opacity-100 rounded cursor-pointer"
                                    title="แก้ไขชื่อ"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSubCategory(grp.id, sub)}
                                    className="p-0.5 text-rose-500 hover:text-rose-700 rounded cursor-pointer"
                                    title="ลบ"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Mini Sub-Category Color Palette Popover */}
                              {isSubPaletteOpen && (
                                <div className="p-2.5 bg-white border border-purple-200 rounded-2xl shadow-lg space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150 z-10">
                                  <p className="text-[10px] font-bold text-purple-950">🎨 สี "{sub}"</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {SUB_CATEGORY_COLORS.map(c => {
                                      const isSelected = subColor === c.value;
                                      return (
                                        <button
                                          key={c.value}
                                          type="button"
                                          title={c.label}
                                          onClick={() => {
                                            handleSetSubCategoryColor(grp.id, sub, c.value);
                                            setOpenSubColorPalette(null);
                                          }}
                                          className={`w-6 h-6 rounded-full ${c.dot} transition-all cursor-pointer shadow-sm hover:scale-110 ${isSelected
                                            ? 'ring-2 ring-offset-1 ring-purple-950 scale-110'
                                            : 'hover:ring-2 hover:ring-offset-1 hover:ring-purple-400'
                                            }`}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {subCats.length === 0 && (
                          <span className="text-[11px] text-purple-800/50 italic">(ยังไม่มีหมวดหมู่ย่อย)</span>
                        )}
                      </div>

                      {/* Quick Add Sub-Category Input under this Group */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder={`+ เพิ่มหมวดหมู่ย่อยใต้ ${grp.name}...`}
                          value={newSubCategoryInput[grp.id] || ''}
                          onChange={(e) => setNewSubCategoryInput({ ...newSubCategoryInput, [grp.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSubCategory(grp.id);
                            }
                          }}
                          className="flex-1 bg-white border border-pink-200 text-rose-950 px-2.5 py-1.5 rounded-xl text-xs font-medium focus:outline-none focus:border-pink-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSubCategory(grp.id)}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>เพิ่มย่อย</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add New Group Form */}
            <form onSubmit={handleCreateGroup} className="space-y-3 pt-3 border-t border-pink-100 text-xs">
              <label className="text-xs font-bold text-rose-950 block">➕ เพิ่มกลุ่มคอนเทนต์หลักใหม่:</label>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-rose-800 font-semibold mb-1">ชื่อกลุ่ม (Group Name)</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น Promotion 9.9, Brand Story"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full bg-pink-50/40 border border-pink-200 text-rose-950 p-2.5 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-rose-800 font-semibold">เลือกโทนสีประจำกลุ่ม</label>
                    {/* Preview badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${newGroupColor}`}>
                      {newGroupName || 'ตัวอย่างกลุ่ม'}
                    </span>
                  </div>
                  {/* Color Palette Grid */}
                  <div className="flex flex-wrap gap-2 p-3 bg-pink-50/40 border border-pink-200 rounded-xl">
                    {GROUP_COLORS.map(c => {
                      const isSelected = newGroupColor === c.value;
                      return (
                        <button
                          key={c.value}
                          type="button"
                          title={c.label}
                          onClick={() => setNewGroupColor(c.value)}
                          className={`w-7 h-7 rounded-full ${c.dot} transition-all cursor-pointer shadow-sm hover:scale-110 ${isSelected
                            ? 'ring-2 ring-offset-2 ring-purple-950 scale-110'
                            : 'hover:ring-2 hover:ring-offset-1 hover:ring-purple-400'
                            }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => setShowManageGroupsModal(false)}
                  className="px-4 py-2 bg-pink-50 text-rose-800 rounded-xl font-bold transition cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-950 via-pink-900 to-purple-900 hover:opacity-95 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-pink-300" />
                  <span>เพิ่มกลุ่มหลักใหม่</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: CREATE IDEA */}
      {showAddIdeaModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-3xl bg-white border border-pink-100 rounded-3xl p-6 flex flex-col shadow-xl max-h-[95vh]">
            <h3 className="text-lg font-bold text-rose-950 border-b border-pink-100 pb-3 shrink-0">บันทึกไอเดียลงคลัง (Idea Vault)</h3>

            <form onSubmit={handleCreateIdea} className="flex-1 overflow-y-auto space-y-4 mt-4 pr-2 text-xs">
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
                <div className="bg-white border border-pink-200 rounded-xl overflow-hidden text-rose-950">
                  <JoditEditor
                    value={newIdeaNotes}
                    config={{
                      readonly: false,
                      height: 300,
                      askBeforePasteHTML: false,
                      askBeforePasteFromWord: false,
                      defaultActionOnPaste: 'insert_as_html',
                      placeholder: "รายละเอียดไอเดีย อุปกรณ์ที่ต้องใช้ เทคนิค... วางตารางจาก AI ได้เลย",
                      buttons: [
                        'bold', 'italic', 'underline', 'strikethrough', '|',
                        'ul', 'ol', '|',
                        'font', 'fontsize', 'brush', '|',
                        'image', 'table', 'link', '|',
                        'align', 'undo', 'redo'
                      ],
                      uploader: {
                        insertImageAsBase64URI: true
                      },
                      showXPathInStatusbar: false,
                      imageProcessor: {
                        replaceDataURIToBlobIdInView: true
                      },
                      events: {
                        beforeUpload: async function (files) {
                          if (files && files.length > 0) {
                            for (let i = 0; i < files.length; i++) {
                              const file = files[i];
                              if (file.type.startsWith('image/')) {
                                try {
                                  const compressed = await compressImage(file);
                                  this.selection.insertHTML(`<img src="${compressed}" style="max-width: 100%; height: auto;" />`);
                                } catch (err) {
                                  console.error('File compression failed:', err);
                                }
                              }
                            }
                            return false;
                          }
                        },
                        drop: async function (event) {
                          const files = event.dataTransfer?.files;
                          if (files && files.length > 0) {
                            const file = files[0];
                            if (file.type.startsWith('image/')) {
                              event.preventDefault();
                              try {
                                const compressed = await compressImage(file);
                                this.selection.insertHTML(`<img src="${compressed}" style="max-width: 100%; height: auto;" />`);
                              } catch (err) {
                                console.error('Image compression failed:', err);
                              }
                              return false;
                            }
                          }
                        },
                        paste: async function (event) {
                          const clipboardData = event.clipboardData || window.clipboardData;
                          if (clipboardData && clipboardData.items) {
                            for (let i = 0; i < clipboardData.items.length; i++) {
                              const item = clipboardData.items[i];
                              if (item.type.indexOf('image') !== -1) {
                                const file = item.getAsFile();
                                if (file) {
                                  event.preventDefault();
                                  try {
                                    const compressed = await compressImage(file);
                                    this.selection.insertHTML(`<img src="${compressed}" style="max-width: 100%; height: auto;" />`);
                                  } catch (err) {
                                    console.error('Image compression failed:', err);
                                  }
                                  return false;
                                }
                              }
                            }
                          }
                        }
                      }
                    }}
                    onBlur={(val) => setNewIdeaNotes(val)}
                  />
                </div>
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

              <div>
                <label className="block text-rose-800 font-semibold mb-1">ลิงก์อ้างอิง (Reference URL) - ไม่บังคับ</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newIdeaReferenceUrl}
                  onChange={(e) => setNewIdeaReferenceUrl(e.target.value)}
                  className="w-full bg-pink-50/40 border border-pink-200 text-rose-950 p-2.5 rounded-xl font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-pink-100 shrink-0">
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
        </div>,
        document.body
      )}

      {/* MODAL 6: MANAGE PLATFORMS (ADD, EDIT, DELETE CUSTOM PLATFORMS) */}
      {showManagePlatformsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-rose-100/80 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20">
                  <Settings className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">จัดการแพลตฟอร์ม (Manage Platforms)</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">เพิ่ม ลบ หรือแก้ไขแพลตฟอร์มเผยแพร่คอนเทนต์</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowManagePlatformsModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form to Add New Platform */}
            <form onSubmit={handleAddPlatform} className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                + เพิ่มแพลตฟอร์มใหม่
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="พิมพ์ชื่อแพลตฟอร์มใหม่ เช่น Shopee Video, Blockdit..."
                  value={newCustomPlatformName}
                  onChange={(e) => setNewCustomPlatformName(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 focus:border-pink-500 text-slate-900 font-semibold text-xs p-2.5 rounded-xl transition shadow-xs placeholder:text-slate-400"
                />

                <button
                  type="submit"
                  disabled={!newCustomPlatformName.trim()}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition shadow-sm cursor-pointer ${newCustomPlatformName.trim()
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                >
                  + เพิ่ม
                </button>
              </div>
            </form>

            {/* Existing Platforms List */}
            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              <label className="block text-xs font-bold text-slate-700">
                แพลตฟอร์มในระบบทั้งหมด ({platformsList.length} แพลตฟอร์ม):
              </label>

              <div className="space-y-2">
                {platformsList.map(plat => (
                  <div key={plat.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white transition group">
                    <div className="flex items-center gap-2.5">
                      {renderPlatformIcon(plat.id)}
                      {editingPlatformId === plat.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editPlatformNameInput}
                            onChange={(e) => setEditPlatformNameInput(e.target.value)}
                            className="p-1.5 bg-white border border-pink-400 rounded-lg text-xs font-bold text-slate-900"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleEditPlatform(plat.id)}
                            className="px-2 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-bold"
                          >
                            บันทึก
                          </button>
                        </div>
                      ) : (
                        <span className="font-extrabold text-slate-900 text-xs">{plat.name}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPlatformId(plat.id);
                          setEditPlatformNameInput(plat.name);
                        }}
                        className="p-1.5 text-slate-400 hover:text-pink-600 transition cursor-pointer"
                        title="แก้ไขชื่อ"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePlatform(plat.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="ลบแพลตฟอร์ม"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowManagePlatformsModal(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-sm"
              >
                เสร็จสิ้น
              </button>
            </div>

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
