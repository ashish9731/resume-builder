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
  price_inr: number
  original_price_inr?: number
  discount_percentage?: number
  billing_cycle: string
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
  billing_cycle: string
  credits_total: number
  credits_used: number
  credits_remaining: number
  subscription_start: string
  subscription_end: string
  price_inr: number
}

export default function PricingPage() {
  const router = useRouter()
  const [supabase, setSupabase] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null)
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

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
  }, [supabase, billingCycle])

  const fetchPricingTiers = async () => {
    try {
      // Try to call the new function first
      const { data: groupedData, error: groupedError } = await supabase.rpc('get_pricing_tiers_grouped')
      
      if (!groupedError && groupedData) {
        // Transform grouped data to flat array
        const flattenedTiers: PricingTier[] = []
        groupedData.forEach((group: any) => {
          if (group.billing_cycle === billingCycle) {
            group.tiers.forEach((tier: any) => {
              flattenedTiers.push({
                id: tier.id,
                name: tier.name,
                credits: tier.credits,
                price_inr: tier.price_inr,
                original_price_inr: tier.original_price_inr,
                discount_percentage: tier.discount_percentage,
                billing_cycle: group.billing_cycle,
                description: tier.description,
                features: tier.features
              })
            })
          }
        })
        setPricingTiers(flattenedTiers)
        return
      }
      
      // Fallback to direct table query
      const { data, error } = await supabase
        .from('pricing_tiers')
        .select('*')
        .eq('is_active', true)
        .eq('billing_cycle', billingCycle)
        .order('credits')

      if (error) throw error
      setPricingTiers(data || [])
      
    } catch (error) {
      console.error('Error fetching pricing tiers:', error)
      // Fallback to hardcoded data with correct INR pricing
      const fallbackTiers: PricingTier[] = [
        {
          id: 'free-monthly',
          name: 'Free',
          credits: 4,
          price_inr: 0,
          billing_cycle: 'monthly',
          description: 'Perfect for getting started',
          features: {
            resume_builder: { credits: 1, features: ['Download option'] },
            resume_optimizer: { credits: 1, features: ['Generation only', 'No download', 'No copy'] },
            communication_coach: { credits: 1, features: ['Record and analyze', 'Speaking/grammar analysis only'] },
            interview_prep: { credits: 1, features: ['Limited to 3-5 questions'] }
          }
        },
        {
          id: 'basic-monthly',
          name: 'Basic',
          credits: 24,
          price_inr: 175,
          billing_cycle: 'monthly',
          description: 'Great for regular job seekers',
          features: {
            resume_builder: { credits: 10, features: ['Full download option'] },
            resume_optimizer: { credits: 6, features: ['Full features with download'] },
            communication_coach: { credits: 3, features: ['Full analysis', '3 credits per recording'] },
            interview_prep: { credits: 3, features: ['Full interview prep'] }
          }
        },
        {
          id: 'pro-monthly',
          name: 'Pro',
          credits: 40,
          price_inr: 299,
          billing_cycle: 'monthly',
          description: 'Best for serious job seekers',
          features: {
            resume_builder: { credits: 15, features: ['Unlimited usage'] },
            resume_optimizer: { credits: 10, features: ['Unlimited usage'] },
            communication_coach: { credits: 10, features: ['Unlimited usage'] },
            interview_prep: { credits: 10, features: ['Unlimited usage'] }
          }
        }
      ]
      
      if (billingCycle === 'yearly') {
        setPricingTiers(fallbackTiers.map(tier => ({
          ...tier,
          id: tier.id.replace('-monthly', '-yearly'),
          credits: tier.credits * 12,
          price_inr: tier.name === 'Basic' ? 1799 : tier.name === 'Pro' ? 2999 : 0,
          billing_cycle: 'yearly',
          description: tier.description.includes('Annual') ? tier.description : tier.description + ' (Annual)' 
        })).filter(tier => tier.name !== 'Free'))
      } else {
        setPricingTiers(fallbackTiers)
      }
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
        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-xl p-2 border border-stone-200 shadow-sm">
            <div className="flex rounded-lg overflow-hidden">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'text-stone-600 hover:text-stone-800'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                  billingCycle === 'yearly'
                    ? 'bg-blue-600 text-white'
                    : 'text-stone-600 hover:text-stone-800'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Current Plan Display */}
        {userCredits && (
          <div className="mb-12 p-6 bg-white rounded-xl border border-stone-200 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-stone-800">
                  Current Plan: {userCredits.tier_name} ({userCredits.billing_cycle})
                </h2>
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
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
                  <span className="text-3xl font-bold text-stone-900">₹{tier.price_inr.toLocaleString()}</span>
                  {tier.price_inr > 0 && (
                    <span className="text-stone-600 text-sm">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  )}
                  {tier.original_price_inr && tier.discount_percentage && (
                    <div className="flex items-center justify-center mt-1">
                      <span className="text-sm text-stone-500 line-through">
                        ₹{tier.original_price_inr.toLocaleString()}
                      </span>
                      <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {tier.discount_percentage}% OFF
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-stone-600 text-sm">{tier.description}</p>
                <div className="mt-2 text-xs text-stone-500">
                  {tier.credits} credits ({Math.floor(tier.credits / (billingCycle === 'monthly' ? 1 : 12))}/month avg)
                </div>
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
                ) : userCredits?.tier_name === tier.name && userCredits?.billing_cycle === tier.billing_cycle ? (
                  'Current Plan'
                ) : tier.price_inr === 0 ? (
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