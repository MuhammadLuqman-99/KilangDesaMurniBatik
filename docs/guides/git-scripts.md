# Git Helper Scripts for Frontend Storefront

This directory contains helpful scripts for managing git commits and pushes.

## Scripts

### 1. `git-push.ps1` (Windows PowerShell)

Main script with commit message prompt.

**Usage:**
```powershell
# With commit message
.\git-push.ps1 "Add new feature"

# Without message (will prompt)
.\git-push.ps1
```

**Features:**
- ✅ Detects if there are changes
- 📝 Prompts for commit message if not provided
- 📦 Adds all changes
- 💾 Commits with your message
- 🚀 Pushes to GitHub
- ❌ Error handling with helpful messages

---

### 2. `git-push.sh` (Linux/Mac/WSL)

Same functionality as PowerShell version, but for Unix-like systems.

**First time setup:**
```bash
chmod +x git-push.sh
```

**Usage:**
```bash
# With commit message
./git-push.sh "Add new feature"

# Without message (will prompt)
./git-push.sh
```

---

### 3. `quick-push.ps1` (Windows PowerShell)

Quick push script with auto-generated commit message.

**Usage:**
```powershell
.\quick-push.ps1
```

**Features:**
- 🚀 One command to push everything
- ⏰ Auto-generates timestamp-based commit message
- ⚡ Fast workflow for rapid iterations

**Example commit message:**
```
Update: 2025-12-01 20:25:30
```

---

## Workflow Examples

### Standard Workflow (Descriptive commits)
```powershell
# After making changes
.\git-push.ps1 "Phase 5: Add FilterSidebar component"
```

### Quick Workflow (Auto commits)
```powershell
# Multiple quick updates
.\quick-push.ps1
# ... make more changes ...
.\quick-push.ps1
# ... make more changes ...
.\quick-push.ps1
```

### Interactive Workflow
```powershell
# Just run without arguments - it will prompt you
.\git-push.ps1
# Enter commit message: Fixed CSS animation issues
```

---

## Troubleshooting

### "Push failed" Error
If you see a push failed error, it might mean:
1. Remote has changes you don't have locally
2. You need to pull first

**Solution:**
```bash
git pull --rebase
.\git-push.ps1 "your message"
```

### Script Execution Policy (Windows)
If you get an execution policy error:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Permission Denied (Linux/Mac)
```bash
chmod +x git-push.sh
```

---

## Best Practices

1. **Use descriptive messages** for important changes
   ```powershell
   .\git-push.ps1 "Phase 5: Complete authentication pages"
   ```

2. **Use quick-push** for minor tweaks during development
   ```powershell
   .\quick-push.ps1
   ```

3. **Review changes** before pushing
   ```bash
   git status
   git diff
   ```

4. **Commit related changes together**
   - Don't mix unrelated features in one commit
   - Group similar changes (e.g., all filter changes)

---

## Git Configuration

Make sure your git is configured:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Check your current branch:
```bash
git branch
```

Check remote repository:
```bash
git remote -v
```

---

## Safety Notes

- Scripts use `git add .` which stages ALL changes
- Always review what will be committed with `git status` first
- For selective commits, use git commands directly:
  ```bash
  git add specific-file.tsx
  git commit -m "message"
  git push
  ```
