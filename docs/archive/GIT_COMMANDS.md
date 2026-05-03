# Git Commands for PR

## Step 1: Create a new branch

```bash
git checkout -b feature/minimal-ui-redesign
```

## Step 2: Stage all changes

```bash
# Add modified files
git add css/main.css
git add index.html
git add js/app.js
git add js/storage.js
git add js/units.js
git add sw.js
git add vercel.json

# Add deleted files
git rm css/settings.css
git rm js/location-name.js
git rm settings.html

# Add new documentation
git add IMPLEMENTATION_SUMMARY.md
git add TESTING_GUIDE.md
git add UZANTO_GVIDILO.md
git add PR_DESCRIPTION.md

# Add spec files (optional - if you want to include them)
git add .kiro/
```

## Step 3: Commit changes

```bash
git commit -m "feat: minimal UI redesign with base height feature

- Redesigned interface to show only altitude value
- Added tap-to-refresh and long-press-for-settings interactions
- Implemented base height feature for relative altitude measurements
- Removed location name display for minimalism
- Updated service worker to v2
- Added comprehensive documentation

BREAKING CHANGES: None - backward compatible with existing data
"
```

## Step 4: Push to remote

```bash
git push origin feature/minimal-ui-redesign
```

## Step 5: Create Pull Request

Go to your repository on GitHub/GitLab and create a PR from `feature/minimal-ui-redesign` to `main`.

Use the content from `PR_DESCRIPTION.md` as the PR description.

---

## Quick All-in-One Command

If you want to do everything at once:

```bash
# Create branch
git checkout -b feature/minimal-ui-redesign

# Stage all changes
git add css/main.css index.html js/app.js js/storage.js js/units.js sw.js vercel.json
git rm css/settings.css js/location-name.js settings.html
git add IMPLEMENTATION_SUMMARY.md TESTING_GUIDE.md UZANTO_GVIDILO.md PR_DESCRIPTION.md
git add .kiro/

# Commit
git commit -m "feat: minimal UI redesign with base height feature

- Redesigned interface to show only altitude value
- Added tap-to-refresh and long-press-for-settings interactions
- Implemented base height feature for relative altitude measurements
- Removed location name display for minimalism
- Updated service worker to v2
- Added comprehensive documentation

BREAKING CHANGES: None - backward compatible with existing data
"

# Push
git push origin feature/minimal-ui-redesign
```

Then create the PR on your Git hosting platform.

---

## Alternative: Direct commit to main (if no PR needed)

```bash
# Stage all changes
git add -A

# Commit
git commit -m "feat: minimal UI redesign with base height feature

- Redesigned interface to show only altitude value
- Added tap-to-refresh and long-press-for-settings interactions
- Implemented base height feature for relative altitude measurements
- Removed location name display for minimalism
- Updated service worker to v2
- Added comprehensive documentation
"

# Push
git push origin main
```

---

## Files Changed Summary

### Modified (7 files)
- css/main.css
- index.html
- js/app.js
- js/storage.js
- js/units.js
- sw.js
- vercel.json

### Deleted (3 files)
- css/settings.css
- js/location-name.js
- settings.html

### Added (4 files)
- IMPLEMENTATION_SUMMARY.md
- TESTING_GUIDE.md
- UZANTO_GVIDILO.md
- PR_DESCRIPTION.md

### Added (spec files)
- .kiro/specs/minimal-ui-redesign/requirements.md
- .kiro/specs/minimal-ui-redesign/design.md
- .kiro/specs/minimal-ui-redesign/tasks.md
