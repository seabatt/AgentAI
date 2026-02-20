# AI Headshot Generator PRD

**Product Requirements Document**  
**Version:** 1.0  
**Date:** February 18, 2026  
**Author:** Agent.ai Product Team  
**Type:** Custom App (App SDK + Vercel)

---

## 1. Overview

### Problem Statement

Professional headshots are a universal need — LinkedIn profiles, company websites, speaker bios, press kits, social media — yet getting one is surprisingly painful:

- **Cost barrier:** A professional photographer charges $150-500 per session
- **Time barrier:** Booking, traveling, shooting, editing, and selecting takes 2-4 hours minimum
- **Update friction:** People change hairstyles, age, or switch jobs, but resist re-shooting because the original process was so painful
- **Consistency gap:** Teams with 10+ people rarely have consistent headshot quality or style

The result: most professionals use cropped selfies, years-old photos, or skip the headshot entirely. They know it matters — they just don't have a fast, affordable way to get one that looks good.

**Size of Opportunity:**
- 900M+ LinkedIn users, many with no professional headshot or an outdated one
- "AI headshot" and "professional headshot generator" — 200K+ monthly searches
- Existing competitors (HeadshotPro, Aragon, Try It On AI) charge $29-99 per batch, validating willingness to pay
- Current workaround cost: $150-500 for a photographer, or living with a bad photo

### User Story

"Sarah, a marketing manager at a 50-person consulting firm, needs updated headshots for 12 team members for the new company website. The last round of professional headshots cost $3,000, took 3 weeks to schedule across calendars, and half the team hated their photos. With the AI Headshot Generator, each team member uploads a selfie, picks their backdrop, attire, and color preferences, and gets 3 professional headshot options in under a minute. Sarah gets consistent, on-brand headshots for the entire team in one afternoon — no photographer, no scheduling, no excuses."

### Proposed Solution

A custom web application built with the Agent.ai App SDK and hosted on Vercel (Option B: Hybrid architecture) that transforms selfies into professional headshots through a guided, visual selection flow. The frontend handles photo upload and the visual selection UX, while the backend calls Google Gemini's image generation API (Nano Banana Pro) with the uploaded photo as a reference image.

**Why Hybrid (Option B):** Agent.ai's native `generate_image` builder action doesn't expose a reference image parameter, and `get_user_input` doesn't support file uploads (only `get_user_files` does). The visual card selection UX also can't be replicated with native radio/dropdown inputs. A custom App SDK frontend solves both problems while keeping Agent.ai as the AI backend.

**How it works:**
1. User uploads a photo (selfie, casual photo, existing headshot)
2. User selects preferences through visual cards: Backdrop, Attire, Color
3. App generates 3 professional headshot variations using Google Gemini (Nano Banana Pro) with the photo as a reference image
4. User selects their favorite and downloads in high resolution

**One-sentence summary:** Upload a selfie, pick your look, get 3 professional headshots in under a minute.

### Success Metrics

**Primary Metric:** Weekly Active Users (WAU)
- Target: 500+ WAU within 30 days of launch

**Secondary Metrics:**
1. **Completion Rate:** 80%+ of users who upload a photo complete generation — validates UX flow
2. **Generation Success Rate:** 95%+ of generation requests return at least 1 usable image (min threshold)
3. **Download Rate:** 70%+ of users who see results download at least one image — validates output quality
4. **Return Usage:** 30%+ generate more than one set — indicates they're using it for multiple looks or sharing with others

---

## 2. User Stories

### Primary User Stories

| ID | User Story | Priority |
|----|------------|----------|
| HS-1 | As a professional, I want to turn a selfie into a professional headshot so that I don't need to hire a photographer | P0 |
| HS-2 | As a user, I want to choose my backdrop, attire, and color so that the headshot matches my professional context | P0 |
| HS-3 | As a user, I want to see 3 variations so that I can pick the one that looks best | P0 |
| HS-4 | As a user, I want to download my headshot in high resolution so that I can use it on LinkedIn, company websites, etc. | P0 |
| HS-5 | As a team lead, I want consistent headshot quality across multiple people so that our website looks professional | P1 |
| HS-6 | As a user, I want to generate more variations if I don't like the first set so that I always find a photo I'm happy with | P1 |
| HS-7 | As a user, I want the process to take under 60 seconds so that it fits into a quick work break | P1 |

