import { supabase } from '../lib/supabaseClient';

/**
 * Fetch all content items from Supabase 'content_items' table.
 */
export async function fetchContentItemsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchContentItems warning:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase fetchContentItems error:', err);
    return null;
  }
}

/**
 * Insert or Update a content item in Supabase.
 */
export async function upsertContentItemToSupabase(contentItem) {
  try {
    const payload = {
      id: contentItem.id,
      title: contentItem.title,
      caption: contentItem.caption || '',
      platform: contentItem.platform || 'tiktok',
      status: contentItem.status || 'draft',
      publish_date: contentItem.publish_date || new Date().toISOString(),
      media_url: contentItem.media_url || '',
      reference_url: contentItem.reference_url || '',
      content_group: contentItem.group || ''
    };

    const { data, error } = await supabase
      .from('content_items')
      .upsert([payload])
      .select();

    if (error) {
      console.warn('Supabase upsertContentItem error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase upsertContentItem catch:', err);
    return null;
  }
}

/**
 * Delete a content item from Supabase.
 */
export async function deleteContentItemFromSupabase(id) {
  try {
    const { error } = await supabase
      .from('content_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Supabase deleteContentItem error:', error.message);
    }
  } catch (err) {
    console.error('Supabase deleteContentItem catch:', err);
  }
}
