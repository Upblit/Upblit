package dto

import "time"

type Trace struct {
	Timestamp      time.Time `json:"timestamp" bson:"timestamp"`
	RequestMethod  string    `json:"requestMethod" bson:"requestMethod"`
	RequestURL     string    `json:"requestURL" bson:"requestURL"`
	ResponseStatus int       `json:"responseStatus" bson:"responseStatus"`
	TraceID        string    `json:"traceId" bson:"traceId"`
	SpanID         string    `json:"spanId" bson:"spanId"`
	ParentSpanID   string    `json:"parentSpanId" bson:"parentSpanId"`
	DurationMs     int64     `json:"durationMs" bson:"durationMs"`
}
