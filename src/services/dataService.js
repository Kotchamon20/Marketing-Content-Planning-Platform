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

export function subscribeToContentItems(onDataChanged) {
  try {
    const channel = supabase
      .channel('public:content_items')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'content_items' },
        async () => {
          const freshItems = await fetchContentItemsFromSupabase();
          if (freshItems && onDataChanged) {
            onDataChanged(freshItems);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (e) {
    console.warn('Realtime subscription warning:', e);
    return () => { };
  }
}

const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// Helper to format date string cleanly for PostgreSQL TIMESTAMP / DATE
function formatIsoDateForDb(rawVal) {
  const defaultDateStr = new Date().toISOString().split('T')[0];
  if (!rawVal) return defaultDateStr;
  const str = String(rawVal).trim();
  if (str.match(/^\d{4}-\d{2}-\d{2}/)) {
    return str.substring(0, 10);
  }
  const dateMatch = str.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (dateMatch) {
    let day = dateMatch[1].padStart(2, '0');
    let month = dateMatch[2].padStart(2, '0');
    let year = parseInt(dateMatch[3], 10);
    if (year > 2500) year -= 543;
    if (year < 100) year += 2000;
    return `${year}-${month}-${day}`;
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().substring(0, 10);
  }
  return defaultDateStr;
}

export async function upsertContentItemToSupabase(contentItem) {
  try {
    const rawPlat = contentItem.platform;
    let plats = [];
    if (Array.isArray(rawPlat)) {
      plats = rawPlat.map(p => typeof p === 'string' ? p.trim() : p).filter(Boolean);
    } else if (typeof rawPlat === 'string' && rawPlat.trim()) {
      plats = rawPlat.split(/[\s,]+/).map(p => p.trim()).filter(Boolean);
    }
    if (plats.length === 0) plats = ['facebook'];

    const cleanPublishDate = formatIsoDateForDb(contentItem.publish_date);

    // Single clean payload — only columns that exist in the actual Supabase schema
    const payload = {
      title: contentItem.title || '[Untitled Content]',
      caption: contentItem.caption || '',
      visual_concept: contentItem.visual_concept || '',
      platforms: plats,
      status: ['draft', 'scheduled', 'published'].includes(contentItem.status) ? contentItem.status : 'draft',
      publish_date: cleanPublishDate,
      media_url: contentItem.media_url || '',
      reference_url: contentItem.reference_url || '',
      group_name: contentItem.group || '',
      sub_category: contentItem.subCategory || ''
    };

    // Only include UUID id if valid
    if (isUuid(contentItem.id)) payload.id = contentItem.id;

    const { data, error } = await supabase
      .from('content_items')
      .upsert([payload], { onConflict: 'id' })
      .select();

    if (!error) {
      console.log('✅ Supabase upsert OK:', data?.[0]?.id);
      return data;
    }

    // If columns don't exist yet — strip unknown columns and retry with minimal safe payload
    console.warn('⚠️ Supabase upsert warning (will retry minimal):', error.message);

    const safePayload = {
      title: contentItem.title || '[Untitled Content]',
      caption: contentItem.caption || '',
      platform: singlePlatform,
      status: ['draft', 'scheduled', 'published'].includes(contentItem.status) ? contentItem.status : 'draft',
      publish_date: cleanPublishDate,
      media_url: contentItem.media_url || ''
    };
    if (isUuid(contentItem.id)) safePayload.id = contentItem.id;

    const { data: safeData, error: safeError } = await supabase
      .from('content_items')
      .upsert([safePayload], { onConflict: 'id' })
      .select();

    if (!safeError) {
      console.log('✅ Supabase upsert OK (safe fallback):', safeData?.[0]?.id);
      return safeData;
    }

    console.error('❌ Supabase upsert failed (both attempts):', safeError.message);
    return null;
  } catch (err) {
    console.error('❌ Supabase upsertContentItem catch:', err);
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

export async function deleteAllContentItemsFromSupabase() {
  try {
    const { error } = await supabase
      .from('content_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (error) {
      console.warn('Supabase deleteAllContentItems error:', error.message);
    }
  } catch (err) {
    console.error('Supabase deleteAllContentItems catch:', err);
  }
}

export async function deleteCampaignFromSupabase(id) {
  try {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Supabase deleteCampaign error:', error.message);
    }
  } catch (err) {
    console.error('Supabase deleteCampaign catch:', err);
  }
}

export async function deleteMarketingPlanFromSupabase(id) {
  try {
    const { error } = await supabase
      .from('marketing_plans')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Supabase deleteMarketingPlan error:', error.message);
    }
  } catch (err) {
    console.error('Supabase deleteMarketingPlan catch:', err);
  }
}

export async function deleteProductFromSupabase(id) {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Supabase deleteProduct error:', error.message);
    }
  } catch (err) {
    console.error('Supabase deleteProduct catch:', err);
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
      product_id: isUuid(campaign.product_id) ? campaign.product_id : undefined,
      start_date: campaign.start_date || new Date().toISOString().split('T')[0],
      end_date: campaign.end_date || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      budget: Number(campaign.budget) || 0,
      revenue_target: Number(campaign.revenue_target || campaign.projectedSales) || 0,
      actual_revenue: Number(campaign.actual_revenue) || 0,
      image_ready: Boolean(campaign.image_ready),
      scheduled: Boolean(campaign.scheduled),
      posted: Boolean(campaign.posted)
    };

    if (isUuid(campaign.id)) {
      payload.id = campaign.id;
    }

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
// 3. MODULE 3: MARKETING PLANS (marketing_plans table)
// ------------------------------------------------------------------------------
export async function fetchMarketingPlansFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('marketing_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchMarketingPlans warning:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase fetchMarketingPlans error:', err);
    return null;
  }
}

