import { NextRequest, NextResponse } from 'next/server';
import { supabase, getCurrentUser } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { serviceId, data } = await request.json();

    const { data: applicationData, error } = await supabase.from('applications').insert({
      user_id: user.id,
      service_id: Number(serviceId),
      status: 'PENDING',
      data,
    }).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(applicationData);
  } catch (error) {
    console.error('Create application error:', error);
    return NextResponse.json({ error: 'Failed to create application.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isGovernment = await isGovernmentUser(user.id);
    let query = supabase.from('applications').select('*, documents(*), profiles:user_id(full_name, email)');

    if (!isGovernment) {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('List applications error:', error);
    return NextResponse.json({ error: 'Failed to fetch applications.' }, { status: 500 });
  }
}

async function isGovernmentUser(userId: string) {
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
  return data?.role === 'GOVERNMENT';
}
