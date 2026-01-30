FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy packages
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN npm install

# Copy source code
COPY backend ./backend
COPY prisma ./prisma

# Generate Prisma Client
WORKDIR /app/backend
RUN npx prisma generate --schema=../prisma/schema.prisma

# Environment variables should be passed at runtime, but port is standard
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
