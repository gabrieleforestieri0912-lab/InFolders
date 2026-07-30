import { getSupabase } from './supabase';
import type { FolderNode, Bookmark, PremiumSubscription } from './types';

export async function syncUserData(userId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('user_data')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  if (data) {
    return {
      folders: (data.folders || []) as FolderNode[],
      bookmarks: (data.bookmarks || []) as Bookmark[],
      folderIdCounter: (data.folder_id_counter || 0) as number,
      premiumData: data.premium_data as PremiumSubscription | null,
    };
  }
  return null;
}

export async function saveUserData(
  userId: string,
  data: {
    folders: FolderNode[];
    bookmarks: Bookmark[];
    folderIdCounter: number;
    premiumData?: PremiumSubscription | null;
  }
) {
  const supabase = getSupabase();
  const payload = {
    user_id: userId,
    folders: data.folders,
    bookmarks: data.bookmarks,
    folder_id_counter: data.folderIdCounter,
    premium_data: data.premiumData || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('user_data').upsert(payload, {
    onConflict: 'user_id',
  });

  if (error) throw error;
}
