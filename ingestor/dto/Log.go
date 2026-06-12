package dto

import (
	"time"
)

type Log struct {
	TraceID   string    `bson:"trace_id" json:"traceId"`
	Level     string    `bson:"level" json:"level"`
	Type      string    `bson:"type" json:"type"`
	Message   string    `bson:"message" json:"message"`
	Timestamp time.Time `bson:"timestamp" json:"timestamp"`
}
