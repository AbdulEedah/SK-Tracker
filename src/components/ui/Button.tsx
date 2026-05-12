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
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-60 disabled:pointer-events-none relative overflow-hidden backdrop-filter backdrop-blur-10'
  
  const variants = {
    primary: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-none shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0',
    secondary: 'bg-white text-gray-700 border-none shadow-md hover:bg-gray-50 hover:-translate-y-0.5',
    outline: 'border-none text-emerald-600 bg-white shadow-sm hover:bg-emerald-500 hover:text-white hover:-translate-y-0.5',
    ghost: 'text-gray-700 hover:bg-white border-none',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-none shadow-lg hover:shadow-xl hover:-translate-y-0.5'
  }
  
  const sizes = {
    sm: 'h-10 px-4 text-sm rounded-xl',
    md: 'h-12 px-6 text-base rounded-xl',
    lg: 'h-14 px-8 text-lg rounded-2xl'
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
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      )}
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