package models

import (
	"time"
)

type Trace struct {
	ClientTimestamp time.Time `json:"clientTimestamp" bson:"clientTimestamp"`
	ServerTimestamp time.Time `json:"serverTimestamp" bson:"serverTimestamp"`

	ProjectID     int64 `json:"projectId" bson:"projectId"`
	ApplicationID int64 `json:"applicationId" bson:"applicationId"`

	RequestMethod  string            `json:"requestMethod" bson:"requestMethod"`
	RequestURL     string            `json:"requestURL" bson:"requestURL"`
	ResponseStatus int               `json:"responseStatus" bson:"responseStatus"`
	TraceID        string            `json:"traceId" bson:"traceId"`
	SpanType       string            `json:"spanType" bson:"spanType"`
	SpanID         string            `json:"spanId" bson:"spanId"`
	ParentSpanID   string            `json:"parentSpanId" bson:"parentSpanId"`
	DurationMs     int64             `json:"durationMs" bson:"durationMs"`
	Timestamp      time.Time         `json:"timestamp" bson:"timestamp"`
	Meta           map[string]string `bson:"meta" json:"meta"`
}
