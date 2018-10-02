import { resolve } from 'path'
import { ensureFileSync } from 'fs-extra'
import { writeFileSync, existsSync } from 'fs'

import { loadAndResolveLessVars } from './loadAndResolveLessVars'

const dummyExternalDependencyPath = resolve('./node_modules/dummy/variables.less')

describe('loadAndResolveLessVars', () => {
  beforeAll(() => {
    if (!existsSync(dummyExternalDependencyPath)) {
      ensureFileSync(dummyExternalDependencyPath)
      writeFileSync(dummyExternalDependencyPath, '@base-color: #00ff00;\n@light-color: lighten(@base-color, 10);', {
        encoding: 'utf8'
      })
    }
  })

  it('loads Less files, resolves imports, and resolves and collects variables', async () => {
    const output = await loadAndResolveLessVars('test/variables.less')
    expect(output).toEqual({
      baseColor: '#00ff00', // from dummy lib (transitive external import)
      lightColor: '#4dff4d', // original from from dummy lib overwritten locally, computed from imported variable
      primaryColor: 'indigo', // from local import
      darkColor: '#00cc00', // from local import, computed from transitively imported variable
      secondaryColor: 'indigo', // from entry point, simple assignment from imported variable
      errorColor: 'darkred' // from entry point
    })
  })
})
