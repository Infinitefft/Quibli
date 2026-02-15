import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={`
            flex h-11 w-full rounded-full border border-gray-200 bg-gray-100 px-4 py-2 
            text-sm text-foreground ring-offset-background file:border-0 
            file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground 
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-0 
            disabled:cursor-not-allowed disabled:opacity-50
            transition-all duration-200 ease-in-out
            shadow-sm
            ${icon ? 'pl-10' : ''}
            ${className || ''}
          `}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";