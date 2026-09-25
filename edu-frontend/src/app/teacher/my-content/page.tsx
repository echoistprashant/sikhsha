'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api-client'
import {
    ArrowLeft,
    GraduationCap,
    FileText,
    ClipboardList,
    BookOpen,
    Loader2,
    Trash2,
    Eye,
    Calendar,
    AlertCircle
} from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ContentItem {
    id: string
    title: string
    subject?: string
    grade_level?: string
    created_at: string
    type?: string
    chapter?: string
}

export default function MyContentPage() {
    const [loading, setLoading] = useState(true)
    const [decks, setDecks] = useState<ContentItem[]>([])
    const [lessonPlans, setLessonPlans] = useState<ContentItem[]>([])
    const [activities, setActivities] = useState<ContentItem[]>([])
    const [questions, setQuestions] = useState<ContentItem[]>([])
    const [deleting, setDeleting] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        fetchAllContent()
    }, [])

    const fetchAllContent = async () => {
        setLoading(true)
        try {
            const [decksRes, lessonsRes, activitiesRes, questionsRes] = await Promise.all([
                api.get('/teacher/decks').catch(() => ({ data: [] })),
                api.get('/teacher/lesson-plans').catch(() => ({ data: [] })),
                api.get('/teacher/activities').catch(() => ({ data: [] })),
                api.get('/teacher/question-sets').catch(() => ({ data: [] }))
            ])
            setDecks(decksRes.data || [])
            setLessonPlans(lessonsRes.data || [])
            setActivities(activitiesRes.data || [])
            setQuestions(questionsRes.data || [])
        } catch (err) {
            console.error('Failed to fetch content:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (type: string, id: string) => {
        setDeleting(id)
        try {
            const endpoint = {
                deck: `/teacher/deck/${id}`,
                lesson: `/teacher/lesson-plan/${id}`,
                activity: `/teacher/activity/${id}`,
                question: `/teacher/question-set/${id}`
            }[type]

            await api.delete(endpoint!)

            // Remove from state
            switch (type) {
                case 'deck':
                    setDecks(prev => prev.filter(d => d.id !== id))
                    break
                case 'lesson':
                    setLessonPlans(prev => prev.filter(l => l.id !== id))
                    break
                case 'activity':
                    setActivities(prev => prev.filter(a => a.id !== id))
                    break
                case 'question':
                    setQuestions(prev => prev.filter(q => q.id !== id))
                    break
            }

            toast({
                title: 'Deleted',
                description: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`,
            })
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to delete. Please try again.',
                variant: 'destructive'
            })
        } finally {
            setDeleting(null)
        }
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const ContentCard = ({ item, type, icon: Icon, viewHref, color }: {
        item: ContentItem
        type: string
        icon: React.ComponentType<{ className?: string }>
        viewHref: string
        color: string
    }) => (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 flex-wrap">
                                {item.subject && (
                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{item.subject}</span>
                                )}
                                {item.grade_level && (
                                    <span className="text-xs">Class {item.grade_level}</span>
                                )}
                                {item.chapter && (
                                    <span className="text-xs text-gray-400 truncate max-w-[120px]">{item.chapter}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                                <Calendar className="h-3 w-3" />
                                {formatDate(item.created_at)}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Link href={viewHref}>
                            <Button variant="ghost" size="sm" title="View">
                                <Eye className="h-4 w-4 text-gray-600" />
                            </Button>
                        </Link>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    title="Delete"
                                    disabled={deleting === item.id}
                                >
                                    {deleting === item.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    )}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete {type}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete "{item.title}". This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => handleDelete(type, item.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    const EmptyState = ({ type, href, action }: { type: string, href: string, action: string }) => (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No {type} yet</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">Generate your first {type.toLowerCase()} to see it here</p>
            <Link href={href}>
                <Button variant="outline">{action}</Button>
            </Link>
        </div>
    )

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-8">
                <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">My Content</h1>
                <p className="text-muted-foreground">
                    View and manage all your generated content
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
            ) : (
                <Tabs defaultValue="decks" className="space-y-6">
                    <TabsList className="grid w-full max-w-2xl grid-cols-4">
                        <TabsTrigger value="decks" className="gap-2">
                            <GraduationCap className="h-4 w-4" />
                            <span className="hidden sm:inline">Decks</span> ({decks.length})
                        </TabsTrigger>
                        <TabsTrigger value="lessons" className="gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="hidden sm:inline">Lessons</span> ({lessonPlans.length})
                        </TabsTrigger>
                        <TabsTrigger value="activities" className="gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span className="hidden sm:inline">Activities</span> ({activities.length})
                        </TabsTrigger>
                        <TabsTrigger value="questions" className="gap-2">
                            <ClipboardList className="h-4 w-4" />
                            <span className="hidden sm:inline">Questions</span> ({questions.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="decks">
                        {decks.length === 0 ? (
                            <EmptyState type="Decks" href="/teacher/deck-generator" action="Create Deck" />
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {decks.map(deck => (
                                    <ContentCard
                                        key={deck.id}
                                        item={deck}
                                        type="deck"
                                        icon={GraduationCap}
                                        viewHref={`/teacher/deck/${deck.id}`}
                                        color="bg-blue-100 text-blue-600"
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="lessons">
                        {lessonPlans.length === 0 ? (
                            <EmptyState type="Lesson Plans" href="/teacher/lesson-planner" action="Create Lesson Plan" />
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {lessonPlans.map(plan => (
                                    <ContentCard
                                        key={plan.id}
                                        item={plan}
                                        type="lesson"
                                        icon={FileText}
                                        viewHref={`/teacher/lesson-plan/${plan.id}`}
                                        color="bg-indigo-100 text-indigo-600"
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="activities">
                        {activities.length === 0 ? (
                            <EmptyState type="Activities" href="/teacher/activities" action="Create Activity" />
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activities.map(activity => (
                                    <ContentCard
                                        key={activity.id}
                                        item={activity}
                                        type="activity"
                                        icon={BookOpen}
                                        viewHref={`/teacher/activity/${activity.id}`}
                                        color="bg-green-100 text-green-600"
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="questions">
                        {questions.length === 0 ? (
                            <EmptyState type="Question Sets" href="/teacher/question-generator" action="Generate Questions" />
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {questions.map(question => (
                                    <ContentCard
                                        key={question.id}
                                        item={question}
                                        type="question"
                                        icon={ClipboardList}
                                        viewHref={`/teacher/questions/${question.id}`}
                                        color="bg-purple-100 text-purple-600"
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    )
}
