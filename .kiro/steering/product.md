# Product Overview: PhantomOps

## Core Purpose & Vision
PhantomOps is a full-stack public safety network. It solves the problem of chaotic, unverified incident reports by creating a single, reliable source of truth for both users and administrators.

The vision is to empower operations and security teams to make faster, more informed decisions by validating user reports against real-world data.

## Target Audience
1.  **Users:** Individuals (citizens, employees, students) who need to report safety incidents quickly and track their status.
2.  **Admins:** Operations or security teams who need to receive, filter, and manage a high volume of incidents from a central dashboard.

## Key Product Features
* **Secure Authentication:** Handles user sign-up, login, and email verification.
* **Role-Based Access (RBAC):** The application provides two distinct experiences: a `UserDashboard` for reporters and an `AdminDashboard` for managers.
* **Incident Reporting:** Users can report new incidents, including `type` (fire, medical), `severity` (1-5), `description`, and `geolocation` (lat/long).
* **Admin Management Dashboard:** Admins view *all* incidents in a filterable table. They can `resolve` incidents, updating their status in the database.
* **Feedback System:** A protected route allows authenticated users to submit app feedback and ratings.

## Kiroween Hackathon Goal: The "Frankenstein" Feature
For this hackathon, our goal is to evolve PhantomOps from a simple reporting tool into an intelligent **incident validation platform**.

We will build a **"Frankenstein" feature** that, when an admin views an incident, automatically "stitches together" data from multiple, incompatible external sources.

This new "Enrichment Panel" will include:
1.  **Live Social Media:** Validating the report against real-time Twitter/X posts at the incident's location.
2.  **Live Traffic Data:** Pulling Google Maps/Waze data to see the incident's real-world impact.
3.  **"Dead Tech" News:** Scanning local news RSS feeds for related police blotter or official reports.

This feature gives admins immediate, multi-source context, helping them separate real emergencies from false alarms. It directly fulfills the "Frankenstein" category by combining our app, live APIs, and "dead" RSS feeds.