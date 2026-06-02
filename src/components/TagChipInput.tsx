import React, { useState, useCallback, useRef, useEffect } from 'react'
import { THEME } from '../styles/theme'
import { TagSuggestion } from '../types'
import { fetchTagSuggestions } from '../api/r34Client'

const styles: Record<string, React.CSSProperties> = {
  outer: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    position: 'relative' as const,
  },
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(0,0,0,0.7)',
    border: `1px solid ${THEME.border}`,
    borderRadius: THEME.radius,
    padding: '4px 8px',
    gap: '4px',
    flexWrap: 'wrap' as const,
    minHeight: '34px',
    cursor: 'text',
    transition: `border-color ${THEME.transition}`,
    minWidth: '280px',
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    background: THEME.accent,
    color: THEME.text,
    fontSize: '12px',
    fontWeight: 600,
    padding: '2px 6px 2px 10px',
    borderRadius: '12px',
    whiteSpace: 'nowrap',
  },
  chipRemove: {
    background: 'none',
    border: 'none',
    color: THEME.text,
    cursor: 'pointer',
    fontSize: '14px',
    lineHeight: 1,
    padding: '0 2px',
    opacity: 0.8,
  },
  input: {
    flex: 1,
    background: 'none',
    border: 'none',
    color: THEME.text,
    fontSize: '13px',
    outline: 'none',
    minWidth: '80px',
    padding: '4px 2px',
    fontFamily: 'inherit',
  },
  searchBtn: {
    background: THEME.accent,
    color: THEME.text,
    border: 'none',
    borderRadius: THEME.radius,
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    flexShrink: 0,
  },
  dropdown: {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    background: THEME.bgSecondary,
    border: `1px solid ${THEME.border}`,
    borderTop: 'none',
    borderRadius: `0 0 ${THEME.radius} ${THEME.radius}`,
    maxHeight: '300px',
    overflowY: 'auto' as const,
    zIndex: 9999,
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  },
  suggestion: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '13px',
    color: THEME.text,
    transition: `background ${THEME.transition}`,
  },
  suggestionCount: {
    fontSize: '11px',
    color: THEME.textSecondary,
    background: THEME.bgCard,
    padding: '1px 6px',
    borderRadius: '8px',
  },
  recentHeader: {
    padding: '6px 12px 4px',
    fontSize: '10px',
    fontWeight: 600,
    color: THEME.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: `1px solid ${THEME.border}`,
  },
  clearRecent: {
    float: 'right' as const,
    background: 'none',
    border: 'none',
    color: THEME.accent,
    cursor: 'pointer',
    fontSize: '10px',
    fontFamily: 'inherit',
  },
}

interface TagChipInputProps {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  onSearch: (query: string) => void
  placeholder?: string
  recentTags?: { tag: string; lastUsed: number }[]
  onAddRecent?: (tag: string) => void
  onClearRecent?: () => void
}

export default function TagChipInput({ tags, onTagsChange, onSearch, placeholder = 'Search tags...', recentTags, onAddRecent, onClearRecent }: TagChipInputProps) {
  const [inputVal, setInputVal] = useState('')
  const [focused, setFocused] = useState(false)
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1)
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const suggestTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (inputVal.trim().length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }
    clearTimeout(suggestTimer.current)
    suggestTimer.current = setTimeout(async () => {
      const results = await fetchTagSuggestions(inputVal.trim())
      setSuggestions(results)
      setShowDropdown(results.length > 0)
      setSelectedSuggestion(-1)
    }, 200)
    return () => clearTimeout(suggestTimer.current)
  }, [inputVal])

  const addTags = useCallback((input: string) => {
    const words = input.trim().split(/\s+/).filter(Boolean)
    if (words.length === 0) return
    const newTags = words.filter(w => !tags.includes(w))
    if (newTags.length > 0) {
      onTagsChange([...tags, ...newTags])
    }
    setInputVal('')
    setShowDropdown(false)
    setSuggestions([])
    newTags.forEach(t => onAddRecent?.(t))
  }, [tags, onTagsChange, onAddRecent])

  const addTag = useCallback((tag: string) => {
    addTags(tag)
  }, [addTags])

  const removeTag = useCallback((index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index))
  }, [tags, onTagsChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedSuggestion(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedSuggestion(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Tab' || e.key === ' ') {
      e.preventDefault()
      if (selectedSuggestion >= 0 && suggestions[selectedSuggestion]) {
        addTag(suggestions[selectedSuggestion].value)
      } else if (inputVal.trim()) {
        addTag(inputVal)
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedSuggestion >= 0 && suggestions[selectedSuggestion]) {
        const value = suggestions[selectedSuggestion].value
        addTag(value)
        onSearch([...tags, value].join(' '))
      } else if (inputVal.trim()) {
        addTag(inputVal)
        const words = inputVal.trim().split(/\s+/).filter(Boolean)
        onSearch([...tags, ...words].join(' '))
      } else if (tags.length > 0) {
        onSearch(tags.join(' '))
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    } else if (e.key === 'Backspace' && !inputVal && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }, [inputVal, tags, suggestions, selectedSuggestion, addTag, removeTag, onSearch])

  const handleWrapperClick = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  const selectRecent = useCallback((tag: string) => {
    addTag(tag)
  }, [addTag])

  return (
    <div style={styles.outer}>
      <div
        ref={wrapperRef}
        style={{
          ...styles.wrapper,
          borderColor: focused ? THEME.accent : THEME.border,
          borderRadius: showDropdown ? `${THEME.radius} ${THEME.radius} 0 0` : THEME.radius,
        }}
        onClick={handleWrapperClick}
      >
        {tags.map((tag, i) => (
          <span key={i} style={styles.chip}>
            {tag}
            <button style={styles.chipRemove} onClick={(e) => { e.stopPropagation(); removeTag(i) }}>×</button>
          </span>
        ))}
        <input
          ref={inputRef}
          style={styles.input}
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          placeholder={tags.length === 0 ? placeholder : ''}
        />
      </div>
      {(tags.length > 0 || inputVal.trim()) && (
        <button style={styles.searchBtn} onClick={() => {
          if (inputVal.trim()) {
            addTag(inputVal)
            const words = inputVal.trim().split(/\s+/).filter(Boolean)
            onSearch([...tags, ...words].join(' '))
          } else {
            onSearch(tags.join(' '))
          }
        }}>
          Search
        </button>
      )}

      {showDropdown && suggestions.length > 0 && (
        <div style={styles.dropdown}>
          {suggestions.map((s, i) => (
            <div
              key={s.value}
              style={{
                ...styles.suggestion,
                background: i === selectedSuggestion ? THEME.bgHover : 'transparent',
              }}
              onMouseDown={() => addTag(s.value)}
              onMouseEnter={() => setSelectedSuggestion(i)}
            >
              <span>{s.value}</span>
              <span style={styles.suggestionCount}>{s.count?.toLocaleString() || '?'}</span>
            </div>
          ))}
        </div>
      )}

      {focused && !showDropdown && inputVal.length < 2 && recentTags && recentTags.length > 0 && (
        <div style={styles.dropdown}>
          <div style={styles.recentHeader}>
            Recent Tags
            {onClearRecent && <button style={styles.clearRecent} onMouseDown={onClearRecent}>Clear</button>}
          </div>
          {recentTags.map(r => (
            <div
              key={r.tag}
              style={styles.suggestion}
              onMouseDown={() => selectRecent(r.tag)}
            >
              <span>{r.tag}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
