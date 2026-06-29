# Veracode Fix for SCA Github Action

A GitHub Action that triggers Fix for SCA to remediate security vulnerabilities detected by Veracode SCA (Software Composition Analysis). This action downloads SCA scan results, identifies vulnerable dependencies, applies fixes using AST-based pattern matching, and creates a pull request with the remediated code.

## Build

To build the action for distribution:

```bash
npm run build
```

This builds both the main action and the post-action step, bundling all dependencies into `dist/`.

## Development

### Installation

```bash
npm install
```

### Scripts

- `npm run build` - Build both main and post-action steps