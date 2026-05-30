package app

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"upblitpinger/internal/config"
	"upblitpinger/internal/alerts"
	"upblitpinger/internal/httpapi"
	mongostore "upblitpinger/internal/store/mongo"
	pgstore "upblitpinger/internal/store/postgres"
	wkr "upblitpinger/internal/worker"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Run(ctx context.Context, cfg config.Config) error {
	if err := cfg.Validate(); err != nil {
		return err
	}

	gormDB, err := gorm.Open(postgres.Open(cfg.PostgresURI), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("connect postgres (gorm): %w", err)
	}
	sqlDB, err := gormDB.DB()
	if err != nil {
		return fmt.Errorf("get sql DB from gorm: %w", err)
	}
	// Configure SQL connection pool to avoid exhausting Supabase/pgbouncer pool
	// Supabase pooler often limits session-mode clients to `pool_size` (e.g. 15).
	// Keep MaxOpenConns strictly below that value.
	sqlDB.SetMaxOpenConns(10)
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetConnMaxLifetime(30 * time.Minute)
	defer sqlDB.Close()
	if err := sqlDB.PingContext(ctx); err != nil {
		return fmt.Errorf("ping postgres: %w", err)
	}

	mongoClient, err := mongo.Connect(ctx, options.Client().ApplyURI(cfg.MongoURI))
	if err != nil {
		return fmt.Errorf("connect mongo: %w", err)
	}
	defer func() {
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := mongoClient.Disconnect(shutdownCtx); err != nil {
			log.Printf("disconnect mongo: %v", err)
		}
	}()
	if err := mongoClient.Ping(ctx, nil); err != nil {
		return fmt.Errorf("ping mongo: %w", err)
	}

	monitorStore := pgstore.New(gormDB, cfg.PostgresTable)
	historyStore := mongostore.New(mongoClient.Database(cfg.MongoDBName), cfg.MongoCollection)
	alertPublisher, err := alerts.NewPublisher(cfg.NATSURL, cfg.NATSAlertsSubject)
	if err != nil {
		return fmt.Errorf("connect nats publisher: %w", err)
	}
	defer alertPublisher.Close()

	worker := wkr.New(monitorStore, historyStore, alertPublisher, cfg.NATSAlertsSubject, cfg.AlertResponseMs, 30*time.Second)
	go worker.Run(ctx)

	if err := monitorStore.EnsureSchema(ctx); err != nil {
		return fmt.Errorf("ensure postgres schema: %w", err)
	}
	if err := historyStore.EnsureIndexes(ctx); err != nil {
		return fmt.Errorf("ensure mongo indexes: %w", err)
	}

	router := httpapi.NewRouter()
	server := &http.Server{Addr: cfg.HTTPAddr, Handler: router}

	go func() {
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = server.Shutdown(shutdownCtx)
	}()

	log.Printf("Upblitpinger listening on %s", cfg.HTTPAddr)
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		return fmt.Errorf("serve: %w", err)
	}
	return nil
}
