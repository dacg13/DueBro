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
          className="w-full h-11 mt-2 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-medium text-sm rounded-xl inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
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
