import { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, children, className }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-200 bg-opacity-75 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className={cn(
          'relative bg-white rounded-lg shadow-lg border border-slate-200 max-h-[90vh] overflow-y-auto',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        
        {children}
      </div>
    </div>
  )
}