import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

/**
 * Format date for display
 */
const formatDate = (date) => {
    if (!date) return "N/A";
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString("no-NO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
};

/**
 * Format currency for display
 */
const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat("no-NO", {
        style: "currency",
        currency: "NOK",
    }).format(amount);
};

/**
 * Export tenders to PDF
 */
export const exportTendersToPDF = (tenders, projectCache = {}) => {
    const doc = new jsPDF();
    const margin = 20;
    let yPos = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Anskaffelser - Eksport", margin, yPos);
    yPos += 10;

    // Date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
        `Eksportert: ${formatDate(new Date())}`,
        margin,
        yPos
    );
    yPos += 15;

    // Table data
    const tableData = tenders.map((tender) => {
        const project = projectCache[tender.projectId];
        return [
            tender.title || "N/A",
            project?.name || "Ukjent",
            tender.contractStandard || "N/A",
            formatDate(tender.deadline),
            tender.status || "N/A",
            tender.bids?.length || 0,
            formatCurrency(tender.price),
        ];
    });

    // Create table
    doc.autoTable({
        startY: yPos,
        head: [
            [
                "Tittel",
                "Prosjekt",
                "Kontraktstandard",
                "Frist",
                "Status",
                "Tilbud",
                "Pris",
            ],
        ],
        body: tableData,
        theme: "striped",
        headStyles: {
            fillColor: [233, 30, 99],
            textColor: 255,
            fontStyle: "bold",
        },
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        margin: { top: yPos, left: margin, right: margin },
    });

    // Save PDF
    const fileName = `anskaffelser_${formatDate(new Date()).replace(/\//g, "-")}.pdf`;
    doc.save(fileName);
};

/**
 * Export tenders to Excel
 */
