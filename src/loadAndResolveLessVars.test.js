import { resolve } from 'path'
import { ensureFileSync } from 'fs-extra'
import { writeFileSync, existsSync } from 'fs'

import { loadAndResolveLessVars } from './loadAndResolveLessVars'

const dummyExternalDependencyPath = resolve('./node_modules/dummy/variables.less')

describe('loadAndResolveLessVars', () => {
  beforeAll(() => {
    if (!existsSync(dummyExternalDependencyPath)) {
      ensureFileSync(dummyExternalDependencyPath)
      writeFileSync(dummyExternalDependencyPath, '@base-color: green;', { encoding: 'utf8' })
    }
  })

  it('loads Less files, resolves imports, and resolves and collects variables', async () => {
    const output = await loadAndResolveLessVars('test/variables.less')
    expect(output).toEqual({
      baseColor: 'green',
      primaryColor: 'indigo',
      secondaryColor: 'indigo'
    })
  })
})
