import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- Dummy Data & Rules Since Edge Function Can't Read Frontend Constants ---
const INITIAL_NOTIFICATION_RULES = [
  { id: 'nr-1', stage: 't-5', title: 'เตรียมตัวส่งดราฟแรก', description: 'ส่งบรีฟและเริ่มร่างเนื้อหา' },
  { id: 'nr-2', stage: 't-2', title: 'คอนเฟิร์มไฟนอลดราฟ', description: 'รีวิวรอบสุดท้ายก่อนจองคิวโพสต์' },
  { id: 'nr-3', stage: 't-0', title: 'วันกำหนดโพสต์จริง', description: 'ตรวจสอบความเรียบร้อยหลังโพสต์' }
];

async function sendLineFlexCardAlert(targetId, alertData, token) {
  const flexMessagePayload = {
    type: 'flex',
    altText: `📢 [แจ้งเตือน]: ${alertData.campaignName}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#F5EEF8',
        paddingAll: '15px',
        contents: [
          {
            type: 'text',
            text: `📌 ${alertData.title}`,
            weight: 'bold',
            color: '#3C2A4D',
            size: 'md'
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: [
          {
            type: 'text',
            text: alertData.campaignName,
            weight: 'bold',
            size: 'lg',
            color: '#3C2A4D',
            wrap: true
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  { type: 'text', text: '📱 ช่องทาง', color: '#8C7A9E', size: 'xs', flex: 2 },
                  { type: 'text', text: alertData.platform, color: '#3C2A4D', size: 'xs', flex: 4, weight: 'bold', wrap: true }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  { type: 'text', text: '📅 วันที่', color: '#8C7A9E', size: 'xs', flex: 2 },
                  { type: 'text', text: alertData.publishDate, color: '#3C2A4D', size: 'xs', flex: 4, weight: 'bold' }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  { type: 'text', text: '👤 ผู้ดูแล', color: '#8C7A9E', size: 'xs', flex: 2 },
                  { type: 'text', text: alertData.assignedTo, color: '#3C2A4D', size: 'xs', flex: 4, weight: 'bold' }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  { type: 'text', text: '⚠️ สถานะ', color: '#8C7A9E', size: 'xs', flex: 2 },
                  { type: 'text', text: alertData.status, color: '#D946EF', size: 'xs', flex: 4, weight: 'bold' }
                ]
              }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            color: '#CDB4DB',
            action: {
              type: 'uri',
              label: '🔗 เปิดระบบวางแผน Nitan',
              uri: 'https://marketing-content-planning-platform.vercel.app/'
            }
          }
        ]
      }
    }
  };

  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      to: targetId,
      messages: [flexMessagePayload]
    })
  });
  
  return response.ok;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { time } = await req.json().catch(() => ({ time: 'unknown' }));
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    const lineToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');

    if (!lineToken) throw new Error('Missing LINE_CHANNEL_ACCESS_TOKEN env var');

    // Fetch the active target LINE group ID
    const { data: lineGroups } = await supabase.from('line_groups').select('group_id').eq('is_active', true).order('created_at', { ascending: false }).limit(1);
    const targetGroupId = lineGroups && lineGroups.length > 0 ? lineGroups[0].group_id : null;

    if (!targetGroupId) {
      console.log('No active LINE group found.');
      return new Response(JSON.stringify({ success: true, message: 'No active LINE group' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch today's logs to prevent dupes
    const { data: todayLogs } = await supabase
      .from('notification_logs')
      .select('message, stage')
      .gte('sent_at', today.toISOString());
    const logs = todayLogs || [];

    if (time === '9am') {
      // 9 AM: Content Alerts
      const { data: contentItems } = await supabase.from('content_items').select('*');
      const items = contentItems || [];

      for (const item of items) {
        if (!item.publish_date) continue;

        const publishDate = new Date(item.publish_date);
        publishDate.setHours(0, 0, 0, 0);
        const diffTime = publishDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        for (const rule of INITIAL_NOTIFICATION_RULES) {
          let ruleApplies = false;
          if (rule.stage === 't-5' && diffDays === 5) ruleApplies = true;
          if (rule.stage === 't-2' && diffDays === 2) ruleApplies = true;
          if (rule.stage === 't-0' && diffDays === 0) ruleApplies = true;

          if (!ruleApplies) continue;

          const uniqueMessage = `Auto-sent: ${rule.title} (ContentID: ${item.id})`;
          const hasSent = logs.some(l => l.message === uniqueMessage && l.stage === rule.stage);

          if (!hasSent) {
            const alertData = {
              title: rule.title,
              campaignName: item.title,
              platform: (item.platforms || []).join(', ') || 'N/A',
              publishDate: new Date(item.publish_date).toISOString().split('T')[0],
              assignedTo: item.creator_id || 'ทีมงาน',
              status: rule.stage.toUpperCase()
            };

            const success = await sendLineFlexCardAlert(targetGroupId, alertData, lineToken);
            if (success) {
              await supabase.from('notification_logs').insert([{
                campaign_id: item.campaign_id || null,
                stage: rule.stage,
                message: uniqueMessage,
                status: 'sent',
                line_flex_json: alertData
              }]);
            }
          }
        }
      }
    } else if (time === '10am') {
      // 10 AM: Follow-up Alerts
      const { data: followups } = await supabase.from('todo_followups').select('*').neq('status', 'completed');
      const activeFollowups = followups || [];

      for (const followup of activeFollowups) {
        const uniqueMessage = `Auto-sent: Follow-up Alert (ID: ${followup.id})`;
        const hasSent = logs.some(l => l.message === uniqueMessage && l.stage === 'follow-up');

        if (!hasSent) {
          const alertData = {
            title: '[Follow-Up Alert] ตามงานประจำวัน',
            campaignName: followup.title,
            platform: followup.target_person || 'ทีมงาน',
            publishDate: new Date().toISOString().split('T')[0],
            assignedTo: followup.target_person || 'ทีมงาน',
            status: 'FOLLOW_UP'
          };

          const success = await sendLineFlexCardAlert(targetGroupId, alertData, lineToken);
          if (success) {
            await supabase.from('notification_logs').insert([{
              campaign_id: null,
              stage: 'follow-up',
              message: uniqueMessage,
              status: 'sent',
              line_flex_json: alertData
            }]);
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Cron error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
