import { describe, it, expect } from 'vitest'
import { parseJsonTree } from '../../../src/tools/json-formatter/json'

describe('parseJsonTree', () => {
  describe('invalid input', () => {
    it('returns null for invalid JSON', () => {
      expect(parseJsonTree('{invalid}')).toBeNull()
    })

    it('returns null for empty string', () => {
      expect(parseJsonTree('')).toBeNull()
    })
  })

  describe('simple object', () => {
    it('parses root object with one property', () => {
      const result = parseJsonTree('{"a":1}')
      expect(result).not.toBeNull()
      expect(result!.type).toBe('object')
      expect(result!.startLine).toBe(1)
      expect(result!.endLine).toBe(3) // { + "a": 1 + }
      expect(result!.children).toHaveLength(1)
      expect(result!.children![0]).toMatchObject({
        type: 'number',
        key: 'a',
        value: 1,
        startLine: 2,
        endLine: 2,
      })
    })

    it('parses object with multiple properties', () => {
      const result = parseJsonTree('{"name":"Alice","age":30}')
      expect(result).not.toBeNull()
      expect(result!.children).toHaveLength(2)
      expect(result!.children![0]).toMatchObject({
        type: 'string',
        key: 'name',
        value: 'Alice',
      })
      expect(result!.children![1]).toMatchObject({
        type: 'number',
        key: 'age',
        value: 30,
      })
    })

    it('handles all primitive types', () => {
      const result = parseJsonTree('{"s":"hello","n":42,"b":true,"z":null}')
      expect(result!.children).toHaveLength(4)
      expect(result!.children![0].type).toBe('string')
      expect(result!.children![1].type).toBe('number')
      expect(result!.children![2].type).toBe('boolean')
      expect(result!.children![3].type).toBe('null')
    })
  })

  describe('simple array', () => {
    it('parses root array', () => {
      const result = parseJsonTree('[1,2,3]')
      expect(result).not.toBeNull()
      expect(result!.type).toBe('array')
      expect(result!.children).toHaveLength(3)
      expect(result!.children![0]).toMatchObject({ type: 'number', value: 1, startLine: 2 })
      expect(result!.children![1]).toMatchObject({ type: 'number', value: 2, startLine: 3 })
      expect(result!.children![2]).toMatchObject({ type: 'number', value: 3, startLine: 4 })
      expect(result!.endLine).toBe(5) // [ + 3 items + ]
    })

    it('handles empty array', () => {
      const result = parseJsonTree('[]')
      expect(result).not.toBeNull()
      expect(result!.type).toBe('array')
      expect(result!.children).toHaveLength(0)
      expect(result!.startLine).toBe(1)
      expect(result!.endLine).toBe(1) // single line []
    })

    it('handles empty object', () => {
      const result = parseJsonTree('{}')
      expect(result).not.toBeNull()
      expect(result!.type).toBe('object')
      expect(result!.children).toHaveLength(0)
      expect(result!.startLine).toBe(1)
      expect(result!.endLine).toBe(1) // single line {}
    })
  })

  describe('nested structures', () => {
    it('parses nested object', () => {
      const result = parseJsonTree('{"user":{"name":"Alice"}}')
      expect(result).not.toBeNull()
      expect(result!.children).toHaveLength(1)
      const userNode = result!.children![0]
      expect(userNode.type).toBe('object')
      expect(userNode.key).toBe('user')
      expect(userNode.children).toHaveLength(1)
      expect(userNode.children![0]).toMatchObject({
        type: 'string',
        key: 'name',
        value: 'Alice',
      })
    })

    it('parses object with array property', () => {
      const result = parseJsonTree('{"scores":[95,87]}')
      expect(result).not.toBeNull()
      const scoresNode = result!.children![0]
      expect(scoresNode.type).toBe('array')
      expect(scoresNode.key).toBe('scores')
      expect(scoresNode.children).toHaveLength(2)
      expect(scoresNode.children![0].value).toBe(95)
      expect(scoresNode.children![1].value).toBe(87)
    })

    it('calculates line numbers for nested structures', () => {
      // Formatted:
      // 1 {
      // 2   "a": {
      // 3     "b": 1
      // 4   }
      // 5 }
      const result = parseJsonTree('{"a":{"b":1}}')
      expect(result!.startLine).toBe(1)
      expect(result!.endLine).toBe(5)
      const aNode = result!.children![0]
      expect(aNode.startLine).toBe(2)
      expect(aNode.endLine).toBe(4)
      expect(aNode.children![0].startLine).toBe(3)
    })

    it('handles array of objects', () => {
      const result = parseJsonTree('[{"id":1},{"id":2}]')
      expect(result!.type).toBe('array')
      expect(result!.children).toHaveLength(2)
      expect(result!.children![0].type).toBe('object')
      expect(result!.children![0].children![0].value).toBe(1)
      expect(result!.children![1].type).toBe('object')
      expect(result!.children![1].children![0].value).toBe(2)
    })
  })

  describe('line number calculation', () => {
    it('counts lines correctly for complex nested JSON', () => {
      // 1 {
      // 2   "name": "Alice",
      // 3   "scores": [
      // 4     95,
      // 5     87
      // 6   ],
      // 7   "address": {
      // 8     "city": "Shanghai"
      // 9   }
      // 10 }
      const result = parseJsonTree('{"name":"Alice","scores":[95,87],"address":{"city":"Shanghai"}}')
      expect(result!.startLine).toBe(1)
      expect(result!.endLine).toBe(10)
      expect(result!.children![0].startLine).toBe(2)   // name
      expect(result!.children![1].startLine).toBe(3)   // scores [
      expect(result!.children![1].endLine).toBe(6)     // ]
      expect(result!.children![2].startLine).toBe(7)   // address {
      expect(result!.children![2].endLine).toBe(9)     // }
    })
  })
})
