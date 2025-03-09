import { SelectionArea } from "../types";

export interface CaptureOptions {
  format: "png" | "jpeg";
  quality?: number;
}

export interface ScreenshotError extends Error {
  code: string;
  details?: unknown;
}

export interface CaptureResult {
  dataUrl: string;
  area: SelectionArea;
  timestamp: number;
}

export type CaptureStatus = "idle" | "selecting" | "capturing" | "error";
