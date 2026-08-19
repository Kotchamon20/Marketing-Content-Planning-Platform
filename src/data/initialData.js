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

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    team_id: 'team-1',
    name: 'Nitan Radiance Glow Serum 30ml',
    sku: 'NT-SERUM-01',
    category: 'Skincare',
    price: 890,
    image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-2',
    team_id: 'team-1',
    name: 'Nitan Sunscreen Aqua Gel SPF50+ PA++++',
    sku: 'NT-SUN-02',
    category: 'Sun Care',
    price: 590,
    image_url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'prod-3',
    team_id: 'team-1',
    name: 'Nitan Deep Night Repair Cream 50g',
    sku: 'NT-CREAM-03',
    category: 'Skincare',
    price: 1290,
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80'
  }
];

export const INITIAL_MARKETING_PLANS = [
  {
    id: 'mkt-plan-1',
    team_id: 'team-1',
    title: 'แผนการตลาด Q3/2026: 9.9 Mega Shopping Festival Launch',
    objective: 'สร้างการรับรู้แบรนด์และผลักดันยอดขายเซรั่มตัวใหม่ให้แตะ 2,500,000 บาท ภายในเดือนกันยายน',
    stp_segmentation: 'กลุ่มผู้หญิงวัยทำงาน อายุ 22-38 ปี ที่ใส่ใจสุขภาพผิวและมีปัญหาสิวผด/หน้าหมองคล้ำ',
    stp_targeting: 'เน้นกลุ่ม Urban Digital Native ที่เล่น TikTok & IG และชื่นชอบการช้อปปิ้งออนไลน์ผ่าน Shopee/TikTok Shop',
    stp_positioning: 'เซรั่มบำรุงล้ำลึกระดับเคาน์เตอร์แบรนด์ ในราคาจับต้องได้ ออร์แกนิก ปลอดภัย 100%',
    swot_strengths: ['สูตรลิขสิทธิ์เฉพาะ Nitan Complex', 'รีวิวจากแพทย์ผิวหนัง', 'ราคาส่งเสริมการขายจูงใจ'],
    swot_weaknesses: ['แบรนด์ยังค่อนข้างใหม่ใน TikTok', 'งบโฆษณาน้อยกว่าคู่แข่งเจ้าใหญ่'],
    swot_opportunities: ['กระแส Skincare Minimalist กำลังมาแรง', 'เทรนด์ Live Selling เติบโตสูง'],
    swot_threats: ['คู่แข่งตัดราคาใน Shopee', 'ค่าโฆษณา Ads เพิ่มสูงขึ้นช่วง 9.9'],
    customer_journey: {
      awareness: 'ยิงคลิปสั้น TikTok & IG Reels โชว์ผลลัพธ์ Before/After 7 วัน',
      consideration: 'ส่งสินค้าให้ KOC 20 คนรีวิว และทำบทความเปรียบเทียบส่วนผสม',
      conversion: 'จัดโปร 9.9 Flash Sale แถมครีมซอง + คูปองส่วนลดเฉพาะ LINE Broadcast',
      loyalty: 'สะสมแต้มผ่าน LINE Official Account เพื่อแลกของรางวัล Exclusive'
    },
    total_budget: 150000,
    budget_channels: {
      tiktok: 70000,
      facebook: 35000,
      instagram: 30000,
      line_oa: 15000
    },
    start_date: '2026-08-15',
    end_date: '2026-09-15'
  }
];

