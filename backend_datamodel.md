# Conceptual Data Models for Backend

This document outlines the conceptual data models for the Child Profile and related entities. These models will guide the backend development and database schema design.

## 1. `ChildProfile` Data Model

Represents the profile of a child in the system.

*   `childId`: String (Unique identifier, e.g., UUID) - Primary Key
*   `name`: String (Full name of the child)
*   `uniqueCode`: String (Short, user-friendly unique code for searching, e.g., "ABC123") - Should be unique, indexed for fast lookups.
*   `dateOfBirth`: Date (Optional, but likely useful for context)
*   `createdAt`: Timestamp (Timestamp of when the profile was created)
*   `updatedAt`: Timestamp (Timestamp of the last update to the profile)
*   `feedbackEntries`: Array of `FeedbackEntry` objects (This could be an array of embedded documents in a NoSQL database or a reference to entries in a separate table in a SQL database)

## 2. `FeedbackEntry` Data Model

Represents a single piece of feedback submitted by an intervenant for a child.

*   `entryId`: String (Unique identifier for the feedback, e.g., UUID) - Primary Key
*   `childId`: String (Foreign key referencing `ChildProfile.childId`) - Indexed
*   `intervenantId`: String (Foreign key referencing `UserProfile.userId` of the professional/user who wrote the feedback) - Indexed
*   `intervenantName`: String (Name of the intervenant, denormalized for easy display and historical record even if UserProfile changes)
*   `text`: String (The content of the feedback)
*   `signature`: String (Placeholder for how a digital "signature" is captured or represented. Initially, this might be a combination of `intervenantName` and `timestamp`. Could evolve to a cryptographic signature or a reference to a signature object if required.)
*   `timestamp`: Timestamp (When the feedback was submitted/created)

## 3. `UserProfile` (Intervenant/User) Data Model

Represents a user of the system, such as an educator, therapist, parent, or administrator.

*   `userId`: String (Unique identifier, e.g., UUID) - Primary Key
*   `fullName`: String (Full name of the user)
*   `email`: String (Unique email address, used for login and notifications) - Should be unique, indexed.
*   `role`: String (e.g., "educator", "therapist", "parent", "admin") - Important for authorization and access control.
*   `hashedPassword`: String (Storing hashed passwords, never plain text)
*   `createdAt`: Timestamp (Timestamp of when the user account was created)
*   `updatedAt`: Timestamp (Timestamp of the last update to the user profile)

## 4. Brief Notes on Relationships and Database Choice

*   **`ChildProfile` and `FeedbackEntry` Relationship:**
    *   The `feedbackEntries` field in `ChildProfile` indicates a one-to-many relationship: one `ChildProfile` can have many `FeedbackEntry` records.
    *   **NoSQL (e.g., MongoDB):** `FeedbackEntry` objects could be embedded as an array of sub-documents within the `ChildProfile` document. This is beneficial for read operations where all feedback for a child is often retrieved with the profile. However, considerations must be made for potential document size limits and performance if the number of entries per child becomes very large.
    *   **SQL (e.g., PostgreSQL, MySQL):** `FeedbackEntry` would typically be a separate table with a foreign key column (`childId`) linking back to the `ChildProfile` table. This approach is robust for managing large numbers of entries and complex queries.

*   **`FeedbackEntry` and `UserProfile` Relationship:**
    *   The `intervenantId` field in `FeedbackEntry` is a foreign key that links to the `userId` in the `UserProfile` table/collection. This establishes a many-to-one relationship (many feedback entries can be authored by one user).
    *   The `intervenantName` is denormalized in `FeedbackEntry` to simplify fetching feedback lists without needing to join/lookup the `UserProfile` every time, and to preserve the name as it was at the time of feedback submission.

*   **Database Choice Considerations:**
    *   The choice between NoSQL and SQL should be based on factors like scalability needs, query patterns, data consistency requirements, and team familiarity.
    *   A hybrid approach is also possible, using different database types for different microservices or parts of the application.

*   **Authentication and Authorization:**
    *   User authentication (verifying identity, likely via email/password) is critical.
    *   Authorization (what a logged-in user is allowed to do, based on their `role` and relationship to data) is equally crucial. This will involve checking if an intervenant has the rights to view or add feedback for a specific child. Access control lists (ACLs) or role-based access control (RBAC) mechanisms will need to be implemented.

This conceptual model provides a starting point. Specific details and indexing strategies will be refined during the backend design and implementation phase.
