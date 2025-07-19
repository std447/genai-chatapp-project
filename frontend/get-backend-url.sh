#!/bin/bash

# This script runs during the Cloudflare Pages build to determine the backend URL.
# It dynamically generates a .env file that Vite will use.

# Default to localhost for local development if CF_PAGES is not set
if [ -z "$CF_PAGES" ]; then
    echo "VITE_API_BASE_URL=http://localhost:8787" > .env
    echo "Running locally, VITE_API_BASE_URL set to localhost."
    exit 0
fi

# --- For Cloudflare Pages Build Environment ---
# CF_PAGES_BRANCH and CF_COMMIT_SHA are environment variables automatically provided by Cloudflare Pages.

WORKER_BASE_NAME="genai-chatapp"
WORKER_DOMAIN="st-d447.workers.dev" # Your specific custom Workers domain part

if [[ "$CF_PAGES_BRANCH" == "main" || "$CF_PAGES_BRANCH" == "master" ]]; then
    # Production build: use the fixed production Worker URL
    API_BASE_URL="https://${WORKER_BASE_NAME}.${WORKER_DOMAIN}"
else
    # Preview build: use the short commit SHA for dynamic preview Worker URL
    # CF_COMMIT_SHA contains the full commit hash. We take the first 8 characters.
    COMMIT_SHORT_SHA="${CF_COMMIT_SHA}"
    API_BASE_URL="https://${COMMIT_SHORT_SHA:0:8}-${WORKER_BASE_NAME}.${WORKER_DOMAIN}"
fi

# Write the determined URL to a .env file in the frontend directory.
# Vite will automatically pick this up during its build process.
echo "VITE_API_BASE_URL=$API_BASE_URL" > .env
echo "Cloudflare Pages build for branch $CF_PAGES_BRANCH: VITE_API_BASE_URL set to $API_BASE_URL."