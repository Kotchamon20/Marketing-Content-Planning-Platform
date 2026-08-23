import { supabase } from '../lib/supabaseClient';

/**
 * LINE Notification Service
 * Sends messages via Supabase Edge Function (handles CORS & token securely)
 */

const EDGE_FUNCTION_URL = 'https://wgwvvahdtdxcfoxxvwkm.supabase.co/functions/v1/send-line-alert';

export const LINE_CHANNEL_ACCESS_TOKEN =
  import.meta.env.VITE_LINE_CHANNEL_ACCESS_TOKEN ||
  'LI9O/5QY3ywLfFrMQCEW39FDq2HA6oCO/gKdtLM1RkBWju8eN2/q088a3vu3+c2/Jv11zVBv7SSq7NbLxfgaIetuF+MfiPaImpgBYULd51lgdDlVZFGVQwe24w+mzQBXIIU76lOvekH/dFRylSSH3QdB04t89/1O/w1cDnyilFU=';

// ─────────────────────────────────────────────
// DB Helpers
// ─────────────────────────────────────────────

/** Fetch only real LINE group ID (starts with C) */
export async function fetchAutoSavedGroupFromDb() {
  try {
    const { data, error } = await supabase
      .from('line_groups')
      .select('group_id')
      .eq('is_active', true)
      .like('group_id', 'C%')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0) return data[0].group_id;
  } catch (err) {
    console.warn('[LINE] fetchAutoSavedGroupFromDb error:', err);
  }
  return '';
}

/** Fetch full group info (id + name) for UI display */
export async function fetchAutoSavedGroupFullInfo() {
  try {
    const { data, error } = await supabase
      .from('line_groups')
      .select('group_id, group_name, updated_at')
      .eq('is_active', true)
      .like('group_id', 'C%')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0) return data[0];
  } catch (err) {
    console.warn('[LINE] fetchAutoSavedGroupFullInfo error:', err);
  }
  return null;
}

// ─────────────────────────────────────────────
// Core Push Function — via Edge Function only
// ─────────────────────────────────────────────

async function pushToLine(targetId, messages, token = LINE_CHANNEL_ACCESS_TOKEN) {
  console.log('[LINE] Sending to:', targetId);

  try {
    const res = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: targetId, messages, token }),
    });

    const data = await res.json().catch(() => ({}));
    console.log('[LINE] Response:', res.status, data);

    if (res.ok) {
      return { success: true, data };
    }

    // Parse LINE API error message
    const errMsg = data.message || data.error || `HTTP ${res.status}`;
    return { success: false, error: errMsg, data };
  } catch (err) {
    console.error('[LINE] Push failed:', err);
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/**
 * Send a simple text message to the group
 */
export async function sendLineTextMessage(text, targetId = '', token = LINE_CHANNEL_ACCESS_TOKEN) {
  let groupId = targetId;
  if (!groupId || !groupId.startsWith('C')) {
    groupId = await fetchAutoSavedGroupFromDb();
  }
  if (!groupId) return { success: false, error: 'ไม่พบ Group ID ในฐานข้อมูล' };

  return pushToLine(groupId, [{ type: 'text', text }], token);
}

/**
 * Send a Flex Card alert message (for campaign notifications)
 */
export async function sendLineFlexCardAlert(targetId = '', alertData = {}, token = LINE_CHANNEL_ACCESS_TOKEN) {
  // Resolve group ID
  let groupId = targetId;
  if (!groupId || !groupId.startsWith('C')) {
    groupId = await fetchAutoSavedGroupFromDb();
  }
  if (!groupId) {
    return {
      success: false,
      error: 'ไม่พบกลุ่ม LINE ใน DB กรุณาดึงบอทเข้ากลุ่มแชท LINE ก่อน'
    };
  }

  const {
    title = 'Nitan Campaign Alert',
    campaignName = 'แคมเปญใหม่',
    platform = '-',
    publishDate = '-',
    assignedTo = 'ทีมงาน Marketing',
    status = '-',
  } = alertData;

  const flexMessage = {
    type: 'flex',
    altText: `📢 แจ้งเตือนแคมเปญ: ${campaignName}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#F5EEF8',
        paddingAll: '15px',
        contents: [
          { type: 'text', text: `📌 ${title}`, weight: 'bold', color: '#3C2A4D', size: 'md' }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: [
          { type: 'text', text: campaignName, weight: 'bold', size: 'lg', color: '#3C2A4D', wrap: true },
          {
            type: 'box', layout: 'vertical', margin: 'lg', spacing: 'sm',
            contents: [
              { type: 'box', layout: 'baseline', spacing: 'sm', contents: [
                { type: 'text', text: '📱 ช่องทาง', color: '#8C7A9E', size: 'xs', flex: 2 },
                { type: 'text', text: platform, color: '#3C2A4D', size: 'xs', flex: 4, weight: 'bold' }
              ]},
              { type: 'box', layout: 'baseline', spacing: 'sm', contents: [
                { type: 'text', text: '📅 โพสต์วัน', color: '#8C7A9E', size: 'xs', flex: 2 },
                { type: 'text', text: publishDate, color: '#3C2A4D', size: 'xs', flex: 4, weight: 'bold' }
              ]},
              { type: 'box', layout: 'baseline', spacing: 'sm', contents: [
                { type: 'text', text: '👤 ผู้ดูแล', color: '#8C7A9E', size: 'xs', flex: 2 },
                { type: 'text', text: assignedTo, color: '#3C2A4D', size: 'xs', flex: 4, weight: 'bold' }
              ]},
              { type: 'box', layout: 'baseline', spacing: 'sm', contents: [
                { type: 'text', text: '⚠️ สถานะ', color: '#8C7A9E', size: 'xs', flex: 2 },
                { type: 'text', text: status, color: '#D946EF', size: 'xs', flex: 4, weight: 'bold' }
              ]},
            ]
          }
        ]
      },
      footer: {
        type: 'box', layout: 'vertical', spacing: 'sm',
        contents: [{
          type: 'button', style: 'primary', height: 'sm', color: '#CDB4DB',
          action: { type: 'uri', label: '🔗 เปิดระบบ Nitan', uri: 'https://marketing-content-planning-platform.vercel.app/' }
        }]
      }
    }
  };

  return pushToLine(groupId, [flexMessage], token);
}