export async function upsertMarketingPlanToSupabase(plan) {
  try {
    const payload = {
      title: plan.title || 'แผนการตลาด Nitan',
      objective: plan.objective || 'สร้างการรับรู้และเพิ่มยอดขาย',
      stp_segmentation: plan.stp_segmentation || '',
      stp_targeting: plan.stp_targeting || '',
      stp_positioning: plan.stp_positioning || '',
      total_budget: Number(plan.total_budget || plan.budget) || 0,
      start_date: plan.start_date || new Date().toISOString().split('T')[0],
      end_date: plan.end_date || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]
    };

    const { data, error } = await supabase
      .from('marketing_plans')
      .upsert([payload])
      .select();

    if (error) {
      console.warn('Supabase upsertMarketingPlan error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase upsertMarketingPlan catch:', err);
    return null;
  }
}

// ------------------------------------------------------------------------------
// 4. PRODUCTS CATALOG (products table)
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
// 5. LINE GROUPS (line_groups table)
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

// ------------------------------------------------------------------------------
// 6. BRANCH BUDGETS ALLOCATION (branch_budgets table)
// ------------------------------------------------------------------------------
export async function fetchBranchBudgetsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('branch_budgets')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchBranchBudgets warning:', error.message);
      return null;
    }

    if (!data || data.length === 0) return [];

    // Deduplicate so only the most recent row per (branch_name, month_year) is returned
    const seen = new Set();
    const uniqueList = [];
    for (const item of data) {
      const key = `${item.branch_name || ''}_${item.month_year || ''}`.trim();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueList.push(item);
      }
    }

    return uniqueList;
  } catch (err) {
    console.error('Supabase fetchBranchBudgets error:', err);
    return null;
  }
}

