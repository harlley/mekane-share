import React from 'react';

interface ButtonProps {
  /**
   * Button contents
   */
  label: string;
  /**
   * Optional click handler
   */
  onClick?: () => void;
  /**
   * Optional variant
   */
  variant?: 'primary' | 'secondary';
}

export const Button = ({
  label,
  onClick,
  variant = 'primary',
}: ButtonProps) => {
  const baseStyles = 'px-4 py-2 rounded-md font-medium';
  const variantStyles =
    variant === 'primary'
      ? 'bg-blue-500 text-white hover:bg-blue-600'
      : 'bg-gray-200 text-gray-800 hover:bg-gray-300';

  return (
    <button className={`${baseStyles} ${variantStyles}`} onClick={onClick}>
      {label}
    </button>
  );
};
