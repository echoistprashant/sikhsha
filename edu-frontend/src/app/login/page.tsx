'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuthStore } from '@/stores/auth-store'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

// Separate component that uses useSearchParams
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const login = useAuthStore((state) => state.login)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const returnUrl = searchParams.get('returnUrl') || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      const currentUser = useAuthStore.getState().user
      
      toast({
        title: 'Success!',
        description: 'You have been logged in successfully.',
      })

      if (currentUser?.role === 'super_admin') {
        router.push('/super-admin')
      } else {
        router.push(returnUrl)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Invalid credentials. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md p-10 rounded-3xl bg-[#e8e8e8] shadow-[20px_20px_60px_#c5c5c5,-20px_-20px_60px_#ffffff]">

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Username/Email Field */}
        <div className="space-y-2">
          <label className="text-gray-600 font-medium text-sm">Username</label>
          <input
            type="email"
            placeholder="admin@CSSScript.com"
            {...register('email')}
            disabled={isLoading}
            className="w-full px-5 py-3 rounded-full bg-[#e8e8e8] border-none text-gray-700 placeholder:text-gray-400
              shadow-[inset_8px_8px_16px_#c5c5c5,inset_-8px_-8px_16px_#ffffff]
              focus:outline-none focus:shadow-[inset_10px_10px_20px_#c5c5c5,inset_-10px_-10px_20px_#ffffff]
              transition-all duration-300"
          />
          {errors.email && (
            <p className="text-sm text-red-500 font-medium pl-4">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="text-gray-600 font-medium text-sm">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              {...register('password')}
              disabled={isLoading}
              className="w-full px-5 py-3 pr-12 rounded-full bg-[#e8e8e8] border-none text-gray-700 placeholder:text-gray-400
                shadow-[inset_8px_8px_16px_#c5c5c5,inset_-8px_-8px_16px_#ffffff]
                focus:outline-none focus:shadow-[inset_10px_10px_20px_#c5c5c5,inset_-10px_-10px_20px_#ffffff]
                transition-all duration-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 font-medium pl-4">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setRememberMe(!rememberMe)}
              className={`w-5 h-5 rounded flex items-center justify-center transition-all duration-200
                ${rememberMe
                  ? 'bg-gray-600 shadow-[2px_2px_4px_#c5c5c5,-2px_-2px_4px_#ffffff]'
                  : 'bg-[#e8e8e8] shadow-[inset_2px_2px_4px_#c5c5c5,inset_-2px_-2px_4px_#ffffff]'
                }`}
            >
              {rememberMe && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-gray-500 text-sm">Remember me</span>
          </label>
          <Link href="/forgot-password" className="text-gray-500 text-sm hover:text-gray-700 transition-colors">
            Forget password?
          </Link>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold
            shadow-[5px_5px_10px_#c5c5c5,-5px_-5px_10px_#ffffff]
            hover:shadow-[8px_8px_16px_#c5c5c5,-8px_-8px_16px_#ffffff]
            active:shadow-[inset_5px_5px_10px_#374151,inset_-5px_-5px_10px_#6b7280]
            transition-all duration-300 disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Signing in...
            </span>
          ) : 'Sign In'}
        </button>
      </form>



      {/* Sign Up Link */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-gray-700 font-semibold hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  )
}

// Loading fallback for Suspense
function LoginFormSkeleton() {
  return (
    <div className="w-full max-w-md p-10 rounded-3xl bg-[#e8e8e8] shadow-[20px_20px_60px_#c5c5c5,-20px_-20px_60px_#ffffff]">
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-4 w-20 bg-gray-300 rounded" />
          <div className="h-12 bg-gray-300 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-20 bg-gray-300 rounded" />
          <div className="h-12 bg-gray-300 rounded-full" />
        </div>
        <div className="h-12 bg-gray-400 rounded-full" />
      </div>
    </div>
  )
}

// Main page component with Suspense boundary
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e8e8e8] p-4">
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
