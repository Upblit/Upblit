package services

import (
	"time"

	"UpblitIngestor/dto"
	"UpblitIngestor/models"
)

func ToTraceDocuments(t dto.Telemetry, projectID, applicationID int64) []models.Trace {
	serverTime := time.Now().UTC()

	docs := make([]models.Trace, 0, len(t.Traces))

	for _, tr := range t.Traces {
		doc := models.Trace{

			// timestamps
			ClientTimestamp: t.Timestamp,
			ServerTimestamp: serverTime,

			// tenancy
			ProjectID:     projectID,
			ApplicationID: applicationID,

			// trace fields
			RequestMethod:  tr.RequestMethod,
			RequestURL:     tr.RequestURL,
			ResponseStatus: tr.ResponseStatus,
			TraceID:        tr.TraceID,
			SpanID:         tr.SpanID,
			ParentSpanID:   tr.ParentSpanID,
			DurationMs:     tr.DurationMs,
			Timestamp:      tr.Timestamp,
		}

		docs = append(docs, doc)
	}

	return docs
}
