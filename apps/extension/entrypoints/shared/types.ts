export interface SelectionArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CaptureMessage {
  type: 'CAPTURE_SCREENSHOT';
  area: SelectionArea;
}

export interface CapturedScreenshot {
  dataUrl: string;
}
