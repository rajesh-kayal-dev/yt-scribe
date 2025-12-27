import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/userModel.js';

// Configure Passport strategies for Google and GitHub OAuth
// This function should be called once during app startup
export function configurePassport() {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    GITHUB_CALLBACK_URL,
  } = process.env;

  // GOOGLE OAUTH STRATEGY
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
    console.warn('⚠️ Google OAuth env vars are not fully set. Google login will be disabled.');
  } else {
    passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email =
              profile.emails && profile.emails[0] && profile.emails[0].value
                ? profile.emails[0].value.toLowerCase()
                : undefined;
            const providerId = profile.id;
            const googleId = profile.id;
            const photo =
              profile.photos && profile.photos[0] && profile.photos[0].value
                ? profile.photos[0].value
                : undefined;

            // 1. Try to find existing user by providerId (legacy) or googleId
            let user = await User.findOne({ provider: 'google', providerId });
            if (!user && googleId) {
              user = await User.findOne({ googleId });
            }

            // 2. If not found, try to find by email and then attach provider data
            if (!user && email) {
              user = await User.findOne({ email });
              if (user) {
                user.provider = 'google';
                user.providerId = providerId;
                user.googleId = user.googleId || googleId;
                if (!user.avatarUrl && photo) {
                  user.avatarUrl = photo;
                }
                await user.save();
              }
            }

            // 3. If still not found, create a new user
            if (!user) {
              user = await User.create({
                name: profile.displayName || 'Google User',
                email,
                provider: 'google',
                providerId,
                googleId,
                avatarUrl: photo,
                role: 'user',
              });
            }

            return done(null, user);
          } catch (error) {
            return done(error, undefined);
          }
        }
      )
    );
  }

  // GITHUB OAUTH STRATEGY
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !GITHUB_CALLBACK_URL) {
    console.warn('⚠️ GitHub OAuth env vars are not fully set. GitHub login will be disabled.');
  } else {
    passport.use(
      new GitHubStrategy(
        {
          clientID: GITHUB_CLIENT_ID,
          clientSecret: GITHUB_CLIENT_SECRET,
          callbackURL: GITHUB_CALLBACK_URL,
          scope: ['user:email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const primaryEmail =
              profile.emails && profile.emails[0] && profile.emails[0].value
                ? profile.emails[0].value.toLowerCase()
                : undefined;
            const providerId = profile.id;
            const githubId = profile.id;
            const photo =
              profile.photos && profile.photos[0] && profile.photos[0].value
                ? profile.photos[0].value
                : undefined;

            let user = await User.findOne({ provider: 'github', providerId });
            if (!user && githubId) {
              user = await User.findOne({ githubId });
            }

            if (!user && primaryEmail) {
              user = await User.findOne({ email: primaryEmail });
              if (user) {
                user.provider = 'github';
                user.providerId = providerId;
                user.githubId = user.githubId || githubId;
                if (!user.avatarUrl && photo) {
                  user.avatarUrl = photo;
                }
                await user.save();
              }
            }

            if (!user) {
              user = await User.create({
                name: profile.displayName || profile.username || 'GitHub User',
                email: primaryEmail,
                provider: 'github',
                providerId,
                githubId,
                avatarUrl: photo,
                role: 'user',
              });
            }

            return done(null, user);
          } catch (error) {
            return done(error, undefined);
          }
        }
      )
    );
  }

  // Passport serialize/deserialize (required by Passport, even though we use JWT cookies)
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user || undefined);
    } catch (error) {
      done(error, undefined);
    }
  });
}

export { passport };