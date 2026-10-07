import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { token, token_hash, email } = await request.json();

    if (!token_hash && !token) {
      return NextResponse.json({ error: 'Verification token is required.' }, { status: 400 });
    }

    if (token_hash) {
      const { error } = await supabase.auth.verifyOtp({
        type: 'signup',
        token_hash,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: 'Email verified successfully.' });
    }

    if (email && token) {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: 'Email verified successfully.' });
    }

    return NextResponse.json({ error: 'Invalid verification data.' }, { status: 400 });
  } catch (error) {
    console.error('Email verification API error:', error);
    return NextResponse.json({ error: 'Email verification failed.' }, { status: 500 });
  }
}
