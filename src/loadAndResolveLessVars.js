import less from 'less'
import { resolve, dirname } from 'path'
import { readFileSync } from 'fs'
import { getRegexpMatches } from '@hon2a/get-regexp-matches'
import camelCase from 'lodash.camelcase'

const root = resolve('./')

function replaceSubstring(string, start, end, replacement) {
  return string.substring(0, start) + replacement + string.substring(end)
}

const importRegExp = /^@import\s+['"]([^'"]+)['"];$/gm
export function loadLessWithImports(entry) {
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
  return imports.reduceRight(
    (acc, { match, resolved }) => replaceSubstring(acc, match.index, match.index + match[0].length, resolved),
    input
  )
}

const varNameRegExp = /@([\w-]+):/g
function findLessVariables(lessCode) {
  return getRegexpMatches(varNameRegExp, lessCode).map(([, varName]) => varName)
}

const cssVarRegExp = /--([^:]+): ([^;]*);/g
async function resolveLessVariables(lessCode, lessOptions) {
  const varNames = findLessVariables(lessCode)
  const renderVarsCode = `#resolved {\n${varNames.map(varName => `--${varName}: @${varName};`).join('\n')}\n}`
  let renderResult
  try {
    renderResult = await less.render(
      `${lessCode} ${renderVarsCode}`,
      lessOptions
    )
  } catch (e) {
    throw new Error(`Less render failed! (${e.message}) Less code:\n${lessCode}\nGenerated code:\n${renderVarsCode}`)
  }
  return getRegexpMatches(cssVarRegExp, renderResult.css.replace(/#resolved {(.*)}/, '$1')).reduce(
    (acc, [, varName, value]) => ({ ...acc, [camelCase(varName)]: value }),
    {}
  )
}

export async function loadAndResolveLessVars(entry, lessOptions) {
  const lessCode = loadLessWithImports(entry)
  return await resolveLessVariables(lessCode, lessOptions)
}
