import { Link } from 'react-router-dom'
import { Target, Brain, TrendingUp, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function LandingPage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Your AI-Powered</span>
                  <span className="block text-green-600">Climbing Coach</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Personalized training plans, real-time coaching, and progress tracking to help you crush your climbing goals. From V0 to V15, we've got you covered.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link to="/signup">
                      <Button size="lg" className="w-full">
                        Start Free Trial
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link to="/login">
                      <Button variant="outline" size="lg" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to climb stronger
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                    <Brain className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">AI-Powered Coaching</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Get personalized advice based on your profile, goals, and training history. Our AI coach adapts to your needs.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                    <Target className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Goal-Oriented Training</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Set specific goals and receive customized training plans designed to get you there efficiently and safely.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Progress Tracking</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Track your sends, monitor your progress, and visualize your improvement with detailed analytics.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                    <Shield className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Injury Prevention</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Learn proper techniques and recovery protocols to climb harder while staying healthy and injury-free.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-gray-100">
        <div className="pt-12 sm:pt-16 lg:pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Choose the plan that fits your climbing journey
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 bg-white pb-16 sm:mt-12 sm:pb-20 lg:pb-28">
          <div className="relative">
            <div className="absolute inset-0 h-1/2 bg-gray-100"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
                {/* Free Plan */}
                <div className="flex flex-col rounded-lg shadow-lg overflow-hidden">
                  <div className="px-6 py-8 bg-white">
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900">Free</h3>
                      <p className="mt-4 text-sm text-gray-500">Perfect for getting started</p>
                      <p className="mt-8">
                        <span className="text-4xl font-extrabold text-gray-900">$0</span>
                        <span className="text-base font-medium text-gray-500">/month</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col px-6 pt-6 pb-8 bg-gray-50">
                    <ul className="space-y-4 flex-1">
                      <li className="flex items-start">
                        <p className="text-sm text-gray-700">3 journal entries per week</p>
                      </li>
                      <li className="flex items-start">
                        <p className="text-sm text-gray-700">Basic AI coaching (10 messages/month)</p>
                      </li>
                      <li className="flex items-start">
                        <p className="text-sm text-gray-700">Progress tracking</p>
                      </li>
                    </ul>
                    <div className="mt-8">
                      <Link to="/signup">
                        <Button variant="outline" className="w-full">Get started</Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Pro Plan */}
                <div className="flex flex-col rounded-lg shadow-lg overflow-hidden">
                  <div className="px-6 py-8 bg-white">
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900">Pro</h3>
                      <p className="mt-4 text-sm text-gray-500">For serious climbers</p>
                      <p className="mt-8">
                        <span className="text-4xl font-extrabold text-gray-900">$9.99</span>
                        <span className="text-base font-medium text-gray-500">/month</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col px-6 pt-6 pb-8 bg-gray-50">
                    <ul className="space-y-4 flex-1">
                      <li className="flex items-start">
                        <p className="text-sm text-gray-700">Unlimited journal entries</p>
                      </li>
                      <li className="flex items-start">
                        <p className="text-sm text-gray-700">100 AI coaching messages/month</p>
                      </li>
                      <li className="flex items-start">
                        <p className="text-sm text-gray-700">Advanced analytics</p>
                      </li>
                      <li className="flex items-start">
                        <p className="text-sm text-gray-700">Training plan generation</p>
                      </li>
                      <li className="flex items-start">
                        <p className="text-sm text-gray-700">5GB media storage</p>
                      </li>
                    </ul>
                    <div className="mt-8">
                      <Link to="/signup">
                        <Button className="w-full">Start free trial</Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Premium Plan */}
                <div className="flex flex-col rounded-lg shadow-lg overflow-hidden">
                  <div className="px-6 py-8 bg-white">
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900">Premium</h3>
                      <p className="mt-4 text-sm text-gray-500">For peak performance</p>
                      <p className="mt-8">
                        <span className="text-4xl font-extrabold text-gray-900">$19.99</span>
                        <span className="text-base font-medium text-gray-500">/month</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col px-6 pt-6 pb-8 bg-gray-50">
                    <ul className="space-y-4 flex-1">
                      <li className="flex items-start">
                        <p className="text-sm text-gray-700">Everything in Pro</p>
                      </li>
                      <li className="flex items-start">
                        <p className="text-sm text-gray-700">Unlimited AI coaching</p>
                      </li>
                      <li className="flex items-start">
                        <p className="text-sm text-gray-700">Video analysis</p>
                      </li>
                      <li className="flex items-start">
                        <p className="text-sm text-gray-700">Custom training plans</p>
                      </li>
                      <li className="flex items-start">
                        <p className="text-sm text-gray-700">20GB media storage</p>
                      </li>
                      <li className="flex items-start">
                        <p className="text-sm text-gray-700">API access</p>
                      </li>
                    </ul>
                    <div className="mt-8">
                      <Link to="/signup">
                        <Button className="w-full">Start free trial</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to climb stronger?</span>
            <span className="block">Start your free trial today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-green-200">
            Join thousands of climbers who are crushing their goals with AI-powered coaching.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="mt-8">
              Get started for free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}