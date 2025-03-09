import React from "react";
import { InstructionsProps } from "../../shared/types/components.types";

export const Instructions: React.FC<InstructionsProps> = ({ status }) => {
  const getMessage = () => {
    switch (status) {
      case "idle":
        return "Click and drag to select an area";
      case "selecting":
        return "Release to complete selection";
      case "capturing":
        return "Processing...";
      case "error":
        return "An error occurred. Please try again.";
      default:
        return "Click and drag to select an area";
    }
  };

  return <div className="instructions">{getMessage()}</div>;
};
