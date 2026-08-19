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
    const rawPlat = contentItem.platform;
    let platformsArr = ['facebook'];
    if (Array.isArray(rawPlat)) {
      platformsArr = rawPlat;
    } else if (typeof rawPlat === 'string') {
      platformsArr = rawPlat.split(/[\s,]+/);
    }

    const payload = {
      title: contentItem.title,
      caption: contentItem.caption || '',
      visual_concept: contentItem.visual_concept || '',
      platform: Array.isArray(contentItem.platform) ? contentItem.platform.join(', ') : (contentItem.platform || 'facebook'),
      platforms: platformsArr,
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
    return data;
  } catch (err) {
    console.error('Supabase fetchBranchBudgets error:', err);
    return null;
  }
}

export async function upsertBranchBudgetToSupabase(branch, monthYear = '2026-08') {
  try {
    const payload = {
      branch_name: branch.name,
      month_year: monthYear,
      previous_sales: Number(branch.previousSales) || 0,
      full_budget: Number(branch.manualFullBudget) || 0,
      offline_promotions: branch.promotions || [],
      channel_allocations: branch.channelAllocations || [],
      google_search_breakdown: branch.googleSearchBreakdown || {},
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('branch_budgets')
      .upsert([payload])
      .select();

    if (error) {
      console.warn('Supabase upsertBranchBudget error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase upsertBranchBudget catch:', err);
    return null;
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
export async function upsertPromotionPlanToSupabase(plan) {
  try {
    const payload = {
      title: plan.title,
      category: plan.category || 'discount',
      product_id: plan.productId || 'p-1',
      product_name: plan.productName || 'สินค้าทุกรายการ',
      discount_text: plan.discountText || '',
      start_date: plan.startDate || new Date().toISOString().split('T')[0],
      end_date: plan.endDate || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      status: plan.status || 'active'
    };

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
