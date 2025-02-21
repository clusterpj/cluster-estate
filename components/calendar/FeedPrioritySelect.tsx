import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState, useEffect } from 'react'
import { Database } from '@/types/database'

interface FeedPrioritySelectProps {
  feedId: string
  propertyId: string
  currentPriority: number
  onPriorityChange?: (newPriority: number) => void
}

export function FeedPrioritySelect({
  feedId,
  propertyId,
  currentPriority,
  onPriorityChange
}: FeedPrioritySelectProps) {
  const [priority, setPriority] = useState(currentPriority)
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClientComponentClient<Database>()

  const handlePriorityChange = async (newPriority: number) => {
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('calendar_feeds')
        .update({ priority: newPriority })
        .eq('id', feedId)
        .eq('property_id', propertyId)

      if (error) {
        throw error
      }

      setPriority(newPriority)
      onPriorityChange?.(newPriority)
    } catch (error) {
      console.error('Error updating feed priority:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={`priority-${feedId}`} className="text-sm font-medium">
        Priority:
      </label>
      <select
        id={`priority-${feedId}`}
        value={priority}
        onChange={(e) => handlePriorityChange(Number(e.target.value))}
        disabled={isUpdating}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm"
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
          <option key={value} value={value}>
            {value} {value === 1 ? '(Highest)' : value === 10 ? '(Lowest)' : ''}
          </option>
        ))}
      </select>
      {isUpdating && <span className="text-sm text-gray-500">Updating...</span>}
    </div>
  )
}
