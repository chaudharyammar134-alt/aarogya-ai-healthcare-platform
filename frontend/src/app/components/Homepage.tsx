import { useState } from 'react';
import { Menu, X, Star, Check, ArrowRight, Brain, Activity, Shield, Database, Users, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import logoImage from 'figma:asset/705897d1e4c7001373ca7213f55bb514d7f71850.png';

interface HomepageProps {
  onGetStarted: () => void;
  onAdminAccess?: () => void;
}

const features = [
  {
    icon: Brain,
    title: 'AI Health Assistant',
    description: 'Personal AI that learns your health patterns and provides intelligent recommendations 24/7.',
    color: 'bg-green-500'
  },
  {
    icon: Activity,
    title: 'Smart Monitoring',
    description: 'Advanced health tracking with predictive analytics for proactive care.',
    color: 'bg-blue-500'
  },
  {
    icon: Shield,
    title: 'Preventive AI Care',
    description: 'AI-powered early detection and personalized prevention strategies.',
    color: 'bg-orange-500'
  },
  {
    icon: Database,
    title: 'Digital Health Profile',
    description: 'Comprehensive health records with AI insights and trend analysis.',
    color: 'bg-purple-500'
  }
];

const testimonials = [
  {
    name: 'Ravi Kumar',
    text: 'Arogya+ AI predicted my health risks early and helped me prevent serious complications. Life-changing!',
    avatar: '👨‍💼'
  },
  {
    name: 'Sita Devi',
    text: 'The AI health assistant understands my needs better than any app. Highly recommend for every Indian family.',
    avatar: '👩‍🎓'
  }
];

const plans = [
  {
    name: 'Essential',
    price: 199,
    period: 'month',
    yearlyPrice: 1990,
    features: [
      'Basic AI Health Assistant',
      'Health Tracking',
      'Monthly Health Reports',
      'Community Support'
    ],
    popular: false
  },
  {
    name: 'Smart',
    price: 399,
    period: 'month',
    yearlyPrice: 3990,
    features: [
      'Advanced AI Analytics',
      'Predictive Health Insights',
      'Teleconsultations',
      'Family Health Monitoring',
      'Priority Support'
    ],
    popular: true
  },
  {
    name: 'Pro',
    price: 699,
    period: 'month',
    yearlyPrice: 6990,
    features: [
      'Complete AI Health Suite',
      'Personalized Health Plans',
      'Unlimited Consultations',
      'Advanced Biomarker Analysis',
      'Dedicated Health Coach',
      '24/7 Emergency Support'
    ],
    popular: false
  }
];

export function Homepage({ onGetStarted, onAdminAccess }: HomepageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isYearly, setIsYearly] = useState(false);

  const navItems = ['Home', 'AI Features', 'Plans', 'About Us', 'Contact'];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src={logoImage} 
                alt="Arogya+ Logo" 
                className="w-10 h-10 object-contain"
              />
              <span className="text-2xl font-bold text-gray-900">Arogya+</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  {item}
                </button>
              ))}
            </nav>

            {/* CTA Button */}
            <div className="hidden md:flex items-center space-x-3">
              {onAdminAccess && (
                <Button 
                  onClick={onAdminAccess}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full"
                >
                  Admin Panel
                </Button>
              )}
              <Button 
                onClick={onGetStarted}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium"
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item}
                    className="text-gray-600 hover:text-gray-900 font-medium text-left"
                  >
                    {item}
                  </button>
                ))}
                <Button 
                  onClick={onGetStarted}
                  className="bg-green-600 hover:bg-green-700 text-white mt-4 w-full rounded-full"
                >
                  Get Started
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  <Zap className="w-4 h-4 mr-2" />
                  AI-Powered Health Intelligence
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Smart Health
                  <span className="text-green-600"> Membership</span>
                  <br />for Every Indian
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Revolutionary AI health platform that learns your unique patterns, predicts risks, 
                  and provides personalized care recommendations for optimal wellness.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button 
                  onClick={onGetStarted}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-semibold text-lg"
                >
                  Join Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  className="px-8 py-4 rounded-full font-semibold text-lg border-2 border-gray-200 hover:border-green-600"
                >
                  Learn More
                </Button>
              </div>

              {/* Stats */}
              <div className="flex space-x-8 pt-8 border-t border-gray-100">
                <div>
                  <div className="text-2xl font-bold text-gray-900">1M+</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">99.9%</div>
                  <div className="text-sm text-gray-600">AI Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">24/7</div>
                  <div className="text-sm text-gray-600">AI Support</div>
                </div>
              </div>
            </div>

            {/* Doctor Illustration */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-80 h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <div className="text-8xl">🩺</div>
                </div>
                
                {/* Floating AI Elements */}
                <div className="absolute -top-4 -left-4 bg-white rounded-2xl p-4 shadow-lg">
                  <Brain className="w-8 h-8 text-green-600" />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-lg">
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
                <div className="absolute top-1/2 -right-8 bg-white rounded-2xl p-3 shadow-lg">
                  <div className="text-2xl">🤖</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Our AI-Powered Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of healthcare with intelligent technology designed specifically for Indian lifestyles and health patterns.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Members Say
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">"{testimonial.text}"</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600">
              Flexible plans designed for every health journey
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mt-8">
              <span className={`font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative inline-flex w-12 h-6 items-center rounded-full transition-colors ${
                  isYearly ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  isYearly ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
              <span className={`font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Yearly
              </span>
              <Badge className="bg-green-100 text-green-800 ml-2">Save 15%</Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`p-8 relative ${plan.popular ? 'ring-2 ring-green-600 scale-105' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-gray-900">
                      ₹{isYearly ? Math.floor(plan.yearlyPrice / 12) : plan.price}
                      <span className="text-lg font-medium text-gray-600">/{plan.period}</span>
                    </div>
                    {isYearly && (
                      <div className="text-sm text-gray-600">
                        ₹{plan.yearlyPrice}/year (Save ₹{(plan.price * 12) - plan.yearlyPrice})
                      </div>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={onGetStarted}
                  className={`w-full py-3 rounded-full font-semibold ${
                    plan.popular 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white'
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  Select Plan
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={logoImage} 
                  alt="Arogya+ Logo" 
                  className="w-8 h-8 object-contain"
                />
                <span className="text-xl font-bold">Arogya+</span>
              </div>
              <p className="text-gray-400">
                AI-powered healthcare for every Indian. Your health, our intelligence.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white transition-colors">AI Features</button></li>
                <li><button className="hover:text-white transition-colors">Health Tracking</button></li>
                <li><button className="hover:text-white transition-colors">Consultations</button></li>
                <li><button className="hover:text-white transition-colors">Analytics</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white transition-colors">About Us</button></li>
                <li><button className="hover:text-white transition-colors">Careers</button></li>
                <li><button className="hover:text-white transition-colors">Press</button></li>
                <li><button className="hover:text-white transition-colors">Contact</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white transition-colors">Help Center</button></li>
                <li><button className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button className="hover:text-white transition-colors">Terms of Service</button></li>
                <li><button className="hover:text-white transition-colors">Security</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Arogya+. All rights reserved. Made with ❤️ for India.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}