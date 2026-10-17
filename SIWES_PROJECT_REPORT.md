# DESIGN AND IMPLEMENTATION OF A STAFF DIRECTORY WEB APPLICATION

### Staff Industrial Work Experience Scheme (SIWES) Project Report

---

## TITLE PAGE

**Staff Industrial Work Experience Scheme (SIWES)**

**Project Title:**
Design and Implementation of a Staff Directory Web Application

| | |
|---|---|
| **Student** | [Student Name] |
| **Matric / Registration Number** | [Matric Number] |
| **Department** | [Department] |
| **Institution** | [Institution Name] |
| **Organization / Place of SIWES** | Rids Cloud Digital Solution |
| **Industry Supervisor** | [Industry Supervisor Name] |
| **Institutional Supervisor** | [Institutional Supervisor Name] |
| **Session / Year** | [SIWES Year] |

*Month and Year of Submission: [Month, Year]*

> **Note to the student.** Every square-bracketed item above is a placeholder that must be
> replaced with correct personal and institutional information before submission. No personal,
> institutional or supervisory details have been invented in this report.

---

## DECLARATION

I hereby declare that this project report entitled **"Design and Implementation of a Staff
Directory Web Application"** is my own work, and that it has been prepared in partial fulfilment
of the requirements of the Staff Industrial Work Experience Scheme (SIWES).

I confirm that:

1. The work presented in this report is the result of my own effort, except where the work of
   others has been duly acknowledged.
2. The system described in this report was designed and implemented by me during my SIWES
   placement at **Rids Cloud Digital Solution**, under the supervision of the industry and
   institutional supervisors named on the title page.
3. All data records displayed by the system are **fictional sample data** created solely for
   demonstration and testing purposes. The system does not contain, and must not be interpreted
   as containing, personal information about any real individual.
4. This work has not been submitted, in whole or in part, for any other degree, diploma or
   award.
5. I have read and understood the requirements of the SIWES scheme and I have complied with them
   to the best of my ability.

I accept full responsibility for the accuracy and originality of the work presented herein.

<br>

**Name:** [Student Name]
**Matric Number:** [Matric Number]
**Signature:** ______________________________
**Date:** ______________________________

---

## CERTIFICATION

### Industry Supervisor

I certify that this report entitled **"Design and Implementation of a Staff Directory Web
Application"** has been carried out by **[Student Name]** (Matric Number: **[Matric Number]**) in
partial fulfilment of the requirements of the Staff Industrial Work Experience Scheme (SIWES).

The work is the student's own effort. The student carried out the project at **Rids Cloud Digital
Solution** under my supervision, and I confirm that the work is of an acceptable standard for
submission.

| | |
|---|---|
| **Name** | [Industry Supervisor Name] |
| **Position** | [Industry Supervisor Position] |
| **Organization** | Rids Cloud Digital Solution |
| **Signature** | ______________________________ |
| **Date** | ______________________________ |

<br>

### Institutional Supervisor

I certify that this project report entitled **"Design and Implementation of a Staff Directory Web
Application"**, submitted by **[Student Name]** (Matric Number: **[Matric Number]**), has been
read and approved as meeting the requirements of the Department of **[Department]**,
**[Institution Name]**, for the award of the **[Degree/Programme]** in partial fulfilment of the
requirements of the Staff Industrial Work Experience Scheme (SIWES).

| | |
|---|---|
| **Name** | [Institutional Supervisor Name] |
| **Position** | [Institutional Supervisor Position] |
| **Signature** | ______________________________ |
| **Date** | ______________________________ |

<br>

### Head of Department / Institution Representative

| | |
|---|---|
| **Name** | [Head of Department Name] |
| **Signature** | ______________________________ |
| **Date** | ______________________________ |

---

## DEDICATION

> *This dedication is intentionally general so that it can be personalised. Replace the words in
> square brackets, or rewrite the passage in your own words, before submission.*

This work is dedicated to my family, my lecturers, my colleagues and everyone who supported me
throughout my academic journey and my time on SIWES.

To my parents and guardians, whose encouragement, patience and sacrifices made this achievement
possible — thank you.

To my supervisors at **[Institution Name]** and at **Rids Cloud Digital Solution**, whose guidance
shaped this project from an idea into a working system.

To my friends and colleagues, for their support during the placement.

And above all, to God, for the strength, grace and opportunities to complete this programme.

---

## ACKNOWLEDGEMENT

> *This acknowledgement is written to be polished but editable. Add or remove names, and adjust
> the wording to suit your own experience. No names have been invented.*

I give thanks to God Almighty for the strength, health and grace that made it possible to complete
this project successfully.

I am deeply grateful to **[Institution Name]**, Department of **[Department]**, for the academic
foundation, the laboratory and internet facilities, and the training that prepared me for industrial
experience. I also acknowledge **[Institution Name]** and the Industrial Training Fund (ITF) for the
framework under which the Staff Industrial Work Experience Scheme operates, which made this
attachment possible.

My sincere appreciation goes to **Rids Cloud Digital Solution** for the opportunity to attach, for
the working environment, and for the practical exposure this project provided. I am grateful to my
industry supervisor, **[Industry Supervisor Name]**, and my institutional supervisor,
**[Institutional Supervisor Name]**, whose guidance, patience and constructive feedback shaped both
the design and the implementation of this system.

I also thank the staff of **Rids Cloud Digital Solution** — People & Operations — for their
cooperation and for answering my questions patiently while I was learning.

Finally, I thank my family, my colleagues and my friends for their moral support, their
encouragement and their patience throughout the duration of the programme.

---

## ABSTRACT

Organizations routinely need to answer simple questions about their people: who works in a given
department, who holds a particular role, how to reach a colleague, and whether that colleague is
currently active. When staff information is scattered across spreadsheets, paper records and
disconnected files, answering these questions becomes slow, and the information available is often
incomplete or out of date. This project addresses that problem by building a centralized,
web-based Staff Directory Web Application that presents staff information through one responsive
interface.

The system was developed as a three-tier client–server application. The presentation tier was built
with HTML5, Tailwind CSS (compiled ahead of time to a static stylesheet) and Vanilla JavaScript, with
no client-side framework. The business and data-access tiers were implemented in Node.js using the
Express.js framework, organised into clearly separated routes, controllers, repositories and
middleware. For local development and automated testing, persistent storage is provided by a SQLite
database accessed through the better-sqlite3 driver, which exposes a synchronous, SQL-native
programming interface and therefore requires no separate Object-Relational Mapping layer. The
production deployment uses a hosted PostgreSQL database (Supabase) instead, selected automatically
when `DATABASE_URL` is set; the same relational schema is expressed in both SQL dialects.

The database was designed relationally with six tables — `departments`, `roles`, `staff`,
`admins`, `admin_sessions` and `tasks` — connected by one-to-many relationships, protected by
primary keys, unique constraints, foreign keys with referential actions, `CHECK` constraints and
supporting indexes. The seed data contains 6 departments, 9 roles and 18 fictional staff records;
no administrator account is seeded, because registration through the application creates the first
one. The REST API combines seven public read-only directory endpoints with protected administrator
capabilities added in later, owner-approved tasks: three public authentication endpoints
(register/login/logout), a protected staff-creation endpoint, seven protected task-management endpoints
and a protected dashboard endpoint — twenty endpoints in total. The authenticated principal endpoint
(`/api/auth/me`) is guarded by the session. The user interface allows staff to be browsed as cards,
searched by name, email or job title, filtered individually or in combination by department, role
and employment status, and inspected through an accessible profile dialog with keyboard support and
focus management. A signed-in administrator can additionally create staff members through an Add
Staff screen, manage and track tasks assigned to staff through a Tasks screen, and view a Dashboard
that recomputes its summary counts and workload lists from the live database on every visit.

Functional, API, interface, responsive, accessibility, error-handling and security checks were
carried out and recorded during final quality assurance — both for the original directory and for
each expanded task — with all recorded test cases passing. The result is a working, self-contained
application that demonstrates the practical value of relational database design, REST-based web
application development, and the secure administrative extension of a read-only service.

**Keywords:** Staff Directory, Node.js, Express.js, SQLite, better-sqlite3, PostgreSQL, REST API,
Vanilla JavaScript, Responsive Web Design, Relational Database, Authentication, Task Management,
Dashboard.

---

## TABLE OF CONTENTS

> This contents list is maintained manually. Page numbers are intentionally omitted and should be
> added when the report is transferred to a word processor and paginated.

| Section | Title | Page |
|---|---|---|
| — | Title Page | |
| — | Declaration | |
| — | Certification | |
| — | Dedication | |
| — | Acknowledgement | |
| — | Abstract | |
| — | Table of Contents | |
| — | List of Figures | |
| — | List of Tables | |
| | **CHAPTER ONE — INTRODUCTION** | |
| 1.1 | Background of the Study | |
| 1.2 | Problem Statement | |
| 1.3 | Aim of the Project | |
| 1.4 | Objectives of the Project | |
| 1.5 | Scope of the Project | |
| 1.6 | Significance of the Project | |
| 1.7 | Limitations of the Project | |
| | **CHAPTER TWO — LITERATURE / CONCEPTUAL REVIEW** | |
| 2.1 | Staff Information Management Systems | |
| 2.2 | Web-Based Information Systems | |
| 2.3 | Relational Database Systems | |
| 2.4 | SQLite | |
| 2.5 | RESTful Application Programming Interfaces | |
| 2.6 | Responsive Web Design | |
| 2.7 | Search and Filtering in Information Systems | |
| 2.8 | Client–Server Architecture | |
| | **CHAPTER THREE — SYSTEM ANALYSIS AND REQUIREMENTS** | |
| 3.1 | Existing / Traditional Approach | |
| 3.2 | Problems Identified | |
| 3.3 | Proposed System | |
| 3.4 | Functional Requirements | |
| 3.5 | Non-Functional Requirements | |
| 3.6 | Hardware Requirements | |
| 3.7 | Software Requirements | |
| 3.8 | Development Tools | |
| | **CHAPTER FOUR — SYSTEM DESIGN** | |
| 4.1 | System Architecture | |
| 4.2 | Database Design | |
| 4.3 | Entity–Relationship Design | |
| 4.4 | Database Constraints and Indexes | |
| 4.5 | API Design | |
| 4.6 | User Interface Design | |
| | **CHAPTER FIVE — SYSTEM IMPLEMENTATION** | |
| 5.1 | Frontend Implementation | |
| 5.2 | Backend Implementation | |
| 5.3 | Database Implementation | |
| 5.4 | Search and Filtering | |
| 5.5 | Staff Profile Modal | |
| 5.6 | Error Handling and Security | |
| | **CHAPTER SIX — TESTING AND RESULTS** | |
| 6.1 | Testing Strategy | |
| 6.2 | Test Environment | |
| 6.3 | Test Cases and Results | |
| 6.3.1 | Verification of the Expanded Tasks (Tasks 1–6 and the Task 7 final smoke) | |
| 6.4 | Final Quality Assurance Summary | |
| 6.5 | Discussion of Test Results | |
| | **CHAPTER SEVEN — SYSTEM RESULTS AND DISCUSSION** | |
| 7.1 | Interface Output | |
| 7.2 | API Output | |
| 7.3 | Database Structure | |
| 7.4 | Main Application | |
| 7.5 | Evidence and Screenshot Index | |
| 7.6 | Expanded-Scope Interface Output (Figures 14–35) | |
| | **CHAPTER EIGHT — CONCLUSION AND RECOMMENDATIONS** | |
| 8.1 | Conclusion | |
| 8.2 | Recommendations | |
| — | References | |
| — | Appendix A — API Endpoints | |
| — | Appendix B — Database Tables | |
| — | Appendix C — Project Structure | |
| — | Appendix D — Testing Summary | |
| — | Appendix E — Screenshot / Evidence Index | |
| — | Appendix F — Post-Production Verification | |

---

## CHAPTER ONE — INTRODUCTION

### 1.1 Background of the Study

Every functioning organization is built around its people. Knowing who works there, what they do,
which department they belong to, and how they can be reached is fundamental to day-to-day
operations. Staff information is therefore not an administrative luxury but a practical operational
requirement: it supports internal communication, helps new employees settle in, assists managers in
locating colleagues, and reduces the time lost to asking around for contact details.

For a very long time, this information was maintained manually. Personnel details were written into
registers, kept in filing cabinets, and maintained in typed or handwritten documents. As an
organization grows, manual storage becomes progressively harder to manage. Records are updated in one
place but not another, files are mislaid, duplicate entries appear, and no single document can be
trusted as the authoritative version of the truth. Locating one person's record may require
consulting several registers and asking several colleagues.

The arrival of affordable personal computers and organizational networks changed this situation.
Spreadsheet software allowed staff lists to be maintained electronically, but spreadsheets have
important limitations. They are typically stored on individual computers, they are difficult to
search intelligently, they do not enforce relationships between a person and a department, and they
quickly become inconsistent when several people edit copies independently. A spreadsheet answers the
question "who is in the spreadsheet?" far better than it answers "who works in Finance?".

A logical next step is to place the data in a **relational database**. A database provides
durability, integrity and, most importantly, the ability to ask structured questions using a query
language. In the earlier era this required a dedicated database server and specialist administration.
Modern software, however, allows a small or medium-scale system to be delivered as a single
executable application with an embedded database, requiring no separate database installation and
no specialist server administration.

The second major change is the shift from desktop software to the **web**. A web-based application is
reached through a browser, which means it requires no installation on the user's machine and works
across different operating systems. A user who opens a URL sees the most current version of the
information, because there is only one copy of the data, held centrally. Web technology also
supports a level of presentation and interactivity that paper records or spreadsheets cannot offer,
and it allows a service to be designed for smaller screens as well as desktops.

This project is situated within that tradition. It asks a modest but genuinely useful question — how
can an organization make its staff information easy to find? — and answers it with a web application
built on a Node.js back end, an Express.js REST API, a SQLite relational database and a responsive
front end written in HTML5, Tailwind CSS and Vanilla JavaScript.

### 1.2 Problem Statement

Staff information in many organizations is stored in whatever form was convenient at the time it was
first recorded. In practice this commonly means a mixture of spreadsheet files held on individual
computers, printed documents in folders, notes kept on individual staff members' own records, and
one-off lists maintained by different departments for different purposes. Each of these sources may
be individually correct, but together they are fragmented.

The practical consequences of this fragmentation are consistent and predictable:

* **Fragmentation and duplication.** The same person may appear in several lists, with slightly
  different details in each. There is no single authoritative record.
* **Slow retrieval.** Locating one person's contact details may mean searching several spreadsheets,
  asking several colleagues, or physically locating a folder. Simple questions take a long time to
  answer.
* **Poor filtering.** Paper records and spreadsheets cannot easily be narrowed by an attribute such
  as department, role or employment status. Producing "all current Finance staff" from a flat list
  normally means reading manually through every row.
* **Lack of centralized presentation.** Because there is no shared presentation layer, there is no
  consistent way to display the information. Every user sees a different format, if they see anything
  at all.
* **Inaccessible on other devices.** Documents stored on a particular computer are not readily
  available from a phone, a tablet or a shared meeting-room screen.
* **Update difficulties.** A change of phone number or job title must be propagated manually to
  every location where the person is recorded.

The purpose of this project is to design and implement a system that resolves these difficulties by
creating a single, centralized, searchable and responsive directory of staff information.

**A necessary clarification.** No specific defective legacy system at the host organization has been
documented, audited or evaluated during this project. The problems described above are the general
and widely documented difficulties of decentralized staff information storage. They are stated here
as the design motivation for the project, and they are not presented as a verified audit finding
about Rids Cloud Digital Solution's existing internal arrangements. No such audit was undertaken,
and the data presented in this system is fictional demonstration data rather than the
organization's real staff records.

### 1.3 Aim of the Project

The aim of this project is to design, develop, implement and test a web-based Staff Directory Web
Application that centralizes organizational staff information in a relational database and presents
it through a responsive, searchable and filterable web interface, so that any user can quickly locate
and inspect the information they need.

### 1.4 Objectives of the Project

The project was pursued by pursuing the following specific objectives. Each objective corresponds to
work actually carried out and verified in the delivered system.

1. **To design a relational database** for staff information that stores departments, roles and staff
   records, with appropriate keys, constraints and relationships to preserve data integrity.
2. **To implement a REST API** that exposes staff, department and role data to the front end over
   HTTP, using a consistent request and response structure.
3. **To develop a responsive front end** using HTML5, Tailwind CSS and Vanilla JavaScript that
   presents staff information clearly on desktop, tablet and mobile viewports.
4. **To implement search** so that a user can find a staff member by first name, last name, full
   name, email address or job title, using partial and case-insensitive matching.
5. **To implement filtering** by department, by role and by employment status, so that the visible
   result set can be narrowed to the group of interest.
6. **To implement combined filtering**, so that search and the three filter controls can be applied
   together, with all criteria required to match.
7. **To implement a staff profile modal** that displays a staff member's complete record on demand
   without leaving the directory, and that can be operated comfortably with a keyboard.
8. **To integrate the front end, the API and the database** into a single runnable application that
   serves both its interface and its data from one origin.
9. **To test the system** for functionality, API correctness, interface behaviour, responsiveness,
   accessibility and error handling, and to record the results of those tests.

The directory objectives above were completed first and verified. The owner then approved an
expanded scope under SIWES task supervision, which added the following further objectives, each of
which was likewise implemented and verified:

10. **To implement administrator authentication** — both backend (`register`, `login`, `logout`,
    `me`) and interface (Sign In / Sign Up screens, account view, session detection on page load) —
    storing passwords only as salted `scrypt` hashes and sessions in a dedicated table carried in an
    `HttpOnly`, `SameSite=Lax`, seven-day cookie.
11. **To implement administrator-only staff creation**, protected by the session, so that a new
    staff record is written through the API and appears in the directory immediately.
12. **To implement task management** — a `tasks` table, seven protected endpoints and a
    signed-in-only Tasks screen — covering task creation, assignment to a staff member, editing,
    reassignment, status changes, deletion after a confirmation, and filtering by staff, status and
    priority.
13. **To implement an administrator dashboard** that recomputes its summary counts (staff totals,
    task totals, per-status and overdue breakdowns) and its workload lists (overdue, top open-task
    staff, recently updated tasks) from the live database on every visit, and that links into the
    Directory and Tasks views with filters pre-applied.

### 1.5 Scope of the Project

The scope of the project was defined at the outset in order to keep the work achievable within the
SIWES period and to keep the delivered system verifiable.

#### 1.5.1 In Scope

The following are within the scope of the project and were implemented:

* A **staff directory** that lists staff members as individual, visually structured cards.
* **Staff profiles** showing name, job title, department, role, email address, telephone number,
  location, employment status and biography.
* **Search** across name, email address and job title.
* **Filtering** by department, by role and by employment status.
* **Combined filtering**, in which all active criteria apply together.
* A **read-only REST API** for staff, departments, roles and service health.
* **Relational storage of all application data** — SQLite in local development and testing, and
  PostgreSQL in the production deployment.
* A **responsive user interface** that adapts to mobile, tablet and desktop viewport widths.
* **Accessible interaction**, including keyboard operation of the profile modal, a skip-to-content
  link, visible focus indicators and appropriate ARIA attributes.
* **Graceful handling** of loading, empty-result and error conditions.
* **Documentation and evidence**, including this report, the project documentation, the entity–
  relationship diagram and the system architecture diagram.

The following were added to the scope when the owner approved the expanded tasks described in
Section 1.4:

* **Administrator authentication and authorization** — registration, sign-in, sign-out, session
  restoration and principal detection, enforced by a session-checking middleware on the routes that
  change data.
* **Administrator-only staff creation** through a protected API endpoint and an Add Staff screen.
* **Task management** — a `tasks` table, seven protected task endpoints and a signed-in-only Tasks
  screen covering create, edit, reassign, status change, delete and filter operations.
* **An administrator dashboard** that recomputes staff and task summaries from the live database.

#### 1.5.2 Out of Scope

The following remain deliberately excluded. They are not implemented, are not claimed to be
implemented, and are not part of the delivered system:

* **Staff editing and deletion through the interface** — staff records can be created by an
  administrator but cannot yet be edited or deleted from the application.
* **Role-based permissions** — every administrator account has the same single administrative role;
  there is no concept of multiple permission levels.
* **Account recovery or self-service password reset.**
* **Audit logging** of administrator actions such as staff creation and task changes.
* **Payroll processing.**
* **Attendance recording.**
* **Leave management.**
* **Recruitment management.**
* **Performance appraisal or performance management.**
* **Complex human-resource administration**, such as disciplinary records, promotion history,
  training logs or benefits administration.
