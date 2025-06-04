import { useState } from 'react'
import { Plus, Target, Brain, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useNutritionStore } from '@/store/useNutritionStore'
import { MealLogForm } from '@/components/nutrition/MealLogForm'
import { AIMealPlanner } from '@/components/nutrition/AIMealPlanner'

export function NutritionPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showMealForm, setShowMealForm] = useState(false)
  const [editingMeal, setEditingMeal] = useState(null)
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  
  const { 
    targets, 
    currentLog, 
    userProfile, 
    proteinRecommendations,
    aiInsights,
    deleteMeal,
    addAiInsight
  } = useNutritionStore()

  // Get current day's nutrition data
  const currentTotals = currentLog || {
    totalCalories: 0,
    macros: { protein: 0, carbs: 0, fat: 0 },
    meals: []
  }
  
  const nutritionTargets = {
    calories: { target: targets.calories, current: currentTotals.totalCalories },
    protein: { target: targets.protein, current: currentTotals.macros.protein },
    carbs: { target: targets.carbs, current: currentTotals.macros.carbs },
    fat: { target: targets.fat, current: currentTotals.macros.fat },
    weight: { current: userProfile.currentWeight, target: userProfile.targetWeight }
  }

  const todaysMeals = currentTotals.meals || []

  // Categorize protein sources by efficiency
  const topTierProteins = proteinRecommendations.filter(p => p.efficiency < 6)
  const goodProteins = proteinRecommendations.filter(p => p.efficiency >= 6 && p.efficiency < 9)
  const moderateProteins = proteinRecommendations.filter(p => p.efficiency >= 9)

  // Dynamic supplement recommendations based on profile
  const supplements = [
    { name: 'Creatine', dose: '4g daily', timing: '2g pre/post workout', purpose: 'Strength & power', priority: 'high' },
    { name: 'Collagen', dose: 'Daily', timing: 'With vitamin C', purpose: 'Joint health', priority: 'high' },
    { name: 'B-Complex', dose: '1 tablet', timing: 'Morning', purpose: 'Energy metabolism', priority: 'medium' },
    { name: 'Omega-3', dose: 'Daily', timing: 'With meals', purpose: 'Anti-inflammatory', priority: 'medium' },
    { name: 'Magnesium L-Threonate', dose: '3 capsules', timing: 'Evening', purpose: 'Sleep & recovery', priority: 'medium' },
    { name: 'Vitamin D3', dose: '2000-4000 IU', timing: 'With fat', purpose: 'Bone health & immunity', priority: userProfile.goal === 'cut' ? 'high' : 'medium' },
    { name: 'Protein Powder', dose: '1-2 scoops', timing: 'Post-workout', purpose: 'Convenient protein', priority: nutritionTargets.protein.current < nutritionTargets.protein.target * 0.8 ? 'high' : 'low' }
  ].filter(s => s.priority === 'high' || s.priority === 'medium')

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100
    if (percentage < 50) return 'bg-red-500'
    if (percentage < 80) return 'bg-yellow-500'
    if (percentage > 120) return 'bg-orange-500'
    return 'bg-green-500'
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }
  
  const handleGenerateAIPlan = async (_prompt: string) => {
    setIsGeneratingPlan(true)
    
    // Simulate AI call - replace with actual API call
    setTimeout(() => {
      const insights = [
        `Based on your ${userProfile.currentWeight}lb weight and ${userProfile.goal} goal, I recommend increasing protein to ${Math.round(targets.protein * 1.1)}g on training days.`,
        "Consider timing 25g protein within 30 minutes post-workout for optimal recovery.",
        "Your vegetarian diet needs strategic B12 and iron monitoring - consider fortified foods."
      ]
      
      insights.forEach(insight => addAiInsight(insight))
      setIsGeneratingPlan(false)
    }, 2000)
  }
  
  const handleEditMeal = (meal: any) => {
    setEditingMeal(meal)
    setShowMealForm(true)
  }
  
  const handleDeleteMeal = (mealId: string) => {
    deleteMeal(mealId)
  }
  
  const formatMealTime = (time: string) => {
    const timeMap: { [key: string]: string } = {
      'breakfast': '🌅 Breakfast',
      'morning-snack': '☕ Morning Snack', 
      'lunch': '🥪 Lunch',
      'afternoon-snack': '🍎 Afternoon Snack',
      'pre-workout': '💪 Pre-Workout',
      'post-workout': '🥤 Post-Workout',
      'dinner': '🍽️ Dinner',
      'evening-snack': '🌙 Evening Snack'
    }
    return timeMap[time] || time
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Nutrition</h1>
        <p className="text-slate-600 mt-2">Vegetarian climbing nutrition optimized for performance and body composition</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai-planner">AI Planner</TabsTrigger>
          <TabsTrigger value="meal-plan">Meal Plan</TabsTrigger>
          <TabsTrigger value="protein-guide">Protein Guide</TabsTrigger>
          <TabsTrigger value="supplements">Supplements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {/* Daily Targets Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Calories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">{nutritionTargets.calories.current}</div>
                <p className="text-xs text-slate-500">of {nutritionTargets.calories.target} target</p>
                <div className="mt-2 bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(nutritionTargets.calories.current, nutritionTargets.calories.target)}`}
                    style={{ width: `${getProgressPercentage(nutritionTargets.calories.current, nutritionTargets.calories.target)}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Protein</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{nutritionTargets.protein.current}g</div>
                <p className="text-xs text-slate-500">of {nutritionTargets.protein.target}g target</p>
                <div className="mt-2 bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(nutritionTargets.protein.current, nutritionTargets.protein.target)}`}
                    style={{ width: `${getProgressPercentage(nutritionTargets.protein.current, nutritionTargets.protein.target)}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Carbs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">{nutritionTargets.carbs.current}g</div>
                <p className="text-xs text-slate-500">of {nutritionTargets.carbs.target}g target</p>
                <div className="mt-2 bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(nutritionTargets.carbs.current, nutritionTargets.carbs.target)}`}
                    style={{ width: `${getProgressPercentage(nutritionTargets.carbs.current, nutritionTargets.carbs.target)}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Weight Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{nutritionTargets.weight.current} lbs</div>
                <p className="text-xs text-slate-500">target: {nutritionTargets.weight.target} lbs</p>
                <p className="text-xs text-green-600 mt-1">-9 lbs to goal</p>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Alert */}
          {aiInsights.length > 0 && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Nutrition Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-blue-800">
                  {aiInsights.slice(0, 3).map((insight, index) => (
                    <li key={index}>• {insight}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          
          {/* Key Issues Alert */}
          {(nutritionTargets.protein.current < nutritionTargets.protein.target * 0.8 || 
            nutritionTargets.calories.current < nutritionTargets.calories.target * 0.7) && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-900 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Nutrition Action Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-red-800">
                  {nutritionTargets.protein.current < nutritionTargets.protein.target * 0.8 && (
                    <li>• <strong>Protein deficit:</strong> Currently {nutritionTargets.protein.current}g vs {nutritionTargets.protein.target}g target (-{Math.round(nutritionTargets.protein.target - nutritionTargets.protein.current)}g)</li>
                  )}
                  {nutritionTargets.calories.current < nutritionTargets.calories.target * 0.7 && (
                    <li>• <strong>Calorie intake too low:</strong> {nutritionTargets.calories.current} vs {nutritionTargets.calories.target} needed for performance</li>
                  )}
                  <li>• <strong>Focus on protein efficiency:</strong> Choose foods under 8 cal/g protein</li>
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Today's Meals */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Today's Meals</CardTitle>
                  <CardDescription>Track your daily nutrition progress</CardDescription>
                </div>
                <Button size="sm" className="flex items-center gap-2" onClick={() => setShowMealForm(true)}>
                  <Plus className="h-4 w-4" />
                  Log Meal
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaysMeals.length > 0 ? (
                  todaysMeals.map((meal, index) => (
                    <div key={meal.id || index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{formatMealTime(meal.time)}</h4>
                          <span className="text-xs text-slate-500">{new Date().toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{meal.name}</p>
                        {meal.notes && (
                          <p className="text-xs text-slate-500 mt-1">{meal.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{meal.protein}g protein</p>
                          <p className="text-sm text-slate-500">{meal.calories} cal</p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleEditMeal(meal)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteMeal(meal.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <div className="text-4xl mb-2">🍽️</div>
                    <p className="text-sm">No meals logged today</p>
                    <p className="text-xs">Start tracking your nutrition!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-planner" className="mt-6">
          <AIMealPlanner 
            onGeneratePlan={handleGenerateAIPlan}
            isGenerating={isGeneratingPlan}
          />
        </TabsContent>

        <TabsContent value="meal-plan" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Meal Template</CardTitle>
              <CardDescription>Optimized for 125g protein and 2300 calories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { time: 'Breakfast', protein: '30g', calories: '350', foods: 'Oatmeal (2/3 cup): 5g + Orgain protein (2 scoops): 21g + Blueberries' },
                  { time: 'Mid-Morning', protein: '16g', calories: '90', foods: 'Greek yogurt (0% fat): 16g' },
                  { time: 'Lunch', protein: '30g', calories: '400', foods: 'Lentil/chickpea pasta (1 cup): 25g + Vegetables' },
                  { time: 'Post-Workout', protein: '21g', calories: '160', foods: 'Orgain shake: 21g' },
                  { time: 'Dinner', protein: '30g', calories: '500', foods: 'Tofu (5oz): 12g + Quinoa (1 cup): 8g + Lentils (1/2 cup): 9g + Vegetables' },
                  { time: 'Evening', protein: '16g', calories: '90', foods: 'Greek yogurt: 16g' },
                ].map((meal, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{meal.time}</h3>
                      <div className="text-right">
                        <span className="text-green-600 font-medium">{meal.protein}</span>
                        <span className="text-slate-500 text-sm ml-2">{meal.calories} cal</span>
                      </div>
                    </div>
                    <p className="text-slate-700">{meal.foods}</p>
                  </div>
                ))}
                
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-900">Daily Total</h4>
                  <p className="text-green-800">143g protein, ~1,590 calories from protein sources</p>
                  <p className="text-sm text-green-700 mt-1">Remaining: 610-810 calories for healthy fats, additional carbs, vegetables</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protein-guide" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Protein Sources by Efficiency</CardTitle>
              <CardDescription>Ranked by calories per gram of protein (lower is better)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTierProteins.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-green-800 mb-3">Top Tier (Under 6 cal/g protein)</h3>
                    {topTierProteins.map((protein, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg mb-2">
                        <div>
                          <h4 className="font-medium">{protein.food}</h4>
                          <p className="text-sm text-slate-600">{protein.efficiency} cal/g protein</p>
                          <p className="text-xs text-green-700">{protein.notes}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{protein.protein}g protein</p>
                          <p className="text-sm text-slate-500">{protein.calories} calories</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {goodProteins.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-3">Good Options (6-8 cal/g protein)</h3>
                    {goodProteins.map((protein, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-2">
                        <div>
                          <h4 className="font-medium">{protein.food}</h4>
                          <p className="text-sm text-slate-600">{protein.efficiency} cal/g protein</p>
                          <p className="text-xs text-yellow-700">{protein.notes}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{protein.protein}g protein</p>
                          <p className="text-sm text-slate-500">{protein.calories} calories</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {moderateProteins.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-orange-800 mb-3">Moderate Options (8+ cal/g protein)</h3>
                    {moderateProteins.map((protein, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg mb-2">
                        <div>
                          <h4 className="font-medium">{protein.food}</h4>
                          <p className="text-sm text-slate-600">{protein.efficiency} cal/g protein</p>
                          <p className="text-xs text-orange-700">{protein.notes}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{protein.protein}g protein</p>
                          <p className="text-sm text-slate-500">{protein.calories} calories</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Avoid for Weight Loss (Over 10 cal/g protein)</h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Huel: 13.3 cal/g protein (meal replacement, not protein supplement)</li>
                    <li>• Most protein bars: 11.5+ cal/g protein</li>
                    <li>• Nuts/nut butters: 15-20 cal/g protein (good for healthy fats, not protein)</li>
                    <li>• Cheese: 12-15 cal/g protein (if including dairy)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supplements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplement Protocol</CardTitle>
              <CardDescription>Optimized for climbing performance and recovery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supplements.map((supplement, index) => (
                  <div key={index} className={`flex items-center justify-between p-4 border rounded-lg ${
                    supplement.priority === 'high' 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-slate-200'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{supplement.name}</h4>
                        {supplement.priority === 'high' && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            High Priority
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{supplement.purpose}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{supplement.dose}</p>
                      <p className="text-sm text-slate-500">{supplement.timing}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Optional Cognitive Support</h4>
                <p className="text-sm text-blue-800 mb-2">For desk work and mental clarity:</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Lion's Mane Mushroom:</strong> 500-1000mg daily</li>
                  <li>• <strong>L-Theanine:</strong> 100-200mg (pairs well with coffee)</li>
                  <li>• <strong>Rhodiola:</strong> 200-400mg for mental fatigue</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Meal Log Form */}
      {showMealForm && (
        <MealLogForm
          onClose={() => {
            setShowMealForm(false)
            setEditingMeal(null)
          }}
          editingMeal={editingMeal}
        />
      )}
    </div>
  )
}