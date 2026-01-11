---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(npm version:*), Bash(git push:*), Bash(git tag:*)
description: Create a release for the app
argument-hint: [major|minor|patch] Description of the release
---

## Your task

You will increase the version by incrementing the semver number based on what the user asks with the argument.

The current version is in @package.json

If the first argument ($1) is "major", increment the major version and make the 2 others to 0 (example: 0.9.2 becomes 1.0.0)

If the first argument ($1) is "minor", increment the minor version, leave the major as it is, and the patch number becomes 0 (example: 1.5.6 becomes 1.6.0)

If the first argument ($1) is "patch", increment the patch only and leave the 2 other numbers (example: 3.2.5 becomes 3.2.6)

If nothing is specified, or if something else is specified, assume the user wants to "patch"

Before changing the version, you need to gather the release notes for the commit message. Use the git history since the last version tag, and make a summary.
You will put the summary in @RELEASES.md first (look at the file to know how to format the new version, and follow the same format)

Then create the new version with the command `npm version $1 -m "Message"`

- The message should be the same text you put in the RELEASES.md file
- Pass the right argument (major, minor, or patch). It can only be one of those 3 words, nothing else

Then make sure to tag and push the tags to trigger the releases on Github by using the following commands:

- `git tag <version>` where the version is formatted `v1.2.3`. Notice the leading `v`. (Example: if the current version is 5.4.2 in package.json, and the user wants to bump the minor, the command will be: `git tag v5.5.0`)
- `git push && git push --tags`
