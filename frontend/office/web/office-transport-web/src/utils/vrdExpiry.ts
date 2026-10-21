export interface VrdExpiryStatus {
  hasDate: boolean;
  rawDate?: string | null;
  formattedDate: string;
  daysLeft: number | null;
  isExpired: boolean;
  isExpiringSoon: boolean; // True if expiring soon in <= 10 days or expired -> Red
  isNotSettled: boolean;   // True if null/empty/not settled -> Yellow Warning
  statusText: string;
  badgeText: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
}

/**
 * Calculates VRD Expiry status and days left countdown.
 * - If null / empty / not settled: triggers Yellow Warning (isNotSettled = true)
 * - If expiring in <= 10 days (or expired): triggers Red Warning (isExpiringSoon = true)
 * - If valid (> 10 days): triggers Emerald Active status
 */
export function getVrdExpiryStatus(expiryDateStr?: string | null): VrdExpiryStatus {
  // If not settled / null / empty / ignored -> Yellow Warning
  if (!expiryDateStr || expiryDateStr === 'null') {
    return {
      hasDate: false,
      rawDate: null,
      formattedDate: 'Not Settled (Ignored)',
      daysLeft: null,
      isExpired: false,
      isExpiringSoon: false,
      isNotSettled: true,
      statusText: 'Not Settled',
      badgeText: 'Not Settled',
      colorClass: 'text-amber-800',
      bgClass: 'bg-amber-50/90',
      borderClass: 'border-amber-300',
      badgeClass: 'text-amber-900 bg-amber-100 border-amber-300'
    };
  }

  // Parse YYYY-MM-DD
  const parts = expiryDateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return {
      hasDate: false,
      rawDate: null,
      formattedDate: 'Not Settled',
      daysLeft: null,
      isExpired: false,
      isExpiringSoon: false,
      isNotSettled: true,
      statusText: 'Not Settled',
      badgeText: 'Not Settled',
      colorClass: 'text-amber-800',
      bgClass: 'bg-amber-50/90',
      borderClass: 'border-amber-300',
      badgeClass: 'text-amber-900 bg-amber-100 border-amber-300'
    };
  }

  const targetDate = new Date(year, (month || 1) - 1, day || 1);
  targetDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = targetDate.getTime() - today.getTime();
  const daysLeft = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const isExpired = daysLeft < 0;
  // If expiring soon in 10 days or already expired -> red
  const isExpiringSoon = daysLeft <= 10;

  const formattedDate = targetDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  let statusText = '';
  let badgeText = '';

  if (isExpired) {
    const overdueDays = Math.abs(daysLeft);
    statusText = `Expired ${overdueDays} day${overdueDays === 1 ? '' : 's'} ago`;
    badgeText = `Expired (${overdueDays}d ago)`;
  } else if (daysLeft === 0) {
    statusText = 'Expires Today';
    badgeText = 'Expires Today';
  } else if (daysLeft === 1) {
    statusText = '1 day left';
    badgeText = '1 day left';
  } else {
    statusText = `${daysLeft} days left`;
    badgeText = `${daysLeft} days left`;
  }

  if (isExpiringSoon) {
    return {
      hasDate: true,
      rawDate: expiryDateStr,
      formattedDate,
      daysLeft,
      isExpired,
      isExpiringSoon: true,
      isNotSettled: false,
      statusText,
      badgeText,
      colorClass: 'text-red-700',
      bgClass: 'bg-red-50/95',
      borderClass: 'border-red-300',
      badgeClass: 'text-red-800 bg-red-100 border-red-300'
    };
  }

  return {
    hasDate: true,
    rawDate: expiryDateStr,
    formattedDate,
    daysLeft,
    isExpired: false,
    isExpiringSoon: false,
    isNotSettled: false,
    statusText,
    badgeText,
    colorClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50/80',
    borderClass: 'border-emerald-200',
    badgeClass: 'text-emerald-800 bg-emerald-100 border-emerald-300'
  };
}
