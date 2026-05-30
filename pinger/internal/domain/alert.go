package domain

import "time"

type AlertEvent struct {
	ID            string         `json:"id,omitempty" bson:"_id,omitempty"`
	Subject       string         `json:"subject" bson:"subject"`
	Source        string         `json:"source" bson:"source"`
	Kind          string         `json:"kind" bson:"kind"`
	Severity      string         `json:"severity" bson:"severity"`
	Title         string         `json:"title" bson:"title"`
	Message       string         `json:"message" bson:"message"`
	ProjectID     int64          `json:"projectId" bson:"projectId"`
	ApplicationID int64          `json:"applicationId,omitempty" bson:"applicationId,omitempty"`
	MonitorID     int64          `json:"monitorId,omitempty" bson:"monitorId,omitempty"`
	DetectedAt    time.Time      `json:"detectedAt" bson:"detectedAt"`
	CreatedAt     time.Time      `json:"createdAt" bson:"createdAt"`
	Metadata      map[string]any `json:"metadata,omitempty" bson:"metadata,omitempty"`
}