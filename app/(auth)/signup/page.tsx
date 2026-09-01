"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/lib/validation/auth";
import { signUpAction } from "@/server/actions/auth";
import { User, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        },
      });
    } catch {
      setServerError("Failed to initiate Google sign in.");
      setIsGoogleLoading(false);
    }
  };

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const result = await signUpAction(data);
      if (!result.success) {
        setServerError(result.error || "Failed to create account. Please try again.");
        setIsLoading(false);
      } else {
        // Successful signup leads directly to Onboarding
        router.push("/onboarding");
        router.refresh();
      }
    } catch {
      setServerError("An unexpected error occurred during signup.");
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-text-primary">Create your account</h2>
        <p className="text-sm text-text-secondary mt-1">Get started with intelligent deadline tracking</p>
      </div>

      {serverError && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
          <span>{serverError}</span>
        </div>
      )}

      {/* Google Sign Up Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isLoading}
        className="w-full h-11 mb-4 bg-void-900 border border-white/10 hover:border-white/25 text-signal-white text-sm font-medium rounded-xl inline-flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm hover:shadow-md"
      >
        {isGoogleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-mist-200" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9c-.2-.7-.4-1.5-.4-2.4z"
            />
            <path
              fill="#34A853"
              d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
            />
          </svg>
        )}
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="relative flex py-2 items-center mb-4">
        <div className="flex-grow border-t border-white/8"></div>
        <span className="flex-shrink mx-3 text-[11px] text-mist-200 uppercase tracking-wider">or with email</span>
        <div className="flex-grow border-t border-white/8"></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-xs font-medium text-text-secondary mb-1.5">
            Full name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="name"
              type="text"
              placeholder="Alex Johnson"
              {...register("name")}
              disabled={isLoading}
              className={`w-full h-11 pl-10 pr-3.5 bg-bg-elevated border ${
                errors.name ? "border-error" : "border-border-default hover:border-border-hover focus:border-accent"
              } rounded-xl text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none transition-colors`}
            />
          </div>
          {errors.name && <p className="text-error text-xs mt-1.5">{errors.name.message}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-text-secondary mb-1.5">
            Email address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="email"
              type="email"
              placeholder="student@university.edu"
              {...register("email")}
              disabled={isLoading}
              className={`w-full h-11 pl-10 pr-3.5 bg-bg-elevated border ${
                errors.email ? "border-error" : "border-border-default hover:border-border-hover focus:border-accent"
              } rounded-xl text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none transition-colors`}
            />
          </div>
          {errors.email && <p className="text-error text-xs mt-1.5">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-xs font-medium text-text-secondary mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 6 characters"
              {...register("password")}
              disabled={isLoading}
              className={`w-full h-11 pl-10 pr-10 bg-bg-elevated border ${
                errors.password ? "border-error" : "border-border-default hover:border-border-hover focus:border-accent"
              } rounded-xl text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none transition-colors`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-error text-xs mt-1.5">{errors.password.message}</p>}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-medium text-text-secondary mb-1.5">
            Confirm password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter password"
              {...register("confirmPassword")}
              disabled={isLoading}
              className={`w-full h-11 pl-10 pr-3.5 bg-bg-elevated border ${
                errors.confirmPassword
                  ? "border-error"
                  : "border-border-default hover:border-border-hover focus:border-accent"
              } rounded-xl text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none transition-colors`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-error text-xs mt-1.5">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 mt-2 bg-signal-white hover:bg-mist-100 disabled:opacity-50 text-void-950 font-bold text-sm rounded-xl inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(250,250,252,0.25)] hover:shadow-[0_0_28px_rgba(250,250,252,0.4)]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-void-950" />
              Creating account...
            </>
          ) : (
            <>
              Continue to Setup
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </div>
  );
}
