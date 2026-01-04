'use client';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Adjust the import based on your file structure

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export default function SignupPage() {
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'INPUT_PHONE' | 'VERIFY_OTP'>('INPUT_PHONE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpBtn, setOtpBtn] = useState(false);

  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Create reCAPTCHA verifier once on mount (invisible for production)
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  useEffect(() => {
    const checkIfUserExists = async () => {
      const user = auth.currentUser;

      if (user?.uid) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            // User already exists, redirect to home
            router.push('/home');
          }else {
            console.log("no user exist!")
          }
        } catch (err) {
          console.error('Error checking if user exists:', err);
        }
      }
    };

    checkIfUserExists();
  }, []);

  const initializeRecaptcha = () => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }

    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible', // or 'normal' for visible checkbox during testing
      callback: () => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        setError('reCAPTCHA expired. Please try again.');
      },
    });
  };

  useEffect(() => {
    if(otp.length < 6) setOtpBtn(false);
    if(otp.length >= 6) setOtpBtn(true);
  },[otp])

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      setError('Please enter phone number');
      return;
    }

    if (phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Initialize reCAPTCHA before sending
      initializeRecaptcha();

      const formattedPhone = phoneNumber.startsWith('+')
        ? phoneNumber
        : phoneNumber.startsWith('0')
        ? `+91${phoneNumber.slice(1)}`
        : `+91${phoneNumber}`;

      console.log('Sending OTP to:', formattedPhone);

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);

      setConfirmationResult(confirmation);
      setStep('VERIFY_OTP');
      console.log('OTP sent successfully');

    } catch (err: any) {
      console.error('Error sending OTP:', err);

      let errorMessage = 'Failed to send OTP. Please try again.';

      if (err.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format. Use +91XXXXXXXXXX';
      } else if (err.code === 'auth/invalid-app-credential') {
        errorMessage = 'reCAPTCHA verification failed. Please refresh and try again.';
      } else if (err.code === 'auth/too-many-requests' || err.code === 'auth/quota-exceeded') {
        errorMessage = 'Too many requests. Please try again later.';
      }

      setError(errorMessage);

      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !confirmationResult) return;
    setError('');
    setLoading(true);

    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user.uid;
      const profile = await getDoc(doc(db, "users", user));
      if(profile.exists()) {
        router.replace("/home");
      }else {
        console.log('User signed in:', result.user);
        router.push('/auth/profile');
      }
    } catch (err: any) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('INPUT_PHONE');
    setOtp('');
    setError('');
    setConfirmationResult(null);
    // Re-initialize reCAPTCHA for next attempt
    initializeRecaptcha();
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-800 p-4 bg-linear-to-br  from-cyan-200 via-blue-200 to-teal-400">
      <div className="w-full max-w-md rounded-xl p-8 border border-white/20 bg-white/10 backdrop-blur-lg shadow-xl">

        <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">
          {step === 'INPUT_PHONE' ? 'Create Account' : 'Verify Phone'}
        </h2>

        {/* Recaptcha container - must exist in DOM */}
        <div id="recaptcha-container" className="flex justify-center"></div>

        {/* Phone input step */}
        {step === 'INPUT_PHONE' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-600">+91</span>
                <input
                  type="tel"
                  id="phone"
                  placeholder="9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  maxLength={10}
                  className="w-full pl-12 pr-4 py-2 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-0 focus:outline-none transition-all"
                />
              </div>
              <p className="text-sm font-medium text-gray-700">
                Enter your 10-digit mobile number
              </p>
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className={`w-full py-2.5 rounded-lg text-white font-semibold transition-colors ${
                loading ? 'bg-indigo-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </div>
        )}

        {/* OTP verification step */}
        {step === 'VERIFY_OTP' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="otp" className="text-sm font-semibold text-gray-700">
                Enter Verification Code
              </label>
              <input
                type="text"
                id="otp"
                placeholder="X-X-X-X-X-X"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-0 focus:outline-none tracking-widest text-center text-lg"
              />
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={!otpBtn || loading}
              className={`w-full py-2.5 rounded-lg text-white font-semibold transition-colors ${
                loading || !otpBtn ? 'bg-blue-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Verifying...' : 'Verify Otp'}
            </button>

            {/* <button
              onClick={handleReset}
              className="text-sm text-indigo-600 hover:text-indigo-800 text-center mt-2 underline"
            >
              Change Phone Number
            </button> */}
          </div>
        )}

        {error && (
          <p className="mt-4 text-center text-sm text-red-600 bg-red-100 p-2 rounded border border-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}