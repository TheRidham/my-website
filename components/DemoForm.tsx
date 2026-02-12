'use client';

import { User, Mail, Building2, Users, ArrowRight } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function DemoForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const form = e.currentTarget;
    const formData = new FormData(form);
    console.log(form);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      company: formData.get('company') as string,
      employees: formData.get('employees') as string,
      message: formData.get('message') as string,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'corporate'), data);
      setSubmitStatus('success');
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="p-8 rounded-3xl bg-card border border-border/60 shadow-sm">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Request a Demo
        </h2>
        <p className="text-muted-foreground mb-8">
          See how QuikAdvice can benefit your organization
        </p>
        {submitStatus === 'success' && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 text-sm">
            Thank you! We'll get back to you soon.
          </div>
        )}
        {submitStatus === 'error' && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-sm">
            Something went wrong. Please try again.
          </div>
        )}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className="flex w-full border px-3 py-2 text-base ring-offset-accent-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 h-12 rounded-xl border-border/60 focus:border-primary/50 bg-corporate"
                name="name"
                placeholder="Your name"
                required
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                className="flex w-full border px-3 py-2 text-base ring-offset-accent-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 h-12 rounded-xl border-border/60 focus:border-primary/50 bg-corporate"
                name="email"
                placeholder="Work email"
                required
              />
            </div>
          </div>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="flex w-full border px-3 py-2 text-base ring-offset-accent-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 h-12 rounded-xl border-border/60 focus:border-primary/50 bg-corporate"
              name="company"
              placeholder="Company name"
              required
            />
          </div>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              name="employees"
              required
              defaultValue=""
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-border/60 focus:border-primary/50 bg-corporate text-foreground appearance-none cursor-pointer"
            >
              <option value="" disabled>
                Number of employees
              </option>
              <option value="1-50">1-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="501-1000">501-1,000 employees</option>
              <option value="1000+">1,000+ employees</option>
            </select>
          </div>
          <textarea
            className="flex min-h-[80px] w-full border px-3 py-2 text-sm ring-offset-accent-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-xl border-border/60 focus:border-primary/50 bg-corporate resize-none"
            name="message"
            placeholder="Anything else you'd like to share... (Optional) "
            rows={4}
          ></textarea>
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 px-4 py-2 w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-300"
            type="submit"
            disabled={isSubmitting}
          >
            <span className="flex items-center gap-2">
              {isSubmitting ? 'Submitting...' : 'Schedule Demo'}
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </form>
      </div>
  );
}
