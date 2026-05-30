package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UptimeCheckRecord struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	MonitorID  string             `bson:"monitorId" json:"monitorId"`
	ProjectID  int64              `bson:"projectId" json:"projectId"`
	URL        string             `bson:"url" json:"url"`
	Timestamp  time.Time          `bson:"timestamp" json:"timestamp"`
	ResponseMs int64              `bson:"responseMs" json:"responseMs"`
	StatusCode int                `bson:"statusCode" json:"statusCode"`
	Success    bool               `bson:"success" json:"success"`
	Error      string             `bson:"error,omitempty" json:"error,omitempty"`
}