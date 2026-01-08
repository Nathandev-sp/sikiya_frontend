# Switching Expo Accounts

If you're logged into the wrong Expo account, here's how to switch:

---

## 🔄 Quick Solution

### Step 1: Logout from Current Account

```bash
npx eas-cli logout
```

This will log you out of the current Expo account.

---

### Step 2: Login to Correct Account

```bash
npx eas-cli login
```

Then enter:
- Your **correct** Expo username/email
- Your **correct** password

---

## ✅ Verify You're Logged Into Correct Account

Check which account you're logged into:

```bash
npx eas-cli whoami
```

This shows your current Expo username.

---

## 🔍 Alternative: Check Your Accounts

If you have multiple Expo accounts and want to see which one you're using:

```bash
npx eas-cli whoami
```

To see all your projects:

```bash
npx eas-cli project:info
```

---

## 💡 Pro Tip

If you're still having issues, you can also:

1. **Clear cached credentials:**
   ```bash
   rm ~/.expo/state.json
   npx eas-cli login
   ```

2. **Or use a specific account:**
   ```bash
   npx eas-cli login --username your-email@example.com
   ```

---

## 📝 Quick Commands

```bash
# Logout
npx eas-cli logout

# Login
npx eas-cli login

# Check current account
npx eas-cli whoami

# Clear cache (if needed)
rm ~/.expo/state.json
```

---

That's it! Just logout and login with the correct credentials. 🚀