export const exportTendersToExcel = (tenders, projectCache = {}) => {
    const data = tenders.map((tender) => {
        const project = projectCache[tender.projectId];
        return {
            Tittel: tender.title || "N/A",
            Beskrivelse: tender.description || "",
            Prosjekt: project?.name || "Ukjent",
            "Kontraktstandard": tender.contractStandard || "N/A",
            Frist: formatDate(tender.deadline),
            Status: tender.status || "N/A",
            Tilbud: tender.bids?.length || 0,
            Pris: tender.price || "",
            "Opprettet": formatDate(tender.createdAt),
            "Publisert": formatDate(tender.publishDate),
        };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Anskaffelser");

    // Auto-size columns
    const colWidths = [
        { wch: 30 }, // Tittel
        { wch: 40 }, // Beskrivelse
        { wch: 20 }, // Prosjekt
        { wch: 18 }, // Kontraktstandard
        { wch: 12 }, // Frist
        { wch: 12 }, // Status
        { wch: 10 }, // Tilbud
        { wch: 15 }, // Pris
        { wch: 12 }, // Opprettet
        { wch: 12 }, // Publisert
    ];
    ws["!cols"] = colWidths;

    const fileName = `anskaffelser_${formatDate(new Date()).replace(/\//g, "-")}.xlsx`;
    XLSX.writeFile(wb, fileName);
};

/**
 * Export projects to PDF
 */
export const exportProjectsToPDF = (projects) => {
    const doc = new jsPDF();
    const margin = 20;
    let yPos = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Prosjekter - Eksport", margin, yPos);
    yPos += 10;

    // Date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Eksportert: ${formatDate(new Date())}`, margin, yPos);
    yPos += 15;

    // Table data
    const tableData = projects.map((project) => [
        project.name || "N/A",
        project.description || "Ingen beskrivelse",
        formatDate(project.createdAt),
        project.status || "active",
    ]);

    // Create table
    doc.autoTable({
        startY: yPos,
        head: [["Navn", "Beskrivelse", "Opprettet", "Status"]],
        body: tableData,
        theme: "striped",
        headStyles: {
            fillColor: [233, 30, 99],
            textColor: 255,
            fontStyle: "bold",
        },
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        margin: { top: yPos, left: margin, right: margin },
    });

    // Save PDF
    const fileName = `prosjekter_${formatDate(new Date()).replace(/\//g, "-")}.pdf`;
    doc.save(fileName);
};

/**
 * Export projects to Excel
 */
export const exportProjectsToExcel = (projects) => {
    const data = projects.map((project) => ({
        Navn: project.name || "N/A",
        Beskrivelse: project.description || "",
        "Opprettet": formatDate(project.createdAt),
        Status: project.status || "active",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Prosjekter");

    // Auto-size columns
    const colWidths = [
        { wch: 30 }, // Navn
        { wch: 50 }, // Beskrivelse
        { wch: 12 }, // Opprettet
        { wch: 12 }, // Status
    ];
    ws["!cols"] = colWidths;

    const fileName = `prosjekter_${formatDate(new Date()).replace(/\//g, "-")}.xlsx`;
    XLSX.writeFile(wb, fileName);
};

/**
 * Export bid comparison to PDF
 */
export const exportBidComparisonToPDF = (tender, bids, project) => {
    const doc = new jsPDF();
    const margin = 20;
    let yPos = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Tilbudssammenligning", margin, yPos);
    yPos += 10;

    // Tender info
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(tender.title || "N/A", margin, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Prosjekt: ${project?.name || "Ukjent"}`, margin, yPos);
    yPos += 5;
    doc.text(`Frist: ${formatDate(tender.deadline)}`, margin, yPos);
    yPos += 5;
    doc.text(`Status: ${tender.status || "N/A"}`, margin, yPos);
    yPos += 10;

    // Date
    doc.text(`Eksportert: ${formatDate(new Date())}`, margin, yPos);
    yPos += 15;

    // Sort bids by price
    const sortedBids = [...bids].sort((a, b) => {
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        return priceA - priceB;
    });

    // Table data
    const tableData = sortedBids.map((bid, index) => [
        index + 1,
        bid.companyName || "Ukjent",
        formatCurrency(bid.price),
        bid.priceStructure || "N/A",
        bid.hourlyRate ? formatCurrency(bid.hourlyRate) : "N/A",
        bid.estimatedHours || "N/A",
        formatDate(bid.submittedAt),
        bid.status || "submitted",
    ]);

    // Create table
    doc.autoTable({
        startY: yPos,
        head: [
            [
                "#",
                "Leverandør",
                "Pris",
                "Prisstruktur",
                "Timepris",
                "Est. timer",
                "Innsendt",
                "Status",
            ],
        ],
        body: tableData,
        theme: "striped",
        headStyles: {
            fillColor: [233, 30, 99],
            textColor: 255,
            fontStyle: "bold",
        },
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        margin: { top: yPos, left: margin, right: margin },
    });

    // Summary
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Sammendrag", margin, finalY);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Totalt antall tilbud: ${bids.length}`, margin, finalY + 7);
    
    if (sortedBids.length > 0) {
        const lowestBid = sortedBids[0];
        const highestBid = sortedBids[sortedBids.length - 1];
        doc.text(
            `Laveste tilbud: ${formatCurrency(lowestBid.price)} (${lowestBid.companyName})`,
            margin,
            finalY + 12
        );
        doc.text(
            `Høyeste tilbud: ${formatCurrency(highestBid.price)} (${highestBid.companyName})`,
            margin,
            finalY + 17
        );
    }

    // Save PDF
    const fileName = `tilbudssammenligning_${tender.title?.replace(/[^a-z0-9]/gi, "_") || "anskaffelse"}_${formatDate(new Date()).replace(/\//g, "-")}.pdf`;
    doc.save(fileName);
};

/**
 * Export bid comparison to Excel
 */
export const exportBidComparisonToExcel = (tender, bids, project) => {
    // Sort bids by price
    const sortedBids = [...bids].sort((a, b) => {
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        return priceA - priceB;
    });

    const data = sortedBids.map((bid, index) => ({
        "#": index + 1,
        Leverandør: bid.companyName || "Ukjent",
        Pris: bid.price || "",
        Prisstruktur: bid.priceStructure || "N/A",
        Timepris: bid.hourlyRate || "",
        "Est. timer": bid.estimatedHours || "",
        Innsendt: formatDate(bid.submittedAt),
        Status: bid.status || "submitted",
        Notater: bid.notes || "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tilbud");

    // Add summary sheet
    const summaryData = [
        { "": "Sammendrag", "": "" },
        { "": "Anskaffelse", "": tender.title || "N/A" },
        { "": "Prosjekt", "": project?.name || "Ukjent" },
        { "": "Frist", "": formatDate(tender.deadline) },
        { "": "Status", "": tender.status || "N/A" },
        { "": "", "": "" },
        { "": "Totalt antall tilbud", "": bids.length },
    ];

    if (sortedBids.length > 0) {
        const lowestBid = sortedBids[0];
        const highestBid = sortedBids[sortedBids.length - 1];
        summaryData.push({ "": "Laveste tilbud", "": formatCurrency(lowestBid.price) });
        summaryData.push({ "": "Leverandør (laveste)", "": lowestBid.companyName || "Ukjent" });
        summaryData.push({ "": "Høyeste tilbud", "": formatCurrency(highestBid.price) });
        summaryData.push({ "": "Leverandør (høyeste)", "": highestBid.companyName || "Ukjent" });
    }

    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Sammendrag");

    // Auto-size columns
    const colWidths = [
        { wch: 5 },  // #
        { wch: 25 }, // Leverandør
        { wch: 15 }, // Pris
        { wch: 15 }, // Prisstruktur
        { wch: 12 }, // Timepris
        { wch: 12 }, // Est. timer
        { wch: 12 }, // Innsendt
        { wch: 12 }, // Status
        { wch: 40 }, // Notater
    ];
    ws["!cols"] = colWidths;

    const fileName = `tilbudssammenligning_${tender.title?.replace(/[^a-z0-9]/gi, "_") || "anskaffelse"}_${formatDate(new Date()).replace(/\//g, "-")}.xlsx`;
    XLSX.writeFile(wb, fileName);
};

