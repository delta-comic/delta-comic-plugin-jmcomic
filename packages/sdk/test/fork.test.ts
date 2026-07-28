import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { describe, expect, test } from 'vitest'

import { JMComic } from '../src'

describe('fork discovery payload', () => {
  test('decrypts the captured production discovery payload', async () => {
    const encrypted = await readFile(join(import.meta.dirname, 'mock/api/fork.txt'), 'utf8')
    const forks = new JMComic().fork.decryptResponse(encrypted)
    expect(forks.Setting.length).toBeGreaterThan(0)
    expect(forks.Server.length).toBeGreaterThan(0)
    expect(forks.jm3_Server.every(entry => entry.length === 2)).toBe(true)
  })

  test('rejects corrupted discovery payloads with a public error', () => {
    expect(() => new JMComic().fork.decryptResponse('not-base64')).toThrow(
      expect.objectContaining({ code: 'DECRYPTION_FAILED' }),
    )
  })
})