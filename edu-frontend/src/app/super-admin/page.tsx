'use client'

import { useEffect, useState } from 'react'
import { superAdminApi } from '@/lib/super-admin-api'
import { Users, School, Layers, Activity, Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const data = await superAdminApi.getStats()
      setStats(data)
    } catch (error) {
      toast({
        title: 'Error formatting platform stats',
        description: 'Failed to load the stats',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-black">Loading dashboard...</div>
  }

  return (
    <div className="p-8 pb-20">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Platform Overview</h1>
          <p className="text-gray-500 mt-1">Real-time statistics across all tenants.</p>
        </div>
        <Link href="/super-admin/schools">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md shadow-purple-500/20">
            <Plus className="mr-2 h-4 w-4" /> Add Tenant
          </Button>
        </Link>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Schools Stat */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Schools</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.schools.total}</h3>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                  <School className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex gap-4 text-sm">
                <span className="text-emerald-600 font-medium">{stats.schools.active} Active</span>
                <span className="text-rose-500 font-medium">{stats.schools.suspended} Suspended</span>
              </div>
            </div>

            {/* Users Stat */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Users</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.users.total_users}</h3>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex gap-4 text-xs font-mono text-gray-500">
                <span>{stats.users.students} Stu</span>
                <span>{stats.users.teachers} Tch</span>
                <span>{stats.users.admins} Adm</span>
              </div>
            </div>

            {/* Content Stat */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Decks</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.content.total_decks}</h3>
                </div>
                <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                  <Layers className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                {stats.content.total_activities} Activities, {stats.content.total_lesson_plans} Lessons
              </div>
            </div>

            {/* AI Cost Stat */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total AI Cost</p>
                  <h3 className="text-3xl font-bold text-gray-900">${Number(stats.ai.total_cost).toFixed(2)}</h3>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                  <Activity className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                ${Number(stats.ai.cost_this_month).toFixed(2)} this month
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Recent Tenants</h2>
              <Link href="/super-admin/schools" className="text-sm text-purple-600 font-medium hover:underline">
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">School Name</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Plan</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.recentSchools.map((school: any) => (
                    <tr key={school.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{school.name}</td>
                      <td className="p-4 text-gray-600 text-sm">{school.contact_email}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full capitalize">
                          {school.plan}
                        </span>
                      </td>
                      <td className="p-4">
                        {school.is_active ? (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Active</span>
                        ) : (
                          <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-medium rounded-full">Suspended</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-500 text-sm">
                        {new Date(school.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {stats.recentSchools.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        No schools found. Create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
