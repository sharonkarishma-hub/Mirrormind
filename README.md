# MirrorMind — AI Journal Coach

MirrorMind is an interactive journaling and reflection web application. It is designed to help you write about your day, identify meaningful themes, reflect on them, and take small, practical next steps.

## Features

- **Daily Reflection Space**: Write freely about your day — the good, the difficult, the confusing, or anything that stayed with you.
- **Reflection Map**: Automatically analyzes your entry and visualizes the key themes of your day.
- **Interactive Exploration**: Dive deeper into specific themes with guided questions.
- **Actionable Insights**: Summarizes what you've learned and suggests a single, practical next step.
- **History Log**: Keeps a secure local log of your past reflections in your browser.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Radix UI primitives.
- **Routing & State**: TanStack Router, TanStack Query.
- **Build Tool**: Vite.

## Getting Started

### Prerequisites

- Node.js (version 20 or higher)
- npm (installed with Node)

### Installation

1. Clone or download the repository to your local machine.
2. Open your terminal in the project directory.
3. Install the dependencies:
   ```bash
   npm install
   ```

### Development

To start the development server locally:
```bash
npm run dev
```
Open [http://localhost:8080](http://localhost:8080) in your browser to view the application.

### Build and Deployment

To generate a static build of the application:
```bash
npm run build
```
The static production assets will be generated in the `.output/public` directory, which can be deployed to any static hosting provider (like GitHub Pages, Netlify, or Vercel).
