package models

import "time"

type AlertEvent struct {
	ID            string         `bson:"_id,omitempty" json:"id,omitempty"`
	Subject       string         `bson:"subject" json:"subject"`
	Source        string         `bson:"source" json:"source"`
	Kind          string         `bson:"kind" json:"kind"`
	Severity      string         `bson:"severity" json:"severity"`
	Title         string         `bson:"title" json:"title"`
	Message       string         `bson:"message" json:"message"`
	ProjectID     int64          `bson:"projectId" json:"projectId"`
	ApplicationID int64          `bson:"applicationId,omitempty" json:"applicationId,omitempty"`
	MonitorID     int64          `bson:"monitorId,omitempty" json:"monitorId,omitempty"`
	DetectedAt    time.Time      `bson:"detectedAt" json:"detectedAt"`
	CreatedAt     time.Time      `bson:"createdAt" json:"createdAt"`
	Metadata      map[string]any `bson:"metadata,omitempty" json:"metadata,omitempty"`
}