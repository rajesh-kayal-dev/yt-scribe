import { motion, AnimatePresence } from 'motion/react';
import { Crown, X, Sparkles, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useEffect, useState } from 'react';

interface PremiumNewsletterPopupProps {
  onUpgrade: () => void;
  isPremium: boolean;
}

export function PremiumNewsletterPopup({ onUpgrade, isPremium }: PremiumNewsletterPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isPremium || isDismissed) return;

    // Show popup every 60 seconds (1 minute)
    const interval = setInterval(() => {
      setIsVisible(true);
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 10000);
    }, 60000);

    // Show initial popup after 10 seconds
    const initialTimeout = setTimeout(() => {
      setIsVisible(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 10000);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [isPremium, isDismissed]);

  const handleClose = () => {
    setIsVisible(false);
    setIsDismissed(true);
    // Reset dismiss after 5 minutes to show again
    setTimeout(() => {
      setIsDismissed(false);
    }, 300000);
  };

  const handleUpgrade = () => {
    setIsVisible(false);
    onUpgrade();
  };

  if (isPremium) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Popup Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
          >
            <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-card via-primary/5 to-accent/5">
              {/* Animated Background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl" />
              <motion.div
                className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 8, repeat: Infinity }}
              />

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-background/80 hover:bg-background flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Content */}
              <div className="relative z-10 p-8">
                {/* Icon */}
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Crown className="w-8 h-8 text-white" />
                </motion.div>

                {/* Heading */}
                <h3 className="text-2xl text-center mb-2">
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Unlock Premium Features
                  </span>
                </h3>
                <p className="text-center text-muted-foreground mb-6">
                  Upgrade now and enjoy an ad-free experience with unlimited features
                </p>

                {/* Benefits */}
                <div className="space-y-3 mb-6">
                  {[
                    { icon: X, text: 'Remove all ads & popups' },
                    { icon: Zap, text: 'Faster AI processing' },
                    { icon: Sparkles, text: 'Advanced analytics' },
                    { icon: Crown, text: 'Creator upload tools' },
                  ].map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span>{benefit.text}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="bg-background/50 rounded-lg p-4 mb-6 text-center">
                  <div className="flex items-baseline justify-center gap-2 mb-1">
                    <span className="text-3xl">₹49</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-through">₹299/month</p>
                  <p className="text-sm text-green-600 mt-1">Save 83% - Limited Time Offer!</p>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleUpgrade}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white h-12"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                  <Button
                    onClick={handleClose}
                    variant="ghost"
                    className="w-full"
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
