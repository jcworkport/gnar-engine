#!/usr/bin/env bash
set -e

TARGET_DIR="$HOME/.gnarengine"
CLI_DIR="$(pwd)"

echo "Installing Gnar Engine CLI from local source for user $USER..."

mkdir -p "$TARGET_DIR"

# Install dependencies
cd "$CLI_DIR"
npm install

# Link CLI to custom global folder
npm link --prefix "$TARGET_DIR"

# Bin path for npm link
BIN_PATH="$TARGET_DIR/bin"

# Add to shell PATH if not already present
for SHELLRC in "$HOME/.bashrc" "$HOME/.zshrc"; do
    [ -f "$SHELLRC" ] || continue
    if ! grep -q "$BIN_PATH" "$SHELLRC"; then
        echo "export PATH=\"$BIN_PATH:\$PATH\"" >>"$SHELLRC"
        echo "Added $BIN_PATH to PATH in $SHELLRC"
    fi
done

echo "Gnar Engine CLI installed! Restart your terminal and run 'gnar --help'"
