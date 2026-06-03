# StudyOps AI — Visual Style Guide (v2.2)

## 1. Core Palette
| Role | Color | Hex | Purpose |
| :--- | :--- | :--- | :--- |
| **Canvas** | Deep Slate | `#0F172A` | Primary app background |
| **Shell** | Dark Graphite | `#0B0F1A` | Sidebar and Navigation background |
| **Surface** | Frosted Glass | `rgba(30, 41, 59, 0.7)` | Card backgrounds (with `backdrop-blur-xl`) |
| **Primary** | Electric Blue | `#3B82F6` | Primary actions, navigation, active states |
| **AI Accent** | Vibrant Violet | `#8B5CF6` | AI command panel rules, processing states |
| **Secondary** | Cyan | `#06B6D4` | Data visualization, secondary accents |
| **Error** | Rose Red | `#E11D48` | Critical deadlines, danger actions |

## 2. Course Accent Palette
*   **Physics/Science:** Cyan (`#06B6D4`)
*   **Biology/Life:** Emerald (`#10B981`)
*   **Math/Logic:** Rose (`#E11D48`)
*   **Computer Science:** Violet (`#8B5CF6`)
*   **Economics:** Amber (`#F59E0B`)

## 3. Typography
*   **Typeface:** Hanken Grotesk (Sans-serif)
*   **Headlines:** Bold, tracking -0.02em for a modern SaaS feel.
*   **Body:** Medium weight for readability against dark backgrounds.
*   **Numerical Data:** Tabular numerals for charts, timers, and stat tiles.

## 4. UI Patterns
*   **Border Radius:** `12px` (Round Eight) for cards and primary buttons; `8px` for smaller inputs.
*   **Elevation:** No traditional drop shadows. Use `1px` solid borders (`rgba(255, 255, 255, 0.1)`) and `backdrop-blur` for depth.
*   **Buttons:**
    *   *Primary:* High-contrast (White or Primary Color) with bold labels.
    *   *AI Action:* Gradient backgrounds (Violet to Blue) with glow effects.
*   **Charts:** Solid bars/arcs with high-saturation colors; minimal grid lines; high-contrast labels.

## 5. Component Guidance
*   **Next-Up Hero:** Large, high-impact gradient zone. Headline answers "What should I study next?" Lead CTA should be white or high-contrast.
*   **AI Command Panel:** Right-hand 'stack' layout. 3px top rule in AI Accent color. Durable output (plans) should be read-only, structured text.
*   **Course Cards:** Feature a left-hand 6px accent border in the subject color. 'Quiet' cards should use 50% opacity for text/borders.
*   **Flashcard Study Card:** Large typography, centered on a frosted glass surface. Clear 'Reveal Answer' primary action.

## 6. UX Rules
*   **Dominance:** The "Next Action" (Hero) and AI Command Panel are primary. Aggregate stats are tertiary.
*   **Clarity:** Use whitespace to separate the Source Workspace from the AI sidecar.
*   **Motivation:** Show progress via filled arcs and completion counts, not gamified badges.
*   **Decision-Making:** Every chart must answer a student question (e.g., "Where is my time going?").