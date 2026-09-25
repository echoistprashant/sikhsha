'use client'

import { useEffect, useState } from 'react'
import { superAdminApi } from '@/lib/super-admin-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Search, User, Users, Mail, School, Shield } from 'lucide-react'

export default function GlobalUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [roleFilter])

  const fetchUsers = async (search = '') => {
    try {
      setIsLoading(true)
      const data = await superAdminApi.getUsers({ search, role: roleFilter || undefined })
      setUsers(data.users)
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch global users', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(searchTerm)
  }

  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Global Users</h1>
          <p className="text-gray-500 mt-1">Search and manage all users across all onboarded schools.</p>
        </div>
        
        <div className="flex gap-4">
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm"
          >
            <option value="">All Roles</option>
            <option value="admin">Admins</option>
            <option value="teacher">Teachers</option>
            <option value="student">Students</option>
          </select>
          <form onSubmit={handleSearch} className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search users by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white border-gray-200"
            />
          </form>
        </div>
      </div>

      {isLoading ? (
        <div className="text-gray-500">Loading users...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Tenant (School)</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize
                        ${user.role === 'admin' ? 'bg-rose-100 text-rose-700' : ''}
                        ${user.role === 'teacher' ? 'bg-blue-100 text-blue-700' : ''}
                        ${user.role === 'student' ? 'bg-emerald-100 text-emerald-700' : ''}
                      `}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.school_name ? (
                        <div>
                          <p className="font-medium text-gray-900">{user.school_name}</p>
                          {user.school_subdomain && (
                            <p className="text-xs text-gray-500 font-mono">
                              {user.school_subdomain}.yourplatform.com
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No school assigned</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-500 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
