const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak, LevelFormat, Header, Footer, TabStopType,
  TabStopPosition, PositionalTab, PositionalTabAlignment, PositionalTabRelativeTo,
  PositionalTabLeader
} = require('docx');
const fs = require('fs');

const BLUE = "1A56A0";
const LIGHT_BLUE = "D6E4F7";
const DARK_BLUE = "0D3B6E";
const LIGHT_GRAY = "F5F5F5";
const MID_GRAY = "DDDDDD";
const TEXT_GRAY = "444444";
const GREEN = "2E7D32";
const AMBER = "B45309";
const WHITE = "FFFFFF";

const border = { style: BorderStyle.SINGLE, size: 1, color: MID_GRAY };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BLUE, space: 4 } },
    children: [new TextRun({ text, font: "Arial", size: 32, bold: true, color: DARK_BLUE })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 120 },
    children: [new TextRun({ text, font: "Arial", size: 26, bold: true, color: BLUE })]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 22, bold: true, color: TEXT_GRAY })]
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 100 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: TEXT_GRAY, ...opts })]
  });
}

function bullet(text, bold_prefix = null) {
  const runs = [];
  if (bold_prefix) {
    runs.push(new TextRun({ text: bold_prefix + " ", font: "Arial", size: 22, bold: true, color: DARK_BLUE }));
    runs.push(new TextRun({ text, font: "Arial", size: 22, color: TEXT_GRAY }));
  } else {
    runs.push(new TextRun({ text, font: "Arial", size: 22, color: TEXT_GRAY }));
  }
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 40 },
    children: runs
  });
}

function numbered(text) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: TEXT_GRAY })]
  });
}

function spacer(lines = 1) {
  return new Paragraph({ spacing: { before: 0, after: lines * 120 }, children: [new TextRun("")] });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function cell(text, opts = {}) {
  const { bold = false, bg = WHITE, isHeader = false, width = 2340, align = AlignmentType.LEFT } = opts;
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: bg, type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({
        text, font: "Arial",
        size: isHeader ? 20 : 20,
        bold: bold || isHeader,
        color: isHeader ? DARK_BLUE : TEXT_GRAY
      })]
    })]
  });
}

function sectionTag(text, color = BLUE) {
  return new Paragraph({
    spacing: { before: 80, after: 40 },
    children: [
      new TextRun({ text: "  " + text + "  ", font: "Arial", size: 18, bold: true, color: WHITE, highlight: undefined }),
    ]
  });
}

function infoBox(label, value) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2200, 7160],
    rows: [new TableRow({
      children: [
        new TableCell({
          borders, width: { size: 2200, type: WidthType.DXA },
          shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 140, right: 140 },
          children: [new Paragraph({ children: [new TextRun({ text: label, font: "Arial", size: 20, bold: true, color: DARK_BLUE })] })]
        }),
        new TableCell({
          borders, width: { size: 7160, type: WidthType.DXA },
          shading: { fill: WHITE, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 140, right: 140 },
          children: [new Paragraph({ children: [new TextRun({ text: value, font: "Arial", size: 20, color: TEXT_GRAY })] })]
        })
      ]
    })]
  });
}

// ─── COVER PAGE ───────────────────────────────────────────────────
const coverPage = [
  spacer(4),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 120 },
    children: [new TextRun({ text: "AUDITDESK", font: "Arial", size: 56, bold: true, color: DARK_BLUE })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 80 },
    children: [new TextRun({ text: "Personal Audit Work Management System", font: "Arial", size: 28, color: BLUE })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: BLUE, space: 4 } },
    spacing: { before: 0, after: 320 },
    children: [new TextRun({ text: "", font: "Arial", size: 24 })]
  }),
  spacer(1),
  new Table({
    width: { size: 6000, type: WidthType.DXA },
    columnWidths: [2400, 3600],
    rows: [
      new TableRow({ children: [
        new TableCell({ borders, shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR }, width: { size: 2400, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 140, right: 140 }, children: [new Paragraph({ children: [new TextRun({ text: "Document Type", font: "Arial", size: 20, bold: true, color: DARK_BLUE })] })] }),
        new TableCell({ borders, shading: { fill: WHITE, type: ShadingType.CLEAR }, width: { size: 3600, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 140, right: 140 }, children: [new Paragraph({ children: [new TextRun({ text: "Product Requirements Document + Technical Documentation", font: "Arial", size: 20, color: TEXT_GRAY })] })] }),
      ]}),
      new TableRow({ children: [
        new TableCell({ borders, shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR }, width: { size: 2400, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 140, right: 140 }, children: [new Paragraph({ children: [new TextRun({ text: "Version", font: "Arial", size: 20, bold: true, color: DARK_BLUE })] })] }),
        new TableCell({ borders, shading: { fill: WHITE, type: ShadingType.CLEAR }, width: { size: 3600, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 140, right: 140 }, children: [new Paragraph({ children: [new TextRun({ text: "1.0", font: "Arial", size: 20, color: TEXT_GRAY })] })] }),
      ]}),
      new TableRow({ children: [
        new TableCell({ borders, shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR }, width: { size: 2400, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 140, right: 140 }, children: [new Paragraph({ children: [new TextRun({ text: "Date", font: "Arial", size: 20, bold: true, color: DARK_BLUE })] })] }),
        new TableCell({ borders, shading: { fill: WHITE, type: ShadingType.CLEAR }, width: { size: 3600, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 140, right: 140 }, children: [new Paragraph({ children: [new TextRun({ text: "April 2026", font: "Arial", size: 20, color: TEXT_GRAY })] })] }),
      ]}),
      new TableRow({ children: [
        new TableCell({ borders, shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR }, width: { size: 2400, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 140, right: 140 }, children: [new Paragraph({ children: [new TextRun({ text: "Status", font: "Arial", size: 20, bold: true, color: DARK_BLUE })] })] }),
        new TableCell({ borders, shading: { fill: WHITE, type: ShadingType.CLEAR }, width: { size: 3600, type: WidthType.DXA }, margins: { top: 100, bottom: 100, left: 140, right: 140 }, children: [new Paragraph({ children: [new TextRun({ text: "Draft — Ready for Development", font: "Arial", size: 20, color: GREEN })] })] }),
      ]}),
    ]
  }),
  spacer(2),
  pageBreak()
];

