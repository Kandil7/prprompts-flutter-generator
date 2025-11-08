#!/bin/bash

# Check if Flutter SDK is available
if command -v flutter &> /dev/null; then
    FLUTTER_VERSION=$(flutter --version | head -n 1)
    echo "✓ Flutter SDK found: $FLUTTER_VERSION"
    exit 0
else
    echo "⚠ Flutter SDK not found in PATH"
    echo "Install Flutter from: https://flutter.dev/docs/get-started/install"
    exit 0  # Non-blocking warning
fi
