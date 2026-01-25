
import cron from "node-cron";
import { FcmToken } from "../Models/FCM.Model.js";
import  logger from "../Utils/logger.js";

/**
 * CRON JOB: Delete stale FCM tokens (lastSeenAt > 90 days)
 * Runs daily at 2:00 AM
 */

const STALE_TOKEN_DAYS = 90;

export const cleanupStaleTokensJob = cron.schedule(
  "0 2 * * *", // Every day at 2:00 AM
  async () => {
    try {
      logger.info("Starting FCM token cleanup job");

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - STALE_TOKEN_DAYS);

      const deactivateResult = await FcmToken.updateMany(
        {
          lastSeenAt: { $lt: staleDate },
          isActive: true // Only deactivate currently active tokens
        },
        {
          $set: { isActive: false }
        }
      );

      logger.info(
        `FCM cleanup completed - Deactivated ${deactivateResult.modifiedCount} stale tokens older than ${STALE_TOKEN_DAYS} days`
      );

     

    } catch (error) {
      logger.error("FCM token cleanup job failed:", error);
    }
  }
);