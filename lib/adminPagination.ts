import { serverSupabase } from './serverSupabase';

export async function getAllAdminRows<T = Record<string, unknown>>(table: string, select = '*', orderColumn = 'created_at', ascending = false): Promise<T[]> {
  if (!serverSupabase) return [];
  const rows: T[] = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await serverSupabase
      .from(table)
      .select(select)
      .order(orderColumn, { ascending })
      .range(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    rows.push(...((data || []) as T[]));
    if ((data || []).length < pageSize) return rows;
  }
}
