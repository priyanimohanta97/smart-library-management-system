import React, { useState } from 'react';
import { 
  Shield, 
  User, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Building2, 
  Sparkles,
  UserPlus
} from 'lucide-react';
import { login, register } from '../services/authService';

export default function LoginPage({ 
  onLoginSuccess, 
  onBackToHome, 
  initialMode = 'STUDENT' 
}) {
  // Mode selection: 'STUDENT' (Normal User) or 'LIBRARIAN' (Admin/Staff)
  const [selectedRole, setSelectedRole] = useState(
    initialMode === 'LIBRARIAN' ? 'LIBRARIAN' : 'STUDENT'
  );
  
  // Tab view: 'login' or 'register'
  const [activeTab, setActiveTab] = useState('login');

  // Login Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration Form fields
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  // Role Mismatch state (e.g. Student account trying to log into Librarian portal)
  const [roleMismatchData, setRoleMismatchData] = useState(null);

  // Email format validation regex
  const isValidEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  // Client-side validation for Login
  const validateLoginForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email format (e.g., student@vssut.ac.in).';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Client-side validation for Student Registration
  const validateRegForm = () => {
    const errors = {};
    if (!regFullName.trim()) {
      errors.regFullName = 'Full name is required.';
    } else if (regFullName.trim().length < 2) {
      errors.regFullName = 'Full name must be at least 2 characters.';
    }

    if (!regEmail.trim()) {
      errors.regEmail = 'Email is required.';
    } else if (!isValidEmail(regEmail)) {
      errors.regEmail = 'Please enter a valid university email address.';
    }

    if (!regPassword) {
      errors.regPassword = 'Password is required.';
    } else if (regPassword.length < 6) {
      errors.regPassword = 'Password must be at least 6 characters.';
    }

    if (regPassword !== regConfirmPassword) {
      errors.regConfirmPassword = 'Passwords do not match.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    setSuccessNotice(null);
    setRoleMismatchData(null);

    if (!validateLoginForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Execute real backend authentication
      const authData = await login({ email, password });
      const user = authData.user;
      const actualRole = user.role; // 'ADMIN', 'MANAGER', or 'USER'

      // Check role authorization against user's intended mode
      if (selectedRole === 'LIBRARIAN') {
        const hasAdminPrivileges = actualRole === 'ADMIN' || actualRole === 'MANAGER';
        if (!hasAdminPrivileges) {
          // Role mismatch: user is authenticated, but is only a student (Role.USER)
          setRoleMismatchData({
            authData,
            user,
            attemptedMode: 'Librarian',
            actualRole: actualRole,
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Successful matching authentication
      setSuccessNotice(`Authentication successful. Welcome, ${user.fullName}.`);
      setTimeout(() => {
        onLoginSuccess(authData, selectedRole);
      }, 400);

    } catch (err) {
      setServerError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Registration Submit (Public registration strictly creates student USER accounts)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    setSuccessNotice(null);

    if (!validateRegForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newUser = await register({
        fullName: regFullName,
        email: regEmail,
        password: regPassword,
      });

      setSuccessNotice(
        `Student account for ${newUser.fullName} created successfully! Please sign in with your password.`
      );
      // Pre-fill login form and switch to login tab
      setEmail(regEmail);
      setPassword('');
      setActiveTab('login');
      setSelectedRole('STUDENT');
      setRegPassword('');
      setRegConfirmPassword('');
    } catch (err) {
      setServerError(err.message || 'Student registration failed. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // User accepts continuing as Student after mismatch
  const handleContinueAsStudent = () => {
    if (roleMismatchData?.authData) {
      onLoginSuccess(roleMismatchData.authData, 'STUDENT');
    }
  };

  const handleDismissMismatch = () => {
    setRoleMismatchData(null);
    setPassword('');
  };

  return (
    <div className="min-h-[90vh] py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center bg-[#F5F9FF]">
      {/* Top back navigation */}
      <div className="w-full max-w-4xl mb-4 flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-[#2563EB] hover:text-[#0B1F3A] transition-colors focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded px-2 py-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to College Homepage</span>
        </button>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span>VSSUT Security Authority Active</span>
        </div>
      </div>

      {/* Responsive Split Layout Card */}
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-[#DCE7F5] shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* =========================================
            LEFT COLUMN: College Visual Showcase (5 cols)
            ========================================= */}
        <div className="hidden md:flex md:col-span-5 relative bg-[#0B1F3A] p-8 flex-col justify-between overflow-hidden text-white">
          {/* Background Gate Night Image with Navy Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/images (1).jpg.jpeg"
              alt="VSSUT Campus Gate at Night"
              className="w-full h-full object-cover object-center opacity-40 transform scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A] via-[#0B1F3A]/80 to-[#071426]/90"></div>
            <div className="absolute inset-0 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:20px_20px] opacity-25"></div>
          </div>

          {/* Top Brand Header */}
          <div className="relative z-10 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-white p-1 border border-blue-400/40 shadow-xs flex items-center justify-center overflow-hidden">
              <img
                src="/images/1630574548148.jpg"
                alt="VSSUT Crest"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-300 block">
                Central Library Portal
              </span>
              <h2 className="text-lg font-bold text-white leading-snug">
                Veer Surendra Sai University of Technology
              </h2>
            </div>
          </div>

          {/* Middle Decorative Badge */}
          <div className="relative z-10 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Campus Digital Stacks</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed italic">
              &ldquo;Siddhirbhavati Karmaja &mdash; Success is attained through purposeful action.&rdquo;
            </p>
          </div>

          {/* Bottom Trust Indicators */}
          <div className="relative z-10 pt-4 border-t border-white/15 text-[11px] text-slate-300 space-y-1">
            <p className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Central Library Stacks, Floors 1–4</span>
            </p>
            <p className="text-slate-400">
              Integrated with Spring Security HMAC-SHA256
            </p>
          </div>
        </div>

        {/* =========================================
            RIGHT COLUMN: Authentication Form (7 cols)
            ========================================= */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          {/* Role Toggle Header (Student vs Librarian) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Portal Access Mode
              </span>
              {/* Tab Selector: Sign In vs Register */}
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-xs font-medium border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setServerError(null);
                    setFormErrors({});
                    setRoleMismatchData(null);
                  }}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    activeTab === 'login'
                      ? 'bg-white text-[#0B1F3A] font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-[#0B1F3A]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setSelectedRole('STUDENT');
                    setServerError(null);
                    setFormErrors({});
                    setRoleMismatchData(null);
                  }}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    activeTab === 'register'
                      ? 'bg-white text-[#2563EB] font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-[#0B1F3A]'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Role Cards Switcher (only on login tab) */}
            {activeTab === 'login' && !roleMismatchData && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('STUDENT');
                    setFormErrors({});
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center space-x-3 cursor-pointer ${
                    selectedRole === 'STUDENT'
                      ? 'border-[#2563EB] bg-[#EFF6FF] ring-2 ring-[#2563EB]/20 shadow-xs'
                      : 'border-[#DCE7F5] bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedRole === 'STUDENT' ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0B1F3A]">Student</h3>
                    <p className="text-[10px] text-slate-500 leading-tight">Borrowing & Reading</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('LIBRARIAN');
                    setFormErrors({});
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center space-x-3 cursor-pointer ${
                    selectedRole === 'LIBRARIAN'
                      ? 'border-[#0B1F3A] bg-slate-100 ring-2 ring-[#0B1F3A]/20 shadow-xs'
                      : 'border-[#DCE7F5] bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedRole === 'LIBRARIAN' ? 'bg-[#0B1F3A] text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0B1F3A]">Librarian</h3>
                    <p className="text-[10px] text-slate-500 leading-tight">Admin & Inventory</p>
                  </div>
                </button>
              </div>
            )}

            {/* Dynamic Headings required by prompt */}
            <div>
              <h2 className="text-2xl font-extrabold text-[#0B1F3A] tracking-tight">
                {activeTab === 'register' 
                  ? 'Create Student Account' 
                  : selectedRole === 'STUDENT' 
                    ? 'Welcome, Student' 
                    : 'Librarian Portal'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {activeTab === 'register'
                  ? 'Register for college library borrowing privileges and digital search.'
                  : selectedRole === 'STUDENT'
                    ? 'Sign in to explore your college library.'
                    : 'Sign in to access library administration.'}
              </p>
            </div>
          </div>

          {/* Success Message Banner */}
          {successNotice && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded-xl flex items-start space-x-3 text-xs animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-900">Success</p>
                <p className="mt-0.5 text-emerald-800">{successNotice}</p>
              </div>
            </div>
          )}

          {/* Role Mismatch Notice Banner (Phase 4 & Section 6 Enforcement) */}
          {roleMismatchData && (
            <div className="mb-4 bg-amber-50 border-2 border-amber-400 text-amber-900 p-4 rounded-xl space-y-3 animate-fade-in">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-[#0B1F3A]">
                    Access Restricted: Administrative Clearance Required
                  </h3>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    Your credentials were authenticated as <strong>{roleMismatchData.user.fullName}</strong> ({roleMismatchData.user.email}), but this account holds <strong>Student (USER)</strong> clearance only. It does not possess the administrator privileges required for the Librarian Portal.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleContinueAsStudent}
                  className="h-8.5 px-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
                >
                  Continue to Student Dashboard
                </button>
                <button
                  type="button"
                  onClick={handleDismissMismatch}
                  className="h-8.5 px-3.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-md transition-colors cursor-pointer"
                >
                  Use Another Account
                </button>
              </div>
            </div>
          )}

          {/* Server Error Message */}
          {serverError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-900 p-3.5 rounded-xl flex items-start space-x-2.5 text-xs animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Authentication Error</p>
                <p className="mt-0.5 text-red-700 leading-relaxed">{serverError}</p>
              </div>
            </div>
          )}

          {/* =========================================
              FORM 1: LOGIN FORM
              ========================================= */}
          {activeTab === 'login' && !roleMismatchData && (
            <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
              {/* Email Address */}
              <div className="space-y-1">
                <label 
                  htmlFor="login-email" 
                  className="block text-xs font-semibold text-[#0B1F3A]"
                >
                  {selectedRole === 'LIBRARIAN' ? 'Staff / Administrator Email' : 'Student Email Address'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: null }));
                    }}
                    disabled={isSubmitting}
                    placeholder={selectedRole === 'LIBRARIAN' ? 'admin@athenaeum.edu' : 'student@vssut.ac.in'}
                    className={`block w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-[#F5F9FF] border rounded-lg transition-colors focus:bg-white focus:outline-none ${
                      formErrors.email 
                        ? 'border-red-400 focus:ring-1 focus:ring-red-500' 
                        : 'border-[#DCE7F5] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/25'
                    }`}
                    autoComplete="email"
                  />
                </div>
                {formErrors.email && (
                  <p className="text-[11px] text-red-600 font-medium pl-1">{formErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label 
                    htmlFor="login-password" 
                    className="block text-xs font-semibold text-[#0B1F3A]"
                  >
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400">Case-sensitive</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: null }));
                    }}
                    disabled={isSubmitting}
                    placeholder="••••••••••••"
                    className={`block w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm bg-[#F5F9FF] border rounded-lg transition-colors focus:bg-white focus:outline-none ${
                      formErrors.password 
                        ? 'border-red-400 focus:ring-1 focus:ring-red-500' 
                        : 'border-[#DCE7F5] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/25'
                    }`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-[11px] text-red-600 font-medium pl-1">{formErrors.password}</p>
                )}
              </div>

              {/* Primary Action Button with exact labels */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#2563EB]/60 text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center space-x-2 focus-visible:ring-2 focus-visible:ring-[#2563EB] shadow-xs cursor-pointer disabled:cursor-not-allowed mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    {selectedRole === 'LIBRARIAN' ? (
                      <>
                        <Shield className="w-4 h-4" />
                        <span>Continue as Librarian</span>
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4" />
                        <span>Continue as Student</span>
                      </>
                    )}
                  </>
                )}
              </button>

              {/* Testing helper credentials for demonstration */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Demo Shortcuts:</span>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('LIBRARIAN');
                      setEmail('admin@athenaeum.edu');
                    }}
                    className="text-[#2563EB] hover:underline cursor-pointer"
                  >
                    Load Librarian
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('STUDENT');
                      setEmail('student@vssut.ac.in');
                    }}
                    className="text-[#2563EB] hover:underline cursor-pointer"
                  >
                    Load Student
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* =========================================
              FORM 2: STUDENT REGISTRATION FORM
              ========================================= */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5" noValidate>
              <div className="p-3 bg-[#EFF6FF] rounded-lg border border-[#DCE7F5] text-xs text-slate-600 space-y-0.5">
                <span className="font-semibold text-[#0B1F3A] flex items-center space-x-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Enrolled Student Registration</span>
                </span>
                <p className="text-[11px] leading-relaxed">
                  Provisions verified <strong>Student (USER)</strong> credentials for catalog borrowing and personalized reading lists. Administrative librarian accounts are provisioned exclusively through campus IT bootstrap.
                </p>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label htmlFor="reg-name" className="block text-xs font-semibold text-[#0B1F3A]">
                  Full Student Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  value={regFullName}
                  onChange={(e) => {
                    setRegFullName(e.target.value);
                    if (formErrors.regFullName) setFormErrors((prev) => ({ ...prev, regFullName: null }));
                  }}
                  disabled={isSubmitting}
                  placeholder="e.g. Pragyan Mohanta"
                  className={`block w-full px-3 py-2 text-xs sm:text-sm bg-[#F5F9FF] border rounded-lg focus:bg-white focus:outline-none ${
                    formErrors.regFullName ? 'border-red-400' : 'border-[#DCE7F5] focus:border-[#2563EB]'
                  }`}
                />
                {formErrors.regFullName && (
                  <p className="text-[11px] text-red-600">{formErrors.regFullName}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label htmlFor="reg-email" className="block text-xs font-semibold text-[#0B1F3A]">
                  University Email Address
                </label>
                <input
                  id="reg-email"
                  type="email"
                  value={regEmail}
                  onChange={(e) => {
                    setRegEmail(e.target.value);
                    if (formErrors.regEmail) setFormErrors((prev) => ({ ...prev, regEmail: null }));
                  }}
                  disabled={isSubmitting}
                  placeholder="student@vssut.ac.in"
                  className={`block w-full px-3 py-2 text-xs sm:text-sm bg-[#F5F9FF] border rounded-lg focus:bg-white focus:outline-none ${
                    formErrors.regEmail ? 'border-red-400' : 'border-[#DCE7F5] focus:border-[#2563EB]'
                  }`}
                />
                {formErrors.regEmail && (
                  <p className="text-[11px] text-red-600">{formErrors.regEmail}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label htmlFor="reg-pass" className="block text-xs font-semibold text-[#0B1F3A]">
                  Password (minimum 6 characters)
                </label>
                <input
                  id="reg-pass"
                  type="password"
                  value={regPassword}
                  onChange={(e) => {
                    setRegPassword(e.target.value);
                    if (formErrors.regPassword) setFormErrors((prev) => ({ ...prev, regPassword: null }));
                  }}
                  disabled={isSubmitting}
                  placeholder="••••••••"
                  className={`block w-full px-3 py-2 text-xs sm:text-sm bg-[#F5F9FF] border rounded-lg focus:bg-white focus:outline-none ${
                    formErrors.regPassword ? 'border-red-400' : 'border-[#DCE7F5] focus:border-[#2563EB]'
                  }`}
                />
                {formErrors.regPassword && (
                  <p className="text-[11px] text-red-600">{formErrors.regPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label htmlFor="reg-confirm-pass" className="block text-xs font-semibold text-[#0B1F3A]">
                  Confirm Password
                </label>
                <input
                  id="reg-confirm-pass"
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => {
                    setRegConfirmPassword(e.target.value);
                    if (formErrors.regConfirmPassword) setFormErrors((prev) => ({ ...prev, regConfirmPassword: null }));
                  }}
                  disabled={isSubmitting}
                  placeholder="••••••••"
                  className={`block w-full px-3 py-2 text-xs sm:text-sm bg-[#F5F9FF] border rounded-lg focus:bg-white focus:outline-none ${
                    formErrors.regConfirmPassword ? 'border-red-400' : 'border-[#DCE7F5] focus:border-[#2563EB]'
                  }`}
                />
                {formErrors.regConfirmPassword && (
                  <p className="text-[11px] text-red-600">{formErrors.regConfirmPassword}</p>
                )}
              </div>

              {/* Submit Registration Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 mt-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#2563EB]/60 text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center space-x-2 focus-visible:ring-2 focus-visible:ring-[#2563EB] shadow-xs cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Creating Student Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Student Account</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
