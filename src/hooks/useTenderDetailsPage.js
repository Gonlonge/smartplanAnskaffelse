import { useState, useEffect, useCallback } from "react";
import { getTenderById } from "../api/tenderService";
import { getProjectById } from "../api/projectService";
import { getUserProfile } from "../api/authService";

/**
 * Custom hook for TenderDetails page state management
 * Handles loading tender, project, and user data
 */
export const useTenderDetailsPage = (tenderId) => {
    const [tender, setTender] = useState(null);
    const [project, setProject] = useState(null);
    const [createdByUser, setCreatedByUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // FIXED: Wrapped in useCallback to prevent unnecessary re-renders and fix dependency warning
    const loadTender = useCallback(async () => {
        if (!tenderId) {
            setTender(null);
            setProject(null);
            setCreatedByUser(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const foundTender = await getTenderById(tenderId);
            if (foundTender) {
                // Ensure bids have proper structure
                foundTender.bids = (foundTender.bids || []).map((bid) => ({
                    ...bid,
                    priceStructure: bid.priceStructure || "fastpris",
                    hourlyRate: bid.hourlyRate || null,
                    estimatedHours: bid.estimatedHours || null,
                }));

                // Ensure awardedAt is a Date object if it exists
                if (foundTender.awardedAt) {
                    foundTender.awardedAt =
                        foundTender.awardedAt instanceof Date
                            ? foundTender.awardedAt
                            : new Date(foundTender.awardedAt);
                }

                // Ensure Q&A dates are properly converted
                foundTender.qa = (foundTender.qa || []).map((qa) => ({
                    ...qa,
                    askedAt: qa.askedAt
                        ? qa.askedAt instanceof Date
                            ? qa.askedAt
                            : new Date(qa.askedAt)
                        : null,
                    answeredAt: qa.answeredAt
                        ? qa.answeredAt instanceof Date
                            ? qa.answeredAt
                            : new Date(qa.answeredAt)
                        : null,
                }));

                // Load project
                if (foundTender.projectId) {
                    try {
                        const projectData = await getProjectById(foundTender.projectId);
                        setProject(projectData);
                    } catch (error) {
                        console.error("Error loading project:", error);
                        setProject(null);
                    }
                } else {
                    setProject(null);
                }

                // Load created by user
                if (foundTender.createdBy) {
                    try {
                        const userData = await getUserProfile(foundTender.createdBy);
                        setCreatedByUser(userData);
                    } catch (error) {
                        console.error("Error loading user:", error);
                        setCreatedByUser(null);
                    }
                } else {
                    setCreatedByUser(null);
                }
            }
            setTender(foundTender);
        } catch (error) {
            console.error("Error loading tender:", error);
            setTender(null);
            setProject(null);
            setCreatedByUser(null);
        } finally {
            setLoading(false);
        }
    }, [tenderId]);

    useEffect(() => {
        loadTender();
    }, [loadTender]);

    return {
        tender,
        setTender,
        project,
        createdByUser,
        loading,
        loadTender,
    };
};

export default useTenderDetailsPage;

