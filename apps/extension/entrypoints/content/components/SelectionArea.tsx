import React from "react";
import { SelectionAreaProps } from "../../shared/types/components.types";

export const SelectionArea: React.FC<SelectionAreaProps> = ({
  area,
  isSelecting,
}) => {
  if (!area) return null;

  return (
    <div
      className="selection-area"
      style={{
        position: "fixed",
        left: `${area.x}px`,
        top: `${area.y}px`,
        width: `${area.width}px`,
        height: `${area.height}px`,
      }}
    />
  );
};
