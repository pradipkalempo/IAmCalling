import { supabase } from '../config/supabase.js';

export class UserArticlesService {
  static async getUserArticles(authorId) {
    try {
      const { data, error } = await supabase.functions.invoke('get-user-articles', {
        body: { authorId }
      });

      if (error) throw error;
      return data.articles;
    } catch (error) {
      console.error('Error fetching user articles:', error);
      throw error;
    }
  }
}