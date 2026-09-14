import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TABLE = 'app_data';

export async function cloudLoad<T>(key: string): Promise<T | null> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('data')
      .eq('key', key)
      .maybeSingle();
    if (error) {
      console.warn(`cloudLoad(${key}) error:`, error.message);
      return null;
    }
    return (data?.data as T) ?? null;
  } catch (err) {
    console.warn(`cloudLoad(${key}) exception:`, err);
    return null;
  }
}

export async function cloudSave<T>(key: string, value: T): Promise<void> {
  try {
    const { error } = await supabase
      .from(TABLE)
      .upsert({ key, data: value, updated_at: new Date().toISOString() });
    if (error) {
      console.warn(`cloudSave(${key}) error:`, error.message);
    }
  } catch (err) {
    console.warn(`cloudSave(${key}) exception:`, err);
  }
}

export async function cloudDelete(key: string): Promise<void> {
  try {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('key', key);
    if (error) {
      console.warn(`cloudDelete(${key}) error:`, error.message);
    }
  } catch (err) {
    console.warn(`cloudDelete(${key}) exception:`, err);
  }
}
