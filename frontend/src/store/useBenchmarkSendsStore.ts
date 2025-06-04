import { create } from 'zustand'
import type { BenchmarkSend } from '@/types'

interface BenchmarkSendsState {
  benchmarkSends: BenchmarkSend[]
  selectedSend: BenchmarkSend | null
  addBenchmarkSend: (send: Omit<BenchmarkSend, 'id' | 'userId' | 'createdAt'>) => void
  setBenchmarkSends: (sends: BenchmarkSend[]) => void
  setSelectedSend: (send: BenchmarkSend | null) => void
  removeBenchmarkSend: (id: string) => void
  updateBenchmarkSend: (id: string, updates: Partial<BenchmarkSend>) => void
}

// Mock data for development
const mockBenchmarkSends: BenchmarkSend[] = [
  {
    id: '1',
    userId: 'dev-user-1',
    grade: 'V5',
    gradeNumeric: 5,
    gradeType: 'v-scale',
    name: 'The Roof',
    location: 'Brooklyn Boulders',
    date: '2025-05-28',
    type: 'indoor',
    style: 'overhang',
    attempts: 12,
    notes: 'Finally sent this after weeks of work! The key was better hip positioning and trusting my feet on the small holds. This was a major breakthrough for my overhang climbing.',
    significance: 'breakthrough',
    createdAt: '2025-05-28T18:30:00Z'
  },
  {
    id: '2',
    userId: 'dev-user-1',
    grade: 'V4',
    gradeNumeric: 4,
    gradeType: 'v-scale',
    name: 'Crimpy Paradise',
    location: 'Local Gym',
    date: '2025-06-01',
    type: 'indoor',
    style: 'vertical',
    attempts: 8,
    notes: 'Great crimp strength workout. This climb really tested my finger strength and body positioning. Felt strong and confident.',
    significance: 'personal-best',
    createdAt: '2025-06-01T19:15:00Z'
  },
  {
    id: '3',
    userId: 'dev-user-1',
    grade: 'V6',
    gradeNumeric: 6,
    gradeType: 'v-scale',
    name: 'Balance Act',
    location: 'Brooklyn Boulders',
    date: '2025-06-03',
    type: 'indoor',
    style: 'slab',
    attempts: 15,
    notes: 'My first V6! This slab really pushed my balance and footwork. The moves felt impossible at first but breaking it down section by section helped.',
    significance: 'milestone',
    createdAt: '2025-06-03T17:45:00Z'
  },
  {
    id: '4',
    userId: 'dev-user-1',
    grade: '5.11a',
    gradeNumeric: 110,
    gradeType: 'yds',
    name: 'Sport Route Classic',
    location: 'Red Rocks',
    date: '2025-05-15',
    type: 'outdoor',
    style: 'vertical',
    attempts: 6,
    notes: 'First outdoor sport route! The sustained nature really challenged my endurance. Great intro to outdoor climbing.',
    significance: 'milestone',
    createdAt: '2025-05-15T14:20:00Z'
  }
]

export const useBenchmarkSendsStore = create<BenchmarkSendsState>((set) => ({
  benchmarkSends: mockBenchmarkSends,
  selectedSend: null,
  
  addBenchmarkSend: (sendData) => {
    const newSend: BenchmarkSend = {
      ...sendData,
      id: Date.now().toString(),
      userId: 'dev-user-1', // In real app, get from auth
      createdAt: new Date().toISOString(),
    }
    
    set((state) => ({
      benchmarkSends: [newSend, ...state.benchmarkSends]
    }))
  },
  
  setBenchmarkSends: (sends) => set({ benchmarkSends: sends }),
  
  setSelectedSend: (send) => set({ selectedSend: send }),
  
  removeBenchmarkSend: (id) => {
    set((state) => ({
      benchmarkSends: state.benchmarkSends.filter(send => send.id !== id)
    }))
  },
  
  updateBenchmarkSend: (id, updates) => {
    set((state) => ({
      benchmarkSends: state.benchmarkSends.map(send =>
        send.id === id ? { ...send, ...updates } : send
      )
    }))
  },
}))