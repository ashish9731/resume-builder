'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabaseBrowser'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CreditCard, Lock } from 'lucide-react'

interface CreditGateProps {
  userId: string
  serviceType: string
  children: React.ReactNode
  onInsufficientCredits?: () => void
}

export default function CreditGate({ 
  userId, 
  serviceType, 
  children, 
  onInsufficientCredits 
}: CreditGateProps) {
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [remainingCredits, setRemainingCredits] = useState<number>(0)
  const [requiredCredits, setRequiredCredits] = useState<number>(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkCredits()
  }, [userId, serviceType])

  const checkCredits = async () => {
    if (!userId) {
      setHasAccess(false)
      setLoading(false)
      return
    }

    try {
      const supabase = getSupabaseBrowser()
      
      // Try to get user credits from database
      const { data, error } = await supabase.rpc('get_user_credits', { user_uuid: userId })
      
      if (error || !data || data.length === 0) {
        // Default to free tier if database unavailable
        setHasAccess(true)
        setRemainingCredits(4)
        setRequiredCredits(1)
        setLoading(false)
        return
      }

      const userData = data[0]
      const creditsNeeded = getCreditsForService(serviceType, userData.tier_name)
      
      setRemainingCredits(userData.credits_remaining)
      setRequiredCredits(creditsNeeded)
      setHasAccess(userData.credits_remaining >= creditsNeeded)
      
    } catch (error) {
      console.error('Error checking credits:', error)
      // Default to allowing access on error
      setHasAccess(true)
    } finally {
      setLoading(false)
    }
  }

  const getCreditsForService = (service: string, tier: string): number => {
    const creditsMap: Record<string, Record<string, number>> = {
      resume_builder: { free: 1, basic: 10, pro: 15 },
      resume_optimizer: { free: 1, basic: 6, pro: 10 },
      communication_coach: { free: 1, basic: 3, pro: 10 },
      interview_prep: { free: 1, basic: 3, pro: 10 }
    }
    
    return creditsMap[service]?.[tier.toLowerCase()] || 1
  }

  const handleUpgradeClick = () => {
    router.push('/pricing')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-stone-600">Checking access...</span>
      </div>
    )
  }

  if (hasAccess === false) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-xl border border-stone-200 shadow-sm">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          
          <h3 className="text-xl font-bold text-stone-800 mb-2">Insufficient Credits</h3>
          <p className="text-stone-600 mb-6">
            You need {requiredCredits} credit{requiredCredits !== 1 ? 's' : ''} to use this feature, 
            but you only have {remainingCredits} remaining.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={handleUpgradeClick}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Upgrade Plan
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => router.push('/pricing')}
              className="w-full border-stone-300 text-stone-700 hover:bg-stone-50 py-3 rounded-xl"
            >
              View All Plans
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <Lock className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-blue-800">Free Tier Available</p>
                <p className="text-sm text-blue-700 mt-1">
                  You can still access basic features with our free plan. 
                  Upgrade for unlimited usage!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}