import React from 'react';
import { 
  Salad, Dumbbell, Brain, Stethoscope, 
  Heart, Sparkles, Ban, Coins, 
  Scale, Briefcase, Users, Moon,
  Utensils, Pill, Star, FlaskConical,
  Tag, Shirt, ShieldCheck, Gavel,
  UserCircle, Lightbulb, FileText, TrendingUp,
  ShoppingBag, Activity, Calculator, Landmark,
  Leaf, Flower2, Trophy, HeartPulse, HandHelping,
  Meh, User, AlertCircle, CloudRain, Wind,
  Bone, Eye, Smile, Baby, PawPrint, Zap,
  Shield, Ribbon, Palette, Bandage,
  Scissors, Smartphone, Pizza, Wallet, Receipt,
  ClipboardList, Building, Home, MapPin, IdCard,
  Megaphone, School, Circle, MessageCircle, HeartOff,
  Infinity, LucideProps,
  BriefcaseMedical
} from 'lucide-react';

const icons: Record<string, any> = {
  Salad, Dumbbell, Brain, Stethoscope, 
  Heart, Sparkles, Ban, Coins, 
  Scale, Briefcase, Users, Moon,
  Utensils, Pill, Star, FlaskConical,
  Tag, Shirt, ShieldCheck, Gavel,
  UserCircle, Lightbulb, FileText, TrendingUp,
  ShoppingBag, Activity, Calculator, Landmark,
  Leaf, Flower2, Trophy, HeartPulse, HandHelping,
  Meh, User, AlertCircle, CloudRain, Wind,
  Bone, Eye, Smile, Baby, PawPrint, Zap,
  Shield, Ribbon, BriefcaseMedical, Palette, Bandage,
  Scissors, Smartphone, Pizza, Wallet, Receipt,
  ClipboardList, Building, Home, MapPin, IdCard,
  Megaphone, School, Circle, MessageCircle, HeartOff,
  Infinity
};

interface LucideIconProps extends LucideProps {
  name: string;
}

export const LucideIcon = ({ name, ...props }: LucideIconProps) => {
  const Icon = icons[name] || Star;
  return <Icon {...props} />;
};