export async function upsertBranchBudgetToSupabase(branch, monthYear = '2026-08') {
  try {
    if (!branch || !branch.name) return null;

    const payload = {
      branch_name: branch.name,
      month_year: monthYear,
      previous_sales: Number(branch.previousSales) || 0,
      full_budget: Number(branch.manualFullBudget) || 0,
      offline_promotions: branch.promotions || [],
      channel_allocations: branch.channelAllocations || [],
      google_search_breakdown: branch.googleSearchBreakdown || {},
      note: branch.note || '',
      updated_at: new Date().toISOString()
    };

    // Check if an existing row exists for this branch and month
    const { data: existingRows } = await supabase
      .from('branch_budgets')
      .select('id')
      .eq('branch_name', branch.name)
      .eq('month_year', monthYear)
      .order('updated_at', { ascending: false });

    if (existingRows && existingRows.length > 0) {
      const primaryId = existingRows[0].id;
      const { data, error } = await supabase
        .from('branch_budgets')
        .update(payload)
        .eq('id', primaryId)
        .select();

      // Clean up any other duplicate rows in the background
      if (existingRows.length > 1) {
        const extraIds = existingRows.slice(1).map(r => r.id);
        await supabase.from('branch_budgets').delete().in('id', extraIds);
      }

      if (error) {
        console.warn('Supabase updateBranchBudget error:', error.message);
        return null;
      }
      return data;
    } else {
      const { data, error } = await supabase
        .from('branch_budgets')
        .insert([payload])
        .select();

      if (error) {
        console.warn('Supabase insertBranchBudget error:', error.message);
        return null;
      }
      return data;
    }
  } catch (err) {
    console.error('Supabase upsertBranchBudget catch:', err);
    return null;
  }
}

export async function deleteBranchBudgetFromSupabase(branchName, monthYear = '2026-08') {
  try {
    if (!branchName) return false;
    const { error } = await supabase
      .from('branch_budgets')
      .delete()
      .eq('branch_name', branchName)
      .eq('month_year', monthYear);

    if (error) {
      console.warn('Supabase deleteBranchBudget error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase deleteBranchBudget catch:', err);
    return false;
  }
}

// ------------------------------------------------------------------------------
// 7. TODO TASKS (todo_tasks table)
// ------------------------------------------------------------------------------
export async function upsertTodoTaskToSupabase(task) {
  try {
    const payload = {
      title: task.title || 'งานที่ต้องทำ',
      due_date: task.dueDate || new Date().toISOString().split('T')[0],
      priority: task.priority || 'medium',
      assigned_to: task.assignedTo || 'Marketing Team',
      status: task.status || 'pending',
      category: task.category || 'general'
    };

    const { data, error } = await supabase
      .from('todo_tasks')
      .upsert([payload])
      .select();

    if (error) {
      console.warn('Supabase upsertTodoTask error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase upsertTodoTask catch:', err);
    return null;
  }
}

// ------------------------------------------------------------------------------
// 8. KPI ITEMS & PAID ADS (kpi_items table)
// ------------------------------------------------------------------------------
export async function upsertKpiItemToSupabase(kpi) {
  try {
    const payload = {
      title: kpi.title,
      category: kpi.category || 'shopee',
      sub_group: kpi.subGroup || 'Shopee Official Store',
      target_revenue: Number(kpi.targetRevenue) || 0,
      actual_revenue: Number(kpi.actualRevenue) || 0,
      campaign_sales: Number(kpi.campaignSales) || Number(kpi.actualRevenue) || 0,
      note: kpi.note || '',
      orders_count: Number(kpi.ordersCount) || 0,
      roas: Number(kpi.roas) || 0,
      cpa: Number(kpi.cpa) || 0,
      is_ads_running: Boolean(kpi.isAdsRunning),
      ads_budget: Number(kpi.adsBudget) || 0,
      actual_ads_spend: Number(kpi.actualAdsSpend) || 0,
      ads_channel: kpi.adsChannel || 'Online Ads'
    };

    const { data, error } = await supabase
      .from('kpi_items')
      .upsert([payload])
      .select();

    if (error) {
      console.warn('Supabase upsertKpiItem error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase upsertKpiItem catch:', err);
    return null;
  }
}

// ------------------------------------------------------------------------------
// 9. PROMOTION PLANS (promotion_plans table)
// ------------------------------------------------------------------------------
export async function fetchPromotionPlansFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('promotion_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchPromotionPlans warning:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase fetchPromotionPlans error:', err);
    return null;
  }
}

export async function upsertPromotionPlanToSupabase(plan) {
  try {
    const payload = {
      // Required base fields
      title: plan.title,
      category: plan.category || 'discount',
      product_id: plan.targetProductId || plan.productId || 'p-1',
      product_name: plan.targetProductName || plan.productName || 'สินค้าทุกรายการ',
      discount_text: plan.discountOffer || plan.discountText || '',
      start_date: plan.startDate || new Date().toISOString().split('T')[0],
      end_date: plan.endDate || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      status: plan.status || 'active',
      // Extended fields
      target_branch: plan.targetBranch || 'ทุกสาขา',
      budget: Number(plan.budget) || 0,
      projected_sales: Number(plan.projectedSales) || 0,
      channels: Array.isArray(plan.channels) ? plan.channels : [],
      description: plan.description || '',
      doc_content: plan.docContent || ''
    };

    if (isUuid(plan.id)) {
      payload.id = plan.id;
    }

    const { data, error } = await supabase
      .from('promotion_plans')
      .upsert([payload])
      .select();

    if (error) {
      console.warn('Supabase upsertPromotionPlan error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase upsertPromotionPlan catch:', err);
    return null;
  }
}

export async function deletePromotionPlanFromSupabase(id) {
  try {
    const { error } = await supabase
      .from('promotion_plans')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase deletePromotionPlan error:', err);
    return false;
  }
}

// ==========================================
// CONTENT GROUPS (fetch, upsert, delete)
// ==========================================
export async function fetchContentGroupsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('content_groups')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('fetchContentGroupsFromSupabase Error:', err);
    return null;
  }
}

