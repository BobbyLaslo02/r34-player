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

export const THEME = {
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
  transition: '0.2s ease',
  radius: '4px',
  navbarHeight: '68px',
  heroHeight: '70vh',
  maxWidth: '1400px',
} as const
