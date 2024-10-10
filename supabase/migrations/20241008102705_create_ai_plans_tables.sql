CREATE TABLE ai_plans (
  id SERIAL PRIMARY KEY,
  service_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  monthly_price DECIMAL(10, 2) NOT NULL,
  yearly_price DECIMAL(10, 2),
  FOREIGN KEY (service_id) REFERENCES ai_services(id),
  UNIQUE (service_id, name)
);
