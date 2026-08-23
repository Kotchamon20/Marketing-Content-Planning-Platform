import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ==========================================
// 1. Setup & Helper Functions
// ==========================================
let supabase: any = null;
try {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
  supabase = createClient(supabaseUrl, supabaseKey);
} catch (e: any) {
  console.error("Supabase Client Error:", e.message);
}

const lineToken = Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN") || "";
const lineGroupId = Deno.env.get("LINE_DEFAULT_GROUP_ID") || "C6b7a0c1b8fe6cab110efdb7097ab3520"; 
const systemUrl = Deno.env.get("FRONTEND_URL") || "https://marketing-content-planning-platform.vercel.app/";

async function sendLineFlexMessage(altText: string, flexContents: any) {
  if (!lineToken) {
    console.warn("No LINE token found. Skipping send.");
    return false;
  }
  const payload = {
    to: lineGroupId,
    messages: [
      {
        type: "flex",
        altText: altText,
        contents: flexContents
      }
    ]
  };

  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${lineToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("LINE API Error:", data);
    return false;
  }
  return true;
}

// ==========================================
// 2. Cron Jobs (Deno.cron)
// ==========================================

async function runMorningDigest() {
  console.log("Running Morning Digest...");
  const todayStr = new Date().toISOString().split('T')[0];
  
  // 1. งานวันนี้ (content_items ที่ publish_date = วันนี้ และยังไม่โพสต์)
  const { data: contents } = await supabase
    .from('content_items')
    .select('*')
    .eq('publish_date', todayStr)
    .neq('status', 'Published');
    
  // 2. งานสถานะ กำลังตาม (todo_followups status = 'following')
  const { data: followups } = await supabase
    .from('todo_followups')
    .select('*')
    .eq('status', 'following');

  if ((!contents || contents.length === 0) && (!followups || followups.length === 0)) {
    console.log("No items for morning digest.");
    // For manual testing, we might want to still send a message so the user knows it worked
    await sendLineFlexMessage("☀️ สรุปงานประจำวัน (Daily Digest)", {
      type: "bubble",
      body: { type: "box", layout: "vertical", contents: [{ type: "text", text: "ไม่มีงานค้างหรือต้องทำวันนี้!", weight: "bold" }] },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#ec4899",
            action: { type: "uri", label: "เปิดระบบ", uri: systemUrl }
          }
        ]
      }
    });
    return;
  }

  const contentBox = (contents || []).map(c => ({
    type: "box",
    layout: "horizontal",
    contents: [
      { type: "text", text: `• ${c.title}`, size: "sm", color: "#555555", flex: 1, wrap: true }
    ]
  }));

  const followupBox = (followups || []).map(f => ({
    type: "box",
    layout: "horizontal",
    contents: [
      { type: "text", text: `⏳ ${f.title} (ตามคุณ: ${f.target_person || '-'})`, size: "sm", color: "#eab308", flex: 1, wrap: true }
    ]
  }));

  const flexMessage = {
    type: "bubble",
    header: {
      type: "box",
      layout: "vertical",
      backgroundColor: "#ec4899",
      contents: [
        { type: "text", text: "☀️ Daily Digest สรุปงานวันนี้", color: "#ffffff", weight: "bold", size: "md" }
      ]
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      contents: [
        { type: "text", text: "คอนเทนต์ที่ต้องโพสต์วันนี้:", weight: "bold", size: "sm", color: "#111827" },
        ...(contentBox.length > 0 ? contentBox : [{ type: "text", text: "ไม่มีคอนเทนต์ค้างวันนี้", size: "sm", color: "#9ca3af" }]),
        { type: "separator", margin: "md" },
        { type: "text", text: "งานที่ต้องตาม (Follow-up):", weight: "bold", size: "sm", color: "#111827" },
        ...(followupBox.length > 0 ? followupBox : [{ type: "text", text: "ไม่มีงานตาม", size: "sm", color: "#9ca3af" }])
      ]
    },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        {
          type: "button",
          style: "primary",
          color: "#ec4899",
          action: { type: "uri", label: "เปิดระบบ", uri: systemUrl }
        }
      ]
    }
  };

  await sendLineFlexMessage("☀️ สรุปงานประจำวัน (Daily Digest)", flexMessage);
}

// ☀️ Morning Digest (ทุกวัน 09:00 น. -> 02:00 UTC)
// Deno.cron("Morning Digest", "0 2 * * *", async () => {
//   await runMorningDigest();
// });

// 🎯 แคมเปญใกล้เริ่ม T-2 Days & 🎨 เตือนทำภาพ T-5 Days (ทุกวัน 10:00 น. -> 03:00 UTC)
// Deno.cron("Campaign T-2 and T-5 Alerts", "0 3 * * *", async () => {
//   console.log("Running Campaign Alerts...");
  
//   // หาวันที่ล่วงหน้า 2 วัน และ 5 วัน
//   const today = new Date();
  
//   const d2 = new Date(today);
//   d2.setDate(d2.getDate() + 2);
//   const tMinus2Str = d2.toISOString().split('T')[0];

//   const { data: campaigns } = await supabase
//     .from('campaign_ideas')
//     .select('*')
//     .gte('start_date', today.toISOString().split('T')[0]);

//   if (!campaigns || campaigns.length === 0) return;

//   const t2Campaigns = campaigns.filter(c => c.start_date === tMinus2Str);
  
