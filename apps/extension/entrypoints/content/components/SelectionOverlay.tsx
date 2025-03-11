import React, { useCallback, useRef, useState } from 'react';
import { SelectionArea as SelectionAreaType } from '../../shared/types';
import { SelectionOverlayProps } from '../../shared/types/components.types';
import { SelectionArea } from './SelectionArea';
import { ControlButtons } from './ControlButtons';
import { Instructions } from './Instructions';
import { CaptureStatus } from '../../shared/types/screenshot.types';

/**
 * Component that renders a dark overlay and allows users to select an area
 */
export const SelectionOverlay: React.FC<SelectionOverlayProps> = ({
  onSelectionComplete,
  onCancel,
}) => {
  const [currentSelection, setCurrentSelection] =
    useState<SelectionAreaType | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [status, setStatus] = useState<CaptureStatus>('idle');
  const overlayRef = useRef<HTMLDivElement>(null);
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only handle left click

    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    selectionStartRef.current = { x, y };
    setIsSelecting(true);
    setStatus('selecting');
    setCurrentSelection({
      x,
      y,
      width: 0,
      height: 0,
    });
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isSelecting || !selectionStartRef.current || !overlayRef.current)
        return;

      const rect = overlayRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      const startX = selectionStartRef.current.x;
      const startY = selectionStartRef.current.y;

      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);

      setCurrentSelection({
        x: left,
        y: top,
        width,
        height,
      });
    },
    [isSelecting]
  );

  const handleMouseUp = useCallback(() => {
    if (isSelecting) {
      setIsSelecting(false);
      setStatus('idle');
    }
  }, [isSelecting]);

  const handleConfirm = useCallback(() => {
    if (currentSelection) {
      setStatus('capturing');
      // Hide the overlay background before capture
      const overlayContainer = document.getElementById(
        'mekane-selection-overlay-container'
      );
      if (overlayContainer?.shadowRoot) {
        const background = overlayContainer.shadowRoot.querySelector(
          '.overlay-background'
        );
        if (background instanceof HTMLElement) {
          background.style.display = 'none';
        }
      }
      // Wait for the next frame to ensure the background is hidden
      requestAnimationFrame(() => {
        onSelectionComplete(currentSelection);
      });
    }
  }, [currentSelection, onSelectionComplete]);

  const handleCancel = useCallback(() => {
    setCurrentSelection(null);
    setIsSelecting(false);
    setStatus('idle');
    onCancel();
  }, [onCancel]);

  return (
    <div
      className="selection-overlay"
      ref={overlayRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="overlay-background" />
      <SelectionArea area={currentSelection} isSelecting={isSelecting} />
      <Instructions status={status} />
      <ControlButtons
        onCapture={handleConfirm}
        onCancel={handleCancel}
        showCaptureButton={!!currentSelection && !isSelecting}
      />
    </div>
  );
};
