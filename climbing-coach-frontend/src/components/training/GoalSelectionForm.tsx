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
import { Target, Calendar, TrendingUp } from 'lucide-react'

const goalFormSchema = z.object({
  primaryGoal: z.string().min(1, 'Primary goal is required'),
  targetGrade: z.string().min(1, 'Target grade is required'),
  timeframe: z.string().min(1, 'Timeframe is required'),
  climbingStyle: z.string().min(1, 'Climbing style is required'),
  currentLevel: z.string().min(1, 'Current level is required'),
  weeklyHours: z.number().min(1).max(40),
  focusAreas: z.string(),
  limitations: z.string(),
  experience: z.string(),
  notes: z.string(),
})

type GoalFormData = z.infer<typeof goalFormSchema>

interface GoalSelectionFormProps {
  onSubmit: (goals: GoalFormData) => void
  onCancel: () => void
}

export function GoalSelectionForm({ onSubmit, onCancel }: GoalSelectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      primaryGoal: '',
      targetGrade: '',
      timeframe: '',
      climbingStyle: '',
      currentLevel: '',
      weeklyHours: 10,
      focusAreas: '',
      limitations: '',
      experience: '',
      notes: '',
    },
  })

  const onFormSubmit = async (data: GoalFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const targetGrade = watch('targetGrade')
  const climbingStyle = watch('climbingStyle')

  return (
    <Modal isOpen={true} onClose={onCancel} className="w-full max-w-3xl">
      <Card className="border-0 shadow-none">
        <CardHeader className="pr-12">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-green-600" />
            <div>
              <CardTitle>Set Your Training Goals</CardTitle>
              <CardDescription>Tell us about your climbing goals so we can create a personalized training plan</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Primary Goals Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Primary Goals
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="primaryGoal">What's your main climbing goal?</Label>
                  <Select {...register('primaryGoal')}>
                    <option value="">Select your primary goal</option>
                    <option value="grade_progression">Send a specific grade</option>
                    <option value="technique_improvement">Improve technique</option>
                    <option value="strength_building">Build strength</option>
                    <option value="endurance_training">Increase endurance</option>
                    <option value="competition_prep">Competition preparation</option>
                    <option value="injury_recovery">Injury recovery</option>
                    <option value="general_fitness">General climbing fitness</option>
                  </Select>
                  {errors.primaryGoal && <p className="text-sm text-red-600 mt-1">{errors.primaryGoal.message}</p>}
                </div>

                <div>
                  <Label htmlFor="targetGrade">Target Grade</Label>
                  <Select {...register('targetGrade')}>
                    <option value="">Select target grade</option>
                    <optgroup label="Bouldering (V-Scale)">
                      <option value="V3">V3</option>
                      <option value="V4">V4</option>
                      <option value="V5">V5</option>
                      <option value="V6">V6</option>
                      <option value="V7">V7</option>
                      <option value="V8">V8</option>
                      <option value="V9">V9</option>
                      <option value="V10">V10</option>
                    </optgroup>
                    <optgroup label="Sport (YDS)">
                      <option value="5.10a">5.10a</option>
                      <option value="5.10b">5.10b</option>
                      <option value="5.10c">5.10c</option>
                      <option value="5.10d">5.10d</option>
                      <option value="5.11a">5.11a</option>
                      <option value="5.11b">5.11b</option>
                      <option value="5.11c">5.11c</option>
                      <option value="5.11d">5.11d</option>
                      <option value="5.12a">5.12a</option>
                      <option value="5.12b">5.12b</option>
                    </optgroup>
                  </Select>
                  {errors.targetGrade && <p className="text-sm text-red-600 mt-1">{errors.targetGrade.message}</p>}
                </div>

                <div>
                  <Label htmlFor="timeframe">Timeframe to achieve goal</Label>
                  <Select {...register('timeframe')}>
                    <option value="">Select timeframe</option>
                    <option value="1_month">1 month</option>
                    <option value="3_months">3 months</option>
                    <option value="6_months">6 months</option>
                    <option value="1_year">1 year</option>
                    <option value="2_years">2+ years</option>
                  </Select>
                  {errors.timeframe && <p className="text-sm text-red-600 mt-1">{errors.timeframe.message}</p>}
                </div>

                <div>
                  <Label htmlFor="climbingStyle">Preferred climbing style</Label>
                  <Select {...register('climbingStyle')}>
                    <option value="">Select climbing style</option>
                    <option value="bouldering">Bouldering</option>
                    <option value="sport">Sport climbing</option>
                    <option value="trad">Traditional climbing</option>
                    <option value="mixed">Mixed (all styles)</option>
                  </Select>
                  {errors.climbingStyle && <p className="text-sm text-red-600 mt-1">{errors.climbingStyle.message}</p>}
                </div>
              </div>
            </div>

            {/* Current Level Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Current Level
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="currentLevel">Current consistent grade</Label>
                  <Select {...register('currentLevel')}>
                    <option value="">Select current level</option>
                    <optgroup label="Bouldering (V-Scale)">
                      <option value="V0-V1">V0-V1</option>
                      <option value="V2-V3">V2-V3</option>
                      <option value="V4-V5">V4-V5</option>
                      <option value="V6-V7">V6-V7</option>
                      <option value="V8+">V8+</option>
                    </optgroup>
                    <optgroup label="Sport (YDS)">
                      <option value="5.8-5.9">5.8-5.9</option>
                      <option value="5.10a-5.10d">5.10a-5.10d</option>
                      <option value="5.11a-5.11d">5.11a-5.11d</option>
                      <option value="5.12+">5.12+</option>
                    </optgroup>
                  </Select>
                  {errors.currentLevel && <p className="text-sm text-red-600 mt-1">{errors.currentLevel.message}</p>}
                </div>

                <div>
                  <Label htmlFor="weeklyHours">Weekly training hours available</Label>
                  <Input
                    id="weeklyHours"
                    type="number"
                    min="1"
                    max="40"
                    {...register('weeklyHours', { valueAsNumber: true })}
                    placeholder="10"
                  />
                  {errors.weeklyHours && <p className="text-sm text-red-600 mt-1">{errors.weeklyHours.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="experience">Climbing experience & background</Label>
                <Textarea
                  id="experience"
                  {...register('experience')}
                  placeholder="e.g., 3 years climbing, mostly gym bouldering, some outdoor sport climbing..."
                  className="min-h-[60px]"
                />
              </div>
            </div>

            {/* Focus & Limitations Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Training Focus & Limitations
              </h3>
              
              <div>
                <Label htmlFor="focusAreas">Areas you want to focus on (comma-separated)</Label>
                <Textarea
                  id="focusAreas"
                  {...register('focusAreas')}
                  placeholder="e.g., Finger strength, Overhangs, Dynamic moves, Endurance, Mental game..."
                  className="min-h-[60px]"
                />
              </div>

              <div>
                <Label htmlFor="limitations">Limitations or injuries to consider</Label>
                <Textarea
                  id="limitations"
                  {...register('limitations')}
                  placeholder="e.g., Previous finger injury, limited gym access on weekends, shoulder issues..."
                  className="min-h-[60px]"
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional notes or specific requests</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Any other information that would help create your perfect training plan..."
                  className="min-h-[60px]"
                />
              </div>
            </div>

            {/* Goal Summary */}
            {targetGrade && climbingStyle && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Goal Summary</h4>
                <p className="text-sm text-green-800">
                  Create a training plan to achieve <strong>{targetGrade}</strong> in <strong>{climbingStyle}</strong> 
                  {watch('timeframe') && ` within ${watch('timeframe').replace('_', ' ')}`}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Generating Plan...' : 'Generate Training Plan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Modal>
  )
}