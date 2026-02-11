import {
    createProject,
    getProjectById,
    getAllProjects,
    getProjectsByCompany,
} from "../../api/projectService";
import {
    createErrorResult,
    createSuccessResult,
} from "./testHelpers";

/**
 * Run project tests
 */
export const runProjectTests = async (
    results,
    setTestProgress,
    user
) => {
    // Create project
    setTestProgress(25);
    let testProjectId = null;
    try {
        const projectResult = await createProject(
            {
                name: "Test Prosjekt - " + new Date().toISOString(),
                description: "Dette er et testprosjekt",
                status: "active",
            },
            user
        );

        if (projectResult.success && projectResult.project) {
            testProjectId = projectResult.project.id;
            results.push(
                createSuccessResult(
                    "Opprette nytt prosjekt",
                    `Prosjekt opprettet: ${testProjectId}`
                )
            );
        } else {
            results.push(
                createErrorResult(
                    "Opprette nytt prosjekt",
                    projectResult.error || "Kunne ikke opprette prosjekt"
                )
            );
        }
    } catch (error) {
        results.push(
            createErrorResult("Opprette nytt prosjekt", error)
        );
    }

    // Get project by ID
    setTestProgress(50);
    if (testProjectId) {
        try {
            const retrievedProject = await getProjectById(testProjectId);
            if (
                retrievedProject &&
                retrievedProject.id === testProjectId
            ) {
                results.push(
                    createSuccessResult(
                        "Hente prosjekt etter ID",
                        `Prosjekt hentet: ${retrievedProject.name}`
                    )
                );
            } else {
                results.push(
                    createErrorResult(
                        "Hente prosjekt etter ID",
                        "Kunne ikke hente prosjekt"
                    )
                );
            }
        } catch (error) {
            results.push(
                createErrorResult("Hente prosjekt etter ID", error)
            );
        }
    }

    // Get all projects
    setTestProgress(75);
    try {
        const allProjects = await getAllProjects();
        if (Array.isArray(allProjects) && allProjects.length > 0) {
            results.push(
                createSuccessResult(
                    "Hente alle prosjekter",
                    `${allProjects.length} prosjekter funnet`
                )
            );
        } else {
            results.push(
                createSuccessResult(
                    "Hente alle prosjekter",
                    "Ingen prosjekter funnet (tomt resultat er OK)"
                )
            );
        }
    } catch (error) {
        results.push(createErrorResult("Hente alle prosjekter", error));
    }

    // Get projects by company
    setTestProgress(100);
    if (user?.companyId) {
        try {
            const companyProjects = await getProjectsByCompany(
                user.companyId
            );
            if (Array.isArray(companyProjects)) {
                results.push(
                    createSuccessResult(
                        "Hente prosjekter etter selskap",
                        `${companyProjects.length} prosjekter for selskapet`
                    )
                );
            } else {
                results.push(
                    createErrorResult(
                        "Hente prosjekter etter selskap",
                        "Ugyldig resultat"
                    )
                );
            }
        } catch (error) {
            results.push(
                createErrorResult("Hente prosjekter etter selskap", error)
            );
        }
    } else {
        results.push(
            createErrorResult(
                "Hente prosjekter etter selskap",
                "Ingen selskap ID tilgjengelig"
            )
        );
    }
};






