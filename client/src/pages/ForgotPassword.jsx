import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  // STEP 1: Get security question by email
  const handleGetQuestion = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/get-security-question`, { email });

      // Bug fix: Check if securityQuestion exists in response
      const question = response.data?.securityQuestion;

      if (!question) {
        setError('No security question found for this account.');
        setLoading(false);
        return;
      }

      setSecurityQuestion(question);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'User not found');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify answer and reset password
  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/reset-password-security`, {
        email,
        securityAnswer,
        newPassword
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-[#004225] selection:text-white flex flex-col">

      {/* --- TOP HERO AREA --- */}
      <div className="relative h-72 w-full bg-[#004225] overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center pb-16 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight drop-shadow-md">
            Forgot Password
          </h1>
          <p className="text-emerald-100 mt-3 text-lg font-medium max-w-lg">
            Reset your password by answering your security question.
          </p>
        </div>
      </div>

      {/* --- FLOATING FORM CARD --- */}
      <div className="container mx-auto px-4 relative z-20 -mt-20 mb-12 flex justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-lg border border-gray-100">

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                  ${step >= s
                    ? 'bg-[#004225] text-white'
                    : 'bg-gray-100 text-gray-400'
                  }
                  ${success && s === 2 ? 'bg-green-500' : ''}
                `}>
                  {success && s === 2 ? '✓' : s}
                </div>
                {s < 2 && (
                  <div className={`w-16 h-1 mx-2 rounded transition-all ${step > s ? 'bg-[#004225]' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>

          {/* Success Message */}
          {success && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Updated!</h2>
              <p className="text-gray-500">Redirecting to login page...</p>
            </div>
          )}

          {/* Error Message */}
          {error && !success && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* STEP 1: Email Input */}
          {step === 1 && !success && (
            <form onSubmit={handleGetQuestion} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Enter Your Email</h2>
                <p className="text-gray-500 mt-1 text-sm">Enter the email address associated with your account.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="example@email.com"
                  className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#004225] focus:ring-1 focus:ring-[#004225] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#004225] text-white font-bold py-4 rounded-xl hover:bg-[#00331b] hover:shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Checking...</span>
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Security Question + New Password */}
          {step === 2 && !success && (
            <form onSubmit={handleVerifyAndReset} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Answer Your Security Question</h2>
                <p className="text-gray-500 mt-1 text-sm">Enter the correct answer to set your new password.</p>
              </div>

              {/* Security Question Display */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-xs text-emerald-600 font-medium mb-1">Your Security Question:</p>
                <p className="text-gray-900 font-semibold">{securityQuestion || 'Loading...'}</p>
              </div>

              {/* Answer */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Your Answer
                </label>
                <input
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  required
                  placeholder="Enter your answer..."
                  className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#004225] focus:ring-1 focus:ring-[#004225] transition-all"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#004225] focus:ring-1 focus:ring-[#004225] transition-all"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#004225] focus:ring-1 focus:ring-[#004225] transition-all"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#004225] text-white font-bold py-3 rounded-xl hover:bg-[#00331b] hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Updating...</span>
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          {!success && (
            <div className="mt-8 text-center pt-6 border-t border-gray-100">
              <p className="text-gray-500 text-sm">
                Remember your password?{' '}
                <Link to="/login" className="text-[#004225] font-bold hover:underline ml-1">
                  Sign In
                </Link>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
