# Contributing to Gnar Engine Cli & Core

1. Install from source (clone the repo)
2. Create a new profile using the Cli

- Use default CLI API URL as `http://localhost`
- API username: 'gnarlyroot'
- Project Directory should the bootstrap directory of the source code that you cloned: e.g. `/home/adam/Documents/devenvs/gnar-engine/cli/bootstrap/`

3. Set the active profile to the one you just created
4. Up the project with
```bash

    cd gnar-engine/core
    npm run bundle
    gnar dev down -a
    gnar dev up --core-dev --build
```


