/** @type {import('ts-to-zod').TsToZodConfig} */
export default ['utils', 'user', 'comment', 'comic', 'blog', 'book', 'novel', 'promote'].map(
  name => ({
    name,
    input: `src/model/${name}.ts`,
    output: `src/model/generated/${name}.ts`,
    getSchemaName: identifier => `s${identifier}`,
    jsDocTagFilter: tags => tags.some(tag => tag.name === 'zod'),
  }),
)