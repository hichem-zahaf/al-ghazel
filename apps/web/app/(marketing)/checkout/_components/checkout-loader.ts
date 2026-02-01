/**
 * Checkout Loader
 * Server-side utilities for loading checkout data
 */

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import type { SavedCheckoutData } from '~/types/bookstore';

export const checkoutLoader = {
  /**
   * Get saved checkout data for authenticated users
   */
  async getSavedCheckoutData(): Promise<SavedCheckoutData | null> {
    const supabase = getSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    try {
      const { data: account, error } = await supabase
        .from('accounts')
        .select('checkout_data')
        .eq('id', user.id)
        .single();

      // If column doesn't exist yet (migration not applied), return null
      if (error) {
        return null;
      }

      if (!account?.checkout_data) {
        return null;
      }

      return account.checkout_data as SavedCheckoutData;
    } catch {
      return null;
    }
  },
};
