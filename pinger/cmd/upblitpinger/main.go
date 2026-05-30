package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"upblitpinger/internal/app"
	"upblitpinger/internal/config"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Printf(".env not loaded: %v", err)
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	if err := app.Run(ctx, config.LoadFromEnv()); err != nil {
		log.Fatalf("upblitpinger: %v", err)
	}
}