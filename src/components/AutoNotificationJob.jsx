import React, { useEffect, useRef } from 'react';
import { fetchContentItemsFromSupabase, fetchNotificationLogsForTodayFromSupabase, insertNotificationLogToSupabase } from '../services/dataService';
import { sendLineFlexCardAlert } from '../services/lineNotificationService';
import { INITIAL_NOTIFICATION_RULES } from '../data/initialData';

export default function AutoNotificationJob() {
  const isChecking = useRef(false);

  useEffect(() => {
    const checkAndSendNotifications = async () => {
      if (isChecking.current) return;
      
      const now = new Date();
      // Only run if it's 9:00 AM or later
      if (now.getHours() < 9) return;

      isChecking.current = true;
      try {
        console.log('[AutoNotificationJob] Checking for 9 AM daily notifications...');
        
        // 1. Fetch today's logs to prevent duplicates
        const todayLogs = await fetchNotificationLogsForTodayFromSupabase();
        
        // 2. Fetch all content items
        const contentItems = await fetchContentItemsFromSupabase();
        if (!contentItems || contentItems.length === 0) {
          isChecking.current = false;
          return;
        }

        // 3. Evaluate rules
        const pendingNotifications = [];
        
        contentItems.forEach(item => {
          if (!item.publish_date) return;
          
          const publishDate = new Date(item.publish_date);
          // Set both to midnight to count pure days difference
          const publishMidnight = new Date(publishDate);
          publishMidnight.setHours(0, 0, 0, 0);
          const nowMidnight = new Date(now);
          nowMidnight.setHours(0, 0, 0, 0);

          const diffTime = publishMidnight.getTime() - nowMidnight.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          INITIAL_NOTIFICATION_RULES.forEach(rule => {
            let ruleApplies = false;
            // Check if rule applies
            if (rule.stage === 't-5' && diffDays === 5) ruleApplies = true;
            if (rule.stage === 't-2' && diffDays === 2) ruleApplies = true;
            if (rule.stage === 't-0' && diffDays === 0) ruleApplies = true;
            
            if (!ruleApplies) return;

            // Use message as a unique identifier for this content item and stage since we don't have content_item_id in notification_logs
            const uniqueMessage = `Auto-sent: ${rule.title} (ContentID: ${item.id})`;

            // Check if already sent today
            const hasSentToday = todayLogs.some(log => 
              log.message === uniqueMessage &&
              log.stage === rule.stage
            );

            if (!hasSentToday) {
              pendingNotifications.push({
                item,
                rule,
                uniqueMessage
              });
            }
          });
        });

        // 4. Send pending notifications
        for (const notif of pendingNotifications) {
          console.log(`[AutoNotificationJob] Sending alert for ${notif.item.title} (Rule: ${notif.rule.stage})`);
          
          const alertData = {
            title: notif.rule.title,
            campaignName: notif.item.title,
            platform: (notif.item.platforms || []).join(', ') || 'N/A',
            publishDate: new Date(notif.item.publish_date).toLocaleDateString('th-TH'),
            assignedTo: notif.item.creator_id || 'ทีมงาน',
            status: notif.rule.stage.toUpperCase()
          };

          const result = await sendLineFlexCardAlert(null, alertData);
          
          if (result.success || result.alreadyWelcomed) {
            // Log success to DB
            await insertNotificationLogToSupabase({
              campaign_id: notif.item.campaign_id || null, // avoid foreign key violation
              stage: notif.rule.stage,
              message: notif.uniqueMessage,
              status: 'sent',
              line_flex_json: alertData
            });
          }
        }
        
      } catch (err) {
        console.error('[AutoNotificationJob] Error:', err);
      } finally {
        isChecking.current = false;
      }
    };

    // Run check immediately on mount, then every 5 minutes
    checkAndSendNotifications();
    const interval = setInterval(checkAndSendNotifications, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return null; // Hidden background component
}
