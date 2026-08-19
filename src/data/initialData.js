export const INITIAL_TEAMS = [
  {
    id: 'team-1',
    name: 'Nitan Beauty & Skincare',
    brand_logo: 'NT',
    plan_tier: 'Enterprise Multi-Brand'
  },
  {
    id: 'team-2',
    name: 'Nitan Wellness & Spa',
    brand_logo: 'NW',
    plan_tier: 'Pro Team'
  }
];

export const INITIAL_USERS = [
  {
    id: 'user-1',
    team_id: 'team-1',
    name: 'คุณเมย์ (May)',
    email: 'may@nitan.co.th',
    role: 'marketing_lead',
    line_user_id: 'U8f9a2b1c4e5d6',
    line_display_name: 'May_Marketing',
    line_connected: true,
    avatar: 'M'
  },
  {
    id: 'user-2',
    team_id: 'team-1',
    name: 'คุณเจนนี่ (Jenny)',
    email: 'jenny@nitan.co.th',
    role: 'content_creator',
    line_user_id: 'U7e6d5c4b3a2',
    line_display_name: 'Jenny_Content',
    line_connected: true,
    avatar: 'J'
  },
  {
    id: 'user-3',
    team_id: 'team-1',
    name: 'คุณอาร์ม (Arm)',
    email: 'arm@nitan.co.th',
    role: 'brand_owner',
    line_user_id: 'U1a2b3c4d5e6',
    line_display_name: 'Arm_CEO',
    line_connected: true,
    avatar: 'A'
  },
  {
    id: 'user-4',
    team_id: 'team-2',
    name: 'คุณบอย (Boy)',
    email: 'boy@nitan-wellness.com',
    role: 'marketing_lead',
    line_user_id: 'U9988776655',
    line_display_name: 'Boy_Wellness',
    line_connected: false,
    avatar: 'B'
  }
];

// Cleared Mock Data Arrays (Ready for User Real Data Entry)
export const INITIAL_PRODUCTS = [];

export const INITIAL_MARKETING_PLANS = [];

export const INITIAL_CAMPAIGN_IDEAS = [];

export const INITIAL_CAMPAIGNS = [];

export const INITIAL_CONTENT_ITEMS = [];

export const INITIAL_CONTENT_GROUPS = [
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
];

export const INITIAL_IDEA_VAULT = [];

export const INITIAL_NOTIFICATION_RULES = [
  {
    id: 'rule-1',
    team_id: 'team-1',
    event_type: 'content_due_soon',
    notify_hours_before: 24,
    target_channel: 'line_group',
    line_group_id: 'C1234567890_mkt_team',
    is_active: true,
    custom_template: '🚨 [แจ้งเตือน] คอนเทนต์ "{title}" มีกำหนดส่งในอีก 24 ชม.'
  },
  {
    id: 'rule-2',
    team_id: 'team-1',
    event_type: 'stage_overdue',
    notify_hours_before: 0,
    target_channel: 'line_group',
    line_group_id: 'C0987654321_exec_team',
    is_active: true,
    custom_template: '⚠️ [เตือนงานเกินกำหนด] แคมเปญ "{campaign_name}" ขั้นตอน "{stage_name}" เกินกำหนดส่งแล้ว'
  }
];

export const INITIAL_NOTIFICATION_LOGS = [];
