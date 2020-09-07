import less from 'less'
import { resolve, dirname } from 'path'
import { readFileSync } from 'fs'
import { getRegexpMatches } from '@hon2a/get-regexp-matches'
import enhancedResolve from "enhanced-resolve"

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
      ? enhancedResolve.sync(__dirname, fullImportPath.slice(1))
      : resolve(dirname(entryPath), fullImportPath)
    return {
      match,
      path: resolvedImportPath,
      ...loadLessWithImports(resolvedImportPath)
    }
  })
  return {
    code: imports.reduceRight(
      (acc, { match, code }) => replaceSubstring(acc, match.index, match.index + match[0].length, code),
      input
    ),
    imports: imports.reduce((acc, { path, imports: nestedImports }) => [...acc, ...nestedImports, path], [])
  }
}

const varNameRegExp = /^\s*@([\w-]+)\s*:/gm
function findLessVariables(lessCode) {
  return getRegexpMatches(varNameRegExp, lessCode).map(([, varName]) => varName)
}

const cssVarRegExp = /--([^:]+): ([^;]*);/g
export async function resolveLessVariables(lessCode, lessOptions) {
  const varNames = findLessVariables(lessCode)
  let renderResult
  try {
    renderResult = await less.render(
      `${lessCode} #resolved {\n${varNames.map(varName => `--${varName}: @${varName};`).join('\n')}\n}`,
      lessOptions
    )
  } catch (e) {
    throw new Error(
      `Less render failed! (${e.message}) Less code:\n${lessCode}\nVariables found:\n${varNames.join(', ')}`
    )
  }
  return getRegexpMatches(cssVarRegExp, renderResult.css.replace(/#resolved {(.*)}/, '$1')).reduce(
    (acc, [, varName, value]) => ({ ...acc, [varName]: value }),
    {}
  )
}

/**
 * Loads a Less file and all of its dependencies (transitively), compiles the Less code, and returns all variables
 * found in the resolved code in an object.
 * @param {String} entry path to the file
 * @param {Object} lessOptions (optional)
 * @returns {Promise<Object>}
 */
export async function loadAndResolveLessVars(entry, lessOptions) {
  const { code: lessCode } = loadLessWithImports(entry)
  return await resolveLessVariables(lessCode, lessOptions)
}
