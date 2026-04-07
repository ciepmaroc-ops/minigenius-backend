-- Test activity manifest
INSERT INTO activity_manifests (
  slug,
  title_en,
  title_ar,
  title_fr,
  category,
  target_age_min,
  target_age_max,
  estimated_duration_seconds,
  required_plan,
  is_published,
  version
) VALUES (
  'counting-fruits-v1',
  'Counting Fruits',
  'عد الفواكه',
  'Compter les fruits',
  'math',
  5,
  6,
  180,
  'free',
  TRUE,
  '1.0.0'
);