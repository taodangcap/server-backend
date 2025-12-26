FROM node:18-alpine

WORKDIR /app

# Copy package.json
COPY package.json ./

# Install only production dependencies needed for server
RUN npm install --production express cors dotenv

# Copy application files
COPY server.js ./

# Expose port
EXPOSE 8080

# Set PORT environment variable
ENV PORT=8080

# Start the server
CMD ["node", "server.js"]

