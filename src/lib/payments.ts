import { prisma } from './prisma';
import { enrollStudent } from './enrollment';

interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  metadata: Record<string, string>;
}

interface StripeEvent {
  type: string;
  data: { object: StripePaymentIntent };
}

/**
 * Verify Stripe webhook signature and parse the event.
 * Uses the Web Crypto API so it works in the Next.js Edge runtime.
 */
async function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string,
): Promise<StripeEvent> {
  const parts = Object.fromEntries(signature.split(',').map((p) => p.split('=')));
  const timestamp = parts['t'];
  const receivedSig = parts['v1'];

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${body}`));
  const expected = Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  if (expected !== receivedSig) throw new Error('Invalid Stripe signature');

  return JSON.parse(body) as StripeEvent;
}

/**
 * Handle inbound Stripe webhooks.
 * On payment_intent.succeeded → enroll the student (with Late-Joiner Rule)
 * and record the payment.
 */
export async function handleStripeWebhook(body: string, signature: string): Promise<void> {
  const event = await verifyStripeSignature(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);

  if (event.type !== 'payment_intent.succeeded') return;

  const intent = event.data.object;
  const { studentId, courseId, paymentType } = intent.metadata;

  if (!studentId || !courseId || !paymentType) {
    throw new Error('Missing metadata fields on PaymentIntent');
  }

  const enrollment = await enrollStudent(studentId, courseId, paymentType as 'SINGLE' | 'SUBSCRIPTION');

  await prisma.payment.create({
    data: {
      enrollmentId: enrollment.id,
      userId: studentId,
      amount: intent.amount / 100,
      currency: intent.currency,
      paymentType: paymentType as 'SINGLE' | 'SUBSCRIPTION',
      stripePaymentIntentId: intent.id,
      status: 'succeeded',
      paidAt: new Date(),
    },
  });
}