// ─── SECTION 1: EXECUTIVE SUMMARY ──────────────────────────────────
const section1 = [
  h1("1. Executive Summary"),
  p("AuditDesk is a lightweight, web-based task management system purpose-built for Chartered Accountants (CAs) to manage audit workloads across multiple client parties and CA article assistants. The system enables a CA to assign specific audit sub-tasks to articles, track their real-time status, and filter the workload view by any combination of party, article, sub-work type, and status."),
  spacer(1),
  h2("1.1 Problem Statement"),
  p("CAs managing multiple audit clients face a recurring operational challenge: tracking which article is working on which sub-task, for which client party, and at what stage of completion. Currently, this is managed via spreadsheets or verbal communication, leading to missed tasks, unclear accountability, and difficulty in generating quick progress snapshots."),
  spacer(1),
  h2("1.2 Proposed Solution"),
  p("A simple, fast, cloud-hosted web application with three core data entities — Parties, Articles, and Tasks — and a powerful combined filter system that lets the CA get an instant answer to questions like: What pending tasks does Rahul have for XYZ Ltd?"),
  spacer(1),
  h2("1.3 Key Goals"),
  bullet("Replace manual spreadsheet tracking with a structured, searchable system."),
  bullet("Enable quick task assignment in under 30 seconds."),
  bullet("Provide a real-time filterable task list as the primary daily-use screen."),
  bullet("Support both desktop and mobile browsers with equal usability."),
  bullet("Remain lightweight, fast, and operable without technical knowledge."),
  spacer(1),
  pageBreak()
];

// ─── SECTION 2: STAKEHOLDERS ─────────────────────────────────────────
const section2 = [
  h1("2. Stakeholders & Users"),
  h2("2.1 Primary User"),
  p("The Chartered Accountant (CA) — sole administrator and primary operator. The CA adds all data, assigns all tasks, and uses the system daily to monitor workload."),
  spacer(1),
  h2("2.2 Secondary Users"),
  p("CA Articles (assistants/students) — may view the task list to understand their assignments, though write access is controlled by the CA."),
  spacer(1),
  h2("2.3 Out of Scope"),
  bullet("Client (party) self-service portals."),
  bullet("Multi-CA firm management or role hierarchies."),
  bullet("Billing, invoicing, or financial tracking."),
  bullet("Document storage or file attachments."),
  spacer(1),
  pageBreak()
];

