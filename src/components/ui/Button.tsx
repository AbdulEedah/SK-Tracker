import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:pointer-events-none border-2'
  
  const variants = {
    primary: 'bg-[#00A86B] text-black border-black hover:opacity-90 active:translate-y-0.5',
    secondary: 'bg-black text-[#00A86B] border-black hover:bg-[#00A86B] hover:text-black',
    outline: 'border-[#00A86B] text-[#00A86B] bg-transparent hover:bg-[#00A86B] hover:text-black',
    ghost: 'text-black hover:bg-gray-100 border-transparent',
    danger: 'bg-red-600 text-white border-red-600 hover:bg-red-700'
  }
  
  const sizes = {
    sm: 'h-10 px-4 text-sm rounded-md',
    md: 'h-12 px-6 text-base rounded-md',
    lg: 'h-14 px-8 text-lg rounded-md'
  }

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        loading && 'cursor-wait',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  )
}