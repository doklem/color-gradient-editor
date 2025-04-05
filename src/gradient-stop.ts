import { GradientStopOptions } from './gradient-stop-options';

export class GradientStop implements GradientStopOptions {

  public readonly id: number;
  public readonly color: {
    r: number,
    g: number,
    b: number
  };

  public percentage: number;

  public constructor(options: GradientStopOptions) {
    this.id = options.id;
    this.color = options.color;
    this.percentage = options.percentage;
  }

  public equals(other?: GradientStop): boolean {
    return this.id === other?.id;
  }

  public writeColor(buffer: number[]): void {
    buffer.push(this.color.r);
    buffer.push(this.color.g);
    buffer.push(this.color.b);
  }

  public static compare(a: GradientStop, b: GradientStop): number {
    if (a.percentage < b.percentage) {
      return -1;
    }
    if (a.percentage > b.percentage) {
      return 1;
    }
    if (a.id < b.id) {
      return -1;
    }
    return a.id === b.id ? 0 : 1;
  }
}