export async function upsertContentGroupToSupabase(group) {
  try {
    const payload = {
      name: group.name,
      color_class: group.colorClass,
      sub_categories: group.subCategories || [],
      sub_category_colors: group.subCategoryColors || {}
    };
    if (isUuid(group.id)) payload.id = group.id;

    const { data, error } = await supabase
      .from('content_groups')
      .upsert([payload], { onConflict: 'id' })
      .select();
    
    if (error) throw error;
    return data ? data[0] : null;
  } catch (err) {
    console.error('upsertContentGroupToSupabase Error:', err);
    return null;
  }
}

export async function deleteContentGroupFromSupabase(id) {
  try {
    if (!isUuid(id)) return;
    const { error } = await supabase
      .from('content_groups')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } catch (err) {
    console.error('deleteContentGroupFromSupabase Error:', err);
  }
}

// ==========================================
// CAMPAIGN IDEAS (fetch, upsert, delete)
// ==========================================
export async function fetchCampaignIdeasFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('campaign_ideas')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('fetchCampaignIdeasFromSupabase Error:', err);
    return null;
  }
}

export async function upsertCampaignIdeaToSupabase(idea) {
  try {
    const payload = {
      title: idea.title,
      description: idea.description,
      status: idea.status || 'draft',
      votes: idea.votes || 0,
      campaign_id: isUuid(idea.campaignId) ? idea.campaignId : null
    };
    if (isUuid(idea.id)) payload.id = idea.id;

    const { data, error } = await supabase
      .from('campaign_ideas')
      .upsert([payload], { onConflict: 'id' })
      .select();
    
    if (error) throw error;
    return data ? data[0] : null;
  } catch (err) {
    console.error('upsertCampaignIdeaToSupabase Error:', err);
    return null;
  }
}

export async function deleteCampaignIdeaFromSupabase(id) {
  try {
    if (!isUuid(id)) return;
    const { error } = await supabase
      .from('campaign_ideas')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } catch (err) {
    console.error('deleteCampaignIdeaFromSupabase Error:', err);
  }
}

// ==========================================
// IDEA VAULT (fetch, upsert, delete)
// ==========================================
export async function fetchIdeaVaultFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('idea_vault')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('fetchIdeaVaultFromSupabase Error:', err);
    return null;
  }
}

export async function upsertIdeaVaultToSupabase(idea) {
  try {
    const payload = {
      title: idea.title,
      notes: idea.notes || '',
      platforms: idea.platforms || [],
      tags: idea.tags || [],
      is_used: idea.isUsed || false,
      reference_url: idea.referenceUrl || null
    };
    if (isUuid(idea.id)) payload.id = idea.id;

    const { data, error } = await supabase
      .from('idea_vault')
      .upsert([payload], { onConflict: 'id' })
      .select();
    
    if (error) throw error;
    return data ? data[0] : null;
  } catch (err) {
    console.error('upsertIdeaVaultToSupabase Error:', err);
    return null;
  }
}

