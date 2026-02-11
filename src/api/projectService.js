/**
 * Project Service
 * Handles creating and retrieving projects from Firestore
 */

import { getDocument, getCollection, createDocument, updateDocument, queryHelpers } from '../services/firestore';

/**
 * Create a new project
 * @param {Object} projectData - Project data from form
 * @param {Object} user - Current user object
 * @returns {Promise<{success: boolean, project?: object, error?: string}>}
 */
export const createProject = async (projectData, user) => {
    try {
        // Validate required fields
        if (!projectData.name || !projectData.name.trim()) {
            return {
                success: false,
                error: "Prosjektnavn er påkrevd",
            };
        }

        // Create project object
        // Use companyId if available, otherwise use user's ID as fallback
        const ownerCompanyId = user.companyId || user.id;
        const newProject = {
            name: projectData.name.trim(),
            description: projectData.description?.trim() || "",
            ownerId: user.id,
            ownerCompanyId: ownerCompanyId,
            createdAt: new Date(),
            status: projectData.status || "active",
        };

        console.log('[createProject] Creating project with:', {
            ownerId: user.id,
            ownerCompanyId: ownerCompanyId,
            userCompanyId: user.companyId,
            project: newProject
        });

        // Create in Firestore
        const createdProject = await createDocument('projects', newProject);
        
        console.log('[createProject] Created project:', createdProject);

        return {
            success: true,
            project: createdProject,
        };
    } catch (error) {
        console.error("Error creating project:", error);
        return {
            success: false,
            error: "Kunne ikke opprette prosjekt. Prøv igjen.",
        };
    }
};

/**
 * Get all projects
 * @param {string} companyId - Optional company ID to filter by
 * @param {string} status - Optional status to filter by ('active', 'archived', etc.)
 * @returns {Promise<Array>} Array of projects
 */
export const getAllProjects = async (companyId = null, status = null) => {
    try {
        const constraints = [];
        
        if (companyId) {
            constraints.push(queryHelpers.where('ownerCompanyId', '==', companyId));
        }
        
        if (status) {
            constraints.push(queryHelpers.where('status', '==', status));
        }
        
        // Order by createdAt descending (newest first)
        constraints.push(queryHelpers.orderBy('createdAt', 'desc'));
        
        const projects = await getCollection('projects', constraints);
        return projects;
    } catch (error) {
        console.error("Error getting projects:", error);
        return [];
    }
};

/**
 * Get project by ID
 * @param {string} projectId - Project ID
 * @returns {Promise<Object|null>} Project object or null
 */
export const getProjectById = async (projectId) => {
    try {
        if (!projectId) return null;
        const project = await getDocument('projects', projectId);
        return project;
    } catch (error) {
        console.error("Error getting project:", error);
        return null;
    }
};

/**
 * Get projects by company ID
 * @param {string} companyId - Company ID
 * @param {string} status - Optional status filter (default: 'active')
 * @returns {Promise<Array>} Array of projects for the company
 */
export const getProjectsByCompany = async (companyId, status = 'active') => {
    try {
        if (!companyId) return [];
        
        // Query with only one where clause to avoid needing composite index
        // Filter by status in memory instead
        const constraints = [
            queryHelpers.where('ownerCompanyId', '==', companyId),
        ];
        
        let projects = await getCollection('projects', constraints);
        
        // Filter by status in memory
        if (status) {
            projects = projects.filter(project => project.status === status);
        }
        
        // Sort by createdAt descending in memory
        projects.sort((a, b) => {
            const dateA = a.createdAt?.getTime?.() || (a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime()) || 0;
            const dateB = b.createdAt?.getTime?.() || (b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime()) || 0;
            return dateB - dateA;
        });
        
        console.log(`[getProjectsByCompany] Querying with companyId: ${companyId}, status: ${status}, found ${projects.length} projects`);
        return projects;
    } catch (error) {
        console.error("Error getting projects by company:", error);
        return [];
    }
};

/**
 * Get projects by owner ID (user ID)
 * @param {string} ownerId - Owner/User ID
 * @param {string} status - Optional status filter (default: 'active')
 * @returns {Promise<Array>} Array of projects owned by the user
 */
export const getProjectsByOwner = async (ownerId, status = 'active') => {
    try {
        if (!ownerId) return [];
        
        // Query with only one where clause to avoid needing composite index
        // Filter by status in memory instead
        const constraints = [
            queryHelpers.where('ownerId', '==', ownerId),
        ];
        
        let projects = await getCollection('projects', constraints);
        
        // Filter by status in memory
        if (status) {
            projects = projects.filter(project => project.status === status);
        }
        
        // Sort by createdAt descending in memory
        projects.sort((a, b) => {
            const dateA = a.createdAt?.getTime?.() || (a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime()) || 0;
            const dateB = b.createdAt?.getTime?.() || (b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime()) || 0;
            return dateB - dateA;
        });
        
        console.log(`[getProjectsByOwner] Querying with ownerId: ${ownerId}, status: ${status}, found ${projects.length} projects`);
        return projects;
    } catch (error) {
        console.error("Error getting projects by owner:", error);
        return [];
    }
};

/**
 * Update a project
 * @param {string} projectId - Project ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{success: boolean, project?: object, error?: string}>}
 */
export const updateProject = async (projectId, updates) => {
    try {
        const updatedProject = await updateDocument('projects', projectId, updates);
        return {
            success: true,
            project: updatedProject,
        };
    } catch (error) {
        console.error("Error updating project:", error);
        return {
            success: false,
            error: "Kunne ikke oppdatere prosjekt. Prøv igjen.",
        };
    }
};

/**
 * Delete a project (hard delete)
 * @param {string} projectId - Project ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteProject = async (projectId) => {
    try {
        const { deleteDocument } = await import('../services/firestore');
        await deleteDocument('projects', projectId);
        return { success: true };
    } catch (error) {
        console.error("Error deleting project:", error);
        return {
            success: false,
            error: "Kunne ikke slette prosjekt. Prøv igjen.",
        };
    }
};

