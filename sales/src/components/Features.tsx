"use client";

import { motion } from "framer-motion";
import {
    Users,
    CreditCard,
    CalendarCheck,
    BarChart3,
    Brain,
    Presentation,
    MessageSquare,
    FileText,
    type LucideIcon
} from "lucide-react";
import { Button } from "./ui/button";

const FeatureItem = ({ icon: Icon, text }: { icon: LucideIcon, text: string }) => (
    <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-primary/10 text-primary">
            <Icon size={20} />
        </div>
        <span className="text-gray-700 dark:text-gray-300 font-medium">{text}</span>
    </div>
);

export function Features() {
    return (
        <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold tracking-tight mb-6"
                    >
                        Two Powerhouses, <br />
                        <span className="text-primary">One Complete Solution</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-muted-foreground"
                    >
                        Seamlessly integrate operational efficiency with advanced pedagogical AI tools.
                    </motion.p>
                </div>

                {/* Feature Block 1: Student ERP */}
                <div className="flex flex-col lg:flex-row items-center gap-16 mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex-1 space-y-8"
                    >
                        <div className="inline-block px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300 font-semibold text-sm">
                            Operational Backbone
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold">Student ERP</h3>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Automate the tedious parts of school management. From fees collection to detailed attendance reports, we handle it all so you can focus on education.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <FeatureItem icon={Users} text="Student & Parent Portals" />
                            <FeatureItem icon={CreditCard} text="Fee Management & Razorpay" />
                            <FeatureItem icon={CalendarCheck} text="Smart Attendance Tracking" />
                            <FeatureItem icon={BarChart3} text="Real-time Analytics" />
                        </div>

                        <Button variant="outline" size="lg" className="mt-4">
                            Explore ERP Features
                        </Button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex-1 relative"
                    >
                        {/* Abstract UI Representation */}
                        <div className="relative z-10 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden aspect-[4/3] group">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />

                            {/* Mock dashboard UI */}
                            <div className="p-6 h-full flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-600 rounded" />
                                    <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full" />
                                </div>
                                <div className="flex gap-4 mb-6">
                                    <div className="flex-1 h-24 bg-blue-50 dark:bg-slate-700 rounded-xl border border-blue-100 dark:border-slate-600 p-4">
                                        <div className="h-3 w-16 bg-blue-200 dark:bg-slate-500 rounded mb-2" />
                                        <div className="h-6 w-12 bg-blue-300 dark:bg-slate-400 rounded" />
                                    </div>
                                    <div className="flex-1 h-24 bg-green-50 dark:bg-slate-700 rounded-xl border border-green-100 dark:border-slate-600 p-4">
                                        <div className="h-3 w-16 bg-green-200 dark:bg-slate-500 rounded mb-2" />
                                        <div className="h-6 w-12 bg-green-300 dark:bg-slate-400 rounded" />
                                    </div>
                                </div>
                                <div className="flex-1 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-600 relative overflow-hidden">
                                    {/* Animated graph line */}
                                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-500/10 to-transparent" />
                                </div>
                            </div>
                        </div>
                        {/* Decorative blob behind */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-200/30 dark:bg-blue-900/20 blur-3xl rounded-full -z-10" />
                    </motion.div>
                </div>

                {/* Feature Block 2: EDU AI */}
                <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex-1 space-y-8"
                    >
                        <div className="inline-block px-4 py-1.5 rounded-full border border-purple-200 bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300 font-semibold text-sm">
                            Future of Learning
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold">EDU AI Platform</h3>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Empower teachers with AI assistants for decks and lesson plans. Give students text-based doubt support with saved history and follow-ups.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <FeatureItem icon={Presentation} text="AI Deck Generator" />
                            <FeatureItem icon={MessageSquare} text="Instant Doubt Solving" />
                            <FeatureItem icon={FileText} text="Automated Lesson Plans" />
                            <FeatureItem icon={Brain} text="Concept Explanation" />
                        </div>

                        <Button variant="shiny" size="lg" className="mt-4">
                            Try AI Demo
                        </Button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex-1 relative"
                    >
                        {/* Abstract UI Representation */}
                        <div className="relative z-10 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden aspect-[4/3]">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/5 to-pink-500/5" />

                            <div className="p-6 h-full flex flex-col relative">
                                {/* Chat Interface Mockup */}
                                <div className="space-y-4">
                                    <div className="bg-slate-100 dark:bg-slate-700 rounded-lg rounded-tl-none p-3 max-w-[80%] self-start animate-pulse">
                                        <div className="h-2 w-32 bg-slate-300 dark:bg-slate-500 rounded mb-2" />
                                        <div className="h-2 w-24 bg-slate-300 dark:bg-slate-500 rounded" />
                                    </div>
                                    <div className="bg-purple-600 text-white rounded-lg rounded-tr-none p-3 max-w-[80%] ml-auto shadow-lg">
                                        <p className="text-sm">Identify the chemical reaction shown in the image.</p>
                                    </div>
                                    <div className="bg-slate-100 dark:bg-slate-700 rounded-lg rounded-tl-none p-3 max-w-[90%] self-start shadow-sm border border-slate-200 dark:border-slate-600">
                                        <p className="text-xs font-bold text-purple-600 mb-1">AI Solution</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">This is a combustion reaction. The hydrocarbon reacts with oxygen to produce carbon dioxide and water.</p>
                                    </div>
                                </div>

                                {/* Floating elements */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute bottom-6 right-6 p-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur border border-purple-200 dark:border-purple-900 rounded-xl shadow-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
                                            <Presentation size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold">Deck Generated</p>
                                            <p className="text-[10px] text-muted-foreground">Physics • 12 Slides</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                        {/* Decorative blob */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-200/30 dark:bg-purple-900/20 blur-3xl rounded-full -z-10" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
