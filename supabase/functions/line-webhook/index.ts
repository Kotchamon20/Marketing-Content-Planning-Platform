import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://wgwvvahdtdxcfoxxvwkm.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indnd3Z2YWhkdGR4Y2ZveHh2d2ttIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njk3MzIzNywiZXhwIjoyMTAyNTQ5MjM3fQ.Z67Wd8iC--g8-p5-Z_s89234";
const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN") || "";

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();
    const events = body.events || [];

    for (const event of events) {
      const groupId = event.source?.groupId;

      // Automatically auto-capture and save Group ID to Supabase DB
      if (groupId && groupId.startsWith("C")) {
        await supabase
          .from("line_groups")
          .upsert({
            group_id: groupId,
            group_name: "กลุ่มทีมงาน Nitan Marketing",
            is_active: true,
            updated_at: new Date().toISOString()
          }, { onConflict: "group_id" });
      }

      // First-time Group Join Event
      if (event.type === "join") {
        const replyToken = event.replyToken;

        const welcomeTextMessage = {
          type: "text",
          text: "ทำงานที่เรารักกันฮับ 💖✨\n\nสวัสดีครับทีมงาน Nitan! บอทได้อ่านและบันทึกกลุ่มนี้เข้าสู่ระบบอัตโนมัติแล้วครับ พร้อมส่งแจ้งเตือนแผนการตลาดทันทีครับ 🚀🌸"
        };

        const welcomeFlexCard = {
          type: "flex",
          altText: "🌸 ทำงานที่เรารักกันฮับ! บอทแจ้งเตือน Nitan เข้าร่วมกลุ่มเรียบร้อยครับ",
          contents: {
            type: "bubble",
            size: "mega",
            header: {
              type: "box",
              layout: "vertical",
              backgroundColor: "#FFEBF3",
              paddingAll: "15px",
              contents: [
                {
                  type: "text",
                  text: "💖 ทำงานที่เรารักกันฮับ 💖",
                  weight: "bold",
                  color: "#3C2A4D",
                  size: "md",
                  align: "center"
                }
              ]
            },
            body: {
              type: "box",
              layout: "vertical",
              spacing: "md",
              contents: [
                {
                  type: "text",
                  text: "บันทึกกลุ่มนี้เข้าฐานข้อมูล Nitan อัตโนมัติแล้ว 🌸",
                  weight: "bold",
                  size: "sm",
                  color: "#3C2A4D",
                  wrap: true,
                  align: "center"
                }
              ]
            }
          }
        };

        await fetch("https://api.line.me/v2/bot/message/reply", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
          },
          body: JSON.stringify({
            replyToken: replyToken,
            messages: [welcomeTextMessage, welcomeFlexCard]
          })
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
