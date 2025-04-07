# Cluster Estate: Lean Project Documentation

## Overview

This directory contains the enhanced Lean Project Documentation for Cluster Estate, a comprehensive real estate management platform. The documentation system is designed to support efficient development with an AI-optimized approach that provides progressive detail and task-oriented context.

## Project Fundamentals

### Core Information
- **Project Name**: Cluster Estate
- **One-sentence description**: A comprehensive real estate management platform connecting property owners with renters and buyers through an intuitive interface with booking, payment, and administrative capabilities.
- **Primary goal**: Create a full-featured real estate platform that streamlines property management, booking, and user experience.
- **Target completion timeframe**: Ongoing development with Phase 2 currently in progress

### Technology Stack
- **Frontend**: Next.js 13+ (App Router), TypeScript, TailwindCSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL), Next.js API Routes
- **Database**: PostgreSQL (via Supabase)
- **Deployment**: Vercel
- **Key external services**: PayPal for payments, iCal for calendar synchronization

### User Context
- **Primary user persona**: Property renters looking for vacation rentals with specific requirements
- **Key user needs**:
  1. Intuitive property search and filtering
  2. Secure and straightforward booking process
  3. Clear property information with accurate details
  4. Transparent pricing and availability information
  5. Easy management of bookings and communication

## Documentation Structure

This documentation system follows a progressive detail approach, allowing you to start with high-level concepts and drill down to specific implementation details as needed.

### Core Documents

1. **[Phase Master Plan](./phase-master-plan.md)**
   - Overview of all development phases
   - Milestones and tasks for each phase
   - Current status and progress tracking

2. **Phase Micro-PRDs**
   - [Phase 1 Micro-PRD](./phase1-micro-prd.md): Core platform implementation
   - Product vision, user personas, and feature modules
   - Success criteria and acceptance criteria for features

3. **Phase Mini-SRSs**
   - [Phase 1 Mini-SRS](./phase1-mini-srs.md): Technical implementation details
   - System architecture, technical modules, and integration points
   - Data models and API specifications

4. **[Documentation Snippets Library](./documentation-snippets-library.md)**
   - Reusable code patterns and documentation fragments
   - Common validation, error handling, and integration patterns
   - Security considerations and best practices

5. **Progress Trackers**
   - [Phase 1 Progress Tracker](./phase1-progress-tracker.md): Task status and notes
   - Cross-references between tasks, features, and technical modules

### Templates and Guidelines

1. **[Task-Oriented Context Packet Template](./task-oriented-context-packet-template.md)**
   - Template for packaging relevant documentation for implementation
   - Task details, requirements, technical context, and guidelines

2. **[Component Expansion Template](./component-expansion-template.md)**
   - Progressive detail template for component documentation
   - Six levels of detail from conceptual overview to maintenance

3. **[Project Workflow Guidelines](./project-workflow-guidelines.md)**
   - Best practices for using the documentation system
   - Processes for expanding high-level concepts to detailed implementations
   - Strategies for maintaining cross-references and incorporating AI feedback

## Using This Documentation

1. **For New Team Members**:
   - Start with the Phase Master Plan to understand the project structure
   - Review the current phase's Micro-PRD and Mini-SRS
   - Consult the Project Workflow Guidelines for documentation practices

2. **For Implementation Tasks**:
   - Use the Task-Oriented Context Packet Template to gather relevant information
   - Reference the Documentation Snippets Library for common patterns
   - Follow the Component Expansion process for adding implementation details

3. **For Project Planning**:
   - Review the Phase Master Plan and Progress Trackers
   - Consult the Micro-PRDs for feature priorities and requirements
   - Use the Mini-SRSs to understand technical dependencies and challenges

## Documentation Maintenance

This documentation follows the ID convention system for cross-referencing:
- Features: F[Phase#].[Feature#] (e.g., F1.2)
- Technical Modules: TM[Phase#].[Module#] (e.g., TM1.3)
- Tasks: [Phase#].[Milestone#].[Task#] (e.g., 1.2.3)
- Decisions: D[Sequential#] (e.g., D5)
- Components: C[Phase#].[Module#].[Component#] (e.g., C2.1.1)

When updating documentation, ensure that cross-references are maintained and that the appropriate level of detail is provided based on the current development stage.