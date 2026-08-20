import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import {
  signInWithGoogle,
  loginWithEmail,
  registerWithEmail,
  FirebaseUser,
} from '../lib/firebase';
import { ShaderBackground } from './ShaderBackground';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: FirebaseUser | null;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [emailOrContact, setEmailOrContact] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // States for Google and Email Auth
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Google OAuth Flow
  const handleGoogleAuth = async () => {
    if (googleLoading || emailLoading) return;
    setAuthError(null);
    setGoogleLoading(true);

    try {
      const user = await signInWithGoogle();
      if (user) {
        setAuthSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
          setAuthSuccess(false);
        }, 600);
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      let errorMsg = 'Google authentication could not be completed. Please try again.';

      if (err.code === 'auth/popup-closed-by-user') {
        errorMsg = 'Google authentication was cancelled.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMsg = 'Authentication request cancelled. Please try again.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMsg = 'Browser popup was blocked. Please allow popups for Google Sign In.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMsg = 'Network connectivity issue. Please check your connection and retry.';
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        errorMsg = 'An account already exists with this email address using a different sign-in method.';
      } else if (err.message) {
        errorMsg = err.message;
      }

      setAuthError(errorMsg);
    } finally {
      setGoogleLoading(false);
    }
  };

  // 2. Email / Password Flow
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (googleLoading || emailLoading) return;
    setAuthError(null);

    const contact = emailOrContact.trim();
    if (!contact) {
      setAuthError('Please enter your email or mobile number.');
      return;
    }

    // Basic email normalization if user typed email
    const emailToUse = contact.includes('@') ? contact : `${contact.replace(/[^0-9]/g, '')}@urbnservices.in`;

    if (isRegister) {
      if (!fullName.trim()) {
        setAuthError('Please enter your full name.');
        return;
      }
      if (password.length < 8) {
        setAuthError('Password must be at least 8 characters long.');
        return;
      }
    }

    setEmailLoading(true);

    try {
      if (isRegister) {
        await registerWithEmail(emailToUse, password, fullName.trim());
      } else {
        await loginWithEmail(emailToUse, password);
      }

      setAuthSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        setAuthSuccess(false);
      }, 600);
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      let errorMsg = 'Authentication failed. Please check your credentials.';

      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        errorMsg = 'Invalid email/contact or password. Please try again.';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'This account is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'Password must be at least 8 characters long.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMsg = 'Too many unsuccessful attempts. Please try again in a few minutes.';
      }

      setAuthError(errorMsg);
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background/90 md:bg-black/60 backdrop-blur-xs flex items-center justify-center p-0 md:p-6 animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-surface md:rounded-2xl shadow-2xl overflow-hidden min-h-screen md:min-h-[640px] flex flex-col md:flex-row border-0 md:border md:border-outline-variant/30">
        {/* Close Button */}
        <button
          onClick={onClose}
          id="auth-close-modal-btn"
          aria-label="Close Authentication Screen"
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-white/80 md:bg-surface-container-lowest/80 backdrop-blur-md border border-outline-variant/40 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-white transition-all shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT: Cinematic Visual Environment (45%) */}
        <div
          className={`hidden md:flex w-[45%] relative overflow-hidden items-end pb-12 px-12 transition-all duration-300 ${
            isRegister ? 'bg-on-tertiary-fixed text-on-primary' : 'bg-primary-fixed text-on-primary'
          }`}
        >
          {/* WebGL Shader Canvas */}
          <ShaderBackground className="absolute inset-0 w-full h-full object-cover" />

          {/* Gradient Overlay for Text Readability */}
          <div
            className={`absolute inset-0 z-10 ${
              isRegister
                ? 'bg-gradient-to-t from-on-tertiary-fixed/90 via-on-tertiary-fixed/40 to-transparent'
                : 'bg-gradient-to-t from-primary/80 to-transparent'
            }`}
          />

          {/* Minimal decorative elements reflecting utility (For Create Account) */}
          {isRegister && (
            <div className="absolute top-12 left-12 flex gap-2 z-20">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <div className="w-2 h-2 rounded-full bg-surface-variant opacity-50" />
              <div className="w-2 h-2 rounded-full bg-surface-variant opacity-50" />
            </div>
          )}

          {/* Brand Messaging */}
          <div className="relative z-20 max-w-md">
            {isRegister ? (
              <>
                <h1 className="font-display-lg text-display-lg text-on-primary mb-4 font-bold text-white leading-tight">
                  Join the Network.
                  <br />
                  Get Services Sorted.
                </h1>
                <p className="font-body-lg text-body-lg text-surface-container-low opacity-90 leading-relaxed text-blue-100">
                  Access Nashik's premier network of trusted home professionals. From plumbing to cleaning, experience modern utility with guaranteed reliability and transparent pricing.
                </p>
              </>
            ) : (
              <>
                <h1 className="font-display-lg text-display-lg mb-4 text-white font-bold leading-tight">
                  Local Services. Sorted.
                </h1>
                <p className="font-body-lg text-body-lg text-primary-fixed leading-relaxed text-blue-100">
                  Discover, book, and manage trusted household professionals in Nashik with complete transparency and ease.
                </p>
              </>
            )}
          </div>
        </div>

        {/* MOBILE: Shader Background (Behind Glass Card) */}
        <div className="md:hidden absolute inset-0 z-0">
          <ShaderBackground className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" />
        </div>

        {/* RIGHT: Authentication Panel (55%) */}
        <div className="w-full md:w-[55%] flex items-center justify-center p-container-margin-mobile md:p-container-margin-desktop z-10 min-h-screen md:min-h-full relative overflow-y-auto bg-transparent md:bg-surface">
          {/* Auth Card */}
          <div className="w-full max-w-md glass-panel rounded-xl shadow-high md:shadow-none md:border-none border border-outline-variant/30 p-6 sm:p-8 flex flex-col space-y-6 sm:space-y-8 my-auto">
            {/* Logo & Header */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4 sm:mb-6">
                <span
                  className="material-symbols-outlined text-primary text-3xl"
                  data-weight="fill"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  cleaning_services
                </span>
                <span className="font-headline-md text-headline-md font-bold tracking-tight text-primary">
                  URBN SERVICES
                </span>
              </div>

              {isRegister ? (
                <>
                  <h2 className="font-headline-md text-headline-md text-on-surface mb-1 font-bold">
                    Create an account
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm text-gray-600">
                    Join Nashik's modern utility network.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface mb-2 font-bold">
                    Welcome back.
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm text-gray-600">
                    Sign in to manage your bookings and preferred providers.
                  </p>
                </>
              )}
            </div>

            {/* Error Notification State */}
            {authError && (
              <div className="p-3.5 bg-error-container/60 border border-error/30 text-on-error-container text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                <span className="leading-snug">{authError}</span>
              </div>
            )}

            {/* Success Notification State */}
            {authSuccess && (
              <div className="p-3.5 bg-secondary-container/60 border border-secondary/30 text-on-secondary-container text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                <span className="font-semibold">
                  {isRegister ? 'Account created successfully!' : 'Signed in successfully! Welcome back.'}
                </span>
              </div>
            )}

            {/* Google Auth Button - Preserving Exact Visual Hierarchy & Styling */}
            {isRegister ? (
              <button
                type="button"
                id="google-create-account-btn"
                onClick={handleGoogleAuth}
                disabled={googleLoading || emailLoading || authSuccess}
                className="w-full flex items-center justify-center gap-3 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md py-3 px-4 rounded transition-colors duration-200 mb-2 group relative h-12 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                ) : (
                  <svg className="w-5 h-5 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>
            ) : (
              <button
                type="button"
                id="google-signin-btn"
                onClick={handleGoogleAuth}
                disabled={googleLoading || emailLoading || authSuccess}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low transition-colors duration-200 text-on-surface font-label-md text-label-md shadow-[0px_1px_2px_rgba(0,0,0,0.05)] h-12 relative disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>
            )}

            {/* Divider */}
            {isRegister ? (
              <div className="relative flex items-center justify-center my-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant" />
                </div>
                <div className="relative px-4 bg-surface-container-lowest text-label-md font-label-md text-on-surface-variant text-xs">
                  OR
                </div>
              </div>
            ) : (
              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-outline-variant" />
                <span className="flex-shrink-0 mx-4 font-caption text-caption text-outline text-xs">OR</span>
                <div className="flex-grow border-t border-outline-variant" />
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {/* Full Name for Register */}
              {isRegister && (
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1 text-xs font-semibold" htmlFor="fullName">
                    Full Name
                  </label>
                  <div className="relative input-focus-ring border border-outline-variant rounded-lg bg-surface-container-lowest transition-all duration-200">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant pointer-events-none text-outline">
                      <span className="material-symbols-outlined text-[20px]">person</span>
                    </span>
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-transparent border-none focus:ring-0 text-body-md font-body-md text-on-surface placeholder-outline text-sm h-12"
                      id="fullName"
                      placeholder="Enter your full name"
                      required
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Email or Mobile */}
              <div>
                {isRegister ? (
                  <label className="block font-label-md text-label-md text-on-surface mb-1 text-xs font-semibold" htmlFor="contact">
                    Email or Mobile Number
                  </label>
                ) : (
                  <label className="sr-only" htmlFor="email">
                    Email or Mobile Number
                  </label>
                )}
                <div className={`relative ${isRegister ? 'input-focus-ring border border-outline-variant rounded-lg bg-surface-container-lowest' : ''}`}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-[20px]">
                      {isRegister ? 'contact_mail' : 'person'}
                    </span>
                  </div>
                  <input
                    className={`block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-lg leading-5 bg-surface-container-lowest placeholder-outline text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 h-12 font-body-md text-body-md text-sm ${
                      isRegister ? 'border-none bg-transparent focus:ring-0' : ''
                    }`}
                    id={isRegister ? 'contact' : 'email'}
                    name="email"
                    placeholder={isRegister ? 'Enter email or mobile' : 'Email or Mobile Number'}
                    required
                    type="text"
                    value={emailOrContact}
                    onChange={(e) => setEmailOrContact(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                {isRegister && (
                  <label className="block font-label-md text-label-md text-on-surface mb-1 text-xs font-semibold" htmlFor="password">
                    Password
                  </label>
                )}
                {!isRegister && (
                  <label className="sr-only" htmlFor="password">
                    Password
                  </label>
                )}
                <div className={`relative ${isRegister ? 'input-focus-ring border border-outline-variant rounded-lg bg-surface-container-lowest' : ''}`}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </div>
                  <input
                    className={`block w-full pl-10 pr-10 py-3 border border-outline-variant rounded-lg leading-5 bg-surface-container-lowest placeholder-outline text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200 h-12 font-body-md text-body-md text-sm ${
                      isRegister ? 'border-none bg-transparent focus:ring-0' : ''
                    }`}
                    id="password"
                    name="password"
                    placeholder={isRegister ? 'Create a password' : 'Password'}
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface focus:outline-none cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {isRegister && (
                  <p className="mt-1 text-caption font-caption text-on-surface-variant text-[11px] text-gray-500">
                    Must be at least 8 characters long.
                  </p>
                )}
              </div>

              {/* Options for Sign In (Remember me & Forgot password) */}
              {!isRegister && (
                <div className="flex items-center justify-between mt-4 text-xs">
                  <div className="flex items-center">
                    <input
                      className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded bg-surface-container-lowest transition-colors cursor-pointer"
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label
                      className="ml-2 block font-label-md text-label-md text-on-surface-variant cursor-pointer text-xs text-gray-700"
                      for="remember-me"
                    >
                      Remember me
                    </label>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => setAuthError('Please enter your email to receive password reset instructions.')}
                      className="font-label-md text-label-md text-primary hover:text-primary-container font-medium transition-colors text-xs"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              {isRegister ? (
                <div className="pt-2">
                  <button
                    id="signup-submit-btn"
                    disabled={emailLoading || googleLoading || authSuccess}
                    className="w-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label-md text-label-md py-3.5 px-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex justify-center items-center gap-2 text-white font-semibold text-sm disabled:opacity-60"
                    type="submit"
                  >
                    {emailLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                    ) : (
                      <>
                        <span>Create Account</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  id="signin-btn"
                  disabled={emailLoading || googleLoading || authSuccess}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md text-on-primary bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 h-12 mt-6 text-white font-semibold text-sm disabled:opacity-60"
                  type="submit"
                >
                  {emailLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              )}
            </form>

            {/* Mode Switch Link */}
            <div className="text-center pt-2">
              {isRegister ? (
                <p className="font-body-md text-body-md text-on-surface-variant text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(false);
                      setAuthError(null);
                    }}
                    className="text-primary hover:text-primary-container font-label-md text-label-md underline underline-offset-2 transition-colors font-semibold"
                  >
                    Sign in
                  </button>
                </p>
              ) : (
                <p className="font-body-md text-body-md text-on-surface-variant text-sm text-gray-600">
                  New to URBN SERVICES?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(true);
                      setAuthError(null);
                    }}
                    className="font-label-md text-label-md text-primary hover:text-primary-container font-semibold transition-colors ml-1"
                  >
                    Create an account
                  </button>
                </p>
              )}
            </div>

            {/* Terms and Privacy footer note (For Register) */}
            {isRegister && (
              <div className="text-center pt-1">
                <p className="font-caption text-caption text-outline text-[11px] text-gray-400">
                  By joining, you agree to URBN SERVICES'{' '}
                  <span className="underline cursor-pointer">Terms</span> &amp;{' '}
                  <span className="underline cursor-pointer">Privacy Policy</span>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
