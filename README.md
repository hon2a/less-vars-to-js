# less-vars-to-js

Parse a less variable list and its dependencies and return a map of all resolved variables

## Use

Install using

```sh
npm install @hon2a/less-vars-to-js
```

Use to load file and all its imports, resolve all variables, and collect them. E.g. the following
setup:

`<CWD>/node_modules/some-lib/dist/vars.less`
```less
@primary-color: green;
@error-color: brickred; 
```

`src/style/theme.less`
```less
@import '~some-lib/dist/vars';
@primary-color: blue;
```

`src/style/variables.less`
```less
@import './theme';
@secondary-color: darken(@primary-color, 10);
@match-rate-low-color: @error-color;
```

yields the following extraction:

```javascript
import { loadAndResolveLessVars } from '@hon2a/less-vars-to-js'
const theme = await loadAndResolveLessVars('./src/style/variables.less')
/* {
 *   primaryColor: 'blue',
 *   errorColor: 'brickred',
 *   secondaryColor: '#0000cc',
 *   matchRateLowColor: 'brickred'
 * }
 */
```

_Note: If you're using external imports (e.g. `import '~someLib/path/to/styles.less';`), this
needs to run in the root folder of your package, so that it finds the libs at `./node_modules`._

Pass Less parser options as a second argument to `loadAndResolveLessVars` if you need to customize them.

## Development

### Install

Install dependencies using:

```sh
npm install
```

### Develop

After you modify sources, run the following (or set up your IDE to do it for you):

- format the code using `npm run format`
- lint it using `npm run lint`
- test it using `npm test`

and fix the errors, if there are any.

### Publish

Publishing is done in two steps:

1. Create a new version tag and push it to the repository:
    ```sh
    npm version <patch|minor|major>
    git push --follow-tags
    ```
1. Build and publish the new version as a npm package:
    ```sh
    npm publish --access public
    ``` 
