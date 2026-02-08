import { useEffect, useRef, useState } from "react";
import PrivacyPolicy from "@/app/policy/page";

export default function PrivacyConsentModal() {
  const [open, setOpen] = useState(false);
  const [hasScrolledBottom, setHasScrolledBottom] = useState(false);
  const [checked, setChecked] = useState(false);

  const policyRef = useRef<HTMLDivElement | null>(null);

  // Show modal only if not accepted before
  useEffect(() => {
    const accepted = localStorage.getItem("privacyAccepted");
    if (!accepted) setOpen(true);
  }, []);

  // Detect scroll bottom
  const handleScroll = () => {
    const el = policyRef.current;
    if(!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      setHasScrolledBottom(true);
    }
  };

  const handleAgree = () => {
    localStorage.setItem("privacyAccepted", "true");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-lg rounded-xl shadow-lg p-6">
        
        <h2 className="text-xl font-semibold mb-3 text-primary">
          We Value Your Privacy
        </h2>

        {/* Scrollable Policy */}
        <div
          ref={policyRef}
          onScroll={handleScroll}
          className="h-52 overflow-y-auto border rounded-md p-3 text-sm text-gray-700"
        >
          <PrivacyPolicy />
        </div>

        {/* Checkbox */}
        <div className="flex items-center mt-4 gap-2">
          <input
            type="checkbox"
            disabled={!hasScrolledBottom}
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="accent-primary"
          />
          <span className="text-sm text-primary">
            I have read and agree to the Privacy Policy
          </span>
        </div>

        {/* Button */}
        <button
          disabled={!checked}
          onClick={handleAgree}
          className={`mt-4 w-full py-2 rounded-lg text-white transition
            ${checked ? "bg-primary hover:bg-accent-foreground" : "bg-gray-400 cursor-not-allowed"}
          `}
        >
          Agree & Continue
        </button>
      </div>
    </div>
  );
}
