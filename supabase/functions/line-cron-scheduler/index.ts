import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN") || "";

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Fetch upcoming content items within next 5 days
    const now = new Date();
    const target5DaysLater = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    const { data: contentItems, error } = await supabase
      .from("content_items")
      .select("*")
      .gte("publish_date", now.toISOString())
      .lte("publish_date", target5DaysLater.toISOString());

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    const processedLogs = [];

    // 2. Evaluate stage status (T-5, T-2, T-0, Overdue)
    for (const item of contentItems || []) {
      const pubDate = new Date(item.publish_date);
      const diffMs = pubDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      let stage = "";
      if (diffDays <= 0) stage = "T-0 (โพสต์วันนี้)";
      else if (diffDays <= 2) stage = "T-2 (เหลือเวลา 2 วัน)";
      else if (diffDays <= 5) stage = "T-5 (เหลือเวลา 5 วัน)";

      if (stage && item.target_group_id) {
        // Send LINE Flex Message Push
        const flexPayload = {
          to: item.target_group_id,
          messages: [
            {
              type: "flex",
              altText: `📢 [อัตโนมัติ]: ${item.title}`,
              contents: {
                type: "bubble",
                size: "mega",
                header: {
                  type: "box",
                  layout: "vertical",
                  backgroundColor: "#F5EEF8",
                  paddingAll: "15px",
                  contents: [
                    { type: "text", text: "📌 Nitan Scheduled Alert", weight: "bold", color: "#3C2A4D" }
                  ]
                },
                body: {
                  type: "box",
                  layout: "vertical",
                  spacing: "md",
                  contents: [
                    { type: "text", text: item.title, weight: "bold", size: "lg", color: "#3C2A4D" },
                    { type: "text", text: `📱 ช่องทาง: ${item.platform}`, size: "xs", color: "#3C2A4D" },
                    { type: "text", text: `⚠️ สถานะ: ${stage}`, size: "xs", color: "#D946EF", weight: "bold" }
                  ]
                }
              }
            }
          ]
        };

        const res = await fetch("https://api.line.me/v2/bot/message/push", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
          },
          body: JSON.stringify(flexPayload)
        });

        processedLogs.push({ id: item.id, stage, status: res.status });
      }
    }

    return new Response(
      JSON.stringify({ success: true, count: processedLogs.length, logs: processedLogs }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
