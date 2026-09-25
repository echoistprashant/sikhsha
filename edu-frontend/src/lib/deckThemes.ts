export type DeckThemeOption = {
  id: string
  name: string
  desc: string
  bg: string
  text: string
  border?: string
}

export type DeckThemeStyle = {
  bg: string
  panel: string
  title: string
  text: string
  badge: string
  accent: string
}

export const deckThemeOptions: DeckThemeOption[] = [
  { id: 'default', name: 'Editorial', desc: 'Clean classroom deck', bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-900' },
  { id: 'science_nature', name: 'Field Lab', desc: 'Science and nature', bg: 'bg-teal-50', border: 'border-teal-300', text: 'text-teal-900' },
  { id: 'mathematics', name: 'Graph Paper', desc: 'Math and physics', bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900' },
  { id: 'mint', name: 'Mint Lab', desc: 'Fresh and crisp', bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-950' },
  { id: 'blueprint', name: 'Blueprint', desc: 'Technical lessons', bg: 'bg-sky-50', border: 'border-sky-300', text: 'text-sky-950' },
  { id: 'folio', name: 'Folio', desc: 'Discussion decks', bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-950' },
  { id: 'deep', name: 'Deep Focus', desc: 'Dark presentation', bg: 'bg-slate-900', border: 'border-teal-400', text: 'text-teal-50' },
  { id: 'dark', name: 'Night Class', desc: 'Low-light rooms', bg: 'bg-zinc-900', border: 'border-emerald-400', text: 'text-zinc-50' },
  { id: 'rust', name: 'Archive', desc: 'History and civics', bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-950' },
]

export const deckThemeStyles: Record<string, DeckThemeStyle> = {
  default: { bg: 'bg-slate-50', panel: 'bg-white border-slate-200', title: 'text-slate-950', text: 'text-slate-700', badge: 'bg-teal-600 text-white', accent: 'bg-rose-500' },
  science_nature: { bg: 'bg-teal-50', panel: 'bg-white border-teal-200', title: 'text-teal-950', text: 'text-teal-800', badge: 'bg-emerald-600 text-white', accent: 'bg-sky-500' },
  mathematics: { bg: 'bg-blue-50', panel: 'bg-white border-blue-200', title: 'text-blue-950', text: 'text-blue-800', badge: 'bg-blue-600 text-white', accent: 'bg-amber-500' },
  mint: { bg: 'bg-cyan-50', panel: 'bg-white border-cyan-200', title: 'text-cyan-950', text: 'text-cyan-800', badge: 'bg-cyan-700 text-white', accent: 'bg-indigo-500' },
  blueprint: { bg: 'bg-sky-50', panel: 'bg-white border-sky-200', title: 'text-sky-950', text: 'text-sky-800', badge: 'bg-sky-700 text-white', accent: 'bg-cyan-500' },
  folio: { bg: 'bg-rose-50', panel: 'bg-white border-rose-200', title: 'text-rose-950', text: 'text-rose-800', badge: 'bg-rose-600 text-white', accent: 'bg-sky-500' },
  deep: { bg: 'bg-slate-950', panel: 'bg-slate-900 border-slate-700', title: 'text-white', text: 'text-slate-200', badge: 'bg-teal-500 text-slate-950', accent: 'bg-amber-400' },
  dark: { bg: 'bg-zinc-950', panel: 'bg-zinc-900 border-zinc-700', title: 'text-white', text: 'text-zinc-200', badge: 'bg-emerald-500 text-zinc-950', accent: 'bg-sky-400' },
  rust: { bg: 'bg-orange-50', panel: 'bg-white border-orange-200', title: 'text-orange-950', text: 'text-orange-800', badge: 'bg-orange-700 text-white', accent: 'bg-teal-500' },
}
