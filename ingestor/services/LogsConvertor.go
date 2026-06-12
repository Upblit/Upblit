package services

import (
	"UpblitIngestor/dto"
	"UpblitIngestor/models"
	"time"
)

func LogsConvertor(l dto.LogBatch, projectID, applicationID int64) []models.Log {
	serverTime := time.Now().UTC()

	logs := make([]models.Log, 0, len(l.Log))

	for _, lg := range l.Log {
		//TODO:ADD Alert here
		log := models.Log{

			// timestamps
			ClientTimestamp: l.Timestamp,
			ServerTimestamp: serverTime,

			// tenancy
			ProjectID:     projectID,
			ApplicationID: applicationID,

			// trace fields
			Message:   lg.Message,
			Type:      lg.Type,
			Level:     lg.Level,
			TraceID:   lg.TraceID,
			Timestamp: lg.Timestamp,
		}
		logs = append(logs, log)
	}
	return logs
}
