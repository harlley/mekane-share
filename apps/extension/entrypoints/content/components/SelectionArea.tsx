import React from 'react';
import { SelectionArea as SelectionAreaType } from '../../shared/types';

interface SelectionAreaProps {
  area: SelectionAreaType | null;
  isSelecting: boolean;
  onSelectionComplete?: (area: SelectionAreaType) => void;
}

export const SelectionArea: React.FC<SelectionAreaProps> = ({
  area,
  isSelecting: _isSelecting,
  onSelectionComplete,
}) => {
  if (!area) return null;

  const handleClick = () => {
    onSelectionComplete?.(area);
  };

  return (
    <div
      className="selection-area"
      style={{
        position: 'fixed',
        left: area.x,
        top: area.y,
        width: area.width,
        height: area.height,
        cursor: 'pointer',
      }}
      onClick={handleClick}
    />
  );
};
