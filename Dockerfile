# 1. Base Image
# We use the official Microsoft Playwright image based on Ubuntu Jammy (22.04).
# This image contains Python 3.10 and all the Linux system dependencies needed 
# to run headless Chromium without crashing.
FROM mcr.microsoft.com/playwright/python:v1.60.0-jammy

# Set the working directory inside the container
WORKDIR /app

# 2. Install Node.js
# The Playwright image doesn't have Node.js by default, and our Express server needs it.
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 3. Install Python dependencies
# Copy the requirements file and install the playwright python package
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Install Node dependencies for the server
# We copy only package.json first to cache the npm install step
COPY server/package*.json ./server/
RUN cd server && npm install --production

# 5. Copy the rest of the application code
# This copies the server folder and the cf_fetcher.py script
COPY server/ ./server/
COPY cf_fetcher.py .

# 6. Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose the port the app runs on
EXPOSE 3001

# Command to run our Express backend
CMD ["node", "server/index.js"]
