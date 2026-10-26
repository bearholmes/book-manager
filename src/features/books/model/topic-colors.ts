import { categoryColors } from '@/shared/theme/data-colors';

/** A finite palette may repeat; a topic's color never depends on the visible page or order. */
function topicColor(topic: string): string {
  let hash = 2166136261;
  const normalized = topic.normalize('NFC');
  for (let index = 0; index < normalized.length; index += 1) {
    hash = Math.imul(hash ^ normalized.charCodeAt(index), 16777619);
  }
  return categoryColors[(hash >>> 0) % categoryColors.length] ?? 'rgb(var(--color-category-1))';
}

export function assignTopicColors(topics: string[]): Record<string, string> {
  return Object.fromEntries(topics.filter(Boolean).map((topic) => [topic, topicColor(topic)]));
}
