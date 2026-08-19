import { supabase } from '../lib/supabaseClient';

/**
 * ==============================================================================
 * Supabase Real-Time Data Persistence Service
 * Connects Local (http://localhost:3000) & Production (Vercel) directly to Supabase DB
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. MODULE 1: CONTENT ITEMS (content_items table)
// ------------------------------------------------------------------------------
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

export async function upsertContentItemToSupabase(contentItem) {
  try {
    const payload = {
      title: contentItem.title,
      caption: contentItem.caption || '',
      platform: (contentItem.platform || 'tiktok').toLowerCase(),
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

// ------------------------------------------------------------------------------
// 2. MODULE 2 & 4: CAMPAIGNS (campaigns table)
// ------------------------------------------------------------------------------
export async function fetchCampaignsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchCampaigns warning:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase fetchCampaigns error:', err);
    return null;
  }
}

export async function upsertCampaignToSupabase(campaign) {
  try {
    const payload = {
      name: campaign.name || campaign.title || 'แคมเปญใหม่',
      description: campaign.description || '',
      start_date: campaign.start_date || new Date().toISOString().split('T')[0],
      end_date: campaign.end_date || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      budget: Number(campaign.budget) || 0,
      revenue_target: Number(campaign.revenue_target || campaign.projectedSales) || 0,
      actual_revenue: Number(campaign.actual_revenue) || 0,
      image_ready: Boolean(campaign.image_ready),
      scheduled: Boolean(campaign.scheduled),
      posted: Boolean(campaign.posted)
    };

    const { data, error } = await supabase
      .from('campaigns')
      .upsert([payload])
      .select();

    if (error) {
      console.warn('Supabase upsertCampaign error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase upsertCampaign catch:', err);
    return null;
  }
}

// ------------------------------------------------------------------------------
// 3. PRODUCTS CATALOG (products table)
// ------------------------------------------------------------------------------
export async function fetchProductsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchProducts warning:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase fetchProducts error:', err);
    return null;
  }
}

export async function upsertProductToSupabase(product) {
  try {
    const payload = {
      name: product.name,
      sku: product.sku || `SKU-${Date.now()}`,
      category: product.category || 'General',
      price: Number(product.price) || 0
    };

    const { data, error } = await supabase
      .from('products')
      .upsert([payload])
      .select();

    if (error) {
      console.warn('Supabase upsertProduct error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase upsertProduct catch:', err);
    return null;
  }
}

// ------------------------------------------------------------------------------
// 4. LINE GROUPS (line_groups table)
// ------------------------------------------------------------------------------
export async function fetchLineGroupsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('line_groups')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchLineGroups warning:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase fetchLineGroups error:', err);
    return null;
  }
}

export async function upsertLineGroupToSupabase(groupId, groupName = 'Nitan Line Group') {
  try {
    const payload = {
      group_id: groupId,
      group_name: groupName,
      is_active: true,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('line_groups')
      .upsert([payload], { onConflict: 'group_id' })
      .select();

    if (error) {
      console.warn('Supabase upsertLineGroup error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase upsertLineGroup catch:', err);
    return null;
  }
}
