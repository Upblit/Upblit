package dto

import "time"

type LogBatch struct {
	Timestamp time.Time `bson:"timestamp" json:"timestamp"`
	Log       []Log     `bson:"log" json:"log"`
}
