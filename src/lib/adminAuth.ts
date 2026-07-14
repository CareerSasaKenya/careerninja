import { createClient, SupabaseClient, User } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

export function getAdminServiceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export type AdminAuthResult =
  | { ok: true; user: User; adminClient: SupabaseClient }
  | { ok: false; status: number; message: string }

export async function requireAdmin(request: NextRequest): Promise<AdminAuthResult> {
  const accessToken = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!accessToken) {
    return { ok: false, status: 401, message: 'Unauthorized' }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })

  const { data: { user } } = await userClient.auth.getUser()
  if (!user) {
    return { ok: false, status: 401, message: 'Unauthorized' }
  }

  const adminClient = getAdminServiceClient()
  const { data: profile } = await adminClient
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { ok: false, status: 403, message: 'Forbidden: Admin access required' }
  }

  return { ok: true, user, adminClient }
}