//   // สมมติว่าถ้า stage_status !== 'completed' แปลว่าภาพ/งานยังไม่เสร็จ
//   const graphicAlertCampaigns = campaigns.filter(c => {
//     const diffTime = new Date(c.start_date).getTime() - today.getTime();
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     return diffDays <= 5 && diffDays > 0 && c.stage_status !== 'completed';
//   });

//   // ส่ง T-2 Alert
//   for (const camp of t2Campaigns) {
//     const flex = {
//       type: "bubble",
//       header: {
//         type: "box",
//         layout: "vertical",
//         backgroundColor: "#8b5cf6",
//         contents: [{ type: "text", text: "🎯 อีก 2 วัน แคมเปญจะเริ่ม!", color: "#ffffff", weight: "bold" }]
//       },
//       body: {
//         type: "box",
//         layout: "vertical",
//         contents: [
//           { type: "text", text: camp.name, weight: "bold", size: "lg", wrap: true },
//           { type: "text", text: `เริ่มวันที่: ${camp.start_date}`, size: "sm", color: "#6b7280" }
//         ]
//       },
//       footer: {
//         type: "box",
//         layout: "vertical",
//         spacing: "sm",
//         contents: [
//           {
//             type: "button",
//             style: "primary",
//             color: "#8b5cf6",
//             action: { type: "uri", label: "เปิดระบบ", uri: systemUrl }
//           }
//         ]
//       }
//     };
//     await sendLineFlexMessage(`🎯 เตรียมตัว: แคมเปญ ${camp.name} จะเริ่มในอีก 2 วัน`, flex);
//   }

//   // ส่ง T-5 Graphic Alert (เตือนทุกวันจนกว่าจะเสร็จ)
//   for (const camp of graphicAlertCampaigns) {
//     const flex = {
//       type: "bubble",
//       header: {
//         type: "box",
//         layout: "vertical",
//         backgroundColor: "#f43f5e",
//         contents: [{ type: "text", text: "🎨 ด่วน! ตามงานภาพแคมเปญ", color: "#ffffff", weight: "bold" }]
//       },
//       body: {
//         type: "box",
//         layout: "vertical",
//         contents: [
//           { type: "text", text: camp.name, weight: "bold", size: "lg", wrap: true },
//           { type: "text", text: `สถานะปัจจุบัน: ${camp.stage_status || 'Draft'}`, size: "sm", color: "#ef4444", weight: "bold" },
//           { type: "text", text: `เริ่มวันที่: ${camp.start_date}`, size: "sm", color: "#6b7280" },
//           { type: "text", text: "กรุณาเร่งทำภาพและอัปเดตสถานะให้เป็น Completed ก่อนแคมเปญเริ่ม!", size: "xs", color: "#ef4444", wrap: true, margin: "md" }
//         ]
//       },
//       footer: {
//         type: "box",
//         layout: "vertical",
//         spacing: "sm",
//         contents: [
//           {
//             type: "button",
//             style: "primary",
//             color: "#f43f5e",
//             action: { type: "uri", label: "เปิดระบบ", uri: systemUrl }
//           }
//         ]
//       }
//     };
//     await sendLineFlexMessage(`🎨 ตามงานภาพ: แคมเปญ ${camp.name}`, flex);
//   }
// });

// 🚨 Overdue Alert (ทุกวัน 17:00 น. -> 10:00 UTC)
// Deno.cron("Overdue Alert", "0 10 * * *", async () => {
//   console.log("Running Overdue Alert...");
//   const todayStr = new Date().toISOString().split('T')[0];
  
//   const { data: contents } = await supabase
//     .from('content_items')
//     .select('*')
//     .eq('publish_date', todayStr)
//     .neq('status', 'Published');

//   if (!contents || contents.length === 0) return;

//   const contentBox = contents.map(c => ({
//     type: "box",
//     layout: "horizontal",
//     contents: [
//       { type: "text", text: `• ${c.title}`, size: "sm", color: "#ef4444", flex: 1, wrap: true }
//     ]
//   }));

//   const flexMessage = {
//     type: "bubble",
//     header: {
//       type: "box",
//       layout: "vertical",
//       backgroundColor: "#b91c1c",
//       contents: [
//         { type: "text", text: "🚨 Overdue Alert งานค้างของวันนี้", color: "#ffffff", weight: "bold" }
//       ]
//     },
//     body: {
//       type: "box",
//       layout: "vertical",
//       spacing: "md",
//       contents: [
//         { type: "text", text: "งานที่ยังไม่ถูกโพสต์หรือเคลียร์ให้จบ:", weight: "bold", size: "sm" },
//         ...contentBox
//       ]
//     },
//     footer: {
//       type: "box",
//       layout: "vertical",
//       spacing: "sm",
//       contents: [
//         {
//           type: "button",
//           style: "primary",
//           color: "#b91c1c",
//           action: { type: "uri", label: "เปิดระบบ", uri: systemUrl }
//         }
//       ]
//     }
//   };

//   await sendLineFlexMessage("🚨 สรุปงานค้างประจำวัน (Overdue Alert)", flexMessage);
// });


// ==========================================
// 3. HTTP Handler (For manual testing via REST)
// ==========================================
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action } = await req.json().catch(() => ({ action: 'ping' }));
    
    // Allows manual trigger for testing
    if (action === 'test_morning') {
      if (!supabase) throw new Error("Supabase client failed to initialize.");
      await runMorningDigest();
      return new Response(JSON.stringify({ status: "success", message: "Morning digest triggered manually." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "Cron jobs are running in the background.", supabaseReady: !!supabase }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
