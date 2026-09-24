import { getServerAdminAccess } from './serverAuth';
import { serverSupabase } from './serverSupabase';

type ActivityEntry = {
  action: string;
  entity: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
  payload?: Record<string, unknown>;
};

export async function logAdminActivity(request: Request, entry: ActivityEntry): Promise<string | null> {
  if (!serverSupabase) return 'Supabase не подключен.';

  const actor = await getServerAdminAccess(request);
  if (!actor) return 'Не удалось определить автора действия.';

  const { error } = await serverSupabase
    .from('admin_activity_log')
    .insert({
      actor_id: actor.user.id,
      actor_email: actor.user.email || null,
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entityId || null,
      payload: {
        actor: { id: actor.user.id, email: actor.user.email || null, role: actor.role },
        before: entry.before ?? null,
        after: entry.after ?? null,
        ...(entry.payload || {})
      }
    });

  if (!error) return null;
  console.error(`Admin activity log error (${entry.action}):`, error.message);
  return error.message;
}
