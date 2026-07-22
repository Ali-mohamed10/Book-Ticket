# Khaleeji Tour Ticketing Platform

## Overview

A modern event ticketing platform that allows users to browse events, select seats from an interactive seating map, pay securely using Stripe, receive QR-code tickets, and allows administrators to manage events and bookings.

---

## Tech Stack

Frontend

- React
- React Router
- Tailwind CSS
- Framer Motion

Backend

- Node.js
- Vercel Serverless Functions

Database

- Supabase PostgreSQL

Authentication

- Supabase Auth

Payments

- Stripe Checkout

Storage

- Supabase Storage

Deployment

- Vercel

---

## User Roles

Guest

Registered User

Admin

---

## Features

### Guest

Browse events

View event details

View seating map

Select seats

Checkout

Receive ticket

---

### User

Booking history

Download ticket

QR Code

Refund request

---

### Admin

Dashboard

Create Event

Update Event

Delete Event

Upload Event Image

Manage Seat Map

Manage Orders

Manage Customers

Sales Analytics

Coupons

---

## Multi-language Support

The platform supports:

- English
- Arabic

Static UI text will be translated using react-i18next.

Dynamic content (events, venues, descriptions, policies, etc.) will be automatically translated using Google Cloud Translation API when creating or updating an event.

Both language versions will be stored in the database.

Administrators can manually edit the translated content after automatic translation if needed.
