INSERT INTO providers (name) VALUES
('OpenAI'),
('Anthropic'),
('Google'),
('Perplexity AI'),
('Anysphere');

INSERT INTO ai_services (provider_id, name, description, logo_path, plan_pricing_url, model_pricing_url) VALUES
(1, 'ChatGPT', 'OpenAIが開発した対話型AIチャットサービスで、自然な会話を通じて情報提供やクリエイティブな作業を支援', '/images/logos/chatgpt.png', 'https://openai.com/chatgpt/pricing/', 'https://openai.com/api/pricing/'),
(2, 'Claude', 'Anthropicが開発した生成AIモデルで、自然言語処理に優れ、長文処理やクリエイティブな文章生成に特化', '/images/logos/claude.png', 'https://www.anthropic.com/pricing#claude-ai-plans', 'https://www.anthropic.com/pricing#anthropic-api'),
(3, 'Gemini', 'Googleが開発したマルチモーダル生成AIモデルで、テキスト、画像、音声を同時に処理し、高精度な情報検索や生成を行うことが可能', '/images/logos/gemini.png', 'https://gemini.google/advanced/', 'https://ai.google.dev/pricing'),
(4, 'Perplexity', 'Perplexity AIが開発した対話型AIサービスで、最新の情報検索と生成AIを組み合わせて、正確で最新の回答を提供', '/images/logos/perplexity.png', 'https://www.perplexity.ai/pro', 'https://docs.perplexity.ai/guides/pricing'),
(5, 'Cursor', 'AIを活用したコーディング支援ツールで、コード生成、バグ修正、リファクタリングなどの機能を提供', '/images/logos/cursor.png', 'https://cursor.sh/pricing', '');

INSERT INTO ai_models (service_id, name, input_price, output_price, context_window) VALUES
(1, 'gpt-4o', 2.5, 10, 128000),
(1, 'gpt-4o-2024-08-06', 2.5, 10, 128000),
(1, 'gpt-4o-2024-05-13', 5, 15, 128000),
(1, 'gpt-4o-mini', 0.15, 0.6, 128000),
(1, 'gpt-4o-mini-2024-07-18', 0.15, 0.6, 128000),
(2, 'Claude 3.5 Sonnet', 3, 15, 200000),
(2, 'Claude 3 Opus', 15, 75, 200000),
(2, 'Claude 3 Haiku', 0.25, 1.25, 200000),
(3, 'Gemini 1.5 Flash', 0.075, 0.3, 1000000),
(3, 'Gemini 1.5 Pro', 3.5, 10.5, 2000000),
(4, 'llama-3.1-sonar-small-128k-online', 0.2, 0.2, 128000),
(4, 'llama-3.1-sonar-large-128k-online', 1, 1, 128000),
(4, 'llama-3.1-sonar-huge-128k-online', 5, 5, 128000),
(4, 'llama-3.1-sonar-small-128k-chat', 0.2, 0.2, 128000),
(4, 'llama-3.1-sonar-large-128k-chat', 1, 1, 128000),
(4, 'llama-3.1-8b-instruct', 0.2, 0.2, 128000),
(4, 'llama-3.1-70b-instruct', 1, 1, 128000);

INSERT INTO ai_plans (service_id, name, monthly_price, yearly_price) VALUES
(1, 'Plus', 20, null),
(1, 'Team', 30, 300),
(2, 'Pro', 20, null),
(2, 'Team', 30, 300),
(3, 'Advanced', 19.99, null),
(4, 'Professional', 20, 200),
(5, 'Pro', 20, 192),
(5, 'Business', 40, 384);
