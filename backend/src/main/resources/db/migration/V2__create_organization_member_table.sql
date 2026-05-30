-- Flyway migration: create organization_member table
CREATE TABLE IF NOT EXISTS organization_member (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  organization_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  role VARCHAR(32) NOT NULL,
  CONSTRAINT fk_org_member_org FOREIGN KEY (organization_id) REFERENCES organization(id) ON DELETE CASCADE,
  CONSTRAINT fk_org_member_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