* **Multi-user write concurrency and pagination of large result sets.** (The production deployment
  itself was carried out after this report's first draft and is recorded in Appendix F.)

The authentication boundary is worth stating precisely: **every visitor can read the directory
without signing in, but only a signed-in administrator can create staff members, manage tasks or
open the dashboard, because those routes answer HTTP 401 without a valid session.** The directory
already existed and its endpoints were deliberately left unchanged so that the public read side of
the application still works exactly as the original design specified.

### 1.6 Significance of the Project

**Significance to organizations.** A centralized staff directory reduces the time required to answer
routine questions about people. Instead of asking a colleague, searching a filing cabinet or
consulting several spreadsheets, a user opens a browser and finds the information. Because there is a
single authoritative source, the information is also more likely to be consistent. Filtered views
allow an organization to answer group-level questions — how many people are in a department, who is
currently on leave — without manual inspection. Free-text search by job title additionally makes
the organization discoverable by function, not only by name.

**Significance to staff and users.** Users obtain a fast, consistent and mobile-compatible way to find
a colleague's contact details, and the profile dialog concentrates the useful information about a
person in one place. Because the interface is responsive, the same system serves a desktop in an
office and a phone in a meeting. Support staff can answer a colleague's question by looking at the
directory rather than by searching independently.

**Significance to developers and students.** The project demonstrates the complete life cycle of a
small information system: requirements identification, relational database design, entity–relationship
modelling, API design, layered back-end implementation, front-end implementation, responsive design,
accessibility, security awareness and structured testing. The deliberate choice of a small, readable,
SQL-native stack means that every layer can be understood without first learning a large framework,
which makes the project suitable as a learning vehicle as well as a working application.

**Significance for future enhancement.** The architecture separates routes, controllers,
repositories, the data layer, the API client and the rendering layer. This separation was proven in
practice when the expanded tasks added authentication, staff creation, task management and a
dashboard without touching the public directory endpoints. The same seam means further capabilities
can be added — staff editing and deletion, pagination, role-based permissions, a different database
engine or a different front-end framework — without rewriting the whole system. The relational
schema can also grow into a genuine human-resource system by adding tables and foreign keys, since
the existing relationships are already modelled correctly.

### 1.7 Limitations of the Project

The following limitations are genuine and are stated plainly rather than presented as resolved:

1. **Fictional demonstration data.** The database contains 18 fictional staff records created by the
   seed process for demonstration and testing. They do not represent real employees of Rids Cloud
   Digital Solution or of any other organization. The records use reserved example-domain email
   addresses so that they cannot be mistaken for, or accidentally contact, real people.
2. **One CSS build step, no runtime internet dependency.** The interface previously loaded Tailwind
   CSS at runtime from a public Content Delivery Network (`https://cdn.tailwindcss.com`). That
   dependency has been removed: the utility classes are now compiled ahead of time into
   `public/assets/css/tailwind.css`, which is committed and served as a normal same-origin file, so
   the interface no longer needs internet access to render correctly and can no longer show a flash
   of unstyled content. The trade-off is that the compiled file must be regenerated
   (`npm run build:css`) whenever a Tailwind class is added or changed in `index.html` or in the
   JavaScript modules.
3. **Two database engines in two roles.** Local development and the automated test suite use a
   single SQLite file at `data/staff-directory.db`; the live deployment uses a hosted PostgreSQL
   database (Supabase) selected automatically when `DATABASE_URL` is set. SQLite remains appropriate
   for local demonstration and testing, while PostgreSQL is what production uses. Behaviour under
   concurrent multi-user load has not been tested on either engine.
4. **Single-role authentication only.** The application authenticates administrators and protects
   the data-changing routes, but it implements a single administrative role. There is no granular
   role-based access control (for example, separate viewer, editor and manager permissions), no
   account recovery, and no self-service password reset.
5. **Production deployment is limited and only partly verified.** The application is deployed as
   two Render services — a static frontend and an Express/PostgreSQL backend — and the live
   administrator sign-in, the health endpoint and the database connection have been verified (see
   Appendix F). However, workflows such as creating records or managing tasks have **not** been
   exercised on the live site, data persistence across a restart or redeploy has **not** been
   tested, and no load, compatibility or penetration testing has been performed.
6. **Native module dependency.** The `better-sqlite3` package is a native add-on rather than pure
   JavaScript. It compiles or downloads a platform-specific binary during installation, so on some
   environments — particularly older or locked-down systems — installation may require build tools
   or may fail. This is an operational inconvenience, not a design fault, and it is a direct
   consequence of choosing a fast, SQL-native SQLite driver.
7. **Partial automated test coverage.** A maintained automated test suite now exists and is
   committed to the repository (run with `npm test`, using Node's built-in `node --test`). It
   exercises configuration, both SQL dialects, the repository layer and error handling, the
   one-time migration logic, and the HTTP API end-to-end — `test/api.test.js` starts the real Express
   application on an ephemeral port and drives the controllers, middleware and routes over HTTP —
   119 tests at the time of writing. The suite runs against SQLite only: it does **not** cover the
   front-end browser workflows (search, filters, profile modal, Add Staff, Tasks and Dashboard
   interaction) or the application running against the live PostgreSQL database, so those still need
   a manual pass. The larger verification recorded in Chapter Six was performed with throwaway
   harness scripts that are not part of the repository.
8. **Limited data-entry surface.** Administrators can create staff members and fully manage tasks,
   but staff records cannot yet be edited or deleted through the interface, and there is no audit
   log recording which administrator performed which action. The browser session cookie is the only
   authorization carrier.
9. **Class names must stay literal.** Tailwind's build step emits only the utility classes it finds in
   the files named by `tailwind.config.js` (`public/index.html` and `public/assets/js/**/*.js`). The
   status and priority colour classes are therefore written as complete literal strings rather than
   assembled from fragments; composing a class name at runtime (for example `'bg-' + colour + '-100'`)
   would produce a class that is never generated. This is a normal constraint of a static Tailwind
   build and is why the JavaScript keeps those strings whole.
10. **Deployment depends on external configuration.** Data persistence in production relies on the
    Supabase PostgreSQL service, and the front end reaches the API through an `/api` rewrite
    configured in the Render dashboard. Neither is defined in this repository, and the `render.yaml`
    Blueprint does not describe the live two-service topology, so the deployment cannot be
    reproduced from the repository alone.

These limitations do not invalidate the project, which was designed to demonstrate and verify the
core objective within a realistic attachment period. They define the boundary between what was
delivered and what would be required for production use.

---

## CHAPTER TWO — LITERATURE / CONCEPTUAL REVIEW

> **Note on referencing.** This chapter discusses the concepts on which the project is based. Formal
> academic citations have deliberately **not** been fabricated. Where a scholarly source is required
> by the department's guidelines, the marker `[Reference to be added]` indicates where it must be
> inserted. No authors, publication years, journal names, volume numbers, DOI identifiers or URLs
> have been invented.

### 2.1 Staff Information Management Systems

A staff information management system is any arrangement by which an organization records,
maintains and retrieves data about its employees. In its simplest form this is a register; in its
most developed form it is a Human Capital Management or Human Resource Information System.

The literature on organizational record keeping consistently identifies a progression. Early systems
were **transactional and manual**, designed mainly to record the fact of employment, payroll and
statutory deductions. As organizations became more complex, attention shifted toward **personnel
information systems** that sought to answer operational questions about the workforce. More
recently, the emphasis has moved toward **knowledge and self-service systems**, in which staff can
retrieve information about themselves and their colleagues directly, rather than requesting it from
an administrator `[Reference to be added]`.

Three characteristics of a staff directory are worth distinguishing from the wider human-resource
domain. First, a directory is fundamentally **read-oriented**: its primary purpose is retrieval and
presentation, not calculation or transaction. Second, a directory is **organization-wide and
heterogeneous**, covering every department and role rather than one specialized function. Third, a
directory is **high-read, low-write**: records change occasionally but are consulted frequently, so
the design priority is fast, forgiving retrieval.

A staff directory therefore occupies a simpler position in the information-systems landscape than a
full human-resource system. This project deliberately remains at that simpler level, which is why
payroll, attendance, leave and recruitment are excluded from scope (Section 1.5.2). Understanding
this boundary was an important conceptual step, because it prevented the project from expanding into
an unsupportable enterprise system.

### 2.2 Web-Based Information Systems

A web-based information system delivers its interface and its data through the HTTP protocol so that
users interact with it through a browser rather than an installed program.

The central advantages of this model are **centralization** and **reach**. Because all users request
data from one server-side source, there is one authoritative copy of the information, and updates
take effect immediately for every user. Because the client is a browser, no installation is required
and the system is reachable from any device with a network connection, subject to the security
controls in place.

The corresponding disadvantages must be acknowledged. A web client depends on network availability
and on a server that is running. Where client-side code depends on an external network resource, the
application is degraded when that resource is unreachable; this is a general risk of externally hosted
assets rather than a requirement of the architecture. Web systems also introduce a security surface
that does not exist in a
single-user desktop program: data crosses the network and reaches the browser as text, so both the
transport and the client-side rendering must be handled carefully.

The literature distinguishes between **thick** and **thin** clients. A thick client performs
considerable processing on the client machine; a thin client delegates most processing to the server
and returns data for display. Most web applications fall somewhere between these extremes. This
project uses a thin-client data model — the front end requests JSON records and renders them, while
search, filtering and data access are performed server-side in SQL. This is discussed further in
Section 2.8.

### 2.3 Relational Database Systems

The relational model, introduced by E. F. Codd in 1970, represents data as a set of *relations*, each
realized as a *table* of rows and columns `[Reference to be added]`. Its central idea is that data
should be stored once, in a structured way, so that meaning is carried by the structure itself rather
than by the formatting of a document.

Three properties distinguish the relational approach and are directly relevant to this project:

* **Logical independence.** The way data is organized is separated from the way it is used.
* **Physical independence.** Storage and access methods can be changed without altering the logical
  schema.
* **Data independence.** Applications can be written against the logical schema and continue to work
  when the physical implementation changes.

Relational design is governed by **normalization**, the process of organizing attributes so that each
piece of information is stored once and in one place. This prevents the *update anomaly*, where
changing one fact requires changing it in many rows; the *insertion anomaly*, where a fact cannot be
recorded without recording some unrelated fact; and the *deletion anomaly*, where removing one fact
accidentally removes another.

Normalization must be balanced against *denormalization* and against readability. In this project,
the department name and role name are stored once in their own tables and **not** copied into the
`staff` table. Instead, the staff record holds foreign keys, and the names are retrieved with a join.
This is the normalized choice, and it is the correct one: renaming a department requires changing one
row in `departments`, not eighteen rows in `staff`.

The relational model is enforced in practice by **constraints**. A *primary key* uniquely identifies
a row; a *unique constraint* forbids duplicates in a column; a *foreign key* enforces that a value in
one table refers to an existing row in another. These constraints move correctness from the
application code, where it is easy to forget, into the database, where it is always applied. Section
4.4 documents the constraints actually implemented in this project.

### 2.4 SQLite

SQLite is a *self-contained*, *serverless*, *zero-configuration* relational database engine. In
contrast to client–server engines such as PostgreSQL or MySQL, SQLite is not a separate service that
an application connects to. It is a library that operates directly on a single ordinary file on
disk `[Reference to be added]`.

This design produces several properties that make SQLite well suited to small and embedded
applications:

* **No server process.** There is nothing to install, administer, secure or keep running. The
  database is a file; the backup strategy is a file copy.
* **ACID transactional integrity.** SQLite supports atomicity, consistency, isolation and durability,
  so a multi-statement operation either completes entirely or has no effect.
* **Standards-compliant SQL.** SQLite implements the SQL features this project requires, including
  `AUTOINCREMENT`, `LEFT JOIN`, `LIKE ... ESCAPE`, `COLLATE NOCASE`, composite conditions,
  transactions and named parameters.
* **Foreign key support.** Foreign key constraints are fully implemented, although they must be
  *enabled explicitly* for each connection; SQLite does not enforce them by default. This project
  enables them deliberately (Section 4.4).
* **Indexes.** Secondary indexes are supported and are used here to support filtering and sorting.

The same properties define SQLite's limitations. Its concurrency model is deliberately conservative:
one writer at a time, with readers blocked only during certain write operations. It has no built-in
network layer, no user-level permissions and no replication. Its single-file model also means that
the practical upper bound on a single database is the size and performance characteristics of one
file on one disk. For the dataset in this project — 18 staff records — these constraints are irrelevant
in the positive direction: the whole database is read and filtered with negligible cost. For a
system serving thousands of concurrent users, they would not be acceptable, and a server-based engine
would be required.

### 2.5 RESTful Application Programming Interfaces

REST — Representational State Transfer — is an architectural style for distributed hypermedia
systems, formulated by Roy Fielding in his doctoral dissertation `[Reference to be added]`. It is a
set of *constraints* rather than a protocol, and an interface that satisfies them can be described as
"RESTful".

The constraints relevant to this project are:

* **Client–server.** The client and server have separate responsibilities and communicate only
  through requests. This separation is what allows the interface to be replaced independently of the
  data.
* **Statelessness.** Each request from client to server must contain everything the server needs to
  understand it. The server stores no session context between requests. Statelessness improves
  scalability and visibility, at the cost of repeating information.
* **A uniform interface.** A limited, consistent set of methods is used, so that the interaction
  between client and server is predictable. The identifiers of resources are exposed as URIs.
* **Cacheability.** Responses should, where their nature permits, declare themselves cacheable, so
  intermediaries can store them.
* **Layered system.** A client cannot know whether it is communicating with the application server or
  an intermediary.

In practice, a REST interface is recognised by the combination of **resources** identified by URIs,
**HTTP methods** expressing the operation, and **representations** — usually JSON — carrying the
data. In this project, `/api/staff` is a collection resource and `/api/staff/7` identifies a single
member of it. `GET` is a safe method: it retrieves a representation and is not intended to modify
anything, which is why the seven directory endpoints are all `GET`. The decision to use `GET /api/staff`
with query parameters rather than a search sub-resource keeps the resource hierarchy flat and easy to
reason about. The endpoints that *do* modify data express that with the conventional methods — `POST`
to create or authenticate, `PUT` to replace, `PATCH` to change a status, `DELETE` to remove — so the
method vocabulary communicates intent about every route.

A consistent envelope is also part of good practice. This project returns either
`{ "success": true, "data": ... }` or `{ "success": false, "error": { "message": ... } }`, so that a
client can distinguish success from failure without inspecting the HTTP status code alone. This
envelope is documented in Section 4.5.

### 2.6 Responsive Web Design

Responsive web design is the practice of designing a single web page so that it adapts to the
viewport of the device displaying it, rather than requiring a separate page for desktops, tablets and
phones `[Reference to be added]`.

Three techniques combine to achieve this:

* **Fluid layouts** use relative units — percentages, and units relative to the viewport — so that
  elements resize proportionally instead of being fixed.
* **Flexible media and images** scale or wrap rather than overflowing their container.
* **Media queries** apply different style rules at defined breakpoints, so that the *structure* of a
  page can change, not merely its size.

Responsive design matters here because the intended user is a member of staff who may be at a desk
with a large monitor, carrying a tablet, or using a phone in a corridor. A fixed-width page forces
such a user to pan horizontally or zoom out, which is a well-documented usability failure.

A limitation of the approach adopted in this project should be noted: an earlier version of this
project loaded Tailwind CSS at runtime from a CDN rather than compiling it locally, so the utility
classes were generated in the browser after the page loads rather than being produced at build time.
That is convenient for a project of this size, and it works correctly, but it is not the recommended
approach for production because it requires an internet connection at runtime and because it applies
styling only after initial load, which can cause a brief flash of unstyled content. The current build
compiles the utility classes ahead of time (`npm run build:css`) into a committed, same-origin
stylesheet, which removes both effects.

Accessibility is closely related to but distinct from responsiveness. Responsive design addresses
*device capability*; accessibility addresses *user capability*, including users who navigate by
keyboard or use assistive technology. The delivered system addresses several accessibility
requirements: a skip-to-content link, visually visible keyboard focus indicators, form controls with
associated labels, a dialog marked with `role="dialog"` and `aria-modal="true"`, focus management
within the dialog, and a polite live region for loading state. These measures are described in
Sections 4.6 and 5.5.

### 2.7 Search and Filtering in Information Systems

Retrieval is the core function of a directory, and two distinct mechanisms are involved.

**Filtering** narrows a result set by *equality* against a controlled set of values. In this system a
user selects a department, a role or an employment status, and only records possessing that exact
value are returned. Filtering is predictable and unambiguous, and it is the appropriate mechanism for
attributes that a user knows in advance.

**Free-text search** narrows a result set by *pattern matching* against a single entered term. It
addresses the case where the user knows part of a value but not exactly which field contains it — a
surname, part of an email address, or a job title. Free-text search is more forgiving than filtering
but also less precise, which is why a well-designed directory provides both.

In a relational implementation, free-text search is normally expressed with the `LIKE` operator and
the wildcard characters `%` and `_`. Two properties require care:

* **Case sensitivity.** SQLite's default `LIKE` is case-insensitive for ASCII characters. Where
  exact comparison is required, `COLLATE NOCASE` is stated explicitly. This project relies on both
  behaviours, deliberately, so that user input does not have to match the stored case.
* **Wildcard injection.** If a user enters a value containing `%` or `_`, those characters are
  interpreted as wildcards rather than as literal text, so searching for a literal underscore would
  return unexpected results. Escaping them — and declaring the escape character with
  `ESCAPE '\'` — makes the search behave as the user intended. This project does exactly that
  (Section 5.4).

When several criteria are supplied at once, the system must decide how they relate. Combining them
with `AND` means every criterion must match, so the criteria progressively *narrow* the result set.
This is the appropriate semantics for a directory: a user who selects "Engineering" and "On Leave"
is asking for the intersection of those two groups. Combining with `OR` would instead *widen* the
result set, which is a different and less common intention. Section 5.4 documents the implemented
`AND` semantics, including the correct behaviour when the selected criteria are mutually
contradictory.

### 2.8 Client–Server Architecture

Client–server architecture divides an application into a *client* tier that presents information and
collects user input, and a *server* tier that holds data and performs the authoritative processing.
The two communicate over a network protocol using defined requests and responses.

Within this general model, a **three-tier architecture** separates the presentation, application
logic and data responsibilities:

| Tier | Responsibility | Implementation in this project |
|---|---|---|
| Presentation | Display data and accept user input | HTML5, Tailwind CSS, Vanilla JavaScript in `public/` |
| Application logic | Validate requests, apply rules, orchestrate | Express.js routes, controllers and middleware in `src/` |
| Data | Store, retrieve and enforce integrity | SQLite (`better-sqlite3`) locally and PostgreSQL (`pg`) in production, in `src/database/` |

The principal benefit of the three-tier form is **separation of concerns**: the same data can be
served to a different front end without changing the application logic, and business rules can be
changed without touching the interface. The delivered system embodies this separation literally in
its directory structure. Within the server tier, a further separation exists between controllers and
repositories: controllers handle HTTP concerns such as reading parameters and choosing status codes,
while repositories contain the SQL. Because all SQL is concentrated in the repository layer, the
queries can be read, reviewed and tested in one place.

A final architectural point concerns *where* filtering happens. This project performs filtering in
the database, not in the browser. The client sends filter criteria as query parameters and receives
only matching records. This has three consequences: the server remains the authority on what is a
valid result set; the response size does not grow with the total number of records; and the filtering
logic is expressed once, in SQL, using indexes where appropriate. The trade-off is that every filter
change requires a network round trip, which is why the search input is debounced rather than
requesting on every keystroke (Section 5.4).

---

---

## CHAPTER THREE — SYSTEM ANALYSIS AND REQUIREMENTS

### 3.1 Existing / Traditional Approach

Before designing a new system, the general characteristics of the approach it replaces must be
described. As made clear in Section 1.2, **no audit of any specific existing system at Rids Cloud
Digital Solution was carried out during this project**, and the organization is not claimed to use any
particular defective software. What follows is a description of the *general* approaches by which
staff information is commonly stored, and of their characteristics, drawn from the general problem
described in Section 1.2 and from the conceptual review in Chapter Two.

**Manual records.** Staff details held in registers, files and printed lists. Such records are
portable and do not require power, but they are slow to search, cannot be filtered mechanically,
deteriorate physically, and are lost or duplicated when files are misplaced.

**Spreadsheet files.** Staff lists maintained in spreadsheet software. Spreadsheets are widely
available and familiar, and are better than paper, but they present specific difficulties: files are
usually held on individual computers and are not shared consistently; there is no validation, so
misspellings, duplicate email addresses and inconsistent department names are common; there are no
relationships between a person and a department, so a department rename must be applied by hand
everywhere; and a spreadsheet cannot be safely searched, filtered and displayed to many concurrent
users at once.

**Disconnected files and ad-hoc lists.** Separate files maintained by different departments for
different purposes. This produces the fragmentation described in Section 1.2: the same person is
recorded in several places, no single file is authoritative, and a change made in one place is not
reflected in the others.

**Purpose-built human-resource software.** Commercial human-resource systems do solve the
fragmentation problem, but they are designed for payroll, statutory reporting and workforce
administration rather than for simply finding a colleague's phone number. They also carry licence
cost, configuration effort and training requirements that are disproportionate to a directory
requirement, and they are frequently inaccessible to a small organization or an individual placement.

The gap that this project addresses is the narrow one between unstructured storage on one side and
full human-resource software on the other: a **centralized, searchable staff directory** built from
standard, freely available web technologies. The original directory is read-only for every visitor,
and the expanded scope added a signed-in administrator's write capabilities (staff creation, task
management and a dashboard) without turning the application into the kind of payroll-and-compliance
system described above.

### 3.2 Problems Identified

Synthesizing Sections 1.2 and 3.1, the following problems were identified and are addressed by the
proposed system.

| ID | Problem | Consequence | Addressed by |
|---|---|---|---|
| P1 | Staff information is fragmented across files, spreadsheets and manual records | No single authoritative source; information conflicts | Central relational database (Sec. 4.2) |
| P2 | Locating a specific person is slow | Wasted time answering routine questions | Free-text search across name, email and job title (Sec. 5.4) |
| P3 | Records cannot be narrowed by department, role or status | Group questions require manual reading | Server-side filtering by three attributes (Sec. 5.4) |
| P4 | Several criteria cannot be applied together | Users resort to external tools or give up | Combined filtering with `AND` semantics (Sec. 5.4) |
| P5 | Full details are not available from a summary view | Users must request information from colleagues | Profile modal backed by the API (Sec. 5.5) |
| P6 | Fixed-width pages are unusable on small screens | The system cannot be used on a phone | Responsive grid and navigation (Sec. 4.6) |
| P7 | Blank or broken views appear while data loads or fails | Users cannot tell whether the system is working | Explicit loading, empty and error states (Sec. 5.6) |
| P8 | The interface cannot be operated by keyboard alone | The system excludes some users | Focus management, skip link, Escape handling (Sec. 5.5) |
| P9 | Errors expose internal details or fail silently | Users cannot recover; security may be weakened | Structured envelopes and generic messages (Sec. 5.6) |
| P10 | Data integrity depends on user discipline | Typos and duplicates corrupt the directory | Database-level constraints and foreign keys (Sec. 4.4) |
| P11 | Database access is mixed with HTTP handling | The system is hard to maintain or extend | Layered routes/controllers/repositories (Sec. 5.2) |

### 3.3 Proposed System

The proposed solution is a three-tier web application in which all staff information is held in a
relational database — SQLite for local development and testing, PostgreSQL in the production
deployment — and served over a REST API to a responsive browser interface. The public side of the API
is read-only; a protected set of administrator capabilities (authentication, staff creation, task
management and the dashboard) extends the original directory without changing any of its public
endpoints.

In operation, the system works as follows:

1. A user opens the application in a browser, which requests the interface from the server.
2. The front end issues three parallel requests — for departments, roles and staff — and the server
   answers each from the database. The front end detects on page load whether a valid
   administrator session exists and switches the navigation accordingly.
3. The front end populates the filter controls from the department and role lists and renders the
   staff records as cards.
4. When the user types a search term or selects a filter, the front end sends the criteria to the
   API, which builds a parameterized SQL query, executes it and returns only the matching records.
5. When the user activates a staff card, the front end requests that individual's record from the
   single-record endpoint and displays it in a modal dialog.
6. A signed-in administrator can additionally register or sign in, create a staff member through
   the Add Staff screen (the record is written through the protected endpoint and appears in the
   directory immediately), manage tasks in the Tasks screen, and open the Dashboard, which
   recomputes its summary from the live database.
7. If any request fails, the interface presents a controlled error message with a retry action
   instead of a broken page; an unauthenticated administrator action is answered with the standard
   401 session response and routes the user to sign-in. The underlying cause is written to the
   server or browser console rather than to the page.

This design deliberately keeps the server as the authority. The database enforces integrity, the
repository layer decides what matches, the controllers decide what a valid request is, the session
middleware decides whether a protected action is permitted, and the front end decides only how to
display the result. Each of these decisions is made in exactly one place.

### 3.4 Functional Requirements

The following functional requirements were specified and implemented. Each is traceable to a
verified behaviour described in Chapter Six.

| ID | Requirement | Implementation | Verified by |
|---|---|---|---|
| FR1 | The system shall display all staff in the directory | `GET /api/staff` rendered as cards in `ui.js` | TC-04, Figure 01 |
| FR2 | The user shall be able to search staff by free text | `search` query parameter; fields: first name, last name, full name, email, job title | TC-08 to TC-10, Figure 02 |
| FR3 | The user shall be able to filter by department | `department` query parameter, matched against department name | TC-11, Figure 03 |
| FR4 | The user shall be able to filter by role | `role` query parameter, matched against role name | TC-12, Figure 04 |
| FR5 | The user shall be able to filter by employment status | `status` query parameter, matched case-insensitively | TC-13 |
| FR6 | Search and all three filters shall be combinable, with `AND` semantics | Conditions joined with `AND` in a single `WHERE` clause | TC-14, Figure 05 |
| FR7 | The user shall be able to clear all filters and restore the full list | `clear-filters` control resets state and re-requests | TC-15 |
| FR8 | The user shall be able to view a complete staff profile | `GET /api/staff/:id` displayed in the profile modal | TC-17, Figure 06 |
| FR9 | A query matching no records shall produce an explicit empty state, not a blank grid | `GET` returns an empty `data` array with HTTP 200; `ui.js` shows the empty view | TC-16, Figure 07 |
| FR10 | While data is loading, the system shall show a loading indication | Skeleton cards with `aria-live="polite"` and `aria-busy` | TC-04 |
| FR11 | On failure, the system shall show a controlled error message and allow retry without a page reload | Error view with retry button; retry repeats the failed request | TC-20, TC-21 |
| FR12 | The directory shall be operable by keyboard alone | Skip link, visible focus, Escape to close, focus return | TC-17, TC-18 |
| FR13 | The layout shall adapt to mobile, tablet and desktop widths | Tailwind responsive grid; sidebar at 1024px and above; mobile header below | TC-19 |
| FR14 | The system shall expose department and role lists for populating the filter controls | `GET /api/departments`, `GET /api/roles` | TC-06, TC-07 |
| FR15 | The system shall provide a service health endpoint | `GET /api/health` returns status, service name and uptime | TC-03 |
| FR16 | An administrator shall be able to create an account through the application | `POST /api/auth/register` creates an administrator row (salted scrypt hash) and starts a session | Task 1, FR-set |
| FR17 | The system shall sign an administrator in and sign them out | `POST /api/auth/login`, `POST /api/auth/logout`; the same generic 401 is returned whether the account is missing or the password is wrong | Task 1, FR-set |
| FR18 | The system shall restore the signed-in principal on page load and reject expired sessions | `GET /api/auth/me`; sessions expire after seven days and are deleted on logout | Task 1, Task 2, Task 7 |
| FR19 | Protected administrator actions shall be refused without a valid session | `authenticate` middleware answers HTTP 401 on `POST /api/staff`, all task routes and the dashboard when the session is missing or invalid | Task 1, H1–H3 |
| FR20 | A signed-in administrator shall be able to add a staff member and see it in the directory | Protected `POST /api/staff` writes the record; the Add Staff screen and the directory refresh immediately | Task 3, Task 7 (S2–S5) |
| FR21 | A signed-in administrator shall be able to create, edit, reassign, change the status of and delete tasks | Seven protected task endpoints; the Tasks screen exposes the full lifecycle | Task 4, Task 5, D8–D15 |
| FR22 | Task lists shall be filterable by staff, status and priority, with clear/combined filters | Validated `staff_id`, `status`, `priority` query parameters; filter-controls on the Tasks screen | Task 5 |
| FR23 | The dashboard shall recompute staff and task summaries from the live database | `GET /api/admin/dashboard` aggregates directly in SQL at request time; totals, per-status and overdue counts, overdue/top-staff/recent lists | Task 6, H12–H20 |
| FR24 | A zero-data database shall render all-zero counts and explicit empty states | Dashboard and directory return empty arrays / zero counts, never fabricated numbers | Task 6 (E-series, zero-data browser checks) |
| FR25 | Dashboard summary cards and rows shall link into Directory and Tasks with their filters pre-applied | Filter-intent hashes such as `#tasks?status=Pending` and `#directory?department=…` | Task 6 browser checks

### 3.5 Non-Functional Requirements

**Usability.** The system shall be usable without training or instruction. Primary functions shall be
reachable from the first screen. Labels shall describe the control's purpose, counts shall be
pluralized correctly, and absence of a value shall be shown as a neutral dash rather than as
`null`, `undefined` or an empty gap. Search shall be forgiving: partial terms and differences in case
shall still match.

**Responsiveness.** The interface shall remain usable and free of horizontal scrolling at viewport
widths of 375px, 768px and 1440px, adapting its column count and navigation accordingly.

**Performance.** Interactive operations should feel immediate. Search input is debounced by 300
milliseconds so that a request is not issued on every keystroke, and responses are rendered through a
document fragment so that a full re-render performs a single DOM update. Filtering is executed in
SQL against indexed columns rather than in the browser.

**Maintainability.** Responsibilities shall be separated by layer: HTTP routing, request handling,
SQL and rendering shall not be mixed. All SQL shall be concentrated in the repository layer. Front-end
modules shall communicate through a small, explicit public surface rather than by reaching into one
another's internals.

**Accessibility.** Every interactive control shall be reachable and operable by keyboard, with a
visible focus indicator. Form controls shall have associated labels. The profile dialog shall be
marked as a modal dialog, shall keep keyboard focus within itself while open, shall close on Escape
and on backdrop activation, and shall return focus to the element that opened it. Status changes
shall be announced through appropriate ARIA attributes. Decorative images shall have empty `alt`
text so they are not announced redundantly.

**Security.** Database access shall use parameterized queries rather than string concatenation of user
input. Client-supplied identifiers shall be validated before use. User-supplied text shall be written
to the page with safe DOM APIs rather than interpreted as markup. The API shall not disclose stack
traces or internal error details to clients, and shall return consistent error envelopes with
appropriate status codes. Foreign keys shall be enabled so referential integrity is enforced by the
database. Passwords shall be stored only as salted `crypto.scrypt` hashes and never returned by any
endpoint; session tokens shall be opaque, server-side, carried in an `HttpOnly`, `SameSite=Lax`
cookie (marked `Secure` in production), expire after seven days, and be checked by a dedicated
middleware on every route that changes data. Administrator responses shall expose only identity
fields — never password hashes or session material.

**Reliability.** The system shall recover gracefully from failure. A failed initial load shall show an
error state and a retry action. A failed filter request shall preserve the last successful results on
screen rather than blanking the page. Out-of-order responses shall not overwrite newer results.
Re-running the database seed shall not duplicate records.

**Portability.** The application shall run on a development machine without a separate database
server, and shall be configurable through environment variables rather than hard-coded values.

### 3.6 Hardware Requirements

The requirements of this project are modest, which is one of the practical benefits of the chosen
stack.

| Component | Requirement | Rationale |
|---|---|---|
| Computer | Any modern laptop or desktop, 64-bit, 2018 or later | Runs Node.js and a current browser |
| Processor | Dual-core or better | SQLite operations in this project are negligible |
| Memory | 4 GB RAM minimum; 8 GB recommended | Node.js plus a browser and the database |
| Storage | ~500 MB free for the application, dependencies and database | Database file is a few hundred kilobytes |
| Display | 1024 x 768 or larger recommended; any size works | Interface is responsive from 375px upward |
| Input | Keyboard and mouse or trackpad; touch supported | Search and filters require typing; cards are activated by tap or click |
| Network | Required during installation and to rebuild the Tailwind CSS; **not** required at runtime | See Section 1.7, limitation 2. The compiled stylesheet is served from the application itself, so the interface renders correctly with no internet access. |

No server hardware, GPU, dedicated storage array or network-attached storage is required.

### 3.7 Software Requirements

**Development and runtime environment**

| Software | Version used | Purpose |
|---|---|---|
| Node.js | 22 or newer (`package.json` declares `engines.node` as `>=22`; the Render service sets `NODE_VERSION=22`) | JavaScript runtime for the server |
| npm | Bundled with Node.js | Dependency installation and script execution |

**Back-end**

| Software | Version | Purpose |
|---|---|---|
| Express.js | ^5.2.1 | HTTP server, routing, static file serving |
| better-sqlite3 | ^13.0.3 | Synchronous SQLite driver; local development and tests |
| SQLite | 3 (bundled with better-sqlite3) | Local relational storage engine |
| `pg` | ^8.23.1 | PostgreSQL client for the production database |
| PostgreSQL | Hosted (Supabase) | Production relational storage engine |
| nodemon | ^3.1.10 (development only) | Automatic server restart during development |

**Front end**

| Technology | Role |
|---|---|
| HTML5 | Page structure, semantics and accessibility attributes |
| Tailwind CSS 3.4.17 (compiled locally) | Utility-first styling and responsive layout; built ahead of time by `npm run build:css` |
| Vanilla JavaScript | All client behaviour; no framework or bundler (the only build step is the Tailwind CSS compile) |
| Native `fetch()` API | HTTP requests to the REST API |

**Browser**

A current Chromium-based browser (Google Chrome, Microsoft Edge), or Mozilla Firefox, with support
for `fetch`, CSS Grid, custom properties and ES2020+ JavaScript.

**Platform note.** The project is developed on Windows but contains no platform-specific code paths;
paths are resolved with Node's `path` module and the application runs on macOS and Linux without
modification.

### 3.8 Development Tools

| Tool | Use in this project |
|---|---|
| Visual Studio Code | Source editing, syntax highlighting, integrated terminal |
| Terminal / shell | Installing dependencies, running the server, running the seed script, version control |
| Git | Version control; incremental commits during development |
| GitHub | Private remote repository for the source code |
| Browser developer tools | Inspecting the DOM, verifying API responses in the Network panel, checking the console for errors, and emulating responsive viewport widths |
| `npm` | Managing dependencies and running the defined scripts (`start`, `dev`, `build:css`, `test`, `db:init`, `db:seed`, `db:migrate:pg`) |

---

## CHAPTER FOUR — SYSTEM DESIGN

### 4.1 System Architecture

The system is a three-tier client–server application. The complete architecture is shown in
**Figure 13** (`screenshots/13-system-architecture.png`).

The request flow is as follows:

```
User (browser)
      |
      v
HTML5 + Tailwind CSS + Vanilla JavaScript   (presentation tier)
      |
      v  fetch()  ->  /api/*  (public GET directory routes +
      |                        protected auth / staff-create /
      |                        task / dashboard routes)
Express.js REST API                          (application tier)
      |
      v
routes  ->  controllers  ->  middleware (authenticate, parseCookies)
      |
      v
repositories
      |
      v
database layer  (src/database/db.js)
      |
      +-- better-sqlite3  ->  SQLite file  (local, data/staff-directory.db)
      |
      +-- pg  ->  PostgreSQL  (production, Supabase)
```

**Presentation tier.** `public/index.html` defines the page structure, and nine Vanilla JavaScript
modules under `public/assets/js/` divide the client behaviour into separate responsibilities:
`api.js` performs HTTP requests, `ui.js` builds DOM elements, `filters.js` owns the filter state,
`modal.js` owns the profile dialog, `auth.js` owns sign-in, sign-up, sessions and the account view,
`staff-create.js` owns the Add Staff form, `tasks.js` owns the Tasks screen, `dashboard.js` owns the
Dashboard screen, and `app.js` coordinates startup and routing. No module duplicates another's work,
and none constructs an HTML string.

**Application tier.** `server.js` creates the HTTP listener and delegates to the Express application
in `src/app.js`. The application registers JSON body parsing, `parseCookies` (which reads the
`admin_session` cookie), static file serving for `public/`, seven route groups (health,
authentication, dashboard, departments, roles, staff and tasks), a not-found handler and a
centralized error handler, in that order. Requests are then dispatched through **routes** (which map
URIs to controller functions), **controllers** (which read and validate parameters, invoke the
appropriate repository and choose a status code), **`authenticate` middleware** (which rejects
requests to protected routes without a valid session), and **repositories** (which contain the SQL and
map database rows to response objects). Password hashing and session handling are isolated in
`src/services/passwordService.js` and `src/services/sessionService.js`.

**Data tier.** `src/database/db.js` is a small facade that selects the engine from the environment:
with `DATABASE_URL` set it uses a pooled PostgreSQL connection (`pg`, applying
`schema.postgres.sql`); otherwise it opens the local SQLite file lazily, enabling foreign key
enforcement and WAL journaling and applying `schema.sql` on initialization. Each repository (`staff`,
`department`, `role`, `admin`, `session`, `task`, `dashboard`) executes prepared statements and
returns plain objects.

**Not implemented in this architecture.** There is no caching proxy, no message queue, no container
orchestration and no cloud service beyond the optional deployment target. The application runs as a
single Node.js process on a single machine, and authentication is local: sessions live in the
application's own `admin_sessions` table rather than in any external identity provider.

### 4.2 Database Design

The database was designed relationally and consists of six tables, as shown in **Figure 12**
(`screenshots/12-er-diagram.png`): the original `departments`, `roles` and `staff` tables, plus
`admins`, `admin_sessions` and `tasks` added by the expanded tasks.

#### 4.2.1 The `departments` Table

Stores the organizational units to which staff belong.

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| `id` | INTEGER | **PRIMARY KEY AUTOINCREMENT** | Stable identifier |
| `name` | TEXT | **NOT NULL, UNIQUE** | Department name as displayed and filtered |
| `description` | TEXT | Nullable | Purpose of the department |
| `created_at` | TEXT | **NOT NULL**, default `datetime('now')` | Creation timestamp |

#### 4.2.2 The `roles` Table

Stores the job functions held by staff. Roles are deliberately modelled **separately from job
titles**: a department is *where* a person works, a role is *what kind of work* they do, and
`job_title` is the specific title. This distinction is why the system can filter by "which function"
independently of "which department".

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| `id` | INTEGER | **PRIMARY KEY AUTOINCREMENT** | Stable identifier |
| `name` | TEXT | **NOT NULL, UNIQUE** | Role name as displayed and filtered |
| `description` | TEXT | Nullable | Responsibility of the role |
| `created_at` | TEXT | **NOT NULL**, default `datetime('now')` | Creation timestamp |

#### 4.2.3 The `staff` Table

Stores the directory records themselves.

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| `id` | INTEGER | **PRIMARY KEY AUTOINCREMENT** | Stable identifier |
| `first_name` | TEXT | **NOT NULL** | Given name |
| `last_name` | TEXT | **NOT NULL** | Family name; also the primary sort key |
| `email` | TEXT | **NOT NULL, UNIQUE** | Contact address |
| `phone` | TEXT | Nullable | Contact telephone |
| `job_title` | TEXT | **Nullable** | Specific job title, e.g. "Senior Backend Developer" |
| `department_id` | INTEGER | Nullable, **FOREIGN KEY** → `departments(id)` | Owning department |
| `role_id` | INTEGER | Nullable, **FOREIGN KEY** → `roles(id)` | Held role |
| `location` | TEXT | Nullable | Office or city |
| `avatar_url` | TEXT | Nullable | Path to an avatar image |
| `bio` | TEXT | Nullable | Short biography |
| `employment_status` | TEXT | **NOT NULL**, default `'Active'` | Active / On Leave / Inactive |
| `created_at` | TEXT | **NOT NULL**, default `datetime('now')` | Creation timestamp |
| `updated_at` | TEXT | **NOT NULL**, default `datetime('now')` | Last update timestamp |

**A note on nullability, which is documented here because it is easy to misstate.** The columns
`job_title`, `department_id`, `role_id`, `location`, `avatar_url` and `bio` are **nullable in the
implemented schema** — that is, they do not carry a `NOT NULL` constraint. Only `first_name`,
`last_name`, `email` and `employment_status` are mandatory. This is a deliberate design position: it
allows a staff member to be recorded even when a department, a role or a job title is genuinely not
yet known, which is common when someone joins an organization or when a role is being redefined.
The application code respects this: the `staff` queries use `LEFT JOIN` so that a record with no
department or role still displays correctly, and the interface renders an em dash for absent values.

It should be noted that all 18 seeded records happen to have both a department and a role populated.
That is a property of the sample data, not of the schema, and it should not be read as evidence that
the columns are mandatory. Had the constraint been intended, the schema would read
`department_id INTEGER NOT NULL`.

#### 4.2.4 The `admins` Table

Stores the administrator accounts created by the expanded authentication task. No administrator is
seeded: the first account is created through `POST /api/auth/register`, which is how a delivered
system is first signed in to.

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| `id` | INTEGER | **PRIMARY KEY AUTOINCREMENT** | Stable identifier |
| `username` | TEXT | **NOT NULL, UNIQUE** | Sign-in username |
| `email` | TEXT | **NOT NULL, UNIQUE**, stored lowercase | Sign-in email; must be unique |
| `password_hash` | TEXT | **NOT NULL** | `crypto.scrypt` hash plus a unique salt; never plaintext, never returned by any endpoint |
| `full_name` | TEXT | **NOT NULL** | Display name shown in the account view |
| `created_at` | TEXT | **NOT NULL**, default `datetime('now')` | Creation timestamp |
| `updated_at` | TEXT | **NOT NULL**, default `datetime('now')` | Last update timestamp |

#### 4.2.5 The `admin_sessions` Table

Stores one row per valid sign-in session.

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| `id` | TEXT | **PRIMARY KEY** | The opaque random session token placed in the `admin_session` cookie (a 256-bit random value, not a sequential number) |
| `admin_id` | INTEGER | **NOT NULL, FOREIGN KEY** → `admins(id)` | The signed-in administrator |
| `expires_at` | TEXT | **NOT NULL** | Seven days after creation; sessions past this date are rejected with the 401 "Session is invalid or has expired" response and deleted |
| `created_at` | TEXT | **NOT NULL**, default `datetime('now')` | Creation timestamp |

#### 4.2.6 The `tasks` Table

Stores tasks assigned to a specific staff member and created by a signed-in administrator. Both the
assignee and the creator are mandatory: a task without a staff member is meaningless in this
application, and the creator is always taken from the session, never from the request body.

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| `id` | INTEGER | **PRIMARY KEY AUTOINCREMENT** | Stable identifier |
| `title` | TEXT | **NOT NULL**, maximum 200 characters | Task title |
| `description` | TEXT | Nullable, maximum 2000 characters | Task detail |
| `staff_id` | INTEGER | **NOT NULL, FOREIGN KEY** → `staff(id)` | The staff member the task is assigned to |
| `priority` | TEXT | **NOT NULL**, default `'Medium'`, `CHECK` in `Low / Medium / High / Urgent` | Task priority |
| `status` | TEXT | **NOT NULL**, default `'Pending'`, `CHECK` in `Pending / In Progress / Completed / On Hold / Cancelled` | Task status |
| `due_date` | TEXT | Nullable, ISO `YYYY-MM-DD`, must be a real calendar date | Due date; drives the overdue calculation ("any date before SQLite's UTC `date('now')`", excluding Completed and Cancelled tasks) |
| `created_by_admin_id` | INTEGER | **NOT NULL, FOREIGN KEY** → `admins(id)` | The administrator who created the task |
| `created_at` | TEXT | **NOT NULL**, default `datetime('now')` | Creation timestamp |
| `updated_at` | TEXT | **NOT NULL**, default `datetime('now')` | Last update timestamp |

#### 4.2.7 Seeded Data Volumes

| Table | Records |
|---|---|
| `departments` | 6 — Engineering, Design, Human Resources, Finance, Marketing, Operations |
| `roles` | 9 — Software Developer, Senior Developer, UI/UX Designer, Product Manager, HR Officer, Accountant, Marketing Specialist, Team Lead, QA Engineer |
| `staff` | 18 fictional records |
| `admins` | 0 seeded — registration creates the first account; test harnesses created throwaway accounts only in copies |
| `admin_sessions` | 0 in a fresh database — one row exists per active sign-in |
| `tasks` | 0 seeded — the Task 4/5 verification created and then deleted a controlled dataset; the sample database ships without tasks |

Employment status is distributed as 14 Active, 2 On Leave and 2 Inactive. All records use reserved
example-domain email addresses and are entirely fictional.

### 4.3 Entity–Relationship Design

The complete entity–relationship diagram is shown in **Figure 12**
(`screenshots/12-er-diagram.png`).

**Cardinality.** Six relationships exist, all one-to-many:

| Relationship | Cardinality | Implementation |
|---|---|---|
| `departments` → `staff` | 1 : N | `staff.department_id` references `departments.id`; one department contains many staff members |
| `roles` → `staff` | 1 : N | `staff.role_id` references `roles.id`; one role is held by many staff members |
| `admins` → `admin_sessions` | 1 : N | `admin_sessions.admin_id` references `admins.id`; one administrator can hold many sessions (one row is created per sign-in, and deleted on sign-out or expiry) |
| `admins` → `tasks` | 1 : N | `tasks.created_by_admin_id` references `admins.id`; one administrator can create many tasks |
| `staff` → `tasks` | 1 : N | `tasks.staff_id` references `staff.id`; one staff member can be assigned many tasks |

The two original relationships are *optional one-to-many* from the `staff` side: a staff member
belongs to at most one department and holds at most one role, while the three new relationships are
*mandatory one-to-many* from the referencing side: a session, a created task or an assigned task must
have an administrator or staff member behind it.

**Design justification for normalizing these attributes.** Storing a department *name* directly in
the `staff` table would be simpler to write but incorrect in substance. Renaming "Human Resources" to
"People & Culture" would then require eighteen separate updates, and any inconsistency would create
two employees who appear to belong to different departments with the same name. Storing the
identifier once in a `departments` table means the rename is a single change that the join propagates
automatically. The same reasoning applies to roles.

**Why `role` is not simply derived from `job_title`.** The seed data demonstrates why the separation
matters: the title "Engineering Team Lead" belongs to the role "Team Lead"; "Brand Marketing Lead"
and "Content Marketing Specialist" both belong to "Marketing Specialist". Job title alone would not
support a meaningful grouping, whereas the role does.

### 4.4 Database Constraints and Indexes

The schema at `src/database/schema.sql` enforces the following, and every one of these measures was
verified against the live database.

#### 4.4.1 Primary Keys

Five of the six tables use `INTEGER PRIMARY KEY AUTOINCREMENT`. `AUTOINCREMENT` is specified in
preference to SQLite's default rowid behaviour because it guarantees that a deleted identifier is
never reissued: the internal sequence table is advanced monotonically. This matters for a directory,
because a reference to "staff member 7" must never silently come to mean a different person later.
The exception is `admin_sessions`, whose primary key is its opaque random session token
(`TEXT PRIMARY KEY`), which is deliberately a value that cannot be guessed or enumerated rather than
a sequential number.

#### 4.4.2 Unique Constraints

| Table | Column | Effect |
|---|---|---|
| `departments` | `name` | Two departments cannot share a name |
| `roles` | `name` | Two roles cannot share a name |
| `staff` | `email` | Two staff members cannot share an email address |
| `admins` | `username` | Two administrators cannot share a username |
| `admins` | `email` | Two administrators cannot share an email address |

These constraints are what make the seeding process idempotent (Section 5.3), what makes duplicate
staff e-mails and duplicate administrator accounts impossible (the staff creation and registration
endpoints map the violation to a 409 response), and what prevents the duplicate-entry problem
described in Chapter One. They are enforced by the database, so they hold regardless of which
application code performs the insert.

#### 4.4.3 Foreign Keys and Referential Actions

```sql
FOREIGN KEY (department_id) REFERENCES departments (id) ON UPDATE CASCADE ON DELETE RESTRICT,
FOREIGN KEY (role_id)       REFERENCES roles (id)       ON UPDATE CASCADE ON DELETE RESTRICT
```

The three expanded tables add their own foreign keys, all with the same referential actions:

```sql
FOREIGN KEY (admin_id)            REFERENCES admins (id) ON UPDATE CASCADE ON DELETE RESTRICT,
FOREIGN KEY (staff_id)            REFERENCES staff (id)  ON UPDATE CASCADE ON DELETE RESTRICT,
FOREIGN KEY (created_by_admin_id) REFERENCES admins (id) ON UPDATE CASCADE ON DELETE RESTRICT
```

| Action | Meaning | Why it is appropriate |
|---|---|---|
| `ON UPDATE CASCADE` | If a referenced `id` changes, the referencing value follows it | Avoids orphaned references and keeps the join valid |
| `ON DELETE RESTRICT` | A department, role, staff member or administrator that is still referenced cannot be deleted | Prevents the accidental loss of a staff member's department or role, and prevents deleting an administrator who is still the assignee of tasks |

`ON DELETE RESTRICT` is the correct choice here. `CASCADE` would silently delete staff records or
tasks when a department, a staff member or an administrator was removed, which for personnel data
would be a serious data-loss defect.

#### 4.4.4 Foreign Key Enforcement

SQLite does **not** enforce foreign keys unless they are explicitly enabled for each connection. The
project enables them in three places: `PRAGMA foreign_keys = ON;` at the top of `schema.sql`,
`db.pragma('foreign_keys = ON')` on every connection in `src/database/db.js`, and it was confirmed
live as `PRAGMA foreign_keys` returning `1`. Omitting this would have left the foreign key clauses
decorative.

The same connection setup also enables `journal_mode = WAL` (Write-Ahead Logging), which improves
concurrent read behaviour and crash recovery.

#### 4.4.5 Indexes

Ten explicit indexes are declared in addition to those created implicitly by the unique constraints
and by the `TEXT PRIMARY KEY` of `admin_sessions`:

| Index | Table | Column(s) | Supports |
|---|---|---|---|
| `idx_staff_department_id` | `staff` | `department_id` | Department filtering and the join to `departments` |
| `idx_staff_role_id` | `staff` | `role_id` | Role filtering and the join to `roles` |
| `idx_staff_employment_status` | `staff` | `employment_status` | Employment-status filtering |
| `idx_staff_last_name` | `staff` | `last_name` | The default `ORDER BY last_name, first_name` |
| `idx_admin_sessions_admin_id` | `admin_sessions` | `admin_id` | Session lookups by administrator |
| `idx_admin_sessions_expires_at` | `admin_sessions` | `expires_at` | Expiry clean-up |
| `idx_tasks_staff_id` | `tasks` | `staff_id` | The staff filter and the join to `staff` |
| `idx_tasks_status` | `tasks` | `status` | The status filter and dashboard per-status aggregates |
| `idx_tasks_created_by_admin_id` | `tasks` | `created_by_admin_id` | The join to `admins` |
| `idx_tasks_due_date` | `tasks` | `due_date` | The overdue comparison in the dashboard |

Together with the implicit indexes created by the five unique constraints (`departments.name`,
`roles.name`, `staff.email`, `admins.username`, `admins.email`) and by the `admin_sessions.id`
primary key, the database exposes sixteen indexes. Each explicit index corresponds to a column that
appears in a `WHERE`, `ORDER BY` or `JOIN` clause, so none is speculative. The table sizes in this
project are too small for the planner to require them, but they are correct practice and matter as
the dataset grows.

#### 4.4.6 Integrity Verification

`PRAGMA integrity_check` returned `ok`, confirming structural consistency, and no orphaned references
were found, confirming that no record refers to a missing department or role.

### 4.5 API Design

The API has two kinds of routes. The **public directory routes** are unchanged from the original
design: all seven use `GET` and are deliberately read-only, with no authentication requirement and no
versioning prefix beyond the `/api` base path. The **protected administrator routes** (added by the
expanded tasks) require a valid `admin_session` cookie and carry the actions that change data (staff
creation, task management, dashboard and the authenticated principal check). The three public
authentication endpoints (`POST /api/auth/register`, `/api/auth/login`, `/api/auth/logout`) do not
require a session.

**Public authentication endpoints (4), protected administrator routes (10):**

#### 4.5.1 Endpoint Summary

**Public directory routes (7):**

| Method | Endpoint | Purpose | Success |
|---|---|---|---|
| GET | `/api/health` | Service health, name and uptime | 200 |
| GET | `/api/staff` | List staff, optionally filtered | 200 |
| GET | `/api/staff/:id` | One staff member (remains public; task *lists* for a staff member are protected) | 200 |
| GET | `/api/departments` | List departments, ordered by name | 200 |
| GET | `/api/departments/:id` | One department | 200 |
| GET | `/api/roles` | List roles, ordered by name | 200 |
| GET | `/api/roles/:id` | One role | 200 |

**Public authentication endpoints (3) — no session required:**

| Method | Endpoint | Purpose | Success |
|---|---|---|---|
| POST | `/api/auth/register` | Create an administrator account and start a session | 201 |
| POST | `/api/auth/login` | Validate identity and start a session | 200 |
| POST | `/api/auth/logout` | Invalidate the session and clear the cookie | 200 |

**Protected administrator routes (10) — require a valid `admin_session` cookie:**

| Method | Endpoint | Purpose | Success |
|---|---|---|---|
| GET | `/api/auth/me` | Return the signed-in principal or 401 | 200 |
| POST | `/api/staff` | Create a staff member | 201 |
| GET | `/api/staff/:id/tasks` | List one staff member's tasks | 200 |
| GET | `/api/tasks` | List tasks, optionally filtered | 200 |
| GET | `/api/tasks/:id` | One task | 200 |
| POST | `/api/tasks` | Create a task | 201 |
| PATCH | `/api/tasks/:id/status` | Change a task's status | 200 |
| PUT | `/api/tasks/:id` | Update a task (including reassignment) | 200 |
| DELETE | `/api/tasks/:id` | Delete a task | 200 |
| GET | `/api/admin/dashboard` | Dashboard summary computed from the live database | 200 |

All protected routes answer **401** when the `admin_session` cookie is missing, invalid or expired
(`{"success":false,"error":{"message":"Authentication required"}}` when no cookie is present, or
`{"success":false,"error":{"message":"Session is invalid or has expired"}}` when the session has
expired or is invalid), enforced by the `authenticate` middleware rather than repeated in each
controller. Registration and login validate
input and return 400 for a malformed body; registration returns 409 for a duplicate username or
email; staff creation returns 400/409 analogously; task routes return 400 for invalid input, 404 for
a missing task or staff member, and 409 when a status transition is not permitted (for example
completing a Cancelled task).

#### 4.5.2 Query Parameters

All parameters are optional and are accepted only on `GET /api/staff`.

| Parameter | Type | Semantics | Matches against |
|---|---|---|---|
| `search` | string | Free-text, partial, case-insensitive, wildcard characters escaped | `first_name`, `last_name`, concatenated full name, `email`, `job_title` |
| `department` | string | Exact match, case-insensitive (`COLLATE NOCASE`) | `departments.name` |
| `role` | string | Exact match, case-insensitive | `roles.name` |
| `status` | string | Exact match, case-insensitive | `staff.employment_status` |

Notes on the design:

* `department` and `role` filter on the **name**, not the numeric identifier, because the values are
  the ones the user sees in the dropdown. The option element also carries the record's `id` in a
  `data-id` attribute, so the identifier is available without being sent on the wire.
* Parameters are combined with `AND`. A request supplying all four returns only staff satisfying
  every criterion.
* Blank and whitespace-only values are ignored rather than treated as a filter, so
  `?department=` returns the unfiltered list instead of an empty one.
* Parameters not in the supported list are ignored on both the client and the server, so an
  unexpected key can never be forwarded into a query.

`GET /api/tasks` accepts a parallel set of validated filters: `staff_id` (numeric, must exist),
`status` and `priority` (each restricted to its allowed `CHECK` values). As with the directory, the
parameters combine with `AND`, blank values are ignored, and a matching set of zero rows is a 200
with an empty `data` array, not an error.

#### 4.5.3 Response Envelope

Success:

```json
{ "success": true, "data": { "id": 1, "first_name": "Amara", "...": "..." } }
```

Failure:

```json
{ "success": false, "error": { "message": "Staff member not found" } }
```

#### 4.5.4 Status Codes

| Code | Condition |
|---|---|
| 200 | Request succeeded. A query matching no records returns 200 with an empty `data` array, because "no matches" is a successful outcome, not a failure |
| 201 | A resource was created (administrator registration, staff creation, task creation) |
| 400 | Identifier is not numeric (e.g. `/api/staff/abc`), a required field is missing, or input is out of range |
| 401 | A protected route was called without a valid `admin_session` cookie, or login credentials were wrong (the same generic message is returned whether the account is missing or the password is wrong) |
| 404 | Well-formed identifier that matches no record, or an unknown API route |
| 409 | A unique violation (duplicate email / username) or a task status change that is not permitted |
| 500 | Unexpected server-side failure; the client receives a generic message |

#### 4.5.5 Example Requests

| Purpose | Request |
|---|---|
| All staff | `GET /api/staff` |
| Free-text search | `GET /api/staff?search=amara` |
| By department | `GET /api/staff?department=Engineering` |
| By role | `GET /api/staff?role=QA%20Engineer` |
| By status | `GET /api/staff?status=On%20Leave` |
| Combined | `GET /api/staff?search=developer&department=Engineering&status=Active` |
| One record | `GET /api/staff/1` |

### 4.6 User Interface Design

The interface is a single page with named views (`#directory`, `#signin`, `#signup`, `#account`,
`#add-staff`, `#tasks`, `#dashboard`) routed by the hash, so the browser never performs a full page
load when moving between them. The original directory view was designed with three states and two
regions; the expanded tasks added the four administrator views behind the same responsive layout. The
interface is built with semantic HTML and Tailwind utility classes, with `public/assets/css/styles.css`
reserved for the few things that are awkward to express as utilities.

#### 4.6.1 Layout Regions

**Desktop navigation sidebar.** A persistent left sidebar, 256px wide, shown at viewport widths of
1024px and above. It carries the product identity, a "Directory" navigation item that is marked
`aria-current="page"`, a "Departments" item with a static department-count label, and a
footer identifying **Rids Cloud Digital Solution** and the "People & Operations" unit. It is sticky
and independently scrollable, so the main content scrolls while the navigation remains visible.

**Mobile header.** Below 1024px the sidebar is hidden and a compact sticky header with the product
mark appears instead. Using a header rather than a hidden menu keeps the mobile layout simple and
ensures the primary content is never obscured by a control that must be opened first.

**Main content.** A centred column, maximum width 1152px, containing the page heading, the search
field, the filter row, a directory summary line and the staff grid.

#### 4.6.2 Search and Filter Controls

The search input is a `type="search"` field with an inline magnifying-glass icon, `autocomplete`
disabled and the placeholder "Search by name, email, or job title...", which states the searchable
fields to the user. It is labelled by a visually hidden `<label>`, so it is announced correctly by
assistive technology without a visible caption.

Below it, three select controls — department, role and employment status — are laid out in a flex
row that wraps, each carrying a hidden label and a matching focus treatment. Department and role
options are populated from the API, preserving the "All departments" and "All roles" defaults.
Employment status offers the three values present in the data: Active, On Leave and Inactive. A
"Clear filters" button sits to the right of the filter group.

A summary line reports the number of people currently shown, pluralized as "1 person" or "n people".

#### 4.6.3 The Staff Grid and Cards

Staff are presented in a responsive grid rather than a table, because a card can accommodate
variable-length names, titles and locations without misaligning, and because a whole card is a
natural, comfortably sized touch target on a phone. Each card is a `<li>` containing a single
`<button>`, which makes it keyboard-focusable and operable by Enter or Space without additional
handling. The card displays the avatar, the employment-status badge, the full name, the job title,
the department and role separated by a decorative dot, and the location. Cards lift slightly on hover
as a visual affordance.

The column count is controlled by Tailwind's responsive utilities: one column by default, two
columns from 640px, three from 1280px and four from 1536px.

#### 4.6.4 States

The interface has three mutually exclusive presentation states in addition to the populated grid:

* **Loading** — four skeleton cards with a pulsing animation, marked `aria-live="polite"` and
  `aria-busy="true"`. The grid is hidden during loading so that the static placeholder cards in the
  HTML shell are never displayed beside the skeleton.
* **Empty** — a dashed-border panel reading "No staff members found." with the guidance "Try
  adjusting your search or filters." This is used both for a query that matches nothing and for a
  legitimately empty database.
* **Error** — a red-tinted panel with `role="alert"`, a controlled headline and detail line, and a
  "Try again" button that repeats the failed request without a page reload.

The treatment of a failed filter request differs deliberately from a failed initial load. A failed
filter leaves the last successful results on screen beneath the error message, so the user does not
lose the list they were reading; a failed initial load clears the grid, because nothing valid was
ever rendered.

#### 4.6.5 The Profile Modal

A dialog overlay presents the selected staff member's full record: avatar, name, job title, status
badge, department, role, email (as a `mailto:` link), phone, location and biography. Its behaviour is
specified in Section 5.5.

#### 4.6.6 Accessibility Considerations

A "Skip to main content" link is the first focusable element and becomes visible on focus. Labels for
the search and filter controls are visually hidden but present. Decorative icons and avatar images
carry empty `alt` text. `styles.css` provides a visible two-pixel focus outline for links, buttons
and selects. The dialog is a proper modal with `role="dialog"`, `aria-modal="true"` and
`aria-labelledby` pointing at the name element, and its visibility is reflected in `aria-hidden`.
Values that the record does not supply are shown as an em dash rather than as blank space.

#### 4.6.7 Responsive Behaviour

| Viewport | Verified layout |
|---|---|
| 375px (mobile) | Single-column grid; compact mobile header in place of the sidebar; controls stack |
| 768px (tablet) | Two-column grid; mobile header retained |
| 1440px (desktop) | Three-column grid; persistent 256px sidebar visible |

No horizontal overflow occurred at any of these widths, and the modal panel fits within the mobile
viewport through its `max-height` and internal scrolling.

#### 4.6.8 Administrator Views

The four views below are visible only to a signed-in administrator; visitors are routed to Sign In
when they attempt to reach them.

**Sign In and Sign Up.** `#signin` and `#signup` are narrow centred forms. Sign In takes email and
password and shows a generic "Invalid email or password" error on failure so the form never reveals
whether an account exists. Sign Up takes full name, username, email and password (with a minimum
length, displayed client-side), creates the account through the API, and lands the user on the
account view. Both views are linkable (`links.signin` / `links.signup`) so dashboard and error
screens can direct the user to them. An expired-session banner also appears above the Sign In form
when a session is invalidated mid-session.

**Account.** `#account` shows the signed-in administrator's full name, username and email, with
Sign Out, and three action cards — **Dashboard**, **Add a staff member** and **Manage tasks** — that
route to the corresponding views. On page load the application calls `GET /api/auth/me`; when no
valid session exists the navigation shows Sign In / Sign Up instead, and any already-open protected
view is closed.

**Add Staff.** `#add-staff` is a validated form for creating a staff member: name, email, phone, job
title, department and role dropdowns populated from the API, location, and employment status. On
success it shows a confirmation panel and then routes to `#directory`, where the new record appears.
Preventing the form from rendering for visitors is a state check in the view router as well as a
server-side 401 on the endpoint itself.

**Tasks.** `#tasks` lists the assigned tasks as cards (title, staff member, priority badge, status
badge, due date with an overdue indicator or "No due date"). A New task button opens a dialog
dialog with title, description, staff assignment, priority, status and optional due date; editing a
task opens the same dialog pre-filled; a status control on each card changes the status inline;
deleting asks for a confirmation that names the task before the API call. Filter selects for staff,
status and priority sit above the list and combine, with a Clear filters button and a results
summary line.

**Dashboard.** `#dashboard` renders the five summary areas supplied by `GET /api/admin/dashboard`:
total staff, active / on-leave / inactive counts; total tasks and the per-status breakdown; the
overdue count plus the list of overdue tasks (oldest first); the five staff members with the most
open tasks; and the five most recently updated tasks. Each summary card and row links back to the
Directory or Tasks view with its filter pre-applied (`#directory?department=…`, `#tasks?status=…`).
The view has loading, error-with-retry and empty-data states, and announces filtered results through
`aria-live`. On a zero-data database it renders explicit zero counts and empty-message panels rather
than hiding the sections.

---

## CHAPTER FIVE — SYSTEM IMPLEMENTATION

### 5.1 Frontend Implementation

The front end consists of one HTML document, two CSS files (one compiled, one hand-written) and nine
JavaScript modules. The JavaScript has **no build step**: the browser loads the modules as written,
with no bundler or transpiler, which keeps the code directly readable and directly debuggable.
Tailwind's utility classes are the single exception — they are compiled ahead of time by
`npm run build:css` into `public/assets/css/tailwind.css`, which is committed and loaded as a normal
same-origin stylesheet. The compile scans `index.html` and the JavaScript modules, so the classes it
emits reflect the classes present in those files.

Scripts are loaded in dependency order in `index.html`: `api.js`, `ui.js`, `filters.js`, `modal.js`,
`auth.js`, `staff-create.js`, `tasks.js`, `dashboard.js` and `app.js`. Each module publishes a small,
explicitly named public surface on a single `window` object and communicates only through that
surface. The last four modules are loaded before `app.js` but are inert until the router starts
them.

#### 5.1.1 `public/index.html`

Contains the complete page structure: the skip link, sidebar, mobile header, search field, filter
controls, summary line, the three state containers, the staff grid and the profile dialog.

The grid ships with six static placeholder cards so that the page has a meaningful structure before
JavaScript runs. These are **not sample data shown to users**: the loading state hides the grid
immediately, and the first successful render replaces the grid contents wholesale with
`replaceChildren()`. On a failed initial load the placeholders are explicitly cleared. The
implementation therefore never displays the hard-coded names to a user, and the in-code comments
state this intent.

The dialog exists in the markup with its final field structure and is hidden from the outset.

#### 5.1.2 `public/assets/css/styles.css`

Deliberately minimal, and it says so in its own header comment: Tailwind handles layout, colour and
typography, so this file only covers what utilities express awkwardly. It defines transition duration
custom properties, a visible `:focus-visible` outline, the removal of WebKit's search-input
decorations, and thin scrollbar styling for the modal panel.

#### 5.1.3 `public/assets/js/api.js`

A thin HTTP client. It exposes the directory calls — `getStaff` (with the validated filter keys),
`getStaffById`, `getDepartments`, `getRoles` and `getHealth` — and the administrator calls added by
the expanded tasks: `register`, `login`, `logout`, `me`, `createStaff`, `getTasks`,
`getTasksByStaff`, `getTaskById`, `createTask`, `updateTask`, `changeTaskStatus`, `deleteTask` and
`getDashboard`. It contains **no rendering and no state management**, which is why it can be tested
and reasoned about independently of the interface.

Three details are worth noting:

* It builds query strings from an allowlist of the four supported filter keys, omitting blank values,
  so an unexpected key can never leak into a request.
* It converts every failure — network error, non-2xx status, malformed JSON, or a `success: false`
  envelope — into a thrown `ApiError` carrying a message and status. Callers therefore have a single
  failure path to handle.
* Where the server supplies a message, that message is used; otherwise a controlled default is
  applied, so a confusing payload cannot produce a confusing page.

#### 5.1.4 `public/assets/js/ui.js`

The rendering layer. It turns data into DOM and performs no network access. Its central guarantee is
that **all staff-provided text is written with `textContent`**, and no HTML string is ever built, so
stored data can never be interpreted as markup.

It renders a card with a `<button>` carrying `data-staff-id`, which is how the modal layer later
identifies the record. Optional fields are omitted rather than rendered empty: a record with no job
title simply has no title line, and the card stays visually balanced. Avatars use the record's
`avatar_url` when present with `loading="lazy"` and empty `alt`, and fall back to a locally shipped
placeholder; a record with no usable URL at all is rendered as initials instead of a broken image. No
external image service is ever contacted.

It also owns the three state containers. It toggles only elements that already exist in the HTML
shell, creating no new state markup and inventing no layout. `updateStaffCount` ignores non-numeric
or negative input and pluralizes correctly.

One implementation constraint is recorded in the code comments: Tailwind's build step emits only the
classes it finds in the scanned source files, so the status colour classes are kept as complete
literal strings rather than being composed from fragments. Assembling them dynamically would produce
a class that the build never emits and so would break styling. This is a normal constraint of a
static Tailwind build and is discussed in Section 1.7, limitation 9.

#### 5.1.5 `public/assets/js/filters.js`

Owns the filter state — the single object `{ search, department, role, status }` — and is the only
module that listens to the controls. It never calls `fetch` and never builds a card; it requests
data through `window.StaffDirectoryApi` and delegates rendering to `window.StaffDirectoryUi`.

Three behaviours are implemented deliberately:

* **Debouncing.** The search input is debounced by 300ms, so typing a name issues one request rather
  than one per keystroke. A pending search is cancelled when another filter changes, and the current
  input value is folded into that request rather than triggering a redundant follow-up.
* **Out-of-order response protection.** Each request takes a monotonically increasing token before it
  is sent, and only the holder of the newest token is allowed to paint. Without this, a slow response
  to "am" could arrive after a fast response to "amara okonkwo" and overwrite the newer, more
  specific results.
* **Non-destructive failure.** On error the last successful list is left on screen beneath the error
  message, and the real cause is written to the console while the user sees controlled copy.

#### 5.1.6 `public/assets/js/modal.js`

Described fully in Section 5.5.

#### 5.1.7 `public/assets/js/app.js`

The bootstrap module. On `DOMContentLoaded` it verifies that the API and UI modules are present,
then loads departments, roles and staff **in parallel** using `Promise.all`, which is faster than
three sequential requests. It renders the filter options, the staff grid and the count, and marks the
directory as loaded.

It distinguishes two failure recoveries precisely: if the directory has never loaded, retry re-runs
the full load; if it has, retry delegates to the filters module so the user's existing criteria are
re-applied rather than discarded. Finally, in a `finally` block, it initialises the filters and modal
modules **once**, after the first render. Both guard against double initialisation, and the comments
explain that binding at this point avoids issuing a second identical request during startup.

`app.js` also performs the view routing for the finished application. It registers a hash-change
listener backed by a route table (`view-router`), initialises the authentication module on startup so
that session state is known before the first view renders, and treats a *scheme* hash such as
`#tasks?status=Pending` (a filter intent from the dashboard) as an instruction to load the target
view with those filters instead of a plain route.

#### 5.1.8 `public/assets/js/auth.js`

Owns everything session-related. On startup it calls `GET /api/auth/me`; when the response is 200 it
stores the principal and shows the signed-in navigation (account name, Dashboard / Add staff / Tasks
links and Sign Out), and when it is 401 it shows Sign In / Sign Up and closes any protected view that
is currently open. It renders the Sign In, Sign Up and Account views, keeps form buttons disabled
while a request is in flight, and lets the server's generic "Invalid email or password" message be
shown on failure so the form never reveals whether an account exists. A shared
`handleSessionExpired()` helper announces the expiry, clears the session, routes to
Sign In with a banner, and strips the URL intent — it is reused by every view that performs a
protected request, so the handling is identical across the application.

#### 5.1.9 `public/assets/js/staff-create.js`

Owns the Add Staff view. It populates the department and role dropdowns from the same API used by the
directory, performs client-side validation (required names, email format, employment status) with
inline messages, disables the submit button while saving, and calls the protected `createStaff`
endpoint. On success it renders a confirmation panel and routes to the directory. It never renders
for a visitor: the router checks session state before initialising the view, and the endpoint itself
returns 401 without a session.

#### 5.1.10 `public/assets/js/tasks.js`

Owns the Tasks view. It renders the task list as cards, populates the staff filter from the staff
list, and applies the staff / status / priority filters (combined with `AND`, cleared by a Clear
filters button) by re-requesting with the same validated parameters the directory uses. The New task
and Edit dialogs reuse one form that submits through `createTask` / `updateTask`; a per-card status
control calls `changeTaskStatus`; deletion opens a confirmation dialog that names the task and then
calls `deleteTask`. Session expiry flows through the shared `handleSessionExpired` helper.

#### 5.1.11 `public/assets/js/dashboard.js`

Owns the Dashboard view with four explicit states — loading, content, error (with retry) and
session-expired. On the content state it renders each summary section from `getDashboard()`, keeps a
numeric update inside an `aria-live="polite"` container so count changes are announced, and builds
the links into the Directory and Tasks views by encoding the dashboard's filter intents into the
hash. It exposes the same `handleSessionExpired` behaviour so an expired session routes the user
coherently to Sign In.

### 5.2 Backend Implementation

The back end is a small layered Node.js application using Express.js 5 and CommonJS modules.

#### 5.2.1 Entry Point and Application Wiring

`server.js` is the entry point named in `package.json`. It reads the port from the environment
(defaulting to 3000), requires the Express application from `src/app.js` and starts listening. It
contains no application logic — a single responsibility that keeps the process entry point trivial.

`src/app.js` assembles the application in a deliberate order:

1. `express.json()` — JSON body parsing.
2. `parseCookies` — reads the `admin_session` cookie into `req.cookies` for the authentication
   middleware.
3. `express.static(publicDir)` — serves the front end from `public/`.
4. The seven route groups, mounted at `/api/health`, `/api/auth`, `/api/admin/dashboard`,
   `/api/departments`, `/api/roles`, `/api/staff` and `/api/tasks`.
5. A catch-all handler for unmatched requests.
6. The centralized error handler.

The order matters. Static middleware precedes the API mounts so that asset and page requests are
served, and the not-found and error handlers are registered **last** so that they act as a fallback
rather than intercepting valid requests.

#### 5.2.2 Routes

Each resource has a small Express router in `src/routes/`. They declare URI and method only, and
delegate immediately, which keeps HTTP structure separate from behaviour:

```js
router.get('/',        staffController.getStaff);
router.get('/:id',     staffController.getStaffById);
```

`healthRoutes.js` handles the health check inline, returning status, service name and rounded
process uptime — enough to confirm the process is alive and responding.

The route groups added by the expanded tasks follow the same "URI and method only" style.
`authRoutes.js` mounts the four authentication endpoints; `taskRoutes.js` mounts the list, single,
create, status-patch, update and delete task endpoints plus the dashboard's two dependent calls
through the same router style; and `dashboardRoutes.js` mounts the single dashboard endpoint.
Protected routers apply the `authenticate` middleware at the router level, so the session check runs
for every route in the group without being repeated per endpoint.

#### 5.2.3 Controllers

Controllers in `src/controllers/` translate between HTTP and the repository layer. They share a
consistent structure:

* A `sendSuccess` helper and a `sendError` helper guarantee a single, consistent envelope shape.
* Input is read through a `readFilter` helper that accepts only strings and trims them, so a repeated
  query parameter — which arrives as an array — is treated as absent rather than corrupting a query.
* `getStaffById` validates the identifier against `/^\d+$/` **before** any database access and returns
  400 if it fails, so a malformed request never reaches the database.
* The repository call is wrapped in `try`/`catch`; the real error is logged on the server and the
  client receives a generic message.

The pattern is identical across staff, department and role controllers, which is what makes the API
predictable.

`authController.js`, `taskController.js` and `dashboardController.js` follow the same envelope
helpers but add authentication-relevant rules:

* Register validates full name, username, email and a minimum-length password, then delegates to
  `adminRepository` (which lowercases the email, hashes the password with a unique random salt via
  `scrypt`, and maps the unique-violation to 409) and `sessionService` (which creates a session row
  and sets the `HttpOnly` cookie).
* Login reads the account by email and compares the password with `scrypt.timingSafeEqual` over the
  stored salt — the same generic 401 is returned whether the account is missing or the password is
  wrong, so responses never reveal which.
* Logout deletes the session row and clears the cookie.
* Task endpoints validate input (title length, allowed status/priority values, a real calendar date
  for `due_date`, an existing `staff_id`), set `created_by_admin_id` from the session, and translate
  repository outcomes into 200 / 201 / 400 / 404 / 409 responses.
* The dashboard controller runs the repository's aggregate queries and returns the assembled summary
  without exposing any repository row containing identity or credential data.

#### 5.2.4 Repositories

All SQL lives in `src/repositories/`. This is the most important structural decision in the back end:
the queries can be read and reviewed in one place, and no HTTP concern can leak into a query.

`staffRepository.js` builds one base `SELECT` that joins `departments` and `roles` with `LEFT JOIN` to
expose their names as `department` and `role`, then appends a dynamically constructed `WHERE` clause
and a fixed `ORDER BY s.last_name, s.first_name`. A `mapRow` function converts each row into the
response shape, including a computed `full_name`, which the front end uses directly. `countAll`
provides a matching count query. The department and role repositories follow the same pattern more
simply, without filtering.

The repositories added by the expanded tasks keep all of their SQL in `src/repositories/` as well.
`adminRepository.js` handles account lookup and creation (including the `UNIQUE` mapping used to
answer 409); `sessionRepository.js` creates, deletes and expires session rows; `taskRepository.js`
builds the filtered task list query, the single-task query, the create/update/status/delete
statements and the per-staff task list; and `dashboardRepository.js` contains the aggregate queries
for the dashboard as single SQL statements (counts, `GROUP BY` breakdowns and the overdue/top/recent
lists), so the dashboard performs a small number of prepared-statement calls rather than one query
per row.

#### 5.2.5 Middleware

Four middleware modules complete the back end:

* **`notFound.js`** returns 404, with a JSON envelope for `/api` paths and a plain-text response
  otherwise, so that an API client never receives HTML where it expected JSON.
* **`parseCookies.js`** reads the `Cookie` header into a plain `req.cookies` object so controllers
  and the authentication middleware never parse cookie strings themselves.
* **`authenticate.js`** enforces the protected routes. It reads `req.cookies.admin_session`, looks
  the token up in `admin_sessions`, rejects missing or expired sessions with the standard 401 body
  (`Session is invalid or has expired`) before any controller runs, and otherwise attaches the
  authenticated `adminId` to the request for the controller to use. Login, registration and logout
  bypass it deliberately.
* **`errorHandler.js`** is the centralized handler. It derives a status from the error when one is
  present and sane (an integer from 400 to 599), logs the full stack **server-side only**, and returns
  a generic "Internal server error" for 500 responses. It checks `res.headersSent` before responding
  and distinguishes API from non-API requests. **No stack trace or internal detail is ever sent to a
  client.**

#### 5.2.6 Configuration

`src/config/config.js` centralizes paths and the port, resolving the project root from `__dirname`
rather than from the working directory, and honouring the `PORT` and `DB_FILE` environment variables.
Paths are therefore correct regardless of where the process is launched from.

### 5.3 Database Implementation

#### 5.3.1 Schema Definition

`src/database/schema.sql` is the single authoritative definition of the database, as described in
Sections 4.2 and 4.4. Every statement uses `IF NOT EXISTS`, so applying the schema to an existing
database is safe.

`src/database/db.js` applies it with `db.exec(schema)`. The schema is read from disk at
initialization rather than being hard-coded in JavaScript, so the SQL remains reviewable in its own
file.

#### 5.3.2 Connection Management

The connection is created lazily by `getDatabase()` and cached in a module-level variable, so a single
connection is reused across requests. On first use the data directory is created if it does not
exist, the connection is opened, and pragmas are applied:

```js
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');
```

`closeDatabase()` closes the handle and resets the cache, and is used by the seed process so the
process can exit cleanly.

#### 5.3.3 The Seed Process

`src/database/seed.js` populates the database with 6 departments, 9 roles and 18 staff records
defined as plain JavaScript arrays. It is run with `npm run db:init` (or `npm run db:seed`; both point
to the same script).

Three properties of the seed process are worth recording:

* **It is idempotent.** Every insert uses `ON CONFLICT ... DO NOTHING` against the relevant unique
  constraint — `name` for departments and roles, `email` for staff. Re-running the seed therefore
  refreshes nothing and duplicates nothing, so the script can be run safely at any time. This is a
  direct consequence of the unique constraints described in Section 4.4.2.
* **Reference data is resolved, not assumed.** Staff records are declared with human-readable
  department and role *names*. The script looks up the corresponding identifiers, and **throws an
  error if either is missing**, rather than inserting a null reference. This makes a mistyped
  department name a loud failure instead of a silent data-quality defect.
* **It is transactional.** Departments, roles and staff are written inside a single
  `db.transaction(...)` call, using better-sqlite3's synchronous transaction helper. The database is
  therefore never left half-populated.

Finally, the script prints the resulting row counts and closes the connection, so it terminates
cleanly and gives immediate confirmation of what it did. Avatar values default to a locally shipped
placeholder path rather than any external URL.

### 5.4 Search and Filtering

Search and filtering are implemented in `staffRepository.js` as a small clause builder, and are
selected by the front end through the four query parameters documented in Section 4.5.2.

#### 5.4.1 Normalization

Every incoming value passes through `normalize()`, which maps `undefined` and `null` to an empty
string and otherwise trims whitespace and converts to a string. A whitespace-only search term
therefore behaves exactly like an empty one, and a repeated query parameter — arriving as an array —
is rejected by the controller before it reaches this layer.

#### 5.4.2 The Search Clause

```sql
(
    s.first_name LIKE @search ESCAPE '\'
 OR s.last_name  LIKE @search ESCAPE '\'
 OR (s.first_name || ' ' || s.last_name) LIKE @search ESCAPE '\'
 OR s.email      LIKE @search ESCAPE '\'
 OR s.job_title  LIKE @search ESCAPE '\'
)
```

The term is wrapped in `%` wildcards on both sides, so `amar` matches "Amara". The third condition
concatenates the two name columns so that a full name typed with a space matches, which neither of the
first two conditions would catch.

*Searchable fields are first name, last name, full name, email address and job title.* Department,
role and employment status are **not** part of the free-text term; they are controlled attributes with
their own exact-match filters, described next. This distinction is deliberate — free-text matching
against an enumerated attribute produces unpredictable results, whereas the filter gives a precise
answer.

#### 5.4.3 Case Insensitivity

SQLite's `LIKE` is case-insensitive for ASCII by default, which is what makes `amar`, `Amara` and
`AMARA` behave identically without any additional code. The exact-match filters state `COLLATE
NOCASE` explicitly, so their behaviour does not depend on that default remaining unchanged.
Case-insensitivity was confirmed by test: status values were accepted in any case.

#### 5.4.4 Wildcard Escaping

`escapeLikeTerm()` replaces `\`, `%` and `_` with an escaped equivalent:

```js
value.replace(/[\\%_]/g, (character) => '\\' + character);
```

Each condition then declares `ESCAPE '\'` so SQLite interprets the backslash as the escape character.
Without this, a user searching for `100%` would have `%` interpreted as a wildcard and would receive
every record; a search for `under_score` would match `underXscore`. Escaping makes the search behave
as the user literally intended.

#### 5.4.5 The Filter Clauses

```sql
d.name              = @department COLLATE NOCASE
r.name              = @role       COLLATE NOCASE
s.employment_status = @status     COLLATE NOCASE
```

Each filter is added only when its value is non-empty, so an omitted or blank filter adds no condition
at all rather than matching nothing.

#### 5.4.6 Combined Filtering

```sql
WHERE ( ...search conditions... )
  AND d.name = @department COLLATE NOCASE
  AND r.name = @role       COLLATE NOCASE
  AND s.employment_status = @status     COLLATE NOCASE
```

Conditions accumulate in an array and are joined with `' AND '`, so every supplied criterion must
match. Active criteria therefore progressively narrow the result set, and a mutually contradictory
combination — for example a role that exists only in another department — correctly returns an empty
set rather than an arbitrary one. This behaviour was verified during QA, as was the reset control,
which returns the full unfiltered list.

### 5.5 Profile Modal

The profile modal is implemented in `public/assets/js/modal.js` and its markup in `index.html`.

#### 5.5.1 Data Source

The modal does **not** reuse the list data already on screen. Selecting a card triggers
`GET /api/staff/:id` and populates the dialog from that response. The single-record endpoint is the
authoritative source for a profile, so the dialog cannot drift from the server, and the detail view is
exercised independently of the list query. `modal.js` never calls `fetch` itself; it goes through
`window.StaffDirectoryApi`, preserving the separation of concerns.

If the request fails, the dialog is **not opened at all**, so a user never sees an empty panel
presented as a profile.

#### 5.5.2 Safe Rendering

Every field is written with `textContent`, and no HTML string is constructed. A missing value is
displayed as an em dash. Three details are worth noting:

* **Avatar.** The image is shown only when `avatar_url` is a non-empty string; otherwise it is hidden
  and an initials badge derived from the name is displayed. The image `alt` is empty because the name
  is already adjacent. No external image service is contacted.
* **Email.** The link's `href` is built as `'mailto:' + email`. The scheme is fixed in the code, so a
  stored value cannot introduce a different scheme.
* **Status.** Colour classes are selected from a lookup of the three known statuses, with a neutral
  fallback, and the raw status text is always displayed rather than an invented label.

#### 5.5.3 Closing Behaviour

The dialog can be closed in four ways: the close button, a click on the backdrop or the dialog
container itself, the `Escape` key (also accepting the legacy `Esc` key name), and programmatic
closure. Each path calls the same `closeModal()` function, so behaviour is uniform.

#### 5.5.4 Focus Management and Accessibility

This is the most carefully implemented aspect of the modal:

* On open, focus moves to the close button, so keyboard users are placed inside the dialog rather than
  behind it.
* **Tab is trapped.** A keydown handler collects the focusable elements inside the dialog and wraps
  `Tab` from the last element to the first, and `Shift`+`Tab` from the first to the last.
* On close, focus is **returned to the staff card** that opened the dialog, which is held in a
  `triggerElement` variable. This satisfies the expectation that closing a dialog returns the user to
  where they were.
* `aria-hidden` is maintained in step with visibility, and the container carries `role="dialog"`,
  `aria-modal="true"` and `aria-labelledby` pointing at the name element.

#### 5.5.5 Scroll Lock and Transition Handling

While open, an `overflow-hidden` class is added to `document.body` and removed on close, preventing
the background from scrolling behind the dialog. Opening and closing animate; the close uses a
`transitionend` listener to complete hiding, with a 240ms timeout as a fallback in case the transition
never fires. Opening forces a reflow so the transition actually runs, and any pending close timer is
cleared so that a quickly re-opened dialog is not hidden by a stale timer.

#### 5.5.6 Race Protection

A monotonic `requestToken` guards against two related problems:

* If the user clicks one card and then dismisses the dialog before the response arrives, a naive
  implementation would open the dialog **after** it was dismissed. Incrementing the token on dismissal
  causes the late response to be ignored. `Escape` also works while a profile is still loading.
* Two rapid selections cannot cause the first response to overwrite the second, because only the
  newest token may open the dialog.

#### 5.5.7 Event Delegation

The click listener is attached **once to the grid**, not to each card. Because the grid is fully
re-rendered whenever results change, per-card listeners would be destroyed on every re-render; a
delegated listener survives. The handler uses `closest()` to find the ancestor card and reads its
`data-staff-id`, which it validates against `/^[1-9][0-9]*$/` before making a request, so an invalid
identifier never triggers a doomed call.

### 5.6 Error Handling and Security

#### 5.6.1 Parameterized SQL

Every query executed by the repositories uses **named parameters** — `@search`, `@department`,
`@role`, `@status`, `@id` — through better-sqlite3's prepared statements. User input is bound as a
value and is never concatenated into the SQL text. This is the single most important defence against
SQL injection, and it is enforced structurally: the repository layer builds only the `WHERE` clause
structure, and the dynamic parts are placeholders. Because the query structure is fixed and only
parameter values vary, the same prepared statement is reused safely.

#### 5.6.2 Validation and Allowlists

* Identifiers are validated against `/^\d+$/` in the controllers and again in the repositories
  (`Number.isInteger` and `>= 1`) before any query runs, returning 400 for malformed input.
* The `staff` controller accepts only the four known filter keys from `SUPPORTED_FILTERS`; anything
  else is ignored.
* The API client builds query strings from the same four keys, so unexpected parameters are never
  even sent.
* `normalize()` and `readFilter()` coerce or discard values of unexpected types.
* Wildcard characters in a search term are escaped so they cannot alter query semantics.

#### 5.6.3 Safe DOM Rendering

All client rendering uses `textContent`, `createElement` and `setAttribute`. No HTML string is built
and no data value is passed to `innerHTML`. Stored data therefore cannot be interpreted as markup, so a
record containing HTML or a script fragment would be displayed as inert text rather than executed.
The single exception is the email `href`, which is constructed from a fixed `mailto:` prefix.

#### 5.6.4 Generic API Errors and No Stack Traces

Detailed errors are logged **server-side** — `console.error` with the message or stack — and the
client receives a generic message. `errorHandler.js` returns "Internal server error" for 500 responses
and "Request failed" otherwise. No stack trace, SQL text, file path or exception detail reaches the
browser. The front end follows the same principle: it logs the real cause to the console for the
developer and renders only controlled copy such as "Unable to load the directory right now."

#### 5.6.5 Centralized Error Middleware

All unhandled errors reach one handler registered last in `src/app.js`. It normalizes an unknown or
out-of-range status to 500, respects `res.headersSent`, and differentiates API from non-API requests so
that an API client always receives JSON. Because the handler is registered once, an error cannot
escape through an unhandled route and produce an inconsistent response.

#### 5.6.6 Foreign Key Enforcement

Foreign key enforcement is enabled on every connection, so referential integrity is guaranteed by the
database rather than by application discipline. Combined with `ON DELETE RESTRICT`, a department or
role still referenced by staff cannot be deleted, which prevents orphaned or accidentally cascaded
deletions of personnel data.

#### 5.6.7 Measures Deliberately Not Present

For completeness, and to avoid any ambiguity about the security posture of the delivered system, the
following are **not** implemented:

* **Role-based permission levels.** Authentication is implemented, but it is a single-role model:
  every administrator has the same capabilities. There is no granular permission system.
* **Account recovery and self-service password reset.** A lost password cannot be reset through the
  application.
* **Audit logging** of administrator actions (staff creation, task changes).
* **Transport security** — the local application serves plain HTTP. The production deployment is
  served over HTTPS by Render and the backend verifies the database TLS certificate (Appendix F);
  TLS termination or a self-managed reverse proxy is not part of this repository.
* **Rate limiting** — no request throttling is applied to login or other endpoints.
* **Security headers** — no Content-Security-Policy, HSTS or related headers are set. The interface
  no longer loads any third-party script (the Tailwind stylesheet is served from the application
  itself), so a strict Content-Security-Policy would not need to allow an external stylesheet host.
* **Input length limits** on query parameters.
* **Client-side write protection against CSRF beyond the `SameSite=Lax` cookie.** The only writes
  are login, logout, registration, staff creation and task operations, all performed with
  `fetch()` from the same origin; the session cookie is `SameSite=Lax` with an opaque value and
  `HttpOnly`. A dedicated CSRF token would be required before exposing the write endpoints to a
  different origin in production.

The two original security exclusions — "no authentication" and "no write operations" — are no longer
accurate and are explicitly superseded: the application now authenticates administrators server-side
and protects every data-changing route with the `authenticate` middleware, while the seven public
directory endpoints remain deliberately read-only so the original directory behaviour is unchanged.

#### 5.6.8 Environment Configuration

The port and database path are taken from environment variables rather than being hard-coded,
which keeps deployment-specific values out of the source and allows the database file to be relocated
without editing code.

---

## CHAPTER SIX — TESTING AND RESULTS

### 6.1 Testing Strategy

Testing was structured by layer, from the bottom of the stack upwards, so that a failure at one level
would be understood before testing proceeded to the next. Six complementary approaches were used.

**Functional testing.** Each user-visible capability was exercised against its expected behaviour:
displaying staff, searching, filtering individually, filtering in combination, resetting, opening and
closing a profile, and the loading, empty and error states.

**API testing.** Each endpoint was requested directly and its HTTP status, response envelope and
returned data were inspected. The success path was tested for every endpoint, and the failure paths
were tested deliberately: non-numeric identifiers, valid identifiers with no matching record, and
unknown routes. Direct API testing is what distinguishes a UI that merely *looks* right from a backend
that is genuinely correct, and it is what confirmed that the filtering semantics behave as documented
at the SQL level rather than only in the interface.

**Interface testing.** The rendered page was inspected in the browser for correctness of content,
state transitions and layout, and its behaviour was driven both with the mouse and the keyboard.

**Responsive testing.** The layout was verified at three viewport widths — 375px, 768px and 1440px —
covering the mobile, tablet and desktop layouts defined in Section 4.6.7, checking column count,
navigation form, absence of horizontal overflow and modal fit.

**Accessibility and console checks.** Keyboard operability, focus behaviour, dialog semantics and
visible focus indicators were checked, and the browser console was monitored throughout for
JavaScript errors, uncaught exceptions, unhandled promise rejections and unexpected failed resource
requests.

**Security checks.** Parameterized query usage, identifier validation, generic error responses, absence
of stack traces, safe DOM rendering, foreign key enforcement, password hashing (salted `scrypt`,
constant-time comparison) and the session checks on protected routes were inspected in the source and
confirmed against live behaviour.

**Expanded-scope and final-integration verification.** The expanded tasks added two further
disciplines. First, every write-capable verification ran against a **throwaway copy** of the database
(the SHA-256 hashes of `data/staff-directory.db` and its `-shm`/`-wal` files were recorded before and
after each pass, so it is provable that the real database was never opened for writing). Second, the
finished application was exercised once more as a **final integrated smoke pass** after all six tasks,
re-running the end-to-end API, browser, authorization, responsive and console-hygiene harnesses
against a fresh copy of the database plus a fresh schema-only (empty) database, and adding a
supplement of live checks (staff creation via the protected endpoint, duplicate/invalid input,
missing records, wrong-password login and an expired session) — 221 distinct checks in total, all
passing. Automated checks are distinguished from manually inspected ones throughout this report.

### 6.2 Test Environment

| Aspect | Configuration |
|---|---|
| Browser | Chromium-based desktop browser (headless Chrome driven over the DevTools protocol for the harness runs) |
| Desktop viewport | 1440px wide |
| Tablet viewport | 768px wide |
| Mobile viewport | 375px wide |
| Runtime | Node.js with the project dependencies installed |
| Database | SQLite file `data/staff-directory.db`, seeded with 6 departments, 9 roles and 18 staff — plus, for every write-capable test, a byte-for-byte throwaway copy of that file (and a fresh schema-only copy for the zero-data checks) whose SHA-256 hashes were compared before and after |
| Server | Node.js/Express listening on port 3000 (and dedicated harness ports for the throwaway copies), serving the front end from `public/` |
| Developer tools | Browser developer tools for DOM, Network and Console inspection |

> The environment above describes the **local** testing that produced Chapters Six and Seven; that
> testing ran against SQLite. The later production deployment uses PostgreSQL, and the checks carried
> out against it are recorded separately in Appendix F.

### 6.3 Test Cases and Results

The following table records the final quality assurance results for this project. Every result was
observed during verification; no result in this table has been invented, and no test has been marked
as passing without a recorded observation.

| ID | Test Description | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-01 | Application startup | Server starts successfully and serves the front end | The application started successfully under both `npm start` and `npm run dev`, listened on port 3000 and served the front end at the root path. The dependency installation state was also confirmed valid. | PASS |
| TC-02 | Database initialization | DB file created and schema loaded | `data/staff-directory.db` was created and the schema applied correctly. `PRAGMA integrity_check` returned `ok`, foreign keys and WAL mode were enabled, and seeding produced 6 departments, 9 roles and 18 staff records with no orphaned references. | PASS |
| TC-03 | API health | `/api/health` returns success JSON | The endpoint returned HTTP 200 with the standard success envelope and an operational status value. | PASS |
| TC-04 | Staff retrieval | `/api/staff` returns list of staff | The endpoint returned HTTP 200 with all 18 staff records inside the success envelope, correctly ordered by last name then first name and including the related department and role names. | PASS |
| TC-05 | Individual staff retrieval | `/api/staff/:id` returns valid staff or error | A valid identifier returned the corresponding record; a non-existent identifier returned HTTP 404 and a malformed (non-numeric) identifier returned HTTP 400, each using the standard error envelope. | PASS |
| TC-06 | Department retrieval | `/api/departments` returns list | The list endpoint returned HTTP 200 with all 6 departments, and the single-record endpoint returned the correct department for a valid identifier, with 404 and 400 responses for invalid input. | PASS |
| TC-07 | Role retrieval | `/api/roles` returns list | The list endpoint returned HTTP 200 with all 9 roles, and the single-record endpoint returned the correct role for a valid identifier, with 404 and 400 responses for invalid input. | PASS |
| TC-08 | Name search | Search finds staff by first/last/full name | The `search` parameter correctly matched staff on first name, last name and full name; partial and case-insensitive terms returned the expected records. | PASS |
| TC-09 | Email search | Search finds staff by email | Supplying a complete email address returned exactly the matching record, and partial, case-insensitive input resolved to the same record. | PASS |
| TC-10 | Job-title search | Search finds staff by job title | Searching by job title returned all staff holding that title, confirming that job title is included among the searchable fields. | PASS |
| TC-11 | Department filtering | Results filtered by selected department | Selecting a department returned only staff belonging to that department, and the returned result set matched the staff count displayed in the interface. | PASS |
| TC-12 | Role filtering | Results filtered by selected role | Selecting a role returned only staff holding that role, and the returned result set matched the staff count displayed in the interface. | PASS |
| TC-13 | Status filtering | Results filtered by employment status | Filtering returned 14 Active, 2 On Leave and 2 Inactive staff respectively, matching the seeded distribution, and status values were accepted case-insensitively. | PASS |
| TC-14 | Combined filtering | Multiple criteria apply together | Search, department, role and status filters applied simultaneously using AND semantics; each combination returned the expected intersection, and conflicting combinations (for example a role outside the selected department) correctly returned an empty result set. | PASS |
| TC-15 | Clear / reset filters | Reset restores the full list | The clear/reset control restored the full unfiltered list. | PASS |
| TC-16 | No-result state | Empty state shown with message | A query matching no records returned HTTP 200 with an empty data array, and the interface displayed the designated empty-state message with a count of 0 staff instead of a blank grid. | PASS |
| TC-17 | Profile modal | Modal opens with staff details and closes | Clicking a staff card opened the modal populated with that staff member's complete record from the API (name, job title, department, role, email, phone, location, employment status and biography). The modal closed correctly via the close button and the backdrop, with focus trapped while open and background scrolling locked. | PASS |
| TC-18 | Escape key | Escape closes the modal | Pressing Escape while the modal was open closed it and returned keyboard focus to the staff card that opened it. | PASS |
| TC-19 | Responsive behavior | Layout adapts to mobile/tablet/desktop | Layouts were verified at 375px (single-column grid with mobile header), 768px (two-column grid) and 1440px (three-column grid with sidebar). No horizontal overflow occurred at any width, and the profile modal fitted within the mobile viewport. | PASS |
| TC-20 | API error handling | Errors return structured JSON with appropriate status | Unknown API routes returned HTTP 404, invalid identifiers returned HTTP 400 and unexpected failures returned HTTP 500, all as structured JSON using the `{ success, error: { message } }` envelope. No stack traces were exposed to clients. | PASS |
| TC-21 | Browser console errors | No JavaScript errors in console | The browser console recorded zero JavaScript errors, uncaught exceptions, unhandled promise rejections or unexpected failed resource requests throughout the browser test run. | PASS |

### 6.3.1 Verification of the Expanded Tasks

After the original directory was complete and the TC-01 to TC-21 matrix above was recorded, the six
expanded tasks were each implemented and then verified against throwaway database copies, with the
real database's SHA-256 hashes confirmed unchanged before and after every pass. The task identifiers
below (such as "T1" and "H-series") are the check identifiers recorded in the project documentation.

| Task | Scope | Verification performed | Result |
|---|---|---|---|
| T1 | Authentication backend | 36 API checks: registration, login, logout, `me`, session persistence and expiry, cookie attributes, salted-hash storage (never plaintext), generic 401 for unknown account vs wrong password, public directory endpoints unchanged, no credentials in any response | PASS |
| T2 | Authentication interface | ~30 browser checks: Sign In / Sign Up / account views, session detection on load, auth-aware navigation, sign-out, session-expiry banner, error and loading states | PASS |
| T3 | Admin-only staff creation | API and browser checks: 401 for visitors, valid 201 create, duplicate email 409, missing fields 400, new record appears in the directory immediately | PASS |
| T4 | Task management backend | 19 API checks: task lifecycle (create, list, view, update, reassign, status change, delete), staff/status/priority filters, invalid input and missing-record 404s, `created_by_admin_id` taken from the session | PASS |
| T5 | Task management interface | Browser checks: task list, create and edit dialogs, inline status changes, delete confirmation naming the task, filter combinations and clear, 375/768/1440px layout | PASS |
| T6 | Dashboard | 36 HTTP + 114 browser checks on the populated copy and 18 HTTP + 31 browser checks on a schema-only (empty) copy: every dashboard number compared against independently computed SQL aggregates, zero-data handling, filter-intent links, secrets scan | PASS |
| T7 | Final QA smoke test | Final integrated pass over the finished application — re-ran the populated-copy API and browser suites (36 + 114), the empty-copy suites (18 + 31) and a 22-check supplement (live staff creation, 400/404/409/401 paths, expired session, directory and tasks overflow checks at 375/768/1440, console hygiene) | PASS (221 / 221) |

**The records substantiate the totals.** The four re-run harness suites (H-series 36, browser main
114, E-series 18, browser-empty 31) plus the 22-check Task 7 supplement are the **221 distinct checks**
reported in Section 6.4. They do not overlap: the final pass referenced the already-recorded Task 1–5
results and executed the final smoke over the complete application rather than re-running every
historical check.

### 6.4 Final Quality Assurance Summary

**All 21 original test cases passed, and all recorded expanded-task and final-smoke checks passed.
There were no recorded failures.**

| Aspect | Result |
|---|---|
| Total recorded test cases (original directory) | 21 |
| Passed | 21 |
| Failed | 0 |
| Expanded-task verification (Tasks 1–6, recorded in the project documentation) | All PASS |
| Final integrated smoke pass (Task 7, re-run over the finished application) | 221 / 221 PASS |
| Startup and database initialization | PASS |
| API endpoints (health, staff, staff by id, departments, roles) | PASS |
| Authentication (register, login, logout, me, expired session) | PASS |
| Authorization (401 on protected routes without a session) | PASS |
| Staff creation (403-free: 201 create, 400/409 invalid input) | PASS |
| Task lifecycle (create, list, view, update, reassign, status, delete) | PASS |
| Dashboard numbers vs independent SQL aggregates | PASS |
| Zero-data database handling | PASS |
| Search (name, email, job title) | PASS |
| Filtering (department, role, status) | PASS |
| Combined filtering and reset | PASS |
| Empty state and no-result handling | PASS |
| Profile modal, Escape key, focus behaviour | PASS |
| Responsive layout at 375px, 768px, 1440px | PASS |
| API error handling and status codes | PASS |
| Browser console cleanliness | PASS |
| Real database never modified during verification (SHA-256 before/after) | PASS |

**A note on quantitative totals.** The original directory quality assurance is the 21-row test matrix
(TC-01 to TC-21) above, together with `PRAGMA integrity_check` returning `ok` and `PRAGMA foreign_keys`
returning `1`. The expanded tasks and the final smoke added the recorded checks summarised in Section
6.3.1 — including the 221 distinct checks of the final pass. A figure of "239 assertions" that has
sometimes been quoted for the directory-only phase is **not recorded anywhere in the project
documentation** for that phase and has therefore not been reproduced; the totals reported here are
the ones actually recorded and are stated precisely rather than inflated.

### 6.5 Discussion of Test Results

The results support the following conclusions.

**The functional requirements are met.** Every requirement in Section 3.4 is covered by at least one
passing test. Search matches on all three documented field groups (TC-08 to TC-10); each of the three
filters behaves independently (TC-11 to TC-13); and their combination produces the correct
intersection, including the correct empty result for contradictory criteria (TC-14). The reset
control restores the full list (TC-15).

**The API contract is consistent.** All seven endpoints returned HTTP 200 on the success path with the
documented envelope (TC-03 to TC-07). Invalid input was rejected with 400 and unknown records with
404, rather than by returning an empty success response — a distinction that matters to a client
deciding whether to show an error or an empty state (TC-05, TC-06, TC-07, TC-20).

**Database integrity is sound.** The schema applied cleanly, `integrity_check` returned `ok`, foreign
keys and WAL mode were enabled, and seeding completed without orphaned references (TC-02). The status
distribution of 14/2/2 returned by filtering (TC-13) matches the seeded data exactly, which
independently confirms that the filter is correct rather than merely non-empty.

**The interface is responsive and accessible.** All three viewport widths rendered the documented
layout with no horizontal overflow, and the modal fitted the mobile viewport (TC-19). Focus was
trapped while the modal was open, background scrolling was locked, and Escape returned focus to the
originating card (TC-17, TC-18) — three behaviours that are easy to claim and difficult to confirm
without deliberate keyboard testing.

**Failure handling behaves correctly.** Unknown routes, invalid identifiers and unexpected failures all
produced structured JSON with no stack trace exposed (TC-20), and the browser console remained free of
errors, uncaught exceptions, unhandled promise rejections and unexpected failed requests throughout
the run (TC-21).

**The authentication boundary is enforced and not just stated.** The final smoke pass confirmed the
401 behaviour at the route level (signed-out requests to the dashboard and task routes rejected),
through a fabricated cookie, and through an actually-expired session row — while the seven public
directory endpoints kept answering 200 without a cookie. Login with a wrong password returns the same
generic message as login for an account that does not exist, and no endpoint response carried a
password hash, session token or other secret (the harness scanned every captured response).

**The write paths behave like a real system.** Live staff creation through the protected endpoint
returned 201, resolved the department and role names, and made the new record appear in the directory
list and in `GET /api/staff/:id`; a duplicate email was rejected with 409 and a missing required field
with 400. The task regression (create → edit → reassign → status change → delete) left the dataset
exactly as it found it, which also confirms the deletion path rather than only the creation path. The
dashboard numbers in the populated run matched independently computed SQL aggregates exactly — the
status breakdown `{Pending: 3, In Progress: 2, Completed: 1, On Hold: 1, Cancelled: 1}`, three overdue
tasks with the expected identifiers in oldest-first order, and the expected top open-task staff — and
the schema-only database produced all-zero counts with no fabricated values.

**A note on what the results do not establish.** These tests were carried out on a local development
environment against 18 records. They do not establish behaviour under concurrent load, across
different database engines or operating systems, with real rather than sample data, or under
penetration testing. No load, compatibility or penetration testing was performed, and none is claimed.
The automated checks were executed by throwaway harness scripts; they were not a maintained test suite
committed to the repository, so later changes would need a fresh pass. Screenshot evidence was captured
by the browser harness at the moment its DOM assertions for the shown view had already passed, and the
images were validated for dimensions and PNG integrity rather than by visual inspection inside the
reporting tool.

---

## CHAPTER SEVEN — SYSTEM RESULTS AND DISCUSSION

### 7.1 Interface Output

**Staff cards (Figure 01, `screenshots/01-main-directory.png`).** On load, the interface displays all
18 staff records in the responsive grid, ordered by last name then first name. Each card shows the
avatar, an employment-status badge, the full name, the job title, the department and role, and the
location. The sidebar shows a static count of six departments, and the summary line reports the number
of people shown. The observed output matched the API response for the same query, which confirmed that
the rendering layer neither drops nor duplicates records.

**Search results (Figure 02, `screenshots/02-search-results.png`).** Entering a search term reduced
the grid to the matching records and updated the count. Partial and case-insensitive terms behaved as
expected, and the filter controls retained their current selections.

**Department filter (Figure 03, `screenshots/03-department-filter.png`).** Selecting a department
reduced the grid to that department's staff. The dropdown is populated from the API rather than
hard-coded, so the options always reflect the database.

**Role filter (Figure 04, `screenshots/04-role-filter.png`).** Selecting a role produced the expected
subset, demonstrating that roles are modelled independently of departments — a filter for "Accountant"
returns staff in more than one department.

**Combined filters (Figure 05, `screenshots/05-combined-filters.png`).** With a search term, a
department, a role and a status all active, the grid showed only records satisfying every criterion,
confirming `AND` semantics in the interface as well as in the API.

**Profile modal (Figure 06, `screenshots/06-staff-profile-modal.png`).** Activating a card opened the
dialog populated with the record fetched from `GET /api/staff/:id`, showing name, job title, status,
department, role, email, phone, location and biography.

**Empty state (Figure 07, `screenshots/07-empty-state.png`).** A query matching nothing displayed the
dashed-border panel with "No staff members found." and the count of 0, rather than a blank grid — the
distinction between "no results" and "nothing rendered" is important for user confidence.

### 7.2 API Output

**Figure 09 (`screenshots/09-api-response.png`)** shows the live response captured from
`GET /api/staff`. The response contains the success envelope wrapping an array of 18 records, each
carrying the staff fields together with the resolved `department` and `role` names and a computed
`full_name`. This figure is the direct evidence for three design decisions: the records are ordered by
last name then first name; the department and role **names** are resolved server-side so the client
never has to join; and each record includes both the identifiers and the names, so the interface can
choose either.

### 7.3 Database Structure

**Figure 10 (`screenshots/10-database-structure.png`)** shows the live database structure as read from
the SQLite file: the three original tables with their columns, types and constraints, the primary and
foreign keys, and the indexes. The three tables added by the expanded tasks (`admins`,
`admin_sessions`, `tasks`) are documented in Sections 4.2.4 to 4.2.6 and were verified against the
live database by `PRAGMA table_info`, `PRAGMA index_list` and the index report in Appendix B.4. The
figure confirms the nullability documented in the report, in particular the actual nullability of
`job_title`, `department_id` and `role_id`, which is nullable in the implemented schema as discussed
in Section 4.2.3. Figure 10 was captured from the **local SQLite** database used for development and
testing; the live deployment instead uses a PostgreSQL database with the equivalent schema
(`src/database/schema.postgres.sql`).

### 7.4 Main Application

**Figure 11 (`screenshots/11-final-application.png`)** shows the completed application in its desktop
layout, with the persistent sidebar, the search field, the three filter controls, the summary line and
the populated card grid. It represents the delivered state of the project.

### 7.5 Evidence and Screenshots

**Figure 08 is documented below as QA evidence only. No standalone screenshot exists for it, and no
such file is claimed.**

| Figure | Description | File |
|---|---|---|
| 01 | Main staff directory, all records in the responsive grid | `screenshots/01-main-directory.png` |
| 02 | Search results for a free-text query | `screenshots/02-search-results.png` |
| 03 | Results filtered by department | `screenshots/03-department-filter.png` |
| 04 | Results filtered by role | `screenshots/04-role-filter.png` |
| 05 | Search and multiple filters applied together | `screenshots/05-combined-filters.png` |
| 06 | Staff profile modal showing a complete record | `screenshots/06-staff-profile-modal.png` |
| 07 | Empty state shown when no records match | `screenshots/07-empty-state.png` |
| 08 | Responsive / mobile behaviour — documented QA evidence; no standalone screenshot retained | *No screenshot file. See the note below.* |
| 09 | Live API response from `GET /api/staff` | `screenshots/09-api-response.png` |
| 10 | Live database structure read from the SQLite file | `screenshots/10-database-structure.png` |
| 11 | Final desktop application view | `screenshots/11-final-application.png` |
| 12 | Entity–relationship diagram of the database | `screenshots/12-er-diagram.png` |
| 13 | System architecture diagram | `screenshots/13-system-architecture.png` |
| 14 | Sign In screen, desktop | `screenshots/14-sign-in-desktop.png` |
| 15 | Sign In screen, 375px mobile | `screenshots/15-sign-in-mobile.png` |
| 16 | Sign Up screen, desktop | `screenshots/16-sign-up-desktop.png` |
| 17 | Account view, signed in, desktop | `screenshots/17-account-desktop-signed-in.png` |
| 18 | Account view, signed in, mobile | `screenshots/18-account-mobile-signed-in.png` |
| 19 | Directory rendered for a signed-in session, mobile | `screenshots/19-directory-mobile-signed-in.png` |
| 20 | Add Staff screen, desktop | `screenshots/20-add-staff-desktop.png` |
| 21 | Add Staff screen, 375px mobile | `screenshots/21-add-staff-mobile.png` |
| 22 | Directory immediately after creating a staff member | `screenshots/22-directory-after-create.png` |
| 23 | Tasks screen — empty state (unpopulated task list) | `screenshots/23-tasks-empty-state.png` |
| 24 | Tasks screen — list after creating tasks | `screenshots/24-tasks-list-after-create.png` |
| 25 | Tasks screen — after editing a task | `screenshots/25-tasks-after-edit.png` |
| 26 | Tasks screen — after deleting a task | `screenshots/26-tasks-after-delete.png` |
| 27 | Tasks screen — error state with retry | `screenshots/27-tasks-error-state.png` |
| 28 | Tasks screen, 375px mobile | `screenshots/28-tasks-mobile-375.png` |
| 29 | Dashboard, desktop | `screenshots/29-dashboard-desktop.png` |
| 30 | Dashboard, 375px mobile | `screenshots/30-dashboard-mobile-375.png` |
| 31 | Dashboard, 768px tablet | `screenshots/31-dashboard-tablet-768.png` |
| 32 | Dashboard → Directory link with the department filter pre-applied | `screenshots/32-dashboard-to-directory-filter.png` |
| 33 | Dashboard → Tasks link with the status filter pre-applied | `screenshots/33-dashboard-to-tasks-filter.png` |
| 34 | Dashboard error state with retry | `screenshots/34-dashboard-error-state.png` |
| 35 | Dashboard on a zero-data database (all-zero counts) | `screenshots/35-dashboard-empty.png` |

> **Note on Figure 08.** Responsive behavior was verified during final QA at 375px, 768px and 1440px;
> no standalone screenshot was retained. The verification is recorded as test case TC-19 in Section
> 6.3 of this report and described in `README.md` Section 14. There is deliberately **no**
> `screenshots/08-*.png` file in the repository, and no reference to such a file should be added when
> the report is typeset. If a figure is required in this position in the submitted document, a
> screenshot must be captured at that time; it cannot be reconstructed from the existing evidence.

### 7.6 Expanded-Scope Interface Output (Figures 14–35)

The following paragraphs describe the interface output captured during the expanded tasks. Each figure
was taken by the browser harness at the moment the DOM assertion for that view had already passed, and
each file was validated as a PNG of the stated viewport dimensions.

**Sign In and Sign Up (Figures 14, 15, 16).** The Sign In screen (desktop figure 14, 375px figure 15)
presents the email/password form with the administrator actions behind it. Figure 16 shows Sign Up with
the four required fields. Wrong credentials produced the generic "Invalid email or password" message
rather than any indication that an account exists, confirmed by the API checks as well as the UI.

**Account view (Figures 17, 18).** After sign-in or registration the account view displays the signed-in
administrator's full name, username and email together with the Dashboard, Add a staff member and
Manage tasks action cards (desktop figure 17, mobile figure 18). The sidebar and header now show the
administrator's name and the administrator-only navigation, whereas a visitor sees only Sign In /
Sign Up — the difference is driven by `GET /api/auth/me` on load.

**Directory for a signed-in session (Figure 19).** The mobile directory remains identical for
administrators and visitors, confirming that the expanded scope did not alter the public read side of
the application.

**Add Staff (Figures 20, 21, 22).** Figures 20 and 21 show the Add Staff form at desktop and 375px
widths. Figure 22 shows the verified outcome: after the form was submitted, the directory displayed
the new record (a clearly differing name) and the count reflected the new total — evidence that the
create path is genuinely effective, not merely accepted.

**Tasks (Figures 23–28).** Figure 23 shows the empty state of an unpopulated task list. Figure 24 shows
the list after creating tasks (title cards with assignee, priority, status, due date and overdue
indicators). Figure 25 shows the list after editing a task, figure 26 after a confirmed deletion
(one card fewer), figure 27 the controlled error state with its retry action, and figure 28 the 375px
layout. The create → edit → delete sequence visible across figures 24–26 is a single honest lifecycle
record: the intermediate counts differ by exactly one task at each step.

**Dashboard (Figures 29–35).** Figure 29 is the desktop dashboard with the total staff (18), total
tasks (8) and the per-status and overdue summaries as recomputed from the live (throwaway) database;
figures 30 and 31 show the same view at 375px and 768px. Figures 32 and 33 show the dashboard acting as
an entry point: the "Engineering" summary link opened the directory with the department filter
pre-applied, and a status summary link opened the Tasks view with that status filter pre-applied.
Figure 34 shows the dashboard error state with its retry action, produced by interrupting the API.
Figure 35 shows the dashboard on a fresh schema-only database: every count reads zero and each list
panel shows its empty message, because the dashboard explicitly handles a database that has no data
rather than hiding the sections.

---

## CHAPTER EIGHT — CONCLUSION AND RECOMMENDATIONS

### 8.1 Conclusion

This project set out to determine whether a staff directory could be made genuinely useful by
centralizing staff information in a relational database and presenting it through a responsive,
searchable web interface. The delivered system demonstrates that it can.

The completed Staff Directory Web Application comprises a relational database of six tables —
`departments`, `roles`, `staff`, `admins`, `admin_sessions` and `tasks` — connected by one-to-many
relationships and protected by primary keys, unique constraints, foreign keys with referential
actions, ten explicit supporting indexes and enforced foreign key integrity. On top of this sits a
REST API of twenty endpoints: seven public read-only directory endpoints with a consistent success
and error envelope, plus the protected authentication, staff-creation, task-management and dashboard
endpoints approved in the expanded scope. The responsive front end is built with HTML5, Tailwind CSS
and Vanilla JavaScript and is used in two modes: staff are browsed as cards, searched by name, email
or job title, filtered by department, role and employment status individually or in combination, and
inspected through an accessible profile dialog; and a signed-in administrator can additionally create
staff members, manage and track tasks, and open a dashboard that recomputes its summaries from the
live database.

All 21 original test cases passed with no failures, and every recorded expanded-task and final-smoke
check passed — including the 221 distinct checks of the final integrated smoke pass. The covered
behaviour ranges from startup, database initialization, every API endpoint including its invalid-input
paths, all three search field groups, all three filters, combined filtering and reset, the empty
state, the profile modal with focus trapping and scroll locking, responsive layout at 375px, 768px
and 1440px, and structured error handling without exposed stack traces, to authorization, session
expiry, the full task lifecycle, dashboard numbers cross-checked against independent SQL aggregates,
zero-data handling and complete browser-console cleanliness. The real database's SHA-256 hashes were
verified unchanged after every verification pass that wrote to a disposable copy.

Several implementation decisions proved particularly valuable. Building the query dynamically but
always with bound parameters gave both flexible filtering and structural immunity to SQL injection.
Escaping wildcard characters so that a literal `%` searches for a literal `%` was a small decision
that prevents a whole class of confusing behaviour. Comparing the front-end state against the API
response for the same query is what allows a mismatch between the rendered grid and the returned data
to be detected at all. The monotonic request tokens in both the filter and modal modules prevent slow
responses from overwriting newer ones — a class of bug that is easy to introduce and hard to notice by
eye.

The project also demonstrates the value of the layered structure. Because SQL is confined to the
repositories, HTTP concerns to the controllers and rendering to the UI module, each layer could be
read and verified independently, and new capability can be added without rewriting the system.

The limitations are equally instructive. The write surface is incomplete (staff records cannot yet be
edited or deleted, there is no audit log, and authentication is a single role), the data is
fictional, and the Tailwind stylesheet must be rebuilt (`npm run build:css`) whenever its classes
change. The live deployment — a static
frontend paired with an Express/PostgreSQL backend — has been verified only at the level recorded in
Appendix F: it has not been load or penetration tested, and persistence across a restart has not been
confirmed. It is a working, well-tested demonstration of the design — one that now extends well beyond
a viewer into a genuinely usable administrative tool — not a production system, and this report does
not present it as one. What has been demonstrated is the complete, verified path from requirements through
relational design and REST-based implementation to a tested and documented deliverable, including a
secure administrative extension of a read-only service.

### 8.2 Recommendations

Several of the improvements recommended when the directory alone existed have since been implemented
in the expanded scope: authentication with server-side sessions, a signed-in account view, staff
creation through a protected endpoint and form, a full task-management backend and interface, an
administrator dashboard, and — after this report's first draft — a migration of the live database to
hosted PostgreSQL and an actual production deployment. The following therefore concern what remains
**future work**; where an item has since been partly implemented, this is stated explicitly. Items
that are not marked as implemented are **not** existing features.

**Staff editing and deletion.** The expanded scope implemented staff *creation*; editing and deleting
staff records through the interface remain out of scope. Completing these with the same validation and
confirmation discipline as the task lifecycle would make the directory fully maintainable through the
application.

**Role-based access control.** The delivered system has a single administrative role. Different users
could be granted different permissions, for example allowing all staff to read the directory while
restricting record and task management to authorized personnel.

**Account recovery, password reset and rate limiting.** Administrators cannot currently recover a
forgotten password, and no request throttling is applied to login. An email-based reset flow and
per-account rate limiting would harden the authentication boundary for any real deployment.

**Audit logging.** Recording which administrator created or modified a record or task, and when, would
support accountability now that write operations exist.

**Pagination and performance at scale.** The current design returns all matching records in one
response, which is entirely appropriate for 18 records but would not be for tens of thousands.
Server-side pagination with a total count, and possibly lazy loading, would allow the dataset to grow
without degrading the response size. The existing indexes on `department_id`, `role_id`,
`employment_status` and `last_name` would support this.

**A production database engine and durable storage.** *Implemented (operational follow-up only).* The
live deployment now uses hosted PostgreSQL (Supabase) instead of a local SQLite file, so the
single-writer constraint and the ephemeral-instance resets described in earlier drafts no longer apply
to production. What remains is operational rather than architectural: confirming data persistence
across a restart or redeploy, and verifying the hosted backup and restore procedure.

**Image storage.** Avatar images are currently referenced by path. A future version could support
uploading, resizing and storing avatars, with server-side validation of file type and size.

**Deployment hardening.** *Partly implemented.* The application is published as two Render services
(a static front end and an HTTPS Express/PostgreSQL backend) with environment-based configuration.
What remains is hardening beyond HTTPS — request throttling and a formal review of the administrative
endpoints — together with the deployment runbook and verification checklist added to `README.md`.

**Automated testing.** *Partly implemented.* A maintained suite now runs under `npm test` (Node's
built-in `node --test`) and covers configuration, both SQL dialects, the repository layer, error
handling and the one-time migration logic — 119 tests at the time of writing. It does not yet cover
the front end or the HTTP controllers end-to-end, and it runs against SQLite; extending it to the API
surface and adding a PostgreSQL-backed run would allow regressions in those areas to be caught
automatically.

**Compiling the front-end assets locally.** *Implemented.* The Tailwind CDN reference has been
replaced by a local build (`npm run build:css`) that compiles the utility CSS to a committed
`public/assets/css/tailwind.css`, loaded as a normal same-origin stylesheet. This removes the runtime
internet dependency and the flash of unstyled content. Because Tailwind is a static scanner, class
names must still appear literally in the scanned source; a future bundler would only change which
files are scanned, not this requirement.

**Additional data.** Where the organization has an existing authoritative list of staff, replacing the
fictional seed data with real records — subject to consent and data-protection requirements — would
make the system operational rather than illustrative.

---

## REFERENCES

> **Note on referencing.** Formal academic references have **not** been fabricated. No authors,
> publication years, journal titles, volume or issue numbers, publishers, DOI identifiers or URLs have
> been invented. The entries below consist of the project's own documentation, which does exist and
> can be cited precisely, and placeholders marking where the department's required academic sources
> must be inserted. Please consult the referencing style required by **[Institution Name]**, Department
> of **[Department]**, and complete the placeholders accordingly.

### A. Project Documentation

1. **[Student Name]**, *Design and Implementation of a Staff Directory Web Application*, SIWES project
   report, **[Institution Name]**, **[SIWES Year]**. *(This document.)*
2. *PROJECT_SPEC.md* — project specification and requirements. Project repository, root directory.
3. *README.md* — project overview, technology stack, API reference, usage instructions and
   documentation of verified responsive behaviour (Section 14). Project repository, root directory.
4. `src/database/schema.sql` — authoritative database schema. Project repository.
5. `screenshots/12-er-diagram.png` — entity–relationship diagram. Project repository.
6. `screenshots/13-system-architecture.png` — system architecture diagram. Project repository.

### B. Official Technology Documentation

8. Node.js Foundation. *Node.js Documentation*. `[URL/reference to be added]`
9. OpenJS Foundation. *Express.js Documentation*. `[URL/reference to be added]`
10. SQLite Consortium. *SQLite Documentation*. `[URL/reference to be added]`
11. `better-sqlite3` project documentation. `[URL/reference to be added]`
12. Tailwind Labs. *Tailwind CSS Documentation*. `[URL/reference to be added]`
13. WHATWG. *Web Platform Specifications / HTML Living Standard*. `[URL/reference to be added]`

### C. Foundational and Academic Sources Required

The following concepts are discussed in Chapter Two and require formal academic citation in
accordance with departmental guidelines. The placeholders below mark the exact positions where
sources must be supplied.

14. Codd, E. F. — foundational description of the relational model. `[Author, title, year, publisher
    or journal — reference to be added]`
15. Fielding, R. — architectural style of REST. `[Author, title, year — reference to be added]`
16. Source on staff information management / personnel information systems. `[Reference to be
    added]`
17. Source on web-based information systems. `[Reference to be added]`
18. Source on responsive web design. `[Reference to be added]`
19. Source on client–server and multi-tier architecture. `[Reference to be added]`
20. Source on information retrieval, search and filtering in information systems. `[Reference to be
    added]`
21. Source on SQLite as an embedded relational database. `[Reference to be added]`
22. Source on web accessibility and inclusive design, if required. `[Reference to be added]`

---

## APPENDIX A — API ENDPOINTS

**Base path:** `/api` · **Content type:** `application/json` · **Public:** the seven directory `GET`
routes (unchanged read-only) and the three public authentication endpoints (`POST /api/auth/register`,
`/api/auth/login`, `/api/auth/logout`) · **Protected:** the remaining routes, guarded by the
`admin_session` cookie

### A.1 Success Envelope

```json
{ "success": true, "data": {} }
```

### A.2 Error Envelope

```json
{ "success": false, "error": { "message": "Staff member not found" } }
```

### A.3 Endpoint Table

| # | Method | Endpoint | Parameters | Success | Errors |
|---|---|---|---|---|---|
| 1 | GET | `/api/health` | — | 200 — `status`, `service`, `uptime` | 404 (unknown route), 500 |
| 2 | GET | `/api/staff` | `search`, `department`, `role`, `status` (all optional) | 200 — array of staff; empty array if no match | 400, 404, 500 |
| 3 | GET | `/api/staff/:id` | Path `id` (positive integer) | 200 — one staff record | 400 (non-numeric), 404 (not found), 500 |
| 4 | GET | `/api/departments` | — | 200 — array of 6 departments, ordered by name | 404, 500 |
| 5 | GET | `/api/departments/:id` | Path `id` (positive integer) | 200 — one department | 400, 404, 500 |
| 6 | GET | `/api/roles` | — | 200 — array of 9 roles, ordered by name | 404, 500 |
| 7 | GET | `/api/roles/:id` | Path `id` (positive integer) | 200 — one role | 400, 404, 500 |

**Public authentication endpoints (8–10) — no session required.**

| # | Method | Endpoint | Parameters | Success | Errors |
|---|---|---|---|---|---|
| 8 | POST | `/api/auth/register` | Body: `full_name`, `username`, `email`, `password` | 201 — `{ admin }` + cookie | 400 invalid input, 409 duplicate username/email |
| 9 | POST | `/api/auth/login` | Body: `email`, `password` | 200 — `{ admin }` + cookie | 401 (generic "Invalid email or password"), 400 |
| 10 | POST | `/api/auth/logout` | Optional `admin_session` cookie (cleared if present) | 200 — session deleted, cookie cleared | 400 |

**Protected endpoints (11–20) — all require a valid `admin_session` cookie.**

| # | Method | Endpoint | Parameters | Success | Errors |
|---|---|---|---|---|---|
| 11 | GET | `/api/auth/me` | Cookie session | 200 — `{ admin }`, or 401 | 401 |
| 12 | POST | `/api/staff` | Body: staff fields; `department_id`, `role_id` | 201 — created record | 401, 400, 409 duplicate email |
| 13 | GET | `/api/staff/:id/tasks` | Path `id` | 200 — staff member's tasks | 401, 400, 404 |
| 14 | GET | `/api/tasks` | `staff_id`, `status`, `priority` (optional) | 200 — task array; empty if no match | 401, 400, 404 (unknown staff), 500 |
| 15 | GET | `/api/tasks/:id` | Path `id` | 200 — one task | 401, 400, 404 |
| 16 | POST | `/api/tasks` | Body: `title`, `description`, `staff_id`, `priority`, `status`, `due_date` | 201 — created task | 401, 400, 404 (unknown staff) |
| 17 | PATCH | `/api/tasks/:id/status` | Body: `status` (allowed value) | 200 — updated task | 401, 400, 404, 409 (disallowed transition) |
| 18 | PUT | `/api/tasks/:id` | Body as for POST | 200 — updated task | 401, 400, 404, 409 |
| 19 | DELETE | `/api/tasks/:id` | Path `id` | 200 — deletion result | 401, 400, 404 |
| 20 | GET | `/api/admin/dashboard` | Cookie session | 200 — staff and task summaries, overdue/top/recent lists | 401, 500 |

### A.4 Query Parameter Reference

| Parameter | Type | Applies to | Semantics | Searchable / matched fields |
|---|---|---|---|---|
| `search` | string | `/api/staff` | Partial, case-insensitive, wildcard-escaped | `first_name`, `last_name`, concatenated full name, `email`, `job_title` |
| `department` | string | `/api/staff` | Exact match, case-insensitive | `departments.name` |
| `role` | string | `/api/staff` | Exact match, case-insensitive | `roles.name` |
| `status` | string | `/api/staff` | Exact match, case-insensitive | `staff.employment_status` |

All supplied criteria are combined with `AND`. Blank and whitespace-only values are ignored.
Unrecognised parameters are ignored. The same rules apply to `GET /api/tasks`, which accepts
`staff_id` (numeric, must exist), `status` and `priority` (both restricted to their allowed `CHECK`
values). The body of a request to a protected endpoint never contains a session token or an
administrator identifier: the session cookie identifies the caller, and `created_by_admin_id` is
taken from the session server-side.

### A.5 Example Requests and Responses

| Request | Result |
|---|---|
| `GET /api/health` | `{"success":true,"data":{"status":"ok","service":"Staff Directory API","uptime":42}}` |
| `GET /api/staff` | Success envelope with all 18 records |
| `GET /api/staff?search=amara` | Success envelope with the matching record(s) |
| `GET /api/staff?department=Engineering` | Success envelope with that department's staff only |
| `GET /api/staff?role=QA%20Engineer` | Success envelope with that role's staff only |
| `GET /api/staff?status=On%20Leave` | Success envelope with 2 records |
| `GET /api/staff?search=zzznotfound` | 200 with an empty `data` array |
| `GET /api/staff/1` | Success envelope with one complete record |
| `GET /api/staff/abc` | 400 — `{"success":false,"error":{"message":"Invalid staff id"}}` |
| `GET /api/staff/9999` | 404 — `{"success":false,"error":{"message":"Staff member not found"}}` |
| `GET /api/unknown` | 404 — `{"success":false,"error":{"message":"Route not found"}}` |
| `POST /api/auth/register` | 201 — `{"success":true,"data":{"admin":{…}}} ` + `Set-Cookie: admin_session=…; HttpOnly; SameSite=Lax; Max-Age=604800` |
| `POST /api/auth/login` (wrong password) | 401 — `{"success":false,"error":{"message":"Invalid email or password"}}` |
| `GET /api/admin/dashboard` (no cookie) | 401 — `{"success":false,"error":{"message":"Session is invalid or has expired"}}` |
| `GET /api/admin/dashboard` (valid cookie) | 200 — `{"success":true,"data":{"staff":{…},"tasks":{…},"overdue_tasks":[…],"top_open_staff":[…],"recent_tasks":[…],}}` |
| `POST /api/tasks` (valid cookie) | 201 — created task with `created_by_admin_id` resolved from the session |

### A.6 Notes

* The seven public directory endpoints are **read-only and unchanged**. The three public
  authentication endpoints (`POST /api/auth/register`, `/api/auth/login`, `/api/auth/logout`) require
  no session of their own; every other write and the remaining authenticated `GET` routes require the
  `admin_session` cookie.
* **Authentication:** `POST /api/auth/register` creates the first administrator (no account is
  seeded). Login returns the same generic 401 whether the account is missing or the password is
  wrong. The session cookie is `HttpOnly`, `SameSite=Lax`, seven days, and `Secure` in production.
* **Authorization:** endpoints 11–20 require a valid `admin_session` cookie; without one they return
  401 before any controller logic runs.
* **No credential leakage:** administrator responses expose only `id`, `username`, `email` and
  `full_name`; no endpoint returns a password hash, salt or session token. The harness scanned every
  captured response for such material.
* Filter values for `department` and `role` are **names**, not identifiers.
* The server ignores any query parameter outside the supported keys on both resource lists.

---

## APPENDIX B — DATABASE TABLES

**Database file:** `data/staff-directory.db` · **Engine:** SQLite 3 via `better-sqlite3` ·
**Schema source:** `src/database/schema.sql` · **Foreign keys:** enabled ·
**Journal mode:** WAL

> Appendix B documents the **local SQLite** database used for development and testing. The production
> deployment runs the equivalent schema (`src/database/schema.postgres.sql`) on PostgreSQL; the tables,
> columns and indexes are the same, with PostgreSQL-specific type names.

### B.1 `departments` — 6 records

| Column | Type | Null | Key / Default | Notes |
|---|---|---|---|---|
| `id` | INTEGER | No | **PRIMARY KEY AUTOINCREMENT** | Identifier |
| `name` | TEXT | No | **UNIQUE** | Department name; used for filtering |
| `description` | TEXT | Yes | — | Purpose of the department |
| `created_at` | TEXT | No | `datetime('now')` | Creation timestamp |

Seeded values: Engineering, Design, Human Resources, Finance, Marketing, Operations.

### B.2 `roles` — 9 records

| Column | Type | Null | Key / Default | Notes |
|---|---|---|---|---|
| `id` | INTEGER | No | **PRIMARY KEY AUTOINCREMENT** | Identifier |
| `name` | TEXT | No | **UNIQUE** | Role name; used for filtering |
| `description` | TEXT | Yes | — | Responsibility of the role |
| `created_at` | TEXT | No | `datetime('now')` | Creation timestamp |

Seeded values: Software Developer, Senior Developer, UI/UX Designer, Product Manager, HR Officer,
Accountant, Marketing Specialist, Team Lead, QA Engineer.

### B.3 `staff` — 18 records

| Column | Type | Null | Key / Default | Notes |
|---|---|---|---|---|
| `id` | INTEGER | No | **PRIMARY KEY AUTOINCREMENT** | Identifier |
| `first_name` | TEXT | No | — | Given name; searchable |
| `last_name` | TEXT | No | — | Family name; searchable; default sort key |
| `email` | TEXT | No | **UNIQUE** | Contact address; searchable |
| `phone` | TEXT | Yes | — | Contact telephone |
| `job_title` | TEXT | **Yes** | — | Specific title; searchable |
| `department_id` | INTEGER | **Yes** | **FOREIGN KEY** → `departments(id)` | `ON UPDATE CASCADE`, `ON DELETE RESTRICT` |
| `role_id` | INTEGER | **Yes** | **FOREIGN KEY** → `roles(id)` | `ON UPDATE CASCADE`, `ON DELETE RESTRICT` |
| `location` | TEXT | Yes | — | Office or city |
| `avatar_url` | TEXT | Yes | — | Avatar path; defaults to local placeholder |
| `bio` | TEXT | Yes | — | Short biography |
| `employment_status` | TEXT | No | `DEFAULT 'Active'` | Active / On Leave / Inactive |
| `created_at` | TEXT | No | `datetime('now')` | Creation timestamp |
| `updated_at` | TEXT | No | `datetime('now')` | Last update timestamp |

> **Nullability note.** `job_title`, `department_id`, `role_id`, `location`, `avatar_url` and `bio`
> are **nullable in the implemented schema**. Only `first_name`, `last_name`, `email` and
> `employment_status` are `NOT NULL`. The staff query therefore uses `LEFT JOIN`, and the interface
> renders an em dash for absent values. See Section 4.2.3.

Seeded status distribution: 14 Active, 2 On Leave, 2 Inactive.

### B.4 `admins` — 0 seeded records

| Column | Type | Null | Key / Default | Notes |
|---|---|---|---|---|
| `id` | INTEGER | No | **PRIMARY KEY AUTOINCREMENT** | Identifier |
| `username` | TEXT | No | **UNIQUE** | Sign-in username |
| `email` | TEXT | No | **UNIQUE** | Sign-in email, stored lowercase |
| `password_hash` | TEXT | No | — | Salted `scrypt` hash; never plaintext, never returned by an endpoint |
| `full_name` | TEXT | No | — | Display name |
| `created_at` | TEXT | No | `datetime('now')` | Creation timestamp |
| `updated_at` | TEXT | No | `datetime('now')` | Last update timestamp |

No administrator is seeded. The first account is created through `POST /api/auth/register`.

### B.5 `admin_sessions` — 0 rows in a fresh database (one row per active sign-in)

| Column | Type | Null | Key / Default | Notes |
|---|---|---|---|---|
| `id` | TEXT | No | **PRIMARY KEY** | Opaque 256-bit random token placed in the `admin_session` cookie |
| `admin_id` | INTEGER | No | **FOREIGN KEY** → `admins(id)` `ON UPDATE CASCADE ON DELETE RESTRICT` | The signed-in administrator |
| `expires_at` | TEXT | No | — | Seven days after creation; past date ⇒ 401 `Session is invalid or has expired` |
| `created_at` | TEXT | No | `datetime('now')` | Creation timestamp |

### B.6 `tasks` — 0 seeded records

| Column | Type | Null | Key / Default | Notes |
|---|---|---|---|---|
| `id` | INTEGER | No | **PRIMARY KEY AUTOINCREMENT** | Identifier |
| `title` | TEXT | No | — | Max 200 characters |
| `description` | TEXT | Yes | — | Max 2000 characters |
| `staff_id` | INTEGER | No | **FOREIGN KEY** → `staff(id)` `ON UPDATE CASCADE ON DELETE RESTRICT` | Assigned staff member |
| `priority` | TEXT | No | `DEFAULT 'Medium'`, `CHECK` in `Low`/`Medium`/`High`/`Urgent` | Task priority |
| `status` | TEXT | No | `DEFAULT 'Pending'`, `CHECK` in `Pending`/`In Progress`/`Completed`/`On Hold`/`Cancelled` | Task status |
| `due_date` | TEXT | Yes | ISO `YYYY-MM-DD` | Real calendar date; drives the overdue calculation |
| `created_by_admin_id` | INTEGER | No | **FOREIGN KEY** → `admins(id)` `ON UPDATE CASCADE ON DELETE RESTRICT` | Administrator from the session, never the request body |
| `created_at` | TEXT | No | `datetime('now')` | Creation timestamp |
| `updated_at` | TEXT | No | `datetime('now')` | Last update timestamp |

### B.7 Indexes (16 total)

| Index | Kind | Table | Column(s) |
|---|---|---|---|
| `sqlite_autoindex_departments_1` | Implicit (UNIQUE) | `departments` | `name` |
| `sqlite_autoindex_roles_1` | Implicit (UNIQUE) | `roles` | `name` |
| `sqlite_autoindex_staff_1` | Implicit (UNIQUE) | `staff` | `email` |
| `sqlite_autoindex_admins_1` | Implicit (UNIQUE) | `admins` | `username` |
| `sqlite_autoindex_admins_2` | Implicit (UNIQUE) | `admins` | `email` |
| `admin_sessions` PK | Implicit (PRIMARY KEY) | `admin_sessions` | `id` |
| `idx_staff_department_id` | Explicit | `staff` | `department_id` |
| `idx_staff_role_id` | Explicit | `staff` | `role_id` |
| `idx_staff_employment_status` | Explicit | `staff` | `employment_status` |
| `idx_staff_last_name` | Explicit | `staff` | `last_name` |
| `idx_admin_sessions_admin_id` | Explicit | `admin_sessions` | `admin_id` |
| `idx_admin_sessions_expires_at` | Explicit | `admin_sessions` | `expires_at` |
| `idx_tasks_staff_id` | Explicit | `tasks` | `staff_id` |
| `idx_tasks_status` | Explicit | `tasks` | `status` |
| `idx_tasks_created_by_admin_id` | Explicit | `tasks` | `created_by_admin_id` |
| `idx_tasks_due_date` | Explicit | `tasks` | `due_date` |

(Each `INTEGER PRIMARY KEY` additionally uses the table's rowid as its index.)

### B.8 Verification

| Check | Command / method | Result |
|---|---|---|
| Structural integrity | `PRAGMA integrity_check` | `ok` |
| Foreign key enforcement enabled | `PRAGMA foreign_keys` | `1` |
| Orphaned references | Foreign key check | No violations |
| Table counts | `COUNT(*)` per table | 6 departments, 9 roles, 18 staff (admins/sessions/tasks as created by use; 0 in a fresh database) |

---

## APPENDIX C — PROJECT STRUCTURE

### C.1 Directory Layout

```
staff-directory/
├── server.js                     Application entry point; creates the HTTP listener
├── package.json                  Dependencies and scripts (start, dev, build:css, test, db:init, db:seed, db:migrate:pg)
├── package-lock.json             Locked dependency versions
├── tailwind.config.js            Tailwind build configuration (scans index.html and assets/js)
├── tailwind.input.css            Tailwind source (build entry point for `npm run build:css`)
├── .gitignore                    Excludes node_modules and the local database file
├── README.md                     Project documentation
├── PROJECT_SPEC.md               Specification and requirements
├── SIWES_PROJECT_REPORT.md       This report
│
├── data/
│   └── staff-directory.db        SQLite database file (generated, not committed)
│
├── public/                       Front end, served statically by Express
│   ├── index.html                Page structure, state containers, profile dialog, views
│   └── assets/
│       ├── css/tailwind.css        Compiled Tailwind utilities (generated, committed)
│       ├── css/styles.css        Minimal custom CSS
│       ├── js/api.js             HTTP client (fetch wrapper)
│       ├── js/ui.js              DOM rendering and state containers
│       ├── js/filters.js         Filter state, debouncing, request sequencing
│       ├── js/modal.js           Profile dialog, focus and scroll management
│       ├── js/auth.js            Sign In / Sign Up / account view, session state
│       ├── js/staff-create.js    Add Staff view
│       ├── js/tasks.js           Tasks screen (Task 5)
│       ├── js/dashboard.js       Dashboard screen (Task 6)
│       ├── js/app.js             Bootstrap, view routing and orchestration
│       └── images/placeholders/  Locally served avatar placeholder
│
├── src/                          Back end
│   ├── app.js                    Express application assembly
│   ├── config/config.js          Port, paths, environment configuration
│   ├── routes/
│   │   ├── healthRoutes.js       GET /api/health
│   │   ├── authRoutes.js         POST /api/auth/register|login|logout, GET /api/auth/me
│   │   ├── staffRoutes.js        GET /api/staff, /api/staff/:id, POST /api/staff, GET /api/staff/:id/tasks
│   │   ├── taskRoutes.js         GET/POST /api/tasks, GET/PATCH/PUT/DELETE /api/tasks/:id
│   │   ├── dashboardRoutes.js    GET /api/admin/dashboard
│   │   ├── departmentRoutes.js   GET /api/departments, /api/departments/:id
│   │   └── roleRoutes.js         GET /api/roles, /api/roles/:id
│   ├── controllers/
│   │   ├── staffController.js        Request handling for staff
│   │   ├── authController.js         Registration, login, logout, me
│   │   ├── taskController.js         Task lifecycle and validation
│   │   ├── dashboardController.js    Dashboard summary assembly
│   │   ├── departmentController.js   Request handling for departments
│   │   └── roleController.js         Request handling for roles
│   ├── repositories/
│   │   ├── staffRepository.js        SQL: search, filter, order, map rows
│   │   ├── adminRepository.js        Account lookup and creation
│   │   ├── sessionRepository.js      Session create/delete/expiry
│   │   ├── taskRepository.js         Task SQL and filters
│   │   ├── dashboardRepository.js    Dashboard aggregate SQL
│   │   ├── departmentRepository.js   SQL for departments
│   │   └── roleRepository.js         SQL for roles
│   ├── services/
│   │   ├── passwordService.js        scrypt hashing and constant-time comparison
│   │   └── sessionService.js         Token generation, cookie creation
│   ├── utils/
│   │   └── cookies.js               Cookie parsing helpers
│   ├── middleware/
│   │   ├── parseCookies.js          Cookie header → req.cookies
│   │   ├── authenticate.js          401 for missing/expired sessions on protected routes
│   │   ├── notFound.js           404 handling, JSON for API paths
│   │   └── errorHandler.js       Centralized error handling, generic messages
│   └── database/
│       ├── db.js                 Connection, pragmas, schema application
│       ├── schema.sql            Authoritative schema
│       └── seed.js               Idempotent seed data (departments, roles, staff)
│
└── screenshots/                  Evidence files, Figures 01–13 and 14–35 (08 not retained)
```

### C.2 Back-end Layer Responsibilities

| Layer | Directory | Responsibility | Must not do |
|---|---|---|---|
| Routes | `src/routes/` | Map method and URI to a controller function | Contain logic or SQL |
| Controllers | `src/controllers/` | Validate input, choose status code, shape the envelope | Write SQL |
| Repositories | `src/repositories/` | Execute SQL, map rows to objects | Know about HTTP |
| Services | `src/services/` | Password hashing, session token and cookie creation | Know about HTTP routing |
| Middleware | `src/middleware/` | Cross-cutting session, 404 and error handling | Contain feature logic |
| Database | `src/database/` | Connection, schema, seed data | Know about HTTP |
| Config | `src/config/` | Paths, port, environment variables | Contain logic |

### C.3 Front-end Module Responsibilities

| Module | Responsibility | Must not do |
|---|---|---|
| `api.js` | Build URLs, send requests, normalize errors | Render or hold state |
| `ui.js` | Turn data into DOM; manage state containers | Perform network calls |
| `filters.js` | Hold filter state, listen to controls, sequence requests | Call `fetch` or build cards |
| `modal.js` | Profile dialog, focus, scroll lock, closing behaviour | Call `fetch` or build HTML strings |
| `auth.js` | Sign In / Sign Up / account views; session detection and expiry handling | Build task or dashboard DOM |
| `staff-create.js` | Add Staff form; validated create through the protected endpoint | Render the directory grid |
| `tasks.js` | Tasks screen; create/edit/status/delete dialogs and filters | Manage directory filters |
| `dashboard.js` | Dashboard screen; summary rendering, retry, session-expiry routing | Write data |
| `app.js` | Coordinate startup, initial load, view routing, retry | Build DOM directly |

### C.4 npm Scripts

| Script | Command | Purpose |
|---|---|---|
| `start` | `node server.js` | Run the application |
| `dev` | `nodemon server.js` | Run with automatic restart on file changes |
| `build:css` | `tailwindcss -i ./tailwind.input.css -o ./public/assets/css/tailwind.css --minify` | Compile the Tailwind CSS stylesheet (output is committed) |
| `test` | `node --test` | Run the automated test suite (Node's built-in test runner) |
| `db:init` | `node src/database/seed.js` | Create the schema and seed the sample data |
| `db:seed` | `node src/database/seed.js` | Alias of `db:init` |
| `db:migrate:pg` | `node scripts/migrate-sqlite-to-postgres.js` | One-time import of the local SQLite data into PostgreSQL; never run automatically |

### C.5 Dependencies

| Package | Version | Type | Purpose |
|---|---|---|---|
| `express` | ^5.2.1 | Runtime | HTTP server, routing, static files |
| `better-sqlite3` | ^13.0.3 | Runtime | Synchronous SQLite driver (local development and tests) |
| `pg` | ^8.23.1 | Runtime | PostgreSQL driver (production database) |
| `nodemon` | ^3.1.10 | Development | Automatic restart |
| `tailwindcss` | 3.4.17 | Development | Compiles the Tailwind CSS stylesheet for `build:css` |

The front end has **no runtime dependencies**: no framework and no bundler. Its one build step
compiles Tailwind CSS (the `tailwindcss` development dependency) into
`public/assets/css/tailwind.css`, which is committed and served as a static file.

---

## APPENDIX D — TESTING SUMMARY

### D.1 Recorded Results

| Metric | Value |
|---|---|
| Original test cases (directory) | 21 |
| Passed | 21 |
| Failed | 0 |
| Expanded-task verification (Tasks 1–6) | All recorded checks PASS |
| Final integrated smoke pass (Task 7) | 221 / 221 distinct checks PASS |
| Pass rate | 100% of recorded cases |

### D.2 Coverage by Area

| Area | Tests | Result |
|---|---|---|
| Startup and database initialization | TC-01, TC-02 | PASS |
| API — health, list and single-record endpoints | TC-03 to TC-07 | PASS |
| Search — name, email, job title | TC-08, TC-09, TC-10 | PASS |
| Filtering — department, role, status | TC-11, TC-12, TC-13 | PASS |
| Combined filtering and reset | TC-14, TC-15 | PASS |
| Empty and no-result states | TC-16 | PASS |
| Profile modal and keyboard interaction | TC-17, TC-18 | PASS |
| Responsive layout (375px, 768px, 1440px) | TC-19 | PASS |
| API error handling and status codes | TC-20 | PASS |
| Browser console cleanliness | TC-21 | PASS |
| Authentication (register, login, logout, me, expiry) | Task 1/2 checks; final smoke | PASS |
| Authorization (401 without a session) | H1–H3, E4, final smoke S-series | PASS |
| Admin staff creation and directory publication | Task 3; final smoke S2–S5 | PASS |
| Task lifecycle and filters | Task 4/5; browser D-series | PASS |
| Dashboard numbers vs independent SQL aggregates | H12–H20 | PASS |
| Zero-data database handling | E-series, browser-empty | PASS |
| Secret scan across responses | populated-copy HTTP suite + E18 | PASS |
| Real database SHA-256 unchanged after write passes | before/after hashes | PASS |

### D.3 Viewports Verified

| View | 375px | 768px | 1440px |
|---|---|---|---|
| Directory | 1 column, no overflow | 2 columns, no overflow | 3 columns + sidebar, no overflow |
| Sign In / Sign Up / Account | Renders, no overflow | Renders, no overflow | Renders, no overflow |
| Add Staff | Renders, no overflow | Renders, no overflow | Renders, no overflow |
| Tasks | Single column, no overflow (Figure 28) | Renders, no overflow | Renders, no overflow |
| Dashboard | Single column, no overflow (Figure 30) | Tablet layout (Figure 31) | Desktop layout (Figure 29) |

### D.4 Areas Not Covered

The following were **not** tested and no claim is made about them: load and performance testing,
concurrent multi-user access, cross-browser and cross-platform compatibility, penetration testing,
accessibility audit against a formal standard, behaviour with real organizational data, and data
persistence across a restart or redeploy.

**Coverage note on the automated suite.** The committed suite (`npm test`) exercises the HTTP API
end-to-end — `test/api.test.js` starts the real Express application on an ephemeral port and drives
the controllers, middleware and routes over HTTP — together with the repository, dialect,
configuration, error-handling and migration layers, all against SQLite. It does **not** exercise the
front-end browser workflows (search, filters, profile modal, Add Staff, Tasks and Dashboard
interaction) or the application against a live PostgreSQL database; those remain manual.

Two items previously listed here have since been partly addressed and are recorded in Appendix F:
**encrypted transport** is in use (the live backend verifies the Supabase TLS certificate against the
Supabase CA) and the application **is deployed** to production — though only the specific checks listed
in Appendix F were performed. Everything else in this list remains untested.

### D.5 Re-testing Guidance

To reproduce the directory verification:

```bash
npm install
npm run db:init
npm start
```

Then open `http://localhost:3000` in a Chromium-based browser and confirm the 18 records are listed.
Repeat the filter, search, modal and responsive checks at the viewport widths above, and inspect
`GET /api/staff` directly in the browser or with a terminal HTTP client. Reset the sample data at any
time by re-running `npm run db:init`, which is safe to repeat because the seed process is idempotent.

To reproduce the expanded verification, register an administrator through **Sign Up** (the first
account is created this way; there are no default credentials), then exercise the account view, Add
Staff, the Tasks lifecycle and the Dashboard. The harness runs used copies of the database
(`DB_FILE` and `PORT` environment variables) so that the real `data/staff-directory.db` was never
written; any write-capable re-test should adopt the same copy-and-compare discipline described in
Section 6.1.

---

## APPENDIX E — SCREENSHOT / EVIDENCE INDEX

| Figure | File | Description |
|---|---|---|
| 01 | `screenshots/01-main-directory.png` | Main staff directory with all 18 records in the responsive card grid |
| 02 | `screenshots/02-search-results.png` | Free-text search results |
| 03 | `screenshots/03-department-filter.png` | Results filtered by department |
| 04 | `screenshots/04-role-filter.png` | Results filtered by role |
| 05 | `screenshots/05-combined-filters.png` | Search and multiple filters applied together |
| 06 | `screenshots/06-staff-profile-modal.png` | Staff profile modal showing a complete record |
| 07 | `screenshots/07-empty-state.png` | Empty state shown when no records match |
| 08 | *No file — QA evidence only* | Responsive behaviour verified at 375px, 768px and 1440px during final QA (TC-19); no standalone screenshot was retained |
| 09 | `screenshots/09-api-response.png` | Live API response captured from `GET /api/staff` |
| 10 | `screenshots/10-database-structure.png` | Live database structure read from the SQLite file |
| 11 | `screenshots/11-final-application.png` | Final desktop application view |
| 12 | `screenshots/12-er-diagram.png` | Entity–relationship diagram of the database |
| 13 | `screenshots/13-system-architecture.png` | System architecture diagram |
| 14 | `screenshots/14-sign-in-desktop.png` | Sign In screen, desktop |
| 15 | `screenshots/15-sign-in-mobile.png` | Sign In screen, 375px mobile |
| 16 | `screenshots/16-sign-up-desktop.png` | Sign Up screen, desktop |
| 17 | `screenshots/17-account-desktop-signed-in.png` | Account view, signed in, desktop |
| 18 | `screenshots/18-account-mobile-signed-in.png` | Account view, signed in, mobile |
| 19 | `screenshots/19-directory-mobile-signed-in.png` | Directory rendered for a signed-in session, mobile |
| 20 | `screenshots/20-add-staff-desktop.png` | Add Staff screen, desktop |
| 21 | `screenshots/21-add-staff-mobile.png` | Add Staff screen, 375px mobile |
| 22 | `screenshots/22-directory-after-create.png` | Directory immediately after creating a staff member |
| 23 | `screenshots/23-tasks-empty-state.png` | Tasks screen — empty state |
| 24 | `screenshots/24-tasks-list-after-create.png` | Tasks screen — list after creating tasks |
| 25 | `screenshots/25-tasks-after-edit.png` | Tasks screen — after editing a task |
| 26 | `screenshots/26-tasks-after-delete.png` | Tasks screen — after deleting a task |
| 27 | `screenshots/27-tasks-error-state.png` | Tasks screen — error state with retry |
| 28 | `screenshots/28-tasks-mobile-375.png` | Tasks screen, 375px mobile |
| 29 | `screenshots/29-dashboard-desktop.png` | Dashboard, desktop |
| 30 | `screenshots/30-dashboard-mobile-375.png` | Dashboard, 375px mobile |
| 31 | `screenshots/31-dashboard-tablet-768.png` | Dashboard, 768px tablet |
| 32 | `screenshots/32-dashboard-to-directory-filter.png` | Dashboard → Directory with department filter pre-applied |
| 33 | `screenshots/33-dashboard-to-tasks-filter.png` | Dashboard → Tasks with status filter pre-applied |
| 34 | `screenshots/34-dashboard-error-state.png` | Dashboard error state with retry |
| 35 | `screenshots/35-dashboard-empty.png` | Dashboard on a zero-data database (all-zero counts) |

### E.1 Evidence Notes

* 34 PNG evidence files exist in `screenshots/`: Figures 01–07, 09–13, and 14–35. Figure 08 has no
  file.
* Figures 01–07 and 14–35 are browser screenshots. Figures 09 and 10 were generated from live API
  and database readings respectively. Figures 12 and 13 are diagrams.
* Figure 09 was captured from a live response; the response contains **fictional** sample data only.
* Figures 14–35 were captured by the browser harness at the moment its DOM assertion for the shown
  view had passed; each is a valid PNG whose dimensions match the stated viewport width.
* The diagrams in Figures 12 and 13 reflect the implemented schema and architecture. In particular,
  Figure 12 shows `job_title`, `department_id` and `role_id` as nullable, and shows
  `employment_status` as `NOT NULL DEFAULT 'Active'`, matching `src/database/schema.sql` exactly.
* If a standalone responsive screenshot is required for Figure 08 in the submitted document, it must
  be captured at the time of submission. It cannot be reconstructed from the existing evidence.

---

## APPENDIX F — POST-PRODUCTION VERIFICATION

> This appendix was added after the body of the report was written, to record the production
> deployment and the migration of the live database to PostgreSQL. It states only what was actually
> observed. It does **not** alter any result recorded in Chapters Six or Seven, and it does not claim
> that any workflow beyond those listed below has been tested on the live site.

### F.1 Deployment topology

The application is deployed as **two separate Render services**:

| Component | Role |
|---|---|
| Backend  | Express REST API on `/api/*`, connected to a hosted PostgreSQL database (Supabase) |
| Frontend | A static site serving the files in `public/` |

The static frontend reaches the API through an **`/api` rewrite configured in the Render dashboard**.
That rewrite is not defined anywhere in the repository, so its exact form must be confirmed in the
Render dashboard before any change is made. The repository's `render.yaml` Blueprint describes a
single service and does **not** reproduce this two-service topology; it must not be applied or synced
to the live services.

### F.2 Verified checks

The following were verified by **read-only** checks against the live deployment:

| Check | Result |
|---|---|
| `GET /api/health` on the backend | HTTP 200 |
| Backend database engine | PostgreSQL (selected because `DATABASE_URL` is set) |
| Database contents at verification time | 6 departments, 9 roles, 1 administrator account, 18 staff records |
| Transport security | TLS verified against the Supabase CA (`DB_SSL_CA`; certificate verification enabled) |
| Administrator sign-in on the live site | Confirmed working by the project owner |
| `GET /api/staff/:id` | Returns a record carrying an ISO-format `created_at` |

### F.3 Not verified

The following were **not** tested, and no claim is made about them:

* Data persistence across a service restart or redeploy.
* The write workflows on the live site (creating a staff member, and the full task lifecycle).
* The dashboard against the live database.
* Behaviour under concurrent or load conditions, cross-browser and cross-platform compatibility, and
  penetration testing.

### F.4 Follow-up evidence still to be captured

No production screenshots have been captured, and none have been fabricated. If the submitted document
requires them, the following should be captured live: the directory, the sign-in screen, a signed-in
account view, the dashboard, and the database structure read from PostgreSQL — as distinct from
Figure 10, which shows the local SQLite structure.

---

*End of Report*
