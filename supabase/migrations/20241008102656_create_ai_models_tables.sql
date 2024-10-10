CREATE TABLE ai_models (
  id SERIAL PRIMARY KEY,
  service_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  input_price DECIMAL(10, 6) NOT NULL,
  output_price DECIMAL(10, 6) NOT NULL,
  context_window INTEGER NOT NULL,
  FOREIGN KEY (service_id) REFERENCES ai_services(id),
  UNIQUE (service_id, name)
);
