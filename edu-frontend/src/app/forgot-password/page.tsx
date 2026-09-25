'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { GraduationCap, ArrowLeft } from 'lucide-react'
import api from '@/lib/api-client'

export default function ForgotPasswordPage() {
    const { toast } = useToast()
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [resetToken, setResetToken] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) {
            toast({
                title: 'Error',
                description: 'Please enter your email address',
                variant: 'destructive',
            })
            return
        }

        setIsLoading(true)
        try {
            const response = await api.post('/auth/forgot-password', { email })
            setSubmitted(true)

            // In development, show the token
            if (response.data.token) {
                setResetToken(response.data.token)
            }

            toast({
                title: 'Success',
                description: 'Password reset instructions have been sent to your email.',
            })
        } catch (error: any) {
            toast({
                title: 'Request Sent',
                description: 'If an account exists with that email, you will receive password reset instructions.',
            })
            setSubmitted(true)
        } finally {
            setIsLoading(false)
        }
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
                    <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
                    <CardDescription>
                        {submitted
                            ? "Check your email for reset instructions"
                            : "Enter your email to receive password reset instructions"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                                <p className="font-medium mb-2">✓ Instructions Sent</p>
                                <p>
                                    If an account exists with <strong>{email}</strong>, you will receive an email with instructions to reset your password.
                                </p>
                            </div>

                            {resetToken && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
                                    <p className="font-medium text-yellow-800 mb-2">Development Mode:</p>
                                    <p className="text-yellow-700 mb-2">Reset token (for testing):</p>
                                    <code className="block bg-white p-2 rounded border text-xs break-all">{resetToken}</code>
                                    <Link
                                        href={`/reset-password?token=${resetToken}`}
                                        className="inline-block mt-2 text-blue-600 hover:underline"
                                    >
                                        Click here to reset password →
                                    </Link>
                                </div>
                            )}

                            <Button
                                onClick={() => {
                                    setSubmitted(false)
                                    setEmail('')
                                    setResetToken('')
                                }}
                                variant="outline"
                                className="w-full"
                            >
                                Send to Another Email
                            </Button>
                        </div>
                    )}
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
