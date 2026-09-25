import { normalizeLessonPlan } from './lesson-plan-normalizer'

describe('normalizeLessonPlan', () => {
  it('converts cached lesson plan rows into the viewer shape', () => {
    const cachedPlan = {
      title: 'Matter and Materials',
      duration: 90,
      objectives: JSON.stringify(['Understand solids and liquids']),
      concepts: JSON.stringify([
        { id: 'c1', name: 'Matter', description: 'States of matter' },
      ]),
      sequence: JSON.stringify([
        {
          sessionNumber: 1,
          title: 'States of Matter',
          duration: 45,
          objectives: ['Identify solids'],
          introduction: {
            hook: 'Ice cube demo',
            priorKnowledge: 'Daily materials',
            agendaShare: 'Explore solids and liquids',
          },
          activities: [],
          checkForUnderstanding: [],
          closure: 'Exit ticket',
        },
      ]),
      assessments: JSON.stringify({
        formative: ['Observe discussion'],
        summative: 'Worksheet',
      }),
      resources: JSON.stringify({
        resources: ['Ice', 'Glass'],
        prerequisites: ['Basic observation'],
        differentiation: {
          support: ['Sentence starters'],
          extension: ['Classify gases'],
          accommodations: ['Visual aids'],
        },
        standards: ['SCI-1'],
        totalSessions: 1,
      }),
    }

    const normalized = normalizeLessonPlan(cachedPlan)

    expect(normalized).not.toBeNull()
    expect(normalized?.sessions).toHaveLength(1)
    expect(normalized?.sessions[0].title).toBe('States of Matter')
    expect(normalized?.resources).toEqual(['Ice', 'Glass'])
    expect(normalized?.prerequisites).toEqual(['Basic observation'])
    expect(normalized?.totalSessions).toBe(1)
    expect(normalized?.totalDuration).toBe(90)
  })
})
