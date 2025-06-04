import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import type { JournalEntry } from '@/types'

const journalEntrySchema = z.object({
  date: z.string(),
  sessionType: z.enum(['training', 'outdoor', 'gym', 'rest']),
  duration: z.number().min(1).max(480),
  location: z.string().optional(),
  gradesAttempted: z.string(),
  gradesCompleted: z.string(),
  energy: z.number().min(1).max(10),
  technicalFocus: z.string(),
  mentalState: z.string(),
  notes: z.string(),
})

type JournalEntryFormData = z.infer<typeof journalEntrySchema>

interface JournalEntryFormProps {
  onSubmit: (data: Partial<JournalEntry>) => void
  onCancel: () => void
  entry?: JournalEntry
}

export function JournalEntryForm({ onSubmit, onCancel, entry }: JournalEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: entry ? {
      date: entry.date,
      sessionType: entry.sessionType,
      duration: entry.duration,
      location: entry.location || '',
      gradesAttempted: entry.gradesAttempted.join(', '),
      gradesCompleted: entry.gradesCompleted.join(', '),
      energy: entry.physicalCondition.energy,
      technicalFocus: entry.technicalFocus.join(', '),
      mentalState: entry.mentalState,
      notes: entry.notes,
    } : {
      date: new Date().toISOString().split('T')[0],
      sessionType: 'gym',
      duration: 120,
      location: '',
      gradesAttempted: '',
      gradesCompleted: '',
      energy: 7,
      technicalFocus: '',
      mentalState: '',
      notes: '',
    },
  })

  const onFormSubmit = async (data: JournalEntryFormData) => {
    setIsSubmitting(true)
    
    // Transform form data to match JournalEntry type
    const journalEntry: Partial<JournalEntry> = {
      date: data.date,
      sessionType: data.sessionType,
      duration: data.duration,
      location: data.location,
      gradesAttempted: data.gradesAttempted.split(',').map(g => g.trim()).filter(Boolean),
      gradesCompleted: data.gradesCompleted.split(',').map(g => g.trim()).filter(Boolean),
      physicalCondition: {
        energy: data.energy,
        soreness: {},
        injuries: []
      },
      technicalFocus: data.technicalFocus.split(',').map(f => f.trim()).filter(Boolean),
      mentalState: data.mentalState,
      notes: data.notes,
    }

    try {
      await onSubmit(journalEntry)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={onCancel} className="w-full max-w-2xl">
      <Card className="border-0 shadow-none">
        <CardHeader className="pr-12">
          <CardTitle>{entry ? 'Edit Entry' : 'New Journal Entry'}</CardTitle>
          <CardDescription>Record your climbing session details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  {...register('date')}
                />
                {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date.message}</p>}
              </div>

              <div>
                <Label htmlFor="sessionType">Session Type</Label>
                <Select {...register('sessionType')}>
                  <option value="gym">Gym</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="training">Training</option>
                  <option value="rest">Rest</option>
                </Select>
                {errors.sessionType && <p className="text-sm text-red-600 mt-1">{errors.sessionType.message}</p>}
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  {...register('duration', { valueAsNumber: true })}
                  placeholder="120"
                />
                {errors.duration && <p className="text-sm text-red-600 mt-1">{errors.duration.message}</p>}
              </div>

              <div>
                <Label htmlFor="location">Location (optional)</Label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="Brooklyn Boulders"
                />
                {errors.location && <p className="text-sm text-red-600 mt-1">{errors.location.message}</p>}
              </div>

              <div>
                <Label htmlFor="energy">Energy Level (1-10)</Label>
                <Input
                  id="energy"
                  type="number"
                  min="1"
                  max="10"
                  {...register('energy', { valueAsNumber: true })}
                  placeholder="7"
                />
                {errors.energy && <p className="text-sm text-red-600 mt-1">{errors.energy.message}</p>}
              </div>

              <div>
                <Label htmlFor="gradesAttempted">Grades Attempted (comma-separated)</Label>
                <Input
                  id="gradesAttempted"
                  {...register('gradesAttempted')}
                  placeholder="V4, V5, V6"
                />
                {errors.gradesAttempted && <p className="text-sm text-red-600 mt-1">{errors.gradesAttempted.message}</p>}
              </div>

              <div>
                <Label htmlFor="gradesCompleted">Grades Completed (comma-separated)</Label>
                <Input
                  id="gradesCompleted"
                  {...register('gradesCompleted')}
                  placeholder="V4, V5"
                />
                {errors.gradesCompleted && <p className="text-sm text-red-600 mt-1">{errors.gradesCompleted.message}</p>}
              </div>

              <div>
                <Label htmlFor="technicalFocus">Technical Focus (comma-separated)</Label>
                <Input
                  id="technicalFocus"
                  {...register('technicalFocus')}
                  placeholder="Overhangs, Dynamic moves"
                />
                {errors.technicalFocus && <p className="text-sm text-red-600 mt-1">{errors.technicalFocus.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="mentalState">Mental State</Label>
              <Input
                id="mentalState"
                {...register('mentalState')}
                placeholder="Confident and focused"
              />
              {errors.mentalState && <p className="text-sm text-red-600 mt-1">{errors.mentalState.message}</p>}
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Describe your session, breakthroughs, challenges..."
                className="min-h-[100px]"
              />
              {errors.notes && <p className="text-sm text-red-600 mt-1">{errors.notes.message}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : entry ? 'Update Entry' : 'Save Entry'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Modal>
  )
}