# Manual Test Checklist

## Navigation & shell
- [ ] Every route in the README route table loads without a 404 or unhandled error
- [ ] Sidebar highlights the active section; mobile hamburger opens a drawer with the same nav
- [ ] Breadcrumbs and back buttons present on all interior pages and link correctly
- [ ] Quick-create menu links to matters/contacts/tasks/calendar
- [ ] Notifications dropdown marks items read on click

## Auth & onboarding
- [ ] "Continue with demo law firm" on `/login`, `/signup`, and `/demo` all seed identical data
- [ ] Manual signup blocks submission when passwords don't match
- [ ] Manual signup requires the terms acknowledgement checkbox
- [ ] `/firm-setup` 3-step flow completes and routes to `/dashboard`
- [ ] Signing out clears local demo state and redirects to `/`
- [ ] Visiting a protected route while signed out redirects to `/login`

## Referral pipeline
- [ ] Table view and Kanban view show the same underlying referral set
- [ ] Filters (practice area, jurisdiction, status, urgency, lawyer, min score) narrow results
      correctly; sort dropdown changes order
- [ ] Referral review page renders overview, structured claim summary, assessment, documents,
      timeline, and notes for every seeded referral
- [ ] Accept / Decline (with required reason) / Request More Information all update status visibly
- [ ] Run Conflict Check updates conflict status and entity list
- [ ] Schedule Consultation form creates a confirmed consultation and a calendar event
- [ ] Convert to Matter modal creates a new matter, client, and redirects into the matter workspace
- [ ] `ref-7` and `ref-8` show "converted" status with a working link to their matter

## Matters & matter workspace
- [ ] `/matters` table shows all seeded matters with correct stage/risk/status badges
- [ ] Filtering by practice area, lawyer, and status works
- [ ] All 12 tabs are reachable from the tab bar on every matter (6 via dedicated routes, 6 via
      `?tab=`)
- [ ] Stage stepper reflects the matter's current stage and can be changed by clicking a stage
- [ ] Tasks tab: creating a task and changing its status both work and persist
- [ ] Documents tab: simulated upload adds a document with correct folder/confidentiality/visibility
- [ ] Communications tab: sending a message adds it to the list with a "demo delivery log" notice
- [ ] Damages tab shows the "preliminary internal record" disclaimer and a correct total

## Calendar
- [ ] Month view renders August 2026 with events on the correct days
- [ ] Week/day/deadline-list views filter correctly
- [ ] Lawyer and matter filters narrow the event list
- [ ] Deadline-responsibility warning banner is visible

## Contacts, clients, team
- [ ] Contact and client search filter correctly
- [ ] Client cards show correct active/closed matter counts and document/communication counts
- [ ] Team page shows workload (active matters, open tasks) per member
- [ ] Invite team member form shows a simulated confirmation
- [ ] Permissions matrix renders all 7 roles × 9 permissions

## Reports & analytics
- [ ] All 4 report types render a populated table and a simulated "Export CSV" confirmation
- [ ] Analytics charts render without errors for all filter combinations
- [ ] Conversion funnel bars scale proportionally to values

## Subscription, settings, integrations, help
- [ ] Subscription page highlights the firm's current tier and simulates an upgrade
- [ ] Settings sidebar renders all 16 sections with relevant content
- [ ] Integrations page clearly labels every entry as "Planned" except the JusticeChamp connection
- [ ] Help page FAQ and demo-tour link both work

## Responsive / accessibility
- [ ] All pages are usable at a 375px mobile viewport and a 1440px desktop viewport
- [ ] Interactive elements show a visible focus ring when tabbed to
- [ ] Tables scroll horizontally on narrow viewports rather than overflowing the page

## Build
- [ ] `npm run build` completes with no type errors
- [ ] `npm run dev` boots and the full referral → matter journey works with no console errors
