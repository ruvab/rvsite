import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Sparkles, Zap, Target, TrendingUp, MessageSquare, DollarSign, Users, Brain, Cloud, Shield, BarChart } from 'lucide-react';
import GoToTopButton from '@/components/GoToTopButton';

const PricingPage = () => {
  const productPlans = [
    {
      name: "Trend Solver",
      tagline: "Data Analytics & Insights",
      isFree: true,
      premiumWaitlist: true,
      tiers: [
        { name: "Free", price: "FREE", period: "" },
        { name: "Premium", price: "Waitlist", period: "Coming Soon" }
      ],
      description: "Advanced data analytics platform for actionable business insights - Currently free with premium features coming soon",
      features: [
        "Real-time data analytics dashboard",
        "Predictive trend analysis",
        "Custom reporting & visualization",
        "AI-powered insights generation",
        "API integration support",
        "Join premium waitlist for advanced features"
      ],
      icon: <TrendingUp className="h-6 w-6" />,
      popular: false,
      gradient: "from-blue-500 to-cyan-500",
      link: "/trend-solver"
    },
    {
      name: "LangScribe",
      tagline: "AI Writing Assistant",
      isFree: true,
      premiumWaitlist: true,
      tiers: [
        { name: "Free", price: "FREE", period: "" },
        { name: "Premium", price: "Waitlist", period: "Coming Soon" }
      ],
      description: "AI-powered writing assistant transforming content creation - Free to use with premium tier launching soon",
      features: [
        "Advanced AI content generation",
        "Multi-language support",
        "Grammar & style enhancement",
        "Plagiarism detection",
        "Team collaboration tools",
        "Join waitlist for premium features"
      ],
      icon: <MessageSquare className="h-6 w-6" />,
      popular: false,
      gradient: "from-purple-500 to-pink-500",
      link: "/langscribe"
    },
    {
      name: "FYPPAL",
      tagline: "Project Management",
      isFree: true,
      premiumWaitlist: true,
      tiers: [
        { name: "Free", price: "FREE", period: "" },
        { name: "Premium", price: "Waitlist", period: "Coming Soon" }
      ],
      description: "Find Your Purpose, Passion, And Leap - Free project collaboration platform with premium features in development",
      features: [
        "AI-powered project planning",
        "Team collaboration workspace",
        "Goal tracking & analytics",
        "Resource management tools",
        "Progress visualization",
        "Premium tier coming soon"
      ],
      icon: <Target className="h-6 w-6" />,
      popular: false,
      gradient: "from-orange-500 to-red-500",
      link: "/fyppal"
    },
    {
      name: "RevenueAI",
      tagline: "AI Lead Recovery & Revenue Growth",
      isFree: false,
      premiumWaitlist: false,
      externalLink: "https://revenueai.ruvab.it.com",
      tiers: [
        { name: "Freemium", price: "$0", period: "/forever" },
        { name: "Standard", price: "$47", period: "/month" },
        { name: "Premium", price: "$177", period: "/month" }
      ],
      description: "Turn lost leads into revenue growth with AI-powered lead recovery and personalized messaging",
      features: [
        "AI-powered lead recovery automation",
        "Personalized messaging engine",
        "Real-time analytics & ROI tracking",
        "Smart conversion notifications",
        "Freemium: 10 leads + 50 messages/month",
        "Standard: 500 leads + 2,000 messages/month"
      ],
      icon: <DollarSign className="h-6 w-6" />,
      popular: true,
      gradient: "from-emerald-500 to-green-500",
      link: "/revenueai"
    },
    {
      name: "AgeHealthy",
      tagline: "Health & Wellness Platform",
      isFree: false,
      premiumWaitlist: false,
      externalLink: "https://agehealthy.in",
      tiers: [
        { name: "Free", price: "₹0", period: "/forever" },
        { name: "Monthly", price: "₹58", period: "/month" },
        { name: "Yearly", price: "₹347", period: "/year" }
      ],
      description: "Age smarter, live healthier - AI-powered personalized health recommendations and comprehensive wellness tracking",
      features: [
        "Accurate age calculation & health tips",
        "Premium: Ad-free experience",
        "Extended health questionnaire",
        "Personalized wellness plans",
        "Export & share health reports",
        "Yearly plan saves 50% (₹29/month equivalent)"
      ],
      icon: <Users className="h-6 w-6" />,
      popular: false,
      gradient: "from-blue-500 to-cyan-500",
      link: "/agehealthy"
    }
  ];

  const servicePlans = [
    {
      name: "Starter",
      price: "$3,500",
      period: "per month",
      description: "Perfect for startups and small businesses getting started with AI",
      features: [
        "AI Implementation consultation",
        "Basic process automation setup",
        "Monthly strategy sessions (2 hours)",
        "Email & chat support",
        "Up to 2 small projects/month",
        "Basic reporting & analytics",
        "40 hours of consulting/month"
      ],
      icon: <Sparkles className="h-6 w-6" />,
      popular: false,
      services: ["AI Implementation", "Process Automation"]
    },
    {
      name: "Professional",
      price: "$12,500",
      period: "per month",
      description: "Comprehensive solutions for growing companies",
      features: [
        "Everything in Starter plan",
        "Advanced AI & ML solutions",
        "Cloud infrastructure setup",
        "Business intelligence dashboards",
        "Cybersecurity assessment",
        "Up to 5 medium projects/month",
        "Priority support (24/5)",
        "100 hours of consulting/month",
        "Quarterly strategic planning"
      ],
      icon: <Zap className="h-6 w-6" />,
      popular: true,
      services: ["All Services"]
    },
    {
      name: "Enterprise",
      price: "$25,000+",
      period: "per month",
      description: "Full-scale digital transformation for large organizations",
      features: [
        "Everything in Professional plan",
        "Dedicated technical team",
        "Custom AI model development",
        "Enterprise cloud architecture",
        "Advanced security & compliance",
        "Unlimited projects",
        "24/7 premium support",
        "200+ hours of consulting/month",
        "On-site consultations available",
        "Custom SLA agreements"
      ],
      icon: <Brain className="h-6 w-6" />,
      popular: false,
      services: ["All Services + Custom Solutions"]
    }
  ];

  const serviceCategories = [
    {
      name: "AI Implementation",
      icon: <Brain className="h-5 w-5" />,
      description: "Custom AI solutions tailored to your business needs",
      startingPrice: "$15,000",
      priceNote: "per project",
      gradient: "from-purple-500 to-indigo-500"
    },
    {
      name: "Process Automation",
      icon: <Zap className="h-5 w-5" />,
      description: "Streamline operations with intelligent automation",
      startingPrice: "$8,000",
      priceNote: "per project",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      name: "Business Intelligence",
      icon: <BarChart className="h-5 w-5" />,
      description: "Data-driven insights and analytics solutions",
      startingPrice: "$12,000",
      priceNote: "per project",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      name: "Cloud Solutions",
      icon: <Cloud className="h-5 w-5" />,
      description: "Scalable cloud infrastructure and migration",
      startingPrice: "$20,000",
      priceNote: "per project",
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      name: "Cybersecurity",
      icon: <Shield className="h-5 w-5" />,
      description: "Comprehensive security assessment and implementation",
      startingPrice: "$18,000",
      priceNote: "per project",
      gradient: "from-red-500 to-orange-500"
    }
  ];

  const freeTools = [
    {
      name: "QR Gen Pro",
      description: "Create and share QR codes instantly - completely free!",
      link: "https://qr-gen.ruvab.it.com",
      external: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pricing - AI-Powered Products & Technology Solutions | Ruvab IT</title>
        <meta name="description" content="Explore transparent pricing for Ruvab IT's AI-powered products (Trend Solver, LangScribe, RevenueAI, FYPPAL) and technology services (AI Implementation, Cloud Solutions, Cybersecurity). Custom solutions available." />
        <meta name="keywords" content="AI pricing, technology solutions cost, AI implementation, business intelligence pricing, cloud solutions, cybersecurity services" />
        <link rel="canonical" href="https://ruvab.it.com/pricing" />
      </Helmet>

      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            Transparent Pricing
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-6">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            From powerful AI products to comprehensive technology services - find the solution that fits your needs and budget
          </p>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="products" data-testid="tab-products">Products</TabsTrigger>
            <TabsTrigger value="services" data-testid="tab-services">Services</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-16">
            {/* Featured Products */}
            <section>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">AI-Powered Products</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Enterprise-grade solutions designed to transform your business
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {productPlans.map((plan, index) => (
                  <Card key={index} className={`relative hover:shadow-2xl transition-shadow duration-300 ${plan.popular ? 'border-purple-500 shadow-xl scale-[1.02]' : plan.isFree ? 'border-green-500 border-2' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                          Most Popular
                        </span>
                      </div>
                    )}
                    {plan.isFree && !plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                          100% FREE
                        </span>
                      </div>
                    )}
                    <CardHeader className="pb-8">
                      <div className={`w-14 h-14 bg-gradient-to-br ${plan.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                        <div className="text-white">{plan.icon}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        {plan.isFree && <Badge className="bg-green-500 text-white">FREE</Badge>}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{plan.tagline}</p>
                      <div className="mt-4 space-y-1">
                        {!plan.isFree && <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Starting at</div>}
                        <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                          {plan.tiers[0].price}
                        </span>
                        <span className="text-gray-600 dark:text-gray-300 text-lg">{plan.tiers[0].period}</span>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {plan.tiers.map((tier, tierIdx) => (
                            <Badge key={tierIdx} variant={plan.isFree ? "outline" : "secondary"} className="text-xs">
                              {tier.name}: {tier.price}{tier.period && tier.period !== "pricing" ? tier.period : ""}
                            </Badge>
                          ))}
                        </div>
                        {plan.premiumWaitlist && (
                          <Badge variant="outline" className="mt-2 border-orange-500 text-orange-600">
                            Premium Waitlist Available
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-base mt-3">{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex gap-3">
                        <Link href={plan.link} className="flex-1">
                          <Button className="w-full" variant="outline" data-testid={`button-learn-${plan.name.toLowerCase().replace(' ', '-')}`}>
                            Learn More
                          </Button>
                        </Link>
                        {plan.externalLink ? (
                          <a href={plan.externalLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                            <Button className={`w-full bg-gradient-to-r ${plan.gradient} text-white border-0 hover:opacity-90`} data-testid={`button-start-${plan.name.toLowerCase().replace(' ', '-')}`}>
                              Get Started →
                            </Button>
                          </a>
                        ) : plan.isFree ? (
                          <Link href={plan.link} className="flex-1">
                            <Button className={`w-full bg-gradient-to-r ${plan.gradient} text-white border-0 hover:opacity-90`} data-testid={`button-start-${plan.name.toLowerCase().replace(' ', '-')}`}>
                              {plan.premiumWaitlist ? 'Start Free' : 'Get Started'}
                            </Button>
                          </Link>
                        ) : (
                          <Link href="/contact" className="flex-1">
                            <Button className={`w-full bg-gradient-to-r ${plan.gradient} text-white border-0 hover:opacity-90`} data-testid={`button-contact-${plan.name.toLowerCase().replace(' ', '-')}`}>
                              Get Quote
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Free Tools */}
            <section className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Free Tools</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Professional QR code generation tool available at no cost
                </p>
              </div>
              
              <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl">QR Gen Pro</CardTitle>
                    <Badge className="bg-green-500 text-white text-lg px-4 py-2">FREE</Badge>
                  </div>
                  <CardDescription className="text-base">
                    Create and share QR codes instantly - completely free forever!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a href="https://qr-gen.ruvab.it.com" target="_blank" rel="noopener noreferrer">
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover:opacity-90 w-full" size="lg" data-testid="button-qr-gen-tool">
                      Try QR Gen Pro Free →
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-16">
            {/* Service Plans */}
            <section>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Technology Service Plans</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Comprehensive technology solutions tailored to your business size
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {servicePlans.map((plan, index) => (
                  <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 shadow-2xl scale-105' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                          Best Value
                        </span>
                      </div>
                    )}
                    <CardHeader className="text-center pb-8">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                        {plan.icon}
                      </div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <div className="mt-4">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{plan.period}</p>
                      </div>
                      <CardDescription className="text-base mt-2">{plan.description}</CardDescription>
                      <Badge variant="outline" className="mt-3">{plan.services}</Badge>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600 dark:text-gray-300 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Link href="/contact">
                        <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 hover:opacity-90" data-testid={`button-get-${plan.name.toLowerCase()}`}>
                          Get Started
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Individual Service Categories */}
            <section className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">À La Carte Services</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Individual technology solutions priced by project scope
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {serviceCategories.map((category, index) => (
                  <Card key={index} className="hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <div className={`w-12 h-12 bg-gradient-to-br ${category.gradient} rounded-lg flex items-center justify-center mb-3 text-white shadow-md`}>
                        {category.icon}
                      </div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Starting at</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{category.startingPrice}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{category.priceNote}</p>
                      </div>
                      <Link href="/contact">
                        <Button variant="outline" className="w-full" data-testid={`button-${category.name.toLowerCase().replace(' ', '-')}`}>
                          Request Quote
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>
        </Tabs>

        {/* Value Proposition */}
        <section className="mt-20 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose Ruvab IT?</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                  <Users className="h-8 w-8" />
                </div>
                <CardTitle>Expert Team</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Dedicated specialists with deep expertise in AI, cloud, and enterprise technology solutions
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                  <Sparkles className="h-8 w-8" />
                </div>
                <CardTitle>Custom Solutions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Tailored technology solutions designed specifically for your business needs and goals
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                  <Shield className="h-8 w-8" />
                </div>
                <CardTitle>Proven Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Track record of successful implementations and measurable business impact across industries
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center mt-20 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-2xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Get in touch for a free consultation and customized pricing based on your specific requirements
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100" data-testid="button-contact-sales">
                Contact Sales Team
              </Button>
            </Link>
            <Link href="/partnership">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" data-testid="button-view-services">
                Explore Partnership Options
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
      <GoToTopButton />
    </div>
  );
};

export default PricingPage;
