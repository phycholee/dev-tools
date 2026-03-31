export interface RegexTemplate {
  name: string
  pattern: string
  flags: string
  description: string
  example: string
}

export const REGEX_TEMPLATES: RegexTemplate[] = [
  {
    name: '邮箱地址',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: 'g',
    description: '匹配标准邮箱地址格式',
    example: 'test@example.com user.name+tag@domain.co.uk'
  },
  {
    name: '手机号 (中国)',
    pattern: '1[3-9]\\d{9}',
    flags: 'g',
    description: '匹配中国大陆11位手机号',
    example: '13812345678 15900001111'
  },
  {
    name: 'URL',
    pattern: 'https?://[^\\s]+',
    flags: 'g',
    description: '匹配HTTP/HTTPS链接',
    example: 'https://example.com/path?q=1 http://localhost:3000'
  },
  {
    name: 'IP地址 (IPv4)',
    pattern: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}',
    flags: 'g',
    description: '匹配IPv4地址',
    example: '192.168.1.1 10.0.0.1 255.255.255.0'
  },
  {
    name: '日期 (YYYY-MM-DD)',
    pattern: '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])',
    flags: 'g',
    description: '匹配日期格式 YYYY-MM-DD',
    example: '2026-03-31 2025-12-01'
  },
  {
    name: '中文字符',
    pattern: '[\\u4e00-\\u9fa5]+',
    flags: 'g',
    description: '匹配中文字符',
    example: '你好世界 这是测试文本'
  },
  {
    name: 'HTML标签',
    pattern: '<([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*>(.*?)</\\1>',
    flags: 'g',
    description: '匹配成对的HTML标签',
    example: '<div>内容</div> <span class="test">文本</span>'
  },
  {
    name: '十六进制颜色',
    pattern: '#[0-9a-fA-F]{6}\\b',
    flags: 'g',
    description: '匹配6位十六进制颜色代码',
    example: '#ff5733 #00ff00 #8b5cf6'
  }
]
