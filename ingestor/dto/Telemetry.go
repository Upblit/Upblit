package dto

import (
	"time"
)

type Telemetry struct {
	Timestamp time.Time `bson:"timestamp" json:"timestamp"`
	Traces    []Trace   `bson:"traces" json:"traces"`
}
