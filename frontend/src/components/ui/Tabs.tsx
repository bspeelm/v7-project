import * as React from 'react'
import { cn } from '@/lib/utils'

interface TabsProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

export function Tabs({ 
  value: controlledValue, 
  defaultValue = '', 
  onValueChange, 
  children,
  className 
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const value = controlledValue ?? uncontrolledValue
  
  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
      className
    )}>
      {children}
    </div>
  )
}

export function TabsTrigger({ 
  value, 
  children, 
  className 
}: { 
  value: string
  children: React.ReactNode
  className?: string 
}) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')
  
  const isSelected = context.value === value

  return (
    <button
      onClick={() => context.onValueChange(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300',
        isSelected
          ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-slate-50'
          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400',
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({ 
  value, 
  children, 
  className 
}: { 
  value: string
  children: React.ReactNode
  className?: string 
}) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')
  
  if (context.value !== value) return null

  return (
    <div className={cn('mt-2', className)}>
      {children}
    </div>
  )
}