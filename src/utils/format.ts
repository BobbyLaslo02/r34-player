export function formatTags(tags: string[]): string {
  return tags.slice(0, 10).join(', ')
}

export function getPostUrl(post: { file_url: string; sample_url: string; preview_url: string }, quality: 'preview' | 'sample' | 'full'): string {
  switch (quality) {
    case 'preview': return post.preview_url
    case 'sample': return post.sample_url
    case 'full': return post.file_url
  }
}

export function getImageSize(width: number, height: number, maxWidth: number, maxHeight: number) {
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1)
  return { width: Math.floor(width * ratio), height: Math.floor(height * ratio) }
}
