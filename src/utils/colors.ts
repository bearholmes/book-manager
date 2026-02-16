import { TOPIC_COLORS } from './constants';

/**
 * 주제별 색상을 자동으로 할당하는 클래스
 */
export class ColorQueue {
  private colors: string[];
  private colorIndex: number;

  constructor() {
    this.colors = Object.values(TOPIC_COLORS);
    this.colorIndex = 0;
  }

  /**
   * 다음 색상을 가져옴 (순환)
   */
  dequeue(): string {
    const color = this.colors[this.colorIndex];
    this.colorIndex = (this.colorIndex + 1) % this.colors.length;
    return color!; // colorIndex는 항상 유효한 범위 내에 있음
  }

  /**
   * 색상을 큐에 추가
   */
  enqueue(color: string): void {
    this.colors.push(color);
  }
}

/**
 * 주제 목록에 색상을 자동 할당
 */
export function assignTopicColors(topics: string[]): Record<string, string> {
  const colorQueue = new ColorQueue();
  const topicColors: Record<string, string> = {};

  topics.forEach((topic) => {
    if (topic && !topicColors[topic]) {
      topicColors[topic] = colorQueue.dequeue();
    }
  });

  return topicColors;
}
