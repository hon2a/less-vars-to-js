# less-vars-to-js

Parse a less variable list and its dependencies and return a map of all resolved variables

## Use

Install using

```sh
npm install @hon2a/less-vars-to-js
```

Use to load file and all its imports, resolve all variables, and collect them. E.g.:

```javascript
import { loadAndResolveLessVars } from '@hon2a/less-vars-to-js'
loadAndResolveLessVars('./src/style/variables.less')
```

returns an object containing all variables declared in `src/style/variables.less` and its imports
(with values resolved and variable names camel-cased).

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
