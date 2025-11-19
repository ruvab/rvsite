import { DollarSign, TrendingUp, BarChart3, Zap, Users, CheckCircle, Star, Target } from 'lucide-react';
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import GoToTopButton from "@/components/GoToTopButton";

const RevenueAI = () => {

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>RevenueAI - AI-Powered Revenue Optimization | Ruvab IT</title>
        <meta name="description" content="Maximize your monetization potential with RevenueAI's intelligent revenue optimization platform. Advanced analytics, predictive modeling, and automated strategies." />
        <meta name="keywords" content="revenue optimization, AI monetization, predictive analytics, revenue intelligence, automated revenue strategies, revenue analytics" />
        <link rel="canonical" href="https://ruvab.it.com/revenueai" />
        
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-487BHE09VJ'}`}></script>
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-487BHE09VJ'}');
          `}
        </script>

        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4204204667108655" crossOrigin="anonymous"></script>
        
        <script async src="https://js.mbidadm.com/static/scripts.js" data-admpid="367193"></script>
      </Helmet>
      
      <Header />

      <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-4">
                <DollarSign className="h-12 w-12 text-emerald-300 mr-4" />
                <h1 className="text-5xl font-bold">RevenueAI</h1>
              </div>
              <p className="text-2xl text-emerald-100 mb-8 leading-relaxed">
                Maximize your monetization potential with intelligent AI-powered revenue optimization and predictive analytics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button 
                  onClick={() => window.location.href = 'https://revenueai.ruvab.it.com'}
                  className="bg-white text-emerald-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-50 transition-colors"
                  data-testid="button-launch-revenueai"
                >
                  Launch RevenueAI
                </button>
                <button 
                  onClick={() => window.location.href = '/contact'}
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-emerald-900 transition-colors"
                  data-testid="button-contact"
                >
                  Contact Sales
                </button>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-emerald-100">AI-Powered Insights</span>
                </div>
                <div className="text-emerald-100">Real-time Optimization</div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Revenue Analytics Dashboard" 
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Intelligent Revenue Optimization Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Leverage cutting-edge AI technology to maximize your revenue streams and optimize monetization strategies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Predictive Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced AI algorithms predict revenue trends and identify optimization opportunities before they happen.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-time Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Monitor revenue performance in real-time with comprehensive analytics and actionable insights.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Automated Optimization</h3>
              <p className="text-gray-600 leading-relaxed">
                Let AI automatically optimize your revenue strategies based on performance data and market conditions.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Revenue Targeting</h3>
              <p className="text-gray-600 leading-relaxed">
                Set intelligent revenue targets and track progress with AI-powered forecasting and goal management.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Customer Segmentation</h3>
              <p className="text-gray-600 leading-relaxed">
                Identify high-value customer segments and optimize pricing strategies for maximum revenue potential.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Performance Tracking</h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive performance metrics and KPI tracking to measure the impact of optimization strategies.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-emerald-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose RevenueAI?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join leading businesses using AI to transform their revenue operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-emerald-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Intelligence</h3>
                <p className="text-gray-600">
                  Advanced machine learning models that continuously learn and improve your revenue strategies.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-emerald-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Seamless Integration</h3>
                <p className="text-gray-600">
                  Connect with your existing tools and platforms for unified revenue management.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-emerald-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Actionable Insights</h3>
                <p className="text-gray-600">
                  Get clear, actionable recommendations that drive measurable revenue growth.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-emerald-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise Security</h3>
                <p className="text-gray-600">
                  Bank-level security and compliance to protect your sensitive revenue data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Optimize Your Revenue?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of businesses already using RevenueAI to maximize their monetization potential.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.href = 'https://revenueai.ruvab.it.com'}
              className="bg-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-700 transition-colors"
              data-testid="button-get-started"
            >
              Get Started Now
            </button>
            <button 
              onClick={() => window.location.href = '/contact'}
              className="border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-50 transition-colors"
              data-testid="button-schedule-demo"
            >
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>

      <GoToTopButton />
      <Footer />
    </div>
  );
};

export default RevenueAI;
