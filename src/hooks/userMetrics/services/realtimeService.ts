
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const createUserMetricsSubscription = (
  user: User | null,
  onRefresh: () => void
) => {
  if (!user) return null;

  const channel = supabase
    .channel('analytics-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'activity_logs',
        filter: `user_id=eq.${user.id}`
      },
      () => {
        console.log('UserMetrics: Activity log changed, refreshing metrics');
        onRefresh();
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'production_report_entries'
      },
      () => {
        console.log('UserMetrics: Production report changed, refreshing metrics');
        onRefresh();
      }
    )
    .subscribe();

  return channel;
};

export const removeSubscription = (channel: any) => {
  supabase.removeChannel(channel);
};
