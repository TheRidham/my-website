import { useEffect, useState } from 'react';
import { X, CheckCircle, User } from 'lucide-react';
import Image from 'next/image';
import Logo from "@/assets/logo.png"

interface AdvisorPromptModalProps {
  visible: boolean;
  onClose: () => void;
  onConnect: () => void;
  advisorCategory?: string;
}

export default function AdvisorPromptModal({
  visible,
  onClose,
  onConnect,
  advisorCategory,
}: AdvisorPromptModalProps) {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (visible) {
      setIsAnimatingOut(false);
      setProgress(100);

      // Progress countdown
      const startTime = Date.now();
      const duration = 14000;
      
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);
        
        if (remaining === 0) {
          clearInterval(progressInterval);
        }
      }, 16);

      // Auto-dismiss after 14 seconds
      const autoDismissTimer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearInterval(progressInterval);
        clearTimeout(autoDismissTimer);
      };
    }
  }, [visible]);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose();
      setIsAnimatingOut(false);
    }, 200);
  };

  const handleConnect = () => {
    onConnect();
    handleClose();
  };

  if (!visible && !isAnimatingOut) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-200 ${
          visible && !isAnimatingOut ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md transition-all duration-200 ${
          visible && !isAnimatingOut
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95'
        }`}
      >
        <div className="bg-linear-to-b from-white to-blue-50 rounded-2xl shadow-2xl shadow-indigo-500/25 overflow-hidden">
          <div className="p-5 pt-4">
            {/* Content */}
            <div className="flex items-center gap-3.5 mb-4 mt-1">
              {/* Avatar */}
              <div className="relative shrink-0">
                {/* <img
                  src="../assets/logo.png"
                  alt="Advisor"
                  className="w-14 h-14 rounded-xl object-cover"
                /> */}
                <Image src={Logo} alt="quik advice" className='w-14 h-14 rounded-xl object-cover' />
              </div>

              {/* Text */}
              <div className="flex-1 pr-5">
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  Need Expert Help? 💡
                </h3>
                <p className="text-sm text-gray-700 leading-snug">
                  Connect with a real {advisorCategory || 'advisor'} expert for
                  personalized guidance
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="flex justify-between mb-4 px-1">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-gray-700">
                  Verified Expert
                </span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-gray-700">
                  Instant Chat
                </span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-gray-700">
                  Private
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2.5">
              <button
                onClick={handleClose}
                className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-sm rounded-xl transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={handleConnect}
                className="flex-[1.5] py-3 px-4 bg-linear-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold text-sm rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <User className="w-4 h-4" />
                Connect Now
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 h-0.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-75 ease-linear origin-left"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
