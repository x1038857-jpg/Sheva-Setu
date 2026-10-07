import { NextRequest, NextResponse } from 'next/server';
import { supabase, getCurrentUser } from '@/lib/supabase';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('applications')
      .select('*, documents(*), profiles:user_id(full_name, email)')
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Application fetch by id failed:', error);
    return NextResponse.json({ error: 'Application not found.' }, { status: 500 });
  }
}
