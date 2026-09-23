import { loadSubscribers, normalizeRange } from '@/lib/analytics-queries';
import { RangePicker } from '../RangePicker';
import SubscriberTable from './SubscriberTable';

export const dynamic = 'force-dynamic';

/**
 * Subscribers: newsletter list filtered by subscription date over the
 * selected range. The 500-row server cap applies inside the window; a count
 * note appears when rows were truncated.
 */
export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { range, days } = normalizeRange(params);
  const rows = await loadSubscribers(range);
  return (
    <div className="space-y-6">
      <RangePicker activeDays={days} />
      <SubscriberTable rows={rows} />
      {rows.length >= 500 && (
        <p className="text-xs text-text-body">
          Showing the newest 500 subscribers in this range — export for the full list.
        </p>
      )}
    </div>
  );
}
