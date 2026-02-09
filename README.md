**Academic Risk Dashboard**

Academic Risk Dashboard is a web-based system designed to help students monitor their academic standing through attendance tracking and assignment deadline management. The dashboard provides clear visual indicators, predictive calculations, and an overall academic health score to help students make informed decisions before issues become critical.

This project is developed as a college academic project and includes preloaded demo data for evaluation purposes.

Overview

The dashboard combines two key academic risk factors:

Attendance safety monitoring

Assignment deadline pressure tracking

It presents all insights in a clean, minimal, and easy-to-understand interface.

**Features**
1. *Attendance Safety Module*

Displays total classes conducted and classes attended per subject

Calculates current attendance percentage

Highlights attendance status using color indicators:

Safe (≥ 80%)

Warning (75–79%)

Critical (< 75%)

Smart Calculations

Calculates how many classes can still be skipped while maintaining attendance ≥ 75%

Calculates how many consecutive classes must be attended to recover if below 75%

Displays a “Safe Skip Counter” for quick insight

Optional simulation to check updated percentage if the next class is missed

2. *Assignment Deadline Pressure Module*

Displays upcoming assignments with subject and due date

Categorizes tasks into:

Overdue

Due Today

Due in 1–3 Days

Upcoming

Includes countdown indicators

Generates a Deadline Pressure Score based on:

Number of pending assignments

Deadline proximity

Workload distribution

3. *Academic Health Score*

The system combines attendance safety and deadline pressure into a single Academic Health Score, providing a clear overall risk level:

Low Risk

Moderate Risk

High Risk

This allows students to quickly understand their current academic position.

Demo Data

The project includes preloaded sample data for:

Subjects with attendance records

Assignments with realistic deadlines

This ensures the dashboard is fully functional during demonstrations without requiring manual input.

Technology Stack

(Add based on what you used)

Example:

Frontend: HTML, CSS, JavaScript

Framework: React (if applicable)

Data Handling: Static JSON / Local State

Styling: CSS / Tailwind / Bootstrap

**How It Works**

In the current demo version:

Attendance and assignment data are stored locally as sample data.

The dashboard calculates attendance percentage and safe skip limits dynamically.

Assignment deadlines are categorized automatically based on the current date.

**Real-World Integration Scope**

In a real college environment, this dashboard can be integrated with:

College ERP systems

Learning Management Systems (LMS) such as Moodle or Google Classroom

Integration can be achieved through:

REST API connections

Secure database access to attendance records

Automatic syncing of assignment deadlines

Future improvements may include:

Student login authentication

Faculty access panel

Automated email or SMS alerts

Real-time attendance updates

**Purpose of the Project**

This project demonstrates:

Predictive academic risk analysis

Practical application of data visualization

Logical attendance computation

Clean and structured user interface design

It is built to showcase how simple data can be transformed into meaningful academic insights.
