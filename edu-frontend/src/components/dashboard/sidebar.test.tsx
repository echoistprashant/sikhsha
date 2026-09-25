import { navItemsByRole } from './sidebar'

describe('dashboard sidebar admin navigation', () => {
  it('includes teacher content in the shared admin navigation', () => {
    expect(navItemsByRole.admin.map((item) => item.href)).toEqual(
      expect.arrayContaining([
        '/dashboard',
        '/admin/users',
        '/admin/teacher-content',
        '/admin/analytics',
        '/admin/attendance',
      ])
    )
  })
})
