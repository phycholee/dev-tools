import { inject } from 'vue'

/**
 * 共享剪贴板复制 composable
 *
 * 优先使用 navigator.clipboard API，失败时回退到 document.execCommand。
 * 复制成功后自动显示 toast 提示。
 */
export function useClipboard() {
  const toast = inject<(msg: string) => void>('toast')

  async function copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text)
      toast?.('已复制到剪贴板')
      return true
    } catch {
      // Fallback for insecure contexts
      try {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        toast?.('已复制到剪贴板')
        return true
      } catch {
        toast?.('复制失败')
        return false
      }
    }
  }

  return { copyToClipboard }
}
