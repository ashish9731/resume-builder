import Link from 'next/link'
import { ArrowRight, Sparkles, FileText, Brain, Download, Shield, Zap, Users, Star, CheckCircle, Mic, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-8 shadow-2xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-stone-800 mb-6 leading-tight">
              AI-Powered
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Resume Builder
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-stone-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your resume with AI analysis, ATS optimization, and professional enhancement. 
              Practice your communication skills and prepare for interviews with our AI-powered tools.
              Get hired faster with a complete job search solution.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/start">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
                  Start Building Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="border-2 border-stone-300 text-stone-700 hover:bg-stone-100 px-8 py-4 text-lg font-semibold rounded-xl">
                  View Pricing
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-stone-800 mb-2">10K+</div>
                <div className="text-stone-500">Resumes Enhanced</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-stone-800 mb-2">95%</div>
                <div className="text-stone-500">ATS Pass Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-stone-800 mb-2">5min</div>
                <div className="text-stone-500">Average Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-stone-800 mb-6">
              Why Choose Our AI Resume Builder?
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Advanced AI technology meets professional design to create resumes that get you noticed and prepare you for interviews.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Analysis',
                desc: 'Get instant feedback on your resume with AI-driven insights and recommendations.',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Shield,
                title: 'ATS Optimization',
                desc: 'Ensure your resume passes through Applicant Tracking Systems with keyword optimization.',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: FileText,
                title: 'Professional Templates',
                desc: 'Choose from beautifully designed templates that recruiters love.',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: Mic,
                title: 'Communication Coach',
                desc: 'Analyze your speech clarity, pacing, and confidence with AI-powered feedback.',
                color: 'from-green-500 to-teal-500'
              },
              {
                icon: Play,
                title: 'Interview Prep',
                desc: 'Simulate real interviews with AI-generated questions and performance analysis.',
                color: 'from-yellow-500 to-amber-500'
              },
              {
                icon: Users,
                title: 'Expert Approved',
                desc: 'Templates and content approved by HR professionals and career experts.',
                color: 'from-indigo-500 to-blue-500'
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 hover:transform hover:scale-105">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl mb-6 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-4">{feature.title}</h3>
                  <p className="text-stone-600 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-stone-800 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Create your perfect resume and prepare for interviews with our comprehensive tools
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: '01',
                title: 'Upload or Create',
                desc: 'Upload your existing resume or start from scratch with our guided builder.'
              },
              {
                step: '02',
                title: 'AI Analysis & Enhancement',
                desc: 'Our AI analyzes your resume and provides optimization suggestions.'
              },
              {
                step: '03',
                title: 'Communication Coach',
                desc: 'Record yourself speaking and get AI-powered feedback on clarity, pacing, and confidence.'
              },
              {
                step: '04',
                title: 'Interview Prep',
                desc: 'Practice real interviews with AI-generated questions and receive detailed performance analysis.'
              },
              {
                step: '05',
                title: 'Download & Apply',
                desc: 'Get your enhanced resume and interview preparation materials in professional formats.'
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-bold text-xl mb-6">
                  {step.step}
                </div>
                <h3 className="text-2xl font-bold text-stone-800 mb-4">{step.title}</h3>
                <p className="text-stone-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-stone-800 mb-6">
              What Our Users Say
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Software Engineer',
                content: 'Got 3 interview calls within a week after using this AI resume builder. The ATS optimization really works!',
                rating: 5
              },
              {
                name: 'Michael Chen',
                role: 'Marketing Manager',
                content: 'The AI suggestions helped me highlight my achievements better. My resume looks so professional now.',
                rating: 5
              },
              {
                name: 'David Wilson',
                role: 'Product Manager',
                content: 'The Communication Coach helped me improve my presentation skills dramatically. I went from nervous speaker to confident presenter!',
                rating: 5
              },
              {
                name: 'Lisa Thompson',
                role: 'UX Designer',
                content: 'The Interview Prep feature was a game-changer. I practiced with AI-generated questions and felt completely prepared for my interviews.',
                rating: 5
              },
              {
                name: 'Emily Rodriguez',
                role: 'Data Analyst',
                content: 'Finally landed my dream job! The resume builder made the whole process so much easier.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-stone-600 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-stone-800">{testimonial.name}</div>
                  <div className="text-stone-500 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-stone-800 mb-6">
              Ready to Land Your Dream Job?
            </h2>
            <p className="text-xl text-stone-600 mb-8">
              Join thousands of professionals who have enhanced their resumes and prepared for interviews with our comprehensive AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link href="/start">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-xl font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
                  Get Started Free
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8 text-stone-500">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                Free to use
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                AI-powered optimization
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                Communication coaching
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                Interview preparation
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}