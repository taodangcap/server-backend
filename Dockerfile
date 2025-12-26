FROM node:18-alpine

WORKDIR /app

# Copy package.json
COPY package.json ./

# Install only production dependencies
RUN npm install --production --omit=dev

# Copy application files
COPY server.js ./
COPY config.js ./

# Expose port
EXPOSE 8080

# Set PORT environment variable (Fly.io will override this)
ENV PORT=8080

# Start the server
CMD ["node", "server.js"]

