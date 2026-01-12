import Link from 'next/link'
import { ArrowRight, Sparkles, FileText, Brain, Download, Shield, Zap, Users, Star, CheckCircle, Mic, Play, Menu, X, Home, User, LogIn, LogOut, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo on Left */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-stone-800">ResumeAI</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-stone-700 hover:text-blue-600 font-medium transition-colors">Home</a>
              <a href="#how-it-works" className="text-stone-700 hover:text-blue-600 font-medium transition-colors">How It Works</a>
              <a href="#testimonials" className="text-stone-700 hover:text-blue-600 font-medium transition-colors">Testimonials</a>

              <Link href="/auth">
                <Button variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-100">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="w-6 h-6 text-stone-700" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden" id="home">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="text-left">
              <div className="mb-8">
                {/* Main Heading */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-800 mb-6 leading-tight">
                  AI-Powered
                  <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Resume Builder
                  </span>
                </h1>
                
                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-stone-600 mb-8 max-w-2xl leading-relaxed">
                  Transform your resume with AI analysis, ATS optimization, and professional enhancement. 
                  Practice your communication skills and prepare for interviews with our AI-powered tools.
                </p>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/start">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
                    Start Building Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>

              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 max-w-md">
                <div className="text-center">
                  <div className="text-2xl font-bold text-stone-800">10K+</div>
                  <div className="text-stone-500 text-sm">Resumes Enhanced</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-stone-800">95%</div>
                  <div className="text-stone-500 text-sm">ATS Pass Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-stone-800">5min</div>
                  <div className="text-stone-500 text-sm">Average Time</div>
                </div>
              </div>
            </div>
            
            {/* Right Side - Image/Illustration */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-stone-200">
                  <div className="space-y-6">
                    {/* Resume Preview */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 bg-blue-200 rounded w-3/4"></div>
                        <div className="h-3 bg-purple-200 rounded w-full"></div>
                        <div className="h-3 bg-purple-200 rounded w-5/6"></div>
                        <div className="h-3 bg-purple-200 rounded w-4/6"></div>
                      </div>
                    </div>
                    
                    {/* AI Analysis Panel */}
                    <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-100">
                      <div className="flex items-center space-x-2 mb-3">
                        <Brain className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-800">AI Analysis</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-green-700">Keyword Optimization</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-green-700">Format Enhancement</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-green-700">ATS Compatibility</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center shadow-lg">
                  <Star className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white/5 backdrop-blur-sm" id="features">
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
      <div className="py-20" id="how-it-works">
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
      <div className="py-20 bg-white/5 backdrop-blur-sm" id="testimonials">
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
          </div>
        </div>
      </div>
    </div>
  )
}