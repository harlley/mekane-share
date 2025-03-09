import React, { useState, useEffect, useRef, useCallback } from "react";
import { SelectionArea } from "../../shared/types";
import "./SelectionOverlay.css";

interface SelectionOverlayProps {
  onSelectionComplete: (area: SelectionArea) => void;
  onCancel: () => void;
}

/**
 * Component that renders a dark overlay and allows users to select an area
 */
export const SelectionOverlay: React.FC<SelectionOverlayProps> = ({
  onSelectionComplete,
  onCancel,
}) => {
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [selectionStart, setSelectionStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [currentSelection, setCurrentSelection] =
    useState<SelectionArea | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle mouse down to start selection
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    console.log("[Mekane-Overlay] Mouse down - START");

    // Use viewport coordinates
    setSelectionStart({ x: e.clientX, y: e.clientY });
    setIsSelecting(true);
    setCurrentSelection(null);

    console.log("[Mekane-Overlay] Started new selection at:", {
      x: e.clientX,
      y: e.clientY,
    });
    console.log("[Mekane-Overlay] Mouse down - END");
  }, []);

  // Handle mouse move to update selection
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isSelecting || !selectionStart) return;

      // Calculate selection using viewport coordinates
      const x = Math.min(selectionStart.x, e.clientX);
      const y = Math.min(selectionStart.y, e.clientY);
      const width = Math.abs(e.clientX - selectionStart.x);
      const height = Math.abs(e.clientY - selectionStart.y);

      setCurrentSelection({ x, y, width, height });
    },
    [isSelecting, selectionStart]
  );

  // Handle mouse up to complete selection
  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      console.log("[Mekane-Overlay] Mouse up - START", {
        isSelecting,
        hasCurrentSelection: !!currentSelection,
      });

      if (isSelecting && selectionStart) {
        // Calculate final selection using viewport coordinates
        const x = Math.min(selectionStart.x, e.clientX);
        const y = Math.min(selectionStart.y, e.clientY);
        const width = Math.abs(e.clientX - selectionStart.x);
        const height = Math.abs(e.clientY - selectionStart.y);

        // Only update if we have a valid selection (width and height > 0)
        if (width > 0 && height > 0) {
          console.log("[Mekane-Overlay] Updating final selection:", {
            x,
            y,
            width,
            height,
          });
          setCurrentSelection({ x, y, width, height });
        }

        setIsSelecting(false);
        console.log("[Mekane-Overlay] Set isSelecting to false");
      }

      console.log("[Mekane-Overlay] Mouse up - END");
    },
    [isSelecting, selectionStart]
  );

  // Handle keydown for ESC key to cancel
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    },
    [onCancel]
  );

  // Add and remove event listeners
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Handle confirmation of selection
  const handleConfirm = useCallback(() => {
    console.log("[Mekane-Overlay] handleConfirm - START");
    try {
      console.log(
        "[Mekane-Overlay] Current selection state in handleConfirm:",
        {
          hasSelection: !!currentSelection,
          selection: currentSelection,
          isSelecting,
        }
      );

      if (currentSelection) {
        console.log(
          "[Mekane-Overlay] Selection is valid, calling onSelectionComplete"
        );
        try {
          // Find the container element (the one with shadow root)
          const containerElement = overlayRef.current?.closest(
            "#mekane-selection-overlay-container"
          ) as HTMLElement | null;

          if (containerElement) {
            // Store display style to restore it later
            const originalDisplay = containerElement.style.display;

            // Hide the entire container (this will hide everything including the shadow root)
            containerElement.style.display = "none";

            // Wait a frame to ensure everything is hidden
            requestAnimationFrame(() => {
              try {
                // Call onSelectionComplete with the viewport coordinates
                onSelectionComplete(currentSelection);
                console.log(
                  "[Mekane-Overlay] onSelectionComplete called successfully"
                );
              } finally {
                // Always restore the container visibility
                containerElement.style.display = originalDisplay;
              }
            });
          } else {
            // Fallback if we can't find the container
            onSelectionComplete(currentSelection);
          }
        } catch (error) {
          console.error(
            "[Mekane-Overlay] Error in onSelectionComplete:",
            error
          );
        }
      } else {
        console.log("[Mekane-Overlay] No selection to capture");
      }
    } catch (error) {
      console.error("[Mekane-Overlay] Error in handleConfirm:", error);
    }
    console.log("[Mekane-Overlay] handleConfirm - END");
  }, [currentSelection, onSelectionComplete, isSelecting]);

  // Handle cancel button click
  const handleCancel = useCallback(() => {
    try {
      console.log("[Mekane-Overlay] handleCancel called");
      console.log("[Mekane-Overlay] Current state:", {
        isSelecting,
        currentSelection,
      });

      // Reset all state
      setIsSelecting(false);
      setSelectionStart(null);
      setCurrentSelection(null);

      console.log("[Mekane-Overlay] State reset, calling onCancel");

      // Call onCancel in a try-catch to ensure it executes
      try {
        onCancel();
        console.log("[Mekane-Overlay] onCancel called successfully");
      } catch (error) {
        console.error("[Mekane-Overlay] Error in onCancel:", error);
      }
    } catch (error) {
      console.error("[Mekane-Overlay] Error in handleCancel:", error);
    }
  }, [onCancel]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      console.log("[Mekane-Overlay] Component cleanup");
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Log render conditions
  useEffect(() => {
    console.log("[Mekane-Overlay] Render conditions:", {
      hasCurrentSelection: !!currentSelection,
      isSelecting,
      selectionStart: !!selectionStart,
    });
  }, [currentSelection, isSelecting, selectionStart]);

  return (
    <div
      className="selection-overlay"
      ref={overlayRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {currentSelection && (
        <div
          className="selection-area"
          style={{
            position: "fixed",
            left: `${currentSelection.x}px`,
            top: `${currentSelection.y}px`,
            width: `${currentSelection.width}px`,
            height: `${currentSelection.height}px`,
          }}
        />
      )}

      <div className="selection-controls">
        {currentSelection && !isSelecting && (
          <button
            type="button"
            className="capture-button"
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              console.log("[Mekane-Overlay] Capture button clicked - START");
              e.stopPropagation();
              e.preventDefault();

              // Add a small delay to ensure the event doesn't propagate
              setTimeout(() => {
                console.log("[Mekane-Overlay] Current selection state:", {
                  currentSelection,
                  isSelecting,
                });
                handleConfirm();
                console.log("[Mekane-Overlay] Capture button clicked - END");
              }, 0);
            }}
          >
            Capture
          </button>
        )}
        <button
          type="button"
          className="cancel-button"
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            console.log("[Mekane-Overlay] Cancel button clicked");
            e.stopPropagation();
            e.preventDefault();
            handleCancel();
          }}
        >
          Cancel
        </button>
      </div>

      <div className="instructions">
        {!currentSelection
          ? "Click and drag to select an area"
          : isSelecting
            ? "Release to set selection"
            : "Adjust or confirm your selection"}
      </div>
    </div>
  );
};
