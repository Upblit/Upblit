package models

import (
	"time"
)

type Metrics struct {
	ProjectID     int64     `bson:"projectId" json:"projectId"`
	ApplicationID int64     `bson:"applicationId" json:"applicationId"`
	Timestamp     time.Time `bson:"timestamp" json:"timestamp"` // bucket time

	RequestCount int64   `bson:"requestCount" json:"requestCount"`
	ErrorCount   int64   `bson:"errorCount" json:"errorCount"`
	AvgLatency   float64 `bson:"avgLatency" json:"avgLatency"`
	MaxLatency   int64   `bson:"maxLatency" json:"maxLatency"`
	MinLatency   int64   `bson:"minLatency" json:"minLatency"`
}
