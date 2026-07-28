import { describe, expect, test } from 'vitest'

import {
  sBookAuthor,
  sCategoriesResult,
  sComment,
  sGender,
  sMutationResult,
  sNumeric,
} from '../src'

const expinfo = {
  level_name: 'reader',
  level: '1',
  exp: 2,
  nextLevelExp: '3',
  expPercent: 4,
  uid: '5',
  badges: [],
}

describe('generated model schemas', () => {
  test('keeps custom primitive validation and normalization', () => {
    expect(sNumeric.safeParse('123').success).toBe(true)
    expect(sNumeric.safeParse('not-a-number').success).toBe(false)
    expect(sGender.parse('')).toBeNull()
    expect(sGender.parse('null')).toBeNull()
  })

  test('keeps defaults and input-to-output transforms', () => {
    const author = sBookAuthor.parse({
      author_name: 'author',
      author_avatar: 'avatar.jpg',
      background_image: 'background.jpg',
      sponsor: [],
      related_works: [],
      filters: { language: [], source: [] },
    })
    expect(author).toMatchObject({ author_id: '', work_date: '', work_title: '' })

    const categories = sCategoriesResult.parse({
      categories: [
        {
          id: 1,
          name: 'name',
          slug: 'slug',
          total_albums: '2',
          sub_categories: [{ CID: 3, name: 'sub', slug: 'sub' }],
        },
      ],
      blocks: [],
    })
    expect(categories.categories[0]).toEqual({
      id: '1',
      name: 'name',
      slug: 'slug',
      total_albums: '2',
      type: '',
      sub_categories: [{ id: '3', name: 'sub', slug: 'sub' }],
    })
  })

  test('validates recursive comments and loose mutation responses', () => {
    const baseComment = {
      CID: '1',
      UID: '2',
      username: 'user',
      nickname: 'nickname',
      likes: '0',
      gender: 'Male',
      update_at: '0',
      addtime: 'today',
      parent_CID: '0',
      expinfo,
      content: '<div>comment</div>',
      photo: 'avatar.jpg',
      spoiler: '1',
    }
    expect(
      sComment.parse({ ...baseComment, replys: [{ ...baseComment, CID: '2' }] }).replys,
    ).toHaveLength(1)
    expect(sMutationResult.parse({ status: 'ok', server_extension: true })).toEqual({
      status: 'ok',
      server_extension: true,
    })
  })
})