"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronRight,
  Salad,
  Dumbbell,
  Brain,
  Stethoscope,
  Heart,
  Sparkles,
  Ban,
  Coins,
  Scale,
  Briefcase,
  Users,
  Moon,
  Utensils,
  Pill,
  Star,
  FlaskConical,
  Tag,
  Shirt,
  ShieldCheck,
  Gavel,
  UserCircle,
  Lightbulb,
  FileText,
  TrendingUp,
  ShoppingBag,
  Activity,
  Calculator,
  Landmark,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import jaiyaAvatar from "@/assets/jaiya.jpg";

import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";

const categories = [
  {
    name: "Nutrition & Diet",
    icon: Salad,
    color: "bg-emerald-50 text-emerald-600",
  },
  { name: "Fitness", icon: Dumbbell, color: "bg-pink-50 text-pink-600" },
  { name: "Mental Health", icon: Brain, color: "bg-blue-50 text-blue-600" },
  {
    name: "General Medicine",
    icon: Stethoscope,
    color: "bg-cyan-50 text-cyan-600",
  },
  { name: "Sexual Health", icon: Heart, color: "bg-red-50 text-red-600" },
  {
    name: "Skin & Beauty",
    icon: Sparkles,
    color: "bg-purple-50 text-purple-600",
  },
  { name: "Addiction", icon: Ban, color: "bg-orange-50 text-orange-600" },
  { name: "Finance", icon: Coins, color: "bg-teal-50 text-teal-600" },
  { name: "Lawyer", icon: Scale, color: "bg-indigo-50 text-indigo-600" },
  {
    name: "Career Coach",
    icon: Briefcase,
    color: "bg-yellow-50 text-yellow-600",
  },
  { name: "Relationship", icon: Users, color: "bg-rose-50 text-rose-600" },
  { name: "Astro", icon: Moon, color: "bg-violet-50 text-violet-600" },
  { name: "Shopping", icon: ShoppingBag, color: "bg-pink-50 text-pink-500" },
  { name: "Chronic Diseases", icon: Activity, color: "bg-red-50 text-red-500" },
  { name: "CA Taxes", icon: Calculator, color: "bg-blue-50 text-blue-500" },
  { name: "Government", icon: Landmark, color: "bg-gray-50 text-gray-600" },
];

const aiApps = [
  { name: "Food Reader", icon: Utensils, color: "bg-emerald-400" },
  { name: "Medicine Reader", icon: Pill, color: "bg-orange-400" },
  { name: "Deima AI", icon: Star, color: "bg-blue-400" },
  { name: "Lab Reports", icon: FlaskConical, color: "bg-purple-400" },
  { name: "Price Compare", icon: Tag, color: "bg-rose-400" },
  { name: "Fashion", icon: Shirt, color: "bg-pink-400" },
  { name: "Truth Detector", icon: ShieldCheck, color: "bg-cyan-400" },
  { name: "AI Judge", icon: Gavel, color: "bg-indigo-400" },
  { name: "AI Personas", icon: UserCircle, color: "bg-violet-400" },
  { name: "AI Suggester", icon: Lightbulb, color: "bg-emerald-500" },
  { name: "Legal Expert", icon: FileText, color: "bg-blue-500" },
  { name: "Investment Finder", icon: TrendingUp, color: "bg-yellow-500" },
];

const featuredAdvisors = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    specialty: "Nutrition & Wellness",
    rating: 4.9,
    image: jaiyaAvatar,
    status: "Online",
  },
  {
    id: 2,
    name: "Marcus Thorne",
    specialty: "Fitness & Strength",
    rating: 4.8,
    image: jaiyaAvatar,
    status: "Online",
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    specialty: "Mental Health",
    rating: 5.0,
    image: jaiyaAvatar,
    status: "Busy",
  },
];

function HomePage({
  onSelectAdvisor,
}: {
  onSelectAdvisor?: (advisor: any) => void;
}) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const displayedCategories = showAllCategories
    ? categories
    : categories.slice(0, 8);

  //user uid
  const user = getAuth().currentUser;
  const router = useRouter();

  useEffect(() => {
    if (!user?.uid) {
      router.replace("/auth/signup");
    }
  }, [user]);

  return (
    <div className="flex flex-col h-full pb-24 bg-slate-50">
      {/* Search Section */}
      <div className="px-5 py-4 sticky top-0 bg-white backdrop-blur-md z-20 border-b border-gray-200/50">
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search AI Specialists"
            className="w-full bg-slate-50/80 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none border border-gray-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Advisor Categories */}
      <div className="mt-2 px-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">
            Explore Advisor Categories
          </h2>
        </div>
        <div className="grid grid-cols-4 gap-x-3 gap-y-6">
          {displayedCategories.map((cat) => (
            <div
              key={cat.name}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div
                className={`w-15 h-15 rounded-2xl ${cat.color} flex items-center justify-center shadow-xs group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300`}
              >
                <cat.icon size={26} />
              </div>
              <span className="text-[11px] text-center font-semibold text-gray-600 leading-tight group-hover:text-blue-600 transition-colors">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowAllCategories(!showAllCategories)}
          className="w-full mt-6 py-3 text-blue-600 text-sm font-bold flex items-center justify-center gap-2 bg-blue-50/50 rounded-xl hover:bg-blue-50 transition-colors"
        >
          {showAllCategories ? (
            <>
              View Less <ChevronUp size={16} />
            </>
          ) : (
            <>
              View More <ChevronDown size={16} />
            </>
          )}
        </button>
      </div>

      {/* AI Apps Section */}
      <div className="mt-10 px-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">
              AI Apps
            </h2>
            <span className="bg-linear-to-r from-blue-600 to-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
              New
            </span>
          </div>
          <button className="text-blue-600 text-xs font-bold hover:underline">
            See All
          </button>
        </div>
        <div className="grid grid-cols-4 gap-x-4 gap-y-6">
          {aiApps.map((app) => (
            <div
              key={app.name}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div
                className={`w-15 h-15 rounded-full ${app.color} flex items-center justify-center text-white shadow-sm group-hover:shadow-lg group-hover:scale-105 transition-all duration-300`}
              >
                <app.icon size={26} />
              </div>
              <span className="text-[11px] text-center font-semibold text-gray-600 leading-tight group-hover:text-blue-600 transition-colors">
                {app.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Advisors */}
      <div className="mt-10 px-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">
            Featured Advisors
          </h2>
          <Link
            href="/home/allAdvisors"
            className="text-blue-600 text-xs font-bold hover:underline"
          >
            See All
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-5 px-5">
          {featuredAdvisors.map((advisor) => (
            <div
              key={advisor.id}
              onClick={() => onSelectAdvisor?.(advisor)}
              className="min-w-40 bg-white rounded-3xl p-4 border border-gray-200 shadow-sm hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="relative w-16 h-16 mx-auto mb-3">
                <Image
                  src={advisor.image}
                  alt={advisor.name}
                  fill
                  className="rounded-2xl object-cover group-hover:scale-105 transition-transform"
                />
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    advisor.status === "Online"
                      ? "bg-green-500"
                      : "bg-amber-500"
                  }`}
                />
              </div>
              <h3 className="text-[13px] font-bold text-gray-900 text-center line-clamp-1">
                {advisor.name}
              </h3>
              <p className="text-[10px] text-blue-600 font-bold text-center uppercase tracking-wider mt-0.5">
                {advisor.specialty}
              </p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Star size={10} className="fill-amber-400 text-amber-400" />
                <span className="text-[10px] font-bold text-gray-600">
                  {advisor.rating}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
