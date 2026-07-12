import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const INK = [25, 25, 25];
const MUTED = [95, 95, 88];
const VOLT = [198, 244, 50];
const LIGHT = [245, 245, 239];
const BORDER = [218, 218, 208];

const money = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const number = (value, digits = 0) => Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: digits });

function drawHeader(doc, generatedAt) {
    doc.setFillColor(...INK);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setFillColor(...VOLT);
    doc.rect(14, 10, 3, 3, 'F');
    doc.setTextColor(245, 245, 239);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('TRANSITOPS', 21, 13.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 172);
    doc.text('FLEET PERFORMANCE REPORT', 14, 23);
    doc.text(`Generated ${generatedAt}`, 196, 23, { align: 'right' });
}

function drawKpi(doc, x, y, width, label, value) {
    doc.setFillColor(...LIGHT);
    doc.setDrawColor(...BORDER);
    doc.roundedRect(x, y, width, 20, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(label.toUpperCase(), x + 4, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...INK);
    doc.text(String(value), x + 4, y + 15);
}

export function exportFleetPdf({ data, perVehicle, fleetStatusData, expensesByCategory, generatedBy }) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const now = new Date();
    const generatedAt = now.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const filenameDate = now.toISOString().slice(0, 10);

    const totalVehicles = fleetStatusData.reduce((sum, item) => sum + Number(item.value), 0);
    const totalFuel = perVehicle.reduce((sum, vehicle) => sum + vehicle.fuel_cost, 0);
    const totalMaintenance = perVehicle.reduce((sum, vehicle) => sum + vehicle.maintenance_cost, 0);
    const totalDistance = perVehicle.reduce((sum, vehicle) => sum + vehicle.total_distance, 0);
    const totalLiters = perVehicle.reduce((sum, vehicle) => sum + vehicle.fuel_liters, 0);
    const totalExpenses = expensesByCategory.reduce((sum, item) => sum + Number(item.value), 0);
    const efficiency = totalLiters > 0 ? totalDistance / totalLiters : 0;
    const totalTrackedCost = totalFuel + totalMaintenance + totalExpenses;
    const utilization = Number(data.fleetUtilizationPct || 0);
    const mostExpensive = [...perVehicle].sort((a, b) => (b.fuel_cost + b.maintenance_cost) - (a.fuel_cost + a.maintenance_cost))[0];
    const mostEfficient = [...perVehicle].filter((item) => item.fuel_liters > 0).sort((a, b) => (b.total_distance / b.fuel_liters) - (a.total_distance / a.fuel_liters))[0];

    drawHeader(doc, generatedAt);
    doc.setTextColor(...INK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('Fleet performance overview', 14, 44);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(`Prepared for ${generatedBy || 'TransitOps user'}  |  Operational data available as of ${generatedAt}`, 14, 51);

    drawKpi(doc, 14, 59, 43, 'Fleet size', number(totalVehicles));
    drawKpi(doc, 60, 59, 43, 'Utilization', `${number(utilization, 1)}%`);
    drawKpi(doc, 106, 59, 43, 'Tracked cost', money(totalTrackedCost));
    drawKpi(doc, 152, 59, 44, 'Fuel efficiency', `${number(efficiency, 1)} km/L`);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...INK);
    doc.text('Executive summary', 14, 91);
    const insights = [
        `The fleet currently has ${number(totalVehicles)} vehicles, with ${number(data.vehicles.onTrip)} on trip and ${number(data.vehicles.inShop)} in maintenance.`,
        `Recorded vehicle cost totals ${money(totalFuel + totalMaintenance)}: ${money(totalFuel)} fuel and ${money(totalMaintenance)} maintenance.`,
        totalDistance > 0 ? `Completed trip distance totals ${number(totalDistance, 1)} km across ${number(totalLiters, 1)} logged liters.` : 'Trip distance or fuel volume is not yet sufficient for a fleet-wide efficiency conclusion.',
        mostExpensive ? `${mostExpensive.registration_number} has the highest tracked fuel and maintenance cost at ${money(mostExpensive.fuel_cost + mostExpensive.maintenance_cost)}.` : 'No per-vehicle cost records are available yet.',
        mostEfficient ? `${mostEfficient.registration_number} leads recorded fuel efficiency at ${number(mostEfficient.total_distance / mostEfficient.fuel_liters, 1)} km/L.` : 'No vehicle has enough fuel and distance data for efficiency ranking yet.',
    ];
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    insights.forEach((insight, index) => {
        const y = 100 + index * 9;
        doc.setFillColor(...VOLT);
        doc.circle(16, y - 1.2, 1, 'F');
        doc.setTextColor(...MUTED);
        doc.text(doc.splitTextToSize(insight, 174), 21, y);
    });

    autoTable(doc, {
        startY: 148,
        head: [['Fleet status', 'Vehicles', 'Share']],
        body: fleetStatusData.map((item) => [item.name, number(item.value), totalVehicles ? `${number((item.value / totalVehicles) * 100, 1)}%` : '0%']),
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 8, cellPadding: 3, lineColor: BORDER, lineWidth: 0.2 },
        headStyles: { fillColor: INK, textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14, right: 14 },
    });

    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 9,
        head: [['Expense category', 'Amount', 'Share']],
        body: expensesByCategory.length ? expensesByCategory.map((item) => [item.name, money(item.value), totalExpenses ? `${number((item.value / totalExpenses) * 100, 1)}%` : '0%']) : [['No expenses logged', '-', '-']],
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 8, cellPadding: 3, lineColor: BORDER, lineWidth: 0.2 },
        headStyles: { fillColor: INK, textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14, right: 14 },
    });

    doc.addPage();
    drawHeader(doc, generatedAt);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...INK);
    doc.text('Vehicle operating detail', 14, 43);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text('Fuel, maintenance, distance, and derived efficiency by vehicle.', 14, 49);

    autoTable(doc, {
        startY: 56,
        head: [['Vehicle', 'Fuel cost', 'Fuel (L)', 'Maintenance', 'Distance (km)', 'Efficiency', 'Total cost']],
        body: perVehicle.length ? perVehicle.map((vehicle) => [
            vehicle.registration_number,
            money(vehicle.fuel_cost),
            number(vehicle.fuel_liters, 1),
            money(vehicle.maintenance_cost),
            number(vehicle.total_distance, 1),
            vehicle.fuel_liters > 0 ? `${number(vehicle.total_distance / vehicle.fuel_liters, 1)} km/L` : '-',
            money(vehicle.fuel_cost + vehicle.maintenance_cost),
        ]) : [['No vehicle cost data', '-', '-', '-', '-', '-', '-']],
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 7.2, cellPadding: 2.3, lineColor: BORDER, lineWidth: 0.15, overflow: 'linebreak' },
        headStyles: { fillColor: INK, textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: LIGHT },
        columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' } },
        margin: { top: 34, left: 10, right: 10, bottom: 16 },
    });

    const pages = doc.getNumberOfPages();
    for (let page = 1; page <= pages; page += 1) {
        doc.setPage(page);
        doc.setDrawColor(...BORDER);
        doc.line(14, 285, 196, 285);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...MUTED);
        doc.text('TransitOps confidential operational report', 14, 290);
        doc.text(`Page ${page} of ${pages}`, 196, 290, { align: 'right' });
    }

    doc.save(`transitops-fleet-report-${filenameDate}.pdf`);
}
