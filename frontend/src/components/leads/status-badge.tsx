import { Badge } from '@/components/ui/badge';
import type { LeadStatus } from '@/constants/leadStatus';

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge
      variant={
        status === 'Converted'
          ? 'success'
          : status === 'Lost'
          ? 'error'
          : status === 'Qualified'
          ? 'success'
          : status === 'Contacted'
          ? 'warning'
          : 'info'
      }
    >
      {status}
    </Badge>
  );
}
