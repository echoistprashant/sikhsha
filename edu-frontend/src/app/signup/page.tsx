'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuthStore } from '@/stores/auth-store'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, BookOpen, ChevronDown } from 'lucide-react'

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['teacher', 'student', 'admin']),
  grade_level: z.string().optional(),
  section: z.string().optional(),
  subjects_teaching: z.array(z.string()).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => {
  if (data.role === 'student' && !data.grade_level) {
    return false
  }
  if (data.role === 'student' && !data.section) {
    return false
  }
  return true
}, {
  message: "Grade level and section are required for students",
  path: ['grade_level'],
})

type SignupFormData = z.infer<typeof signupSchema>

const GRADE_OPTIONS = [
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
]

const SECTION_OPTIONS = ['A', 'B', 'C', 'D']

const SUBJECT_OPTIONS = [
  'Mathematics',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Geography',
  'Computer Science',
  'Economics',
]

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const register = useAuthStore((state) => state.register)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>('student')
  const [selectedGrade, setSelectedGrade] = useState<string>('')
  const [selectedSection, setSelectedSection] = useState<string>('')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [showGradeDropdown, setShowGradeDropdown] = useState(false)
  const [showSectionDropdown, setShowSectionDropdown] = useState(false)

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'student',
      subjects_teaching: [],
    },
  })

  const toggleSubject = (subject: string) => {
    const newSubjects = selectedSubjects.includes(subject)
      ? selectedSubjects.filter(s => s !== subject)
      : [...selectedSubjects, subject]
    setSelectedSubjects(newSubjects)
    setValue('subjects_teaching', newSubjects)
  }

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    try {
      await register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        grade_level: data.role === 'student' ? data.grade_level : undefined,
        section: data.role === 'student' ? data.section : undefined,
        subjects_teaching: data.role === 'teacher' ? data.subjects_teaching : undefined,
      })
      toast({
        title: 'Success!',
        description: 'Your account has been created successfully.',
      })
      router.push('/dashboard')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create account. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = `w-full px-5 py-3 rounded-full bg-[#e8e8e8] border-none text-gray-700 placeholder:text-gray-400
    shadow-[inset_8px_8px_16px_#c5c5c5,inset_-8px_-8px_16px_#ffffff]
    focus:outline-none focus:shadow-[inset_10px_10px_20px_#c5c5c5,inset_-10px_-10px_20px_#ffffff]
    transition-all duration-300`

  const selectClass = `w-full px-5 py-3 rounded-full bg-[#e8e8e8] border-none text-gray-700 cursor-pointer
    shadow-[inset_8px_8px_16px_#c5c5c5,inset_-8px_-8px_16px_#ffffff]
    transition-all duration-300 flex justify-between items-center`

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e8e8e8] p-4">
      {/* Neumorphic Card */}
      <div className="w-full max-w-md p-8 rounded-3xl bg-[#e8e8e8] shadow-[20px_20px_60px_#c5c5c5,-20px_-20px_60px_#ffffff]">

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-700">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Sign up to get started</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name Field */}
          <div className="space-y-2">
            <label className="text-gray-600 font-medium text-sm">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              {...registerField('name')}
              disabled={isLoading}
              className={inputClass}
            />
            {errors.name && (
              <p className="text-sm text-red-500 font-medium pl-4">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-gray-600 font-medium text-sm">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              {...registerField('email')}
              disabled={isLoading}
              className={inputClass}
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
                placeholder="Minimum 6 characters"
                {...registerField('password')}
                disabled={isLoading}
                className={`${inputClass} pr-12`}
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

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label className="text-gray-600 font-medium text-sm">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                {...registerField('confirmPassword')}
                disabled={isLoading}
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 font-medium pl-4">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Role Dropdown */}
          <div className="space-y-2">
            <label className="text-gray-600 font-medium text-sm">I am a...</label>
            <div className="relative">
              <div
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className={selectClass}
              >
                <span className={selectedRole ? 'text-gray-700' : 'text-gray-400'}>
                  {selectedRole === 'student' ? 'Student' : selectedRole === 'teacher' ? 'Teacher' : selectedRole === 'admin' ? 'Administrator' : 'Select your role'}
                </span>
                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
              </div>
              {showRoleDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#e8e8e8] rounded-2xl shadow-[8px_8px_16px_#c5c5c5,-8px_-8px_16px_#ffffff] z-10 overflow-hidden">
                  {[
                    { value: 'student', label: 'Student' },
                    { value: 'teacher', label: 'Teacher' },
                    { value: 'admin', label: 'Administrator' }
                  ].map((role) => (
                    <div
                      key={role.value}
                      onClick={() => {
                        setSelectedRole(role.value)
                        setValue('role', role.value as 'teacher' | 'student' | 'admin')
                        setSelectedGrade('')
                        setSelectedSection('')
                        setSelectedSubjects([])
                        setValue('grade_level', undefined)
                        setValue('section', undefined)
                        setValue('subjects_teaching', [])
                        setShowRoleDropdown(false)
                      }}
                      className="px-5 py-3 text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors"
                    >
                      {role.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Student-specific fields */}
          {selectedRole === 'student' && (
            <div className="space-y-4">
              {/* Grade Dropdown */}
              <div className="space-y-2">
                <label className="text-gray-600 font-medium text-sm">
                  Grade/Class <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div
                    onClick={() => setShowGradeDropdown(!showGradeDropdown)}
                    className={selectClass}
                  >
                    <span className={selectedGrade ? 'text-gray-700' : 'text-gray-400'}>
                      {selectedGrade || 'Select your class'}
                    </span>
                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${showGradeDropdown ? 'rotate-180' : ''}`} />
                  </div>
                  {showGradeDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#e8e8e8] rounded-2xl shadow-[8px_8px_16px_#c5c5c5,-8px_-8px_16px_#ffffff] z-10 overflow-hidden max-h-48 overflow-y-auto">
                      {GRADE_OPTIONS.map((grade) => (
                        <div
                          key={grade}
                          onClick={() => {
                            setSelectedGrade(grade)
                            setValue('grade_level', grade)
                            setShowGradeDropdown(false)
                          }}
                          className="px-5 py-3 text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors"
                        >
                          {grade}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.grade_level && (
                  <p className="text-sm text-red-500 font-medium pl-4">{errors.grade_level.message}</p>
                )}
              </div>

              {/* Section Dropdown */}
              <div className="space-y-2">
                <label className="text-gray-600 font-medium text-sm">
                  Section <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div
                    onClick={() => setShowSectionDropdown(!showSectionDropdown)}
                    className={selectClass}
                  >
                    <span className={selectedSection ? 'text-gray-700' : 'text-gray-400'}>
                      {selectedSection ? `Section ${selectedSection}` : 'Select your section'}
                    </span>
                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${showSectionDropdown ? 'rotate-180' : ''}`} />
                  </div>
                  {showSectionDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#e8e8e8] rounded-2xl shadow-[8px_8px_16px_#c5c5c5,-8px_-8px_16px_#ffffff] z-10 overflow-hidden">
                      {SECTION_OPTIONS.map((section) => (
                        <div
                          key={section}
                          onClick={() => {
                            setSelectedSection(section)
                            setValue('section', section)
                            setShowSectionDropdown(false)
                          }}
                          className="px-5 py-3 text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors"
                        >
                          Section {section}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Teacher-specific fields */}
          {selectedRole === 'teacher' && (
            <div className="space-y-2">
              <label className="text-gray-600 font-medium text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Subjects You Teach (Optional)
              </label>
              <div className="rounded-2xl p-4 bg-[#e8e8e8] shadow-[inset_5px_5px_10px_#c5c5c5,inset_-5px_-5px_10px_#ffffff] max-h-40 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {SUBJECT_OPTIONS.map((subject) => (
                    <label
                      key={subject}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-200 p-2 rounded-lg transition-colors"
                    >
                      <div
                        onClick={() => toggleSubject(subject)}
                        className={`w-5 h-5 rounded flex items-center justify-center transition-all duration-200
                          ${selectedSubjects.includes(subject)
                            ? 'bg-gray-600 shadow-[2px_2px_4px_#c5c5c5,-2px_-2px_4px_#ffffff]'
                            : 'bg-[#e8e8e8] shadow-[inset_2px_2px_4px_#c5c5c5,inset_-2px_-2px_4px_#ffffff]'
                          }`}
                      >
                        {selectedSubjects.includes(subject) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-gray-700">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
              {selectedSubjects.length > 0 && (
                <p className="text-sm text-gray-500 pl-2">
                  Selected: {selectedSubjects.join(', ')}
                </p>
              )}
            </div>
          )}

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold
              shadow-[5px_5px_10px_#c5c5c5,-5px_-5px_10px_#ffffff]
              hover:shadow-[8px_8px_16px_#c5c5c5,-8px_-8px_16px_#ffffff]
              active:shadow-[inset_5px_5px_10px_#374151,inset_-5px_-5px_10px_#6b7280]
              transition-all duration-300 disabled:opacity-50 mt-6"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Creating account...
              </span>
            ) : 'Create Account'}
          </button>
        </form>



        {/* Login Link */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-gray-700 font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

