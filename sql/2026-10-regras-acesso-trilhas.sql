-- Rodar no D1 Studio (banco updance_db, compartilhado com o blog).
-- 1) corrige o tipo gravado como "intermediario" na regra nivel-intermediario
-- 2) cria a regra de acesso da trilha do Nível Técnico (não duplica se já existir)
-- O efeito aparece em até 5 minutos (cache access:rules no KV).

UPDATE access_rules SET member_type = 'Intermediário'
WHERE resource_key = 'nivel-intermediario' AND member_type = 'intermediario';

INSERT INTO access_rules (resource_key, member_type, created_at)
SELECT 'nivel-tecnico', 'Técnico', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE NOT EXISTS (
  SELECT 1 FROM access_rules WHERE resource_key = 'nivel-tecnico' AND member_type = 'Técnico'
);
