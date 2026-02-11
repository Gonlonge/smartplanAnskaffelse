import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
    getAllTenders,
    getInvitationsForSupplier,
    deleteTender,
} from "../api/tenderService";
import { getProjectById } from "../api/projectService";
import { useAuth } from "../contexts/AuthContext";
import { filterAndSortTenders } from "../utils/tenderFilters";

/**
 * Custom hook for Tenders page state management
 * Handles loading tenders, project cache, filtering, sorting, and deletion
 */
export const useTendersPage = () => {
    const { user } = useAuth();
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [projectFilter, setProjectFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [projectCache, setProjectCache] = useState({});
    // Ref to track current cache for use in effects without dependency issues
    const projectCacheRef = useRef({});

    // Delete state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tenderToDelete, setTenderToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);

    // Extract fetch logic to reusable function
    const fetchTenders = useCallback(async () => {
        if (user?.role === "sender") {
            return await getAllTenders();
        } else if (user?.role === "receiver" && user?.id) {
            return await getInvitationsForSupplier(user.id, user.email);
        }
        return [];
    }, [user?.role, user?.id, user?.email]);

    // Get all tenders from Firebase
    useEffect(() => {
        const loadTenders = async () => {
            setLoading(true);

            try {
                const fetchedTenders = await fetchTenders();
                setTenders(fetchedTenders);
            } catch (error) {
                console.error("Error loading tenders:", error);
                setTenders([]);
            }

            setLoading(false);
        };

        loadTenders();

        // Refresh when window regains focus (user navigates back to this tab)
        const handleFocus = () => {
            loadTenders();
        };

        window.addEventListener("focus", handleFocus);

        return () => {
            window.removeEventListener("focus", handleFocus);
        };
    }, [fetchTenders]);

    // Keep ref in sync with state
    useEffect(() => {
        projectCacheRef.current = projectCache;
    }, [projectCache]);

    // Load project names for display
    useEffect(() => {
        const loadProjects = async () => {
            const projectIds = [
                ...new Set(tenders.map((t) => t.projectId).filter(Boolean)),
            ];
            // Use ref to get latest cache value without dependency issues
            const currentCache = projectCacheRef.current;
            const newCache = { ...currentCache };
            let hasChanges = false;

            for (const projectId of projectIds) {
                if (!newCache[projectId]) {
                    try {
                        const project = await getProjectById(projectId);
                        if (project) {
                            newCache[projectId] = project;
                            hasChanges = true;
                        }
                    } catch (error) {
                        console.error(
                            `Failed to load project ${projectId}:`,
                            error
                        );
                        // Set fallback to prevent repeated failed requests
                        newCache[projectId] = { id: projectId, name: "Ukjent" };
                        hasChanges = true;
                    }
                }
            }

            // Only update state if cache actually changed
            if (hasChanges) {
                setProjectCache(newCache);
            }
        };

        if (tenders.length > 0) {
            loadProjects();
        }
    }, [tenders]); // projectCache removed from dependencies - using ref instead

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);

        try {
            const fetchedTenders = await fetchTenders();
            setTenders(fetchedTenders);
        } catch (error) {
            console.error("Error refreshing tenders:", error);
        }

        setRefreshing(false);
    }, [fetchTenders]);

    const handleDeleteClick = useCallback((tender, e) => {
        if (e) {
            e.stopPropagation();
        }
        setTenderToDelete(tender);
        setDeleteDialogOpen(true);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!tenderToDelete) return;

        setDeleting(true);
        setErrorMessage("");

        try {
            const result = await deleteTender(tenderToDelete.id);

            if (!result.success) {
                setErrorMessage(
                    result.error || "Kunne ikke slette Anskaffelse. Prøv igjen."
                );
                setShowErrorSnackbar(true);
                return;
            }

            // Remove from list
            setTenders((prev) =>
                prev.filter((t) => t.id !== tenderToDelete.id)
            );
            setDeleteDialogOpen(false);
            setTenderToDelete(null);
            setSuccessMessage("Anskaffelse slettet!");
            setShowSuccessSnackbar(true);
        } catch (error) {
            setErrorMessage("Kunne ikke slette Anskaffelse. Prøv igjen.");
            setShowErrorSnackbar(true);
        } finally {
            setDeleting(false);
        }
    }, [tenderToDelete]);

    const handleDeleteCancel = useCallback(() => {
        setDeleteDialogOpen(false);
        setTenderToDelete(null);
    }, []);

    // Filter and sort tenders
    const filteredAndSortedTenders = useMemo(
        () =>
            filterAndSortTenders(
                tenders,
                searchQuery,
                statusFilter,
                projectFilter,
                sortBy,
                projectCache
            ),
        [tenders, searchQuery, statusFilter, projectFilter, sortBy, projectCache]
    );

    // Check if user can delete (admin or sender role)
    const canDelete = user?.isAdmin || user?.role === "sender";

    return {
        // Data
        tenders,
        filteredAndSortedTenders,
        projectCache,
        loading,
        refreshing,
        canDelete,

        // Filters
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        projectFilter,
        setProjectFilter,
        sortBy,
        setSortBy,

        // Actions
        handleRefresh,
        handleDeleteClick,
        handleDeleteConfirm,
        handleDeleteCancel,

        // Delete state
        deleteDialogOpen,
        tenderToDelete,
        deleting,

        // Messages
        successMessage,
        showSuccessSnackbar,
        setShowSuccessSnackbar,
        errorMessage,
        showErrorSnackbar,
        setShowErrorSnackbar,
    };
};

