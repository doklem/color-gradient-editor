export interface GradientStopOptions {

  readonly id: number;
  readonly color: {
    r: number;
    g: number;
    b: number;
  };

  percentage: number;
}