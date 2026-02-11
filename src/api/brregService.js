/**
 * Brønnøysundregistrene (BrREG) Service
 * Handles company lookup by organization number
 *
 * Uses the official Brønnøysundregistrene API:
 * https://data.brreg.no/enhetsregisteret/api/
 * Documentation: https://www.brreg.no/en/use-of-data-from-the-bronnoysund-register-centre/datasets-and-api/data-about-organisations/
 */

/**
 * Search for company by organization number from Brønnøysundregistrene
 * @param {string} orgNumber - Organization number (9 digits)
 * @returns {Promise<{success: boolean, company?: object, error?: string}>}
 */
export const searchCompanyByOrgNumber = async (orgNumber) => {
    // Validate input
    if (!orgNumber || orgNumber.length !== 9) {
        return {
            success: false,
            error: "Organisasjonsnummer må være 9 siffer",
        };
    }

    // Remove any non-numeric characters
    const cleanOrgNumber = orgNumber.replace(/\D/g, "");

    if (cleanOrgNumber.length !== 9) {
        return {
            success: false,
            error: "Organisasjonsnummer må være 9 siffer",
        };
    }

    try {
        // Call the actual Brønnøysundregistrene API
        const response = await fetch(
            `https://data.brreg.no/enhetsregisteret/api/enheter/${cleanOrgNumber}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                return {
                    success: false,
                    error: `Ingen bedrift funnet med organisasjonsnummer ${cleanOrgNumber}`,
                };
            }
            return {
                success: false,
                error: "Kunne ikke hente data fra Brønnøysundregistrene. Prøv igjen senere.",
            };
        }

        const data = await response.json();

        // Extract all available company information from API response
        // The API returns data in Norwegian format
        const companyName = data.navn?.navneform || data.navn || "";
        
        // Business address
        const businessAddress = data.forretningsadresse;
        const address = businessAddress?.adresse 
            ? (Array.isArray(businessAddress.adresse) 
                ? businessAddress.adresse.join(", ") 
                : businessAddress.adresse)
            : "";
        const postCode = businessAddress?.postnummer || "";
        const city = businessAddress?.poststed || "";
        const country = businessAddress?.land || "Norge";
        
        // Postal address (if different from business address)
        const postalAddress = data.postadresse;
        const postalAddressLine = postalAddress?.adresse
            ? (Array.isArray(postalAddress.adresse)
                ? postalAddress.adresse.join(", ")
                : postalAddress.adresse)
            : "";
        const postalPostCode = postalAddress?.postnummer || "";
        const postalCity = postalAddress?.poststed || "";
        
        // Organization form
        const companyForm = data.organisasjonsform;
        const companyFormCode = companyForm?.kode || "";
        const companyFormDescription = companyForm?.beskrivelse || "";
        
        // Dates
        const registrationDate = data.stiftelsesdato || "";
        const registrationAuthority = data.registreringsdatoEnhetsregisteret || "";
        
        // Status
        const status = data.registrertIMvaregisteret ? "Registrert i MVA-registeret" : "";
        const underLiquidation = data.underAvvikling || false;
        const underBankruptcy = data.underTvangsavviklingEllerTvangsopplosning || false;
        
        // Industry codes (NACE codes)
        const industryCodes = data.naeringskode1 
            ? [{
                code: data.naeringskode1?.kode || "",
                description: data.naeringskode1?.beskrivelse || ""
            }]
            : [];
        if (data.naeringskode2) {
            industryCodes.push({
                code: data.naeringskode2?.kode || "",
                description: data.naeringskode2?.beskrivelse || ""
            });
        }
        if (data.naeringskode3) {
            industryCodes.push({
                code: data.naeringskode3?.kode || "",
                description: data.naeringskode3?.beskrivelse || ""
            });
        }

        return {
            success: true,
            company: {
                id: `company_${cleanOrgNumber}`,
                name: companyName,
                orgNumber: cleanOrgNumber,
                type: "receiver", // Default to receiver (supplier)
                // Address information
                address: address,
                postCode: postCode,
                city: city,
                country: country,
                fullAddress: address ? `${address}, ${postCode} ${city}` : "",
                // Postal address (if different)
                postalAddress: postalAddressLine,
                postalPostCode: postalPostCode,
                postalCity: postalCity,
                postalFullAddress: postalAddressLine ? `${postalAddressLine}, ${postalPostCode} ${postalCity}` : "",
                // Organization form
                companyFormCode: companyFormCode,
                companyFormDescription: companyFormDescription,
                // Dates
                registrationDate: registrationDate,
                registrationAuthority: registrationAuthority,
                // Status
                status: status,
                underLiquidation: underLiquidation,
                underBankruptcy: underBankruptcy,
                // Industry codes
                industryCodes: industryCodes,
                // Additional raw data for future use
                rawData: data,
            },
        };
    } catch (error) {
        console.error("Error fetching from Brønnøysundregistrene:", error);

        return {
            success: false,
            error: "Kunne ikke hente data fra Brønnøysundregistrene. Sjekk internettforbindelsen din.",
        };
    }
};

/**
 * Search for companies by name
 * @param {string} name - Company name to search for
 * @returns {Promise<{success: boolean, companies?: Array, error?: string}>}
 */
export const searchCompaniesByName = async (name) => {
    if (!name || name.trim().length < 2) {
        return {
            success: false,
            error: "Navn må være minst 2 tegn",
        };
    }

    try {
        const response = await fetch(
            `https://data.brreg.no/enhetsregisteret/api/enheter?navn=${encodeURIComponent(name)}&size=10`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            }
        );

        if (!response.ok) {
            return {
                success: false,
                error: "Kunne ikke søke i Brønnøysundregistrene. Prøv igjen senere.",
            };
        }

        const data = await response.json();
        const companies = (data._embedded?.enheter || []).map((company) => ({
            id: `company_${company.organisasjonsnummer}`,
            name: company.navn,
            orgNumber: company.organisasjonsnummer,
            type: "receiver",
            address: company.forretningsadresse?.adresse?.join(", ") || "",
            postCode: company.forretningsadresse?.postnummer || "",
            city: company.forretningsadresse?.poststed || "",
        }));

        return {
            success: true,
            companies,
        };
    } catch (error) {
        console.error("Error searching Brønnøysundregistrene:", error);
        return {
            success: false,
            error: "Kunne ikke søke i Brønnøysundregistrene. Sjekk internettforbindelsen din.",
        };
    }
};