export const INITIAL_CAMPAIGN_IDEAS = [
  {
    id: 'idea-1',
    marketing_plan_id: 'mkt-plan-1',
    team_id: 'team-1',
    title: 'TikTok Challenge #หน้าใสฉ่ำวาวท้าแดดกับนิทาน',
    description: 'ชวนผู้ใช้อัดคลิปเต้นท่าทาเซรั่ม ชนะรับเงินรางวัล 10,000 บาท + สินค้าฟรี 1 ปี',
    suggested_by: 'user-2',
    category: 'Viral Campaign',
    upvotes: 14,
    is_approved: true
  },
  {
    id: 'idea-2',
    marketing_plan_id: 'mkt-plan-1',
    team_id: 'team-1',
    title: 'LINE Secret Code Flash Sale 1 แถม 1',
    description: 'ส่งข้อความ Flex Message หาเพื่อนใน LINE OA แจกโค้ดลับช้อปก่อนใคร',
    suggested_by: 'user-1',
    category: 'Exclusive Promo',
    upvotes: 18,
    is_approved: true
  },
  {
    id: 'idea-3',
    marketing_plan_id: 'mkt-plan-1',
    team_id: 'team-1',
    title: 'Unboxing Box Set 9.9 โดย Beauty Influencer 10 คน',
    description: 'จัดทำกล่อง PR Box สุดอลังการส่งให้ครีเอเตอร์สายบิวตี้แกะกล่องเปิดตัว',
    suggested_by: 'user-2',
    category: 'KOC Outreach',
    upvotes: 8,
    is_approved: false
  }
];

export const INITIAL_CAMPAIGNS = [
  {
    id: 'camp-1',
    team_id: 'team-1',
    product_id: 'prod-1',
    marketing_plan_id: 'mkt-plan-1',
    name: 'แคมเปญเปิดตัว 9.9 Nitan Radiance Serum Mega Launch',
    description: 'แคมเปญหลักเปิดตัวเซรั่มตัวใหม่ รับช่วงเทศกาล 9.9',
    start_date: '2026-08-20',
    end_date: '2026-09-10',
    budget: 100000,
    revenue_target: 1800000,
    actual_revenue: 1420000,
    image_ready: true,
    scheduled: true,
    posted: false,
    stage_status: 't_minus_2',
    status: 'execution'
  },
  {
    id: 'camp-2',
    team_id: 'team-1',
    product_id: 'prod-2',
    marketing_plan_id: 'mkt-plan-1',
    name: 'แคมเปญดันยอด Sunscreen Aqua Gel กลางเดือน',
    description: 'โปรโมตกันแดดเนื้อเจลดับร้อน ลด 35% ต้อนรับฝนตกแดดออก',
    start_date: '2026-08-10',
    end_date: '2026-08-16',
    budget: 35000,
    revenue_target: 500000,
    actual_revenue: 480000,
    image_ready: true,
    scheduled: true,
    posted: false,
    stage_status: 'overdue',
    status: 'execution'
  },
  {
    id: 'camp-3',
    team_id: 'team-1',
    product_id: 'prod-3',
    marketing_plan_id: 'mkt-plan-1',
    name: 'Pre-Order Night Repair Cream กล่องสุ่ม VIP',
    description: 'เปิดจองไนท์ครีมรุ่นลิมิเต็ด ลุ้นรับสร้อยคอทองคำ',
    start_date: '2026-08-28',
    end_date: '2026-09-05',
    budget: 45000,
    revenue_target: 700000,
    actual_revenue: 0,
    image_ready: false,
    scheduled: false,
    posted: false,
    stage_status: 't_minus_5',
    status: 'planning'
  }
];

