# ReflectAI - User-Authenticated Journal & Reflection Workspace

ReflectAI is a full-stack, user-authenticated journaling and reflective thinking application powered by **Gemini 3.6 Flash**, **Firebase Authentication (Google Sign-In)**, and **Cloud Firestore**. 

Every interaction—from raw journal reflections to structured AI syntheses and multi-turn conversational exchanges—is strictly isolated to the authenticated user's account path (`/users/{userId}/...`), preventing cross-user data leakage.

---

## 1. Architecture & Threat Model

ReflectAI is built to satisfy strict OWASP and Google Cloud security principles:

| Threat Zone | Risk | Implemented Countermeasure |
| :--- | :--- | :--- |
| **Input Surfaces** | Prompt injection, malicious payload structures | Defensive null-safe deserialization, 10MB payload size limits, strict undefined-stripping prior to database writes. |
| **Planning & Reasoning** | System instruction bypass | Hard boundary separation between system persona instructions and untrusted user journal context in the AI pipeline. |
| **Tool & AI Execution** | Gemini API rate limits (429), model outages (503/500) | Automated fallback ladder (`gemini-3.6-flash` → `gemini-3.1-flash-lite` → `gemini-flash-latest` → `gemini-3.7-flash`). |
| **Memory & State** | Cross-user data leakage in Firestore | Owner-bound Firestore Security Rules enforcing `request.auth.uid == userId`. No plaintext passwords stored. |
| **Inter-System Communication** | Gemini API key leakage in browser client | Express backend API proxying (`/api/gemini/*`). `GEMINI_API_KEY` is never transmitted to the browser client. |

---

## 2. Cloud Firestore Security Rules

Deploy the following owner-bound security rules to ensure user data isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /{allSubcollections=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## 3. Secret Management Setup (Google Cloud Secret Manager)

To securely manage the `GEMINI_API_KEY` secret without hardcoding:

```bash
# 1. Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com

# 2. Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 3. Grant the default Cloud Run service account access to read the secret
# Replace YOUR_PROJECT_NUMBER with your actual Google Cloud Project Number
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 4. Cloud Run Deployment Flow

Deploy the application to Google Cloud Run:

```bash
# 1. Enable required Google Cloud services
gcloud services enable run.googleapis.com firestore.googleapis.com

# 2. Build and deploy container directly to Cloud Run
gcloud run deploy reflectai-app \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --port 3000
```

### Mandatory Campaign Verification Label

To register the service for automated challenge verification, apply the required resource label:

```bash
gcloud run services update reflectai-app \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 5. End-to-End Functional Test Walkthrough

Below are the test cases covering every user-facing process and interaction:

### Test Suite 1: Authentication & Landing View
- **TC1.1 - Landing Page Render**: Access the root URL while unauthenticated. Verify hero headline, "Sign In with Google" button, security pillar highlights, and the "Security & Isolation" modal trigger are visible.
- **TC1.2 - Google Sign-In Flow**: Click "Sign In with Google". Complete the federated popup authentication. Verify automatic redirection to the private authenticated workspace.
- **TC1.3 - Session Persistence**: Refresh the browser tab after sign-in. Verify that the authenticated session automatically restores without requiring re-login.

### Test Suite 2: Journal & Reflection Entry Management
- **TC2.1 - Create New Entry**: Click "Write New Reflection" or "+ New Reflection". Verify the editor opens with empty title, default category ("Personal Growth"), and blank reflection textarea.
- **TC2.2 - Live Word Count & Read Time**: Type thoughts into the textarea. Verify real-time updates to word count and estimated reading time.
- **TC2.3 - Category & Mood Assignment**: Change the category dropdown to "Work & Projects" and select the "⚡ Energized" mood. Verify selection updates immediately.
- **TC2.4 - Tag Management**: Type `creativity` and press Enter. Verify the tag `#creativity` renders as a chip with a remove (`×`) button.
- **TC2.5 - Manual & Autosave to Firestore**: Click "Save". Verify save status transitions from "Saving..." to "Saved to Firestore". Verify no payload corruption errors occur.

### Test Suite 3: Gemini 3.6 Flash Synthesis & Analysis
- **TC3.1 - Generate AI Insights**: In an active reflection, click "Generate AI Insights & Summary". Verify loading spinner appears while `/api/gemini/analyze` processes.
- **TC3.2 - Synthesis Output Verification**: Verify the AI synthesis panel renders with Executive Summary, 3 Cognitive Insights, and Constructive Action Items.
- **TC3.3 - Resilient Model Fallback**: Verify that if a model experiences rate limits, the backend fallback ladder automatically attempts `gemini-3.1-flash-lite` or `gemini-flash-latest` without UI failure.

### Test Suite 4: Multi-Turn Conversational Reflection
- **TC4.1 - Suggested Prompt Chips**: Click on a suggested inquiry chip (e.g. "What questions should I ask myself?"). Verify the message is added to the dialogue and Gemini generates a contextual reply.
- **TC4.2 - Custom Multi-Turn Dialogue**: Type a custom query ("How can I apply this to next week's team meeting?") and submit. Verify multi-turn history is preserved with role indicators (`user` and `model`).
- **TC4.3 - Copy & Append to Journal**: Click the "Append" button on a Gemini response bubble. Verify the text is added directly to the reflection document.

### Test Suite 5: History, Search, Filters & Export
- **TC5.1 - Real-Time Firestore Sync**: Return to "Journal Archive". Verify all saved entries appear with title, mood emoji, category tag, excerpt, and turn count.
- **TC5.2 - Search Filtering**: Type a keyword in the search bar. Verify the card grid immediately filters down to matching entries.
- **TC5.3 - Category & Mood Filter**: Select the "Work" category tab and "⚡ Energized" mood. Verify only matching entries are displayed.
- **TC5.4 - Star & Bookmark**: Click the Star icon on an entry card. Verify the star fills gold and filter by "Starred" works.
- **TC5.5 - Data Export**: Click "Export .MD" or "Export .JSON". Verify a formatted download file is generated containing all private entries and conversation histories.
- **TC5.6 - Delete Entry**: Click the delete icon on an entry and confirm the prompt. Verify the entry is permanently removed from Cloud Firestore.

### Test Suite 6: Security & Isolation Verification
- **TC6.1 - Security Modal Inspection**: Click the shield icon in the navigation bar. Verify the Threat Model table and active Firestore rules are displayed.
- **TC6.2 - User Isolation**: Open an incognito window, log in as a second user, and verify that User 2 cannot view or access any entries created by User 1.
- **TC6.3 - Sign Out Flow**: Click the Log Out button. Verify session terminates and user returns to the Landing Page.
