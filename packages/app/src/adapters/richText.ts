export type RichTextBlock =
  | { type: 'text' | 'quote' | 'code'; text: string }
  | { type: 'heading'; text: string; level: 1 | 2 | 3 }
  | { type: 'image'; src: string; alt: string }
  | { type: 'link'; text: string; href: string }

const safeUrl = (value: string, image = false) => {
  try {
    const url = new URL(value, globalThis.location?.origin ?? 'https://localhost')
    if (!['http:', 'https:'].includes(url.protocol)) return undefined
    if (!globalThis.location && url.origin === 'https://localhost') return image ? value : undefined
    return value
  } catch {
    return undefined
  }
}

const fallbackText = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export function parseRichText(html: string): RichTextBlock[] {
  if (typeof DOMParser === 'undefined') {
    const text = fallbackText(html)
    return text ? [{ type: 'text', text }] : []
  }

  const document = new DOMParser().parseFromString(html, 'text/html')
  document.querySelectorAll('script,style,iframe,object,embed,form').forEach(node => node.remove())
  const blocks: RichTextBlock[] = []

  const append = (element: Element) => {
    const text = element.textContent?.replace(/\s+/g, ' ').trim() ?? ''
    const tag = element.tagName.toLowerCase()
    if (tag === 'img') {
      const src = safeUrl(element.getAttribute('src') ?? '', true)
      if (src) blocks.push({ type: 'image', src, alt: element.getAttribute('alt') ?? '' })
      return
    }
    if (tag === 'a') {
      const href = safeUrl(element.getAttribute('href') ?? '')
      if (href && text) blocks.push({ type: 'link', href, text })
      return
    }
    if (!text) return
    if (/^h[1-3]$/.test(tag)) {
      blocks.push({ type: 'heading', text, level: Number(tag[1]) as 1 | 2 | 3 })
      return
    }
    if (tag === 'blockquote') {
      blocks.push({ type: 'quote', text })
      return
    }
    if (tag === 'pre' || tag === 'code') {
      blocks.push({ type: 'code', text })
      return
    }
    blocks.push({ type: 'text', text })
  }

  for (const child of document.body.children) {
    if (['div', 'section', 'article'].includes(child.tagName.toLowerCase())) {
      const nested = child.querySelectorAll('h1,h2,h3,p,blockquote,pre,img,a')
      if (nested.length > 0) nested.forEach(append)
      else append(child)
    } else append(child)
  }
  return blocks
}

export const richTextToPlainText = (html: string) =>
  parseRichText(html)
    .filter((block): block is Exclude<RichTextBlock, { type: 'image' }> => block.type !== 'image')
    .map(block => block.text)
    .join('\n')