export const INITIAL_CONTENT_GROUPS = [
  { id: 'grp-1', name: 'Promotion (โปรโมชัน)', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  { id: 'grp-2', name: 'Lutein (ลูทีน / สินค้า)', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'grp-3', name: 'Branding & Lifestyle', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { id: 'grp-4', name: 'Review & KOC', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { id: 'grp-5', name: 'Educational (สาระน่ารู้)', color: 'bg-sky-50 text-sky-800 border-sky-200' }
];

export const INITIAL_CONTENT_ITEMS = [
  {
    id: 'cnt-1',
    team_id: 'team-1',
    campaign_id: 'camp-1',
    creator_id: 'user-2',
    title: '[TikTok VDO] เผยผิวฉ่ำแบบสาวเกาหลีด้วย Nitan Serum ใน 7 วัน!',
    caption: 'กู้ผิวหมองคล้ำเร่งด่วน! เซรั่มนิทานเข้มข้น x10 ปรับผิวกระจ่างใส สิวผดลดลงอย่างเห็นได้ชัด #NitanSkincare #99MegaSale #เซรั่มนิทาน',
    platform: 'tiktok',
    group: 'Lutein (ลูทีน / สินค้า)',
    status: 'published',
    publish_date: '2026-08-14T10:00:00Z',
    media_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    performance: { views: 68400, likes: 5210, comments: 340, shares: 890, ctr: 4.8 }
  },
  {
    id: 'cnt-2',
    team_id: 'team-1',
    campaign_id: 'camp-1',
    creator_id: 'user-2',
    title: '[IG Photo Carousel] 5 สัญญาณผิวที่บอกว่าคุณต้องเริ่มใช้ Radiance Serum',
    caption: 'รูขุมขนกว้าง? ผิวแห้งกร้าน? ลองเช็ค 5 ข้อนี้ดูเลย! สไลด์ขวาเพื่อดูวิธีดูแลผิวอย่างถูกต้อง',
    platform: 'instagram',
    group: 'Educational (สาระน่ารู้)',
    status: 'scheduled',
    publish_date: '2026-08-18T14:30:00Z',
    media_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    performance: { views: 0, likes: 0, comments: 0, shares: 0, ctr: 0 }
  },
  {
    id: 'cnt-3',
    team_id: 'team-1',
    campaign_id: 'camp-1',
    creator_id: 'user-1',
    title: '[LINE Broadcast] แจกโค้ดลับ 9.9 ลดทันที 200.- สำหรับสมาชิกรอบแรก',
    caption: 'สิทธิ์พิเศษเฉพาะคุณ! รับสิทธิ์ซื้อ Nitan Radiance Serum ก่อนใครในราคาเพียง 690.- (จากปกติ 890.-) กดรับสิทธิ์เลย!',
    platform: 'line_oa',
    group: 'Promotion (โปรโมชัน)',
    status: 'draft',
    publish_date: '2026-08-20T09:00:00Z',
    media_url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80',
    performance: { views: 0, likes: 0, comments: 0, shares: 0, ctr: 0 }
  },
  {
    id: 'cnt-4',
    team_id: 'team-1',
    campaign_id: 'camp-2',
    creator_id: 'user-2',
    title: '[FB Post] กันแดดเนื้อเจล ซึมไว ไม่คราบ คุมมัน 12 ชั่วโมง',
    caption: 'ทากันแดดแล้วเหนอะหนะใช่ไหม? เปลี่ยนมาใช้ Nitan Aqua Gel เบาสบายเหมือนทาน้ำ',
    platform: 'facebook',
    group: 'Promotion (โปรโมชัน)',
    status: 'scheduled',
    publish_date: '2026-08-16T18:00:00Z',
    media_url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80',
    performance: { views: 0, likes: 0, comments: 0, shares: 0, ctr: 0 }
  }
];

export const INITIAL_IDEA_VAULT = [
  {
    id: 'vault-1',
    team_id: 'team-1',
    title: 'ทำคลิป ASMR เสียงเปิดขวดเซรั่มและหยดลงบนผิวหน้า',
    notes: 'เน้นเสียงผ่อนคลายความเครียด ใช้ไมค์ตัดเสียงอย่างดี เหมาะกับ TikTok & IG Reels ช่วงดึก',
    platforms: ['tiktok', 'instagram'],
    tags: ['ASMR', 'Relaxing', 'TextureDetail'],
    is_used: false,
    created_at: '2026-08-10'
  },
  {
    id: 'vault-2',
    team_id: 'team-1',
    title: 'บทความวิจัยส่วนผสม Niacinamide + Hyaluronic Acid ในทางการแพทย์',
    notes: 'เขียนลงบล็อกเพื่อดึง SEO Google และแชร์ลง Facebook Page สร้างความน่าเชื่อถือ',
    platforms: ['facebook'],
    tags: ['Educational', 'Dermatology', 'SEO'],
    is_used: false,
    created_at: '2026-08-11'
  },
  {
    id: 'vault-3',
    team_id: 'team-1',
    title: 'เปิดตัวกล่อง Mystery Box สุ่มผลิตภัณฑ์นิทาน 5 ชิ้น ราคาเดียว 999 บาท',
    notes: 'ไอเดียแคมเปญช่วงสิ้นปี 12.12 ช่วยระบายสต็อกและกระตุ้นยอดซื้อถัวเฉลี่ยต่อออเดอร์',
    platforms: ['line_oa', 'shopee'],
    tags: ['PromoIdea', 'MysteryBox'],
    is_used: false,
    created_at: '2026-08-12'
  }
];

export const INITIAL_NOTIFICATION_RULES = [
  {
    id: 'rule-1',
    team_id: 'team-1',
    stage: 't_minus_5',
    offset_days: -5,
    title: 'แจ้งเตือนเตรียมอาร์ตเวิร์ก & ภาพถ่ายสินค้า (T-5)',
    target_role: 'content_creator',
    is_active: true,
    template: '[T-5 Days Alert] แคมเปญ "{campaign_name}" เหลือเวลาอีก 5 วัน! กรุณาตรวจสอบและอัปโหลดภาพสินค้า (Image Ready)'
  },
  {
    id: 'rule-2',
    team_id: 'team-1',
    stage: 't_minus_2',
    offset_days: -2,
    title: 'แจ้งเตือนตั้งเวลาโพสต์คอนเทนต์ (T-2)',
    target_role: 'content_creator',
    is_active: true,
    template: '[T-2 Days Alert] แคมเปญ "{campaign_name}" เหลือเวลาอีก 2 วัน! กรุณาตั้งเวลาโพสต์ในทุกแพลตฟอร์ม (Scheduled)'
  },
  {
    id: 'rule-3',
    team_id: 'team-1',
    stage: 't_minus_0',
    offset_days: 0,
    title: 'แจ้งเตือนวันจริงปล่อยแคมเปญ (T-0 Launch Day)',
    target_role: 'marketing_lead',
    is_active: true,
    template: '[T-0 Launch Today!] แคมเปญ "{campaign_name}" เริ่มต้นแล้ววันนี้! กรุณาตรวจเช็คยอดวิวและโพสต์จริง (Posted)'
  },
  {
    id: 'rule-4',
    team_id: 'team-1',
    stage: 'overdue',
    offset_days: 1,
    title: 'Escalation Alert เมื่อเลยกำหนด (Overdue)',
    target_role: 'brand_owner',
    is_active: true,
    template: '[OVERDUE ALERT] แคมเปญ "{campaign_name}" เลยกำหนดปล่อยแล้วยังไม่อัปเดตสถานะ! แจ้งเตือนไปยัง Lead และ Owner ด่วน'
  }
];

export const INITIAL_NOTIFICATION_LOGS = [
  {
    id: 'log-1',
    team_id: 'team-1',
    campaign_id: 'camp-2',
    recipient_name: 'คุณเมย์ (Marketing Lead)',
    recipient_line: 'May_Marketing',
    stage: 'overdue',
    message: '[OVERDUE ALERT] แคมเปญ "ดันยอด Sunscreen Aqua Gel" เลยกำหนดเวลาโพสต์แล้ว! กรุณาอัปเดตสถานะงานในระบบ',
    sent_at: '2026-08-16 09:00:00',
    status: 'sent',
    escalation_count: 2
  },
  {
    id: 'log-2',
    team_id: 'team-1',
    campaign_id: 'camp-1',
    recipient_name: 'คุณเจนนี่ (Content Creator)',
    recipient_line: 'Jenny_Content',
    stage: 't_minus_2',
    message: '[T-2 Days Alert] แคมเปญ "เปิดตัว 9.9 Nitan Radiance Serum" เหลืออีก 2 วัน! กรุณาตรวจเช็คการตั้งเวลาโพสต์คอนเทนต์',
    sent_at: '2026-08-16 08:30:00',
    status: 'sent',
    escalation_count: 0
  }
];
