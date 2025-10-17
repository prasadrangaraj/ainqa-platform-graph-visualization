set -x

# Check if a version type is provided
if [ -z "$1" ]; then
  echo "Usage: ./publish.sh <version_type>"
  echo "<version_type> can be: patch, minor, or major"
  exit 1
fi

VERSION_TYPE=$1

echo "install npm"

npm install

# Dynamically update the version and capture the new version number
NEW_VERSION=$(npm version "$VERSION_TYPE" --no-git-tag-version)

git add .


git commit -m "Release: EBM AI Assistant package $NEW_VERSION" # Simple and project-related commit message

npm run build

echo "start publishing"

# Install npm-cli-login if not already installed
npm install -g npm-cli-login


npm-cli-login -u "${NPM_USERNAME:-venkat_q}" -p "${NPM_PASSWORD:-AqMPNp@55w0rd###}" -e "${NPM_EMAIL:-ainqa.devops@ainqa.com}"

npm publish --access public