// ─── SECTION 3: FEATURES ──────────────────────────────────────────────
const section3 = [
  h1("3. Feature Requirements"),
  h2("3.1 Authentication"),
  p("The system requires a simple single-user login. The CA sets one password during initial setup. Session tokens are stored securely. No multi-user roles in v1."),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1800, 4560, 3000],
    rows: [
      new TableRow({ children: [
        cell("Feature ID", { isHeader: true, bg: LIGHT_BLUE, width: 1800 }),
        cell("Description", { isHeader: true, bg: LIGHT_BLUE, width: 4560 }),
        cell("Priority", { isHeader: true, bg: LIGHT_BLUE, width: 3000 }),
      ]}),
      new TableRow({ children: [
        cell("AUTH-01", { width: 1800 }),
        cell("Password-based login page with session management", { width: 4560 }),
        cell("Must Have", { width: 3000, bold: true }),
      ]}),
      new TableRow({ children: [
        cell("AUTH-02", { width: 1800 }),
        cell("Auto logout after 24 hours of inactivity", { width: 4560 }),
        cell("Must Have", { width: 3000, bold: true }),
      ]}),
      new TableRow({ children: [
        cell("AUTH-03", { width: 1800 }),
        cell("Redirect unauthenticated users to login", { width: 4560 }),
        cell("Must Have", { width: 3000, bold: true }),
      ]}),
    ]
  }),
  spacer(1),
  h2("3.2 Party Management"),
  p("Parties represent audit clients. The CA can add and view parties. Party names must be unique."),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1800, 4560, 3000],
    rows: [
      new TableRow({ children: [
        cell("Feature ID", { isHeader: true, bg: LIGHT_BLUE, width: 1800 }),
        cell("Description", { isHeader: true, bg: LIGHT_BLUE, width: 4560 }),
        cell("Priority", { isHeader: true, bg: LIGHT_BLUE, width: 3000 }),
      ]}),
      new TableRow({ children: [
        cell("PARTY-01", { width: 1800 }),
        cell("Add a new party with a name field", { width: 4560 }),
        cell("Must Have", { width: 3000, bold: true }),
      ]}),
      new TableRow({ children: [
        cell("PARTY-02", { width: 1800 }),
        cell("View full list of all parties", { width: 4560 }),
        cell("Must Have", { width: 3000, bold: true }),
      ]}),
      new TableRow({ children: [
        cell("PARTY-03", { width: 1800 }),
        cell("Remove a party (only if no tasks linked)", { width: 4560 }),
        cell("Should Have", { width: 3000 }),
      ]}),
    ]
  }),
  spacer(1),
  h2("3.3 Article Management"),
  p("Articles are CA students or assistants who work under the CA. They are assigned tasks."),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1800, 4560, 3000],
    rows: [
      new TableRow({ children: [
        cell("Feature ID", { isHeader: true, bg: LIGHT_BLUE, width: 1800 }),
        cell("Description", { isHeader: true, bg: LIGHT_BLUE, width: 4560 }),
        cell("Priority", { isHeader: true, bg: LIGHT_BLUE, width: 3000 }),
      ]}),
      new TableRow({ children: [
        cell("ART-01", { width: 1800 }),
        cell("Add a new article with a name field", { width: 4560 }),
        cell("Must Have", { width: 3000, bold: true }),
      ]}),
      new TableRow({ children: [
        cell("ART-02", { width: 1800 }),
        cell("View full list of all articles", { width: 4560 }),
        cell("Must Have", { width: 3000, bold: true }),
      ]}),
      new TableRow({ children: [
        cell("ART-03", { width: 1800 }),
        cell("Remove an article (only if no tasks linked)", { width: 4560 }),
        cell("Should Have", { width: 3000 }),
      ]}),
    ]
  }),
  spacer(1),
  h2("3.4 Task Management"),
  p("Tasks are the core of the system. Each task links a party, an article, and a type of sub-work, along with a status and optional remarks."),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1800, 4560, 3000],
    rows: [
      new TableRow({ children: [
        cell("Feature ID", { isHeader: true, bg: LIGHT_BLUE, width: 1800 }),
        cell("Description", { isHeader: true, bg: LIGHT_BLUE, width: 4560 }),
        cell("Priority", { isHeader: true, bg: LIGHT_BLUE, width: 3000 }),
      ]}),
      new TableRow({ children: [
        cell("TASK-01", { width: 1800 }),
        cell("Create a task linking Party, Article, Sub Work, Status, Remarks", { width: 4560 }),
        cell("Must Have", { width: 3000, bold: true }),
      ]}),
      new TableRow({ children: [
        cell("TASK-02", { width: 1800 }),
        cell("Sub Work dropdown with 9 predefined values + Other", { width: 4560 }),
        cell("Must Have", { width: 3000, bold: true }),
      ]}),
      new TableRow({ children: [
        cell("TASK-03", { width: 1800 }),
        cell("When Other is selected, show a text input for custom work description", { width: 4560 }),
        cell("Must Have", { width: 3000, bold: true }),
      ]}),
      new TableRow({ children: [
        cell("TASK-04", { width: 1800 }),
        cell("Status dropdown: Pending / In Progress / Completed", { width: 4560 }),
        cell("Must Have", { width: 3000, bold: true }),
      ]}),
      new TableRow({ children: [
        cell("TASK-05", { width: 1800 }),
        cell("Inline edit of Status and Remarks on the task list row", { width: 4560 }),
        cell("Must Have", { width: 3000, bold: true }),
      ]}),
      new TableRow({ children: [
        cell("TASK-06", { width: 1800 }),
        cell("Auto-record created date on task creation", { width: 4560 }),
        cell("Must Have", { width: 3000, bold: true }),
      ]}),
      new TableRow({ children: [
        cell("TASK-07", { width: 1800 }),
        cell("Delete a task from the task list", { width: 4560 }),
        cell("Should Have", { width: 3000 }),
      ]}),
    ]
  }),
  spacer(1),
  h2("3.5 Task List & Filtering"),
  p("The task list is the most important screen. It must support simultaneous filtering by all four dimensions: Party, Article, Sub Work, and Status."),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1800, 4560, 3000],
    rows: [
      new TableRow({ children: [
        cell("Feature ID", { isHeader: true, bg: LIGHT_BLUE, width: 1800 }),
        cell("Description", { isHeader: true, bg: LIGHT_BLUE, width: 4560 }),
        cell("Priority", { isHeader: true, bg: LIGHT_BLUE, width: 3000 }),
      ]}),
      new TableRow({ children: [
        cell("FILTER-01", { width: 1800 }),
        cell("Filter by Party (dropdown)", { width: 4560 }),
        cell("Must Have", { width: 3000, bold: true }),
      ]}),
      new TableRow({ children: [
        cell("FILTER-02", { width: 1800 }),
        cell("Filter by Article (dropdown)", { width: 4560 }),
        cell("Must Have", { width: 3000, bold: true }),
      ]}),
      new TableRow({ children: [
        cell("FILTER-03", { width: 1800 }),
        cell("Filter by Sub Work (dropdown)", { width: 4560 }),
        cell("Must Have", { width: 3000, bold: true }),
      ]}),
      new TableRow({ children: [
        cell("FILTER-04", { width: 1800 }),
        cell("Filter by Status (dropdown)", { width: 4560 }),
        cell("Must Have", { width: 3000, bold: true }),
      ]}),
      new TableRow({ children: [
        cell("FILTER-05", { width: 1800 }),
        cell("All filters work simultaneously (AND logic)", { width: 4560 }),
        cell("Must Have", { width: 3000, bold: true }),
      ]}),
      new TableRow({ children: [
        cell("FILTER-06", { width: 1800 }),
        cell("Table columns: Party, Sub Work, Article, Status, Remarks, Date, Actions", { width: 4560 }),
        cell("Must Have", { width: 3000, bold: true }),
      ]}),
    ]
  }),
  spacer(1),
  h2("3.6 Dashboard"),
  p("A summary landing page showing aggregate task counts by status and quick access to recent tasks."),
  bullet("Total task count"),
  bullet("Pending task count"),
  bullet("In Progress task count"),
  bullet("Completed task count"),
  bullet("Total parties count"),
  bullet("Total articles count"),
  bullet("Recent 5 tasks table"),
  spacer(1),
  h2("3.7 UI & Accessibility"),
  bullet("Responsive design — fully usable on mobile and desktop."),
  bullet("Light and dark mode toggle — user preference persisted."),
  bullet("Clean, professional appearance suitable for a CA practice."),
  bullet("Form validations with clear error messages."),
  bullet("Minimum 44px touch targets on mobile."),
  spacer(1),
  pageBreak()
];

