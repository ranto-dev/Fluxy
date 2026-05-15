export type BlobParams = {
  growth: number;
  edges: number;
  seed: number;
  smoothness: number;
  rotate: number;
  opacity: number;
  blur: number;
};

export type BlobColors = {
  primary: string;
  secondary: string;
};

export type Point = {
  x: number;
  y: number;
};

export type SliderProps = {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
};
