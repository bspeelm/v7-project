import { useState } from 'react'
import { Brain, Wand2, Clock, Target, Lightbulb, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useNutritionStore } from '@/store/useNutritionStore'
import { MealPlanningModal } from './MealPlanningModal'

interface AIMealPlannerProps {
  onGeneratePlan: (prompt: string) => void
  isGenerating?: boolean
}

export function AIMealPlanner({ onGeneratePlan, isGenerating = false }: AIMealPlannerProps) {
  const { targets, proteinRecommendations, aiInsights } = useNutritionStore()
  const [showModal, setShowModal] = useState(false)
  const [selectedPlanType, setSelectedPlanType] = useState<string>('')

  const mealPlanOptions = [
    {
      id: 'daily-plan',
      title: "Daily Meal Plan",
      description: "Complete day optimized for your goals",
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      id: 'workout-nutrition',
      title: "Pre/Post Workout Meals", 
      description: "Optimize nutrition around training",
      icon: Target,
      color: 'text-blue-600'
    },
    {
      id: 'high-protein',
      title: "High-Protein Strategy",
      description: "Meet protein goals efficiently",
      icon: Target,
      color: 'text-purple-600'
    },
    {
      id: 'weight-loss',
      title: "Weight Loss Focus",
      description: "Cut to climbing weight",
      icon: Target,
      color: 'text-orange-600'
    },
    {
      id: 'meal-prep',
      title: "Meal Prep Strategy",
      description: "Batch cooking for busy schedule",
      icon: Clock,
      color: 'text-indigo-600'
    },
    {
      id: 'custom',
      title: "Custom AI Request",
      description: "Structured nutrition planning",
      icon: Brain,
      color: 'text-pink-600'
    }
  ]

  const handleOpenModal = (planType: string) => {
    setSelectedPlanType(planType)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedPlanType('')
  }

  const handleGeneratePlan = (prompt: string) => {
    onGeneratePlan(prompt)
    handleCloseModal()
  }


  return (
    <div className="space-y-6">
      {/* AI Insights */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Nutrition Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {aiInsights.slice(0, 3).map((insight, index) => (
              <div key={index} className="text-sm text-blue-800 flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Targets */}
      {targets && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Your Daily Targets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{targets.calories}</div>
                <div className="text-green-600">Calories</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{targets.protein}g</div>
                <div className="text-blue-600">Protein</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-700">{targets.carbs}g</div>
                <div className="text-orange-600">Carbs</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">{targets.fat}g</div>
                <div className="text-purple-600">Fat</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-600" />
            AI Meal Planning
          </CardTitle>
          <CardDescription>
            Get personalized meal plans based on your climbing goals and dietary preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {mealPlanOptions.map((option) => {
              const IconComponent = option.icon
              return (
                <Button
                  key={option.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start text-left hover:border-green-300 transition-colors"
                  onClick={() => handleOpenModal(option.id)}
                  disabled={isGenerating}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className={`h-4 w-4 ${option.color}`} />
                    <div className="font-medium">{option.title}</div>
                  </div>
                  <div className="text-xs text-slate-500">{option.description}</div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>


      {/* Top Protein Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Protein Sources</CardTitle>
          <CardDescription>Ranked by efficiency (calories per gram of protein)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {proteinRecommendations.slice(0, 4).map((food, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-medium">{food.food}</div>
                  <div className="text-sm text-slate-600">{food.notes}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">{food.protein}g protein</div>
                  <div className="text-sm text-slate-500">{food.efficiency} cal/g</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Meal Planning Modal */}
      <MealPlanningModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onGeneratePlan={handleGeneratePlan}
        isGenerating={isGenerating}
        planType={selectedPlanType}
      />
    </div>
  )
}