import { SelectionArea } from '../types';
import { CaptureStatus } from './screenshot.types';

export interface SelectionOverlayProps {
  onSelectionComplete: (area: SelectionArea) => void;
  onCancel: () => void;
}

export interface SelectionAreaProps {
  area: SelectionArea | null;
  isSelecting: boolean;
}

export interface ControlButtonsProps {
  onCapture: () => void;
  onCancel: () => void;
  showCaptureButton: boolean;
}

export interface InstructionsProps {
  status: CaptureStatus;
}
