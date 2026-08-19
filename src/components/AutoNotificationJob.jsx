import React, { useEffect, useRef } from 'react';
import { fetchContentItemsFromSupabase, fetchNotificationLogsForTodayFromSupabase, insertNotificationLogToSupabase } from '../services/dataService';
import { sendLineFlexCardAlert } from '../services/lineNotificationService';
import { INITIAL_NOTIFICATION_RULES } from '../data/initialData';

export default function AutoNotificationJob() {
  const isChecking = useRef(false);

  useEffect(() => {
    const checkAndSendNotifications = async () => {
      if (isChecking.current) return;
      
        // ==========================================
        // 9 AM: CONTENT ALERTS
        // ==========================================
        if (now.getHours() >= 9) {
          const contentItems = await fetchContentItemsFromSupabase();
          if (contentItems && contentItems.length > 0) {
            const pendingNotifications = [];
            
            contentItems.forEach(item => {
              if (!item.publish_date) return;
              
              const publishDate = new Date(item.publish_date);
              const publishMidnight = new Date(publishDate);
              publishMidnight.setHours(0, 0, 0, 0);
              const nowMidnight = new Date(now);
              nowMidnight.setHours(0, 0, 0, 0);

              const diffTime = publishMidnight.getTime() - nowMidnight.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              INITIAL_NOTIFICATION_RULES.forEach(rule => {
                let ruleApplies = false;
                if (rule.stage === 't-5' && diffDays === 5) ruleApplies = true;
                if (rule.stage === 't-2' && diffDays === 2) ruleApplies = true;
                if (rule.stage === 't-0' && diffDays === 0) ruleApplies = true;
                
                if (!ruleApplies) return;

                const uniqueMessage = `Auto-sent: ${rule.title} (ContentID: ${item.id})`;
                const hasSentToday = todayLogs.some(log => 
                  log.message === uniqueMessage &&
                  log.stage === rule.stage
                );

                if (!hasSentToday) {
                  pendingNotifications.push({ item, rule, uniqueMessage });
                }
              });
            });

            for (const notif of pendingNotifications) {
              console.log(`[AutoNotificationJob] Sending Content Alert for ${notif.item.title}`);
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
                await insertNotificationLogToSupabase({
                  campaign_id: notif.item.campaign_id || null,
                  stage: notif.rule.stage,
                  message: notif.uniqueMessage,
                  status: 'sent',
                  line_flex_json: alertData
                });
              }
            }
          }
        }

        // ==========================================
        // 10 AM: FOLLOW-UP ALERTS (จากส่วนบันทึกการติดตาม)
        // ==========================================
        if (now.getHours() >= 10) {
          const savedFollowups = localStorage.getItem('nitan_todo_followup');
          if (savedFollowups) {
            const followups = JSON.parse(savedFollowups);
            const activeFollowups = followups.filter(f => f.status !== 'completed'); // แจ้งเตือนจนกว่าจะเสร็จสิ้น

            for (const followup of activeFollowups) {
              const uniqueMessage = `Auto-sent: Follow-up Alert (ID: ${followup.id})`;
              
              const hasSentToday = todayLogs.some(log => 
                log.message === uniqueMessage &&
                log.stage === 'follow-up'
              );

              if (!hasSentToday) {
                console.log(`[AutoNotificationJob] Sending Follow-up Alert for ${followup.title}`);
                const alertData = {
                  title: '[Follow-Up Alert] ตามงานประจำวัน',
                  campaignName: followup.title,
                  platform: followup.targetPerson || 'ทีมงาน',
                  publishDate: new Date().toLocaleDateString('th-TH'),
                  assignedTo: followup.targetPerson || 'ทีมงาน',
                  status: 'FOLLOW_UP'
                };

                const result = await sendLineFlexCardAlert(null, alertData);
                if (result.success || result.alreadyWelcomed) {
                  await insertNotificationLogToSupabase({
                    campaign_id: null,
                    stage: 'follow-up',
                    message: uniqueMessage,
                    status: 'sent',
                    line_flex_json: alertData
                  });
                }
              }
            }
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
