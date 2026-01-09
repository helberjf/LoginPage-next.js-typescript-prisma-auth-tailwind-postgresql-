import { describe, it, expect } from 'vitest'
import { cn } from '../lib/utils/cn'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('class1', 'class2', 'class3')
    expect(result).toBe('class1 class2 class3')
  })

  it('should filter out falsy values', () => {
    const result = cn('class1', false, null, undefined, 'class2')
    expect(result).toBe('class1 class2')
  })

  it('should handle empty inputs', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should handle single class', () => {
    const result = cn('single-class')
    expect(result).toBe('single-class')
  })

  it('should handle mixed types', () => {
    const result = cn('class1', false && 'class2', true && 'class3', null)
    expect(result).toBe('class1 class3')
  })
})