/**
 * Notification Context
 * Provides real-time notification state management
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import {
    getNotificationsForUser,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadNotificationCount,
} from "../api/notificationService";
import { useCollection } from "../hooks/useFirestore";
import { queryHelpers } from "../hooks/useFirestore";

const NotificationContext = createContext(null);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error(
            "useNotifications must be used within a NotificationProvider"
        );
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Real-time listener for notifications
    // Use only where clause to avoid composite index requirement, sort in memory
    const constraints = user
        ? [queryHelpers.where("userId", "==", user.id)]
        : [];

    const {
        data: notificationsData,
        loading: notificationsLoading,
        error: notificationsError,
    } = useCollection("notifications", constraints);

    // Update notifications when data changes - FIXED: Removed duplicate unread count calculation
    useEffect(() => {
        if (notificationsData) {
            // Sort by createdAt descending (newest first) in memory
            const sorted = [...notificationsData].sort((a, b) => {
                const dateA =
                    a.createdAt?.getTime?.() ||
                    (a.createdAt instanceof Date
                        ? a.createdAt.getTime()
                        : new Date(a.createdAt).getTime()) ||
                    0;
                const dateB =
                    b.createdAt?.getTime?.() ||
                    (b.createdAt instanceof Date
                        ? b.createdAt.getTime()
                        : new Date(b.createdAt).getTime()) ||
                    0;
                return dateB - dateA;
            });
            // Limit to 50 most recent
            const limited = sorted.slice(0, 50);
            setNotifications(limited);
            // Calculate unread count once here (removed duplicate calculation)
            const unread = limited.filter((n) => !n.read).length;
            setUnreadCount(unread);
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
        setLoading(notificationsLoading);
    }, [notificationsData, notificationsLoading]);

    // Mark notification as read - FIXED: Update unread count when marking as read
    const markAsRead = useCallback(
        async (notificationId) => {
            try {
                const result = await markNotificationAsRead(notificationId);
                if (result.success) {
                    // Update local state optimistically
                    setNotifications((prev) => {
                        const updated = prev.map((n) =>
                            n.id === notificationId
                                ? { ...n, read: true, readAt: new Date() }
                                : n
                        );
                        // Update unread count
                        const unread = updated.filter((n) => !n.read).length;
                        setUnreadCount(unread);
                        return updated;
                    });
                }
                return result;
            } catch (error) {
                console.error("Error marking notification as read:", error);
                return { success: false, error: error.message };
            }
        },
        []
    );

    // Mark all notifications as read - FIXED: Update unread count
    const markAllAsRead = useCallback(async () => {
        try {
            if (!user) return { success: false, error: "Not authenticated" };

            const result = await markAllNotificationsAsRead(user.id);
            if (result.success) {
                // Update local state optimistically
                setNotifications((prev) =>
                    prev.map((n) => ({
                        ...n,
                        read: true,
                        readAt: new Date(),
                    }))
                );
                // Update unread count to 0
                setUnreadCount(0);
            }
            return result;
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            return { success: false, error: error.message };
        }
    }, [user]);

    // Delete notification - FIXED: Update unread count when deleting
    const removeNotification = useCallback(async (notificationId) => {
        try {
            const result = await deleteNotification(notificationId);
            if (result.success) {
                // Update local state optimistically
                setNotifications((prev) => {
                    const updated = prev.filter((n) => n.id !== notificationId);
                    // Update unread count
                    const unread = updated.filter((n) => !n.read).length;
                    setUnreadCount(unread);
                    return updated;
                });
            }
            return result;
        } catch (error) {
            console.error("Error deleting notification:", error);
            return { success: false, error: error.message };
        }
    }, []);

    // Refresh notifications - FIXED: Update unread count when refreshing
    const refreshNotifications = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const fetchedNotifications = await getNotificationsForUser(user.id, {
                limit: 50,
            });
            setNotifications(fetchedNotifications);
            // Update unread count
            const unread = fetchedNotifications.filter((n) => !n.read).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error("Error refreshing notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const value = {
        notifications,
        unreadCount,
        loading,
        error: notificationsError,
        markAsRead,
        markAllAsRead,
        removeNotification,
        refreshNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

