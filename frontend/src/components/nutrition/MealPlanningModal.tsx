import { useState } from 'react'
import { Brain, Clock, Target, Utensils, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Modal } from '@/components/ui/Modal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useNutritionStore } from '@/store/useNutritionStore'

interface MealPlanningModalProps {
  isOpen: boolean
  onClose: () => void
  onGeneratePlan: (prompt: string) => void
  isGenerating: boolean
  planType?: string
}

export function MealPlanningModal({ 
  isOpen, 
  onClose, 
  onGeneratePlan, 
  isGenerating,
  planType = 'custom'
}: MealPlanningModalProps) {
  const { targets, userProfile } = useNutritionStore()
  
  const [customization, setCustomization] = useState({
    timeframe: 'single-day',
    focus: 'balanced',
    restrictions: '',
    preferences: '',
    timing: '',
    preparation: 'any',
    budget: 'moderate',
    customRequest: ''
  })

  const planTypes = {
    'daily-plan': {
      title: 'Daily Meal Plan',
      icon: Calendar,
      description: 'Complete day optimized for your climbing goals',
      basePrompt: targets && userProfile ? `Create a complete daily meal plan with ${targets.calories} calories and ${targets.protein}g protein. I'm a ${userProfile.age}-year-old vegetarian climber weighing ${userProfile.currentWeight}lbs, trying to ${userProfile.goal === 'cut' ? 'lose weight to' : 'reach'} ${userProfile.targetWeight}lbs.` : '',
      focusOptions: [
        { value: 'balanced', label: 'Balanced nutrition' },
        { value: 'high-protein', label: 'High protein focus' },
        { value: 'energy', label: 'Sustained energy' },
        { value: 'recovery', label: 'Recovery focused' }
      ]
    },
    'workout-nutrition': {
      title: 'Pre/Post Workout Meals',
      icon: Target,
      description: 'Optimize nutrition around climbing sessions',
      basePrompt: targets && userProfile ? `Design pre and post-workout meals for a ${userProfile.currentWeight}lb vegetarian climber. Pre-workout should fuel a climbing session, post-workout should optimize recovery with ${Math.round(targets.protein / 4)}g protein.` : '',
      focusOptions: [
        { value: 'performance', label: 'Performance focused' },
        { value: 'recovery', label: 'Recovery optimized' },
        { value: 'quick', label: 'Quick & portable' },
        { value: 'gentle', label: 'Easy on stomach' }
      ]
    },
    'high-protein': {
      title: 'High-Protein Strategy',
      icon: Target,
      description: 'Meet protein goals efficiently as a vegetarian',
      basePrompt: targets ? `I need to hit ${targets.protein}g protein daily as a vegetarian climber. My current struggle is protein intake. Create a strategic meal plan using the most protein-efficient vegetarian foods.` : '',
      focusOptions: [
        { value: 'efficiency', label: 'Protein efficiency' },
        { value: 'variety', label: 'Diverse sources' },
        { value: 'budget', label: 'Budget-friendly' },
        { value: 'convenience', label: 'Convenience focused' }
      ]
    },
    'weight-loss': {
      title: 'Weight Loss Focus',
      icon: Target,
      description: 'Cut to climbing weight while maintaining strength',
      basePrompt: targets && userProfile ? `Help me lose ${userProfile.currentWeight - userProfile.targetWeight}lbs while maintaining climbing strength. Create a meal plan with ${targets.calories} calories that keeps me full and energized.` : '',
      focusOptions: [
        { value: 'satiety', label: 'High satiety' },
        { value: 'volume', label: 'High volume foods' },
        { value: 'steady', label: 'Steady energy' },
        { value: 'cravings', label: 'Craving control' }
      ]
    },
    'meal-prep': {
      title: 'Meal Prep Strategy',
      icon: Clock,
      description: 'Batch cooking for busy climbing schedule',
      basePrompt: targets ? `Design a weekly meal prep strategy for a busy climber training 15+ hours per week. I need ${targets.calories} calories and ${targets.protein}g protein daily as a vegetarian.` : '',
      focusOptions: [
        { value: 'efficiency', label: 'Time efficient' },
        { value: 'variety', label: 'Variety focused' },
        { value: 'portable', label: 'Portable meals' },
        { value: 'freezer', label: 'Freezer-friendly' }
      ]
    },
    'custom': {
      title: 'Custom AI Request',
      icon: Brain,
      description: 'Structured nutrition planning request',
      basePrompt: '',
      focusOptions: [
        { value: 'general', label: 'General nutrition' },
        { value: 'specific', label: 'Specific situation' },
        { value: 'troubleshooting', label: 'Problem solving' },
        { value: 'optimization', label: 'Optimization' }
      ]
    }
  }

  const currentPlan = planTypes[planType as keyof typeof planTypes] || planTypes.custom

  const handleChange = (field: string, value: string) => {
    setCustomization(prev => ({ ...prev, [field]: value }))
  }

  const generateFinalPrompt = () => {
    let prompt = currentPlan.basePrompt

    if (planType === 'custom') {
      prompt = customization.customRequest
      if (!prompt.trim()) return ''
    }

    // Add customizations
    const additions = []
    
    if (customization.focus !== 'balanced') {
      const focusLabel = currentPlan.focusOptions.find(opt => opt.value === customization.focus)?.label
      additions.push(`Focus on ${focusLabel?.toLowerCase()}`)
    }

    if (customization.restrictions) {
      additions.push(`Additional dietary restrictions: ${customization.restrictions}`)
    }

    if (customization.preferences) {
      additions.push(`Food preferences: ${customization.preferences}`)
    }

    if (customization.timing) {
      additions.push(`Timing considerations: ${customization.timing}`)
    }

    if (customization.preparation !== 'any') {
      const prepMap: { [key: string]: string } = {
        'minimal': 'minimal cooking/prep time',
        'batch': 'batch cooking friendly',
        'advanced': 'willing to do complex preparation'
      }
      additions.push(`Preparation preference: ${prepMap[customization.preparation]}`)
    }

    if (customization.budget !== 'moderate') {
      additions.push(`Budget consideration: ${customization.budget} budget`)
    }

    if (customization.timeframe === 'weekly') {
      additions.push('Provide a full weekly plan')
    }

    if (additions.length > 0) {
      prompt += '\n\nAdditional requirements:\n' + additions.map(a => `- ${a}`).join('\n')
    }

    // Add context
    if (targets && userProfile) {
      prompt += `\n\nContext: I'm a ${userProfile.age}-year-old vegetarian climber, ${userProfile.currentWeight}lbs, targeting ${userProfile.targetWeight}lbs. Daily targets: ${targets.calories} calories, ${targets.protein}g protein, ${targets.carbs}g carbs, ${targets.fat}g fat. Activity level: ${userProfile.activityLevel}. Goal: ${userProfile.goal}.`
    }

    return prompt
  }

  const handleSubmit = () => {
    const finalPrompt = generateFinalPrompt()
    if (finalPrompt.trim()) {
      onGeneratePlan(finalPrompt)
      onClose()
    }
  }

  const IconComponent = currentPlan.icon

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl w-full mx-4">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b pr-16">
        <div className="flex items-center gap-3">
          <IconComponent className="h-6 w-6 text-green-600" />
          <div>
            <h2 className="text-xl font-bold">{currentPlan.title}</h2>
            <p className="text-sm text-slate-600">{currentPlan.description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Base Prompt Preview */}
        {planType !== 'custom' && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm text-blue-900">Base Request</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800">{currentPlan.basePrompt}</p>
            </CardContent>
          </Card>
        )}

        {/* Custom Request Field (for custom type) */}
        {planType === 'custom' && (
          <div>
            <Label htmlFor="customRequest">Your Nutrition Question or Request *</Label>
            <Textarea
              id="customRequest"
              value={customization.customRequest}
              onChange={(e) => handleChange('customRequest', e.target.value)}
              placeholder="e.g., 'Create a meal plan for climbing competitions', 'What should I eat before a 4-hour outdoor session?', 'Help me hit my protein goals with meal prep'..."
              rows={4}
            />
          </div>
        )}

        {/* Customization Options */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="timeframe">Timeframe</Label>
            <Select
              id="timeframe"
              value={customization.timeframe}
              onChange={(e) => handleChange('timeframe', e.target.value)}
            >
              <option value="single-day">Single day</option>
              <option value="weekly">Full week</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="focus">Primary Focus</Label>
            <Select
              id="focus"
              value={customization.focus}
              onChange={(e) => handleChange('focus', e.target.value)}
            >
              {currentPlan.focusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="preparation">Preparation Level</Label>
            <Select
              id="preparation"
              value={customization.preparation}
              onChange={(e) => handleChange('preparation', e.target.value)}
            >
              <option value="any">Any preparation level</option>
              <option value="minimal">Minimal prep/cooking</option>
              <option value="batch">Batch cooking friendly</option>
              <option value="advanced">Complex preparation OK</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="budget">Budget Consideration</Label>
            <Select
              id="budget"
              value={customization.budget}
              onChange={(e) => handleChange('budget', e.target.value)}
            >
              <option value="low">Budget-conscious</option>
              <option value="moderate">Moderate budget</option>
              <option value="high">Premium ingredients OK</option>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="restrictions">Additional Dietary Restrictions</Label>
          <Input
            id="restrictions"
            value={customization.restrictions}
            onChange={(e) => handleChange('restrictions', e.target.value)}
            placeholder="e.g., gluten-free, nut allergies, soy-free..."
          />
        </div>

        <div>
          <Label htmlFor="preferences">Food Preferences</Label>
          <Input
            id="preferences"
            value={customization.preferences}
            onChange={(e) => handleChange('preferences', e.target.value)}
            placeholder="e.g., love legumes, avoid mushrooms, prefer Asian flavors..."
          />
        </div>

        <div>
          <Label htmlFor="timing">Timing Considerations</Label>
          <Input
            id="timing"
            value={customization.timing}
            onChange={(e) => handleChange('timing', e.target.value)}
            placeholder="e.g., early morning workouts, late evening sessions, competition timing..."
          />
        </div>

        {/* Preview */}
        {(planType !== 'custom' || customization.customRequest.trim()) && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-sm text-green-900">AI Request Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-green-800 max-h-32 overflow-y-auto">
                {generateFinalPrompt()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isGenerating || (planType === 'custom' && !customization.customRequest.trim())}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                AI is thinking...
              </>
            ) : (
              <>
                <Utensils className="h-4 w-4 mr-2" />
                Generate Meal Plan
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}