export async function deleteIdeaVaultFromSupabase(id) {
  try {
    if (!isUuid(id)) return;
    const { error } = await supabase
      .from('idea_vault')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } catch (err) {
    console.error('deleteIdeaVaultFromSupabase Error:', err);
  }
}

// ==========================================
// SUBSCRIPTIONS
// ==========================================

export function subscribeToContentGroups(onUpdate) {
  const channel = supabase.channel('realtime_content_groups')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'content_groups' }, async () => {
      const fresh = await fetchContentGroupsFromSupabase();
      if (fresh) onUpdate(fresh);
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

export function subscribeToCampaignIdeas(onUpdate) {
  const channel = supabase.channel('realtime_campaign_ideas')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'campaign_ideas' }, async () => {
      const fresh = await fetchCampaignIdeasFromSupabase();
      if (fresh) onUpdate(fresh);
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

export function subscribeToIdeaVault(onUpdate) {
  const channel = supabase.channel('realtime_idea_vault')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'idea_vault' }, async () => {
      const fresh = await fetchIdeaVaultFromSupabase();
      if (fresh) onUpdate(fresh);
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

// ==========================================
// NOTIFICATION LOGS (Module 4)
// ==========================================

export const fetchNotificationLogsForTodayFromSupabase = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data, error } = await supabase
      .from('notification_logs')
      .select('*')
      .gte('sent_at', today.toISOString());

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching notification logs:', err);
    return [];
  }
};

export const insertNotificationLogToSupabase = async (logData) => {
  try {
    const { data, error } = await supabase
      .from('notification_logs')
      .insert([logData]);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error inserting notification log:', err);
    return null;
  }
};

// ==========================================
// TODO FOLLOWUPS (Module 5)
// ==========================================

export const fetchTodoFollowupsFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('todo_followups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    // Map to frontend shape
    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      targetPerson: item.target_person,
      status: item.status,
      notes: item.notes,
      createdAt: item.created_at
    }));
  } catch (err) {
    console.error('Error fetching followups:', err);
    return [];
  }
};

export const saveTodoFollowupToSupabase = async (item) => {
  try {
    const dbItem = {
      id: item.id,
      title: item.title,
      target_person: item.targetPerson || null,
      status: item.status,
      notes: item.notes || null,
      created_at: item.createdAt || new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('todo_followups')
      .upsert(dbItem)
      .select();

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error saving followup:', err);
    return false;
  }
};

export const deleteTodoFollowupFromSupabase = async (id) => {
  try {
    const { error } = await supabase
      .from('todo_followups')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting followup:', err);
    return false;
  }
};

// ------------------------------------------------------------------------------
// 14. BUDGET ACTUAL EXPENSES (budget_actual_expenses table)
// ------------------------------------------------------------------------------
export async function fetchActualExpensesFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('budget_actual_expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.warn('Supabase fetchActualExpenses warning:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase fetchActualExpenses error:', err);
    return null;
  }
}

export async function upsertActualExpenseToSupabase(item) {
  try {
    const payload = {
      id: item.id,
      month_year: item.monthYear || item.month_year,
      date: item.date,
      title: item.title,
      branch_id: item.branchId || item.branch_id,
      branch_name: item.branchName || item.branch_name,
      channel: item.channel,
      actual_amount: Number(item.actualAmount || item.actual_amount) || 0,
      allocated_budget: Number(item.allocatedBudget || item.allocated_budget) || 0,
      payer: item.payer || '',
      receipt_ref: item.receiptRef || item.receipt_ref || '',
      note: item.note || '',
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('budget_actual_expenses')
      .upsert([payload])
      .select();

    if (error) {
      console.warn('Supabase upsertActualExpense error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase upsertActualExpense catch:', err);
    return null;
  }
}

export async function deleteActualExpenseFromSupabase(id) {
  try {
    const { error } = await supabase
      .from('budget_actual_expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Supabase deleteActualExpense error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase deleteActualExpense catch:', err);
    return false;
  }
}

