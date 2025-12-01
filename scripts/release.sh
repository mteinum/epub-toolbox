#!/bin/bash

# Script to create a new release for EPUB Toolbox
# Usage: ./scripts/release.sh [version]
# Example: ./scripts/release.sh 0.1.0

set -e

# Check if version argument is provided
if [ -z "$1" ]; then
    echo "Error: Version number required"
    echo "Usage: ./scripts/release.sh [version]"
    echo "Example: ./scripts/release.sh 0.1.0"
    exit 1
fi

VERSION=$1
TAG="v${VERSION}"

# Confirm with user
echo "Creating release for version: ${VERSION}"
echo "Git tag will be: ${TAG}"
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Release cancelled"
    exit 1
fi

# Update package.json version
echo "Updating package.json version..."
npm version ${VERSION} --no-git-tag-version --allow-same-version

# Commit the version change
echo "Committing version change..."
git add package.json package-lock.json
git commit -m "Bump version to ${VERSION}"

# Create and push tag
echo "Creating and pushing tag ${TAG}..."
git tag ${TAG}
git push origin main
git push origin ${TAG}

echo ""
echo "✅ Release ${TAG} created successfully!"
echo "GitHub Actions will now build and publish the release."
echo "Check progress at: https://github.com/mteinum/epub-toolbox/actions"
