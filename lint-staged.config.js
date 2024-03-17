// lint-staged.config.js
module.exports = {
  // Type check TypeScript files
  '**/*.(ts|tsx),!node_modules': () => 'yarn tsc --noEmit',

  // Lint then format TypeScript and JavaScript files
  '**/*.(ts|tsx|js),!node_modules,!src/gql': filenames => [
    `yarn eslint --fix ${filenames.join(' ')}`,
    `yarn prettier --write ${filenames.join(' ')}`
  ],

  // Format MarkDown and JSON
  '**/*.(md|json),!node_modules,!src/gql': filenames =>
    `yarn prettier --write ${filenames.join(' ')}`
};
