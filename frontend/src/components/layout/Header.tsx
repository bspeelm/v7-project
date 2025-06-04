import { Link, useLocation } from 'react-router-dom'
import { Mountain, Menu, X, User, LogOut, ChevronDown, Settings, TrendingUp, Target } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Mock athlete data - would come from API
  const athleteData = {
    currentGrades: {
      indoor: { slab: 'V6', overhang: 'V4' },
      outdoor: { boulder: 'V3' }
    },
    physicalStats: {
      age: 42,
      weight: 174,
      targetWeight: 165,
      experience: '3 years'
    },
    goals: [
      { grade: 'V7', type: 'boulder', targetDate: '2025-12-31' }
    ],
    strengths: ['Technical footwork', 'Route reading', 'Endurance'],
    weaknesses: ['Overhang climbing', 'Dynamic moves', 'Core tension']
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Chat', href: '/chat' },
    { name: 'Journal', href: '/journal' },
    { name: 'Benchmark Sends', href: '/benchmark-sends' },
    { name: 'Training', href: '/training' },
    { name: 'Nutrition', href: '/nutrition' },
    { name: 'Profile', href: '/profile' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between py-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Mountain className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-slate-900">V7 Project</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {user && navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-green-600',
                  isActive(item.href)
                    ? 'text-green-600'
                    : 'text-slate-700'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    <User className="h-5 w-5 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">{user.name}</span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                      {user.subscription.tier}
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  </button>

                  {/* User Dropdown */}
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                      <Card className="border-0 shadow-none">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Athlete Profile</CardTitle>
                          <CardDescription>
                            {athleteData.physicalStats.age} years old • {athleteData.physicalStats.experience} climbing experience
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Current Performance */}
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-1">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              Current Grades
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="bg-slate-50 p-2 rounded">
                                <span className="text-slate-600">Indoor Slab:</span>
                                <span className="font-medium ml-1">{athleteData.currentGrades.indoor.slab}</span>
                              </div>
                              <div className="bg-slate-50 p-2 rounded">
                                <span className="text-slate-600">Indoor Overhang:</span>
                                <span className="font-medium ml-1">{athleteData.currentGrades.indoor.overhang}</span>
                              </div>
                              <div className="bg-slate-50 p-2 rounded col-span-2">
                                <span className="text-slate-600">Outdoor Boulder:</span>
                                <span className="font-medium ml-1">{athleteData.currentGrades.outdoor.boulder}</span>
                              </div>
                            </div>
                          </div>

                          {/* Goals */}
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-1">
                              <Target className="h-4 w-4 text-green-600" />
                              Primary Goal
                            </h4>
                            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                              <p className="text-green-800 font-medium">
                                {athleteData.goals[0].grade} {athleteData.goals[0].type}
                              </p>
                              <p className="text-green-700 text-sm">
                                Target: {new Date(athleteData.goals[0].targetDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* Physical Stats */}
                          <div>
                            <h4 className="font-medium mb-2">Physical Stats</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-slate-600">Weight:</span>
                                <span className="font-medium ml-1">{athleteData.physicalStats.weight} lbs</span>
                              </div>
                              <div>
                                <span className="text-slate-600">Goal:</span>
                                <span className="font-medium ml-1">{athleteData.physicalStats.targetWeight} lbs</span>
                              </div>
                            </div>
                          </div>

                          {/* Strengths & Weaknesses */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <h5 className="font-medium text-green-700 mb-1">Strengths</h5>
                              <ul className="space-y-1">
                                {athleteData.strengths.slice(0, 2).map((strength, index) => (
                                  <li key={index} className="text-green-600 text-xs">• {strength}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium text-orange-700 mb-1">Focus Areas</h5>
                              <ul className="space-y-1">
                                {athleteData.weaknesses.slice(0, 2).map((weakness, index) => (
                                  <li key={index} className="text-orange-600 text-xs">• {weakness}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-3 border-t border-slate-200 space-y-2">
                            <Link
                              to="/profile"
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md"
                              onClick={() => setShowUserDropdown(false)}
                            >
                              <Settings className="h-4 w-4" />
                              Edit Profile & Settings
                            </Link>
                            <button
                              onClick={() => {
                                logout()
                                setShowUserDropdown(false)
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                            >
                              <LogOut className="h-4 w-4" />
                              Logout
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-slate-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 pt-4 pb-3">
            {user && (
              <>
                <div className="px-2 pb-3 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'block px-3 py-2 rounded-md text-base font-medium',
                        isActive(item.href)
                          ? 'bg-green-50 text-green-600'
                          : 'text-slate-700 hover:bg-slate-50'
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="border-t border-slate-200 pt-4 px-2">
                  <div className="flex items-center px-3 py-2">
                    <User className="h-5 w-5 text-slate-600 mr-2" />
                    <span className="text-base font-medium text-slate-700">{user.name}</span>
                    <span className="ml-2 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                      {user.subscription.tier}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                    className="mt-2 w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md flex items-center"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </button>
                </div>
              </>
            )}
            {!user && (
              <div className="px-2 space-y-1">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}