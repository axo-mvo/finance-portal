// Animate elements as they appear in viewport
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add("animate-in");
                }, delay);
            }
        });
    },
    {
        threshold: 0.1,
    }
);

// Observe all feature cards and animated elements
document.querySelectorAll(".feature-card, .animate-in").forEach((el) => {
    observer.observe(el);
});

// Cleanup function for event listeners
window.addEventListener("beforeunload", () => {
    if (observer) {
        observer.disconnect();
    }
    // Clean up stored event listeners
    if (window.eventListeners) {
        window.eventListeners.forEach((listener) => {
            listener.element.removeEventListener(listener.event, listener.handler);
        });
        window.eventListeners = [];
    }
});

// Chat form handling
const form = document.getElementById("loan-form");
if (form) {
    const steps = form.querySelectorAll(".chat-step");
    let currentStep = 1;
    let isAnimating = false;

    function formatCurrency(amount) {
        return parseInt(amount).toLocaleString("no-NO") + " kr";
    }

    function showStep(stepNumber) {
        if (isAnimating) {
            console.log("Race condition prevented: Animation already in progress");
            return;
        }
        isAnimating = true;

        const currentStepElement = form.querySelector(`[data-step="${currentStep}"]`);
        const nextStepElement = form.querySelector(`[data-step="${stepNumber}"]`);

        // Sjekk om vi går fra ansettelsestid-spørsmålet til brutto årsinntekt-steget
        if (currentStep === 5 && stepNumber === 6) {
            // Sjekk om vi har ansettelsesdato
            const employmentDateInput = currentStepElement.querySelector('input[name="EmploymentStatusSince"]');
            const employmentStatus = currentStepElement.querySelector('input[name="EmploymentStatus"]').value;
            const employerName = currentStepElement.querySelector('input[name="EmployerName"]')?.value;

            // Ikke krev dato dersom feltet ikke er påkrevd (f.eks. for ikke-ansatte)
            const requiresEmploymentDate = employmentDateInput?.required === true;
            if (requiresEmploymentDate && !employmentDateInput.value) {
                console.log("Forsøk på å gå til neste steg uten ansettelsesdato (påkrevd)");
                isAnimating = false;
                return; // Ikke gå videre hvis ansettelsesdato mangler når den er påkrevd
            }

            // Viktig: Fjern employment-question klassen fra spørsmålet
            const questions = currentStepElement.querySelectorAll(".chat-question");
            questions.forEach((q) => {
                q.classList.remove("employment-question");
                q.style.display = "none";
            });

            console.log(
                "Validering for steg 5 → 6 ok:",
                "ansettelsesdato:",
                employmentDateInput?.value || "(ikke påkrevd)",
                "arbeidsgivernavn:",
                employerName,
                "ansettelsestype:",
                employmentStatus
            );
        }

        // Sjekk om vi går fra brutto årsinntekt-spørsmålet til utdannelse-steget
        if (currentStep === 6 && stepNumber === 7) {
            const grossIncomeInput = currentStepElement.querySelector('input[name="GrossIncomeYearly"]');

            if (!grossIncomeInput.value || parseInt(grossIncomeInput.value) <= 0) {
                console.log("Forsøk på å gå til neste steg uten gyldig brutto årsinntekt");
                isAnimating = false;
                return; // Ikke gå videre hvis brutto årsinntekt mangler eller er ugyldig
            }

            // Sjekk om inntekten er over maksimumsgrensen
            if (parseInt(grossIncomeInput.value) > parseInt(grossIncomeInput.max)) {
                console.log(`Brutto årsinntekt er for høy: ${grossIncomeInput.value}, maks er ${grossIncomeInput.max}`);
                alert(`Brutto årsinntekt kan ikke være høyere enn ${formatCurrency(grossIncomeInput.max)}`);
                isAnimating = false;
                return;
            }

            console.log(
                "Brutto årsinntekt finnes, går til steg 7 (utdannelse):",
                "brutto årsinntekt:",
                grossIncomeInput.value
            );
        }

        // Sjekk om vi går fra utdannelse-spørsmålet til statsborgerskap-steget
        if (currentStep === 7 && stepNumber === 8) {
            const educationInput = currentStepElement.querySelector('input[name="Education"]');

            if (!educationInput.value) {
                console.log("Forsøk på å gå til neste steg uten utdannelsesvalg");
                isAnimating = false;
                return; // Ikke gå videre hvis utdannelse mangler
            }

            console.log("Utdannelse valgt, går til steg 8 (statsborgerskap):", "utdannelse:", educationInput.value);
        }

        // Sjekk om vi går fra statsborgerskap-spørsmålet til fødselsnummer-steget
        if (currentStep === 8 && stepNumber === 8.5) {
            const citizenshipInput = currentStepElement.querySelector('input[name="Citizenship"]');

            if (!citizenshipInput || !citizenshipInput.value) {
                console.log("Forsøk på å gå til neste steg uten statsborgerskap");
                isAnimating = false;
                return; // Ikke gå videre hvis statsborgerskap mangler
            }

            console.log(
                "Statsborgerskap valgt, går til steg 8.5 (flyttet til Norge):",
                "statsborgerskap:",
                citizenshipInput.value
            );
        }

        // Sjekk om vi går fra flyttet til Norge-steget til fødselsnummer-steget
        if (currentStep === 8.5 && stepNumber === 10) {
            const livedInNorwayInput = currentStepElement.querySelector('input[name="LivedInMarketCountrySince"]');

            if (!livedInNorwayInput || !livedInNorwayInput.value) {
                console.log("Forsøk på å gå til neste steg uten dato for når brukeren flyttet til Norge");
                isAnimating = false;
                return; // Ikke gå videre hvis dato mangler
            }

            console.log(
                "Dato flyttet til Norge valgt, går til steg 10 (fødselsnummer):",
                "dato:",
                livedInNorwayInput.value
            );
        }

        currentStep = stepNumber;

        // Animate out current step
        currentStepElement.classList.add("leaving");

        // Wait for exit animation to complete
        setTimeout(() => {
            currentStepElement.classList.remove("active", "leaving");
            nextStepElement.classList.add("active");

            // Sørg for at neste steg vises tydelig
            nextStepElement.style.display = "block";
            nextStepElement.style.opacity = "1";

            const input = nextStepElement.querySelector(".chat-input, .loan-amount-select");
            if (input) {
                input.focus();
                if (input.classList.contains("chat-input")) {
                    input.value = ""; // Clear the input
                }
            }

            isAnimating = false;
        }, 500);
    }

    function validateInput(input) {
        if (input.type === "email") {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
        }
        if (input.name === "PhoneNumber") {
            return /^\d{8}$/.test(input.value.replace(/\s/g, ""));
        }
        if (input.name === "SocialSecurityNumber") {
            // Fjern alle mellomrom og sjekk at det er nøyaktig 11 siffer
            const cleanValue = input.value.replace(/\s/g, "");
            if (!/^\d{11}$/.test(cleanValue)) {
                return false;
            }
            // Sjekk at fødselsnummeret er gyldig
            const day = parseInt(cleanValue.substring(0, 2));
            const month = parseInt(cleanValue.substring(2, 4));
            const year = parseInt(cleanValue.substring(4, 6));
            const individualNumber = parseInt(cleanValue.substring(6, 9));
            const checkDigit = parseInt(cleanValue.substring(9, 11));

            // Sjekk at datoen er gyldig
            if (day < 1 || day > 31 || month < 1 || month > 12) {
                return false;
            }

            // Sjekk for gyldige dag-månedkombinasjoner
            const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            if (day > daysInMonth[month - 1]) {
                return false;
            }

            // Spesiell sjekk for februar og skuddår
            if (month === 2 && day === 29) {
                // Avgjør hvilket århundre basert på individnummer
                let fullYear;
                if (individualNumber >= 0 && individualNumber <= 499) {
                    fullYear = 1900 + year;
                } else if (individualNumber >= 500 && individualNumber <= 749 && year >= 54) {
                    fullYear = 1800 + year;
                } else if (individualNumber >= 500 && individualNumber <= 999 && year <= 39) {
                    fullYear = 2000 + year;
                } else {
                    fullYear = 1900 + year;
                }

                // Sjekk skuddår
                const isLeapYear = (fullYear % 4 === 0 && fullYear % 100 !== 0) || fullYear % 400 === 0;
                if (!isLeapYear) {
                    return false;
                }
            }

            // Sjekk at individnummeret er gyldig (000-999)
            if (individualNumber < 0 || individualNumber > 999) {
                return false;
            }

            return true;
        }
        if (input.name === "AppliedAmount") {
            const value = parseInt(input.value);
            return value >= 10000 && value <= 800000;
        }
        return input.value.length > 0;
    }

    // Sanitization function to prevent XSS
    function sanitizeInput(value) {
        // Prevent XSS by escaping HTML entities
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#x27;")
            .replace(/\//g, "&#x2F;");
    }

    // Legg til formatteringsfunksjon for fødselsnummer
    function formatSocialSecurityNumber(value) {
        // Fjern alle ikke-numeriske tegn
        const cleanValue = value.replace(/\D/g, "");
        // Begrens til 11 siffer
        const limitedValue = cleanValue.slice(0, 11);
        // Formater med mellomrom etter 6. siffer
        return limitedValue.replace(/(\d{6})(\d{5})/, "$1 $2");
    }

    // Legg til event listener for fødselsnummer formatering
    form.querySelector('input[name="SocialSecurityNumber"]').addEventListener("input", (e) => {
        e.target.value = formatSocialSecurityNumber(e.target.value);
    });

    // Initialize form validation on input
    form.querySelectorAll(".chat-input").forEach((input) => {
        input.addEventListener("input", (e) => {
            const button = e.target
                .closest(".chat-input-container, .country-search-container")
                ?.querySelector(".chat-next-btn");
            // Check if the button exists before trying to disable/enable it
            if (button) {
                button.disabled = !validateInput(e.target);
            }
        });

        // Add keypress handler for Enter key
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const button = e.target.parentElement.querySelector(".chat-next-btn");
                if (!button.disabled) {
                    button.click();
                }
            }
        });
    });

    // Handle preset amount buttons
    form.querySelectorAll(".preset-amount-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const amount = e.target.dataset.amount;
            const currentStepElement = form.querySelector(`[data-step="${currentStep}"]`);
            const select = currentStepElement.querySelector(".loan-amount-select");
            select.value = amount;

            // Create and display a response with selected amount
            processLoanAmountSelection(amount);
        });
    });

    // Handle loan amount select change
    const loanAmountSelect = form.querySelector(".loan-amount-select");
    if (loanAmountSelect) {
        loanAmountSelect.addEventListener("change", (e) => {
            const amount = e.target.value;
            if (amount) {
                processLoanAmountSelection(amount);
            }
        });
    }

    // Handle income next button
    const incomeNextBtn = form.querySelector(".income-next-btn");
    if (incomeNextBtn) {
        incomeNextBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const currentStepElement = form.querySelector(`[data-step="${currentStep}"]`);
            const select = currentStepElement.querySelector('select[name="GrossIncomeYearly"]');

            if (select.value) {
                // Format amount with spaces
                const formattedAmount = parseInt(select.value).toLocaleString("nb-NO") + " kr";

                const responseWrapper = document.createElement("div");
                responseWrapper.className = "chat-response-wrapper";

                const icon = document.createElement("div");
                icon.className = "chat-response-icon";
                icon.innerHTML = "✓";

                const response = document.createElement("div");
                response.className = "chat-response";
                response.textContent = formattedAmount;

                const inputContainer = currentStepElement.querySelector(".chat-input-container");
                const question = currentStepElement.querySelector(".chat-question");

                responseWrapper.appendChild(icon);
                responseWrapper.appendChild(response);
                currentStepElement.insertBefore(responseWrapper, inputContainer);

                // Show the response with a fade in
                responseWrapper.style.opacity = "1";

                // Hide input container immediately
                inputContainer.classList.add("hidden");

                // After x seconds, fade out both question and response
                setTimeout(() => {
                    question.classList.add("fade-out");
                    responseWrapper.style.opacity = "0";

                    // After fade animation completes, hide elements and move to next step
                    setTimeout(() => {
                        question.style.display = "none";
                        question.classList.remove("active");
                        responseWrapper.style.display = "none";
                        currentStepElement.style.minHeight = "0";

                        showStep(currentStep + 1);
                    }, 300);
                }, 700);
            }
        });
    }

    // Process loan amount selection and move to next step
    function processLoanAmountSelection(amount) {
        const currentStepElement = form.querySelector(`[data-step="${currentStep}"]`);
        const inputContainer = currentStepElement.querySelector(".chat-input-container");
        const question = currentStepElement.querySelector(".chat-question");

        // Format amount with spaces
        const formattedAmount = parseInt(amount).toLocaleString("nb-NO") + " kr";

        const responseWrapper = document.createElement("div");
        responseWrapper.className = "chat-response-wrapper";

        const icon = document.createElement("div");
        icon.className = "chat-response-icon";
        icon.innerHTML = "✓";

        const response = document.createElement("div");
        response.className = "chat-response";
        response.textContent = formattedAmount;

        responseWrapper.appendChild(icon);
        responseWrapper.appendChild(response);
        currentStepElement.insertBefore(responseWrapper, inputContainer);

        // Show the response with a fade in
        responseWrapper.style.opacity = "1";

        // Hide input container immediately
        inputContainer.classList.add("hidden");

        // After x seconds, fade out both question and response
        setTimeout(() => {
            question.classList.add("fade-out");
            responseWrapper.style.opacity = "0";

            // After fade animation completes, hide elements and move to next step
            setTimeout(() => {
                question.style.display = "none";
                question.classList.remove("active");
                responseWrapper.style.display = "none";
                currentStepElement.style.minHeight = "0";

                showStep(currentStep + 1);
            }, 300);
        }, 700);
    }

    form.addEventListener("click", (e) => {
        if (e.target.classList.contains("chat-next-btn") && e.target.type !== "submit") {
            e.preventDefault();

            // Prevent race conditions by disabling button temporarily
            if (e.target.disabled || isAnimating) {
                return;
            }
            e.target.disabled = true;
            setTimeout(() => {
                e.target.disabled = false;
            }, 1000);
            const currentStepElement = form.querySelector(`[data-step="${currentStep}"]`);
            const input = currentStepElement.querySelector(".chat-input");
            const inputContainer = currentStepElement.querySelector(".chat-input-container");
            const question = currentStepElement.querySelector(".chat-question");

            // Sjekk om dette er lånelengde-steget
            const isLoanDurationStep = currentStepElement.querySelector(".loan-amount-select") !== null;
            if (isLoanDurationStep) {
                const select = currentStepElement.querySelector(".loan-amount-select");
                if (select && select.value) {
                    // Prosesser og gå videre til neste steg
                    const duration = select.value;

                    // Sett form-verdien
                    const durationInput = currentStepElement.querySelector('input[name="LoanDuration"]');
                    if (durationInput) {
                        durationInput.value = duration;
                    }

                    // Create and display a response with selected duration
                    const responseWrapper = document.createElement("div");
                    responseWrapper.className = "chat-response-wrapper";

                    const icon = document.createElement("div");
                    icon.className = "chat-response-icon";
                    icon.innerHTML = "✓";

                    const response = document.createElement("div");
                    response.className = "chat-response";
                    response.textContent = duration + " år";

                    responseWrapper.appendChild(icon);
                    responseWrapper.appendChild(response);

                    currentStepElement.insertBefore(responseWrapper, inputContainer);

                    // Show the response with a fade in
                    responseWrapper.style.opacity = "1";

                    // Hide input container immediately
                    inputContainer.classList.add("hidden");

                    // After x seconds, fade out both question and response
                    setTimeout(() => {
                        question.classList.add("fade-out");
                        responseWrapper.style.opacity = "0";

                        // After fade animation completes, hide elements and show next step
                        setTimeout(() => {
                            question.style.display = "none";
                            question.classList.remove("active");
                            responseWrapper.style.display = "none";
                            currentStepElement.style.minHeight = "0";
                            showStep(currentStep + 1);
                        }, 300);
                    }, 700);
                } else {
                    alert("Vennligst velg hvor mange år du ønsker å betale lånet over");
                }
            } else if (input && validateInput(input)) {
                const responseWrapper = document.createElement("div");
                responseWrapper.className = "chat-response-wrapper";

                const icon = document.createElement("div");
                icon.className = "chat-response-icon";
                icon.innerHTML = "✓";

                const response = document.createElement("div");
                response.className = "chat-response";
                response.textContent = sanitizeInput(input.value);

                responseWrapper.appendChild(icon);
                responseWrapper.appendChild(response);
                currentStepElement.insertBefore(responseWrapper, inputContainer);

                // Show the response with a fade in
                responseWrapper.style.opacity = "1";

                // Hide input container immediately
                inputContainer.classList.add("hidden");

                // After x seconds, fade out both question and response
                setTimeout(() => {
                    question.classList.add("fade-out");
                    responseWrapper.style.opacity = "0";

                    // After fade animation completes, hide elements and move to next step
                    setTimeout(() => {
                        question.style.display = "none";
                        question.classList.remove("active");
                        responseWrapper.style.display = "none";
                        currentStepElement.style.minHeight = "0";

                        showStep(currentStep + 1);
                    }, 300);
                }, 700);
            } else {
                input.focus();
                input.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue("--error-color");
                setTimeout(() => {
                    input.style.borderColor = "";
                }, 2000);
            }
        }
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Valider alle felt før vi fortsetter
        const formData = new FormData(form);
        const formProps = Object.fromEntries(formData);
        let hasErrors = false;

        // Sjekk om alle påkrevde felt har verdi
        for (const [key, value] of Object.entries(formProps)) {
            const input = form.querySelector(`[name="${key}"]`);
            if (input && input.hasAttribute("required") && !value) {
                console.error(`Felt '${key}' mangler verdi`);
                hasErrors = true;
            }
        }

        // Valider brutto årsinntekt spesielt
        const incomeInput = form.querySelector('input[name="GrossIncomeYearly"]');
        if (incomeInput && parseInt(formProps.GrossIncomeYearly) > parseInt(incomeInput.max)) {
            console.error(`Brutto årsinntekt er for høy: ${formProps.GrossIncomeYearly}, maks er ${incomeInput.max}`);
            alert(`Brutto årsinntekt kan ikke være høyere enn ${formatCurrency(incomeInput.max)}`);
            hasErrors = true;
        }

        if (hasErrors) {
            console.error("Validering feilet, stopper innsending");
            return;
        }

        // Fortsett med innsending hvis validering er OK
        const currentStepElement = form.querySelector(`[data-step="${currentStep}"]`);
        const submitButton = currentStepElement.querySelector('button[type="submit"]');
        const inputContainer = currentStepElement.querySelector(".chat-input-container");
        const question = currentStepElement.querySelector(".chat-question");

        submitButton.disabled = true;
        submitButton.textContent = "Vent litt...";

        try {
            const employmentSinceIso = formProps.EmploymentStatusSince
                ? new Date(formProps.EmploymentStatusSince).toISOString()
                : undefined;
            console.log("Forbereder API-kall med følgende data:", {
                application: {
                    AppliedAmount: parseInt(formProps.AppliedAmount),
                    LoanDuration: parseInt(formProps.LoanDuration),
                    GrossIncomeYearly: parseInt(formProps.GrossIncomeYearly),
                    MarketCountry: "NO",
                    EmploymentStatus: formProps.EmploymentStatus,
                    Employer: formProps.EmployerName || "",
                    EmploymentStatusSince: employmentSinceIso,
                    Education: formProps.Education || "High school",
                    Citizenship: formProps.Citizenship || "NO",
                    LivedInMarketCountrySince:
                        formProps.Citizenship !== "NO"
                            ? new Date(formProps.LivedInMarketCountrySince).toISOString()
                            : undefined,
                },
                customer: {
                    MobilePhoneNumber: formProps.PhoneNumber || "40000000",
                    Email: formProps.Email || "test@axogroup.com",
                },
                person: {
                    SocialSecurityNumber: formProps.SocialSecurityNumber.replace(/\s/g, "") || "2803282547",
                },
            });

            const response = await fetch("https://integration.axo-test.io/v1/loan-application/", {
                method: "POST",
                headers: { "Content-type": "application/json; charset=UTF-8" },
                body: JSON.stringify({
                    application: {
                        AppliedAmount: parseInt(formProps.AppliedAmount),
                        LoanDuration: parseInt(formProps.LoanDuration),
                        GrossIncomeYearly: parseInt(formProps.GrossIncomeYearly),
                        MarketCountry: "NO",
                        EmploymentStatus: formProps.EmploymentStatus,
                        Employer: formProps.EmployerName || "",
                        EmploymentStatusSince: employmentSinceIso,
                        Education: formProps.Education || "High school",
                        Citizenship: formProps.Citizenship || "NO",
                        LivedInMarketCountrySince:
                            formProps.Citizenship !== "NO"
                                ? new Date(formProps.LivedInMarketCountrySince).toISOString()
                                : undefined,
                    },
                    customer: {
                        MobilePhoneNumber: formProps.PhoneNumber || "40000000",
                        Email: formProps.Email || "test@axogroup.com",
                    },
                    person: {
                        SocialSecurityNumber: formProps.SocialSecurityNumber.replace(/\s/g, "") || "2803282547",
                    },
                    tracking: {
                        HasOffersAffiliateURL: "https://go.axogroup.com/...",
                        StartedAtUrl: document.location.pathname,
                    },
                }),
            });

            console.log("API-respons status:", response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API-feil:", errorData);
                throw new Error(errorData.message || "API-kallet feilet");
            }

            const axoResponse = await response.json();
            console.log("API-respons mottatt:", axoResponse);
            sessionStorage.setItem("axo.token", axoResponse.jwt);
            sessionStorage.setItem("axo.application-id", axoResponse.applicationID);

            const responseWrapper = document.createElement("div");
            responseWrapper.className = "chat-response-wrapper";

            const icon = document.createElement("div");
            icon.className = "chat-response-icon";
            icon.innerHTML = "✓";

            const responseElement = document.createElement("div");
            responseElement.className = "chat-response";
            responseElement.textContent = formProps.LoanDuration + " år";

            responseWrapper.appendChild(icon);
            responseWrapper.appendChild(responseElement);
            currentStepElement.insertBefore(responseWrapper, inputContainer);

            // Show the response with a fade in
            responseWrapper.style.opacity = "1";

            // Hide input container immediately
            inputContainer.classList.add("hidden");

            // After 3 seconds, fade out both question and response
            setTimeout(() => {
                question.classList.add("fade-out");
                responseWrapper.style.opacity = "0";

                // After fade animation completes, hide elements and redirect
                setTimeout(() => {
                    question.style.display = "none";
                    responseWrapper.style.display = "none";
                    currentStepElement.style.minHeight = "0";
                    window.location.replace("axo-form.html");
                }, 300);
            }, 3000);
        } catch (error) {
            console.error("API Error:", error);
            let errorMessage = "Det oppstod en teknisk feil. Vennligst prøv igjen om litt.";

            if (error.message.includes("network") || error.message.includes("fetch")) {
                errorMessage = "Nettverksfeil. Sjekk internetttilkoblingen din og prøv igjen.";
            } else if (error.message.includes("validation") || error.message.includes("invalid")) {
                errorMessage =
                    "Noen av opplysningene er ikke gyldige. Vennligst kontroller informasjonen og prøv igjen.";
            } else if (error.message.includes("timeout")) {
                errorMessage = "Forespørselen tok for lang tid. Vennligst prøv igjen.";
            }

            alert(errorMessage);
            submitButton.disabled = false;
            submitButton.textContent = "Neste";
        }
    });

    // Handle preset duration buttons
    form.querySelectorAll(".preset-duration-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const duration = e.target.dataset.duration;
            const currentStepElement = form.querySelector(`[data-step="${currentStep}"]`);
            const select = currentStepElement.querySelector(".loan-amount-select");
            select.value = duration;

            // Create and display a response with selected duration
            const responseWrapper = document.createElement("div");
            responseWrapper.className = "chat-response-wrapper";

            const icon = document.createElement("div");
            icon.className = "chat-response-icon";
            icon.innerHTML = "✓";

            const response = document.createElement("div");
            response.className = "chat-response";
            response.textContent = duration + " år";

            responseWrapper.appendChild(icon);
            responseWrapper.appendChild(response);

            const inputContainer = currentStepElement.querySelector(".chat-input-container");
            const question = currentStepElement.querySelector(".chat-question");

            currentStepElement.insertBefore(responseWrapper, inputContainer);

            // Show the response with a fade in
            responseWrapper.style.opacity = "1";

            // Hide input container immediately
            inputContainer.classList.add("hidden");

            // After x seconds, fade out both question and response
            setTimeout(() => {
                question.classList.add("fade-out");
                responseWrapper.style.opacity = "0";

                // After fade animation completes, hide elements and show next step
                setTimeout(() => {
                    question.style.display = "none";
                    question.classList.remove("active");
                    responseWrapper.style.display = "none";
                    currentStepElement.style.minHeight = "0";
                    showStep(currentStep + 1);
                }, 300);
            }, 700);
        });
    });

    // Handle education buttons
    form.querySelectorAll(".education-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const value = e.target.dataset.value;
            const currentStepElement = form.querySelector(`[data-step="${currentStep}"]`);
            const educationInput = currentStepElement.querySelector('input[name="Education"]');
            educationInput.value = value;

            const displayText = e.target.textContent;

            const responseWrapper = document.createElement("div");
            responseWrapper.className = "chat-response-wrapper";

            const icon = document.createElement("div");
            icon.className = "chat-response-icon";
            icon.innerHTML = "✓";

            const response = document.createElement("div");
            response.className = "chat-response";
            response.textContent = displayText;

            responseWrapper.appendChild(icon);
            responseWrapper.appendChild(response);
            currentStepElement.appendChild(responseWrapper);

            // Hide all input containers
            currentStepElement.querySelectorAll(".chat-input-container").forEach((container) => {
                container.style.display = "none";
            });

            // Show the response with a fade in
            responseWrapper.style.opacity = "1";

            // After 1 second, fade out both question and response
            setTimeout(() => {
                const question = currentStepElement.querySelector(".chat-question");
                question.classList.add("fade-out");
                responseWrapper.style.opacity = "0";

                // After fade animation completes, hide elements and show next step
                setTimeout(() => {
                    question.style.display = "none";
                    question.classList.remove("active");
                    responseWrapper.style.display = "none";
                    currentStepElement.style.minHeight = "0";

                    // Kontroller at vi faktisk har verdi for utdannelse
                    if (educationInput.value) {
                        console.log("Går til neste steg (statsborgerskap)");
                        showStep(currentStep + 1);
                    } else {
                        console.error("Kritisk feil: Mangler utdannelse-verdi");
                    }
                }, 300);
            }, 700);
        });
    });

    // Handle citizenship buttons
    form.querySelectorAll(".citizenship-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const value = e.target.dataset.value; // "NO" eller ""
            const currentStepElement = form.querySelector(`[data-step="8"]`);
            const citizenshipInput = currentStepElement.querySelector('input[name="Citizenship"]');
            const citizenshipContainer = currentStepElement.querySelector(".citizenship-container");
            const countrySearchContainer = currentStepElement.querySelector(".country-search-container");
            const countrySearchInput = currentStepElement.querySelector(".country-search");

            // Skjul knappene uansett
            citizenshipContainer.style.display = "none";

            if (value === "NO") {
                // Bruker klikket "Ja"
                citizenshipInput.value = value;
                const displayText = e.target.textContent;

                // Set LivedInMarketCountrySince as not required
                const livedInNorwayInput = form.querySelector('input[name="LivedInMarketCountrySince"]');
                if (livedInNorwayInput) {
                    livedInNorwayInput.required = false;
                    livedInNorwayInput.value = ""; // Clear any potential value
                }

                const responseWrapper = document.createElement("div");
                responseWrapper.className = "chat-response-wrapper";

                const icon = document.createElement("div");
                icon.className = "chat-response-icon";
                icon.innerHTML = "✓";

                const response = document.createElement("div");
                response.className = "chat-response";
                response.textContent = displayText;

                responseWrapper.appendChild(icon);
                responseWrapper.appendChild(response);
                currentStepElement.appendChild(responseWrapper);

                // Vis responsen med fade in
                responseWrapper.style.opacity = "1";

                // Etter 1 sekund, fade ut både spørsmål og respons
                setTimeout(() => {
                    const question = currentStepElement.querySelector(".chat-question");
                    question.classList.add("fade-out");
                    responseWrapper.style.opacity = "0";

                    // Etter fade-animasjon er ferdig, skjul elementer og vis neste steg
                    setTimeout(() => {
                        question.style.display = "none";
                        question.classList.remove("active");
                        responseWrapper.style.display = "none";
                        currentStepElement.style.minHeight = "0";

                        // Gå til fødselsnummer (steg 10)
                        console.log("Statsborgerskap valgt (Ja), går til steg 10");
                        showStep(10);
                    }, 300);
                }, 700);
            } else {
                // Bruker klikket "Nei"
                // Vis land-søkefeltet
                console.log("Statsborgerskap valgt (Nei), viser land-søk");
                countrySearchContainer.style.display = "block";
                countrySearchInput.focus();
            }
        });
    });

    // Handle country search input and selection
    const countrySearch = form.querySelector(".country-search");
    const countryList = form.querySelector(".country-list");
    const countrySearchContainer = form.querySelector(".country-search-container"); // Definer utenfor event listener

    if (countrySearch && countryList && countrySearchContainer) {
        countrySearch.addEventListener("input", (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredCountries = countries.filter((country) => country.name.toLowerCase().includes(searchTerm));

            // Tøm forrige resultat
            countryList.innerHTML = "";

            // Legg til filtrerte resultater
            filteredCountries.forEach((country) => {
                const button = document.createElement("button");
                button.className = "country-btn"; // Bruker ikke chat-btn her
                button.textContent = country.name;
                button.dataset.value = country.code;

                button.addEventListener("click", () => {
                    const currentStepElement = form.querySelector(`[data-step="8"]`);
                    const citizenshipInput = currentStepElement.querySelector('input[name="Citizenship"]');

                    // Sett valgt landkode
                    citizenshipInput.value = country.code;
                    console.log("Land valgt:", country.name, "(", country.code, ")");

                    // Skjul land-søk
                    countrySearchContainer.style.display = "none";
                    countryList.style.display = "none"; // Skjul listen også

                    // Lag og vis respons
                    const responseWrapper = document.createElement("div");
                    responseWrapper.className = "chat-response-wrapper";

                    const icon = document.createElement("div");
                    icon.className = "chat-response-icon";
                    icon.innerHTML = "✓";

                    const response = document.createElement("div");
                    response.className = "chat-response";
                    response.textContent = country.name;

                    responseWrapper.appendChild(icon);
                    responseWrapper.appendChild(response);
                    currentStepElement.appendChild(responseWrapper);

                    // Vis responsen med fade in
                    responseWrapper.style.opacity = "1";

                    // Etter 1 sekund, fade ut både spørsmål og respons
                    setTimeout(() => {
                        const question = currentStepElement.querySelector(".chat-question");
                        question.classList.add("fade-out");
                        responseWrapper.style.opacity = "0";

                        // Etter fade-animasjon, skjul elementer og vis neste steg (8.5)
                        setTimeout(() => {
                            question.style.display = "none";
                            question.classList.remove("active");
                            responseWrapper.style.display = "none";
                            currentStepElement.style.minHeight = "0";

                            // Klargjør og vis steg 8.5
                            const livedInNorwayStep = form.querySelector(`[data-step="8.5"]`);
                            if (livedInNorwayStep) {
                                // Set LivedInMarketCountrySince as required for this path
                                const livedInNorwayInput = livedInNorwayStep.querySelector(
                                    'input[name="LivedInMarketCountrySince"]'
                                );
                                if (livedInNorwayInput) {
                                    livedInNorwayInput.required = true;
                                }

                                const livedInNorwayQuestion = livedInNorwayStep.querySelector(".chat-question");
                                const durationContainer = livedInNorwayStep.querySelector(".duration-container");
                                const yearContainer = livedInNorwayStep.querySelector(".year-container");

                                if (livedInNorwayQuestion) {
                                    // Tilbakestill spørsmålsteksten
                                    livedInNorwayQuestion.textContent = "Hvor lenge har du bodd i Norge?";
                                    livedInNorwayQuestion.style.display = "block";
                                    livedInNorwayQuestion.style.opacity = "1";
                                    livedInNorwayQuestion.style.visibility = "visible";
                                }

                                // Vis varighetsknapper, skjul årsknapper
                                if (durationContainer) {
                                    durationContainer.style.display = "block";
                                }
                                if (yearContainer) {
                                    yearContainer.style.display = "none";
                                }
                            }
                            console.log("Land valgt, går til steg 8.5 (flyttet til Norge)");
                            showStep(8.5); // Gå til steg 8.5
                        }, 300);
                    }, 700);
                });

                countryList.appendChild(button);
            });

            // Vis/skjul listen
            countryList.style.display = filteredCountries.length > 0 ? "block" : "none";
        });

        // Skjul listen hvis bruker klikker utenfor
        const handleDocumentClick = (e) => {
            if (countrySearchContainer && !countrySearchContainer.contains(e.target)) {
                countryList.style.display = "none";
            }
        };
        document.addEventListener("click", handleDocumentClick);

        // Store reference for cleanup
        if (!window.eventListeners) {
            window.eventListeners = [];
        }
        window.eventListeners.push({
            element: document,
            event: "click",
            handler: handleDocumentClick,
        });
    }

    // Håndter varighetsknapper for når brukeren flyttet til Norge (NY)
    form.querySelectorAll(".norway-duration-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const duration = e.target.dataset.duration;
            const currentStepElement = form.querySelector(`[data-step="8.5"]`);
            const durationContainer = currentStepElement.querySelector(".duration-container");
            const yearContainer = currentStepElement.querySelector(".year-container");
            const question = currentStepElement.querySelector(".chat-question");
            const livedInNorwayInput = currentStepElement.querySelector('input[name="LivedInMarketCountrySince"]');

            // Skjul varighetsknappene
            durationContainer.style.display = "none";

            if (duration === "more-than-10") {
                console.log("Valgt: 10 år eller mer");
                // Sett dato 10 år tilbake
                const date = new Date();
                date.setFullYear(date.getFullYear() - 10);
                date.setMonth(0, 1); // Januar, første dag
                date.setHours(12, 0, 0, 0); // Middag for å unngå timezone-problemer
                livedInNorwayInput.value = date.toISOString();
                console.log(`Lagret dato for 10+ år: ${livedInNorwayInput.value}`);

                // Vis respons og gå til neste steg
                showLivedInNorwayResponse(e.target.textContent, currentStepElement, question, livedInNorwayInput);
            } else {
                console.log(`Valgt: ${duration}`);
                // Endre spørsmål og vis årsknapper
                question.textContent = "Hvilket år flyttet du til Norge?";
                yearContainer.style.display = "block";

                // Generer årsknapper basert på valgt varighet
                const yearButtons = yearContainer.querySelector(".year-buttons");
                yearButtons.innerHTML = ""; // Tøm eksisterende knapper
                const currentYear = new Date().getFullYear();
                let startYear, endYear;

                if (duration === "less-than-5") {
                    startYear = currentYear - 4;
                    endYear = currentYear;
                } else {
                    // 5-to-10
                    startYear = currentYear - 9;
                    endYear = currentYear - 5;
                }

                for (let year = endYear; year >= startYear; year--) {
                    const yearButton = document.createElement("button");
                    yearButton.className = "year-btn duration-btn";
                    yearButton.type = "button";
                    yearButton.dataset.year = year;
                    yearButton.textContent = year;
                    yearButtons.appendChild(yearButton);
                }
            }
        });
    });

    // Håndter årsknapper for når brukeren flyttet til Norge (JUSTERT)
    form.addEventListener("click", (e) => {
        // Sjekk om det er en årsknapp innenfor steg 8.5
        if (e.target.classList.contains("year-btn") && e.target.closest('[data-step="8.5"]')) {
            e.preventDefault();
            const year = e.target.dataset.year;
            const currentStepElement = form.querySelector(`[data-step="8.5"]`);
            const livedInNorwayInput = currentStepElement.querySelector('input[name="LivedInMarketCountrySince"]');
            const question = currentStepElement.querySelector(".chat-question");
            const yearContainer = currentStepElement.querySelector(".year-container");

            // Skjul årsknappene
            yearContainer.style.display = "none";

            // Sett datoen til 1. januar det valgte året
            const date = new Date(year, 0, 1);
            date.setHours(12, 0, 0, 0); // Middag for å unngå timezone-problemer
            livedInNorwayInput.value = date.toISOString();
            console.log(`År valgt: ${year}, lagret dato: ${livedInNorwayInput.value}`);

            // Vis respons og gå til neste steg
            showLivedInNorwayResponse(year, currentStepElement, question, livedInNorwayInput);
        }
    });

    // Funksjon for å vise respons og gå videre fra steg 8.5 (NY)
    function showLivedInNorwayResponse(responseText, currentStepElement, question, livedInNorwayInput) {
        const responseWrapper = document.createElement("div");
        responseWrapper.className = "chat-response-wrapper";

        const icon = document.createElement("div");
        icon.className = "chat-response-icon";
        icon.innerHTML = "✓";

        const response = document.createElement("div");
        response.className = "chat-response";
        response.textContent = responseText;

        responseWrapper.appendChild(icon);
        responseWrapper.appendChild(response);
        currentStepElement.appendChild(responseWrapper);

        // Vis responsen med fade in
        responseWrapper.style.opacity = "1";

        // Etter 1 sekund, fade ut både spørsmål og respons
        setTimeout(() => {
            question.classList.add("fade-out");
            responseWrapper.style.opacity = "0";

            // Etter fade-animasjon er ferdig, skjul elementer og vis neste steg (10)
            setTimeout(() => {
                question.style.display = "none";
                question.classList.remove("active");
                responseWrapper.style.display = "none";
                currentStepElement.style.minHeight = "0";

                // Kontroller at vi faktisk har verdi for når brukeren flyttet til Norge
                if (livedInNorwayInput.value) {
                    console.log("Flyttet til Norge valgt, går til steg 10 (fødselsnummer)");
                    showStep(10);
                } else {
                    console.error("Kritisk feil: Mangler når brukeren flyttet til Norge");
                }
            }, 300);
        }, 700);
    }

    // Liste over land (to-bokstav ISO koder)
    const countries = [
        { code: "AF", name: "Afghanistan" },
        { code: "AL", name: "Albania" },
        { code: "DZ", name: "Algerie" },
        { code: "AS", name: "Amerikansk Samoa" },
        { code: "AD", name: "Andorra" },
        { code: "AO", name: "Angola" },
        { code: "AI", name: "Anguilla" },
        { code: "AQ", name: "Antarktis" },
        { code: "AG", name: "Antigua og Barbuda" },
        { code: "AR", name: "Argentina" },
        { code: "AM", name: "Armenia" },
        { code: "AW", name: "Aruba" },
        { code: "AU", name: "Australia" },
        { code: "AT", name: "Østerrike" },
        { code: "AZ", name: "Aserbajdsjan" },
        { code: "BS", name: "Bahamas" },
        { code: "BH", name: "Bahrain" },
        { code: "BD", name: "Bangladesh" },
        { code: "BB", name: "Barbados" },
        { code: "BY", name: "Hviterussland" },
        { code: "BE", name: "Belgia" },
        { code: "BZ", name: "Belize" },
        { code: "BJ", name: "Benin" },
        { code: "BM", name: "Bermuda" },
        { code: "BT", name: "Bhutan" },
        { code: "BO", name: "Bolivia" },
        { code: "BQ", name: "Bonaire, Sint Eustatius og Saba" },
        { code: "BA", name: "Bosnia-Hercegovina" },
        { code: "BW", name: "Botswana" },
        { code: "BV", name: "Bouvetøya" },
        { code: "BR", name: "Brasil" },
        { code: "IO", name: "Det britiske territoriet i Indiahavet" },
        { code: "BN", name: "Brunei" },
        { code: "BG", name: "Bulgaria" },
        { code: "BF", name: "Burkina Faso" },
        { code: "BI", name: "Burundi" },
        { code: "CV", name: "Kapp Verde" },
        { code: "KH", name: "Kambodsja" },
        { code: "CM", name: "Kamerun" },
        { code: "CA", name: "Canada" },
        { code: "KY", name: "Caymanøyene" },
        { code: "CF", name: "Den sentralafrikanske republikk" },
        { code: "TD", name: "Tsjad" },
        { code: "CL", name: "Chile" },
        { code: "CN", name: "Kina" },
        { code: "CX", name: "Christmasøya" },
        { code: "CC", name: "Kokosøyene" },
        { code: "CO", name: "Colombia" },
        { code: "KM", name: "Komorene" },
        { code: "CD", name: "Kongo, Den demokratiske republikken" },
        { code: "CG", name: "Kongo" },
        { code: "CK", name: "Cookøyene" },
        { code: "CR", name: "Costa Rica" },
        { code: "CI", name: "Elfenbenskysten" },
        { code: "HR", name: "Kroatia" },
        { code: "CU", name: "Cuba" },
        { code: "CW", name: "Curaçao" },
        { code: "CY", name: "Kypros" },
        { code: "CZ", name: "Tsjekkia" },
        { code: "DK", name: "Danmark" },
        { code: "DJ", name: "Djibouti" },
        { code: "DM", name: "Dominica" },
        { code: "DO", name: "Den dominikanske republikk" },
        { code: "EC", name: "Ecuador" },
        { code: "EG", name: "Egypt" },
        { code: "SV", name: "El Salvador" },
        { code: "GQ", name: "Ekvatorial-Guinea" },
        { code: "ER", name: "Eritrea" },
        { code: "EE", name: "Estland" },
        { code: "SZ", name: "Eswatini" },
        { code: "ET", name: "Etiopia" },
        { code: "FK", name: "Falklandsøyene" },
        { code: "FO", name: "Færøyene" },
        { code: "FJ", name: "Fiji" },
        { code: "FI", name: "Finland" },
        { code: "FR", name: "Frankrike" },
        { code: "GF", name: "Fransk Guyana" },
        { code: "PF", name: "Fransk Polynesia" },
        { code: "TF", name: "De franske sørterritorier" },
        { code: "GA", name: "Gabon" },
        { code: "GM", name: "Gambia" },
        { code: "GE", name: "Georgia" },
        { code: "DE", name: "Tyskland" },
        { code: "GH", name: "Ghana" },
        { code: "GI", name: "Gibraltar" },
        { code: "GR", name: "Hellas" },
        { code: "GL", name: "Grønland" },
        { code: "GD", name: "Grenada" },
        { code: "GP", name: "Guadeloupe" },
        { code: "GU", name: "Guam" },
        { code: "GT", name: "Guatemala" },
        { code: "GG", name: "Guernsey" },
        { code: "GN", name: "Guinea" },
        { code: "GW", name: "Guinea-Bissau" },
        { code: "GY", name: "Guyana" },
        { code: "HT", name: "Haiti" },
        { code: "HM", name: "Heard- og McDonaldøyene" },
        { code: "VA", name: "Vatikanstaten" },
        { code: "HN", name: "Honduras" },
        { code: "HK", name: "Hongkong" },
        { code: "HU", name: "Ungarn" },
        { code: "IS", name: "Island" },
        { code: "IN", name: "India" },
        { code: "ID", name: "Indonesia" },
        { code: "IR", name: "Iran" },
        { code: "IQ", name: "Irak" },
        { code: "IE", name: "Irland" },
        { code: "IM", name: "Man" },
        { code: "IL", name: "Israel" },
        { code: "IT", name: "Italia" },
        { code: "JM", name: "Jamaica" },
        { code: "JP", name: "Japan" },
        { code: "JE", name: "Jersey" },
        { code: "JO", name: "Jordan" },
        { code: "KZ", name: "Kasakhstan" },
        { code: "KE", name: "Kenya" },
        { code: "KI", name: "Kiribati" },
        { code: "KP", name: "Nord-Korea" },
        { code: "KR", name: "Sør-Korea" },
        { code: "KW", name: "Kuwait" },
        { code: "KG", name: "Kirgisistan" },
        { code: "LA", name: "Laos" },
        { code: "LV", name: "Latvia" },
        { code: "LB", name: "Libanon" },
        { code: "LS", name: "Lesotho" },
        { code: "LR", name: "Liberia" },
        { code: "LY", name: "Libya" },
        { code: "LI", name: "Liechtenstein" },
        { code: "LT", name: "Litauen" },
        { code: "LU", name: "Luxembourg" },
        { code: "MO", name: "Macao" },
        { code: "MG", name: "Madagaskar" },
        { code: "MW", name: "Malawi" },
        { code: "MY", name: "Malaysia" },
        { code: "MV", name: "Maldivene" },
        { code: "ML", name: "Mali" },
        { code: "MT", name: "Malta" },
        { code: "MH", name: "Marshalløyene" },
        { code: "MQ", name: "Martinique" },
        { code: "MR", name: "Mauritania" },
        { code: "MU", name: "Mauritius" },
        { code: "YT", name: "Mayotte" },
        { code: "MX", name: "Mexico" },
        { code: "FM", name: "Mikronesiaføderasjonen" },
        { code: "MD", name: "Moldova" },
        { code: "MC", name: "Monaco" },
        { code: "MN", name: "Mongolia" },
        { code: "ME", name: "Montenegro" },
        { code: "MS", name: "Montserrat" },
        { code: "MA", name: "Marokko" },
        { code: "MZ", name: "Mosambik" },
        { code: "MM", name: "Myanmar" },
        { code: "NA", name: "Namibia" },
        { code: "NR", name: "Nauru" },
        { code: "NP", name: "Nepal" },
        { code: "NL", name: "Nederland" },
        { code: "NC", name: "Ny-Caledonia" },
        { code: "NZ", name: "New Zealand" },
        { code: "NI", name: "Nicaragua" },
        { code: "NE", name: "Niger" },
        { code: "NG", name: "Nigeria" },
        { code: "NU", name: "Niue" },
        { code: "NF", name: "Norfolkøya" },
        { code: "MP", name: "Nord-Marianene" },
        { code: "NO", name: "Norge" },
        { code: "OM", name: "Oman" },
        { code: "PK", name: "Pakistan" },
        { code: "PW", name: "Palau" },
        { code: "PS", name: "Palestina, Staten" },
        { code: "PA", name: "Panama" },
        { code: "PG", name: "Papua Ny-Guinea" },
        { code: "PY", name: "Paraguay" },
        { code: "PE", name: "Peru" },
        { code: "PH", name: "Filippinene" },
        { code: "PN", name: "Pitcairnøyene" },
        { code: "PL", name: "Polen" },
        { code: "PT", name: "Portugal" },
        { code: "PR", name: "Puerto Rico" },
        { code: "QA", name: "Qatar" },
        { code: "MK", name: "Nord-Makedonia" },
        { code: "RO", name: "Romania" },
        { code: "RU", name: "Russland" },
        { code: "RW", name: "Rwanda" },
        { code: "RE", name: "Réunion" },
        { code: "BL", name: "Saint-Barthélemy" },
        { code: "SH", name: "Saint Helena, Ascension og Tristan da Cunha" },
        { code: "KN", name: "Saint Kitts og Nevis" },
        { code: "LC", name: "Saint Lucia" },
        { code: "MF", name: "Saint-Martin" },
        { code: "PM", name: "Saint-Pierre og Miquelon" },
        { code: "VC", name: "Saint Vincent og Grenadinene" },
        { code: "WS", name: "Samoa" },
        { code: "SM", name: "San Marino" },
        { code: "ST", name: "São Tomé og Príncipe" },
        { code: "SA", name: "Saudi-Arabia" },
        { code: "SN", name: "Senegal" },
        { code: "RS", name: "Serbia" },
        { code: "SC", name: "Seychellene" },
        { code: "SL", name: "Sierra Leone" },
        { code: "SG", name: "Singapore" },
        { code: "SX", name: "Sint Maarten" },
        { code: "SK", name: "Slovakia" },
        { code: "SI", name: "Slovenia" },
        { code: "SB", name: "Salomonøyene" },
        { code: "SO", name: "Somalia" },
        { code: "ZA", name: "Sør-Afrika" },
        { code: "GS", name: "Sør-Georgia og Sør-Sandwichøyene" },
        { code: "SS", name: "Sør-Sudan" },
        { code: "ES", name: "Spania" },
        { code: "LK", name: "Sri Lanka" },
        { code: "SD", name: "Sudan" },
        { code: "SR", name: "Surinam" },
        { code: "SJ", name: "Svalbard og Jan Mayen" },
        { code: "SE", name: "Sverige" },
        { code: "CH", name: "Sveits" },
        { code: "SY", name: "Syria" },
        { code: "TW", name: "Taiwan" },
        { code: "TJ", name: "Tadsjikistan" },
        { code: "TZ", name: "Tanzania" },
        { code: "TH", name: "Thailand" },
        { code: "TL", name: "Øst-Timor" },
        { code: "TG", name: "Togo" },
        { code: "TK", name: "Tokelau" },
        { code: "TO", name: "Tonga" },
        { code: "TT", name: "Trinidad og Tobago" },
        { code: "TN", name: "Tunisia" },
        { code: "TR", name: "Tyrkia" },
        { code: "TM", name: "Turkmenistan" },
        { code: "TC", name: "Turks- og Caicosøyene" },
        { code: "TV", name: "Tuvalu" },
        { code: "UG", name: "Uganda" },
        { code: "UA", name: "Ukraina" },
        { code: "AE", name: "De forente arabiske emirater" },
        { code: "GB", name: "Storbritannia" },
        { code: "UM", name: "USAs ytre småøyer" },
        { code: "US", name: "USA" },
        { code: "UY", name: "Uruguay" },
        { code: "UZ", name: "Usbekistan" },
        { code: "VU", name: "Vanuatu" },
        { code: "VE", name: "Venezuela" },
        { code: "VN", name: "Vietnam" },
        { code: "VG", name: "Jomfruøyene (Storbritannia)" },
        { code: "VI", name: "Jomfruøyene (USA)" },
        { code: "WF", name: "Wallis og Futuna" },
        { code: "EH", name: "Vest-Sahara" },
        { code: "YE", name: "Jemen" },
        { code: "ZM", name: "Zambia" },
        { code: "ZW", name: "Zimbabwe" },
    ];

    // Handle employment buttons
    form.querySelectorAll(".employment-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const employmentType = e.target.dataset.employment;
            const currentStepElement = form.querySelector(`[data-step="${currentStep}"]`);
            const employmentContainer = currentStepElement.querySelector(".employment-container");
            const employmentTypeContainer = currentStepElement.querySelector(".employment-type-container");
            const nonEmploymentContainer = currentStepElement.querySelector(".non-employment-container");

            // Hide initial employment buttons
            employmentContainer.style.display = "none";

            // Show appropriate follow-up question
            if (employmentType === "fast") {
                employmentTypeContainer.style.display = "block";
            } else if (employmentType === "midlertidig" || employmentType === "selvstendig") {
                const employmentInput = currentStepElement.querySelector('input[name="EmploymentStatus"]');
                employmentInput.value = employmentType === "midlertidig" ? "Temporary" : "Entrepreneur";
                showEmployerQuestion();
            } else if (employmentType === "nei") {
                nonEmploymentContainer.style.display = "block";
            }
        });
    });

    // Handle employment type buttons (privat/offentlig)
    form.querySelectorAll(".employment-type-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const type = e.target.dataset.type;
            const currentStepElement = form.querySelector(`[data-step="${currentStep}"]`);
            const employmentInput = currentStepElement.querySelector('input[name="EmploymentStatus"]');
            const employmentTypeContainer = currentStepElement.querySelector(".employment-type-container");
            employmentInput.value = type;
            employmentTypeContainer.style.display = "none";
            showEmployerQuestion();
        });
    });

    // Handle employer name input
    form.querySelector('input[name="EmployerName"]')?.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            const nextBtn = this.parentElement.querySelector(".chat-next-btn");
            nextBtn.click();
        }
    });

    form.querySelector(".employer-container .chat-next-btn")?.addEventListener("click", function (e) {
        e.preventDefault();
        const currentStepElement = form.querySelector(`[data-step="${currentStep}"]`);
        const employerInput = currentStepElement.querySelector('input[name="EmployerName"]');
        const employerContainer = currentStepElement.querySelector(".employer-container");

        if (employerInput.value.trim()) {
            // Skjul arbeidsgiverfeltet
            employerContainer.style.display = "none";

            // Oppdater spørsmålsteksten
            const question = currentStepElement.querySelector(".chat-question");

            // Viktig: Lag en ny tekstnode med spørsmålet
            while (question.firstChild) {
                question.removeChild(question.firstChild);
            }
            question.appendChild(document.createTextNode("Hvor lenge har du vært ansatt?"));

            // Sørg for at spørsmålet er synlig
            question.style.display = "block";
            question.style.opacity = "1";
            question.style.visibility = "visible";
            question.style.position = "relative";
            question.classList.add("employment-question");
            question.classList.remove("fade-out");
            question.classList.remove("hidden");

            // Nullstill ansettelsesdato
            const employmentDateInput = currentStepElement.querySelector('input[name="EmploymentStatusSince"]');
            employmentDateInput.value = "";

            // Sørg for at fødselsnummer-steget IKKE vises
            const nextStep = document.querySelector(`.chat-step[data-step="${currentStep + 1}"]`);
            if (nextStep) {
                nextStep.style.display = "none";
                nextStep.classList.remove("active");
            }

            // Sørg for at alle andre containere er skjult
            currentStepElement.querySelectorAll(".chat-input-container").forEach((container) => {
                if (!container.classList.contains("employment-duration-container")) {
                    container.style.display = "none";
                }
            });

            // Vis ansettelsestid-containeren
            const durationContainer = currentStepElement.querySelector(".employment-duration-container");

            // Vent litt før vi viser ansettelsestid-valgene for å unngå race conditions
            setTimeout(() => {
                // Gjør spørsmålet synlig igjen for sikkerhetsskyld
                question.style.display = "block";
                question.style.opacity = "1";
                question.style.visibility = "visible";

                // Vis containeren med valgene
                durationContainer.style.display = "block";

                // Legg til event listeners på knappene
                addDurationButtonListeners();
            }, 50);
        }
    });

    // Helt ny funksjon for å legge til event listeners på duration-knappene
    function addDurationButtonListeners() {
        const currentStepElement = form.querySelector(`[data-step="${currentStep}"]`);
        const durationContainer = currentStepElement.querySelector(".employment-duration-container");

        // Sørg for at spørsmålet alltid vises sammen med valgene
        const question = currentStepElement.querySelector(".chat-question");
        question.classList.add("employment-question");

        // Kontroller at teksten er synlig
        question.style.display = "block";
        question.style.opacity = "1";
        question.style.visibility = "visible";

        // Sjekk at spørsmålet har riktig tekst
        if (!question.textContent || question.textContent.trim() === "") {
            while (question.firstChild) {
                question.removeChild(question.firstChild);
            }
            question.appendChild(document.createTextNode("Hvor lenge har du vært ansatt?"));
        }

        // Legg til event listeners på duration-knappene
        const durationButtons = durationContainer.querySelectorAll(".duration-btn");
        durationButtons.forEach((button) => {
            // Fjern eventuelle eksisterende event listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);

            // Legg til ny event listener
            newButton.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();

                const duration = this.dataset.duration;

                // Skjul durationContainer men ikke spørsmålet
                durationContainer.style.display = "none";

                // Håndter ulike lengder
                if (duration === "more-than-10") {
                    setEmploymentDate(10);
                    showEmploymentResponse();
                } else {
                    showYearQuestion(duration);
                }
            });
        });
    }

    function showEmployerQuestion() {
        const currentStepElement = form.querySelector(`[data-step="${currentStep}"]`);
        const employerContainer = currentStepElement.querySelector(".employer-container");
        employerContainer.style.display = "flex";
        employerContainer.querySelector("input").focus();
    }

    function showYearQuestion(durationRange) {
        const currentStepElement = form.querySelector(`[data-step="${currentStep}"]`);

        // Oppdater og vis spørsmålsteksten tydelig
        const question = currentStepElement.querySelector(".chat-question");

        // Viktig: Lag en ny tekstnode med spørsmålet
        while (question.firstChild) {
            question.removeChild(question.firstChild);
        }
        question.appendChild(document.createTextNode("Hvilket år begynte du hos din nåværende arbeidsgiver?"));

        // Sørg for at spørsmålet er synlig
        question.style.display = "block";
        question.style.opacity = "1";
        question.style.visibility = "visible";
        question.style.position = "relative";
        question.classList.add("employment-question");
        question.classList.remove("fade-out");
        question.classList.remove("hidden");

        // Skjul alle andre input containere
        currentStepElement.querySelectorAll(".chat-input-container").forEach((container) => {
            container.style.display = "none";
        });

        // Sørg for at fødselsnummer-steget IKKE vises
        const nextStep = document.querySelector(`.chat-step[data-step="${currentStep + 1}"]`);
        if (nextStep) {
            nextStep.style.display = "none";
            nextStep.classList.remove("active");
        }

        // Vis year-containeren
        const yearContainer = currentStepElement.querySelector(".employment-year-container");
        const yearButtons = yearContainer.querySelector(".year-buttons");
        yearButtons.innerHTML = ""; // Tøm eksisterende knapper

        // Bestem hvilke år som skal vises basert på valgt område
        const currentYear = new Date().getFullYear();
        let startYear, endYear;

        if (durationRange === "less-than-5") {
            // For "Mindre enn 5 år", vis år 0-4 år tilbake
            startYear = currentYear - 4;
            endYear = currentYear;
        } else if (durationRange === "5-to-10") {
            // For "Mellom 5 og 10 år", vis år 5-9 år tilbake
            startYear = currentYear - 9;
            endYear = currentYear - 5;
        }

        // Generer knapper for hvert år i det valgte området
        for (let year = endYear; year >= startYear; year--) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "employment-btn duration-btn";

            // Beregn hvor mange år tilbake dette er
            const yearsAgo = currentYear - year;

            // Sett knappetekst
            if (yearsAgo === 0) {
                button.textContent = "I år";
            } else if (yearsAgo === 1) {
                button.textContent = "I fjor";
            } else {
                button.textContent = year;
            }

            button.dataset.year = year;

            // Legg til event listener for hvert år
            button.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();

                // Skjul årContainer men ikke spørsmålet
                yearContainer.style.display = "none";

                // Lagre dato og vis respons
                setEmploymentDate(year);
                showEmploymentResponse();
            });

            yearButtons.appendChild(button);
        }

        // Vent litt før vi viser år-containeren for å unngå race conditions
        setTimeout(() => {
            // Gjør spørsmålet synlig igjen for sikkerhetsskyld
            question.style.display = "block";
            question.style.opacity = "1";
            question.style.visibility = "visible";

            // Vis containeren med valgene
            yearContainer.style.display = "block";
        }, 50);
    }

    function setEmploymentDate(yearOrDuration) {
        const currentStepElement = form.querySelector(`[data-step="${currentStep}"]`);
        const employmentDateInput = currentStepElement.querySelector('input[name="EmploymentStatusSince"]');

        let date;
        if (typeof yearOrDuration === "number" && yearOrDuration > 1000) {
            // If it's a year (greater than 1000)
            date = new Date(yearOrDuration, 0, 1);
        } else {
            // If it's duration in years
            date = new Date();
            date.setFullYear(date.getFullYear() - yearOrDuration);
            date.setMonth(0, 1);
        }

        date.setHours(12, 0, 0, 0); // Middag for å unngå timezone-problemer
        employmentDateInput.value = date.toISOString();
    }

    function showEmploymentResponse() {
        const currentStepElement = form.querySelector(`[data-step="${currentStep}"]`);
        const question = currentStepElement.querySelector(".chat-question");

        // Hent nødvendig data
        const employmentStatus = currentStepElement.querySelector('input[name="EmploymentStatus"]').value;
        const employerName = currentStepElement.querySelector('input[name="EmployerName"]').value;
        const employmentDateInput = currentStepElement.querySelector('input[name="EmploymentStatusSince"]');

        // Sjekk om vi har nødvendig data
        if (!employmentDateInput || !employmentDateInput.value) {
            console.error("Mangler ansettelsesdato");
            return; // Ikke gå videre hvis ansettelsesdato mangler
        }

        if (!employerName || !employerName.trim()) {
            console.error("Mangler arbeidsgivernavn");
            return; // Ikke gå videre hvis arbeidsgivernavn mangler
        }

        if (!employmentStatus || !employmentStatus.trim()) {
            console.error("Mangler ansettelsestype");
            return; // Ikke gå videre hvis ansettelsestype mangler
        }

        // Valider at datoen er gyldig
        const employmentDateObj = new Date(employmentDateInput.value);
        if (isNaN(employmentDateObj.getTime())) {
            console.error("Ugyldig ansettelsesdato");
            return;
        }

        // Sjekk at datoen ikke er i fremtiden
        const today = new Date();
        if (employmentDateObj > today) {
            console.error("Ansettelsesdato kan ikke være i fremtiden");
            return;
        }

        console.log(
            "Alle data er på plass, går videre:",
            "ansettelsesdato:",
            employmentDateInput.value,
            "arbeidsgivernavn:",
            employerName,
            "ansettelsestype:",
            employmentStatus
        );

        // Konverter datoen
        const employmentDate = new Date(employmentDateInput.value);

        // Formater datoen til ISO 8601 format med tidssone
        const formattedDate = employmentDate.toISOString();
        console.log("Formatert ansettelsesdato:", formattedDate);

        // Oversett ansettelsestype til norsk
        let statusText;
        switch (employmentStatus) {
            case "Permanent":
                statusText = "Fast ansatt (privat)";
                break;
            case "PermanentPublic":
                statusText = "Fast ansatt (offentlig)";
                break;
            case "Temporary":
                statusText = "Midlertidig ansatt";
                break;
            case "Entrepreneur":
                statusText = "Selvstendig næringsdrivende";
                break;
            default:
                statusText = employmentStatus;
        }

        console.log("Ansettelsesinformasjon:", {
            status: statusText,
            arbeidsgiver: employerName,
            dato: formattedDate,
        });

        // Skjul alle input containere
        currentStepElement.querySelectorAll(".chat-input-container").forEach((container) => {
            container.style.display = "none";
        });

        // Lag og vis responsen
        const responseWrapper = document.createElement("div");
        responseWrapper.className = "chat-response-wrapper";

        const icon = document.createElement("div");
        icon.className = "chat-response-icon";
        icon.innerHTML = "✓";

        const response = document.createElement("div");
        response.className = "chat-response";

        // Vis år i stedet for dato
        const yearText = employmentDate.getFullYear();
        response.textContent = `${statusText} hos ${employerName} siden ${yearText}`;

        responseWrapper.appendChild(icon);
        responseWrapper.appendChild(response);
        currentStepElement.appendChild(responseWrapper);

        // Vis responsen med fade in
        responseWrapper.style.opacity = "1";

        // Etter 2 sekunder, fade ut både spørsmål og respons
        setTimeout(() => {
            if (question) {
                question.classList.add("fade-out");
            }
            if (responseWrapper) {
                responseWrapper.style.opacity = "0";
            }

            // Etter fade-animasjon er ferdig, skjul elementer og vis neste steg
            setTimeout(() => {
                if (question) {
                    question.style.display = "none";
                    question.classList.remove("active");
                    question.classList.remove("employment-question");
                }
                if (responseWrapper) {
                    responseWrapper.style.display = "none";
                }
                if (currentStepElement) {
                    currentStepElement.style.minHeight = "0";
                }

                // Kontroller at vi faktisk har all data vi trenger
                if (employmentDateInput && employmentDateInput.value && employerName && employmentStatus) {
                    console.log("Går til neste steg (brutto årsinntekt)");
                    // Forbered neste steg
                    const incomeStep = form.querySelector(`[data-step="6"]`);
                    if (incomeStep) {
                        const incomeQuestion = incomeStep.querySelector(".chat-question");
                        if (incomeQuestion) {
                            incomeQuestion.style.display = "block";
                            incomeQuestion.style.opacity = "1";
                            incomeQuestion.style.visibility = "visible";
                        }
                    }
                    // Gå til neste steg (brutto årsinntekt)
                    showStep(currentStep + 1);
                } else {
                    console.error("Kritisk feil: Mangler fortsatt nødvendig data for å gå videre");
                }
            }, 300);
        }, 2000);
    }

    // Handle non-employment buttons
    form.querySelectorAll(".non-employment-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const type = e.target.dataset.type;
            const currentStepElement = form.querySelector(`[data-step="${currentStep}"]`);
            const employmentInput = currentStepElement.querySelector('input[name="EmploymentStatus"]');
            employmentInput.value = type;

            // Remove required attribute from EmployerName and clear its value
            const employerNameInput = form.querySelector('input[name="EmployerName"]');
            if (employerNameInput) {
                employerNameInput.required = false;
                employerNameInput.value = "";
            }

            // Clear EmploymentStatusSince input and remove required if necessary
            const employmentDateInput = currentStepElement.querySelector('input[name="EmploymentStatusSince"]');
            if (employmentDateInput) {
                employmentDateInput.value = ""; // Clear any previous date
                employmentDateInput.required = false; // Ensure it's not required
            }

            const displayText = e.target.textContent;

            const responseWrapper = document.createElement("div");
            responseWrapper.className = "chat-response-wrapper";

            const icon = document.createElement("div");
            icon.className = "chat-response-icon";
            icon.innerHTML = "✓";

            const response = document.createElement("div");
            response.className = "chat-response";
            response.textContent = displayText;

            responseWrapper.appendChild(icon);
            responseWrapper.appendChild(response);
            currentStepElement.appendChild(responseWrapper);

            // Hide all input containers
            currentStepElement.querySelectorAll(".chat-input-container").forEach((container) => {
                container.style.display = "none";
            });

            // Show the response with a fade in
            responseWrapper.style.opacity = "1";

            // Logg data for feilsøking
            console.log("Non-employment valgt:", "type:", type, "ansettelsesdato:", employmentDateInput.value);

            // After x seconds, fade out both question and response
            setTimeout(() => {
                const question = currentStepElement.querySelector(".chat-question");
                question.classList.add("fade-out");
                question.classList.remove("employment-question"); // Fjern denne klassen
                responseWrapper.style.opacity = "0";

                // After fade animation completes, hide elements and show next step
                setTimeout(() => {
                    question.style.display = "none";
                    question.classList.remove("active");
                    responseWrapper.style.display = "none";
                    currentStepElement.style.minHeight = "0";

                    // Kontroller at vi faktisk har verdi for ansettelsestype. Dato er ikke påkrevd for ikke-ansatte
                    if (employmentInput.value) {
                        console.log("Går til neste steg (brutto årsinntekt) fra non-employment");

                        // Forbered neste steg
                        const incomeStep = form.querySelector(`[data-step="6"]`);
                        if (incomeStep) {
                            const incomeQuestion = incomeStep.querySelector(".chat-question");
                            incomeQuestion.style.display = "block";
                            incomeQuestion.style.opacity = "1";
                            incomeQuestion.style.visibility = "visible";
                        }

                        showStep(currentStep + 1);
                    } else {
                        console.error("Kritisk feil: Mangler ansettelsestype for non-employment");
                    }
                }, 300);
            }, 700);
        });
    });
}
