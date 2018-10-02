import { resolve } from 'path'
import { ensureFileSync, removeSync } from 'fs-extra'
import { writeFileSync, existsSync } from 'fs'

import { loadLessWithImports, loadAndResolveLessVars } from './loadAndResolveLessVars'

const dummyExternalDependencyFolder = resolve('./node_modules/dummy')
const dummyExternalDependencyPath = resolve(dummyExternalDependencyFolder, 'variables.less')

beforeAll(() => {
  if (!existsSync(dummyExternalDependencyPath)) {
    ensureFileSync(dummyExternalDependencyPath)
    writeFileSync(dummyExternalDependencyPath, '@base-color: #00ff00;\n@light-color: lighten(@base-color, 10);', {
      encoding: 'utf8'
    })
  }
})

afterAll(() => {
  if (existsSync(dummyExternalDependencyFolder)) {
    removeSync(dummyExternalDependencyFolder)
  }
})

describe('loadLessWithImports', () => {
  it('loads Less files, resolving all imports (transitively)', () => {
    expect(loadLessWithImports('test/variables.less')).toMatchSnapshot()
  })
})

describe('loadAndResolveLessVars', () => {
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
