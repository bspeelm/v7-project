import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { TrendingUp, Calendar, Target, Activity, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/useAuthStore'
import { useBenchmarkSendsStore } from '@/store/useBenchmarkSendsStore'
import { AddBenchmarkSendForm } from '@/components/benchmark/AddBenchmarkSendForm'
import { BenchmarkSendModal } from '@/components/benchmark/BenchmarkSendModal'

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const { benchmarkSends, addBenchmarkSend, selectedSend, setSelectedSend } = useBenchmarkSendsStore()
  const [showAddForm, setShowAddForm] = useState(false)

  // Get highest grade for stats
  const highestGradeSend = benchmarkSends.length > 0 
    ? benchmarkSends.reduce((max, send) => 
        send.gradeNumeric > max.gradeNumeric ? send : max
      )
    : { grade: 'V0', gradeNumeric: 0 }

  // Mock data - replace with API calls
  const stats = {
    sessionsThisWeek: 4,
    highestGrade: highestGradeSend.grade,
    successRate: 65,
    daysToGoal: 180,
  }

  // Get the most recent 3 benchmark sends
  const recentBenchmarkSends = benchmarkSends
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  const getRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays} days ago`
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
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

  const handleAddSend = (sendData: any) => {
    addBenchmarkSend(sendData)
    setShowAddForm(false)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-slate-600 mt-2">Here's your climbing progress at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions This Week</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.sessionsThisWeek}</div>
            <p className="text-xs text-slate-500">+1 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Grade</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.highestGrade}</div>
            <p className="text-xs text-slate-500">Indoor bouldering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.successRate}%</div>
            <p className="text-xs text-slate-500">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days to V7</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.daysToGoal}</div>
            <p className="text-xs text-slate-500">Keep crushing!</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Benchmark Sends</CardTitle>
                <CardDescription>Your most significant climbs</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Send
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBenchmarkSends.length > 0 ? (
                recentBenchmarkSends.map((send) => (
                  <div 
                    key={send.id} 
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedSend(send)}
                  >
                    <div>
                      <p className="font-medium">{send.name}</p>
                      <p className="text-sm text-slate-500">{send.grade} • {getRelativeDate(send.date)}</p>
                      <p className="text-xs text-slate-400">{send.location}</p>
                    </div>
                    <div className="text-2xl">{getSignificanceIcon(send.significance)}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <div className="text-4xl mb-2">🎯</div>
                  <p className="text-sm">No benchmark sends yet</p>
                  <p className="text-xs">Add your first significant send!</p>
                </div>
              )}
            </div>
            {recentBenchmarkSends.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <a href="/benchmark-sends" className="text-sm text-green-600 hover:text-green-700">
                  View all benchmark sends →
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump right back into your training</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a href="/journal" className="block p-4 rounded-lg border hover:bg-slate-50 transition-colors">
                <h4 className="font-medium">Log Today's Session</h4>
                <p className="text-sm text-slate-500">Record your climbs and progress</p>
              </a>
              <a href="/chat" className="block p-4 rounded-lg border hover:bg-slate-50 transition-colors">
                <h4 className="font-medium">Ask Your Coach</h4>
                <p className="text-sm text-slate-500">Get personalized advice</p>
              </a>
              <a href="/training" className="block p-4 rounded-lg border hover:bg-slate-50 transition-colors">
                <h4 className="font-medium">View Training Plan</h4>
                <p className="text-sm text-slate-500">See what's on deck</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Benchmark Send Form */}
      {showAddForm && (
        <AddBenchmarkSendForm
          onSubmit={handleAddSend}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Benchmark Send Details Modal */}
      <BenchmarkSendModal
        send={selectedSend}
        onClose={() => setSelectedSend(null)}
      />
    </div>
  )
}