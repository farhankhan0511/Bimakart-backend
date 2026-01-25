import { FcmToken } from "../Models/FCM.Model.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asynchandler } from "../Utils/asynchandler.js";
import admin from "../Utils/firebase.js";
import logger from "../Utils/logger.js";
import { withRetry } from "../Utils/Retry.js";
import { sendFilteredNotificationSchema } from "../Utils/zodschemas.js";

// Save or update FCM token (JWT protected)
export const saveandupdateFcmToken = asynchandler(async (req, res, next) => {
  try {
    const mobile = req.mobile;
    const { deviceId, platform, fcmToken } = req.body;

    if (!deviceId || !platform || !fcmToken) {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "deviceId, platform and fcmToken are required"));
    }

    if (!["android", "ios"].includes(platform)) {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "Invalid platform"));
    }

    await FcmToken.findOneAndUpdate(
      { mobile, deviceId },               // composite key
      {
        mobile,
        deviceId,
        platform,
        fcmToken,
        isActive: true,
        lastSeenAt: new Date()
      },
      { upsert: true, new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "FCM token saved successfully"));

  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, error.message || "Internal server error"));
  }
});


export const deactivateFcmToken = asynchandler(async (req, res, next) => {
  try {
    const mobile = req.mobile;
    const { deviceId } = req.body;

    if (!deviceId) {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "Device ID is required"));
    }

    const result = await FcmToken.updateOne(
      { mobile, deviceId },
      { isActive: false }
    );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "Device not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "FCM token deactivated"));

  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, error.message || "Internal server error"));
  }
});


const BATCH_SIZE = 400;

const batchTokens = (tokens, size = BATCH_SIZE) => {
if (!Array.isArray(tokens) || tokens.length === 0) return [];
  const batches = [];
  for (let i = 0; i < tokens.length; i += size) {
    batches.push(tokens.slice(i, i + size));
  }
  return batches;
};

// Send batch of notifications with retry logic
const sendNotificationBatch = async (batch, message) => {
  return withRetry(async () => {
    return await admin.messaging().sendEachForMulticast({
      ...message,
      tokens: batch
    });
  });
};

// Send filtered notifications (Admin only)
export const sendFilteredNotification = asynchandler(async (req, res, next) => {
  try {
   const parsed = sendFilteredNotificationSchema.safeParse(req.body);
if (!parsed.success) {
  logger.warn("sendFilteredNotification validation failed", { errors: parsed.error.errors });
  return res.status(400).json(new ApiResponse(400, {}, parsed.error.errors.map(e => e.message).join(", ")));
}

    const {
      title,
      body,
      platform,
      state,
      city,
      occupation,
      interests,
     
    } = parsed.data;

   

    // Build MongoDB filter
    const filter = { isActive: true };
    if (platform) filter.platform = platform;
    if (state) filter.state = state;
    if (city) filter.city = city;
    if (occupation) filter.occupation = occupation;
    if (Array.isArray(interests) && interests.length > 0) {
      filter.interests = { $in: interests };
    }

    logger.info(`Fetching devices for notification with filter: ${JSON.stringify(filter)}`);

    // Fetch matching devices (lean for performance)
    const devices = await FcmToken.find(filter)
      .select("fcmToken")
      .lean();

    if (!devices.length) {
      logger.info(`No matching devices found for notification filter`);
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "No matching devices found"));
    }

    const tokens = devices.map(d => d.fcmToken);
    const batches = batchTokens(tokens);

    logger.info(`Sending notification to ${tokens.length} devices in ${batches.length} batches`);

    // Prepare notification message
    const message = {
      notification: { 
        title, 
        body
      }
    };

    

    let totalSuccess = 0;
    let totalFailure = 0;
    const invalidTokens = [];

    // Process batches sequentially (to avoid overwhelming t3.micro)
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      try {
        logger.info(`Processing batch ${i + 1}/${batches.length} with ${batch.length} tokens`);
        
        const response = await sendNotificationBatch(batch, message);

        totalSuccess += response.successCount;
        totalFailure += response.failureCount;

        // Collect invalid/unregistered tokens
        response.responses.forEach((r, idx) => {
          if (!r.success) {
           
            if (
              code === "messaging/registration-token-not-registered" ||
              code === "messaging/invalid-registration-token" ||
              code === "messaging/invalid-argument"
            ) {
              invalidTokens.push(batch[idx]);
            }
          }
        });

        // Small delay between batches to prevent rate limiting (t3.micro friendly)
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (batchError) {
        logger.error(`Batch ${i + 1} send error:`, batchError);
        totalFailure += batch.length;
      }
    }

    // Cleanup invalid tokens asynchronously ()
    if (invalidTokens.length > 0) {
      logger.info(`Cleaning up ${invalidTokens.length} invalid FCM tokens`);
      
      FcmToken.updateMany(
        { fcmToken: { $in: invalidTokens } },
        { isActive: false }
      ).catch(err => {
        logger.error("Token cleanup error:", err);
      });
    }

    logger.info(`Notification sent - Success: ${totalSuccess}, Failed: ${totalFailure}, Invalid: ${invalidTokens.length}`);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalDevices: tokens.length,
          batches: batches.length,
          success: totalSuccess,
          failed: totalFailure,
          invalidTokensRemoved: invalidTokens.length
        },
        "Notification sent successfully"
      )
    );

  } catch (error) {
    logger.error("Notification send error:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Failed to send notification"));
  }
});



