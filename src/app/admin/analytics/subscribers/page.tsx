import { loadSubscribers } from '@/lib/analytics-queries';
import SubscriberTable from './SubscriberTable';

export const dynamic = 'force-dynamic';

/** Server page feeding the client SubscriberTable (gated by the layout). */
export default async function SubscribersPage() {
  const rows = await loadSubscribers();
  return <SubscriberTable rows={rows} />;
}
