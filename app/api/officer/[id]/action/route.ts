import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin, getCurrentUser } from '@/lib/supabase';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'GOVERNMENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, reason } = await request.json();
    const appId = params.id;

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

    const { data: currentApplication } = await supabaseAdmin.from('applications').select('status').eq('id', appId).single();

    const { error: updateError } = await supabaseAdmin
      .from('applications')
      .update({
        status: newStatus,
        approved_by: user.id,
        rejected_reason: action === 'reject' ? reason : null,
      })
      .eq('id', appId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    await supabaseAdmin.from('application_history').insert({
      application_id: appId,
      changed_by: user.id,
      old_status: currentApplication?.status || 'PENDING',
      new_status: newStatus,
      reason: reason || 'Approved',
    });

    return NextResponse.json({ message: `Application ${action}d successfully.` });
  } catch (error) {
    console.error('Officer action failed:', error);
    return NextResponse.json({ error: 'Action failed.' }, { status: 500 });
  }
}
