import { useState } from 'react'
import { Plus, Search, Filter, Calendar, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { useBenchmarkSendsStore } from '@/store/useBenchmarkSendsStore'
import { AddBenchmarkSendForm } from '@/components/benchmark/AddBenchmarkSendForm'
import { BenchmarkSendModal } from '@/components/benchmark/BenchmarkSendModal'

export function BenchmarkSendsPage() {
  const { benchmarkSends, addBenchmarkSend, selectedSend, setSelectedSend } = useBenchmarkSendsStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [significanceFilter, setSignificanceFilter] = useState('all')

  // Filter and search logic
  const filteredSends = benchmarkSends.filter(send => {
    const matchesSearch = send.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         send.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         send.notes.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesGrade = gradeFilter === 'all' || send.grade === gradeFilter
    const matchesType = typeFilter === 'all' || send.type === typeFilter
    const matchesSignificance = significanceFilter === 'all' || send.significance === significanceFilter

    return matchesSearch && matchesGrade && matchesType && matchesSignificance
  }).sort((a, b) => {
    // Sort by grade (highest first), then by date (newest first)
    if (a.gradeNumeric !== b.gradeNumeric) {
      return b.gradeNumeric - a.gradeNumeric
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  // Get unique values for filters - sort by numeric value
  const uniqueGrades = [...new Set(benchmarkSends.map(send => send.grade))]
    .sort((a, b) => {
      // Extract numeric values for proper sorting
      const aMatch = a.match(/\d+/)
      const bMatch = b.match(/\d+/)
      const aNum = aMatch ? parseInt(aMatch[0]) : 0
      const bNum = bMatch ? parseInt(bMatch[0]) : 0
      return aNum - bNum
    })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'breakthrough': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'milestone': return 'bg-green-100 text-green-800 border-green-200'
      case 'personal-best': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'project-send': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getStyleIcon = (style: string) => {
    switch (style) {
      case 'slab': return '📐'
      case 'vertical': return '🧱'
      case 'overhang': return '🏔️'
      case 'roof': return '🏠'
      default: return '🧗'
    }
  }

  const handleAddSend = (sendData: any) => {
    addBenchmarkSend(sendData)
    setShowAddForm(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Benchmark Sends</h1>
          <p className="text-slate-600 mt-2">Your most significant climbing achievements</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="h-4 w-4" />
          Add Benchmark Send
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search sends, locations, notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
                <option value="all">All Grades</option>
                {uniqueGrades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </Select>
            </div>
            
            <div>
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">All Types</option>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
              </Select>
            </div>
            
            <div>
              <Select value={significanceFilter} onChange={(e) => setSignificanceFilter(e.target.value)}>
                <option value="all">All Significance</option>
                <option value="breakthrough">Breakthrough</option>
                <option value="milestone">Milestone</option>
                <option value="personal-best">Personal Best</option>
                <option value="project-send">Project Send</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-700">{benchmarkSends.length}</div>
            <p className="text-xs text-slate-500">Total Benchmark Sends</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-700">
              {benchmarkSends.reduce((max, send) => 
                send.gradeNumeric > max.gradeNumeric ? send : max
              , benchmarkSends[0] || { grade: 'N/A', gradeNumeric: 0 }).grade}
            </div>
            <p className="text-xs text-slate-500">Highest Grade</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-700">
              {benchmarkSends.filter(s => s.significance === 'breakthrough').length}
            </div>
            <p className="text-xs text-slate-500">Breakthroughs</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-700">
              {benchmarkSends.filter(s => s.type === 'outdoor').length}
            </div>
            <p className="text-xs text-slate-500">Outdoor Sends</p>
          </CardContent>
        </Card>
      </div>

      {/* Benchmark Sends List */}
      {filteredSends.length > 0 ? (
        <div className="grid gap-4">
          {filteredSends.map((send) => (
            <Card 
              key={send.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedSend(send)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getSignificanceIcon(send.significance)}</span>
                      <div>
                        <h3 className="text-lg font-semibold">{send.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="font-medium text-green-600">{send.grade}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(send.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {send.location}
                          </span>
                          <span className="flex items-center gap-1">
                            {getStyleIcon(send.style)}
                            {send.style}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {send.notes && (
                      <p className="text-sm text-slate-700 line-clamp-2 mb-3">
                        {send.notes}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs border ${getSignificanceColor(send.significance)}`}>
                        {send.significance.replace('-', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        send.type === 'outdoor' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {send.type === 'outdoor' ? '🏔️ Outdoor' : '🏢 Indoor'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {send.attempts} attempt{send.attempts !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-medium mb-2">
              {searchTerm || gradeFilter !== 'all' || typeFilter !== 'all' || significanceFilter !== 'all'
                ? 'No sends match your filters'
                : 'No benchmark sends yet'
              }
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || gradeFilter !== 'all' || typeFilter !== 'all' || significanceFilter !== 'all'
                ? 'Try adjusting your search criteria'
                : 'Start tracking your most significant climbing achievements'
              }
            </p>
            {!(searchTerm || gradeFilter !== 'all' || typeFilter !== 'all' || significanceFilter !== 'all') && (
              <Button onClick={() => setShowAddForm(true)}>Add Your First Benchmark Send</Button>
            )}
          </CardContent>
        </Card>
      )}

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