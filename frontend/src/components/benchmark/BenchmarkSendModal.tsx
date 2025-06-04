import { MapPin, Calendar, Target, Repeat } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { BenchmarkSend } from '@/types'

interface BenchmarkSendModalProps {
  send: BenchmarkSend | null
  onClose: () => void
}

export function BenchmarkSendModal({ send, onClose }: BenchmarkSendModalProps) {
  if (!send) return null

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'breakthrough': return 'bg-purple-100 text-purple-800'
      case 'milestone': return 'bg-green-100 text-green-800'
      case 'personal-best': return 'bg-blue-100 text-blue-800'
      case 'project-send': return 'bg-orange-100 text-orange-800'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getSignificanceIcon = (significance: string) => {
    switch (significance) {
      case 'breakthrough': return '🚀'
      case 'milestone': return '🏆'
      case 'personal-best': return '⭐'
      case 'project-send': return '🎯'
      default: return '🧗'
    }
  }

  const getStyleIcon = (style: string) => {
    switch (style) {
      case 'slab': return '📐'
      case 'vertical': return '🧱'
      case 'overhang': return '🏔️'
      case 'roof': return '🏠'
      default: return '🧗'
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="relative max-w-2xl w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b pr-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getSignificanceIcon(send.significance)}</span>
              <div>
                <h2 className="text-xl font-bold">{send.name}</h2>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-semibold text-green-600">{send.grade}</span>
                  <span>•</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getSignificanceColor(send.significance)}`}>
                    {send.significance.replace('-', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Details Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Calendar className="h-4 w-4 text-slate-600" />
                <div>
                  <p className="text-sm text-slate-600">Date</p>
                  <p className="font-medium">{formatDate(send.date)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <MapPin className="h-4 w-4 text-slate-600" />
                <div>
                  <p className="text-sm text-slate-600">Location</p>
                  <p className="font-medium">{send.location}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="text-lg">{getStyleIcon(send.style)}</span>
                <div>
                  <p className="text-sm text-slate-600">Style</p>
                  <p className="font-medium capitalize">{send.style}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Repeat className="h-4 w-4 text-slate-600" />
                <div>
                  <p className="text-sm text-slate-600">Attempts</p>
                  <p className="font-medium">{send.attempts}</p>
                </div>
              </div>
            </div>

            {/* Type and Style */}
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm ${
                send.type === 'outdoor' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {send.type === 'outdoor' ? '🏔️ Outdoor' : '🏢 Indoor'}
              </span>
            </div>

            {/* Notes */}
            {send.notes && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Notes
                </h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-700 leading-relaxed">{send.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-slate-50 rounded-b-lg">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Added {new Date(send.createdAt).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button size="sm">
                  Share Progress
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}