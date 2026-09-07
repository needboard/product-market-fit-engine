/**
 * Turns a raw fetch/API error into user-facing copy. Was previously
 * re-implemented identically inside every handler on the cluster detail
 * page (vote, me-too, solution submit, review submit) — one shared version
 * now that those handlers live in separate components.
 */
export function sanitizeError(error: unknown, defaultMessage: string): string {
  const { message: msg = '', name = '' } =
    error instanceof Error ? error : { message: '', name: '' };

  if (msg.toLowerCase().includes('try again in')) {
    return msg;
  }
  if (msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('rate limit')) {
    return 'You are making requests too quickly. Please wait a moment before trying again to keep usage fair!';
  }

  const isTimeout = name === 'AbortError' || msg.includes('aborted') || msg.includes('abort') || msg.includes('timeout') || msg.includes('timed out');
  if (isTimeout) {
    return 'The request took too long to respond. Please check your network connection and try again.';
  }

  const isCodeError =
    msg.includes('fetch failed') ||
    msg.includes('Topology') ||
    msg.includes('ReplicaSet') ||
    msg.includes('SSL') ||
    msg.includes('connect') ||
    msg.includes('NetworkError') ||
    msg.includes('status 5') ||
    msg.includes('Server Error');

  if (isCodeError) {
    return `${defaultMessage} Please check your connection and manually try again.`;
  }
  return msg || defaultMessage;
}
