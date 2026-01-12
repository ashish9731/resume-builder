'use client'

import { useState, useEffect } from 'react'
import { getSupabaseBrowser } from '@/lib/supabaseBrowser'
import { CreditCard } from 'lucide-react'

interface UserCredits {
  tier_name: string
  credits_total: number
  credits_used: number
  credits_remaining: number
  subscription_start: string
  subscription_end: string
}

export default function CreditDisplay({ userId }: { userId: string }) {
  const [credits, setCredits] = useState<UserCredits | null>(null)
  const [loading, setLoading] = useState(false) // Start with false to show immediately

  useEffect(() => {
    if (userId) {
      fetchUserCredits()
    }
  }, [userId])

  // Show default free tier immediately while loading
  const defaultCredits: UserCredits = {
    tier_name: 'Free',
    credits_total: 4,
    credits_used: 0,
    credits_remaining: 4,
    subscription_start: new Date().toISOString(),
    subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }

  const fetchUserCredits = async () => {
    try {
      const supabase = getSupabaseBrowser()
      const { data, error } = await supabase.rpc('get_user_credits', { user_uuid: userId })
      
      if (error) {
        console.error('Error fetching credits:', error)
        return
      }
      
      if (data && data.length > 0) {
        setCredits(data[0])
      }
    } catch (error) {
      console.error('Error in fetchUserCredits:', error)
    } finally {
      setLoading(false)
    }
  }

  const displayCredits = credits || defaultCredits
  
  if (loading && !credits) {
    return (
      <div className="bg-stone-100 rounded-full px-3 py-1 text-sm text-stone-600 animate-pulse">
        Loading...
      </div>
    )
  }

  const percentageUsed = (displayCredits.credits_used / displayCredits.credits_total) * 100
  const isLowCredits = displayCredits.credits_remaining <= 2

  return (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
      isLowCredits 
        ? 'bg-red-100 text-red-800' 
        : percentageUsed > 75 
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-blue-100 text-blue-800'
    }`}>
      <CreditCard className="w-4 h-4" />
      <span>
        {displayCredits.credits_remaining} / {displayCredits.credits_total} credits
      </span>
      {isLowCredits && (
        <span className="text-xs">(Low credits)</span>
      )}
    </div>
  )
}