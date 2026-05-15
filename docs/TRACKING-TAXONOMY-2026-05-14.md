# PTD Resource Hub Tracking Taxonomy — 2026-05-14

Scope: `resources.personaltrainersdubai.com` / GitHub repo `milosriki/Personal-Trainers-Dubai`.

## Goal

Attribute AI-search and organic-resource traffic from the satellite into PTD-owned conversion paths without relying on hidden/cloaked content.

## Current implementation

Files:

- `/tracking-config.js`
- `/tracking.js`
- `/_layouts/default.html`

The resource hub now mirrors the Snowplow-shaped tracking model from `bestpersonaltrainerdubai.com`, but with a separate namespace so reports do not mix both satellites.

## Namespace

- Site: `ptd_resources`
- Site property: `ptd_resource_hub`
- Domain: `resources.personaltrainersdubai.com`
- Tracking namespace: `ptr`

## Event names

- `ptr_page_view`
- `ptr_conversion_click`
- `ptr_lead`
- `ptr_ai_referral`
- `ptr_scroll_depth`
- `ptr_video_start`
- `ptr_video_progress`
- `ptr_video_complete`
- `ptr_form_submit`
- `ptr_engaged_session`

## Lead-intent clicks

- Typeform application: `typeform_apply` → `resource_typeform_application_intent`
- Main PTD enquiry page: `main_site_apply` → `resource_main_site_application_intent`
- WhatsApp: `whatsapp_click` → `resource_whatsapp_lead_intent`
- Phone: `phone_call` → `resource_phone_lead_intent`
- Email: `email_click` → `resource_email_contact_intent`

## Outbound link decoration

For links to `personaltrainersdubai.com`, Typeform, and WhatsApp, the script preserves existing click IDs and UTMs, then adds resource-specific parameters where missing:

- `utm_source=resources` when no inbound UTM source exists
- `utm_medium=organic_ai_search`, `organic_search`, or `organic` depending on detected source
- `utm_campaign=<canonical-page-slug>`
- `utm_content=<click label>`
- `ptr_cid`
- `ptr_click_type`
- `ptr_click_location`
- `ptr_click_label`
- `ptr_source_type`
- `ptr_source_name`
- `ptr_ai_platform` when AI referrer is detected
- raw click IDs and UTMs: `gclid`, `gbraid`, `wbraid`, `fbclid`, `ttclid`, `msclkid`, `li_fat_id`, `utm_*`
- duplicated namespaced click IDs/UTMs: `ptr_gclid`, `ptr_fbclid`, `ptr_ttclid`, `ptr_utm_*`

WhatsApp links also receive `ptr_page=<current-path>` and keep the prefilled message identifying `resources.personaltrainersdubai.com` as the source.

## AI-search detection

Detected platforms:

- ChatGPT / OpenAI
- Perplexity
- Claude
- Gemini / Bard
- Copilot / Bing chat
- You.com
- Phind
- Poe
- Grok / xAI
- Mistral Le Chat
- Meta AI
- DeepSeek

Detection uses referrer host plus UTM/source text where available.

## Snowplow shape

The site does not send directly to Snowplow yet because GitHub Pages has no server function endpoint. Every browser event still includes a Snowplow-compatible envelope:

- `snowplow.event_schema`
- `snowplow.contexts`

Contexts include:

- site context
- page context
- traffic source context
- AI search referrer context when relevant
- conversion context when relevant

This keeps payloads ready for a Snowplow collector, Cloudflare Worker forwarder, or server-side pipeline later.

## Current sinks

- `window.dataLayer`
- `window.gtag` if present
- `window.fbq` if present
- Cloudflare Zaraz if present
- local browser storage: last 100 events in `ptr_tracking_events`
- optional `eventEndpoint` in `tracking-config.js` if a collector/forwarder is configured later

## Verification

Run from repo root:

```bash
node --check tracking-config.js
node --check tracking.js
bundle exec jekyll build
```
