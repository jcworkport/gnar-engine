# Core Development

If you're interested in contributing to the Gnar Engine project, you can download the source code and contribute directly to the engine's core.

## Setup Instructions

Follow these steps to get started with core development:

1. **Clone the repository**
```bash
   git clone https://github.com/Gnar-Software/gnar-engine.git
```

2. **Install from source**
   
   Run the installation script to add `gnar-engine` to your PATH and enable the `gnar` command globally:
```bash
   ./install-from-clone.sh
```

3. **Create a profile**
```bash
   gnar profile create
```
   Follow the prompts to complete the profile creation process.

4. **Start development mode**
   
   Use the `--core-dev` flag to run your local core instead of the npm distribution:
```bash
   gnar dev up --core-dev
```

5. **Build the core**
   
   Navigate to the core directory and run:
```bash
   npm run build
   npm run bundle
```

## Making Changes to the Core

Every time you modify the core, you must rebuild and bundle your changes for them to take effect.

Navigate to the core directory and run:
```bash
npm run build
npm run bundle
```

**Tip:** These commands must be run after each change to ensure your modifications are properly compiled and applied.