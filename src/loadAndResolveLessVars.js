import less from 'less'
import { resolve, dirname } from 'path'
import { readFileSync } from 'fs'
import { getRegexpMatches } from '@hon2a/get-regexp-matches'
import camelCase from 'lodash.camelcase'

const varNameRegExp = /@([\w-]+):/g
const importRegExp = /@import ['"]([^'"]+)['"];/g
const cssVarRegExp = /--([^:]+): ([^;]*);/g

const root = resolve('./')

function loadLessWithImports(entry) {
  const entryPath = resolve('./', entry)
  const input = readFileSync(entryPath, 'utf8')
  const imports = getRegexpMatches(importRegExp, input).map(match => {
    const importPath = match[1]
    const fullImportPath = /\.less$/.test(importPath) ? importPath : `${importPath}.less`
    const resolvedImportPath = /^~/.test(importPath)
      ? resolve(root, 'node_modules', fullImportPath.slice(1))
      : resolve(dirname(entryPath), fullImportPath)
    return {
      match,
      resolved: loadLessWithImports(resolvedImportPath)
    }
  })
  imports.reverse()
  return imports.reduce(
    (acc, { match, resolved }) => acc.substring(0, match.index) + resolved + acc.substring(match[0].length),
    input
  )
}

async function resolveLessVariables(input) {
  const varNames = getRegexpMatches(varNameRegExp, input).map(([, varName]) => varName)
  const { css } = await less.render(
    `${input} #resolved {\n${varNames.map(varName => `--${varName}: @${varName};`).join('\n')}\n}`
  )
  return getRegexpMatches(cssVarRegExp, css.replace(/#resolved {(.*)}/, '$1')).reduce(
    (acc, [, varName, value]) => ({ ...acc, [camelCase(varName)]: value }),
    {}
  )
}

export async function loadAndResolveLessVars(entry) {
  const input = loadLessWithImports(entry)
  return await resolveLessVariables(input)
}
