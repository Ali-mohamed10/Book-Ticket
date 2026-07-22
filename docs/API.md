GET /events

GET /events/:slug

GET /events/:id/seats

POST /seat-hold

DELETE /seat-hold

POST /checkout

POST /stripe/webhook

GET /booking/:id

POST /admin/event

PUT /admin/event/:id

DELETE /admin/event/:id

POST /admin/events

Description:
Creates a new event.

Workflow:

- Validate request
- Translate dynamic content using Google Cloud Translation API
- Save both English and Arabic fields to Supabase
- Return created event