// ─── SECTION 4: SUB WORK TYPES ────────────────────────────────────────
const section4 = [
  h1("4. Sub Work Reference"),
  p("The following sub-work types are pre-defined in the system. The last option (Other) triggers a free-text input field."),
  spacer(1),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1440, 4320, 3600],
    rows: [
      new TableRow({ children: [
        cell("#", { isHeader: true, bg: LIGHT_BLUE, width: 1440 }),
        cell("Sub Work Name", { isHeader: true, bg: LIGHT_BLUE, width: 4320 }),
        cell("Notes", { isHeader: true, bg: LIGHT_BLUE, width: 3600 }),
      ]}),
      ...["Ledger Scrutiny","TDS Match","Opening Trial Balance","Black Horse Finding","3CD Finding","Black Horse Update","3CD Update","26AS","Strike Off"].map((name, i) =>
        new TableRow({ children: [
          cell(String(i + 1), { width: 1440, bg: i % 2 === 0 ? LIGHT_GRAY : WHITE }),
          cell(name, { width: 4320, bg: i % 2 === 0 ? LIGHT_GRAY : WHITE }),
          cell("Standard predefined option", { width: 3600, bg: i % 2 === 0 ? LIGHT_GRAY : WHITE }),
        ]})
      ),
      new TableRow({ children: [
        cell("10", { width: 1440, bg: LIGHT_BLUE }),
        cell("Other", { width: 4320, bg: LIGHT_BLUE, bold: true }),
        cell("Triggers custom text input; stores user-entered value", { width: 3600, bg: LIGHT_BLUE }),
      ]}),
    ]
  }),
  spacer(1),
  pageBreak()
];

// ─── SECTION 5: DATABASE DESIGN ──────────────────────────────────────
const section5 = [
  h1("5. Database Design"),
  p("The database uses Turso (cloud-hosted libSQL/SQLite). Three tables cover all data needs."),
  spacer(1),
  h2("5.1 Parties Table"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2340, 2340, 2340, 2340],
    rows: [
      new TableRow({ children: [
        cell("Column", { isHeader: true, bg: LIGHT_BLUE, width: 2340 }),
        cell("Type", { isHeader: true, bg: LIGHT_BLUE, width: 2340 }),
        cell("Constraint", { isHeader: true, bg: LIGHT_BLUE, width: 2340 }),
        cell("Description", { isHeader: true, bg: LIGHT_BLUE, width: 2340 }),
      ]}),
      new TableRow({ children: [cell("id", { width: 2340 }), cell("INTEGER", { width: 2340 }), cell("PRIMARY KEY, AUTO_INCREMENT", { width: 2340 }), cell("Unique party identifier", { width: 2340 })] }),
      new TableRow({ children: [cell("name", { width: 2340, bg: LIGHT_GRAY }), cell("TEXT", { width: 2340, bg: LIGHT_GRAY }), cell("NOT NULL, UNIQUE", { width: 2340, bg: LIGHT_GRAY }), cell("Party/client name", { width: 2340, bg: LIGHT_GRAY })] }),
      new TableRow({ children: [cell("created_at", { width: 2340 }), cell("TIMESTAMP", { width: 2340 }), cell("DEFAULT NOW()", { width: 2340 }), cell("Record creation time", { width: 2340 })] }),
    ]
  }),
  spacer(1),
  h2("5.2 Articles Table"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2340, 2340, 2340, 2340],
    rows: [
      new TableRow({ children: [
        cell("Column", { isHeader: true, bg: LIGHT_BLUE, width: 2340 }),
        cell("Type", { isHeader: true, bg: LIGHT_BLUE, width: 2340 }),
        cell("Constraint", { isHeader: true, bg: LIGHT_BLUE, width: 2340 }),
        cell("Description", { isHeader: true, bg: LIGHT_BLUE, width: 2340 }),
      ]}),
      new TableRow({ children: [cell("id", { width: 2340 }), cell("INTEGER", { width: 2340 }), cell("PRIMARY KEY, AUTO_INCREMENT", { width: 2340 }), cell("Unique article identifier", { width: 2340 })] }),
      new TableRow({ children: [cell("name", { width: 2340, bg: LIGHT_GRAY }), cell("TEXT", { width: 2340, bg: LIGHT_GRAY }), cell("NOT NULL, UNIQUE", { width: 2340, bg: LIGHT_GRAY }), cell("Article person's name", { width: 2340, bg: LIGHT_GRAY })] }),
      new TableRow({ children: [cell("created_at", { width: 2340 }), cell("TIMESTAMP", { width: 2340 }), cell("DEFAULT NOW()", { width: 2340 }), cell("Record creation time", { width: 2340 })] }),
    ]
  }),
  spacer(1),
  h2("5.3 Tasks Table"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2340, 2340, 2340, 2340],
    rows: [
      new TableRow({ children: [
        cell("Column", { isHeader: true, bg: LIGHT_BLUE, width: 2340 }),
        cell("Type", { isHeader: true, bg: LIGHT_BLUE, width: 2340 }),
        cell("Constraint", { isHeader: true, bg: LIGHT_BLUE, width: 2340 }),
        cell("Description", { isHeader: true, bg: LIGHT_BLUE, width: 2340 }),
      ]}),
      new TableRow({ children: [cell("id", { width: 2340 }), cell("INTEGER", { width: 2340 }), cell("PRIMARY KEY, AUTO_INCREMENT", { width: 2340 }), cell("Unique task identifier", { width: 2340 })] }),
      new TableRow({ children: [cell("party_id", { width: 2340, bg: LIGHT_GRAY }), cell("INTEGER", { width: 2340, bg: LIGHT_GRAY }), cell("FK → parties.id", { width: 2340, bg: LIGHT_GRAY }), cell("Linked party", { width: 2340, bg: LIGHT_GRAY })] }),
      new TableRow({ children: [cell("article_id", { width: 2340 }), cell("INTEGER", { width: 2340 }), cell("FK → articles.id", { width: 2340 }), cell("Assigned article", { width: 2340 })] }),
      new TableRow({ children: [cell("sub_work", { width: 2340, bg: LIGHT_GRAY }), cell("TEXT", { width: 2340, bg: LIGHT_GRAY }), cell("NOT NULL", { width: 2340, bg: LIGHT_GRAY }), cell("Sub work type or custom text", { width: 2340, bg: LIGHT_GRAY })] }),
      new TableRow({ children: [cell("status", { width: 2340 }), cell("TEXT", { width: 2340 }), cell("NOT NULL, CHECK", { width: 2340 }), cell("Pending / In Progress / Completed", { width: 2340 })] }),
      new TableRow({ children: [cell("remarks", { width: 2340, bg: LIGHT_GRAY }), cell("TEXT", { width: 2340, bg: LIGHT_GRAY }), cell("NULLABLE", { width: 2340, bg: LIGHT_GRAY }), cell("Optional CA notes", { width: 2340, bg: LIGHT_GRAY })] }),
      new TableRow({ children: [cell("created_at", { width: 2340 }), cell("TIMESTAMP", { width: 2340 }), cell("DEFAULT NOW()", { width: 2340 }), cell("Task creation time", { width: 2340 })] }),
    ]
  }),
  spacer(1),
  h2("5.4 Status Constraint Values"),
  bullet("Pending"),
  bullet("In Progress"),
  bullet("Completed"),
  spacer(1),
  pageBreak()
];

