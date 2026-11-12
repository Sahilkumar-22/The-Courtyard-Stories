import { useEffect } from 'react'
import { BRAND } from '@/data/studioContent'

const DEFAULT_TITLE = `${BRAND.name} — One Studio. Endless Worlds to Create In.`

/** Sets the document title for a page and restores the default when it unmounts. */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${BRAND.name}` : DEFAULT_TITLE
    return () => {
      document.title = DEFAULT_TITLE
    }
  }, [title])
}
