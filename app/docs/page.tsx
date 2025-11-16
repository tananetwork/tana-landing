import { DocsHomeClient } from './DocsHomeClient'
import { generateSidebar } from '@/lib/docs'

export default function DocsHome() {
  const sections = generateSidebar()

  return <DocsHomeClient sections={sections} />
}
