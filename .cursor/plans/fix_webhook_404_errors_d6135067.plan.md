---
name: Fix webhook 404 errors
overview: "Both issues share the same root cause: the WhatsApp webhook route structure uses query parameters (`/api/webhooks/whatsapp?builderId=xxx`) but requests are arriving at path-based URLs (`/api/webhooks/{builderId}`). The fix is to restructure the route to use a dynamic path segment."
todos:
  - id: create-dynamic-route
    content: Create `app/api/webhooks/[builderId]/route.ts` with GET/POST handlers extracting builderId from path params
    status: completed
  - id: update-webhook-url
    content: "Update `actions/connections.ts` line 66 to use path-based URL format: `/api/webhooks/${builderId}`"
    status: completed
  - id: delete-old-route
    content: Delete `app/api/webhooks/whatsapp/route.ts`
    status: completed
isProject: false
---

# Fix WhatsApp Webhook 404 Errors

## Root Cause

The webhook route is at `app/api/webhooks/whatsapp/route.ts` and expects `builderId` as a **query parameter**:

```
/api/webhooks/whatsapp?builderId=4f63ca53-f888-4372-8bb4-baac4e0048fe
```

But requests (from Meta or the user's configured URL) are arriving as **path segments**:

```
/api/webhooks/4f63ca53-f888-4372-8bb4-baac4e0048fe
```

No route exists at that path, so Next.js returns 404. This explains both:

- **(1)** Meta's webhook verification failing with 404
- **(2)** The constant `POST /api/webhooks/{builderId} 404` log entries

## Fix

Restructure the webhook to use a dynamic route segment `[builderId]` in the path instead of a query parameter.

### 1. Create new dynamic route

Create `[app/api/webhooks/[builderId]/route.ts](app/api/webhooks/[builderId]/route.ts)` with the same logic as the current WhatsApp route, but extracting `builderId` from `params` instead of `searchParams`:

- `GET` handler: extract `builderId` from `params.builderId`, then look up the connection and verify against `hub.verify_token` / `hub.challenge` as before
- `POST` handler: extract `builderId` from `params.builderId`, verify the webhook signature, parse the payload, and enqueue the message

This coexists safely with the static `app/api/webhooks/clerk/route.ts` because Next.js gives static routes priority over dynamic ones -- `/api/webhooks/clerk` will still route to the Clerk handler.

### 2. Update stored webhook URL

In `[actions/connections.ts](actions/connections.ts)`, line 66, change the `webhook_url` format from query-param style to path-segment style:

```
// Before
webhook_url: `${appUrl}/api/webhooks/whatsapp?builderId=${builderId}`

// After
webhook_url: `${appUrl}/api/webhooks/${builderId}`
```

### 3. Remove old route

Delete `[app/api/webhooks/whatsapp/route.ts](app/api/webhooks/whatsapp/route.ts)` since it is no longer needed.

### 4. User action required after deploy

After deploying, the user should:

- Re-save their WhatsApp connection (to regenerate the webhook URL in the new format)
- Update the callback URL in Meta's App Dashboard to the new URL shown in the connections page

