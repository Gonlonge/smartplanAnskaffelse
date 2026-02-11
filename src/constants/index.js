/**
 * Constants and configuration values for Smartplan Procurement
 *
 * Static data that is not dependent on Firebase or backend
 */

// Trade categories for suppliers (bygg/anlegg)
export const TRADE_CATEGORIES = [
    { value: "tømrer", label: "Tømrer" },
    { value: "elektro", label: "Elektro" },
    { value: "vvs", label: "VVS" },
    { value: "mur", label: "Mur" },
    { value: "maling", label: "Maling" },
    { value: "gulv", label: "Gulv" },
    { value: "tak", label: "Tak" },
    { value: "rørlegger", label: "Rørlegger" },
    { value: "anlegg", label: "Anlegg" },
    { value: "betong", label: "Betong" },
    { value: "isolasjon", label: "Isolasjon" },
    { value: "glass", label: "Glass" },
];

// Price structure types
export const PRICE_STRUCTURE_TYPES = [
    { value: "fastpris", label: "Fastpris" },
    { value: "timepris", label: "Timepris" },
    { value: "estimat", label: "Estimat" },
];

// Contract standards (NS 84xx series)
export const CONTRACT_STANDARDS = [
    { value: "NS8405", label: "NS 8405 - Totalentreprise" },
    { value: "NS8406", label: "NS 8406 - Utførelsesentreprise" },
    { value: "NS8407", label: "NS 8407 - Totalentreprise" },
];

// Tender status options
export const TENDER_STATUS = {
    DRAFT: "draft",
    OPEN: "open",
    CLOSED: "closed",
    AWARDED: "awarded",
};

// Bid status options
export const BID_STATUS = {
    SUBMITTED: "submitted",
    EVALUATED: "evaluated",
    AWARDED: "awarded",
    REJECTED: "rejected",
};

// User roles
export const USER_ROLES = {
    SENDER: "sender",
    RECEIVER: "receiver",
};

// Standstill period configuration (in days)
// Default is 10 days for Norwegian public procurement
export const STANDSTILL_PERIOD_DAYS = 10;

// Routes
export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    DASHBOARD: "/dashboard",
    TENDERS: "/tenders",
    TENDER_CREATE: "/tenders/create",
    TENDER_DETAILS: "/tenders/:id",
    TENDER_BID: "/tenders/:id/bid",
    TENDER_CONTRACT: "/tenders/:id/contract",
    PROJECTS: "/projects",
    PROJECT_CREATE: "/projects/create",
    PROJECT_DETAILS: "/projects/:id",
    INVITATIONS: "/invitations",
    COMPLIANCE: "/compliance",
};

// Compliance page data
export { COMPLIANCE_ITEMS, CODE_EXAMPLES, TEST_CATEGORIES } from "./complianceData";
