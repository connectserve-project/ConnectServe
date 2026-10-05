import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { EVENT_CATEGORIES } from '../utils/constants';
import {
  Mail, Lock, User, Building2, Sparkles, Phone, MapPin,
  GraduationCap, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const COUNTRY_CODES = [
  { code: '+91', name: 'India' },
  { code: '+1', name: 'USA/Canada' },
  { code: '+44', name: 'UK' },
  { code: '+61', name: 'Australia' },
  { code: '+971', name: 'UAE' },
  { code: '+65', name: 'Singapore' },
  { code: '+49', name: 'Germany' },
  { code: '+33', name: 'France' },
  { code: '+81', name: 'Japan' },
  { code: '+86', name: 'China' },
  { code: '+7', name: 'Russia' },
  { code: '+55', name: 'Brazil' },
  { code: '+27', name: 'South Africa' },
  { code: '+234', name: 'Nigeria' },
  { code: '+254', name: 'Kenya' },
];

export const Register = () => {
  const { register, verifyRegistration, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 'form' -> fill registration details, 'verify' -> enter 6-digit email code
  const [step, setStep] = useState('form');
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingRole, setPendingRole] = useState('user');
  const [verifyCode, setVerifyCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (searchParams.get('verify') === '1') {
      const emailParam = searchParams.get('email') || '';
      setPendingEmail(emailParam);
      setStep('verify');
    }
  }, [searchParams]);

  const [role, setRole] = useState('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Volunteer-specific
  const [gender, setGender] = useState('');
  const [institution, setInstitution] = useState('');

  // Contact & Location (both)
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [location, setLocation] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [pincode, setPincode] = useState('');

  // NGO specific
  const [mission, setMission] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [category, setCategory] = useState('Environment');

  const [isLoading, setIsLoading] = useState(false);

  const inputClass =
    'w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500';
  const labelClass = 'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    const baseFields = {
      name,
      email,
      password,
      role,
      location,
      countryCode,
      mobileNumber,
      state,
      country,
      pincode,
      ...(role === 'user' && { gender, institution }),
      ...(role === 'organization' && {
        orgDetails: { mission, registrationNumber, category },
      }),
    };

    const result = await register(baseFields);
    setIsLoading(false);

    if (result.success && result.requiresVerification) {
      setPendingEmail(result.email || email);
      setPendingRole(role);
      setStep('verify');
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verifyCode || verifyCode.trim().length !== 6) {
      toast.error('Please enter the 6-digit code sent to your email.');
      return;
    }
    setIsVerifying(true);
    const result = await verifyRegistration({ email: pendingEmail, code: verifyCode.trim() });
    setIsVerifying(false);

    if (result.success) {
      if (pendingRole === 'organization') navigate('/org/dashboard');
      else navigate('/feed');
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    await resendVerification(pendingEmail);
    setIsResending(false);
  };

  if (step === 'verify') {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 animate-fadeIn">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
              <Mail className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Verify Your Email</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Enter the 6-digit code we sent to <strong>{pendingEmail}</strong> to activate your account.
            </p>
          </div>

          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                placeholder="123456"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-2.5 text-center tracking-[0.5em] text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 [-webkit-text-fill-color:currentColor] [-webkit-autofill:0] [transition:background-color_9999s_ease-in-out_0s]"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isVerifying}
              icon={ArrowRight}
            >
              Verify & Activate Account
            </Button>
          </form>

          <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep('form')}
              className="font-bold text-slate-500 hover:underline"
            >
              ← Back to form
            </button>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-50"
            >
              {isResending ? 'Sending...' : 'Resend Code'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Create Your Account</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Join the ConnectServe network of volunteers and non-profit organizations.
          </p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setRole('user')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
              role === 'user'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>I'm a Volunteer</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('organization')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
              role === 'organization'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>NGO / Non-Profit</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className={labelClass}>
              {role === 'organization' ? 'Organization Legal Name *' : 'Full Name *'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder={role === 'organization' ? 'e.g. Green Earth Initiative' : 'e.g. Alex Morgan'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {role === 'organization' ? (
                <Building2 className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              ) : (
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>Email Address *</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="you@example.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            </div>
          </div>

          {/* Password row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Password *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Confirm Password *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Volunteer-only: Gender & Institution */}
          {role === 'user' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>School / College / Office</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. IIT Delhi or Google"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <GraduationCap className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                </div>
              </div>
            </div>
          )}

          {/* Mobile Number */}
          <div>
            <label className={labelClass}>Mobile Number (can be used to login)</label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="px-3 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-36 flex-shrink-0"
              >
                {COUNTRY_CODES.map(({ code, name: cname }) => (
                  <option key={code} value={code}>{code} {cname}</option>
                ))}
              </select>
              <div className="relative flex-1">
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Location fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>City / Location</label>
              <input
                type="text"
                placeholder="e.g. Chandigarh"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <input
                type="text"
                placeholder="e.g. Punjab"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Country</label>
              <input
                type="text"
                placeholder="e.g. India"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Pincode / Postal Code</label>
              <input
                type="text"
                placeholder="e.g. 160001"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* NGO Details */}
          {role === 'organization' && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
              <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-300">
                Organization Details
              </h4>
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Primary Cause Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {EVENT_CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Mission Statement
                </label>
                <textarea
                  rows="2"
                  placeholder="Our mission is to..."
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Tax / NGO Registration ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. NGO-2026-9812"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800/60 rounded-xl px-3 py-2.5">
                  You can attach your registration certificate later from
                  <span className="font-semibold text-slate-700 dark:text-slate-300"> My Profile → Edit Profile </span>
                  to complete admin verification.
                </p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            icon={ArrowRight}
          >
            Create Account
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-emerald-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
