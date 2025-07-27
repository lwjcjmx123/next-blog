import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  if (!date) return '未知日期'
  
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) {
    return '未知日期'
  }
  
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj)
}

export function formatDateShort(date: string | Date) {
  if (!date) return '未知日期'
  
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) {
    return '未知日期'
  }
  
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj)
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, length: number) {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function readingTime(content: string) {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  const time = Math.ceil(words / wordsPerMinute)
  return `${time} 分钟阅读`
}