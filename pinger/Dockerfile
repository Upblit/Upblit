FROM golang:1.25-alpine AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# ensure go.sum entries for any indirect imports referenced in code
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /bin/pinger ./

FROM alpine:3.18
RUN apk add --no-cache ca-certificates
COPY --from=builder /bin/pinger /bin/pinger
EXPOSE 8082
ENTRYPOINT ["/bin/pinger"]
