import { Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatMessage as ChatMessageType } from '@/types'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div className={cn(
        'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full',
        isUser ? 'bg-green-600' : 'bg-slate-700'
      )}>
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-white" />
        )}
      </div>
      
      <div className={cn(
        'flex flex-col gap-1 max-w-[80%]',
        isUser && 'items-end'
      )}>
        <div className={cn(
          'rounded-lg px-4 py-2',
          isUser 
            ? 'bg-green-600 text-white' 
            : 'bg-slate-100 text-slate-900'
        )}>
          <div className="prose prose-sm max-w-none">
            {message.content.split('\n').map((line, i) => (
              <p key={i} className="mb-2 last:mb-0">{line}</p>
            ))}
          </div>
        </div>
        <span className="text-xs text-slate-500">
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
    </div>
  )
}