import { motion } from 'motion/react';
import { Crown, Check, Sparkles, Zap, TrendingUp, Unlock, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useState } from 'react';

export function PremiumPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Student Plan',
      price: billingCycle === 'monthly' ? '₹49' : '₹490',
      originalPrice: '₹299',
      savings: '83%',
      description: 'Perfect for students on a budget',
      features: [
        'Ad-free experience',
        'Remove newsletter popups',
        'Unlimited playlists',
        'AI note generation',
        'Basic analytics',
        'PDF/DOCX export',
        'Priority support',
      ],
      popular: true,
      gradient: 'from-blue-500 to-purple-600',
    },
    {
      name: 'General Offer',
      price: billingCycle === 'monthly' ? '₹99' : '₹990',
      originalPrice: '₹299',
      savings: '67%',
      description: 'Great value for everyone',
      features: [
        'Everything in Student Plan',
        'Advanced analytics',
        'Habit tracking',
        'Learning streaks',
        'Custom themes',
        'Faster AI processing',
        '24/7 support',
      ],
      popular: false,
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      name: 'Creator Pro',
      price: billingCycle === 'monthly' ? '₹299' : '₹2,990',
      originalPrice: '₹599',
      savings: '50%',
      description: 'For content creators & course sellers',
      features: [
        'Everything in General Plan',
        'Upload custom courses',
        'Course customization tools',
        'Stripe payment integration',
        'Sales analytics',
        'Student management',
        'Revenue tracking',
        'Custom branding',
      ],
      popular: false,
      gradient: 'from-orange-500 to-red-600',
    },
  ];

  const handleCheckout = (planName: string, price: string) => {
    // Stripe checkout integration would go here
    console.log('Checkout:', planName, price);
    alert(`Redirecting to Stripe checkout for ${planName} - ${price}`);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <motion.div
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-3 rounded-full mb-6"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Crown className="w-5 h-5 text-primary" />
          <span className="text-sm">Unlock Premium Features</span>
          <Sparkles className="w-5 h-5 text-accent" />
        </motion.div>

        <h1 className="text-4xl md:text-6xl mb-4">
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Upgrade to Premium
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Unlock unlimited learning potential with advanced features and creator tools
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="relative w-14 h-7 bg-primary/20 rounded-full transition-colors hover:bg-primary/30"
          >
            <motion.div
              className="absolute top-1 w-5 h-5 bg-primary rounded-full"
              animate={{ left: billingCycle === 'monthly' ? 4 : 32 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}>
            Yearly
          </span>
          {billingCycle === 'yearly' && (
            <Badge className="bg-green-500 text-white">Save 20%</Badge>
          )}
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative"
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <Badge className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1">
                  Most Popular
                </Badge>
              </div>
            )}

            <Card className={`h-full p-8 ${plan.popular ? 'border-primary/50 border-2' : 'border-primary/20'} bg-gradient-to-br from-card to-primary/5 overflow-hidden relative`}>
              {/* Background Gradient */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${plan.gradient} opacity-10 rounded-full blur-3xl`} />

              <div className="relative z-10">
                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-2xl mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl">{plan.price}</span>
                    <span className="text-muted-foreground">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground line-through">{plan.originalPrice}</span>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                      Save {plan.savings}
                    </Badge>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={() => handleCheckout(plan.name, plan.price)}
                  className={`w-full ${plan.popular ? `bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white` : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.popular ? (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Get Started Now
                    </>
                  ) : (
                    'Choose Plan'
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Premium Benefits Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-16"
      >
        <h2 className="text-3xl text-center mb-8">
          Why Go Premium?
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: X,
              title: 'No Ads',
              description: 'Enjoy a completely ad-free learning experience',
              color: 'text-red-500',
            },
            {
              icon: Unlock,
              title: 'Unlimited Access',
              description: 'Create unlimited playlists and notes',
              color: 'text-blue-500',
            },
            {
              icon: Zap,
              title: 'Faster AI',
              description: 'Priority AI processing for instant notes',
              color: 'text-yellow-500',
            },
            {
              icon: TrendingUp,
              title: 'Advanced Analytics',
              description: 'Track your progress with detailed insights',
              color: 'text-green-500',
            },
          ].map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <Card className="p-6 text-center border-primary/20 hover:border-primary/50 transition-all">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 mb-4`}>
                  <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                </div>
                <h3 className="mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <h2 className="text-3xl text-center mb-8">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {[
            {
              q: 'Can I cancel anytime?',
              a: 'Yes! You can cancel your subscription at any time. Your premium features will remain active until the end of your billing period.',
            },
            {
              q: 'What payment methods do you accept?',
              a: 'We accept all major credit/debit cards, UPI, and net banking through our secure Stripe payment gateway.',
            },
            {
              q: 'Is there a free trial?',
              a: 'Yes! All new users get a 7-day free trial of Premium features. No credit card required.',
            },
            {
              q: 'Can I upgrade or downgrade my plan?',
              a: 'Absolutely! You can change your plan at any time and the price will be prorated accordingly.',
            },
          ].map((faq, index) => (
            <Card key={index} className="p-6 border-primary/20">
              <h3 className="mb-2">{faq.q}</h3>
              <p className="text-sm text-muted-foreground">{faq.a}</p>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Money Back Guarantee */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center mt-16 p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-4">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl mb-2">30-Day Money Back Guarantee</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Not satisfied? Get a full refund within 30 days, no questions asked.
        </p>
      </motion.div>
    </div>
  );
}
