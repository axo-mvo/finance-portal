# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Norwegian loan application portal ("Din Finansportal") built as a single-page web application with a chat-style interface. The application is designed to guide users through a multi-step loan application process.

## Architecture

**Single-File Structure**: The entire application is contained within `index.html` with embedded CSS and JavaScript. This approach was chosen for simplicity and ease of deployment, but makes the file quite large (~3000+ lines).

**Key Components**:

- HTML structure defines all form steps (`.chat-step`) that are shown/hidden dynamically
- CSS includes custom animations (`@keyframes`) for UI transitions (fade-in, slide-in, pulse, glow)
- JavaScript handles all application logic including form navigation, validation, and submission

**Multi-Step Form Flow**: The application uses a progressive disclosure pattern with numbered steps:

1. Email collection
2. Loan amount selection (preset buttons + dropdown)
3. Phone number
4. Personal details (name, age, address)
5. Employment status
6. Education level
7. Income information
8. Citizenship status (with country search if non-Norwegian)
9. Residency duration (for non-citizens)
10. Social Security Number
11. Final submission

**API Integration**: Form data is submitted to `https://integration.axo-test.io/v1/loan-application/` using the Fetch API.

## Development Commands

This project uses vanilla HTML/CSS/JS with no build process. To work with it:

- **Local Development**: Open `index.html` directly in a browser or serve with a simple HTTP server
- **Testing**: No automated tests - manual testing required
- **Deployment**: The application is deployed to Vercel (configuration in `vercel.json`)

## Key Implementation Details

**Form Validation**: Custom JavaScript validation for email, phone, SSN, and other fields with Norwegian-specific formatting.

**Dynamic UI Generation**: JavaScript dynamically creates country selection buttons and year selection based on user input.

**State Management**: Uses closures and DOM manipulation to maintain form state across steps.

**Citizenship & Residency Flow**: Complex logic for non-Norwegian citizens including country search and residency duration selection with dynamic year generation.

**Date Formatting**: Uses ISO 8601 format for API submission (`toISOString()`).

## Critical Considerations

- All form logic is client-side - no server-side validation
- CSS and JS are embedded in HTML for deployment simplicity
- Norwegian language throughout (form labels, validation messages)
- Extensive use of custom CSS animations that may need adjustment when modifying UI
- Race condition prevention in step transitions (`isAnimating` flag)
