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

/**
 * Require a logged-in user with the canonical admin role in `user_roles`.
 * Do NOT trust `user_profiles.role` — that column can drift / be self-updated.
 */
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
  const isAdmin = await userHasAdminRole(adminClient, user.id)
  if (!isAdmin) {
    return { ok: false, status: 403, message: 'Forbidden: Admin access required' }
  }

  return { ok: true, user, adminClient }
}

/** Canonical admin check via `user_roles` (has_role / get_is_admin). */
export async function userHasAdminRole(
  client: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data: viaHasRole, error: hasRoleError } = await client.rpc('has_role', {
    _user_id: userId,
    _role: 'admin',
  })
  if (!hasRoleError && typeof viaHasRole === 'boolean') {
    return viaHasRole
  }

  const { data: viaGetIsAdmin, error: getIsAdminError } = await client.rpc(
    'get_is_admin',
    { p_user_id: userId }
  )
  if (!getIsAdminError && typeof viaGetIsAdmin === 'boolean') {
    return viaGetIsAdmin
  }

  // Last-resort direct table read (service role bypasses RLS)
  const { data: roleRow } = await client
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle()

  return !!roleRow
}
