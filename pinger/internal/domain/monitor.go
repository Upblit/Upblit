package domain

import "time"

type UptimeMonitor struct {
	ID             int64      `json:"id" gorm:"primaryKey;autoIncrement"`
	URL            string     `json:"url" gorm:"column:url;type:text;not null"`
	ProjectID      int64      `json:"projectId" gorm:"column:project_id;not null"`
	ApplicationID  int64      `json:"applicationId" gorm:"column:application_id;not null;default:0"`
	OrganizationID int64      `json:"organizationId" gorm:"column:organization_id;not null;default:0"`
	Active         bool       `json:"active" gorm:"column:active;not null;default:true"`
	CurrentStatus  string     `json:"currentStatus" gorm:"column:current_status;type:text;not null;default:unknown"`
	LastCheckAt    *time.Time `json:"lastCheckAt,omitempty" gorm:"column:last_check_at;type:timestamp with time zone"`
	CreatedAt      time.Time  `json:"createdAt" gorm:"column:created_at;autoCreateTime"`
	UpdatedAt      time.Time  `json:"updatedAt" gorm:"column:updated_at;autoUpdateTime"`
}

func (m UptimeMonitor) CheckStatusFromRecord(record UptimeCheckRecord) UptimeMonitor {
	m.CurrentStatus = "down"
	if record.Success {
		m.CurrentStatus = "up"
	}
	t := record.Timestamp
	m.LastCheckAt = &t
	return m
}