// ─── SECTION 6: TECH STACK ────────────────────────────────────────────
const section6 = [
  h1("6. Technical Architecture"),
  h2("6.1 Technology Stack"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2340, 3120, 3900],
    rows: [
      new TableRow({ children: [
        cell("Layer", { isHeader: true, bg: LIGHT_BLUE, width: 2340 }),
        cell("Choice", { isHeader: true, bg: LIGHT_BLUE, width: 3120 }),
        cell("Rationale", { isHeader: true, bg: LIGHT_BLUE, width: 3900 }),
      ]}),
      new TableRow({ children: [cell("Framework", { width: 2340 }), cell("Next.js 14 (App Router)", { width: 3120 }), cell("Full-stack React, SSR, API routes, Vercel-native", { width: 3900 })] }),
      new TableRow({ children: [cell("Styling", { width: 2340, bg: LIGHT_GRAY }), cell("Tailwind CSS + shadcn/ui", { width: 3120, bg: LIGHT_GRAY }), cell("Professional UI, dark mode, zero runtime overhead", { width: 3900, bg: LIGHT_GRAY })] }),
      new TableRow({ children: [cell("Database", { width: 2340 }), cell("Turso (libSQL/SQLite)", { width: 3120 }), cell("Lightweight, cloud-hosted, free tier generous", { width: 3900 })] }),
      new TableRow({ children: [cell("ORM", { width: 2340, bg: LIGHT_GRAY }), cell("Drizzle ORM", { width: 3120, bg: LIGHT_GRAY }), cell("Type-safe, Turso-compatible, minimal overhead", { width: 3900, bg: LIGHT_GRAY })] }),
      new TableRow({ children: [cell("Authentication", { width: 2340 }), cell("NextAuth.js (Credentials)", { width: 3120 }), cell("Simple password login, session management", { width: 3900 })] }),
      new TableRow({ children: [cell("Hosting", { width: 2340, bg: LIGHT_GRAY }), cell("Vercel", { width: 3120, bg: LIGHT_GRAY }), cell("Free tier, one-click deploy, automatic CI/CD", { width: 3900, bg: LIGHT_GRAY })] }),
      new TableRow({ children: [cell("Language", { width: 2340 }), cell("TypeScript", { width: 3120 }), cell("Type safety, better DX, fewer runtime errors", { width: 3900 })] }),
    ]
  }),
  spacer(1),
  h2("6.2 Application Architecture"),
  p("The application follows a standard Next.js App Router architecture with the following layers:"),
  bullet("Presentation Layer: React Server and Client Components using shadcn/ui and Tailwind CSS"),
  bullet("API Layer: Next.js Route Handlers (/app/api/*) exposing REST endpoints"),
  bullet("Data Layer: Drizzle ORM connecting to Turso via the libSQL HTTP client"),
  bullet("Auth Layer: NextAuth.js middleware protecting all routes except /login"),
  spacer(1),
  h2("6.3 Folder Structure"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3900, 5460],
    rows: [
      new TableRow({ children: [
        cell("Path", { isHeader: true, bg: LIGHT_BLUE, width: 3900 }),
        cell("Purpose", { isHeader: true, bg: LIGHT_BLUE, width: 5460 }),
      ]}),
      ...([
        ["/app/(auth)/login", "Login page"],
        ["/app/(dashboard)/page.tsx", "Dashboard home"],
        ["/app/(dashboard)/tasks/page.tsx", "Task list with filters"],
        ["/app/(dashboard)/tasks/add/page.tsx", "Add task form"],
        ["/app/(dashboard)/parties/page.tsx", "Party management"],
        ["/app/(dashboard)/articles/page.tsx", "Article management"],
        ["/app/api/tasks/route.ts", "GET/POST tasks API"],
        ["/app/api/tasks/[id]/route.ts", "PATCH/DELETE task API"],
        ["/app/api/parties/route.ts", "GET/POST parties API"],
        ["/app/api/articles/route.ts", "GET/POST articles API"],
        ["/lib/db/schema.ts", "Drizzle schema definitions"],
        ["/lib/db/index.ts", "Turso client + Drizzle instance"],
        ["/components/ui/", "shadcn/ui component library"],
        ["/middleware.ts", "NextAuth route protection"],
      ]).map(([path, purpose], i) =>
        new TableRow({ children: [
          cell(path, { width: 3900, bg: i % 2 === 0 ? LIGHT_GRAY : WHITE }),
          cell(purpose, { width: 5460, bg: i % 2 === 0 ? LIGHT_GRAY : WHITE }),
        ]})
      )
    ]
  }),
  spacer(1),
  pageBreak()
];

