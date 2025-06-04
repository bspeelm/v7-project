import { useState } from 'react'
import { Plus, Calendar, MapPin, Clock, Target } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { JournalEntryForm } from '@/components/journal/JournalEntryForm'
import { AddBenchmarkSendForm } from '@/components/benchmark/AddBenchmarkSendForm'
import { useBenchmarkSendsStore } from '@/store/useBenchmarkSendsStore'
import type { JournalEntry } from '@/types'

// Mock data - replace with API calls
const mockEntries: JournalEntry[] = [
  {
    id: '1',
    userId: '1',
    date: '2025-06-04',
    sessionType: 'gym',
    duration: 120,
    location: 'Brooklyn Boulders',
    gradesAttempted: ['V4', 'V5', 'V6'],
    gradesCompleted: ['V4', 'V5'],
    physicalCondition: {
      energy: 8,
      soreness: { shoulders: 2, fingers: 1 },
      injuries: []
    },
    technicalFocus: ['Overhangs', 'Dynamic moves'],
    mentalState: 'Confident and focused',
    notes: 'Great session! Finally sent that overhang V5 I\'ve been working on. The key was better hip positioning and trusting my feet.',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    userId: '1',
    date: '2025-06-02',
    sessionType: 'training',
    duration: 90,
    location: 'Local Gym',
    gradesAttempted: ['V3', 'V4'],
    gradesCompleted: ['V3'],
    physicalCondition: {
      energy: 6,
      soreness: { forearms: 3 },
      injuries: []
    },
    technicalFocus: ['Hangboard', 'Core strength'],
    mentalState: 'Focused on training',
    notes: 'Strength training day. Did hangboard protocol and core work. Feeling stronger but need to work on power.',
    createdAt: new Date().toISOString()
  }
]

export function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(mockEntries)
  const [showForm, setShowForm] = useState(false)
  const [showBenchmarkForm, setShowBenchmarkForm] = useState(false)
  const { addBenchmarkSend } = useBenchmarkSendsStore()

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'gym': return '🏋️'
      case 'outdoor': return '🏔️'
      case 'training': return '💪'
      case 'rest': return '😴'
      default: return '🧗'
    }
  }

  const handleNewEntry = (entryData: Partial<JournalEntry>) => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      userId: 'dev-user-1',
      ...entryData,
      createdAt: new Date().toISOString(),
    } as JournalEntry

    setEntries(prev => [newEntry, ...prev])
    setShowForm(false)
  }

  const handleAddBenchmarkSend = (sendData: any) => {
    addBenchmarkSend(sendData)
    setShowBenchmarkForm(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Climbing Journal</h1>
          <p className="text-slate-600 mt-2">Track your progress and reflect on your sessions</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowBenchmarkForm(true)}
          >
            <Target className="h-4 w-4" />
            Add Benchmark Send
          </Button>
          <Button 
            className="flex items-center gap-2"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4" />
            New Entry
          </Button>
        </div>
      </div>

      {/* Journal Entries */}
      <div className="space-y-6">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getSessionIcon(entry.sessionType)}</span>
                  <div>
                    <CardTitle className="text-lg">{formatDate(entry.date)}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {entry.sessionType.charAt(0).toUpperCase() + entry.sessionType.slice(1)}
                      </span>
                      {entry.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {entry.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {entry.duration} min
                      </span>
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">Energy: {entry.physicalCondition.energy}/10</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Grades Attempted</h4>
                  <div className="flex flex-wrap gap-1">
                    {entry.gradesAttempted.map((grade, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 text-xs rounded-full ${
                          entry.gradesCompleted.includes(grade)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {grade} {entry.gradesCompleted.includes(grade) && '✓'}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Technical Focus</h4>
                  <div className="flex flex-wrap gap-1">
                    {entry.technicalFocus.map((focus, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                      >
                        {focus}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {entry.notes && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-slate-700 text-sm leading-relaxed">{entry.notes}</p>
                </div>
              )}

              {Object.keys(entry.physicalCondition.soreness).length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Soreness</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(entry.physicalCondition.soreness).map(([area, level]) => (
                      <span
                        key={area}
                        className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full"
                      >
                        {area}: {level}/5
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium mb-2">No journal entries yet</h3>
          <p className="text-slate-600 mb-6">Start tracking your climbing sessions to see your progress over time.</p>
          <Button onClick={() => setShowForm(true)}>Create Your First Entry</Button>
        </div>
      )}

      {/* Journal Entry Form Modal */}
      {showForm && (
        <JournalEntryForm
          onSubmit={handleNewEntry}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Add Benchmark Send Form */}
      {showBenchmarkForm && (
        <AddBenchmarkSendForm
          onSubmit={handleAddBenchmarkSend}
          onCancel={() => setShowBenchmarkForm(false)}
        />
      )}
    </div>
  )
}