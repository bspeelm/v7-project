import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { TrendingUp, Calendar, Target, Activity } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  // Mock data - replace with API calls
  const stats = {
    sessionsThisWeek: 4,
    highestGrade: 'V5',
    successRate: 65,
    daysToGoal: 180,
  }

  const recentSends = [
    { grade: 'V4', name: 'Crimpy Paradise', date: '2 days ago' },
    { grade: 'V5', name: 'The Roof', date: '5 days ago' },
    { grade: 'V3', name: 'Balance Act', date: '1 week ago' },
  ]

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
            <CardTitle>Recent Sends</CardTitle>
            <CardDescription>Your latest successful climbs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSends.map((send, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{send.name}</p>
                    <p className="text-sm text-slate-500">{send.grade} • {send.date}</p>
                  </div>
                  <div className="text-2xl">🎯</div>
                </div>
              ))}
            </div>
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
    </div>
  )
}