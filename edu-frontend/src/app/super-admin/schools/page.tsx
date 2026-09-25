'use client'

import { useEffect, useState } from 'react'
import { superAdminApi, School as SchoolInterface } from '@/lib/super-admin-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Search, Plus, MoreVertical, ShieldBan, ShieldCheck, Trash2, School } from 'lucide-react'

export default function SchoolsPage() {
  const [schools, setSchools] = useState<SchoolInterface[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const { toast } = useToast()

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contact_email: '',
    subdomain: '',
    plan: 'free' as 'free' | 'basic' | 'pro' | 'enterprise'
  })

  useEffect(() => {
    fetchSchools()
  }, [])

  const fetchSchools = async (search = '') => {
    try {
      setIsLoading(true)
      const data = await superAdminApi.getSchools({ search })
      setSchools(data.schools)
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch schools', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchSchools(searchTerm)
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await superAdminApi.toggleSchoolStatus(id, !currentStatus)
      toast({ title: 'Success', description: `School ${!currentStatus ? 'activated' : 'suspended'}` })
      fetchSchools(searchTerm)
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to change status', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will PERMANENTLY delete the school and ALL its data.')) return
    
    try {
      await superAdminApi.deleteSchool(id)
      toast({ title: 'Deleted', description: 'School permanently removed' })
      fetchSchools(searchTerm)
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete school', variant: 'destructive' })
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await superAdminApi.createSchool(formData)
      toast({ title: 'Success', description: 'Tenant school created' })
      setIsAdding(false)
      setFormData({ name: '', contact_email: '', subdomain: '', plan: 'free' })
      fetchSchools()
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to create school', variant: 'destructive' })
    }
  }

  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tenant Schools</h1>
          <p className="text-gray-500 mt-1">Manage all onboarded schools and their subscriptions.</p>
        </div>
        
        <div className="flex gap-4">
          <form onSubmit={handleSearch} className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search tenants..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white border-gray-200"
            />
          </form>
          <Button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Tenant
          </Button>
        </div>
      </div>

      {isAdding && (
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 animate-in fade-in slide-in-from-top-4">
           <h2 className="text-xl font-bold mb-4 text-gray-900">Add New School Tenant</h2>
           <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">School Name *</label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Springfield High" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Contact Email *</label>
                <Input required type="email" value={formData.contact_email} onChange={e => setFormData({...formData, contact_email: e.target.value})} placeholder="admin@springfield.edu" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Subdomain (Optional)</label>
                <Input value={formData.subdomain} onChange={e => setFormData({...formData, subdomain: e.target.value})} placeholder="springfield" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Plan</label>
                <select 
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-200 bg-white text-sm"
                  value={formData.plan} 
                  onChange={e => setFormData({...formData, plan: e.target.value as any})}
                >
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">Create Tenant</Button>
              </div>
           </form>
         </div>
      )}

      {isLoading ? (
        <div className="text-gray-500">Loading schools...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase">School Info</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Users (S/T/A)</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Plan</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {schools.map((school: any) => (
                  <tr key={school.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{school.name}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{school.contact_email}</div>
                      {school.subdomain && (
                        <div className="text-xs text-purple-600 mt-1 font-mono">{school.subdomain}.yourplatform.com</div>
                      )}
                    </td>
                    <td className="p-4">
                       <div className="text-sm text-gray-600 flex gap-2 font-mono bg-gray-100 px-2 py-1 rounded w-fit">
                         <span>{school.student_count}</span>/
                         <span>{school.teacher_count}</span>/
                         <span>{school.admin_count}</span>
                       </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full capitalize">
                        {school.plan}
                      </span>
                    </td>
                    <td className="p-4">
                      {school.is_active ? (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full inline-flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-medium rounded-full inline-flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-500 text-sm">
                      {new Date(school.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={school.is_active ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"}
                          onClick={() => toggleStatus(school.id, school.is_active)}
                        >
                          {school.is_active ? <ShieldBan className="h-4 w-4 mr-1" /> : <ShieldCheck className="h-4 w-4 mr-1" />}
                          {school.is_active ? 'Suspend' : 'Activate'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          onClick={() => handleDelete(school.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {schools.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-500">
                      <School className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      No schools found matching your search.
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
