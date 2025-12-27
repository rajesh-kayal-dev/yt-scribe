import { useState, useEffect } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import TranscriptionSection from './components/TranscriptionSection';
import { TrendingNotes } from './components/TrendingNotes';
import { ThumbnailSection } from './components/ThumbnailSection';
import { TrendingTags } from './components/TrendingTags';
import { ChatbotFullScreen } from './components/ChatbotFullScreen';
import { ChatbotButton } from './components/ChatbotButton';
import { LearningJourney } from './components/LearningJourney';
import { MarketplacePage } from './components/MarketplacePage';
import { NotesCenter } from './components/NotesCenter';
import { LearningAnalytics } from './components/LearningAnalytics';
import { ServicesPage } from './components/ServicesPage';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { PremiumPage } from './components/PremiumPage';
import { AdminPanel } from './components/AdminPanel.jsx';
import { ProfilePage } from './components/ProfilePage.jsx';
import { LoginPage } from './components/Auth/LoginPage.jsx';
import { RegisterPage } from './components/Auth/RegisterPage.jsx';
import { ForgotPasswordPage } from './components/Auth/ForgotPasswordPage.jsx';
import { ResetPasswordPage } from './components/Auth/ResetPasswordPage.jsx';
import { AdminLoginPage } from './components/Auth/AdminLoginPage.jsx';
import { AuthSuccessPage } from './components/Auth/AuthSuccessPage.jsx';
import { PremiumNewsletterPopup } from './components/PremiumNewsletterPopup';
import { Footer } from './components/Footer';
import { getTranscriptById } from './api/transcript';
import { TranscriptDetail } from './components/TranscriptDetail';
import { YouTubeSummarizer } from './components/YouTubeSummarizer';
import { SummaryDetailView } from './components/SummaryDetailView';
import { Toaster } from './components/ui/sonner';
import { getCurrentUser, logoutUser } from './api/auth';
import { toast } from 'sonner';

// We keep section names as simple strings (no TypeScript types)
// "activeSection" controls which main page is shown

