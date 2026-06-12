# ----------- BUILD STAGE -----------
FROM golang:1.25-alpine AS builder

# Install git (needed for go mod)
RUN apk add --no-cache git

WORKDIR /app

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Ensure go.sum is populated for any indirect imports
RUN go mod tidy

# Build binary (static)
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o app .

# ----------- RUN STAGE -----------
FROM alpine:latest

WORKDIR /root/

# Add CA certificates (important for HTTPS, Mongo, etc.)
RUN apk add --no-cache ca-certificates

# Copy binary from builder
COPY --from=builder /app/app .

# Copy .env if needed (optional)
# COPY .env .

EXPOSE 9000

CMD ["./app"]