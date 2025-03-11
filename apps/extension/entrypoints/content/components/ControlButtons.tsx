import React from 'react';
import { ControlButtonsProps } from '../../shared/types/components.types';

export const ControlButtons: React.FC<ControlButtonsProps> = ({
  onCapture,
  onCancel,
  showCaptureButton,
}) => {
  return (
    <div className="selection-controls">
      {showCaptureButton && (
        <button
          type="button"
          className="capture-button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onCapture();
          }}
        >
          Capture
        </button>
      )}
      <button
        type="button"
        className="cancel-button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onCancel();
        }}
      >
        Cancel
      </button>
    </div>
  );
};