// ─── SECTION 7: API REFERENCE ─────────────────────────────────────────
const section7 = [
  h1("7. API Reference"),
  h2("7.1 Parties"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1440, 2880, 2880, 2160],
    rows: [
      new TableRow({ children: [
        cell("Method", { isHeader: true, bg: LIGHT_BLUE, width: 1440 }),
        cell("Endpoint", { isHeader: true, bg: LIGHT_BLUE, width: 2880 }),
        cell("Description", { isHeader: true, bg: LIGHT_BLUE, width: 2880 }),
        cell("Auth", { isHeader: true, bg: LIGHT_BLUE, width: 2160 }),
      ]}),
      new TableRow({ children: [cell("GET", { width: 1440 }), cell("/api/parties", { width: 2880 }), cell("List all parties", { width: 2880 }), cell("Required", { width: 2160 })] }),
      new TableRow({ children: [cell("POST", { width: 1440, bg: LIGHT_GRAY }), cell("/api/parties", { width: 2880, bg: LIGHT_GRAY }), cell("Create a new party", { width: 2880, bg: LIGHT_GRAY }), cell("Required", { width: 2160, bg: LIGHT_GRAY })] }),
      new TableRow({ children: [cell("DELETE", { width: 1440 }), cell("/api/parties/[id]", { width: 2880 }), cell("Remove a party", { width: 2880 }), cell("Required", { width: 2160 })] }),
    ]
  }),
  spacer(1),
  h2("7.2 Articles"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1440, 2880, 2880, 2160],
    rows: [
      new TableRow({ children: [
        cell("Method", { isHeader: true, bg: LIGHT_BLUE, width: 1440 }),
        cell("Endpoint", { isHeader: true, bg: LIGHT_BLUE, width: 2880 }),
        cell("Description", { isHeader: true, bg: LIGHT_BLUE, width: 2880 }),
        cell("Auth", { isHeader: true, bg: LIGHT_BLUE, width: 2160 }),
      ]}),
      new TableRow({ children: [cell("GET", { width: 1440 }), cell("/api/articles", { width: 2880 }), cell("List all articles", { width: 2880 }), cell("Required", { width: 2160 })] }),
      new TableRow({ children: [cell("POST", { width: 1440, bg: LIGHT_GRAY }), cell("/api/articles", { width: 2880, bg: LIGHT_GRAY }), cell("Create a new article", { width: 2880, bg: LIGHT_GRAY }), cell("Required", { width: 2160, bg: LIGHT_GRAY })] }),
      new TableRow({ children: [cell("DELETE", { width: 1440 }), cell("/api/articles/[id]", { width: 2880 }), cell("Remove an article", { width: 2880 }), cell("Required", { width: 2160 })] }),
    ]
  }),
  spacer(1),
  h2("7.3 Tasks"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1440, 2880, 2880, 2160],
    rows: [
      new TableRow({ children: [
        cell("Method", { isHeader: true, bg: LIGHT_BLUE, width: 1440 }),
        cell("Endpoint", { isHeader: true, bg: LIGHT_BLUE, width: 2880 }),
        cell("Description", { isHeader: true, bg: LIGHT_BLUE, width: 2880 }),
        cell("Auth", { isHeader: true, bg: LIGHT_BLUE, width: 2160 }),
      ]}),
      new TableRow({ children: [cell("GET", { width: 1440 }), cell("/api/tasks", { width: 2880 }), cell("List tasks with optional filters", { width: 2880 }), cell("Required", { width: 2160 })] }),
      new TableRow({ children: [cell("POST", { width: 1440, bg: LIGHT_GRAY }), cell("/api/tasks", { width: 2880, bg: LIGHT_GRAY }), cell("Create a new task", { width: 2880, bg: LIGHT_GRAY }), cell("Required", { width: 2160, bg: LIGHT_GRAY })] }),
      new TableRow({ children: [cell("PATCH", { width: 1440 }), cell("/api/tasks/[id]", { width: 2880 }), cell("Update status and/or remarks", { width: 2880 }), cell("Required", { width: 2160 })] }),
      new TableRow({ children: [cell("DELETE", { width: 1440, bg: LIGHT_GRAY }), cell("/api/tasks/[id]", { width: 2880, bg: LIGHT_GRAY }), cell("Delete a task", { width: 2880, bg: LIGHT_GRAY }), cell("Required", { width: 2160, bg: LIGHT_GRAY })] }),
    ]
  }),
  spacer(1),
  h2("7.4 Filter Query Parameters (GET /api/tasks)"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2340, 2340, 4680],
    rows: [
      new TableRow({ children: [
        cell("Parameter", { isHeader: true, bg: LIGHT_BLUE, width: 2340 }),
        cell("Type", { isHeader: true, bg: LIGHT_BLUE, width: 2340 }),
        cell("Example", { isHeader: true, bg: LIGHT_BLUE, width: 4680 }),
      ]}),
      new TableRow({ children: [cell("party_id", { width: 2340 }), cell("integer", { width: 2340 }), cell("?party_id=3", { width: 4680 })] }),
      new TableRow({ children: [cell("article_id", { width: 2340, bg: LIGHT_GRAY }), cell("integer", { width: 2340, bg: LIGHT_GRAY }), cell("?article_id=1", { width: 4680, bg: LIGHT_GRAY })] }),
      new TableRow({ children: [cell("sub_work", { width: 2340 }), cell("string", { width: 2340 }), cell("?sub_work=TDS+Match", { width: 4680 })] }),
      new TableRow({ children: [cell("status", { width: 2340, bg: LIGHT_GRAY }), cell("string", { width: 2340, bg: LIGHT_GRAY }), cell("?status=Pending", { width: 4680, bg: LIGHT_GRAY })] }),
    ]
  }),
  spacer(1),
  pageBreak()
];

