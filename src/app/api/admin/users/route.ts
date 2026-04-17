import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, full_name, role, organization_id, phone } = body;
        const assigned_branch_id = body.assigned_branch_id === '' ? null : body.assigned_branch_id;

        const supabase = await createClient();

        console.log('Using RPC for user creation to bypass API key issues...');

        const { data, error: rpcError } = await supabase.rpc('admin_register_user_v2', {
            p_email: email,
            p_password: password,
            p_full_name: full_name,
            p_role: role,
            p_org_id: organization_id,
            p_branch_id: assigned_branch_id,
            p_phone: phone,
            p_login_pin: body.login_pin
        });

        if (rpcError) {
            console.error('RPC Register Error:', rpcError);
            throw rpcError;
        }

        if (data && !data.success) {
            throw new Error(data.error || 'Error desconocido en la base de datos');
        }

        return NextResponse.json({ 
            success: true, 
            user: { id: data.user_id, email } 
        });
    } catch (error: any) {
        console.error('API User Create Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, email, full_name, role, phone } = body;
        const assigned_branch_id = body.assigned_branch_id === '' ? null : body.assigned_branch_id;

        if (!id) throw new Error('ID de usuario requerido');

        const supabase = await createClient();

        console.log('Using RPC for user update to bypass API key issues...');

        const { data, error: rpcError } = await supabase.rpc('admin_update_user_v2', {
            p_user_id: id,
            p_email: email,
            p_full_name: full_name,
            p_role: role,
            p_branch_id: assigned_branch_id,
            p_phone: phone,
            p_login_pin: body.login_pin
        });

        if (rpcError) {
            console.error('RPC Update Error:', rpcError);
            throw rpcError;
        }

        if (data && !data.success) {
            throw new Error(data.error || 'Error desconocido en la actualización');
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('API User Update Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
