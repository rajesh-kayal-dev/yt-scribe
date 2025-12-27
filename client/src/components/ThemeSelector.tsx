import { motion } from 'motion/react';
import { Palette } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useTheme } from './ThemeProvider';

const themes = [
  { id: 'purple-haze', name: 'Purple Haze', colors: ['#a855f7', '#ec4899'] },
  { id: 'ocean-breeze', name: 'Ocean Breeze', colors: ['#0ea5e9', '#06b6d4'] },
  { id: 'sunset-glow', name: 'Sunset Glow', colors: ['#f97316', '#f43f5e'] },
  { id: 'midnight-neon', name: 'Midnight Neon', colors: ['#8b5cf6', '#06b6d4'] },
  { id: 'forest-mist', name: 'Forest Mist', colors: ['#10b981', '#14b8a6'] },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative overflow-hidden group">
          <Palette className="w-5 h-5 relative z-10" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-20"
            transition={{ duration: 0.3 }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-3">
          <h3 className="text-sm">Choose Your Vibe</h3>
          <div className="grid gap-2">
            {themes.map((t) => (
              <motion.button
                key={t.id}
                onClick={() => setTheme(t.id as any)}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                  theme === t.id
                    ? 'border-primary bg-primary/10'
                    : 'border-transparent bg-accent/5 hover:border-accent/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex gap-1">
                  {t.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full"
                      style={{ background: color }}
                    />
                  ))}
                </div>
                <span className="text-sm">{t.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
