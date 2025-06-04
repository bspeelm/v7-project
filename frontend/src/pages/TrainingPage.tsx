import { useState } from 'react'
import { Calendar, Target, Clock, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { GoalSelectionForm } from '@/components/training/GoalSelectionForm'

// Mock training plan data
const mockTrainingPlan = {
  name: 'V7 Power Development',
  startDate: '2025-06-01',
  endDate: '2025-08-31',
  currentWeek: 2,
  totalWeeks: 12,
  weeklyStructure: {
    monday: {
      type: 'strength',
      focus: ['Hangboard', 'Core strength'],
      duration: 90,
      intensity: 'high',
      notes: 'Max hangs protocol + weighted core work'
    },
    tuesday: {
      type: 'technique',
      focus: ['Footwork', 'Body positioning'],
      duration: 120,
      intensity: 'moderate',
      notes: 'Volume climbing on technical problems'
    },
    wednesday: {
      type: 'rest',
      focus: ['Recovery'],
      duration: 0,
      intensity: 'low',
      notes: 'Active recovery - yoga or light stretching'
    },
    thursday: {
      type: 'power',
      focus: ['Campus board', 'Dynamic moves'],
      duration: 90,
      intensity: 'high',
      notes: 'Campus ladders + limit bouldering'
    },
    friday: {
      type: 'endurance',
      focus: ['4x4s', 'Circuits'],
      duration: 120,
      intensity: 'moderate',
      notes: 'Power endurance circuits'
    },
    saturday: {
      type: 'technique',
      focus: ['Project work', 'Style variety'],
      duration: 180,
      intensity: 'moderate',
      notes: 'Outdoor climbing or gym projecting'
    },
    sunday: {
      type: 'rest',
      focus: ['Recovery'],
      duration: 0,
      intensity: 'low',
      notes: 'Complete rest or gentle movement'
    }
  }
}

const exercises = [
  {
    name: 'Max Hangs',
    description: '10-second hangs at 90% max load',
    sets: '5 sets',
    rest: '3 min between sets',
    notes: 'Use 20mm edge, add weight as needed'
  },
  {
    name: 'Campus Ladders',
    description: '1-3-5 progression on campus board',
    sets: '5 sets',
    rest: '5 min between sets',
    notes: 'Focus on control and precision'
  },
  {
    name: '4x4 Circuits',
    description: '4 problems, 4 times through',
    sets: '4 rounds',
    rest: '3 min between rounds',
    notes: 'Choose problems 1-2 grades below max'
  }
]

export function TrainingPage() {
  const [activeTab, setActiveTab] = useState('current-week')
  const [completedSessions, setCompletedSessions] = useState<Set<string>>(new Set())
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [currentPlan, setCurrentPlan] = useState(mockTrainingPlan)

  const getDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1)
  }

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'moderate': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'strength': return '💪'
      case 'power': return '⚡'
      case 'endurance': return '🔋'
      case 'technique': return '🎯'
      case 'rest': return '😴'
      default: return '🧗'
    }
  }

  const handleMarkComplete = (day: string) => {
    setCompletedSessions(prev => new Set([...prev, day]))
  }

  const handleGenerateNewPlan = () => {
    setShowGoalForm(true)
  }

  const handleGoalSubmit = async (goals: any) => {
    setIsGeneratingPlan(true)
    setShowGoalForm(false)
    
    try {
      // Simulate AI API call with user goals as context
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Generate a new plan based on goals (in real app, this would call AI API)
      const newPlan = {
        name: `${goals.targetGrade} ${goals.climbingStyle} Training`,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currentWeek: 1,
        totalWeeks: 12,
        weeklyStructure: generateWeeklyPlan(goals)
      }
      
      setCurrentPlan(newPlan)
      alert(`✅ New ${goals.targetGrade} training plan generated based on your goals!\n\nFocus: ${goals.focusAreas || 'General improvement'}\nTimeframe: ${goals.timeframe.replace('_', ' ')}\nWeekly hours: ${goals.weeklyHours}`)
    } catch (error) {
      alert('Failed to generate plan. Please try again.')
    } finally {
      setIsGeneratingPlan(false)
    }
  }

  const generateWeeklyPlan = (goals: any) => {
    // Simple logic to generate plan based on goals
    const basePlan = { ...mockTrainingPlan.weeklyStructure }
    
    // Customize based on goals
    if (goals.focusAreas.includes('strength') || goals.focusAreas.includes('finger')) {
      basePlan.monday.focus = ['Hangboard', 'Max strength']
      basePlan.wednesday.focus = ['Campus board', 'Power development']
    }
    
    if (goals.focusAreas.includes('endurance')) {
      basePlan.friday.focus = ['4x4s', 'Power endurance', 'Long routes']
      basePlan.friday.duration = Math.min(goals.weeklyHours * 60 / 4, 180)
    }
    
    return basePlan
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Training Plan</h1>
        <p className="text-slate-600 mt-2">Your personalized path to V7</p>
      </div>

      {/* Plan Overview */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {currentPlan.name}
              </CardTitle>
              <CardDescription>
                Week {currentPlan.currentWeek} of {currentPlan.totalWeeks}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={handleGenerateNewPlan}
              disabled={isGeneratingPlan}
            >
              {isGeneratingPlan ? 'Generating...' : 'Generate New Plan'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="text-sm">
                {new Date(mockTrainingPlan.startDate).toLocaleDateString()} - 
                {new Date(mockTrainingPlan.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-slate-500" />
              <span className="text-sm">
                {Math.round((mockTrainingPlan.currentWeek / mockTrainingPlan.totalWeeks) * 100)}% complete
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-slate-500" />
              <span className="text-sm">Goal: V7 Boulder</span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="bg-slate-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(mockTrainingPlan.currentWeek / mockTrainingPlan.totalWeeks) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current-week">Current Week</TabsTrigger>
          <TabsTrigger value="exercises">Exercise Library</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="current-week" className="mt-6">
          <div className="grid gap-4">
            {Object.entries(currentPlan.weeklyStructure).map(([day, session]) => (
              <Card key={day}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getTypeIcon(session.type)}</span>
                      <div>
                        <CardTitle className="text-lg">{getDayName(day)}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getIntensityColor(session.intensity)}`}>
                            {session.intensity}
                          </span>
                          {session.duration > 0 && (
                            <span className="flex items-center gap-1 text-xs">
                              <Clock className="h-3 w-3" />
                              {session.duration} min
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleMarkComplete(day)}
                      disabled={completedSessions.has(day)}
                    >
                      {completedSessions.has(day) ? '✓ Completed' : 'Mark Complete'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-1">Focus Areas</h4>
                      <div className="flex flex-wrap gap-1">
                        {session.focus.map((focus, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                          >
                            {focus}
                          </span>
                        ))}
                      </div>
                    </div>
                    {session.notes && (
                      <div>
                        <h4 className="font-medium mb-1">Notes</h4>
                        <p className="text-sm text-slate-600">{session.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="exercises" className="mt-6">
          <div className="grid gap-4">
            {exercises.map((exercise, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                  <CardDescription>{exercise.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 md:grid-cols-3">
                    <div>
                      <span className="text-sm font-medium">Sets: </span>
                      <span className="text-sm text-slate-600">{exercise.sets}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Rest: </span>
                      <span className="text-sm text-slate-600">{exercise.rest}</span>
                    </div>
                    <div className="md:col-span-1">
                      <span className="text-sm font-medium">Notes: </span>
                      <span className="text-sm text-slate-600">{exercise.notes}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Training Progress</CardTitle>
              <CardDescription>Track your improvement over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-medium mb-2">Progress tracking coming soon</h3>
                <p className="text-slate-600">We're building detailed analytics to help you visualize your improvement.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Goal Selection Form Modal */}
      {showGoalForm && (
        <GoalSelectionForm
          onSubmit={handleGoalSubmit}
          onCancel={() => setShowGoalForm(false)}
        />
      )}
    </div>
  )
}