---

## 3. Requirements

### P0 (Must-Have)

#### REQ-HS-001: Photo Upload
**Description:** Accept a user-provided photo as the reference image for headshot generation.

**Acceptance Criteria:**
- [ ] Accepts JPEG, PNG, and WebP formats
- [ ] Shows a preview of the uploaded photo immediately
- [ ] Allows removing/replacing the uploaded photo
- [ ] File size limit of 10MB with clear error if exceeded
- [ ] Works on both desktop and mobile (camera capture or gallery)

#### REQ-HS-002: Modular Selection System
**Description:** Present visual selection categories for customizing the headshot output. The system must be config-driven so new categories can be added without component changes.

**Acceptance Criteria:**
- [ ] Categories rendered from a single config array (not hardcoded per category)
- [ ] Each category displays as a titled section with a grid of selectable cards
- [ ] Each card shows an icon/emoji and a text label
- [ ] Selected state is visually distinct (highlighted border or background)
- [ ] Only one option per category can be selected
- [ ] Adding a new category requires only a config change, zero component changes

**Launch Categories:**

| Category | Options | Required |
|----------|---------|----------|
| Backdrop | Day City, Night City, Day Outdoors, Dusk Outdoors | Yes |
| Attire | Button Down, Suit & Tie, Blouse, Cocktail Dress | Yes |
| Color | Black, White, Blue, Red | Yes |

**Future Categories (P1+):**
- Lighting (Studio, Natural, Dramatic, Ring Light)
- Expression (Warm Smile, Confident, Approachable, Serious)
- Crop (LinkedIn Square, Website Banner, Headshot Classic)

#### REQ-HS-003: Validation and CTA
**Description:** Validate that all required selections are made before enabling generation.

**Acceptance Criteria:**
- [ ] Yellow validation banner displays when required selections are incomplete
- [ ] Banner text dynamically reflects what's missing (e.g., "Choose a backdrop and color to continue.")
- [ ] Generate button is disabled until all required categories have a selection
- [ ] Generate button shows loading state during generation

#### REQ-HS-004: 3-Image Generation
**Description:** Generate 3 distinct headshot variations per request.

**Acceptance Criteria:**
- [ ] 3 generation requests fire in parallel for speed
- [ ] Each variation uses a different photography modifier (angle, lighting mood, composition) to ensure distinct results
- [ ] Minimum 1 successful image required to show results (graceful degradation if 1-2 fail)
- [ ] All 3 images use the same base prompt (backdrop + attire + color) for consistency
- [ ] Results display progressively as each image completes (not waiting for all 3)

**Variation Modifiers:**

| Variation | Modifier |
|-----------|----------|
| 1 | Straight-on angle, centered composition, even studio lighting |
| 2 | Slight three-quarter turn, soft directional light from the left, subtle depth |
| 3 | Gentle head tilt, Rembrandt-style lighting, warm tone, gentle bokeh |

#### REQ-HS-005: Results Display and Download
**Description:** Present generated headshots in a selection-and-download interface.

**Acceptance Criteria:**
- [ ] 3 images displayed in a horizontal grid
- [ ] User can select/highlight a favorite
- [ ] Download button for selected image (high resolution)
- [ ] "Generate More" button to run again with same settings
- [ ] "Start Over" button to return to selection screen

#### REQ-HS-006: Image Generation via Google Gemini (Nano Banana Pro)
**Description:** Use Google Gemini's image generation API for identity-preserving headshot generation. Agent.ai's native `generateImage` action only accepts `{ prompt: string }` with no reference image parameter, so we route image generation through Gemini, which supports reference images via base64 `inline_data`.

**Acceptance Criteria:**
- [ ] Model: `gemini-3-pro-image-preview` (swappable via config)
- [ ] Aspect ratio: `1:1`
- [ ] Reference image passed as base64 `inline_data` (no temp storage needed)
- [ ] Output returned as base64 image data and displayed as a data URL
- [ ] `GEMINI_API_KEY` stored securely as environment variable, never exposed to client
- [ ] 3 generation requests fire in parallel; minimum 1 successful image required to show results