export default function App() {
  const [activeSection, setActiveSectionState] = useState('home');
  const [user, setUser] = useState(null); // store basic user info from backend
  const [isPremium, setIsPremium] = useState(false);
  const [transcriptId, setTranscriptId] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  const publicSections = ['home', 'login', 'register', 'forgot', 'reset-password', 'admin-login', 'auth-success'];
  const isAuthenticated = !!user;
  const isAdmin = !!user && user.role === 'admin';

  const setActiveSection = (section) => {
    if (section === 'admin' && !isAdmin) {
      setActiveSectionState('admin-login');
      return;
    }

    if (!isAuthenticated && !publicSections.includes(section)) {
      toast.error('Please log in to continue');
      setActiveSectionState('login');
      return;
    }

    setActiveSectionState(section);
  };

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await getCurrentUser();
        setUser(data.user || null);
      } catch (error) {
        // Not logged in or token invalid; ignore
      }
    }

    fetchUser();
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/reset-password') {
      setActiveSection('reset-password');
    } else if (path === '/admin/login') {
      setActiveSection('admin-login');
    } else if (path === '/admin') {
      setActiveSection('admin');
    } else if (path === '/auth/success') {
      setActiveSection('auth-success');
    } else if (path === '/login') {
      setActiveSection('login');
    } else if (path === '/playlists') {
      setActiveSection('playlist');
    }
  }, []);

  // Called by auth pages when navigation should change
  const handleAuthNavigation = (page) => {
    setActiveSection(page);
    if (page === 'home') {
      // When we come back home after login/register, the user is considered logged in
      // (user details come from the API response)
    }
  };

  // Called by Login/Register when backend login/register succeeds
  const handleAuthSuccess = (userData) => {
    setUser(userData || null);
    setActiveSection('home');
  };

  const handleAdminAuthSuccess = (userData) => {
    setUser(userData || null);
    setActiveSection('admin');
  };

  const handleUpgradeToPremium = () => {
    setActiveSection('premium');
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      // ignore client-side logout errors
    } finally {
      setUser(null);
      setActiveSection('login');
    }
  };

  // Auth pages don't need header/footer
  if (
    activeSection === 'login' ||
    activeSection === 'register' ||
    activeSection === 'forgot' ||
    activeSection === 'reset-password' ||
    activeSection === 'admin-login' ||
    activeSection === 'auth-success'
  ) {
    return (
      <ThemeProvider>
        {activeSection === 'login' && (
          <LoginPage
            onNavigate={handleAuthNavigation}
            onAuthSuccess={handleAuthSuccess}
          />
        )}
        {activeSection === 'register' && (
          <RegisterPage
            onNavigate={handleAuthNavigation}
            onAuthSuccess={handleAuthSuccess}
          />
        )}
        {activeSection === 'forgot' && (
          <ForgotPasswordPage onNavigate={handleAuthNavigation} />
        )}
        {activeSection === 'reset-password' && (
          <ResetPasswordPage onNavigate={handleAuthNavigation} />
        )}
        {activeSection === 'admin-login' && (
          <AdminLoginPage
            onNavigate={handleAuthNavigation}
            onAdminAuthSuccess={handleAdminAuthSuccess}
          />
        )}
        {activeSection === 'auth-success' && (
          <AuthSuccessPage
            onNavigate={handleAuthNavigation}
            onAuthSuccess={handleAuthSuccess}
          />
        )}
        <Toaster />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 transition-colors duration-500">
        <Header
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          currentUser={user}
          onLogout={handleLogout}
        />
        
        <main className="relative">
          {activeSection === 'home' && <Hero setActiveSection={setActiveSection} />}
          {activeSection === 'transcribe' && (
            <YouTubeSummarizer
              setActiveSection={setActiveSection}
              setTranscriptId={setTranscriptId}
              setVideoUrl={setVideoUrl}
            />
          )}
          {activeSection === 'trending' && <TrendingNotes />}
          {activeSection === 'thumbnail' && <ThumbnailSection />}
          {activeSection === 'tags' && <TrendingTags />}
          {activeSection === 'chatbot' && <ChatbotFullScreen setActiveSection={setActiveSection} />}
          {activeSection === 'playlist' && <LearningJourney />}
          {activeSection === 'marketplace' && <MarketplacePage />}
          {activeSection === 'notes' && <NotesCenter />}
          {activeSection === 'analytics' && <LearningAnalytics />}
          {activeSection === 'services' && <ServicesPage />}
          {activeSection === 'about' && <AboutPage />}
          {activeSection === 'contact' && <ContactPage />}
          {activeSection === 'premium' && <PremiumPage />}
          {activeSection === 'transcript-detail' && transcriptId && (
            <TranscriptDetail transcriptId={transcriptId} onBack={() => setActiveSection('transcribe')} />
          )}
          {activeSection === 'summary-detail' && transcriptId && videoUrl && (
            <SummaryDetailView
              transcriptId={transcriptId}
              videoUrl={videoUrl}
              onBack={() => setActiveSection('transcribe')}
            />
          )}
          {activeSection === 'profile' && (
            <ProfilePage
              user={user}
              onProfileUpdated={setUser}
              setActiveSection={setActiveSection}
            />
          )}
          {activeSection === 'admin' && <AdminPanel currentUser={user} />}
        </main>

        <Footer setActiveSection={setActiveSection} />

        {/* Floating Chatbot Button - Only show when not on chatbot or auth pages */}
        {activeSection !== 'chatbot' && <ChatbotButton setActiveSection={setActiveSection} />}

        {/* Premium Newsletter Popup */}
        <PremiumNewsletterPopup 
          onUpgrade={handleUpgradeToPremium}
          isPremium={isPremium}
        />
        
        {/* Toast Notifications */}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
