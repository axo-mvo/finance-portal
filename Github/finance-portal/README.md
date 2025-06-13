# Din Finansportal - Frontend

This project is a single-page web application designed as a user-friendly, chat-style interface for initiating a loan application process.

## Project Structure

The entire frontend application is contained within a single `index.html` file. This file includes:

*   **HTML:** Defines the structure of the page, including the header, hero section, feature highlights, the multi-step form, CTA, and footer. The form steps (`.chat-step`) are defined within the HTML and shown/hidden dynamically.
*   **CSS:** Embedded within `<style>` tags in the `<head>`. It uses CSS variables for theming and includes several custom `@keyframes` animations for UI effects (fade-in, slide-in, pulse, glow). It also leverages some external resources like Google Fonts.
*   **JavaScript:** Embedded within `<script>` tags at the end of the `<body>`. This script handles all the application logic:
    *   Multi-step form navigation (`showStep` function).
    *   User input validation (email, phone, loan amount, SSN, etc.).
    *   Handling button clicks (preset amounts, employment status, education, citizenship, residency duration, year selection).
    *   Dynamically generating UI elements (e.g., country list buttons, year selection buttons).
    *   Showing/hiding form elements based on user input.
    *   Formatting input (e.g., currency, SSN).
    *   Handling the final form submission using the `fetch` API to an external endpoint.
    *   Managing UI animations and transitions between steps.

## Architectural Decisions

*   **Single-Page Application (SPA):** The application operates within a single HTML file, providing a fluid user experience without full page reloads during the form process.
*   **Vanilla JavaScript:** The core interactive logic is implemented using plain JavaScript without relying on large frontend frameworks (like React, Vue, Angular). This keeps the initial load light but might require more manual DOM manipulation.
*   **Embedded CSS/JS:** Styles and scripts are included directly in the HTML file. This simplifies deployment for this specific single-file structure but could become less maintainable if the application grows significantly. Separating CSS and JS into dedicated files would be a standard practice for larger projects.
*   **Client-Side Logic:** Most form logic, validation, and UI state management occur directly in the user's browser.
*   **API Integration:** The collected form data is sent asynchronously to the `https://integration.axo-test.io/v1/loan-application/` API endpoint for backend processing.
*   **Chat-Style UI:** The form uses a progressive disclosure pattern, presenting questions one after another like a chatbot interaction to guide the user through the application process.
*   **CSS Animations:** Custom CSS animations and transitions are used extensively to enhance the user experience and provide visual feedback during interactions.

## Change Log

*   **Citizenship & Residency Flow:**
    *   Implemented country search functionality when "Nei" is selected for Norwegian citizenship (Step 8).
    *   Added a new step (8.5) to ask how long the user has lived in Norway if they are not a citizen.
    *   Added duration selection buttons ("Mindre enn 5 år", "Mellom 5 og 10 år", "10 år eller mer") to Step 8.5.
    *   Implemented dynamic generation of specific year buttons based on the selected duration range in Step 8.5.
    *   Ensured correct step transitions: Step 8 -> Step 10 (if citizen), Step 8 -> Country Search -> Step 8.5 -> Step 10 (if not citizen).
    *   Corrected date formatting (`toISOString`) and handling for the `LivedInMarketCountrySince` field.
    *   Restored the complete list of countries with ISO codes for the search functionality.
    *   Fixed various event listener and UI bugs within this flow.
*   **Form Submission & Validation:**
    *   Corrected issues with form submission, particularly around the Social Security Number step.
    *   Improved input validation logic for several fields.
    *   Enhanced error handling and logging for API calls.
    *   Addressed date formatting issues (`EmploymentStatusSince`) to match API expectations (ISO 8601).
*   **UI/UX:**
    *   Removed duplicate code sections.
    *   Fixed minor UI bugs and inconsistencies in button behavior and step transitions.
    *   Updated button text for clarity (e.g., "Send søknad").