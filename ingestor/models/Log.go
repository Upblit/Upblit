package models

import "time"

type Log struct {
	ClientTimestamp time.Time `json:"clientTimestamp" bson:"clientTimestamp"`
	ServerTimestamp time.Time `json:"serverTimestamp" bson:"serverTimestamp"`

	ProjectID     int64 `json:"projectId" bson:"projectId"`
	ApplicationID int64 `json:"applicationId" bson:"applicationId"`

	TraceID   string    `bson:"trace_id" json:"traceId"`
	Level     string    `bson:"level" json:"level"`
	Type      string    `bson:"type" json:"type"`
	Message   string    `bson:"message" json:"message"`
	Timestamp time.Time `bson:"timestamp" json:"timestamp"`
}
