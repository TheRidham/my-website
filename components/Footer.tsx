import { Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary-lighter py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-xl">JAI App</span>
            </div>
            <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
              AI + Human expertise in one app. Making expert advice accessible to everyone.
            </p>
            <p className="text-sm font-medium">Made in India 🇮🇳</p>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-5">Categories</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Health & Wellness</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Finance & Tax</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Legal Advice</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Career Guidance</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-5">Resources</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-5">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="mailto:support@jaiapp.in" className="hover:text-foreground transition-colors">support@jaiapp.in</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">LinkedIn</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Instagram</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 JAI App. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer