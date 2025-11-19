import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Search, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  askCount: number;
}

const CATEGORIES = [
  { value: 'all', label: 'All Questions' },
  { value: 'ai-solutions', label: 'AI Solutions' },
  { value: 'software-dev', label: 'Software Development' },
  { value: 'tools', label: 'Tools' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'support', label: 'Support' },
  { value: 'general', label: 'General' },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: faqsData, isLoading } = useQuery<{ success: boolean; faqs: FAQ[] }>({
    queryKey: ['/api/chat/faqs'],
  });

  const faqs = faqsData?.faqs || [];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const faqsByCategory = CATEGORIES.slice(1).map(cat => ({
    ...cat,
    count: faqs.filter(f => f.category === cat.value).length
  }));

  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions - Ruvab IT Support | AI Solutions, Software Development</title>
        <meta 
          name="description" 
          content="Find answers to common questions about Ruvab IT's AI solutions, software development services, tools, and pricing. Get instant help with our comprehensive FAQ section." 
        />
        <meta name="keywords" content="FAQ, support, help, AI solutions, software development, Ruvab IT, questions, answers" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <Header />

        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-full mb-4">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get instant answers to common questions about our AI solutions, software development services, and tools.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
                data-testid="input-faq-search"
              />
            </div>
          </div>

          {/* Category Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {faqsByCategory.map((cat) => (
              <Card 
                key={cat.value}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedCategory === cat.value 
                    ? 'ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-950' 
                    : ''
                }`}
                onClick={() => setSelectedCategory(cat.value)}
                data-testid={`card-category-${cat.value}`}
              >
                <CardHeader className="p-4 text-center">
                  <CardTitle className="text-sm">{cat.label}</CardTitle>
                  <Badge variant="secondary" className="mt-2">
                    {cat.count} {cat.count === 1 ? 'question' : 'questions'}
                  </Badge>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* FAQs */}
          <Card className="max-w-5xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {selectedCategory === 'all' 
                      ? 'All Questions' 
                      : CATEGORIES.find(c => c.value === selectedCategory)?.label
                    }
                  </CardTitle>
                  <CardDescription>
                    {filteredFAQs.length} {filteredFAQs.length === 1 ? 'question' : 'questions'} found
                    {searchQuery && ` matching "${searchQuery}"`}
                  </CardDescription>
                </div>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="text-sm text-blue-600 hover:underline"
                  data-testid="button-show-all"
                >
                  Show All
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading FAQs...</p>
                </div>
              ) : filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No questions found. Try adjusting your search or category filter.
                  </p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFAQs.map((faq, index) => (
                    <AccordionItem key={faq.id} value={`item-${faq.id}`}>
                      <AccordionTrigger 
                        className="text-left hover:no-underline"
                        data-testid={`accordion-trigger-faq-${faq.id}`}
                      >
                        <div className="flex-1 pr-4">
                          <div className="font-semibold text-base mb-2">
                            {faq.question}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {CATEGORIES.find(c => c.value === faq.category)?.label || faq.category}
                            </Badge>
                            {faq.tags.slice(0, 3).map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {faq.askCount > 5 && (
                              <Badge variant="default" className="text-xs bg-gradient-to-r from-blue-600 to-purple-600">
                                Popular
                              </Badge>
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div 
                          className="prose prose-sm dark:prose-invert max-w-none pl-4 pt-2"
                          dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\n/g, '<br />') }}
                          data-testid={`text-faq-answer-${faq.id}`}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>

          {/* Contact CTA */}
          <div className="mt-12 text-center">
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10">
              <CardHeader>
                <CardTitle>Can't find what you're looking for?</CardTitle>
                <CardDescription>
                  Our support team is here to help you with any questions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                    data-testid="link-contact"
                  >
                    Contact Support
                  </a>
                  <a
                    href="/live-chat"
                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 transition-all"
                    data-testid="link-live-chat"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Live Chat
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
