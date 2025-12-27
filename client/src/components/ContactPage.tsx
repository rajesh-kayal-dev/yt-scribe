import { motion } from 'motion/react';
import { Mail, Send, MapPin, Phone, Github, Linkedin } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';
import { useState } from 'react';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock form submission
    toast.success('Message sent successfully! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const teamMembers = [
    {
      name: 'Bhavesh Mahawar',
      role: 'UI/UX & Front-End Developer',
      email: 'bhaveshmahawar97@gmail.com',
      github: '#', // Placeholder
      image: '../public/Bhavesh.png',
    },
    {
      name: 'Rajesh Kayal',
      role: 'Back-End & AI Developer',
      email: 'rajeshkalay8001@gmail.com',
      github: 'https://github.com/rajesh-kayal-dev',
      image: '../public/Rajesh.png',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-3 rounded-full mb-6">
          <Mail className="w-5 h-5 text-primary" />
          <span className="text-sm">Get In Touch</span>
        </div>

        <h1 className="text-4xl md:text-6xl mb-4">
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Contact Us
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8 border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <h2 className="text-2xl mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Subject</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="What is this about?"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Message</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us more..."
                  rows={6}
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white">
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Contact Info & Social */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Quick Contact */}
          <Card className="p-8 border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <h2 className="text-2xl mb-6">Quick Contact</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email Us</p>
                  <a href="mailto:bhaveshmahawar97@gmail.com" className="hover:text-primary transition-colors">
                    bhaveshmahawar97@gmail.com
                  </a>
                  <br />
                  <a href="mailto:rajeshkalay8001@gmail.com" className="hover:text-primary transition-colors">
                    rajeshkalay8001@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Location</p>
                  <p>Dev Bhoomi Uttarakhand University</p>
                  <p>Dehradun, Uttarakhand, India</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Github className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">GitHub</p>
                  <a 
                    href="https://github.com/rajesh-kayal-dev" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    @rajesh-kayal-dev
                  </a>
                </div>
              </div>
            </div>
          </Card>

          {/* Office Hours */}
          <Card className="p-8 border-primary/20 bg-gradient-to-br from-card to-accent/5">
            <h3 className="text-xl mb-4">Response Time</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email Response:</span>
                <span>Within 24 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Support Hours:</span>
                <span>9 AM - 6 PM IST</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Days:</span>
                <span>Monday - Saturday</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Team Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-3xl text-center mb-8">Meet the Team</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <Card className="p-6 border-primary/20 bg-gradient-to-br from-card to-primary/5 text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover border-4 border-primary/20"
                  />
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                </div>

                <h3 className="text-xl mb-1">{member.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{member.role}</p>

                <div className="flex items-center justify-center gap-3 mb-4">
                  <a
                    href={`mailto:${member.email}`}
                    className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                  >
                    <Mail className="w-4 h-4 text-primary" />
                  </a>
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                  >
                    <Github className="w-4 h-4 text-primary" />
                  </a>
                </div>

                <a
                  href={`mailto:${member.email}`}
                  className="text-sm text-primary hover:underline"
                >
                  {member.email}
                </a>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
