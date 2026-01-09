import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from '../lib/auth/validation'

describe('Authentication Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validData)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: ''
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('registerSchema', () => {
    it('should validate valid register data', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        confirm: 'password123'
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validData)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'password123',
        confirm: 'password123'
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject short password', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: '123',
        confirm: '123'
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject mismatched passwords', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        confirm: 'different123'
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('forgotPasswordSchema', () => {
    it('should validate valid email', () => {
      const validData = {
        email: 'test@example.com'
      }

      const result = forgotPasswordSchema.safeParse(validData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validData)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email'
      }

      const result = forgotPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('resetPasswordSchema', () => {
    it('should validate valid reset data', () => {
      const validData = {
        password: 'newpassword123',
        confirm: 'newpassword123'
      }

      const result = resetPasswordSchema.safeParse(validData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validData)
    })

    it('should reject short password', () => {
      const invalidData = {
        password: '123',
        confirm: '123'
      }

      const result = resetPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject mismatched passwords', () => {
      const invalidData = {
        password: 'password123',
        confirm: 'different123'
      }

      const result = resetPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})