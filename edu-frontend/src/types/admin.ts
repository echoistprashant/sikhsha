export interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  date: string
  status: 'present' | 'absent' | 'late'
  method: 'manual' | 'qr' | 'geofence'
  timestamp: string
  location?: {
    latitude: number
    longitude: number
  }
}

export interface AttendanceSession {
  id: string
  teacherId: string
  classId: string
  date: string
  records: AttendanceRecord[]
  createdAt: string
}

export interface AnalyticsSummary {
  totalUsers: number
  activeUsers: number
  totalDecks: number
  totalActivities: number
  totalDoubts: number
  aiCostTotal: number
  aiCostThisMonth: number
}

export interface UsageMetrics {
  feature: string
  usage: number
  users: number
  trend: 'up' | 'down' | 'stable'
}

export interface PopularTopic {
  topic: string
  subject: string
  count: number
}

export interface UserManagement {
  id: string
  name: string
  email: string
  role: 'teacher' | 'student' | 'admin'
  schoolId: string
  status: 'active' | 'inactive'
  createdAt: string
  lastActive?: string
}

export interface BulkImportUser {
  name: string
  email: string
  role: 'teacher' | 'student'
  schoolId: string
}
