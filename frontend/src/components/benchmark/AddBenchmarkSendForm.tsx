import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Modal } from '@/components/ui/Modal'
import { parseGrade, getGradeOptions } from '@/lib/utils/gradeUtils'
import type { BenchmarkSend } from '@/types'

interface AddBenchmarkSendFormProps {
  onSubmit: (send: Omit<BenchmarkSend, 'id' | 'userId' | 'createdAt'>) => void
  onCancel: () => void
}

export function AddBenchmarkSendForm({ onSubmit, onCancel }: AddBenchmarkSendFormProps) {
  const [formData, setFormData] = useState({
    gradeType: 'v-scale' as 'v-scale' | 'yds',
    grade: 'V4',
    name: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    type: 'indoor' as 'indoor' | 'outdoor',
    style: 'vertical' as 'slab' | 'vertical' | 'overhang' | 'roof',
    attempts: 1,
    notes: '',
    significance: 'personal-best' as 'breakthrough' | 'milestone' | 'personal-best' | 'project-send'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedGrade = parseGrade(formData.grade)
    const submitData = {
      ...formData,
      grade: parsedGrade.grade,
      gradeNumeric: parsedGrade.gradeNumeric,
      gradeType: parsedGrade.gradeType
    }
    onSubmit(submitData)
  }

  // Handle grade type change - reset grade to first option of new type
  const handleGradeTypeChange = (newType: 'v-scale' | 'yds') => {
    const options = getGradeOptions(newType)
    setFormData(prev => ({
      ...prev,
      gradeType: newType,
      grade: options[4]?.value || options[0]?.value // Default to 5th option (V4 or 5.4)
    }))
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Modal 
      isOpen={true} 
      onClose={onCancel}
      className="max-w-3xl w-full mx-4"
    >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b pr-16">
            <h2 className="text-xl font-bold">Add Benchmark Send</h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <Label htmlFor="name">Route Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="The Roof"
                required
              />
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div>
                <Label htmlFor="gradeType">Grade Type *</Label>
                <Select
                  id="gradeType"
                  value={formData.gradeType}
                  onChange={(e) => handleGradeTypeChange(e.target.value as 'v-scale' | 'yds')}
                >
                  <option value="v-scale">V-Scale (Bouldering)</option>
                  <option value="yds">YDS (Route Climbing)</option>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="grade">Grade *</Label>
                <Select
                  id="grade"
                  value={formData.grade}
                  onChange={(e) => handleChange('grade', e.target.value)}
                  required
                >
                  {getGradeOptions(formData.gradeType).map((option: { value: string; label: string }) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Brooklyn Boulders, Central Park, etc."
                required
              />
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="attempts">Attempts</Label>
                <Input
                  id="attempts"
                  type="number"
                  min="1"
                  value={formData.attempts}
                  onChange={(e) => handleChange('attempts', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                >
                  <option value="indoor">🏢 Indoor</option>
                  <option value="outdoor">🏔️ Outdoor</option>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="style">Style</Label>
                <Select
                  value={formData.style}
                  onChange={(e) => handleChange('style', e.target.value)}
                >
                  <option value="slab">📐 Slab</option>
                  <option value="vertical">🧱 Vertical</option>
                  <option value="overhang">🏔️ Overhang</option>
                  <option value="roof">🏠 Roof</option>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="significance">Significance</Label>
              <Select
                value={formData.significance}
                onChange={(e) => handleChange('significance', e.target.value)}
              >
                <option value="personal-best">⭐ Personal Best</option>
                <option value="breakthrough">🚀 Breakthrough</option>
                <option value="milestone">🏆 Milestone</option>
                <option value="project-send">🎯 Project Send</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Describe the send, what made it special, techniques used, etc."
                rows={4}
              />
            </div>

            {/* Footer */}
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Add Send
              </Button>
            </div>
          </form>
    </Modal>
  )
}