package domain

type CreateMonitorRequest struct {
	URL            string `json:"url" binding:"required,url"`
	ProjectID      int64  `json:"projectId" binding:"required"`
	ApplicationID  int64  `json:"applicationId"`
	OrganizationID int64  `json:"organizationId"`
	Active         *bool  `json:"active,omitempty"`
}

type CreateCheckRequest struct {
	MonitorID  string `json:"monitorId" binding:"required"`
	Timestamp  string `json:"timestamp"`
	ResponseMs int64  `json:"responseMs"`
	StatusCode int    `json:"statusCode"`
	Success    bool   `json:"success"`
	Error      string `json:"error"`
}