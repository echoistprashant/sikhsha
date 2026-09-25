describe('deckService.downloadPPTX', () => {
  const request = {
    topic: 'Cells',
  } as any

  beforeEach(() => {
    jest.resetModules()
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com'
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_API_URL
    jest.restoreAllMocks()
  })

  it('calls the backend PPTX route with JSON and bearer auth when auth_token exists', async () => {
    const blob = new Blob(['pptx'])
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      blob: jest.fn().mockResolvedValue(blob),
    })

    Object.defineProperty(global, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true,
    })

    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      return key === 'auth_token' ? 'token-123' : null
    })

    const { deckService } = await import('./deckService')

    await expect(deckService.downloadPPTX(request)).resolves.toBe(blob)

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/ai/pptx',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token-123',
        },
        body: JSON.stringify(request),
      })
    )
  })

  it('throws the backend detail when the response is not ok', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({
        detail: 'PPTX generation failed',
      }),
    })

    Object.defineProperty(global, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true,
    })

    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)

    const { deckService } = await import('./deckService')

    await expect(deckService.downloadPPTX(request)).rejects.toThrow('PPTX generation failed')
  })

  it('throws the backend message when the response omits detail', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({
        message: 'PPTX export unavailable',
      }),
    })

    Object.defineProperty(global, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true,
    })

    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)

    const { deckService } = await import('./deckService')

    await expect(deckService.downloadPPTX(request)).rejects.toThrow('PPTX export unavailable')
  })
})

describe('deckService.generateComplete', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com'
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_API_URL
    jest.restoreAllMocks()
  })

  it('preserves cluster and layout metadata when generateComplete resolves', async () => {
    const responsePayload = {
      lesson: {
        meta: {
          topic: 'Newton',
          grade: '9',
          theme: 'blueprint',
          standards: [],
          pedagogical_model: 'I_DO_WE_DO_YOU_DO',
        },
        structure: {
          learning_objectives: [],
          vocabulary: [],
          prerequisites: [],
          bloom_progression: [],
        },
        slides: [{
          id: 'slide_1',
          title: 'Hook',
          content: 'Legacy content',
          order: 1,
          slideType: 'INTRODUCTION',
          bloom_level: 'UNDERSTAND',
          clusterId: 'hook_1',
          pedagogicalRole: 'hook',
          layoutCandidates: ['concept-with-image'],
        }],
      },
    }

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(responsePayload),
    })

    Object.defineProperty(global, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true,
    })

    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)

    const { deckService } = await import('./deckService')
    const deck = await deckService.generateComplete({
      topic: 'Newton',
      subject: 'Physics',
      gradeLevel: '9',
    } as any)

    expect(deck.slides[0].clusterId).toBe('hook_1')
    expect(deck.slides[0].layoutCandidates).toEqual(['concept-with-image'])
  })
})

describe('deckService structured editing operations', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com'
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_API_URL
    jest.restoreAllMocks()
  })

  it('posts cluster regeneration requests to the dedicated endpoint and normalizes the lesson payload', async () => {
    const request = {
      deckId: 'deck_1',
      clusterId: 'explain_1',
      pedagogicalRole: 'explain_deepen',
    }
    const responsePayload = {
      lesson: {
        meta: {
          topic: 'Newton',
          grade: '9',
          theme: 'blueprint',
          standards: [],
          pedagogical_model: 'I_DO_WE_DO_YOU_DO',
        },
        structure: {
          learning_objectives: [],
          vocabulary: [],
          prerequisites: [],
          bloom_progression: [],
        },
        slides: [{
          id: 'slide_9',
          title: 'Concept 1 Explain More',
          content: 'More explanation',
          order: 3,
          slideType: 'CONCEPT',
          bloom_level: 'UNDERSTAND',
          clusterId: 'explain_1',
          pedagogicalRole: 'explain_deepen',
          layoutCandidates: ['two-column-explain', 'concept-with-image'],
        }],
      },
    }

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(responsePayload),
    })

    Object.defineProperty(global, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true,
    })

    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('token-123')

    const { deckService } = await import('./deckService')
    const deck = await deckService.regenerateCluster(request)

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/teacher/decks/regenerate-cluster',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token-123',
        },
        body: JSON.stringify(request),
      })
    )
    expect(deck.slides[0].clusterId).toBe('explain_1')
    expect(deck.slides[0].layoutCandidates).toEqual(['two-column-explain', 'concept-with-image'])
  })

  it('patches layout changes through the dedicated endpoint and preserves the selected layout', async () => {
    const request = {
      deckId: 'deck_1',
      slideId: 'slide_3',
      layoutId: 'two-column-explain',
    }
    const responsePayload = {
      lesson: {
        meta: {
          topic: 'Newton',
          grade: '9',
          theme: 'blueprint',
          standards: [],
          pedagogical_model: 'I_DO_WE_DO_YOU_DO',
        },
        structure: {
          learning_objectives: [],
          vocabulary: [],
          prerequisites: [],
          bloom_progression: [],
        },
        slides: [{
          id: 'slide_3',
          title: 'Worked Example',
          content: 'Apply F = ma.',
          order: 3,
          slideType: 'ACTIVITY',
          bloom_level: 'APPLY',
          clusterId: 'practice_1',
          layoutCandidates: ['two-column-explain', 'guided-practice'],
        }],
      },
    }

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(responsePayload),
    })

    Object.defineProperty(global, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true,
    })

    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)

    const { deckService } = await import('./deckService')
    const deck = await deckService.switchSlideLayout(request)

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/teacher/decks/switch-layout',
      expect.objectContaining({
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })
    )
    expect(deck.slides[0].layoutCandidates?.[0]).toBe('two-column-explain')
  })
})

describe('deckService.generateAndDownloadPPTX', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com'
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_API_URL
    jest.restoreAllMocks()
  })

  it('infers the download filename from a structured deck payload lesson topic', async () => {
    const blob = new Blob(['pptx'])
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      blob: jest.fn().mockResolvedValue(blob),
    })

    Object.defineProperty(global, 'fetch', {
      configurable: true,
      value: fetchMock,
      writable: true,
    })

    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)

    const { deckService } = await import('./deckService')
    const downloadBlobSpy = jest.spyOn(deckService, 'downloadBlob').mockImplementation(() => {})

    await deckService.generateAndDownloadPPTX({
      lesson: {
        meta: {
          topic: 'Linear Equations',
        },
      },
    })

    expect(downloadBlobSpy).toHaveBeenCalledWith(blob, 'Linear_Equations.pptx')
  })
})
