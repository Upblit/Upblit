package controllers

import (
	"UpblitIngestor/dto"
	"UpblitIngestor/kafka"
	"UpblitIngestor/services"
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func LogsController(c *gin.Context) {
	kafkaadr := os.Getenv("KAFKAADR")
	appID := c.MustGet("application_id").(int64)
	projID := c.MustGet("project_id").(int64)

	var logbatch dto.LogBatch
	if err := c.ShouldBindJSON(&logbatch); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request payload",
		})
		return
	}
	logs := services.LogsConvertor(logbatch, projID, appID)

	// Add prefix to topic name for Kafka
	topicName := "upblit_" + "logs-topic"
	var producer = kafka.NewProducer(kafkaadr, topicName)
	err := producer.SendLogs(logs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to send to kafka",
		})
		return
	}
	fmt.Println(logs)
	c.JSON(http.StatusOK, gin.H{
		"message":       "logs ingested successfully",
		"applicationId": appID,
		"projectId":     projID,
		"logs":          logs,
	})
}
