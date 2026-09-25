// ===================================================
// Chalkie-Inspired Deck System: TypeScript Type Definitions
// Phase 1: JSON Schema & IR Enhancement
// ===================================================

export enum BloomLevel {
    REMEMBER = 'REMEMBER',      // Recall facts, terms, basic concepts
    UNDERSTAND = 'UNDERSTAND',  // Explain ideas, summarize
    APPLY = 'APPLY',           // Use in new situations, solve problems
    ANALYZE = 'ANALYZE',       // Draw connections, differentiate
    EVALUATE = 'EVALUATE',     // Justify, critique, judge
    CREATE = 'CREATE'          // Design, construct, produce
}

export enum PedagogicalModel {
    I_DO_WE_DO_YOU_DO = 'I_DO_WE_DO_YOU_DO',
    DIRECT_INSTRUCTION = 'DIRECT_INSTRUCTION',
    INQUIRY_BASED = 'INQUIRY_BASED',
    COLLABORATIVE = 'COLLABORATIVE'
}

export enum SlideType {
    INTRODUCTION = 'INTRODUCTION',
    CONCEPT = 'CONCEPT',
    ACTIVITY = 'ACTIVITY',
    ASSESSMENT = 'ASSESSMENT',
    SUMMARY = 'SUMMARY'
}

export enum DifferentiationLevel {
    SUPPORT = 'SUPPORT',      // Simplified (Bloom's 1-2)
    CORE = 'CORE',           // Standard (Bloom's 1-3)
    EXTENSION = 'EXTENSION'  // Advanced (Bloom's 4-6)
}

export interface LessonMetadata {
    lesson_id: string
    topic: string
    subject?: string
    grade: string
    standards: string[]  // e.g., ["RL.5.1", "RL.5.2"]
    theme: string        // PowerPoint theme name
    pedagogical_model: PedagogicalModel
    pedagogical_flow?: string
    created_at: string
}

export interface LearningObjective {
    objective: string
    bloom_level: BloomLevel
}

export interface VocabularyTerm {
    term: string
    definition: string
    grade_appropriate: boolean
}

export interface LearningStructure {
    learning_objectives: LearningObjective[]
    vocabulary: VocabularyTerm[]
    prerequisites: string[]
    bloom_progression: BloomLevel[]
}

export interface VisualMetadata {
    visualType?: string
    visualConfig?: any
    confidence?: number
    generatedBy?: string
    reasoning?: string
}

export interface ContentBlock {
    type: string
    text?: string
    items?: string[]
    value?: string
}

export interface VisualIntent {
    purpose: string
    assetType: string
    priority: 'required' | 'optional'
    sourceStrategy: 'stock' | 'generated' | 'diagrammatic' | 'renderer_native'
}

export interface EditingHints {
    locked?: boolean
    canAddBlocks?: string[]
    canRemoveBlocks?: string[]
    notes?: Record<string, unknown>
}

export interface PracticeMetadata {
    difficulty?: string
    answerMode?: string
    stepCount?: number
    misconception?: string
}

export interface Slide {
    id: string
    title: string
    content: string
    imageUrl?: string  // Deprecated
    order: number
    notes?: string     // Deprecated
    slideType: SlideType
    bloom_level: BloomLevel
    speakerNotes?: string
    imageQuery?: string  // e.g., "sun shining on ocean water"
    visualMetadata?: VisualMetadata
    clusterId?: string
    pedagogicalRole?: 'hook' | 'explain_core' | 'explain_deepen' | 'worked_example' | 'compare_example' | 'guided_practice' | 'independent_practice' | 'summary'
    instructionalGoal?: string
    contentMode?: 'text_only' | 'image_support' | 'diagram' | 'chart' | 'equation' | 'comparison' | 'question'
    contentBlocks?: ContentBlock[]
    layoutCandidates?: string[]
    density?: 'low' | 'medium' | 'high'
    importance?: 'primary' | 'secondary'
    visualIntent?: VisualIntent
    editingHints?: EditingHints
    practiceMetadata?: PracticeMetadata
}

export interface LessonDeck {
    id: string
    meta: LessonMetadata
    structure: LearningStructure
    slides: Slide[]
    createdBy: string
    createdAt: string
    updatedAt: string
}

// ===== LEGACY TYPES (for backward compatibility) =====
export interface Deck {
    id: string
    title: string
    subject: string
    gradeLevel: string
    slides: Slide[]
    createdBy: string
    createdAt: string
    updatedAt: string
}

export interface LessonDeck {
    id: string
    meta: LessonMetadata
    structure: LearningStructure
    slides: Slide[]
    createdBy: string
    createdAt: string
    updatedAt: string
}

// ===== LEGACY TYPES (for backward compatibility) =====
export interface Deck {
    id: string
    title: string
    subject: string
    gradeLevel: string
    slides: Slide[]
    createdBy: string
    createdAt: string
    updatedAt: string
}

export interface DeckGenerateRequest {
    topic?: string  // Legacy single topic
    topics?: string[]  // New multi-topic
    subject: string
    gradeLevel: string
    chapter?: string
    curriculum?: string
    numSlides?: number
    structuredFormat?: boolean
    theme?: string
    standards?: string[]
    pedagogical_model?: PedagogicalModel
    pedagogyFlow?: string
    level?: DifferentiationLevel
    additionalInstructions?: string
}

// ===== OTHER EXISTING TYPES =====
export interface TopicItem {
    id: string
    title: string
    content: string
    imageUrl?: string
    order: number
    notes?: string
    visualMetadata?: VisualMetadata
}

export interface Topic {
    id: string
    title: string
    subject: string
    gradeLevel: string
    slides: TopicItem[]
    createdBy: string
    createdAt: string
    updatedAt: string
}

export interface TopicGenerateRequest {
    topic: string
    subject: string
    gradeLevel: string
    numSlides?: number
}

export interface Activity {
    id: string
    title: string
    subject: string
    activityType: string
    duration: number
    materials: string[]
    steps: string[]
    learningOutcomes: string[]
    createdBy: string
    createdAt: string
}

export interface ActivityGenerateRequest {
    topic: string
    subject: string
    duration: number
    activityType: string
    gradeLevel: string
}

export interface LessonPlan {
    id: string
    title: string
    subject: string
    gradeLevel: string
    duration: number
    objectives: string[]
    concepts: Concept[]
    sequence: LessonStep[]
    assessments: string[]
    resources: string[]
    createdBy: string
    createdAt: string
}

export interface LessonStep {
    order: number
    activity: string
    duration: number
    method: string
    resources: string[]
}

export interface Concept {
    id: string
    name: string
    description: string
    subject: string
    gradeLevel: string
    prerequisites: string[]
    relatedConcepts: string[]
}

export interface LessonPlanGenerateRequest {
    topics: string[]
    subject: string
    gradeLevel: string
    totalDuration: number
}
