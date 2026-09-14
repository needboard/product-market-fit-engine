import { NextRequest, NextResponse } from 'next/server';
import { saveEmailLead } from '@/lib/mongodb';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Public, unauthenticated endpoint for content-gate email capture (e.g. the
 * Explore page's "unlock more problems" prompt). No Clerk auth — the whole
 * point is to capture emails from anonymous visitors.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json();

    if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email', message: 'Please enter a valid email address.' }, { status: 400 });
    }

    await saveEmailLead(email.trim().toLowerCase(), typeof source === 'string' ? source : 'unknown');
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error in POST /api/leads:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: 'Could not save your email. Please try again.' }, { status: 500 });
  }
}
