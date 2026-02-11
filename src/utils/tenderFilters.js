/**
 * Utility functions for filtering and sorting tenders
 */

/**
 * Filter and sort tenders based on search query, status, project, and sort criteria
 * @param {Array} tenders - Array of tender objects
 * @param {string} searchQuery - Search query string
 * @param {string} statusFilter - Status filter value ('all' or specific status)
 * @param {string} projectFilter - Project filter value ('all' or project ID)
 * @param {string} sortBy - Sort criteria ('newest', 'oldest', 'deadline-asc', 'deadline-desc', 'title-asc', 'title-desc')
 * @param {Object} projectCache - Cache of project objects keyed by project ID
 * @returns {Array} Filtered and sorted tenders
 */
export const filterAndSortTenders = (
    tenders,
    searchQuery,
    statusFilter,
    projectFilter,
    sortBy,
    projectCache
) => {
    let filtered = [...tenders];

    // Search filter
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
            (tender) =>
                tender.title.toLowerCase().includes(query) ||
                tender.description?.toLowerCase().includes(query) ||
                projectCache[tender.projectId]?.name
                    ?.toLowerCase()
                    .includes(query)
        );
    }

    // Status filter
    if (statusFilter !== "all") {
        filtered = filtered.filter(
            (tender) => tender.status === statusFilter
        );
    }

    // Project filter
    if (projectFilter !== "all") {
        filtered = filtered.filter(
            (tender) => tender.projectId === projectFilter
        );
    }

    // Sort
    filtered.sort((a, b) => {
        switch (sortBy) {
            case "newest":
                return new Date(b.createdAt) - new Date(a.createdAt);
            case "oldest":
                return new Date(a.createdAt) - new Date(b.createdAt);
            case "deadline-asc":
                return new Date(a.deadline) - new Date(b.deadline);
            case "deadline-desc":
                return new Date(b.deadline) - new Date(a.deadline);
            case "title-asc":
                return a.title.localeCompare(b.title, "no");
            case "title-desc":
                return b.title.localeCompare(a.title, "no");
            default:
                return 0;
        }
    });

    return filtered;
};

