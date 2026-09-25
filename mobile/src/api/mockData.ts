// Mock data for features that don't have backend endpoints yet

export interface MockResult {
    id: string;
    examTitle: string;
    subject: string;
    marksObtained: number;
    totalMarks: number;
    examDate: string;
    percentage: number;
}

export interface MockHomework {
    id: string;
    title: string;
    subject: string;
    description: string;
    dueDate: string;
    status: 'pending' | 'completed' | 'overdue';
    assignedBy: string;
}

export interface MockFile {
    id: string;
    name: string;
    type: 'pdf' | 'doc' | 'image';
    subject: string;
    size: string;
    uploadedAt: string;
    url: string;
}

// Mock Results Data
export const MOCK_RESULTS: MockResult[] = [
    {
        id: '1',
        examTitle: 'Mid-Term Physics',
        subject: 'Physics',
        marksObtained: 78,
        totalMarks: 100,
        examDate: '2025-11-15',
        percentage: 78,
    },
    {
        id: '2',
        examTitle: 'Chemistry Unit Test',
        subject: 'Chemistry',
        marksObtained: 85,
        totalMarks: 100,
        examDate: '2025-11-20',
        percentage: 85,
    },
    {
        id: '3',
        examTitle: 'Mathematics Quiz',
        subject: 'Mathematics',
        marksObtained: 42,
        totalMarks: 50,
        examDate: '2025-11-25',
        percentage: 84,
    },
    {
        id: '4',
        examTitle: 'Biology Practical',
        subject: 'Biology',
        marksObtained: 38,
        totalMarks: 50,
        examDate: '2025-12-01',
        percentage: 76,
    },
    {
        id: '5',
        examTitle: 'English Essay',
        subject: 'English',
        marksObtained: 45,
        totalMarks: 50,
        examDate: '2025-12-05',
        percentage: 90,
    },
    {
        id: '6',
        examTitle: 'Physics Final',
        subject: 'Physics',
        marksObtained: 88,
        totalMarks: 100,
        examDate: '2025-12-10',
        percentage: 88,
    },
];

// Mock Homework Data
export const MOCK_HOMEWORK: MockHomework[] = [
    {
        id: '1',
        title: 'Solve Chapter 5 Problems',
        subject: 'Physics',
        description: 'Complete all exercises from Chapter 5 - Newton\'s Laws of Motion',
        dueDate: '2025-12-28',
        status: 'pending',
        assignedBy: 'Mr. Sharma',
    },
    {
        id: '2',
        title: 'Write Essay on Climate Change',
        subject: 'English',
        description: '500 words essay on the effects of climate change',
        dueDate: '2025-12-27',
        status: 'pending',
        assignedBy: 'Ms. Patel',
    },
    {
        id: '3',
        title: 'Chemistry Lab Report',
        subject: 'Chemistry',
        description: 'Submit the lab report for Titration experiment',
        dueDate: '2025-12-20',
        status: 'overdue',
        assignedBy: 'Dr. Singh',
    },
    {
        id: '4',
        title: 'Algebra Practice',
        subject: 'Mathematics',
        description: 'Complete worksheet 12 - Quadratic Equations',
        dueDate: '2025-12-15',
        status: 'completed',
        assignedBy: 'Mr. Kumar',
    },
];

// Mock Files Data
export const MOCK_FILES: MockFile[] = [
    {
        id: '1',
        name: 'Physics Notes - Chapter 5.pdf',
        type: 'pdf',
        subject: 'Physics',
        size: '2.3 MB',
        uploadedAt: '2025-12-10',
        url: 'https://example.com/physics-notes.pdf',
    },
    {
        id: '2',
        name: 'Chemistry Formula Sheet.pdf',
        type: 'pdf',
        subject: 'Chemistry',
        size: '1.1 MB',
        uploadedAt: '2025-12-08',
        url: 'https://example.com/chemistry-formulas.pdf',
    },
    {
        id: '3',
        name: 'Mathematics Question Bank.pdf',
        type: 'pdf',
        subject: 'Mathematics',
        size: '5.2 MB',
        uploadedAt: '2025-12-05',
        url: 'https://example.com/math-questions.pdf',
    },
];

// Helper function to calculate analysis data from results
export function calculateAnalysisData(results: MockResult[]) {
    if (results.length === 0) {
        return {
            averageScore: 0,
            totalExams: 0,
            bestSubject: 'N/A',
            subjectAverages: {},
            performanceTrend: [],
        };
    }

    const totalPercentage = results.reduce((sum, r) => sum + r.percentage, 0);
    const averageScore = totalPercentage / results.length;

    // Calculate subject-wise averages
    const subjectScores: { [key: string]: number[] } = {};
    results.forEach(r => {
        if (!subjectScores[r.subject]) {
            subjectScores[r.subject] = [];
        }
        subjectScores[r.subject].push(r.percentage);
    });

    const subjectAverages: { [key: string]: number } = {};
    let bestSubject = '';
    let bestAverage = 0;

    Object.entries(subjectScores).forEach(([subject, scores]) => {
        const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        subjectAverages[subject] = avg;
        if (avg > bestAverage) {
            bestAverage = avg;
            bestSubject = subject;
        }
    });

    // Performance trend (sorted by date)
    const performanceTrend = [...results]
        .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
        .map(r => ({
            examTitle: r.examTitle,
            percentage: r.percentage,
            date: r.examDate,
        }));

    return {
        averageScore,
        totalExams: results.length,
        bestSubject,
        subjectAverages,
        performanceTrend,
    };
}