**Future: Agent.ai integration path.** If/when Agent.ai's `generateImage` action adds reference image support, the architecture can be migrated. The Vercel API route is the only file that would change.

### P1 (Should-Have)

#### REQ-HS-007: Additional Selection Categories
**Description:** Extend the selection system with Lighting, Expression, and Crop categories.

**Acceptance Criteria:**
- [ ] New categories added via config only
- [ ] Optional categories don't block generation (have sensible defaults)
- [ ] UI accommodates 4-6 categories without scroll fatigue

#### REQ-HS-008: Batch/Team Mode
**Description:** Allow multiple people to generate headshots with the same settings for team consistency.

**Acceptance Criteria:**
- [ ] Upload multiple photos in sequence
- [ ] Apply same backdrop/attire/color to all
- [ ] Download all as a zip or individually

#### REQ-HS-009: Aspect Ratio Options
**Description:** Offer output in multiple aspect ratios beyond 1:1.

**Options:**
- 1:1 — LinkedIn, social media profiles
- 4:5 — Instagram portrait
- 3:4 — Traditional headshot crop
- 16:9 — Website banner/header crop

### Non-Functional Requirements

**Performance:**
- Photo upload to results: under 30 seconds total
- Progressive reveal: first image appears within 10-15 seconds
- Selection interactions: instant (< 100ms response)

**Security:**
- Agent.ai API key stored in Vercel environment variables
- Uploaded photos processed transiently (not stored permanently)
- No PII collected beyond the photo itself
- HTTPS everywhere

**Scalability:**
- Vercel edge deployment handles global traffic
- API calls to Agent.ai are parallelized (3 concurrent per generation)
- No server-side state; fully stateless architecture

---

## 4. Technical Considerations

### Architecture

```
┌──────────────────────────┐
│  Next.js App (Vercel)    │
│  ├─ App SDK Components   │
│  ├─ Client-side state    │
│  └─ Photo upload handler │
└──────────┬───────────────┘
           │ POST /api/generate
           ▼
┌──────────────────────────┐
│  Next.js API Route       │
│  ├─ Prompt assembly      │
│  ├─ 3x parallel calls    │
│  └─ @agentai/agentai SDK │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Google Gemini API       │
│  ├─ gemini-3-pro-image-  │
│  │  preview (image)      │
│  ├─ Photo style          │
│  └─ 1:1 aspect ratio     │
└──────────────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14+ (App Router) | Server components, API routes, Vercel-native |
| UI | @agentai/appsdk + Chakra UI + Emotion | Pre-built Agent.ai components |
| Backend SDK | @agentai/agentai | Agent.ai API client for image generation |
| Hosting | Vercel | Edge deployment, serverless API routes |
| State | React useState/useReducer | Client-side selection and generation state |

### File Structure

```
app/
├── layout.tsx                    # ChakraProvider, global styles
├── page.tsx                      # Main headshot generator page
├── api/
│   └── generate/
│       └── route.ts              # POST → Agent.ai API (3x parallel)
├── components/
│   ├── PhotoUpload.tsx           # Upload + preview + remove
│   ├── SelectionGrid.tsx         # Generic: renders any category
│   ├── SelectionCard.tsx         # Single selectable card
│   ├── ValidationBanner.tsx      # Dynamic "missing selections" alert
│   ├── GenerateButton.tsx        # CTA with loading state
│   └── ResultsDisplay.tsx        # 3-image grid + select + download
└── lib/
    ├── headshot-config.ts        # Category definitions (THE config)
    ├── prompt-builder.ts         # Selections → image prompt string
    └── generation-config.ts      # Model, style, variations config
```

### Modular Selection Config

```typescript
// lib/headshot-config.ts

interface SelectionOption {
  id: string;
  label: string;
  icon: string;            // emoji or image URL
  promptFragment: string;  // injected into image prompt
}

interface SelectionCategory {
  id: string;
  title: string;
  required: boolean;
  columns: number;
  options: SelectionOption[];
}

