import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import type { AthleteProfile } from '@/types'

const profileSchema = z.object({
  age: z.number().min(10).max(100),
  weight: z.number().min(50).max(300),
  height: z.number().min(100).max(250),
  yearsClimbing: z.number().min(0).max(50),
  currentGrades: z.object({
    indoor: z.object({
      slab: z.string(),
      vertical: z.string(),
      overhang: z.string(),
    }),
    outdoor: z.object({
      sport: z.string(),
      boulder: z.string(),
      trad: z.string().optional(),
    }),
  }),
  weaknesses: z.array(z.string()),
  strengths: z.array(z.string()),
  dietaryRestrictions: z.array(z.string()),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  profile?: AthleteProfile
  onSubmit: (data: ProfileFormData) => void
}

const gradeOptions = [
  'VB', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15'
]

const sportGradeOptions = [
  '5.6', '5.7', '5.8', '5.9', '5.10a', '5.10b', '5.10c', '5.10d', 
  '5.11a', '5.11b', '5.11c', '5.11d', '5.12a', '5.12b', '5.12c', '5.12d'
]

export function ProfileForm({ profile, onSubmit }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile || {
      age: 30,
      weight: 150,
      height: 170,
      yearsClimbing: 1,
      currentGrades: {
        indoor: { slab: 'V3', vertical: 'V3', overhang: 'V2' },
        outdoor: { sport: '5.9', boulder: 'V2', trad: '' },
      },
      weaknesses: [],
      strengths: [],
      dietaryRestrictions: [],
    },
  })

  const handleArrayInput = (field: 'weaknesses' | 'strengths' | 'dietaryRestrictions', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean)
    setValue(field, items)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Tell us about yourself and your climbing experience</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              {...register('age', { valueAsNumber: true })}
              placeholder="30"
            />
            {errors.age && <p className="text-sm text-red-600 mt-1">{errors.age.message}</p>}
          </div>

          <div>
            <Label htmlFor="weight">Weight (lbs)</Label>
            <Input
              id="weight"
              type="number"
              {...register('weight', { valueAsNumber: true })}
              placeholder="150"
            />
            {errors.weight && <p className="text-sm text-red-600 mt-1">{errors.weight.message}</p>}
          </div>

          <div>
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              {...register('height', { valueAsNumber: true })}
              placeholder="170"
            />
            {errors.height && <p className="text-sm text-red-600 mt-1">{errors.height.message}</p>}
          </div>

          <div>
            <Label htmlFor="yearsClimbing">Years Climbing</Label>
            <Input
              id="yearsClimbing"
              type="number"
              {...register('yearsClimbing', { valueAsNumber: true })}
              placeholder="1"
            />
            {errors.yearsClimbing && <p className="text-sm text-red-600 mt-1">{errors.yearsClimbing.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Grades</CardTitle>
          <CardDescription>What grades are you currently climbing?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Indoor Bouldering</h4>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="indoor-slab">Slab</Label>
                  <Select {...register('currentGrades.indoor.slab')}>
                    {gradeOptions.map((grade) => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="indoor-vertical">Vertical</Label>
                  <Select {...register('currentGrades.indoor.vertical')}>
                    {gradeOptions.map((grade) => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="indoor-overhang">Overhang</Label>
                  <Select {...register('currentGrades.indoor.overhang')}>
                    {gradeOptions.map((grade) => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Outdoor Climbing</h4>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="outdoor-boulder">Boulder</Label>
                  <Select {...register('currentGrades.outdoor.boulder')}>
                    {gradeOptions.map((grade) => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="outdoor-sport">Sport</Label>
                  <Select {...register('currentGrades.outdoor.sport')}>
                    {sportGradeOptions.map((grade) => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="outdoor-trad">Trad (optional)</Label>
                  <Select {...register('currentGrades.outdoor.trad')}>
                    <option value="">N/A</option>
                    {sportGradeOptions.map((grade) => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Strengths & Weaknesses</CardTitle>
          <CardDescription>Help us personalize your training plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="strengths">Strengths (comma-separated)</Label>
            <Textarea
              id="strengths"
              placeholder="e.g., Crimps, Balance, Flexibility, Endurance"
              onChange={(e) => handleArrayInput('strengths', e.target.value)}
              defaultValue={watch('strengths').join(', ')}
            />
          </div>

          <div>
            <Label htmlFor="weaknesses">Weaknesses (comma-separated)</Label>
            <Textarea
              id="weaknesses"
              placeholder="e.g., Overhangs, Dynamic moves, Finger strength, Power"
              onChange={(e) => handleArrayInput('weaknesses', e.target.value)}
              defaultValue={watch('weaknesses').join(', ')}
            />
          </div>

          <div>
            <Label htmlFor="dietary">Dietary Restrictions (comma-separated)</Label>
            <Textarea
              id="dietary"
              placeholder="e.g., Vegetarian, Vegan, Gluten-free, Dairy-free"
              onChange={(e) => handleArrayInput('dietaryRestrictions', e.target.value)}
              defaultValue={watch('dietaryRestrictions').join(', ')}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg">
          Save Profile
        </Button>
      </div>
    </form>
  )
}