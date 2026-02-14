"use client";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import Logo from "../Logo";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Trigger effect slightly earlier for smoother feel
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md border border-emerald-200 shadow-lg shadow-emerald-200/60 py-1 mt-2 w-[80%] rounded-full mx-auto"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-2 group cursor-pointer">
            {/* <span className="font-bold text-2xl tracking-tight text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-400">
              JAI AI
            </span> */}
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className={`hidden md:flex items-center ${isScrolled ? "bg-emerald-50/50 border border-emerald-200/50" : null} rounded-full px-2 py-1.5`}>
            {["Features", "Categories", "Pricing", "About"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-primary rounded-full hover:bg-white transition-all duration-300"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link href={'/auth/login'}>
              <button className="text-primary px-5 py-2.5 rounded-full border border-emerald-500 bg-white shadow-lg font-medium text-sm hover:shadow-emerald-500/30 hover:text-white hover:bg-linear-to-r from-primary to-teal-500 transition-all duration-300 ease-in-out">
                Sign In
              </button>
            </Link>
            <Link href={'/auth/signup'}>
              <button className="group relative px-5 py-2.5 rounded-full bg-slate-900 text-white font-medium text-sm overflow-hidden shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 ease-in-out">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 w-full h-full bg-linear-to-r from-primary to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-600 hover:bg-emerald-50 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`md:hidden absolute left-0 right-0 top-full bg-white/95 backdrop-blur-xl border-b border-emerald-100 shadow-xl transition-all duration-300 ease-in-out ${
            isOpen
              ? "opacity-100 translate-y-0 visible"
              : "opacity-0 -translate-y-2 invisible"
          }`}
        >
          <div className="flex flex-col p-4 space-y-2">
            {["Features", "Categories", "Pricing", "About"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="flex items-center justify-between p-3 text-slate-600 hover:text-primary hover:bg-emerald-50 rounded-xl transition-all"
                onClick={() => setIsOpen(false)}
              >
                <span className="font-medium">{item}</span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </a>
            ))}
            <div className="h-px bg-emerald-100 my-2" />
            <div className="grid grid-cols-2 gap-3">
              <Link href={'/auth/login'}>
                <button className="w-full py-3 px-4 rounded-xl border border-emerald-200 text-slate-600 font-medium hover:bg-emerald-50 transition-colors">
                  Sign In
                </button>
              </Link>
              <Link href={'/auth/signup'}>
                <button className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-primary to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/25">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
