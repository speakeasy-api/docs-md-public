#!/bin/bash

# Exit on any error
set -e

# Build the package
npm run lint
npm run build

# Publish the package
npm publish --access=public
