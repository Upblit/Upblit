package main

import (
	"UpblitIngestor/config"
	"UpblitIngestor/controllers"
	"UpblitIngestor/middleware"
	"UpblitIngestor/pubsub"
	"UpblitIngestor/worker"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {

	r := gin.Default()
	r.Use(cors.Default())
	if os.Getenv("MONGO_URI") == "" {
		err := godotenv.Load()
		if err != nil {
			log.Fatal("Error loading .env file")
		}
	}
	log.Println("MONGO_URI =", os.Getenv("MONGO_URI"))
	client := config.ConnectMongo()

	// Select DB + Collection
	db := client.Database("observability")

	metricsCol := db.Collection("metrics")
	traceCol := db.Collection("traces")
	logsCol := db.Collection("logs")
	kafkaadr := os.Getenv("KAFKAADR")
	alertBus, err := pubsub.New(os.Getenv("NATS_URL"))
	if err != nil {
		log.Printf("Warning: could not connect to NATS: %v", err)
		alertBus = nil
	} else {
		defer alertBus.Close()
	}
	alertSubject := os.Getenv("NATS_ALERTS_SUBJECT")
	if alertSubject == "" {
		alertSubject = pubsub.AlertsSubject
	}
	w := worker.NewWorker(
		kafkaadr,

		"upblit_traces-topic", // trace topic
		"upblit_logs-topic",   // log topic

		"upblit_trace-group", // trace consumer group
		"upblit_log-group",   // log consumer group

		metricsCol,
		traceCol,
		logsCol,
		alertBus,
		alertSubject,
	)

	go w.Start()
	r.Use(middleware.APIKeyMiddleware())
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Hello, Gin!",
		})
	})
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})
	r.POST("/ingest/traces", controllers.TracesController)
	r.POST("/ingest/logs", controllers.LogsController)

	err = r.Run(":9000")
	if err != nil {
		log.Fatal(err)
	}
}