const HEADSHOT_CATEGORIES: SelectionCategory[] = [
  {
    id: 'backdrop',
    title: 'Backdrop',
    required: true,
    columns: 4,
    options: [
      { id: 'day-city',      label: 'Day City',      icon: '🏙️', promptFragment: 'daytime city skyline backdrop, soft natural light' },
      { id: 'night-city',    label: 'Night City',    icon: '🌃', promptFragment: 'nighttime city lights backdrop, moody ambient lighting' },
      { id: 'day-outdoors',  label: 'Day Outdoors',  icon: '🏞️', promptFragment: 'outdoor natural landscape backdrop, golden hour sunlight' },
      { id: 'dusk-outdoors', label: 'Dusk Outdoors', icon: '🌅', promptFragment: 'dusk outdoor setting, warm sunset tones' },
    ],
  },
  {
    id: 'attire',
    title: 'Attire',
    required: true,
    columns: 4,
    options: [
      { id: 'button-down',    label: 'Button Down',    icon: '👨‍💼', promptFragment: 'wearing a crisp button-down shirt' },
      { id: 'suit-tie',       label: 'Suit & Tie',     icon: '👔', promptFragment: 'wearing a tailored suit and tie' },
      { id: 'blouse',         label: 'Blouse',         icon: '👩‍💼', promptFragment: 'wearing a professional blouse' },
      { id: 'cocktail-dress', label: 'Cocktail Dress', icon: '👗', promptFragment: 'wearing an elegant cocktail dress' },
    ],
  },
  {
    id: 'color',
    title: 'Color',
    required: true,
    columns: 4,
    options: [
      { id: 'black', label: 'Black', icon: '⬛', promptFragment: 'in black' },
      { id: 'white', label: 'White', icon: '⬜', promptFragment: 'in white' },
      { id: 'blue',  label: 'Blue',  icon: '🟦', promptFragment: 'in blue' },
      { id: 'red',   label: 'Red',   icon: '🟥', promptFragment: 'in red' },
    ],
  },
];
```

### Prompt Assembly

Each generation request assembles a prompt from the user's selections:

```
Base template:
"Professional headshot photograph of the person in the reference image,
{backdrop.promptFragment}, {attire.promptFragment} {color.promptFragment},
sharp focus, shallow depth of field, professional photography,
high resolution, 8k, {variation.modifier}"
```

**Example assembled prompt (Variation 2):**
> "Professional headshot photograph of the person in the reference image, daytime city skyline backdrop with soft natural light, wearing a tailored suit and tie in blue, sharp focus, shallow depth of field, professional photography, high resolution, 8k, slight three-quarter turn, soft directional light from the left, subtle depth"

### Generation Config

```typescript
// lib/generation-config.ts

const GENERATION_CONFIG = {
  model: 'gemini-3-pro-image-preview',
  provider: 'google-gemini',
  style: 'photo',
  aspectRatio: '1:1',
  imageSize: '2K',
  variations: {
    min: 1,
    ideal: 3,
  },
};

const VARIATION_MODIFIERS = [
  'straight-on angle, centered composition, even studio lighting',
  'slight three-quarter turn, soft directional light from the left, subtle depth',
  'gentle head tilt, Rembrandt-style lighting, warm tone, gentle bokeh',
];
```

### API Route

```
POST /api/generate
Request: { prompt: string, imageUrl: string }
Response: { success: boolean, images: string[] }

Implementation:
- Receives prompts + uploaded photo
- Converts photo to base64 and sends as `inline_data` alongside each prompt
- Fires 3 parallel requests to Gemini for speed
- Each request appends a different variation modifier
- Uses Promise.allSettled for graceful degradation
- Returns all successful images (minimum 1 required)
- Model: gemini-3-pro-image-preview (configurable)
```

### Error Handling

| Scenario | Behavior | User Message |
|----------|----------|--------------|
| No photo uploaded | CTA disabled, validation banner | "Upload a photo to get started." |
| Selections incomplete | CTA disabled, validation banner | "Choose a {missing category} to continue." |
| All 3 generations fail | Error state | "We couldn't generate your headshots. Please try again or use a different photo." |
| 1-2 of 3 fail | Show successful ones | No error — display what succeeded. "Generate More" available. |
| Photo too large | Reject upload | "Photo must be under 10MB. Try a smaller image." |
| API rate limit | Error state | "We're experiencing high demand. Please try again in a moment." |
| Network error | Error state | "Connection lost. Check your internet and try again." |

---

## 5. UX/UI Design

### User Flow

```
[Upload Photo] → [Select Backdrop] → [Select Attire] → [Select Color]
       ↓                                                       ↓
  Photo preview                                     Validation passes
  with remove (X)                                          ↓
                                                  [Generate Headshot]
                                                          ↓
                                              [Loading: Progressive]
                                                   ↓    ↓    ↓
                                              [img1] [img2] [img3]
                                                          ↓
                                              [Select] → [Download]
                                                  or
                                              [Generate More]
