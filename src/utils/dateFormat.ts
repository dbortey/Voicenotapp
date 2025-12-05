// Date formatting utilities

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Past dates
  if (diffMs < 0) {
    const pastDiffMins = Math.abs(diffMins);
    const pastDiffHours = Math.abs(diffHours);
    const pastDiffDays = Math.abs(diffDays);

    if (pastDiffMins < 1) {
      return 'just now';
    } else if (pastDiffMins < 60) {
      return `${pastDiffMins} ${pastDiffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (pastDiffHours < 24) {
      return `${pastDiffHours} ${pastDiffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (pastDiffDays === 1) {
      return `yesterday at ${formatTime(date)}`;
    } else if (pastDiffDays < 7) {
      return `${pastDiffDays} days ago at ${formatTime(date)}`;
    } else {
      return formatFullDate(date);
    }
  }

  // Future dates (for reminders)
  if (diffMins < 60) {
    return `in ${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'}`;
  } else if (diffHours < 24) {
    return `in ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'}`;
  } else if (diffDays === 0) {
    return `today at ${formatTime(date)}`;
  } else if (diffDays === 1) {
    return `tomorrow at ${formatTime(date)}`;
  } else if (diffDays < 7) {
    return `in ${diffDays} days at ${formatTime(date)}`;
  } else {
    return formatFullDate(date);
  }
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
