UPDATE access_rules SET member_type = 'Intermediário'
WHERE resource_key = 'nivel-intermediario' AND member_type = 'intermediario';
INSERT INTO access_rules (resource_key, member_type, created_at)
VALUES ('nivel-tecnico', 'Técnico', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
