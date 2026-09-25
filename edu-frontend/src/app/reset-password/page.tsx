'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { GraduationCap, ArrowLeft, CheckCircle } from 'lucide-react'
import api from '@/lib/api-client'

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()

    const [token, setToken] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isValidating, setIsValidating] = useState(true)
    const [isValidToken, setIsValidToken] = useState(false)
    const [resetSuccess, setResetSuccess] = useState(false)
    const [userEmail, setUserEmail] = useState('')

    useEffect(() => {
        const tokenParam = searchParams.get('token')
        if (!tokenParam) {
            toast({
                title: 'Error',
                description: 'No reset token provided',
                variant: 'destructive',
            })
            router.push('/forgot-password')
            return
        }

        setToken(tokenParam)
        validateToken(tokenParam)
    }, [searchParams])

    const validateToken = async (tokenToValidate: string) => {
        setIsValidating(true)
        try {
            const response = await api.get(`/api/auth/verify-reset-token/${tokenToValidate}`)
            if (response.data.valid) {
                setIsValidToken(true)
                setUserEmail(response.data.email)
            } else {
                throw new Error('Invalid token')
            }
        } catch (error: any) {
            toast({
                title: 'Invalid or Expired Token',
                description: 'This password reset link is invalid or has expired. Please request a new one.',
                variant: 'destructive',
            })
            setIsValidToken(false)
            setTimeout(() => router.push('/forgot-password'), 3000)
        } finally {
            setIsValidating(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (newPassword.length < 6) {
            toast({
                title: 'Error',
                description: 'Password must be at least 6 characters long',
                variant: 'destructive',
            })
            return
        }

        if (newPassword !== confirmPassword) {
            toast({
                title: 'Error',
                description: 'Passwords do not match',
                variant: 'destructive',
            })
            return
        }

        setIsLoading(true)
        try {
            await api.post('/auth/reset-password', {
                token,
                newPassword,
            })

            setResetSuccess(true)
            toast({
                title: 'Success',
                description: 'Your password has been reset successfully',
            })

            // Redirect to login after 3 seconds
            setTimeout(() => router.push('/login'), 3000)
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to reset password. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (isValidating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Validating reset token...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!isValidToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <div className="text-red-600 mb-4">
                                <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Invalid Reset Link</h3>
                            <p className="text-gray-600">Redirecting to forgot password page...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (resetSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Password Reset Successful!</h3>
                            <p className="text-gray-600 mb-4">Your password has been updated.</p>
                            <p className="text-sm text-gray-500">Redirecting to login page...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-blue-600 p-3 rounded-full">
                            <GraduationCap className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                    <CardDescription>
                        Enter your new password for {userEmail}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={isLoading}
                                required
                                minLength={6}
                            />
                            <p className="text-xs text-gray-500">Must be at least 6 characters</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 flex items-center">
                        <ArrowLeft className="h-3 w-3 mr-1" />
                        Back to login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    )
}
