"use client";
import { useState, useMemo } from "react";
import { User, Mail, Calendar, Check, Loader2 } from "lucide-react";
import { getAuth } from "firebase/auth";
import { serverTimestamp, setDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

// Mock user data - replace with your actual imports
const userData = {
  maleAvatar: "https://img.freepik.com/premium-vector/man-avatar-profile-picture-isolated-background-avatar-profile-picture-man_1293239-4841.jpg",
  femaleAvatar: "https://static.vecteezy.com/system/resources/thumbnails/020/271/547/small_2x/portrait-of-a-beautiful-asian-woman-full-face-portrait-in-flat-style-avatar-female-diversity-free-vector.jpg",
};

// Mock Firebase functions - replace with your actual Firebase imports

export default function ProfileSetup() {
  const user = getAuth().currentUser;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { maleAvatar, femaleAvatar } = userData;
  const router = useRouter();

  const validateEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = "Please enter your full name";
    }

    if (!email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!age) {
      newErrors.age = "Please select an age between 13-100";
    }

    if (!gender) {
      newErrors.gender = "Please select your gender";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      if (!user?.uid) {
        throw new Error("User UID is missing");
      }
      // Replace with actual Firebase calls:
      const userRef = doc(db, "users", user?.uid);
      await setDoc(
        userRef,
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          age,
          gender,
          phone: user?.phoneNumber,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Analytics
      /*
      await logRegistrationEvent('phone');
      await logSignUp('phone');
      await logProfileCompleted(gender, age);
      await setUserProperties({
        user_gender: gender,
        user_age_group: age < 25 ? '18-24' : age < 35 ? '25-34' : age < 45 ? '35-44' : '45+',
      });
      */
      alert("✅ Profile saved successfully! Redirecting to home...");
      router.push('/home');
    } catch (e: any) {
      alert(`Failed to save: ${e?.message ?? "Please try again"}`);
    } finally {
      setSaving(false);
    }
  };

  console.log(user)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Avatar */}
      <div className="relative h-80 bg-gradient-to-br from-amber-100 via-purple-100 to-pink-100 flex items-end justify-center pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 pointer-events-none"></div>

        <div className="relative w-32 h-32 rounded-full bg-white shadow-2xl flex items-center justify-center ring-4 ring-white">
          <div className="w-[120px] h-[120px] rounded-full overflow-hidden bg-gray-200">
            <img
              src={gender === "Male" ? maleAvatar : femaleAvatar}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-8 text-center">
          Let's get to know you better
        </h1>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {/* Name Input */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors({ ...errors, name: "" });
                }}
                className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl focus:outline-none transition-all ${
                  errors.name
                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                }`}
              />
            </div>
            {errors.name && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({ ...errors, email: "" });
                }}
                className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl focus:outline-none transition-all ${
                  errors.email
                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                {errors.email}
              </p>
            )}
          </div>

          {/* Age Selector */}
          <label
            htmlFor="age"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Age
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              id="age"
              placeholder="Enter your age"
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                setErrors({ ...errors, age: "" });
              }}
              className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl focus:outline-none transition-all ${
                errors.name
                  ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  : "border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              }`}
            />

            {/* Gender Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Gender
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setGender("Male");
                    setErrors({ ...errors, gender: "" });
                  }}
                  className={`py-3.5 px-6 rounded-xl font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                    gender === "Male"
                      ? "bg-gray-900 text-white shadow-lg"
                      : "bg-white border-2 border-gray-200 text-gray-900 hover:border-gray-300"
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGender("Female");
                    setErrors({ ...errors, gender: "" });
                  }}
                  className={`py-3.5 px-6 rounded-xl font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                    gender === "Female"
                      ? "bg-gray-900 text-white shadow-lg"
                      : "bg-white border-2 border-gray-200 text-gray-900 hover:border-gray-300"
                  }`}
                >
                  Female
                </button>
              </div>
              {errors.gender && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.gender}
                </p>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full mt-8 py-4 bg-gray-900 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                <>
                  Save Profile
                  <Check className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
