import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react'
import { R34Post, Favorite, Genre } from '../types'
import { usePosts } from '../hooks/usePosts'
import { useGenreThumbnails } from '../hooks/useGenreThumbnails'
import { useFileSizeSort } from '../hooks/useFileSizeSort'
import Hero from './Hero'
import MediaCard from './MediaCard'
import GenreCard from './GenreCard'
import FavoritesSection from './FavoritesSection'
import Pagination from './Pagination'
import { GENRES, THEME } from '../styles/theme'

const SEARCH_SORTS = [
  { key: 'latest', label: 'Latest', tag: '' },
  { key: 'popular', label: 'Popular', tag: 'sort:score' },
  { key: 'longest', label: 'Longest', tag: '' },
] as const

type SearchSort = (typeof SEARCH_SORTS)[number]['key']

function filterVideos(posts: R34Post[], videoOnly: boolean): R34Post[] {
  if (!videoOnly) return posts
  return posts.filter(p => p.type === 'video' || p.type === 'gif')
}

const styles: Record<string, React.CSSProperties> = {
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    color: THEME.textSecondary,
    fontSize: '14px',
  },
  searchResults: {
    padding: '20px 24px',
  },
  searchTitle: {
    fontSize: '20px',
    fontWeight: 700,
    marginBottom: '12px',
    color: THEME.text,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '10px',
  },
  error: {
    textAlign: 'center',
    padding: '60px 20px',
    color: THEME.textSecondary,
  },
  feed: {
    padding: '0 24px 40px',
  },
  feedTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: THEME.text,
    marginBottom: '16px',
  },
  section: {
    padding: '0 24px 16px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: THEME.text,
    marginBottom: '12px',
  },
  genreRow: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '6px',
  },
  filterNotice: {
    padding: '10px 24px 0',
  },
  searchMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  sortToggle: {
    display: 'flex',
    gap: '4px',
    background: THEME.bgCard,
    borderRadius: THEME.radius,
    padding: '2px',
  },
}

function sortBtnStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? THEME.accent : 'transparent',
    color: THEME.text,
    border: 'none',
    borderRadius: '3px',
    padding: '4px 14px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: `background ${THEME.transition}`,
  }
}

interface BrowsePageProps {
  onPlay: (post: R34Post) => void
  onStartPlaylist: (posts: R34Post[], startIndex: number, reshuffleFn?: () => R34Post[]) => void
  searchQuery: string
  searchTags: string[]
  videoOnly: boolean
  favorites: Favorite[]
  onToggleFavorite: (fav: Favorite) => void
  isFavorite: (id: string) => boolean
  onRemoveFavorite: (id: string) => void
  onSearch: (query: string) => void
  onAddToLibrary?: (post: R34Post) => void
  isInLibrary?: (postId: number) => boolean
  onRemoveFromLibrary?: (postId: number) => void
}

