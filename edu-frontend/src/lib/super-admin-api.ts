import api from './api-client'

export interface PlatformStats {
  schools: {
    total: number
    active: number
    suspended: number
  }
  users: {
    total_users: number
  }
}

export interface School {
  id: string
  name: string
  subdomain: string | null
  contact_email: string
  contact_phone: string | null
  plan: 'free' | 'basic' | 'pro' | 'enterprise'
  is_active: boolean
  max_students: number
  max_teachers: number
  created_at: string
}

export const superAdminApi = {
  // Get platform stats
  getStats: async () => {
    const response = await api.get('/super-admin/stats')
    return response.data
  },

  // Get all schools
  getSchools: async (params?: { page?: number, limit?: number, search?: string }) => {
    const response = await api.get('/super-admin/schools', { params })
    return response.data
  },

  // Toggle school status (suspend/activate)
  toggleSchoolStatus: async (id: string, is_active: boolean) => {
    const response = await api.patch(`/super-admin/schools/${id}/status`, { is_active })
    return response.data
  },

  // Delete a school permanently
  deleteSchool: async (id: string) => {
    const response = await api.delete(`/super-admin/schools/${id}`)
    return response.data
  },

  // Create a new school (tenant) directly
  createSchool: async (data: Partial<School>) => {
    const response = await api.post('/super-admin/schools', data)
    return response.data
  },

  // Get all users across all schools
  getUsers: async (params?: { page?: number, limit?: number, search?: string, role?: string, school_id?: string }) => {
    const response = await api.get('/super-admin/users', { params })
    return response.data
  }
}
