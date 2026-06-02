import { ContentCategory, Genre } from '../types'

export const DEFAULT_CATEGORIES: ContentCategory[] = [
  { title: 'Trending Now', tags: 'score:>100', description: 'Highest rated posts' },
  { title: 'Newest Uploads', tags: '', description: 'Latest content from the community' },
  { title: 'Most Popular', tags: 'sort:score', description: 'All-time favorites' },
]

export const GENRES: Genre[] = [
  { name: 'Female', tags: 'female', description: 'Female characters', icon: '♀' },
  { name: 'Male', tags: 'male', description: 'Male characters', icon: '♂' },
  { name: 'Solo', tags: 'solo', description: 'Solo female content', icon: '1' },
  { name: 'Hentai', tags: 'hentai', description: 'Hentai', icon: 'H' },
  { name: 'Anal', tags: 'anal', description: 'Anal content', icon: 'A' },
  { name: 'Oral', tags: 'oral', description: 'Oral content', icon: 'O' },
  { name: 'Group', tags: 'group', description: 'Group / gangbang', icon: 'G' },
  { name: 'BDSM', tags: 'bdsm', description: 'Bondage & discipline', icon: 'B' },
  { name: 'Furry', tags: 'furry', description: 'Furry / anthro', icon: 'F' },
  { name: 'Cosplay', tags: 'cosplay', description: 'Cosplay content', icon: 'C' },
  { name: 'Lesbian', tags: 'lesbian', description: 'Girl on girl', icon: '⚢' },
  { name: 'Gay', tags: 'gay+male', description: 'Gay male content', icon: '⚣' },
  { name: 'Big Tits', tags: 'big_breasts+big_areolae', description: 'Large breasts', icon: 'T' },
  { name: 'Big Ass', tags: 'big_ass+wide_hips', description: 'Large ass', icon: 'S' },
  { name: 'Blowjob', tags: 'blowjob+deep_throat', description: 'Oral sex', icon: 'J' },
  { name: 'Masturbation', tags: 'masturbation', description: 'Self pleasure', icon: 'M' },
  { name: 'Cum', tags: 'cum+cumshot+cum_inside', description: 'Cum content', icon: 'C' },
  { name: 'POV', tags: 'point_of_view+first_person', description: 'Point of view', icon: 'P' },
  { name: 'School', tags: 'school_uniform+teacher+student', description: 'School setting', icon: 'S' },
  { name: 'MILF', tags: 'milf+older+mother', description: 'Mature women', icon: 'M' },
]

export type ThemeKey = 'dark' | 'blue' | 'forest' | 'purple' | 'light'

export interface ThemePalette {
  bg: string
  bgSecondary: string
  bgCard: string
  bgHover: string
  text: string
  textSecondary: string
  accent: string
  accentHover: string
  gold: string
  border: string
}

export const THEMES: Record<ThemeKey, ThemePalette> = {
  dark: {
    bg: '#141414',
    bgSecondary: '#1f1f1f',
    bgCard: '#2a2a2a',
    bgHover: '#333',
    text: '#fff',
    textSecondary: '#999',
    accent: '#e50914',
    accentHover: '#ff0f1f',
    gold: '#ffd700',
    border: '#333',
  },
  blue: {
    bg: '#0d1117',
    bgSecondary: '#161b22',
    bgCard: '#21262d',
    bgHover: '#30363d',
    text: '#f0f6fc',
    textSecondary: '#8b949e',
    accent: '#1f6feb',
    accentHover: '#388bfd',
    gold: '#ffd700',
    border: '#30363d',
  },
  forest: {
    bg: '#0f1a12',
    bgSecondary: '#16281a',
    bgCard: '#1f3324',
    bgHover: '#2a4230',
    text: '#ecfdf3',
    textSecondary: '#8ba892',
    accent: '#2ea043',
    accentHover: '#3fb950',
    gold: '#ffd700',
    border: '#2a4230',
  },
  purple: {
    bg: '#130e1f',
    bgSecondary: '#1c1630',
    bgCard: '#282145',
    bgHover: '#352d57',
    text: '#f0e6ff',
    textSecondary: '#a694cc',
    accent: '#7c3aed',
    accentHover: '#8b5cf6',
    gold: '#ffd700',
    border: '#352d57',
  },
  light: {
    bg: '#ffffff',
    bgSecondary: '#f0f0f0',
    bgCard: '#ffffff',
    bgHover: '#e8e8e8',
    text: '#111111',
    textSecondary: '#666666',
    accent: '#e50914',
    accentHover: '#cc0000',
    gold: '#b8860b',
    border: '#dddddd',
  },
}

export function applyTheme(key: ThemeKey) {
  const t = THEMES[key]
  if (!t) return
  const root = document.documentElement
  Object.entries(t).forEach(([prop, val]) => {
    root.style.setProperty(`--r34-${prop}`, val)
  })
  try { localStorage.setItem('r34-theme', key) } catch {}
}

export function getStoredTheme(): ThemeKey {
  try {
    const stored = localStorage.getItem('r34-theme')
    if (stored && stored in THEMES) return stored as ThemeKey
  } catch {}
  return 'dark'
}

export const THEME = {
  bg: 'var(--r34-bg)',
  bgSecondary: 'var(--r34-bgSecondary)',
  bgCard: 'var(--r34-bgCard)',
  bgHover: 'var(--r34-bgHover)',
  text: 'var(--r34-text)',
  textSecondary: 'var(--r34-textSecondary)',
  accent: 'var(--r34-accent)',
  accentHover: 'var(--r34-accentHover)',
  gold: 'var(--r34-gold)',
  border: 'var(--r34-border)',
  transition: '0.2s ease',
  radius: '4px',
  navbarHeight: '68px',
  heroHeight: '70vh',
  maxWidth: '1400px',
}
