'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabaseBrowser'
import { Button } from '@/components/ui/button'
import { Check, X, CreditCard, QrCode, Lock, Unlock, ArrowLeft } from 'lucide-react'

interface PricingTier {
  id: string
  name: string
  credits: number
  price: number
  description: string
  features: {
    resume_builder: { credits: number; features: string[] }
    resume_optimizer: { credits: number; features: string[] }
    communication_coach: { credits: number; features: string[] }
    interview_prep: { credits: number; features: string[] }
  }
}

interface UserCredits {
  tier_name: string
  credits_total: number
  credits_used: number
  credits_remaining: number
  subscription_start: string
  subscription_end: string
}

export default function PricingPage() {
  const router = useRouter()
  const [supabase, setSupabase] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null)
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  useEffect(() => {
    setSupabase(getSupabaseBrowser())
  }, [])

  useEffect(() => {
    if (!supabase) return

    const initialize = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user)
          // Fetch user's current credits
          await fetchUserCredits(user.id)
        }
        
        // Fetch pricing tiers
        await fetchPricingTiers()
      } catch (error) {
        console.error('Error initializing pricing page:', error)
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [supabase])

  const fetchPricingTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_tiers')
        .select('*')
        .eq('is_active', true)
        .order('price')

      if (error) throw error
      setPricingTiers(data || [])
    } catch (error) {
      console.error('Error fetching pricing tiers:', error)
      // Fallback to hardcoded data if database fails
      setPricingTiers([
        {
          id: 'free',
          name: 'Free',
          credits: 4,
          price: 0,
          description: 'Perfect for getting started',
          features: {
            resume_builder: { credits: 1, features: ['Download option'] },
            resume_optimizer: { credits: 1, features: ['Generation only', 'No download', 'No copy'] },
            communication_coach: { credits: 1, features: ['Record and analyze', 'Speaking/grammar analysis only'] },
            interview_prep: { credits: 1, features: ['Limited to 3-5 questions'] }
          }
        },
        {
          id: 'basic',
          name: 'Basic',
          credits: 24,
          price: 29.99,
          description: 'Great for regular job seekers',
          features: {
            resume_builder: { credits: 10, features: ['Full download option'] },
            resume_optimizer: { credits: 6, features: ['Full features with download'] },
            communication_coach: { credits: 3, features: ['Full analysis', '3 credits per recording'] },
            interview_prep: { credits: 3, features: ['Full interview prep'] }
          }
        },
        {
          id: 'pro',
          name: 'Pro',
          credits: 40,
          price: 49.99,
          description: 'Best for serious job seekers',
          features: {
            resume_builder: { credits: 15, features: ['Unlimited usage'] },
            resume_optimizer: { credits: 10, features: ['Unlimited usage'] },
            communication_coach: { credits: 10, features: ['Unlimited usage'] },
            interview_prep: { credits: 10, features: ['Unlimited usage'] }
          }
        }
      ])
    }
  }

  const fetchUserCredits = async (userId: string) => {
    try {
      // Try to call the function if available
      const { data, error } = await supabase.rpc('get_user_credits', { user_uuid: userId })
      
      if (error) {
        console.error('Error fetching user credits:', error)
        return
      }
      
      if (data && data.length > 0) {
        setUserCredits(data[0])
      }
    } catch (error) {
      console.error('Error in fetchUserCredits:', error)
    }
  }

  const handleSelectTier = async (tierId: string) => {
    if (!user) {
      router.push('/auth')
      return
    }

    setSelectedTier(tierId)
    
    // Here you would integrate with payment processor
    // For now, let's simulate the payment process
    try {
      const selectedTierData = pricingTiers.find(tier => tier.id === tierId)
      if (!selectedTierData) return

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update user's tier in database
      const { error } = await supabase.from('user_tiers').upsert({
        user_id: user.id,
        tier_id: selectedTierData.id,
        credits_total: selectedTierData.credits,
        credits_used: 0,
        subscription_start: new Date().toISOString(),
        is_active: true
      })

      if (error) throw error
      
      // Refresh user credits
      await fetchUserCredits(user.id)
      setSelectedTier(null)
      
      alert(`Successfully upgraded to ${selectedTierData.name} plan!`)
      
    } catch (error) {
      console.error('Error selecting tier:', error)
      alert('Error processing upgrade. Please try again.')
      setSelectedTier(null)
    }
  }

  const handlePaymentMethod = (method: 'upi' | 'card') => {
    // Here you would integrate with actual payment processors
    alert(`Processing payment via ${method}. This would integrate with Razorpay/Stripe/etc.`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50 flex items-center justify-center">
        <div className="text-stone-800 text-xl">Loading pricing information...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => router.back()} 
                variant="ghost" 
                className="text-stone-600 hover:text-stone-800 hover:bg-stone-100"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-stone-800">Pricing Plans</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user && userCredits && (
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                  Credits: {userCredits.credits_remaining}/{userCredits.credits_total}
                </div>
              )}
              {!user && (
                <Button onClick={() => router.push('/auth')} variant="outline">
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Current Plan Display */}
        {userCredits && (
          <div className="mb-12 p-6 bg-white rounded-xl border border-stone-200 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-stone-800">Current Plan: {userCredits.tier_name}</h2>
                <p className="text-stone-600">
                  {userCredits.credits_remaining} of {userCredits.credits_total} credits remaining
                </p>
              </div>
              <div className="text-sm text-stone-500">
                Valid until: {new Date(userCredits.subscription_end).toLocaleDateString()}
              </div>
            </div>
            {userCredits.credits_remaining === 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 font-medium">
                  ⚠️ You've used all your credits. Please upgrade to continue using our services.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {pricingTiers.map((tier) => (
            <div 
              key={tier.id}
              className={`relative bg-white rounded-xl border-2 p-6 shadow-md transition-all duration-300 hover:scale-102 ${
                tier.name === 'Pro' 
                  ? 'border-blue-500 ring-2 ring-blue-100' 
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              {tier.name === 'Pro' && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  MOST POPULAR
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-stone-800 mb-2">{tier.name}</h3>
                <div className="mb-3">
                  <span className="text-3xl font-bold text-stone-900">${tier.price}</span>
                  {tier.price > 0 && <span className="text-stone-600 text-sm">/month</span>}
                </div>
                <p className="text-stone-600 text-sm">{tier.description}</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="text-center py-2">
                  <h4 className="font-semibold text-stone-800 text-sm flex items-center justify-center">
                    <CreditCard className="w-4 h-4 mr-1 text-blue-500" />
                    {tier.credits} Total Credits
                  </h4>
                </div>

                <div className="space-y-4">
                  <FeatureItem 
                    title="Resume Builder" 
                    credits={tier.features.resume_builder.credits}
                    features={tier.features.resume_builder.features}
                  />
                  <FeatureItem 
                    title="Resume Optimizer" 
                    credits={tier.features.resume_optimizer.credits}
                    features={tier.features.resume_optimizer.features}
                  />
                  <FeatureItem 
                    title="Communication Coach" 
                    credits={tier.features.communication_coach.credits}
                    features={tier.features.communication_coach.features}
                  />
                  <FeatureItem 
                    title="Interview Prep" 
                    credits={tier.features.interview_prep.credits}
                    features={tier.features.interview_prep.features}
                  />
                </div>
              </div>

              <Button
                onClick={() => handleSelectTier(tier.id)}
                disabled={selectedTier === tier.id}
                className={`w-full py-3 font-semibold ${
                  tier.name === 'Pro'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-stone-800 hover:bg-stone-900 text-white'
                }`}
              >
                {selectedTier === tier.id ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : userCredits?.tier_name === tier.name ? (
                  'Current Plan'
                ) : tier.price === 0 ? (
                  'Get Started Free'
                ) : (
                  `Upgrade to ${tier.name}`
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        {selectedTier && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-stone-800 mb-6">Select Payment Method</h3>
              
              <div className="space-y-4">
                <Button
                  onClick={() => handlePaymentMethod('upi')}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center"
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  Pay with UPI
                </Button>
                
                <Button
                  onClick={() => handlePaymentMethod('card')}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay with Card
                </Button>
              </div>
              
              <Button
                onClick={() => setSelectedTier(null)}
                variant="outline"
                className="w-full mt-4"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FeatureItem({ title, credits, features }: { 
  title: string; 
  credits: number; 
  features: string[] 
}) {
  return (
    <div className="border border-stone-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h5 className="font-semibold text-stone-800">{title}</h5>
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
          {credits} credit{credits !== 1 ? 's' : ''}
        </span>
      </div>
      <ul className="space-y-1">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start text-sm text-stone-600">
            <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}