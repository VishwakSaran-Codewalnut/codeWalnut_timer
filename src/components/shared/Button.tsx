import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string;
    variant?: 'primary' | 'secondary' | 'unstyled'; // Add 'unstyled'
    className?: string;
}

export const Button: React.FC<ButtonProps> = React.memo(({
    label,
    onClick,
    type = 'button',
    variant = 'primary',
    disabled = false,
    className = '',
    children,
    ...props
}) => {
    const baseClasses =
        'px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none flex items-center gap-2';

    const variantClasses =
        variant === 'primary'
            ? 'text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
            : variant === 'secondary'
                ? 'text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100'
                : ''; // No styles for unstyled buttons

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${variantClasses ? baseClasses : ''} ${variantClasses} ${className}`}
            {...props}
        >
            {children || label}
        </button>
    );
});
