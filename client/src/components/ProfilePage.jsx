import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Camera, ArrowLeft } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { toast } from 'sonner';
import { updateProfile } from '../api/auth';

export function ProfilePage({ user, onProfileUpdated, setActiveSection }) {
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [previewUrl, setPreviewUrl] = useState(user?.avatarUrl || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
      setPreviewUrl(user.avatarUrl || '');
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      toast.error('Please log in to view your profile');
      setActiveSection('login');
    }
  }, [user, setActiveSection]);

  const displayName = user?.name || user?.email || 'Guest';
  const initials = displayName
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setAvatarUrl(result);
        setPreviewUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      toast.error('You need to be logged in to update your profile.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name,
        bio,
        avatarUrl,
      };

      const data = await updateProfile(payload);
      if (onProfileUpdated) {
        onProfileUpdated(data.user);
      }
      toast.success(data.message || 'Profile updated');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-accent/5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <Button
          variant="ghost"
          onClick={() => setActiveSection('home')}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>

        <Card className="p-8 border-primary/20 grid gap-8 md:grid-cols-[auto,1fr] items-start">
          {/* Avatar + basic info */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24 rounded-full overflow-hidden border shadow-sm flex items-center justify-center">
              {user?.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} className="object-cover w-full h-full" />
              ) : (
                <AvatarFallback className="bg-purple-500 text-white text-3xl font-bold flex items-center justify-center w-full h-full">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              )}
            </Avatar>

            <label className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer">
              <Camera className="w-4 h-4" />
              <span>Change picture</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <div className="text-center mt-2">
              <p className="font-semibold">{displayName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>

            <div className="mt-4 flex flex-col items-center gap-1 text-xs text-muted-foreground">
              <span>Role: {user.role}</span>
              <span>Provider: {user.provider}</span>
              {user.createdAt && (
                <span>
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Editable fields */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Profile</h2>
              <p className="text-sm text-muted-foreground">
                Update your account information and avatar.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Short Bio</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about your learning goals, favorite topics, or channels."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Avatar image URL (optional)</label>
              <Input
                type="url"
                value={avatarUrl}
                onChange={(e) => {
                  setAvatarUrl(e.target.value);
                  setPreviewUrl(e.target.value);
                }}
                placeholder="Paste an image URL if you prefer"
              />
              <p className="text-xs text-muted-foreground">
                You can either upload a picture above or paste any image URL here.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setName(user.name || '');
                  setBio(user.bio || '');
                  setAvatarUrl(user.avatarUrl || '');
                  setPreviewUrl(user.avatarUrl || '');
                }}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-primary to-accent text-white"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
