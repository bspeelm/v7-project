import { useState } from 'react'
import { Utensils } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Modal } from '@/components/ui/Modal'
import { useNutritionStore } from '@/store/useNutritionStore'

interface MealLogFormProps {
  onClose: () => void
  editingMeal?: any // If editing existing meal
}

const mealTimeOptions = [
  { value: 'breakfast', label: '🌅 Breakfast' },
  { value: 'morning-snack', label: '☕ Morning Snack' },
  { value: 'lunch', label: '🥪 Lunch' },
  { value: 'afternoon-snack', label: '🍎 Afternoon Snack' },
  { value: 'pre-workout', label: '💪 Pre-Workout' },
  { value: 'post-workout', label: '🥤 Post-Workout' },
  { value: 'dinner', label: '🍽️ Dinner' },
  { value: 'evening-snack', label: '🌙 Evening Snack' }
]

// Common foods with nutrition data for quick logging
const commonFoods = [
  { name: 'Greek Yogurt (1 cup)', protein: 16, carbs: 9, fat: 0, calories: 90 },
  { name: 'Orgain Protein (1 scoop)', protein: 21, carbs: 15, fat: 3, calories: 160 },
  { name: 'Oatmeal (2/3 cup dry)', protein: 5, carbs: 54, fat: 3, calories: 300 },
  { name: 'Banana (medium)', protein: 1, carbs: 27, fat: 0, calories: 105 },
  { name: 'Almond Butter (2 tbsp)', protein: 7, carbs: 7, fat: 19, calories: 190 },
  { name: 'Tofu (4 oz)', protein: 12, carbs: 3, fat: 6, calories: 94 },
  { name: 'Lentils (1 cup cooked)', protein: 18, carbs: 40, fat: 1, calories: 230 },
  { name: 'Quinoa (1 cup cooked)', protein: 8, carbs: 39, fat: 4, calories: 222 },
  { name: 'Tempeh (3 oz)', protein: 16, carbs: 9, fat: 9, calories: 160 },
  { name: 'Seitan (3 oz)', protein: 21, carbs: 4, fat: 1, calories: 100 }
]

export function MealLogForm({ onClose, editingMeal }: MealLogFormProps) {
  const { logMeal, updateMeal } = useNutritionStore()
  
  const [formData, setFormData] = useState({
    name: editingMeal?.name || '',
    time: editingMeal?.time || 'breakfast',
    calories: editingMeal?.calories || 0,
    protein: editingMeal?.protein || 0,
    carbs: editingMeal?.carbs || 0,
    fat: editingMeal?.fat || 0,
    notes: editingMeal?.notes || ''
  })
  
  const [selectedFood, setSelectedFood] = useState('')

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFoodSelect = (foodName: string) => {
    const food = commonFoods.find(f => f.name === foodName)
    if (food) {
      setFormData(prev => ({
        ...prev,
        name: prev.name ? `${prev.name}, ${food.name}` : food.name,
        calories: prev.calories + food.calories,
        protein: prev.protein + food.protein,
        carbs: prev.carbs + food.carbs,
        fat: prev.fat + food.fat
      }))
    }
    setSelectedFood('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingMeal) {
      updateMeal(editingMeal.id, formData)
    } else {
      logMeal(formData)
    }
    
    onClose()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      time: 'breakfast',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      notes: ''
    })
  }

  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-2xl w-full mx-4">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b pr-16">
        <div className="flex items-center gap-3">
          <Utensils className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-bold">
            {editingMeal ? 'Edit Meal' : 'Log Meal'}
          </h2>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Quick Add Section */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-900 mb-3">Quick Add Common Foods</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <Select
              value={selectedFood}
              onChange={(e) => handleFoodSelect(e.target.value)}
            >
              <option value="">Select a food to add...</option>
              {commonFoods.map((food) => (
                <option key={food.name} value={food.name}>
                  {food.name} ({food.protein}g protein)
                </option>
              ))}
            </Select>
            <Button type="button" variant="outline" onClick={resetForm}>
              Reset Form
            </Button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Food/Meal Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Protein smoothie, Quinoa bowl"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="time">Meal Time</Label>
            <Select
              id="time"
              value={formData.time}
              onChange={(e) => handleChange('time', e.target.value)}
            >
              {mealTimeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Nutrition Info */}
        <div>
          <h3 className="font-medium mb-3">Nutrition Information</h3>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            <div>
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                min="0"
                value={formData.calories}
                onChange={(e) => handleChange('calories', parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                min="0"
                step="0.1"
                value={formData.protein}
                onChange={(e) => handleChange('protein', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                min="0"
                step="0.1"
                value={formData.carbs}
                onChange={(e) => handleChange('carbs', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <Label htmlFor="fat">Fat (g)</Label>
              <Input
                id="fat"
                type="number"
                min="0"
                step="0.1"
                value={formData.fat}
                onChange={(e) => handleChange('fat', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="How did you feel after eating? Timing relative to workout, etc."
            rows={3}
          />
        </div>

        {/* Nutrition Summary */}
        {(formData.calories > 0 || formData.protein > 0) && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="font-medium mb-2">Nutrition Summary</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              <div>
                <span className="text-slate-600">Calories:</span>
                <span className="font-medium ml-1">{formData.calories}</span>
              </div>
              <div>
                <span className="text-slate-600">Protein:</span>
                <span className="font-medium ml-1">{formData.protein}g</span>
              </div>
              <div>
                <span className="text-slate-600">Carbs:</span>
                <span className="font-medium ml-1">{formData.carbs}g</span>
              </div>
              <div>
                <span className="text-slate-600">Fat:</span>
                <span className="font-medium ml-1">{formData.fat}g</span>
              </div>
            </div>
            {formData.protein > 0 && formData.calories > 0 && (
              <div className="mt-2 text-sm">
                <span className="text-slate-600">Protein efficiency:</span>
                <span className={`font-medium ml-1 ${
                  (formData.calories / formData.protein) < 8 ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {(formData.calories / formData.protein).toFixed(1)} cal/g protein
                </span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="flex-1"
            disabled={!formData.name || formData.calories === 0}
          >
            {editingMeal ? 'Update Meal' : 'Log Meal'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}