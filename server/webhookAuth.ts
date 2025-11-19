import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const MAX_TIMESTAMP_DIFF = 5 * 60 * 1000;

export function validateWebhookSignature(req: Request, res: Response, next: NextFunction) {
  try {
    const signature = req.headers['x-signature'] as string;
    const timestamp = req.headers['x-request-timestamp'] as string;

    if (!signature || !timestamp) {
      return res.status(401).json({
        status: 'failed',
        message: 'Missing authentication headers',
        errors: [
          {
            field: 'headers',
            error: 'X-Signature and X-Request-Timestamp are required'
          }
        ]
      });
    }

    if (!WEBHOOK_SECRET) {
      console.error('WEBHOOK_SECRET not configured');
      return res.status(500).json({
        status: 'failed',
        message: 'Webhook authentication not configured',
        errors: [
          {
            field: 'system',
            error: 'Server configuration error'
          }
        ]
      });
    }

    const timestampNum = parseInt(timestamp, 10);
    const currentTime = Date.now();
    const timeDiff = Math.abs(currentTime - timestampNum);

    if (timeDiff > MAX_TIMESTAMP_DIFF) {
      return res.status(401).json({
        status: 'failed',
        message: 'Request timestamp expired',
        errors: [
          {
            field: 'headers',
            error: 'X-Request-Timestamp must be within 5 minutes of current time'
          }
        ]
      });
    }

    const signatureString = timestamp + JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(signatureString)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(401).json({
        status: 'failed',
        message: 'Invalid signature',
        errors: [
          {
            field: 'headers',
            error: 'X-Signature does not match expected value'
          }
        ]
      });
    }

    next();
  } catch (error) {
    console.error('Webhook signature validation error:', error);
    return res.status(500).json({
      status: 'failed',
      message: 'Authentication error',
      errors: [
        {
          field: 'system',
          error: 'Failed to validate request signature'
        }
      ]
    });
  }
}
