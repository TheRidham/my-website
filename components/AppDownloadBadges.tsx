import { Apple, Smartphone, Shield, Lock } from 'lucide-react';
import Link from 'next/link';

export default function AppDownloadBadges() {
  return (
    <div className="flex items-center justify-center gap-2 py-2.5">
      {/* App Store Button */}
      <Link
        href="https://apps.apple.com/in/app/jai-quick-personal-advisory/id6755586022" 
        target="_blank"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground/5 hover:bg-foreground/10 rounded-2xl transition-all hover:scale-105 border border-border/50"
      >
        <Apple className="w-4 h-4 text-foreground" />
        <div className="text-left">
          <p className="text-[7px] text-muted-foreground leading-none">Download on</p>
          <p className="text-[10px] font-semibold text-foreground leading-tight">App Store</p>
        </div>
      </Link>

      {/* Google Play Button */}
      <Link
        href="https://play.google.com/store/apps/details?id=com.anonymous.jaiai"
        target="_blank"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground/5 hover:bg-foreground/10 rounded-2xl transition-all hover:scale-105 border border-border/50"
      >
        <Smartphone className="w-4 h-4 text-foreground" />
        <div className="text-left">
          <p className="text-[7px] text-muted-foreground leading-none">Get it on</p>
          <p className="text-[10px] font-semibold text-foreground leading-tight">Google Play</p>
        </div>
      </Link>

      {/* HIPAA Compliant Badge */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 rounded-2xl border border-primary/20 cursor-default">
        <div className="relative">
          <Shield className="w-4 h-4 text-primary" />
          <Lock className="w-2 h-2 text-primary absolute -bottom-0.5 -right-0.5" />
        </div>
        <div className="text-left">
          <p className="text-[7px] text-primary/70 leading-none">HIPAA Compliant</p>
          <p className="text-[10px] font-semibold text-primary leading-tight">Private &amp; Secure</p>
        </div>
      </div>
      <p>
  By continuing, you agree to our{" "}
  <span style={{ textDecoration: "underline", cursor: "pointer" }}>
    Terms of Service
  </span>{" "}
  and{" "}
  <span style={{ textDecoration: "underline", cursor: "pointer" }}>
    Privacy Policy
  </span>.
</p>
    </div>
  );
}
