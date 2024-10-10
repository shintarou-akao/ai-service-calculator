CREATE TABLE ai_services (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_path VARCHAR(255),
  plan_pricing_url TEXT,
  model_pricing_url TEXT,
  FOREIGN KEY (provider_id) REFERENCES providers(id),
  UNIQUE (provider_id, name)
);