// ─── SECTION 8: UI PAGES ──────────────────────────────────────────────
const section8 = [
  h1("8. UI Pages Specification"),
  h2("8.1 Login Page"),
  bullet("Single centered card with username/email and password fields."),
  bullet("Submit button — on success, redirect to dashboard."),
  bullet("Error message displayed inline for invalid credentials."),
  spacer(1),
  h2("8.2 Dashboard"),
  bullet("6 metric cards in a 3-column grid: Total, Pending, In Progress, Completed, Parties, Articles."),
  bullet("Recent tasks table below showing the 5 latest tasks."),
  bullet("Quick navigation links to Add Task and Task List."),
  spacer(1),
  h2("8.3 Add Task Page"),
  bullet("Party dropdown — populated from parties table."),
  bullet("Article dropdown — populated from articles table."),
  bullet("Sub Work dropdown — 9 fixed options + Other."),
  bullet("If Other selected: animated expand of a free-text input field."),
  bullet("Status dropdown — Pending / In Progress / Completed."),
  bullet("Remarks textarea — optional."),
  bullet("Save button — validates required fields before submission."),
  bullet("Success toast notification on save."),
  spacer(1),
  h2("8.4 Task List Page"),
  bullet("Four filter dropdowns at the top: Party, Article, Sub Work, Status."),
  bullet("Filters apply live (on change) with AND logic."),
  bullet("Table columns: Party | Sub Work | Article | Status | Remarks | Date | Actions."),
  bullet("Status shown as colour-coded badges: amber (Pending), blue (In Progress), green (Completed)."),
  bullet("Edit button per row — expands an inline edit row below with Status and Remarks inputs."),
  bullet("Save and Cancel buttons in the inline edit row."),
  bullet("Empty state message when no tasks match filters."),
  spacer(1),
  h2("8.5 Parties Page"),
  bullet("Add party form (name input + save button)."),
  bullet("List of existing parties with remove button per entry."),
  spacer(1),
  h2("8.6 Articles Page"),
  bullet("Add article form (name input + save button)."),
  bullet("List of existing articles with remove button per entry."),
  spacer(1),
  pageBreak()
];

// ─── SECTION 9: WORKFLOW ──────────────────────────────────────────────
const section9 = [
  h1("9. Typical Daily Workflow"),
  h2("Step-by-Step Usage Example"),
  numbered("CA logs in with password."),
  numbered("CA navigates to Parties and adds a new client: 'ABC Traders Ltd'."),
  numbered("CA navigates to Articles — article 'Rahul' is already present."),
  numbered("CA goes to Add Task: selects ABC Traders Ltd, Rahul, Ledger Scrutiny, Pending. Saves."),
  numbered("The next morning, CA opens Task List, filters by Article = Rahul and Status = Pending to see Rahul's remaining work."),
  numbered("After Rahul finishes the work, CA clicks Edit on the row, changes Status to Completed, adds a remark 'Verified and signed', saves."),
  numbered("CA checks the Dashboard — Completed count has increased."),
  spacer(1),
  pageBreak()
];

// ─── SECTION 10: NON-FUNCTIONAL ──────────────────────────────────────
const section10 = [
  h1("10. Non-Functional Requirements"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2340, 3120, 3900],
    rows: [
      new TableRow({ children: [
        cell("Category", { isHeader: true, bg: LIGHT_BLUE, width: 2340 }),
        cell("Requirement", { isHeader: true, bg: LIGHT_BLUE, width: 3120 }),
        cell("Target", { isHeader: true, bg: LIGHT_BLUE, width: 3900 }),
      ]}),
      new TableRow({ children: [cell("Performance", { width: 2340 }), cell("Page load time", { width: 3120 }), cell("< 2 seconds on 4G mobile", { width: 3900 })] }),
      new TableRow({ children: [cell("Performance", { width: 2340, bg: LIGHT_GRAY }), cell("Filter response", { width: 3120, bg: LIGHT_GRAY }), cell("< 200ms (client-side filtering)", { width: 3900, bg: LIGHT_GRAY })] }),
      new TableRow({ children: [cell("Availability", { width: 2340 }), cell("Uptime", { width: 3120 }), cell("99.9% (Vercel + Turso SLA)", { width: 3900 })] }),
      new TableRow({ children: [cell("Security", { width: 2340, bg: LIGHT_GRAY }), cell("Password storage", { width: 3120, bg: LIGHT_GRAY }), cell("bcrypt hashed, never plain text", { width: 3900, bg: LIGHT_GRAY })] }),
      new TableRow({ children: [cell("Security", { width: 2340 }), cell("API protection", { width: 3120 }), cell("All endpoints require valid session", { width: 3900 })] }),
      new TableRow({ children: [cell("Compatibility", { width: 2340, bg: LIGHT_GRAY }), cell("Browser support", { width: 3120, bg: LIGHT_GRAY }), cell("Chrome, Safari, Firefox — last 2 versions", { width: 3900, bg: LIGHT_GRAY })] }),
      new TableRow({ children: [cell("Scalability", { width: 2340 }), cell("Task records", { width: 3120 }), cell("Up to 10,000 tasks without performance issues", { width: 3900 })] }),
      new TableRow({ children: [cell("Usability", { width: 2340, bg: LIGHT_GRAY }), cell("Mobile usability", { width: 3120, bg: LIGHT_GRAY }), cell("Fully operable on 375px viewport width", { width: 3900, bg: LIGHT_GRAY })] }),
    ]
  }),
  spacer(1),
  pageBreak()
];

