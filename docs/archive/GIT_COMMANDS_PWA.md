# Git-Komandoj por PWA-Plibonigoj PR

## 1. Krei Novan Branĉon

```bash
# Certigu ke vi estas sur main/master
git checkout main
git pull origin main

# Krei novan branĉon por PWA-plibonigoj
git checkout -b feature/pwa-improvements
```

## 2. Aldoni Ĉiujn Ŝanĝojn

```bash
# Aldoni ĉiujn novajn kaj ŝanĝitajn dosierojn
git add .

# Aŭ aldoni specife:
git add js/history.js js/chart.js js/theme.js js/install.js js/history-page.js
git add css/history.css
git add history.html
git add tests/
git add index.html js/app.js css/main.css sw.js manifest.json
git add *.md
git add package.json .github/workflows/test.yml
```

## 3. Kontroli Ŝanĝojn

```bash
# Vidi kio estos commitita
git status

# Vidi diferencojn
git diff --cached
```

## 4. Commiti Ŝanĝojn

```bash
# Commiti kun priskriba mesaĝo
git commit -m "feat: Add PWA improvements (history, export, themes, install)

- Add altitude history with statistics and charts
- Add data export (JSON/CSV)
- Add theme selector (auto/light/dark)
- Add PWA install button
- Add 27 automated tests
- Update Service Worker to v3
- Add comprehensive documentation

New files:
- js/history.js, chart.js, theme.js, install.js, history-page.js
- css/history.css
- history.html
- tests/units.test.js, storage.test.js, run-tests.html
- Documentation: PWA_IMPROVEMENTS.md, CHANGELOG.md, etc.

Updated files:
- index.html, js/app.js, css/main.css
- sw.js (v2 → v3)
- manifest.json (added screenshots)
- TESTING_GUIDE.md, package.json

Total: ~1700 lines of new code, 4 major features, 27 tests"
```

## 5. Puŝi al GitHub

```bash
# Puŝi la novan branĉon
git push origin feature/pwa-improvements

# Se vi bezonas devigi (nur se necese)
git push -f origin feature/pwa-improvements
```

## 6. Krei Pull Request

### Opcio A: Per GitHub CLI (gh)

```bash
# Instali gh se ne jam instalita
# https://cli.github.com/

# Krei PR
gh pr create \
  --title "PWA Plibonigoj: Historio, Eksportado, Temoj, kaj Instalo" \
  --body-file PR_PWA_IMPROVEMENTS.md \
  --base main \
  --head feature/pwa-improvements
```

### Opcio B: Per GitHub Web UI

1. Iru al via GitHub-deponejo
2. Klaku "Pull requests" → "New pull request"
3. Elektu:
   - Base: `main`
   - Compare: `feature/pwa-improvements`
4. Klaku "Create pull request"
5. Titolo: `PWA Plibonigoj: Historio, Eksportado, Temoj, kaj Instalo`
6. Priskribo: Kopiu enhavon de `PR_PWA_IMPROVEMENTS.md`
7. Klaku "Create pull request"

## 7. Post-PR Agoj

### Aldoni Etikedojn
```bash
# Per gh CLI
gh pr edit --add-label "enhancement,feature,pwa"
```

### Peti Reviziojn
```bash
# Per gh CLI
gh pr edit --add-reviewer @username
```

### Ligi al Issues
Se vi havas rilatan issue:
```bash
# En PR-priskribo, aldonu:
Closes #123
Fixes #456
```

## 8. Se Vi Bezonas Ĝisdatigi la PR

```bash
# Fari pliajn ŝanĝojn
git add .
git commit -m "fix: Address review comments"
git push origin feature/pwa-improvements

# PR aŭtomate ĝisdatiĝos
```

## 9. Post Merĝo

```bash
# Reiri al main
git checkout main

# Tiri la merĝitan kodon
git pull origin main

# Forigi lokan branĉon
git branch -d feature/pwa-improvements

# Forigi foran branĉon (se dezirinde)
git push origin --delete feature/pwa-improvements
```

## Alternativa: Unu-Komanda Procezo

```bash
# Krei branĉon, commiti, kaj puŝi
git checkout -b feature/pwa-improvements && \
git add . && \
git commit -m "feat: Add PWA improvements (history, export, themes, install)" && \
git push origin feature/pwa-improvements

# Poste krei PR per gh aŭ web UI
```

## Kontrolo-Listo Antaŭ PR

- [ ] Ĉiuj testoj pasas (`npm test`)
- [ ] Neniu console.error aŭ avertoj
- [ ] Kodo estas formatita
- [ ] Dokumentado estas kompleta
- [ ] CHANGELOG.md estas ĝisdatigita
- [ ] PR-priskribo estas preta
- [ ] Branĉo-nomo estas priskriba
- [ ] Commit-mesaĝo estas klara

## Helpaj Komandoj

```bash
# Vidi branĉojn
git branch -a

# Vidi commit-historion
git log --oneline

# Vidi ŝanĝitajn dosierojn
git diff --name-only

# Vidi statistikojn
git diff --stat

# Kontroli ĉu io estas ne-commitita
git status --short

# Vidi kiu ŝanĝis dosieron
git blame filename

# Serĉi en commit-mesaĝoj
git log --grep="PWA"
```

## Solvi Problemojn

### Se vi forgesis aldoni dosieron
```bash
git add forgotten-file.js
git commit --amend --no-edit
git push -f origin feature/pwa-improvements
```

### Se vi volas ŝanĝi commit-mesaĝon
```bash
git commit --amend
git push -f origin feature/pwa-improvements
```

### Se vi volas kombini commitojn
```bash
git rebase -i HEAD~3  # Kombini lastajn 3 commitojn
git push -f origin feature/pwa-improvements
```

### Se vi havas konfliktojn
```bash
git checkout main
git pull origin main
git checkout feature/pwa-improvements
git rebase main
# Solvi konfliktojn
git add .
git rebase --continue
git push -f origin feature/pwa-improvements
```

---

**Noto**: Ĉi tiuj komandoj supozas ke via ĉefa branĉo estas `main`. Se via deponejo uzas `master`, anstataŭigu `main` per `master`.
