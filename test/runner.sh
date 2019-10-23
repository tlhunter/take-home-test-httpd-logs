set -e

cd "$(dirname "$0")"

set -x

for file in ./*.js
do
  node "$file"
done
