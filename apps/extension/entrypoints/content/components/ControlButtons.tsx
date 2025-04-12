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
          className="control-button capture-button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onCapture();
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"
              fill="currentColor"
            />
          </svg>
          <span>Capture</span>
        </button>
      )}
      <button
        type="button"
        className="control-button cancel-button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onCancel();
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
            fill="currentColor"
          />
        </svg>
        <span>Cancel</span>
      </button>
    </div>
  );
};
