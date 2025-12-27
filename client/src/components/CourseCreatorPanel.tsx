import { motion } from 'motion/react';
import { Upload, X, Plus, Image, DollarSign, Palette, Layout, Eye, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { useState } from 'react';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { createCourse } from '../api/courses';

interface CourseCreatorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated?: (course: any) => void;
}

export function CourseCreatorPanel({ isOpen, onClose, onCourseCreated }: CourseCreatorPanelProps) {
  const [step, setStep] = useState<'details' | 'videos' | 'customize' | 'pricing' | 'uploading' | 'preview'>('details');
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    thumbnail: null as File | null,
    videos: [] as File[],
    colorTheme: 'blue',
    thumbnailStyle: 'modern',
    layoutSkin: 'standard',
    price: '999',
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCourseData({ ...courseData, thumbnail: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success('Thumbnail uploaded');
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setCourseData({ ...courseData, videos: [...courseData.videos, ...files] });
    toast.success(`${files.length} video(s) added`);
  };

  const removeVideo = (index: number) => {
    const newVideos = courseData.videos.filter((_, i) => i !== index);
    setCourseData({ ...courseData, videos: newVideos });
  };

  const handleUpload = async () => {
    try {
      setStep('uploading');
      setUploadProgress(10);
      // Prepare payload
      const payload: any = {
        title: courseData.title.trim(),
        description: courseData.description.trim(),
        category: courseData.category,
        price: parseFloat(courseData.price) || 0,
        currency: 'INR',
        level: 'Beginner',
        status: 'pending',
        thumbnailUrl: thumbnailPreview || '',
        videos: [],
      };

      setUploadProgress(35);
      const resp = await createCourse(payload);
      setUploadProgress(85);

      if (onCourseCreated) onCourseCreated(resp?.data?.course || resp?.course);
      setUploadProgress(100);
      setTimeout(() => {
        setStep('preview');
        toast.success('Course created successfully!');
      }, 300);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create course');
      setStep('pricing');
    }
  };

  const handlePublish = () => {
    if (onCourseCreated) {
      onCourseCreated(courseData);
    }
    toast.success('Course published successfully!');
    onClose();
  };

  if (!isOpen) return null;

  const colorThemes = [
    { value: 'blue', label: 'Ocean Blue', color: 'from-blue-500 to-cyan-500' },
    { value: 'purple', label: 'Royal Purple', color: 'from-purple-500 to-pink-500' },
    { value: 'green', label: 'Forest Green', color: 'from-green-500 to-emerald-500' },
    { value: 'orange', label: 'Sunset Orange', color: 'from-orange-500 to-red-500' },
  ];

  const thumbnailStyles = [
    { value: 'modern', label: 'Modern', preview: 'Minimalist with gradients' },
    { value: 'bold', label: 'Bold', preview: 'High contrast & vibrant' },
    { value: 'elegant', label: 'Elegant', preview: 'Clean & professional' },
    { value: 'playful', label: 'Playful', preview: 'Fun & colorful' },
  ];

  const layoutSkins = [
    { value: 'standard', label: 'Standard', description: 'Classic layout' },
    { value: 'compact', label: 'Compact', description: 'Space-efficient' },
    { value: 'expanded', label: 'Expanded', description: 'Large thumbnails' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto"
    >
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 border-b border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl mb-1">Course Creator Studio</h2>
                  <p className="text-sm text-muted-foreground">Create and sell your custom courses</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-2 mt-6">
                {['Details', 'Videos', 'Customize', 'Pricing', 'Preview'].map((label, index) => {
                  const steps = ['details', 'videos', 'customize', 'pricing', 'preview'];
                  const currentIndex = steps.indexOf(step);
                  const isActive = index === currentIndex;
                  const isCompleted = index < currentIndex;

                  return (
                    <div key={label} className="flex items-center gap-2 flex-1">
                      <div className={`flex items-center gap-2 flex-1 ${isActive || isCompleted ? '' : 'opacity-50'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                          isCompleted ? 'bg-green-500 text-white' : 
                          isActive ? 'bg-primary text-white' : 
                          'bg-muted text-muted-foreground'
                        }`}>
                          {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                        </div>
                        <span className="text-xs hidden md:inline">{label}</span>
                      </div>
                      {index < 4 && <div className="w-8 h-0.5 bg-muted" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Step 1: Course Details */}
              {step === 'details' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm mb-2">Course Title</label>
                    <Input
                      value={courseData.title}
                      onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                      placeholder="e.g., Complete Web Development Bootcamp"
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Description</label>
                    <Textarea
                      value={courseData.description}
                      onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                      placeholder="Describe what students will learn..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Category</label>
                    <Select value={courseData.category} onValueChange={(value) => setCourseData({ ...courseData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="programming">Programming</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="personal">Personal Development</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Course Thumbnail</label>
                    <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center">
                      {thumbnailPreview ? (
                        <div className="relative">
                          <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-48 object-cover rounded-lg mb-3" />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCourseData({ ...courseData, thumbnail: null });
                              setThumbnailPreview('');
                            }}
                          >
                            Remove Thumbnail
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Image className="w-12 h-12 mx-auto mb-3 text-primary" />
                          <p className="text-sm text-muted-foreground mb-3">Upload course thumbnail (16:9 aspect ratio recommended)</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailUpload}
                            className="hidden"
                            id="thumbnail-upload"
                          />
                          <label htmlFor="thumbnail-upload">
                            <Button asChild variant="outline">
                              <span>Choose Image</span>
                            </Button>
                          </label>
                        </>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => setStep('videos')}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white"
                    disabled={!courseData.title || !courseData.description}
                  >
                    Continue to Videos
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Upload Videos */}
              {step === 'videos' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <h3 className="mb-2">Upload Course Videos</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag and drop or click to upload MP4, MOV, or AVI files
                    </p>
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={handleVideoUpload}
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload">
                      <Button asChild>
                        <span>
                          <Plus className="w-4 h-4 mr-2" />
                          Select Videos
                        </span>
                      </Button>
                    </label>
                  </div>

                  {/* Video List */}
                  {courseData.videos.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm">Uploaded Videos ({courseData.videos.length})</h4>
                      {courseData.videos.map((video, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                              <Upload className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm">{video.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(video.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeVideo(index)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep('details')} className="flex-1">
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep('customize')}
                      className="flex-1 bg-gradient-to-r from-primary to-accent text-white"
                      disabled={courseData.videos.length === 0}
                    >
                      Continue to Customize
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Customize */}
              {step === 'customize' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm mb-3">
                      <Palette className="w-4 h-4 inline mr-2" />
                      Color Theme
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {colorThemes.map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => setCourseData({ ...courseData, colorTheme: theme.value })}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            courseData.colorTheme === theme.value ? 'border-primary' : 'border-muted'
                          }`}
                        >
                          <div className={`h-12 rounded bg-gradient-to-r ${theme.color} mb-2`} />
                          <p className="text-sm">{theme.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-3">
                      <Image className="w-4 h-4 inline mr-2" />
                      Thumbnail Style
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {thumbnailStyles.map((style) => (
                        <button
                          key={style.value}
                          onClick={() => setCourseData({ ...courseData, thumbnailStyle: style.value })}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            courseData.thumbnailStyle === style.value ? 'border-primary' : 'border-muted'
                          }`}
                        >
                          <p className="text-sm mb-1">{style.label}</p>
                          <p className="text-xs text-muted-foreground">{style.preview}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-3">
                      <Layout className="w-4 h-4 inline mr-2" />
                      Layout Skin
                    </label>
                    <Select value={courseData.layoutSkin} onValueChange={(value) => setCourseData({ ...courseData, layoutSkin: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {layoutSkins.map((skin) => (
                          <SelectItem key={skin.value} value={skin.value}>
                            {skin.label} - {skin.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep('videos')} className="flex-1">
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep('pricing')}
                      className="flex-1 bg-gradient-to-r from-primary to-accent text-white"
                    >
                      Continue to Pricing
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Pricing */}
              {step === 'pricing' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg">
                    <h3 className="mb-2">Stripe Integration</h3>
                    <p className="text-sm text-muted-foreground">
                      Set your course price. Stripe will handle all payments securely.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">
                      <DollarSign className="w-4 h-4 inline mr-2" />
                      Course Price (INR)
                    </label>
                    <Input
                      type="number"
                      value={courseData.price}
                      onChange={(e) => setCourseData({ ...courseData, price: e.target.value })}
                      placeholder="999"
                      className="h-12"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      You'll receive 80% of the sale (Platform fee: 20%)
                    </p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Course Price:</span>
                      <span>₹{courseData.price}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Platform Fee (20%):</span>
                      <span>- ₹{(parseInt(courseData.price) * 0.2).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-primary/10">
                      <span>Your Earnings:</span>
                      <span className="text-green-600">₹{(parseInt(courseData.price) * 0.8).toFixed(0)}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep('customize')} className="flex-1">
                      Back
                    </Button>
                    <Button
                      onClick={handleUpload}
                      className="flex-1 bg-gradient-to-r from-primary to-accent text-white"
                    >
                      Create Course
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Uploading */}
              {step === 'uploading' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center"
                >
                  <motion.div
                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Upload className="w-10 h-10 text-white" />
                  </motion.div>

                  <h3 className="text-2xl mb-2">Creating Your Course</h3>
                  <p className="text-muted-foreground mb-6">Please wait while we process your videos...</p>

                  <div className="max-w-md mx-auto">
                    <Progress value={uploadProgress} className="mb-2" />
                    <p className="text-sm text-muted-foreground">{uploadProgress}% Complete</p>
                  </div>
                </motion.div>
              )}

              {/* Step 6: Preview */}
              {step === 'preview' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl mb-2">Course Created Successfully!</h3>
                    <p className="text-muted-foreground">Review your course details below</p>
                  </div>

                  <Card className="p-6 border-primary/20">
                    <h4 className="mb-4">Course Preview</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Title</p>
                        <p>{courseData.title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="text-sm">{courseData.description}</p>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Videos</p>
                          <p>{courseData.videos.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p>₹{courseData.price}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Theme</p>
                          <p className="capitalize">{courseData.colorTheme}</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep('details')} className="flex-1">
                      Edit Course
                    </Button>
                    <Button
                      onClick={handlePublish}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Publish Course
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}