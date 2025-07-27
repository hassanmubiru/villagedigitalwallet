/**
 * Mobile Money Callback API Route
 * Handles webhook callbacks from mobile money providers
 */

import { NextRequest, NextResponse } from 'next/server';
import { mobileMoneyService } from '../../../lib/mobileMoneyService';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    // Verify the webhook signature (in production)
    const signature = request.headers.get('x-signature');
    if (!verifyWebhookSignature(payload, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Process the callback
    await mobileMoneyService.handleProviderCallback(payload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mobile money callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

function verifyWebhookSignature(payload: any, signature: string | null): boolean {
  // In production, implement proper signature verification
  // For now, just check if signature exists
  return signature !== null;
}
