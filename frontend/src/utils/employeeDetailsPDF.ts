import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { Employee } from "@/types";

// ─── COLOR PALETTE: Green + Orange + White only ───────────────────────────────
const GREEN = [34, 197, 94] as const; // main headers
const GREEN_DARK = [22, 163, 74] as const; // accents / footer
const ORANGE = [249, 115, 22] as const; // sub-section headers
const ORANGE_DARK = [220, 90, 10] as const; // left accent on orange
const GREEN_LIGHT = [240, 253, 244] as const; // zebra row bg
const WHITE = [255, 255, 255] as const;
const TEXT_DARK = [20, 20, 20] as const;
const TEXT_MID = [80, 80, 80] as const;
const TEXT_LIGHT = [130, 130, 130] as const;

// ─── HEADER (page 1 only) ────────────────────────────────────────────────────
function addHeader(doc: jsPDF, pageWidth: number, margin: number) {
  // Main green bar
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pageWidth, 34, "F");

  // Bottom darker stripe
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 30, pageWidth, 4, "F");

  // Left orange accent bar
  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, 5, 34, "F");

  doc.setTextColor(...WHITE);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("SARTHI HRMS ", margin + 4, 16);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("urbancruise@company.com  ·  www.hrmsportal.com", margin + 4, 26);

  // Confidential tag — orange tint text
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 220, 180);
  doc.text("CONFIDENTIAL", pageWidth - margin, 20, { align: "right" });
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function addFooter(
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  pageNum: number,
  totalPages: number,
) {
  // Green footer bar
  doc.setFillColor(...GREEN);
  doc.rect(0, pageHeight - 16, pageWidth, 16, "F");

  // Orange left accent
  doc.setFillColor(...ORANGE);
  doc.rect(0, pageHeight - 16, 5, 16, "F");

  doc.setTextColor(...WHITE);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text("Confidential — HRMS Enterprise Suite", margin + 4, pageHeight - 5);

  doc.setFont("helvetica", "bold");
  doc.text(
    `Generated: ${format(new Date(), "dd MMM yyyy")}`,
    pageWidth / 2,
    pageHeight - 5,
    { align: "center" },
  );

  doc.setFont("helvetica", "normal");
  doc.text(
    `Page ${pageNum} of ${totalPages}`,
    pageWidth - margin,
    pageHeight - 5,
    {
      align: "right",
    },
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export function generateEmployeeProfilePDF(employee: Employee) {
  const doc = new jsPDF();
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 0;

  const FOOTER_HEIGHT = 18;
  const SAFE_BTM_MARGIN = 4;

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - FOOTER_HEIGHT - SAFE_BTM_MARGIN) {
      doc.addPage();
      y = 20;
    }
  };

  /* ── PAGE 1 HEADER ── */
  addHeader(doc, pageWidth, margin);
  y = 42;

  // Page title
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEXT_DARK);
  doc.text("EMPLOYEE PROFILE REPORT", pageWidth / 2, y, { align: "center" });

  y += 6;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_LIGHT);
  doc.text(
    `Generated on: ${format(new Date(), "dd MMMM yyyy, hh:mm a")}`,
    pageWidth / 2,
    y,
    { align: "center" },
  );

  /* ── NAME CARD ── */
  y += 8;

  // Shadow
  doc.setFillColor(180, 230, 195);
  doc.roundedRect(margin + 1, y - 3, pageWidth - margin * 2, 16, 3, 3, "F");
  // Card bg — light green
  doc.setFillColor(220, 248, 230);
  doc.roundedRect(margin, y - 4, pageWidth - margin * 2, 16, 3, 3, "F");
  // Left green accent
  doc.setFillColor(...GREEN);
  doc.roundedRect(margin, y - 4, 4, 16, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...GREEN_DARK);
  doc.text(`${employee.firstName} ${employee.lastName}`, margin + 10, y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_MID);
  doc.text(
    `${employee.employeeId}  ·  ${employee.subDepartment_name}  ·  ${employee.department_name}`,
    pageWidth - margin - 4,
    y + 5,
    { align: "right" },
  );

  y += 20;

  /* ── GREEN MAIN HEADER ── */
  const addMainHeader = (title: string) => {
    checkPageBreak(18);
    y += 3;

    doc.setFillColor(...GREEN);
    doc.roundedRect(margin, y - 3, pageWidth - margin * 2, 11, 2, 2, "F");

    // White notch divider
    doc.setFillColor(...WHITE);
    doc.rect(margin + 10, y - 3, 2, 11, "F");

    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(title, margin + 16, y + 4.5);

    y += 14;
  };

  /* ── ORANGE SUB-SECTION ── */
  const addSection = (
    title: string,
    fields: [string, string | undefined][],
  ) => {
    const rows = Math.ceil(fields.length / 4);
    const estHeight = 12 + rows * 16 + 6;
    checkPageBreak(estHeight);

    // Orange header bar
    doc.setFillColor(...ORANGE);
    doc.rect(margin, y - 2, pageWidth - margin * 2, 9, "F");
    // Darker left accent
    doc.setFillColor(...ORANGE_DARK);
    doc.rect(margin, y - 2, 3, 9, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...WHITE);
    doc.text(title, margin + 7, y + 4);

    y += 11;

    const colWidth = (pageWidth - margin * 2) / 4;
    let x = margin;
    let maxRowHeight = 0;
    let rowIndex = 0;

    fields.forEach(([label, value], index) => {
      if (index % 4 === 0) {
        checkPageBreak(16);
        x = margin;
        maxRowHeight = 0;

        // Zebra row — light green bg on even rows
        if (rowIndex % 2 === 0) {
          doc.setFillColor(...GREEN_LIGHT);
          doc.rect(margin, y - 1, pageWidth - margin * 2, 15, "F");
        }
        rowIndex++;
      }

      const colMaxWidth = colWidth - 6;

      // Label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...TEXT_MID);
      doc.text(label, x + 3, y + 3);

      // Value — wrapped
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...TEXT_DARK);
      const wrapped = doc.splitTextToSize(String(value || "—"), colMaxWidth);
      doc.text(wrapped, x + 3, y + 8);

      const cellH = 8 + wrapped.length * 5;
      if (cellH > maxRowHeight) maxRowHeight = cellH;

      x += colWidth;

      if (index % 4 === 3) {
        // Row separator — light orange tint
        doc.setDrawColor(255, 200, 160);
        doc.line(
          margin,
          y + maxRowHeight + 1,
          pageWidth - margin,
          y + maxRowHeight + 1,
        );
        y += maxRowHeight + 4;
        maxRowHeight = 0;
      }
    });

    if (fields.length % 4 !== 0) {
      doc.setDrawColor(255, 200, 160);
      doc.line(
        margin,
        y + maxRowHeight + 1,
        pageWidth - margin,
        y + maxRowHeight + 1,
      );
      y += maxRowHeight + 4;
    }

    y += 5;
  };

  /* ── DECLARATION BLOCK ── */
  function addDeclarationBlock(title: string, text: string) {
    const padding = 7;
    const textWidth = pageWidth - margin * 2 - padding * 2;

    checkPageBreak(30);

    // Orange header (same as sub-section)
    doc.setFillColor(...ORANGE);
    doc.rect(margin, y - 2, pageWidth - margin * 2, 9, "F");
    doc.setFillColor(...ORANGE_DARK);
    doc.rect(margin, y - 2, 3, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...WHITE);
    doc.text(title, margin + 7, y + 4);
    y += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...TEXT_DARK);

    const wrapped = doc.splitTextToSize(text || "—", textWidth);
    const lineHeight = 5;
    const boxHeight = wrapped.length * lineHeight + padding * 2;

    checkPageBreak(boxHeight + 6);

    // Box — light green bg, green border
    doc.setDrawColor(...GREEN_DARK);
    doc.setFillColor(...GREEN_LIGHT);
    doc.roundedRect(margin, y, pageWidth - margin * 2, boxHeight, 3, 3, "FD");

    // Green left accent bar
    doc.setFillColor(...GREEN);
    doc.rect(margin, y, 3, boxHeight, "F");

    doc.text(wrapped, margin + padding + 2, y + padding + 3);

    y += boxHeight + 8;
  }

  /* ══════════════════════════════════════════
     CONTENT SECTIONS
  ══════════════════════════════════════════ */

  addMainHeader("PERSONAL");

  addSection("PERSONAL INFORMATION", [
    ["Full Name", `${employee.firstName} ${employee.lastName}`],
    [
      "Date of Birth",
      employee.dateOfBirth
        ? format(new Date(employee.dateOfBirth), "dd MMM yyyy")
        : undefined,
    ],
    ["Gender", employee.gender],
    ["Marital Status", employee.maritalStatus],
    ["Blood Group", employee.bloodGroup],
  ]);

  addSection("CONTACT INFORMATION", [
    ["Office Contact", employee.officeNumber],
    ["Office Email", employee.officeEmail],
    ["Personal Email", employee.personalEmail],
    ["Mobile No.", employee.mobile],
    ["Alternate Number", employee.alternateNumber],
  ]);

  addSection("ADDRESS INFORMATION", [
    ["Permanent Address", employee.permanentAddress],
    ["Permanent City", employee.permanentCity],
    ["Permanent State", employee.permanentState],
    ["Permanent Pincode", employee.permanentPincode],
    ["Current Address", employee.currentAddress],
    ["Current City", employee.currentCity],
    ["Current State", employee.currentState],
    ["Current Pincode", employee.currentPincode],
  ]);

  addSection("FAMILY DETAILS", [
    ["Father Name", employee.fatherName],
    ["Relation", employee.fatherRelation],
    ["Contact Number", employee.fatherContact],
    ["Occupation", employee.fatherOccupation],
    ["Mother Name", employee.motherName],
    ["Relation", employee.motherRelation],
    ["Contact Number", employee.motherContact],
    ["Occupation", employee.motherOccupation],
    ["Spouse Name", employee.spouseName],
    ["Relation", employee.spouseRelation],
    ["Contact Number", employee.spouseContact],
    ["Occupation", employee.spouseOccupation],
    ["Sibling Name", employee.siblingName],
    ["Relation", employee.siblingRelation],
    ["Contact Number", employee.siblingContact],
    ["Occupation", employee.siblingOccupation],
  ]);

  if (Array.isArray(employee.education) && employee.education.length > 0) {
    addMainHeader("EDUCATION");
    employee.education.forEach((edu: any) => {
      addSection(`EDUCATION — ${edu.qualificationTypes || "Qualification"}`, [
        ["Qualification Type", edu.qualificationTypes],
        ["Qualification", edu.qualification],
        ["Institute / University", edu.institute],
        ["Location", edu.location],
        ["City", edu.city],
        ["Year of Passing", edu.yearOfPassing],
        ["Percentage / CGPA", edu.cgpa],
        ["Currently Pursuing?", edu.pursuing ? "Yes" : "No"],
        ["Education Left (Yrs)", edu.educationLeft],
        ["Current Status", edu.currentYear],
        ["School Name", edu.schoolName],
        ["Board", edu.board],
      ]);
    });
  }

  addMainHeader("EMPLOYMENT");

  addSection("EMPLOYMENT DETAILS", [
    ["Employee ID", employee.employeeId],
    ["Department", employee.department_name],
    ["Designation", employee.subDepartment_name],
    ["Role", employee.role_name],
    ["Reporting Manager", employee.manager_firstName],
    ["HR Manager", employee.hrManager],
    ["Employment Type", employee.employmentType],
    ["Employee Status", employee.employeeStatus],
    ["Joining Date", employee.joiningDate],
    ["Probation Tenure", employee.probationTenure],
    ["Notice Period", employee.noticePeriod],
    ["Work Location", employee.workLocation],
    ["Branch Office", employee.branchOffice],
    ["Office City", employee.officeCity],
    ["Work Shift", employee.workShift],
    ["Shift Timing", employee.shiftTiming],
    ["Weekly Off", employee.weeklyoff],
    [
      "CTC (₹)",
      employee.ctc ? `₹${Number(employee.ctc).toLocaleString()}` : undefined,
    ],
    [
      "Basic Salary (₹)",
      employee.basicSalary
        ? `₹${Number(employee.basicSalary).toLocaleString()}`
        : undefined,
    ],
  ]);

  if (Array.isArray(employee.experience) && employee.experience.length > 0) {
    addMainHeader("EXPERIENCE");
    employee.experience.forEach((exp: any) => {
      addSection("PREVIOUS EXPERIENCE", [
        ["Previous Company", exp.previousCompany],
        ["Job Title", exp.jobTitle],
        ["Duration", exp.duration],
        [
          "Last Salary",
          exp.lastSalary
            ? `₹${Number(exp.lastSalary).toLocaleString()}`
            : undefined,
        ],
        ["Joining Date", exp.joiningDate],
        ["Relieving Date", exp.relievingDate],
        ["Company Location", exp.reasonforLeaving],
        ["Reference Name", exp.referenceName],
        ["Reference Role", exp.referenceRoll],
        ["Reference Contact", exp.referenceContact],
      ]);
    });
  }

  addMainHeader("DECLARATIONS");
  addDeclarationBlock(
    "Commitment Declaration",
    employee.commitmentDeclarationAccepted,
  );
  addDeclarationBlock(
    "Information Declaration",
    employee.informationDeclarationAccepted,
  );

  /* ── SIGNATURE SECTION ── */
  checkPageBreak(50);
  y += 8;

  // Divider — green
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  doc.setLineWidth(0.2);
  y += 14;

  const boxW = 60;
  const boxH = 20;

  // Employee signature box
  doc.setDrawColor(...GREEN_DARK);
  doc.setFillColor(...GREEN_LIGHT);
  doc.roundedRect(margin, y, boxW, boxH, 2, 2, "FD");
  // Green footer strip
  doc.setFillColor(...GREEN);
  doc.rect(margin, y + boxH - 5, boxW, 5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...WHITE);
  doc.text("Employee Signature", margin + boxW / 2, y + boxH - 1.5, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_MID);
  doc.text(
    `${employee.firstName} ${employee.lastName}`,
    margin + boxW / 2,
    y + 8,
    { align: "center" },
  );

  // HR signature box
  const rx = pageWidth - margin - boxW;
  doc.setDrawColor(...ORANGE_DARK);
  doc.setFillColor(255, 242, 230);
  doc.roundedRect(rx, y, boxW, boxH, 2, 2, "FD");
  // Orange footer strip
  doc.setFillColor(...ORANGE);
  doc.rect(rx, y + boxH - 5, boxW, 5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...WHITE);
  doc.text("HR Signature", rx + boxW / 2, y + boxH - 1.5, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_MID);
  doc.text("HR Department", rx + boxW / 2, y + 8, { align: "center" });

  /* ── FOOTER ON ALL PAGES ── */
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, pageWidth, pageHeight, margin, i, totalPages);
  }

  return doc;
}
