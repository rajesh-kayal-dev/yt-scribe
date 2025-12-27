import { useState } from 'react';
import { motion } from 'motion/react';
import { Download, Wand2, Upload, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';

export function ThumbnailSection() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [generatedThumbnail, setGeneratedThumbnail] = useState('');

  const handleDownload = () => {
    if (!url) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setThumbnails([
        'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
        'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800',
        'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800',
      ]);
      setLoading(false);
      toast.success('Thumbnails loaded!');
    }, 1500);
  };

  const handleGenerate = () => {
    setLoading(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedThumbnail('https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800');
      setLoading(false);
      toast.success('Thumbnail generated!');
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Thumbnail Studio
        </h1>
        <p className="text-muted-foreground text-lg">
          Download existing thumbnails or generate new ones with AI
        </p>
      </motion.div>

      <Tabs defaultValue="download" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="download">Download</TabsTrigger>
          <TabsTrigger value="generate">Generate</TabsTrigger>
        </TabsList>

        {/* Download Tab */}
        <TabsContent value="download">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-8 mb-8 border-primary/20 bg-gradient-to-br from-card to-primary/5">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 h-12"
                />
                <Button
                  onClick={handleDownload}
                  disabled={loading}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white h-12 px-8"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Get Thumbnails
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {thumbnails.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid md:grid-cols-3 gap-6"
              >
                {thumbnails.map((thumb, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="group relative"
                  >
                    <Card className="overflow-hidden border-primary/20 hover:border-primary/50 transition-all">
                      <img
                        src={thumb}
                        alt={`Thumbnail ${i + 1}`}
                        className="w-full aspect-video object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = thumb;
                            a.download = `thumbnail-${i + 1}.jpg`;
                            a.click();
                            toast.success('Downloaded!');
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </Card>
                    <p className="text-center mt-2 text-sm text-muted-foreground">
                      Quality: {['Max', 'High', 'Standard'][i]}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </TabsContent>

        {/* Generate Tab */}
        <TabsContent value="generate">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-8 mb-8 border-primary/20 bg-gradient-to-br from-card to-primary/5">
              <div className="space-y-4">
                <Input
                  placeholder="Video title or description..."
                  className="h-12"
                />
                <Input
                  placeholder="Style keywords (e.g., 'modern', 'vibrant', 'minimalist')"
                  className="h-12"
                />
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white h-12"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 mr-2" />
                      Generate AI Thumbnail
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {generatedThumbnail && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="overflow-hidden border-primary/20 max-w-2xl mx-auto">
                  <img
                    src={generatedThumbnail}
                    alt="Generated thumbnail"
                    className="w-full aspect-video object-cover"
                  />
                  <div className="p-6 space-y-4">
                    <div className="flex gap-4">
                      <Button className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Wand2 className="w-4 h-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
