import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Header } from '@/components/layout/Header'
import { useAuthStore } from '@/store/useAuthStore'

// Pages
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ChatPage } from '@/pages/ChatPage'
import { JournalPage } from '@/pages/JournalPage'
import { TrainingPage } from '@/pages/TrainingPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { NutritionPage } from '@/pages/NutritionPage'
import { BenchmarkSendsPage } from '@/pages/BenchmarkSendsPage'
import { LandingPage } from '@/pages/LandingPage'

const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/chat" element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } />
              <Route path="/journal" element={
                <ProtectedRoute>
                  <JournalPage />
                </ProtectedRoute>
              } />
              <Route path="/training" element={
                <ProtectedRoute>
                  <TrainingPage />
                </ProtectedRoute>
              } />
              <Route path="/nutrition" element={
                <ProtectedRoute>
                  <NutritionPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/benchmark-sends" element={
                <ProtectedRoute>
                  <BenchmarkSendsPage />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App