function SearchResults({
  query,
  onPlay,
  onStartPlaylist,
  videoOnly,
  onToggleFavorite,
  isFavorite,
  favorites,
  onAddToLibrary,
  isInLibrary,
  onRemoveFromLibrary,
  onSearch,
}: {
  query: string
  onPlay: (post: R34Post) => void
  onStartPlaylist?: (posts: R34Post[], startIndex: number, reshuffleFn?: () => R34Post[]) => void
  videoOnly: boolean
  onToggleFavorite?: (fav: Favorite) => void
  isFavorite?: (id: string) => boolean
  favorites?: Favorite[]
  onAddToLibrary?: (post: R34Post) => void
  isInLibrary?: (postId: number) => boolean
  onRemoveFromLibrary?: (postId: number) => void
  onSearch?: (query: string) => void
}) {
  const [searchSort, setSearchSort] = useState<SearchSort>('latest')
  const sortTag = SEARCH_SORTS.find(s => s.key === searchSort)?.tag ?? ''
  const apiQuery = sortTag ? `${query} ${sortTag}` : query
  const limit = videoOnly ? 1000 : 100
  const { posts, loading, error, page, totalCount, totalPages, goToPage } = usePosts(apiQuery, limit)
  const filtered = useMemo(() => filterVideos(posts, videoOnly), [posts, videoOnly])
  const { sorted: sortedFiltered, loading: sizeLoading } = useFileSizeSort(filtered, searchSort === 'longest')
  const displayed = searchSort === 'longest' ? sortedFiltered : filtered

  const [fallbackShown, setFallbackShown] = useState(false)
  const fallbackRef = useRef(false)

  useEffect(() => {
    fallbackRef.current = false
    setFallbackShown(false)
  }, [query])

  useEffect(() => {
    if (!loading && !error && displayed.length === 0 && query.includes('_') && !fallbackRef.current && onSearch) {
      fallbackRef.current = true
      const words = query.split('_').filter(Boolean)
      if (words.length > 1) {
        setFallbackShown(true)
        onSearch(words.join(' '))
      }
    }
  }, [loading, error, displayed.length, query, onSearch])

  const searchFavId = `search-${query}`
  const isSearchFavorited = isFavorite ? isFavorite(searchFavId) : false

  const handleFavSearch = useCallback(() => {
    if (onToggleFavorite) {
      onToggleFavorite({
        id: searchFavId,
        name: query,
        type: 'tag',
        value: query,
      })
    }
  }, [onToggleFavorite, searchFavId, query])

  if (loading) return <div style={styles.loading}>Loading...</div>
  if (error) return <div style={styles.error}>Error: {error}</div>

  return (
    <div style={styles.searchResults}>
      {videoOnly && <div style={styles.filterNotice}>🎬 Videos only — showing {displayed.length} of {totalCount.toLocaleString()} total results</div>}
      {fallbackShown && (
        <div style={{ ...styles.filterNotice, color: THEME.accent, fontSize: '13px', padding: '8px 24px' }}>
          No results for "{query}" — splitting into individual tags
        </div>
      )}
      <div style={styles.searchMeta}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={styles.searchTitle}>
            "{query}" — {displayed.length} results{sizeLoading ? ' (sorting by size...)' : ''}
          </h2>
          {onToggleFavorite && (
            <button
              onClick={handleFavSearch}
              style={{
                background: 'none',
                border: 'none',
                color: isSearchFavorited ? THEME.gold : THEME.textSecondary,
                cursor: 'pointer',
                fontSize: '16px',
                padding: '0 4px',
              }}
              title={isSearchFavorited ? 'Remove from favorites' : 'Add search to favorites'}
            >
              {isSearchFavorited ? '★' : '☆'}
            </button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={styles.sortToggle}>
            {SEARCH_SORTS.map(s => (
              <button
                key={s.key}
                onClick={() => setSearchSort(s.key)}
                style={sortBtnStyle(searchSort === s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={goToPage}
          />
        </div>
      </div>
      <div style={styles.grid}>
        {displayed.map((post, idx) => (
          <MediaCard
            key={post.id}
            post={post}
            onPlay={onStartPlaylist ? () => onStartPlaylist(displayed, idx) : onPlay}
            onAddToLibrary={onAddToLibrary}
            inLibrary={isInLibrary ? isInLibrary(post.id) : false}
            onRemoveFromLibrary={onRemoveFromLibrary}
          />
        ))}
        {displayed.length === 0 && !fallbackShown && <div style={styles.error}>No posts found</div>}
      </div>
      {displayed.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={goToPage}
        />
      )}
    </div>
  )
}

const FEED_SORTS = [
  { key: 'latest', label: 'Latest', tags: '' },
  { key: 'popular', label: 'Popular', tags: 'sort:score' },
  { key: 'longest', label: 'Longest', tags: '' },
] as const

type FeedSort = (typeof FEED_SORTS)[number]['key']

function CategoriesView({
  onPlay,
  videoOnly,
  favorites,
  onToggleFavorite,
  isFavorite,
  onRemoveFavorite,
  onSearch,
  onAddToLibrary,
  isInLibrary,
  onRemoveFromLibrary,
}: {
  onPlay: (post: R34Post) => void
  videoOnly: boolean
  favorites: Favorite[]
  onToggleFavorite: (fav: Favorite) => void
  isFavorite: (id: string) => boolean
  onRemoveFavorite: (id: string) => void
  onSearch: (query: string) => void
  onAddToLibrary?: (post: R34Post) => void
  isInLibrary?: (postId: number) => boolean
  onRemoveFromLibrary?: (postId: number) => void
}) {
  const [feedSort, setFeedSort] = useState<FeedSort>('latest')
  const feedTags = FEED_SORTS.find(s => s.key === feedSort)?.tags ?? ''
  const feedLimit = videoOnly ? 1000 : 100
  const feed = usePosts(feedTags, feedLimit)
  const trending = usePosts('score:>100', 20)

  const heroPost = useMemo(() => {
    const candidates = trending.posts.filter(p => p.type === 'image')
    if (candidates.length > 0) return candidates[Math.floor(Math.random() * Math.min(5, candidates.length))]
    if (trending.posts.length > 0) return trending.posts[0]
    return null
  }, [trending.posts])

  const filteredFeed = useMemo(() => filterVideos(feed.posts, videoOnly), [feed.posts, videoOnly])
  const { sorted: sortedFeed, loading: feedSizeLoading } = useFileSizeSort(filteredFeed, feedSort === 'longest')
  const displayedFeed = feedSort === 'longest' ? sortedFeed : filteredFeed

  const handleGenreClick = useCallback((genre: Genre) => {
    onSearch(genre.tags)
  }, [onSearch])

  const handleGenreToggle = useCallback((genre: Genre) => {
    onToggleFavorite({
      id: `genre-${genre.name}`,
      name: genre.name,
      type: 'genre',
      value: genre.tags,
    })
  }, [onToggleFavorite])

  const handleFavSelect = useCallback((value: string, name?: string) => {
    onSearch(value)
  }, [onSearch])

  const genreThumbnails = useGenreThumbnails()

  return (
    <div>
      {videoOnly && <div style={styles.filterNotice}>🎬 Videos only filter active</div>}

      <FavoritesSection
        favorites={favorites}
        onRemove={onRemoveFavorite}
        onSelect={handleFavSelect}
      />

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Genres</h2>
        <div style={styles.genreRow}>
          {GENRES.map(genre => (
            <GenreCard
              key={genre.name}
              genre={genre}
              thumbnailUrl={genreThumbnails[genre.name]}
              isFavorite={isFavorite(`genre-${genre.name}`)}
              onToggleFavorite={handleGenreToggle}
              onClick={handleGenreClick}
            />
          ))}
        </div>
      </div>

      {heroPost && <Hero post={heroPost} onPlay={onPlay} />}

      <div style={styles.feed}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <h2 style={styles.feedTitle}>Feed</h2>
          <div style={styles.sortToggle}>
            {FEED_SORTS.map(s => (
              <button
                key={s.key}
                onClick={() => setFeedSort(s.key)}
                style={sortBtnStyle(feedSort === s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        {feed.loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : (
          <div style={styles.grid}>
            {displayedFeed.map(post => (
              <MediaCard
                key={post.id}
                post={post}
                onPlay={onPlay}
                onAddToLibrary={onAddToLibrary}
                inLibrary={isInLibrary ? isInLibrary(post.id) : false}
                onRemoveFromLibrary={onRemoveFromLibrary}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function BrowsePage(props: BrowsePageProps) {
  const { onPlay, onStartPlaylist, searchQuery, videoOnly, favorites, onToggleFavorite, isFavorite, onRemoveFavorite, onSearch, onAddToLibrary, isInLibrary, onRemoveFromLibrary } = props

  if (searchQuery.trim()) {
    return (
      <SearchResults
        query={searchQuery.trim()}
        onPlay={onPlay}
        onStartPlaylist={onStartPlaylist}
        videoOnly={videoOnly}
        onToggleFavorite={onToggleFavorite}
        isFavorite={isFavorite}
        favorites={favorites}
        onAddToLibrary={onAddToLibrary}
        isInLibrary={isInLibrary}
        onRemoveFromLibrary={onRemoveFromLibrary}
        onSearch={onSearch}
      />
    )
  }
  return (
    <CategoriesView
      onPlay={onPlay}
      videoOnly={videoOnly}
      favorites={favorites}
      onToggleFavorite={onToggleFavorite}
      isFavorite={isFavorite}
      onRemoveFavorite={onRemoveFavorite}
      onSearch={onSearch}
      onAddToLibrary={onAddToLibrary}
      isInLibrary={isInLibrary}
      onRemoveFromLibrary={onRemoveFromLibrary}
    />
  )
}
