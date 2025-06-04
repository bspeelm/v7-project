import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuthStore } from '@/store/useAuthStore'
import { Code } from 'lucide-react'

export function DevLogin() {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const setToken = useAuthStore((state) => state.setToken)

  // Only show in development
  if (import.meta.env.PROD) {
    return null
  }

  const devLogin = () => {
    // Set mock user data for development
    setUser({
      id: 'dev-user-1',
      email: 'dev@v7project.com',
      name: 'Dev User',
      createdAt: new Date().toISOString(),
      subscription: {
        tier: 'premium',
        status: 'active',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      },
      preferences: {
        units: 'imperial',
        timezone: 'America/New_York',
      },
    })
    setToken('dev-token-123')
    navigate('/dashboard')
  }

  return (
    <Card className="w-full max-w-md border-orange-200 bg-orange-50">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Code className="h-8 w-8 text-orange-600" />
        </div>
        <CardTitle className="text-orange-900">Development Mode</CardTitle>
        <CardDescription className="text-orange-700">
          Quick login for development only
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={devLogin}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        >
          Dev Login (Premium User)
        </Button>
        <p className="text-xs text-orange-600 mt-2 text-center">
          This button only appears in development mode
        </p>
      </CardContent>
    </Card>
  )
}