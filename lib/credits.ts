import { getSupabaseBrowser } from '@/lib/supabaseBrowser'

interface CreditCheckResult {
  hasCredits: boolean
  remainingCredits: number
  tierName: string
  serviceName: string
  requiredCredits: number
}

interface ServiceConfig {
  [key: string]: {
    free: number
    basic: number
    pro: number
  }
}

const SERVICE_CREDITS: ServiceConfig = {
  resume_builder: { free: 1, basic: 10, pro: 15 },
  resume_optimizer: { free: 1, basic: 6, pro: 10 },
  communication_coach: { free: 1, basic: 3, pro: 10 },
  interview_prep: { free: 1, basic: 3, pro: 10 }
}

export async function checkUserCredits(userId: string, serviceType: string): Promise<CreditCheckResult> {
  const supabase = getSupabaseBrowser()
  
  try {
    // Try to get user credits from database
    const { data, error } = await supabase.rpc('get_user_credits', { user_uuid: userId })
    
    if (error || !data || data.length === 0) {
      // Fallback to free tier if database call fails
      return {
        hasCredits: true,
        remainingCredits: 4,
        tierName: 'Free',
        serviceName: serviceType,
        requiredCredits: SERVICE_CREDITS[serviceType]?.free || 1
      }
    }
    
    const userData = data[0]
    const requiredCredits = getRequiredCredits(serviceType, userData.tier_name)
    
    return {
      hasCredits: userData.credits_remaining >= requiredCredits,
      remainingCredits: userData.credits_remaining,
      tierName: userData.tier_name,
      serviceName: serviceType,
      requiredCredits
    }
    
  } catch (error) {
    console.error('Error checking user credits:', error)
    // Fallback to free tier
    return {
      hasCredits: true,
      remainingCredits: 4,
      tierName: 'Free',
      serviceName: serviceType,
      requiredCredits: SERVICE_CREDITS[serviceType]?.free || 1
    }
  }
}

function getRequiredCredits(serviceType: string, tierName: string): number {
  const serviceConfig = SERVICE_CREDITS[serviceType]
  if (!serviceConfig) return 1
  
  switch (tierName.toLowerCase()) {
    case 'free': return serviceConfig.free
    case 'basic': return serviceConfig.basic
    case 'pro': return serviceConfig.pro
    default: return serviceConfig.free
  }
}

export async function consumeUserCredits(userId: string, serviceType: string, action: string, metadata: any = {}): Promise<boolean> {
  const supabase = getSupabaseBrowser()
  
  try {
    // First check if user has credits
    const creditCheck = await checkUserCredits(userId, serviceType)
    
    if (!creditCheck.hasCredits) {
      return false
    }
    
    // Try to consume credits via database function
    const { data, error } = await supabase.rpc('consume_credits', {
      user_uuid: userId,
      service: serviceType,
      action: action,
      credits_to_consume: creditCheck.requiredCredits,
      meta: metadata
    })
    
    if (error) {
      console.error('Error consuming credits:', error)
      return false
    }
    
    return data || false
    
  } catch (error) {
    console.error('Error in consumeUserCredits:', error)
    return false
  }
}

export function getTierFeatures(tierName: string) {
  const features = {
    free: {
      resume_builder: { credits: 1, features: ['Download option'] },
      resume_optimizer: { credits: 1, features: ['Generation only', 'No download', 'No copy'] },
      communication_coach: { credits: 1, features: ['Record and analyze', 'Speaking/grammar analysis only'] },
      interview_prep: { credits: 1, features: ['Limited to 3-5 questions'] }
    },
    basic: {
      resume_builder: { credits: 10, features: ['Full download option'] },
      resume_optimizer: { credits: 6, features: ['Full features with download'] },
      communication_coach: { credits: 3, features: ['Full analysis', '3 credits per recording'] },
      interview_prep: { credits: 3, features: ['Full interview prep'] }
    },
    pro: {
      resume_builder: { credits: 15, features: ['Unlimited usage'] },
      resume_optimizer: { credits: 10, features: ['Unlimited usage'] },
      communication_coach: { credits: 10, features: ['Unlimited usage'] },
      interview_prep: { credits: 10, features: ['Unlimited usage'] }
    }
  }
  
  return features[tierName.toLowerCase() as keyof typeof features] || features.free
}

export function formatCredits(credits: number): string {
  if (credits === 1) return '1 credit'
  return `${credits} credits`
}