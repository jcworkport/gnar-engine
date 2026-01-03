# Contributing to Gnar Engine Cli & Core

1. Clone the Gnar Engine repo

```bash
    git clone https://github.com/Gnar-Software/gnar-engine.git
```

2. Install the Gnar Engine CLI from local source with the install script

```bash
    cd gnar-engine/cli
    sh install-from-clone.sh    
```

3. Verify the CLI is installed on your machine globally

```bash
    gnar --help
```

3. Create a new profile using the Cli

```bash
    gnar profile create
    
    # Use default CLI API URL as `http://localhost`
    # API username: 'gnarlyroot'
    # Project Directory should the bootstrap directory of the source code that you cloned: e.g. `/home/adam/Documents/devenvs/gnar-engine/cli/bootstrap/`
```

Setting the project directory to be the cli/bootstrap directory, means that you will be able to make changes directly to the bootstrapped services without needing to scaffold a new project or restart the containers.

4. Set the active profile to the one you just created
5. Up the project with

```bash
    cd gnar-engine/core
    npm run bundle
    gnar dev down -a
    gnar dev up --core-dev --build
```

The --core-dev flag volume mounts the bundled core to your services (as apposed to the the installing the core package from the NPM registry at build time). It is still necessary to bundle the core code after making changes as it is the bundle that it is mounted not the source.

