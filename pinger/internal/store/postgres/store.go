package postgres

import (
	"context"
	"strconv"
	"time"

	"upblitpinger/internal/domain"

	"gorm.io/gorm"
)

type MonitorStore interface {
	EnsureSchema(ctx context.Context) error
	Create(ctx context.Context, req domain.CreateMonitorRequest) (domain.UptimeMonitor, error)
	List(ctx context.Context, projectID string) ([]domain.UptimeMonitor, error)
	GetByID(ctx context.Context, id string) (domain.UptimeMonitor, error)
	UpdateStatus(ctx context.Context, id int64, record domain.UptimeCheckRecord) error
}

type Store struct {
	db        *gorm.DB
	tableName string
}

func New(db *gorm.DB, tableName string) *Store {
	return &Store{db: db, tableName: tableName}
}

func (s *Store) EnsureSchema(ctx context.Context) error {
	if err := s.db.WithContext(ctx).Table(s.tableName).AutoMigrate(&domain.UptimeMonitor{}); err != nil {
		return err
	}
	if err := s.db.WithContext(ctx).Exec("CREATE INDEX IF NOT EXISTS " + s.tableName + "_project_idx ON " + s.tableName + " (project_id, updated_at DESC)").Error; err != nil {
		return err
	}
	if err := s.db.WithContext(ctx).Exec("CREATE INDEX IF NOT EXISTS " + s.tableName + "_status_idx ON " + s.tableName + " (current_status)").Error; err != nil {
		return err
	}
	return nil
}

func (s *Store) Create(ctx context.Context, req domain.CreateMonitorRequest) (domain.UptimeMonitor, error) {
	now := time.Now().UTC()
	monitor := domain.UptimeMonitor{
		URL:            req.URL,
		ProjectID:      req.ProjectID,
		ApplicationID:  req.ApplicationID,
		OrganizationID: req.OrganizationID,
		Active:         true,
		CurrentStatus:  "unknown",
		CreatedAt:      now,
		UpdatedAt:      now,
	}
	if err := s.db.WithContext(ctx).Table(s.tableName).Create(&monitor).Error; err != nil {
		return domain.UptimeMonitor{}, err
	}
	return monitor, nil
}

func (s *Store) List(ctx context.Context, projectID string) ([]domain.UptimeMonitor, error) {
	// only return active monitors for the pinger
	query := s.db.WithContext(ctx).Table(s.tableName).Where("active = ?", true).Order("updated_at DESC")
	if projectID != "" {
		projectIDValue, err := strconv.ParseInt(projectID, 10, 64)
		if err != nil {
			return nil, err
		}
		query = query.Where("project_id = ?", projectIDValue)
	}

	monitors := make([]domain.UptimeMonitor, 0)
	if err := query.Find(&monitors).Error; err != nil {
		return nil, err
	}
	return monitors, nil
}

func (s *Store) GetByID(ctx context.Context, id string) (domain.UptimeMonitor, error) {
	monitorID, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		return domain.UptimeMonitor{}, err
	}

	var monitor domain.UptimeMonitor
	if err := s.db.WithContext(ctx).Table(s.tableName).Where("id = ?", monitorID).First(&monitor).Error; err != nil {
		return domain.UptimeMonitor{}, err
	}
	return monitor, nil
}

func (s *Store) UpdateStatus(ctx context.Context, id int64, record domain.UptimeCheckRecord) error {
	status := "down"
	if record.Success {
		status = "up"
	}
	updates := map[string]any{
		"current_status": status,
		"last_check_at":  record.Timestamp,
		"updated_at":     time.Now().UTC(),
	}
	return s.db.WithContext(ctx).Table(s.tableName).Where("id = ?", id).Updates(updates).Error
}