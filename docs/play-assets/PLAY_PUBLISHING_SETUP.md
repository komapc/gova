# Auto-publishing to Google Play from CI

The `android-build.yml` workflow can upload each `main` build straight to the
**Internal testing** track. To enable it you need a **Google Play service
account** — a robot Google account that CI uses to call the Play Developer API.

## What is a service account?
A service account is a non-human Google identity with its own credentials (a
JSON key file). Instead of logging in as you, GitHub Actions authenticates as
this robot account, which you've granted permission to publish your app. The
JSON key is stored as a GitHub **secret**, never in the repo.

## One-time setup

### 1. Enable the API & create the service account
1. Go to **Google Cloud Console** → https://console.cloud.google.com
2. Create (or pick) a project, then enable the **Google Play Android Developer API**
   (APIs & Services → Library → search for it → Enable).
3. APIs & Services → **Credentials** → **Create credentials** → **Service account**.
   - Name it e.g. `gova-ci-publisher`. No roles needed at the Cloud level.
4. Open the new service account → **Keys** → **Add key** → **Create new key** →
   **JSON**. A `.json` file downloads. Keep it secret.

### 2. Grant it access in Play Console
1. Play Console → **Users and permissions** → **Invite new users**.
2. Email = the service account address (looks like
   `gova-ci-publisher@PROJECT.iam.gserviceaccount.com`).
3. Under **App permissions**, add the **Gova** app and grant at least:
   - *Release to testing tracks* (and *View app information*).
4. Send the invite. (It auto-accepts for service accounts.)

### 3. Add the JSON as a GitHub secret
Repo → **Settings → Secrets and variables → Actions → New repository secret**:
- Name: `PLAY_SERVICE_ACCOUNT_JSON`
- Value: paste the **entire contents** of the downloaded JSON file.

Or via CLI:
```
gh secret set PLAY_SERVICE_ACCOUNT_JSON < /path/to/service-account.json
```

## Important prerequisite
The Play API can only **update** a track that already has a build. So you must
do the **first manual upload** to Internal testing once (which you're doing
now). After that, every merge to `main` auto-publishes the new build.

## How it behaves
- **Every PR / push**: builds a signed AAB with a unique `versionCode`
  (`1000 + run number`) and uploads it as the `gova-release-aab` artifact.
- **Merge to `main`** (only): additionally uploads that AAB to the **Internal
  testing** track, status `completed`.
- Until `PLAY_SERVICE_ACCOUNT_JSON` exists, the publish step **self-skips**, so
  `main` builds stay green.

## Promoting to production
Auto-publish targets Internal testing on purpose. Promote a build to
Production manually in the Play Console when you're ready (or later we can add a
tag-triggered production job).