```

**Happy Path:** Upload selfie → tap 3 cards → Generate → Pick favorite → Download. Under 60 seconds.

### Screen 1: Input (Selection Flow)

**Layout:** Single-column card on white background. Matches the reference screenshot.

- **Photo area** (top): Centered image preview with X to remove, "Choose different image" secondary button below
- **Category sections** (middle): Backdrop → Attire → Color, each as a titled section with a 4-column grid of selectable cards
- **Validation** (bottom): Yellow alert banner when selections are incomplete
- **CTA** (bottom): Full-width primary button "Generate Headshot"

**App SDK Components Used:**
- `AgentAIAgentPage` — page shell with header/footer
- `AgentAISection` — category titles
- `AgentAIAlert` status="auth" — validation banner
- `AgentAIButton` variant="primary" — CTA
- `AgentAIButton` variant="secondary" — "Choose different image"
- Custom `SelectionCard` — emoji + label selectable cards

### Screen 2: Loading (Progressive Reveal)

**Layout:** Same card, content replaced with 3 placeholder slots that fill in as images complete.

```
[Generating...] [Generating...]  [Generating...]
      ↓
  [Image 1 ✓]   [Generating...]  [Generating...]
      ↓
  [Image 1 ✓]    [Image 2 ✓]    [Generating...]
      ↓
  [Image 1 ✓]    [Image 2 ✓]     [Image 3 ✓]
