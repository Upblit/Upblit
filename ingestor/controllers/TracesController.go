package controllers

import (
	"UpblitIngestor/kafka"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"

	"UpblitIngestor/dto"
	"UpblitIngestor/services"
)

func TracesController(c *gin.Context) {
	kafkaadr := os.Getenv("KAFKAADR")
	appID := c.MustGet("application_id").(int64)
	projID := c.MustGet("project_id").(int64)

	// Parse request body
	var telemetry dto.Telemetry
	if err := c.ShouldBindJSON(&telemetry); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request payload",
		})
		return
	}

	// Convert DTO → []TraceDocument
	docs := services.ToTraceDocuments(telemetry, projID, appID)

	// Add prefix to topic name for Kafka
	topicName := "upblit_" + "traces-topic"
	var producer = kafka.NewProducer(kafkaadr, topicName)
	err := producer.SendTraces(docs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to send to kafka",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message":       "traces ingested successfully",
		"applicationId": appID,
		"projectId":     projID,
		"docs":          docs,
	})
}
