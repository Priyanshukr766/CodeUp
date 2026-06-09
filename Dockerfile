# Use the official Playwright Python image.
# This image contains Python 3, Chromium, and all required Linux dependencies for headless browsers.
FROM mcr.microsoft.com/playwright/python:v1.44.0-jammy

# Set the working directory
WORKDIR /app

# Install Node.js (v20)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy backend package.json and install Node dependencies
COPY server/package*.json ./server/
RUN cd server && npm install

# Copy Python requirements and install
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the server code and the Python scraper script
COPY server/ ./server/
COPY cf_fetcher.py ./

# Expose the port the Express server runs on
EXPOSE 3001

# Start the Express server
WORKDIR /app/server
CMD ["node", "index.js"]