// ─── SECTION 11: DEPLOYMENT ───────────────────────────────────────────
const section11 = [
  h1("11. Deployment & Setup Guide"),
  h2("11.1 Prerequisites"),
  bullet("Node.js 18+ installed locally"),
  bullet("A Turso account (free tier) — turso.tech"),
  bullet("A Vercel account (free tier) — vercel.com"),
  bullet("Git / GitHub account"),
  spacer(1),
  h2("11.2 Environment Variables"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3600, 5760],
    rows: [
      new TableRow({ children: [
        cell("Variable", { isHeader: true, bg: LIGHT_BLUE, width: 3600 }),
        cell("Value / Source", { isHeader: true, bg: LIGHT_BLUE, width: 5760 }),
      ]}),
      new TableRow({ children: [cell("TURSO_DATABASE_URL", { width: 3600 }), cell("From Turso dashboard — libsql://your-db.turso.io", { width: 5760 })] }),
      new TableRow({ children: [cell("TURSO_AUTH_TOKEN", { width: 3600, bg: LIGHT_GRAY }), cell("From Turso dashboard — API token", { width: 5760, bg: LIGHT_GRAY })] }),
      new TableRow({ children: [cell("NEXTAUTH_SECRET", { width: 3600 }), cell("Generate with: openssl rand -base64 32", { width: 5760 })] }),
      new TableRow({ children: [cell("NEXTAUTH_URL", { width: 3600, bg: LIGHT_GRAY }), cell("https://your-app.vercel.app (production URL)", { width: 5760, bg: LIGHT_GRAY })] }),
      new TableRow({ children: [cell("ADMIN_PASSWORD", { width: 3600 }), cell("Your chosen login password (hashed at setup)", { width: 5760 })] }),
    ]
  }),
  spacer(1),
  h2("11.3 Deployment Steps"),
  numbered("Clone the repository and run npm install."),
  numbered("Create a Turso database and copy the URL and auth token."),
  numbered("Run npm run db:push to apply the Drizzle schema to Turso."),
  numbered("Run npm run seed to create the admin user with your chosen password."),
  numbered("Push the code to GitHub."),
  numbered("Connect the GitHub repo to Vercel and add all environment variables."),
  numbered("Deploy — Vercel will build and serve the app automatically."),
  spacer(1),
  pageBreak()
];

// ─── SECTION 12: FUTURE SCOPE ─────────────────────────────────────────
const section12 = [
  h1("12. Future Scope (v2+)"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [4680, 4680],
    rows: [
      new TableRow({ children: [
        cell("Feature", { isHeader: true, bg: LIGHT_BLUE, width: 4680 }),
        cell("Notes", { isHeader: true, bg: LIGHT_BLUE, width: 4680 }),
      ]}),
      new TableRow({ children: [cell("Deadline / due date per task", { width: 4680 }), cell("Allow CA to set target completion dates", { width: 4680 })] }),
      new TableRow({ children: [cell("Export to Excel/PDF", { width: 4680, bg: LIGHT_GRAY }), cell("Print-ready task reports by party or article", { width: 4680, bg: LIGHT_GRAY })] }),
      new TableRow({ children: [cell("WhatsApp notification", { width: 4680 }), cell("Alert articles on new task assignment", { width: 4680 })] }),
      new TableRow({ children: [cell("Article login (read-only)", { width: 4680, bg: LIGHT_GRAY }), cell("Articles can view their own tasks", { width: 4680, bg: LIGHT_GRAY })] }),
      new TableRow({ children: [cell("Bulk task creation", { width: 4680 }), cell("Assign same sub-work to multiple parties at once", { width: 4680 })] }),
      new TableRow({ children: [cell("Activity log", { width: 4680, bg: LIGHT_GRAY }), cell("Track all status changes with timestamps", { width: 4680, bg: LIGHT_GRAY })] }),
      new TableRow({ children: [cell("Financial year grouping", { width: 4680 }), cell("Organise tasks by assessment year", { width: 4680 })] }),
    ]
  }),
  spacer(2),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: MID_GRAY, space: 8 } },
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text: "AuditDesk PRD & Technical Documentation — v1.0 — April 2026", font: "Arial", size: 18, color: "888888" })]
  }),
];

// ─── ASSEMBLE DOCUMENT ────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, font: "Arial", color: DARK_BLUE }, paragraph: { spacing: { before: 400, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, font: "Arial", color: BLUE }, paragraph: { spacing: { before: 320, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 22, bold: true, font: "Arial", color: TEXT_GRAY }, paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BLUE, space: 4 } },
          spacing: { before: 0, after: 120 },
          children: [
            new TextRun({ text: "AuditDesk", font: "Arial", size: 18, bold: true, color: BLUE }),
            new TextRun({ text: "  |  Product Requirements & Technical Documentation", font: "Arial", size: 18, color: "888888" }),
          ]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: MID_GRAY, space: 4 } },
          spacing: { before: 80, after: 0 },
          children: [
            new TextRun({ text: "Confidential — v1.0 — April 2026        Page ", font: "Arial", size: 16, color: "888888" }),
            new TextRun({ children: [new PageNumber()], font: "Arial", size: 16, color: "888888" }),
          ]
        })]
      })
    },
    children: [
      ...coverPage,
      ...section1,
      ...section2,
      ...section3,
      ...section4,
      ...section5,
      ...section6,
      ...section7,
      ...section8,
      ...section9,
      ...section10,
      ...section11,
      ...section12,
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/mnt/user-data/outputs/AuditDesk_PRD_Documentation.docx', buf);
  console.log('Done');
});
