import { supabase } from '../lib/supabaseClient';

/**
 * LINE Notification Service Helper
 * Supports LINE Messaging API with DB auto-captured Group ID
 */

export const LINE_CHANNEL_ACCESS_TOKEN = 
  import.meta.env.VITE_LINE_CHANNEL_ACCESS_TOKEN || 
  'LI9O/5QY3ywLfFrMQCEW39FDq2HA6oCO/gKdtLM1RkBWju8eN2/q088a3vu3+c2/Jv11zVBv7SSq7NbLxfgaIetuF+MfiPaImpgBYULd51lgdDlVZFGVQwe24w+mzQBXIIU76lOvekH/dFRylSSH3QdB04t89/1O/w1cDnyilFU=';

/**
 * Automatically fetch the auto-saved Group ID from Supabase Database (line_groups table)
 */
export async function fetchAutoSavedGroupFromDb() {
  try {
    const { data, error } = await supabase
      .from('line_groups')
      .select('group_id, group_name')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0) {
      return data[0].group_id;
    }
  } catch (err) {
    console.warn('Could not fetch auto-saved group from Supabase line_groups table:', err);
  }

  // Fallback to localStorage if cached
  return localStorage.getItem('nitan_line_target_id') || '';
}

/**
 * Send HTTP request to LINE Messaging API with CORS proxy fallback
 */
async function pushToLineApi(targetId, messages, token = LINE_CHANNEL_ACCESS_TOKEN) {
  // Strategy 1: Use Vite Proxy `/line-api/v2/bot/message/push` (Bypasses browser CORS locally)
  try {
    const proxyResponse = await fetch('/line-api/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: targetId,
        messages: messages
      }),
    });

    const data = await proxyResponse.json().catch(() => ({}));
    if (proxyResponse.ok) {
      return { success: true, data };
    } else {
      let errMsg = data.message || 'ส่งข้อความไม่สำเร็จ (HTTP 400 Bad Request)';
      if (data.details && data.details.length > 0) {
        errMsg += `: ${data.details.map(d => d.message).join(', ')}`;
      }
      if (errMsg.toLowerCase().includes('to') || (!targetId.startsWith('C') && !targetId.startsWith('U'))) {
        errMsg = 'ยังไม่พบบอทในกลุ่ม LINE! กรุณาดึงบอทเข้ากลุ่มแชทในแอป LINE 1 ครั้ง ระบบจะอ่านและบันทึกเข้า DB ให้อัตโนมัติครับ';
      }
      return { success: false, error: errMsg, data };
    }
  } catch (proxyError) {
    console.warn('Vite proxy fetch failed, trying Supabase Edge Function fallback:', proxyError);
  }

  // Strategy 2: Fallback to Supabase Edge Function Proxy (for production deployments)
  try {
    const edgeResponse = await fetch('https://wgwvvahdtdxcfoxxvwkm.supabase.co/functions/v1/send-line-alert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: targetId,
        messages: messages,
        token: token
      }),
    });

    const data = await edgeResponse.json().catch(() => ({}));
    return { success: edgeResponse.ok, data };
  } catch (edgeError) {
    console.error('LINE Messaging Push Error:', edgeError);
    return { success: false, error: edgeError.message };
  }
}

/**
 * Send First-Time Welcome Message when bot joins a LINE group for the FIRST time
 * "ทำงานที่เรารักกันฮับ 💖✨"
 */
export async function sendFirstTimeWelcomeMessage(targetId, token = LINE_CHANNEL_ACCESS_TOKEN) {
  if (!token || !targetId || !/^(C|U)[a-fA-F0-9]{32}$/.test(targetId)) {
    return { success: false, error: 'Missing or invalid credentials' };
  }

  try {
    const welcomedStr = localStorage.getItem('nitan_line_welcomed_groups') || '[]';
    const welcomedList = JSON.parse(welcomedStr);
    if (welcomedList.includes(targetId)) {
      return { success: true, alreadyWelcomed: true };
    }
  } catch (err) {
    console.error('Error reading welcomed groups from storage:', err);
  }

  const welcomeTextMessage = {
    type: 'text',
    text: 'ทำงานที่เรารักกันฮับ 💖✨\n\nสวัสดีครับทีมงาน Nitan! บอทบันทึกกลุ่มนี้เข้าสู่ DB อัตโนมัติแล้วครับ พร้อมส่งแจ้งเตือนแคมเปญให้เรียบร้อยครับ 🚀🌸'
  };

  const result = await pushToLineApi(targetId, [welcomeTextMessage], token);
  if (result.success) {
    try {
      const welcomedStr = localStorage.getItem('nitan_line_welcomed_groups') || '[]';
      const welcomedList = JSON.parse(welcomedStr);
      if (!welcomedList.includes(targetId)) {
        welcomedList.push(targetId);
        localStorage.setItem('nitan_line_welcomed_groups', JSON.stringify(welcomedList));
      }
    } catch (err) {
      console.error('Error saving welcomed group to storage:', err);
    }
  }

  return result;
}

/**
 * Send LINE Flex Message Card to auto-detected DB Group ID
 */
export async function sendLineFlexCardAlert(targetId, alertData, token = LINE_CHANNEL_ACCESS_TOKEN) {
  let finalTargetId = targetId;

  // Auto-fetch from DB if targetId is empty or placeholder
  if (!finalTargetId || !finalTargetId.startsWith('C')) {
    finalTargetId = await fetchAutoSavedGroupFromDb();
  }

  const isValidLineId = (id) => typeof id === 'string' && /^(C|U)[a-fA-F0-9]{32}$/.test(id);

  if (!isValidLineId(finalTargetId)) {
    return {
      success: false,
      error: 'ยังไม่พบกลุ่ม LINE จริงในฐานข้อมูล DB! กรุณาดึงบอท @499olvju เข้ากลุ่มแชทในแอป LINE 1 ครั้ง บอทจะอ่านและบันทึกกลุ่มเข้า DB ให้อัตโนมัติครับ'
    };
  }

  // Trigger First-Time Welcome message if this group hasn't received it yet
  await sendFirstTimeWelcomeMessage(finalTargetId, token);

  const {
    title = 'Nitan Content Alert',
    campaignName = 'แคมเปญใหม่',
    platform = 'TikTok / Facebook',
    publishDate = '-',
    assignedTo = 'ทีมงาน Marketing',
    status = 'T-2 (เหลือ 2 วัน)'
  } = alertData || {};

  const flexMessagePayload = {
    type: 'flex',
    altText: `📢 [แจ้งเตือนแคมเปญ]: ${campaignName}`,
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
            text: `📌 ${title}`,
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
            text: campaignName,
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
                  { type: 'text', text: platform, color: '#3C2A4D', size: 'xs', flex: 4, weight: 'bold' }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  { type: 'text', text: '📅 โพสต์วัน', color: '#8C7A9E', size: 'xs', flex: 2 },
                  { type: 'text', text: publishDate, color: '#3C2A4D', size: 'xs', flex: 4, weight: 'bold' }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  { type: 'text', text: '👤 ผู้ดูแล', color: '#8C7A9E', size: 'xs', flex: 2 },
                  { type: 'text', text: assignedTo, color: '#3C2A4D', size: 'xs', flex: 4, weight: 'bold' }
                ]
              },
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  { type: 'text', text: '⚠️ สถานะ', color: '#8C7A9E', size: 'xs', flex: 2 },
                  { type: 'text', text: status, color: '#D946EF', size: 'xs', flex: 4, weight: 'bold' }
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

  return await pushToLineApi(finalTargetId, [flexMessagePayload], token);
}
