import { useState } from 'react'
import { ChatInterface } from '@/components/chat/ChatInterface'
import type { ChatMessage } from '@/types'

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand you're asking about "${content}". As your climbing coach, I'd be happy to help! This is a mock response, but in the real app, I'll provide personalized advice based on your profile and training history.`,
        timestamp: new Date().toISOString(),
      }
      
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-12rem)] max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-full flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold">V7 AI Coach</h1>
          <p className="text-sm text-slate-600 mt-1">
            Get personalized climbing advice based on your profile and goals
          </p>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}