package upblit

import "time"

type Trace struct {
	Timestamp      string `json:"timestamp"`
	RequestMethod  string `json:"requestMethod"`
	RequestURL     string `json:"requestURL"`
	ResponseStatus int    `json:"responseStatus"`
	TraceID        string `json:"traceId"`
	SpanID         string `json:"spanId"`
	ParentSpanID   *string `json:"parentSpanId"`
	DurationMs     int64  `json:"durationMs"`
}

type LogEntry struct {
	TraceID         *string   `json:"traceId"`
	Level           string    `json:"level"`
	Type            string    `json:"type"`
	Message         string    `json:"message"`
	Timestamp       time.Time `json:"timestamp"`
	ClientTimestamp time.Time `json:"clientTimestamp"`
}