```

- Skeleton/shimmer placeholder for pending images
- Check mark or subtle animation when each arrives
- Total wait: 10-20 seconds

### Screen 3: Results

**Layout:** 3-column image grid with selection and download.

- Each image in a card with click-to-select behavior
- Selected image gets a highlighted border
- Below the grid:
  - `AgentAIButton` variant="primary" — "Download High-Res" (downloads selected image)
  - `AgentAIButton` variant="secondary" — "Generate More" (re-runs with same settings)
  - `AgentAIButton` variant="ghost" — "Start Over" (returns to input screen)

### Mobile Considerations

- Selection grids: 2 columns on mobile (vs. 4 on desktop)
- Results grid: vertical stack on mobile (vs. 3-column on desktop)
- Photo upload supports camera capture via `accept="image/*"` with `capture` attribute
- All touch targets minimum 44px

---

## 6. URS Validation

### Usability Checklist

- [ ] Runs successfully without bugs across Chrome, Safari, Firefox, and mobile browsers
- [ ] Clear name — "AI Headshot Generator" is descriptive, searchable, and immediately understood
- [ ] Visual selection flow requires zero text input — just taps
- [ ] Handles poor photo quality gracefully (low-res selfies still produce usable output)
- [ ] Well-formatted output with clear download action
- [ ] Under 60 seconds from upload to downloadable headshot

### Remarkability Checklist

- [ ] Unique visual selection UX — not a text prompt box
- [ ] Solves a clear, universal problem (everyone needs a headshot)
- [ ] Goes beyond a basic image generation call — guided flow, 3 variations, modular config
- [ ] Photo-realistic output that competes with $29-99 competitors
- [ ] Modular architecture sets up extensibility (new categories, team mode, batch)

### Safety Checklist

- [ ] No inappropriate content generation (professional headshots only)
- [ ] Photos processed transiently, not stored
- [ ] No PII collected beyond the photo
- [ ] HTTPS everywhere, API keys never exposed to client
- [ ] Clear that output is AI-generated (no deception)

---

## 7. RAVE Pre-Check

### Relevant
- **Clear ROI:** Save $150-500 per headshot session. 60 seconds vs. 2-4 hours.
- **Immediately understandable:** "Upload a selfie, get a professional headshot" — zero explanation needed
- **Minimal setup:** No account required for v1. Just upload and go.
- **Low input, high value:** 1 photo + 3 taps → 3 professional headshots

### Actionable
- **Unique value every run:** Different backdrop/attire/color combinations, different people
- **Recurring friction:** New hires, profile updates, seasonal refreshes, different platforms needing different styles
- **Drives next action:** Download and immediately update LinkedIn/website/bio

### Validated
- **80% case:** Single person, standard professional headshot, common backdrop/attire choices
- **Typical variations:** Different photo quality (high confidence), unusual angles (medium confidence), group/non-portrait photos (low confidence — out of scope)
- **Risk areas:** Very low-resolution photos, photos with multiple people, heavy filters on source image

### Evergreen
- **Fits existing workflow:** Get headshot → Download → Upload to LinkedIn/website. Same as they'd use a photographer's deliverable.
- **No new habits required:** Point, click, download. That's it.
- **Extensible:** New categories, team mode, API integration for company onboarding tools

**RAVE Verdict:** Strong across all four dimensions. The visual selection UX is the key differentiator vs. text-prompt competitors. **Ready to build.**

---

## 8. Known Limitations

1. **Identity preservation is model-dependent.** Gemini image generation is strong at face preservation but not perfect. Unusual angles, heavy makeup, or sunglasses in the source photo may reduce accuracy.

2. **Attire generation is approximate.** AI can't perfectly render specific garment details. "Suit & Tie" will look like a suit, but not a specific brand or cut.

3. **One person per photo.** The app is designed for individual headshots. Group photos as source images will produce unpredictable results.

4. **No text or logos in output.** The generated image is a clean headshot. Company logos or name overlays must be added separately.

5. **Model swap planned.** The launch model is `gemini-3-pro-image-preview`. Future Gemini model swaps should require only a config change — no architectural changes.

---

## 9. Open Questions

1. **Should we require authentication for generation?**
   - Context: Anonymous access maximizes top-of-funnel. Auth gates generation behind a login but enables usage tracking and team features.
   - Decision needed by: Before beta launch
   - Recommendation: Anonymous for v1, optional auth for saved history in v2

2. **What's the right photo upload storage strategy?**
   - Context: The current implementation sends the image as base64 `inline_data`. If payload size limits become a problem, we can switch to short-lived object storage (e.g., Vercel Blob) and pass a URL instead.
   - Decision needed by: Build phase
   - Recommendation: Keep base64 for v1; consider Vercel Blob with short TTL if needed

3. **Should we offer a paid tier?**
   - Context: Competitors charge $29-99. Free with limits (3 generations/day) + paid unlimited is a common model.
   - Decision needed by: Before public launch
   - Recommendation: Free unlimited for launch to drive adoption, evaluate monetization at 1,000+ WAU

4. **How does nano-banana handle face preservation vs. FLUX Kontext Max?**
   - Context: We’re using nano-banana (Gemini) now. Validate quality across a representative photo set, and re-check when Gemini releases newer image models.
   - Decision needed by: Before public launch, then quarterly
   - Owner: Product team (run comparison tests)

---

## 10. Launch Plan

### Phase 1: Build + Internal Testing (Week 1-2)
- Scaffold Next.js app with App SDK
- Implement modular selection system
- Wire up Google Gemini image generation (Nano Banana Pro)
- Test across 20+ photos (various quality, angles, skin tones, genders)
- Validate 3-variation approach produces meaningfully distinct results

### Phase 2: Beta (Week 3)
- Deploy to Vercel, share with 20-30 internal/community testers
- Collect feedback on: photo quality, selection options, generation speed, overall UX
- Iterate on prompt engineering and variation modifiers

### Phase 3: Public Launch (Week 4-5)
- Featured on Agent.ai Labs
- Blog post: "Professional Headshots in 60 Seconds — No Photographer Required"
- Social media launch targeting "AI headshot" and "professional photo" keywords

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 18, 2026 | Agent.ai Product Team | Initial PRD creation |
