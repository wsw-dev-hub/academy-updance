-- ================================================================
-- ACESSO DO NÍVEL ESTAGIÁRIO — rodar no D1 Studio (updance_db).
-- Pode ser rodado de novo sem efeito.
--
-- 1) Árvores de Talentos (regra 'arvore_talentos', usada pela API
--    /api/talentos/*): passam a ser EXCLUSIVAS de 'Estagiário(a)'.
--    Remove Assistente, Monitor(a), Premium e Professor(a). O progresso
--    e os planos já salvos por eles continuam no banco; só o acesso cai.
-- 2) Área do Estagiário (recurso 'area-estagio', path /membros/nivel-estagiario/,
--    que agora também cobre /membros/nivel-estagiario/arvore-de-talentos/):
--    inclui 'Estagiário(a)', que hoje não tinha acesso à própria área.
--    A regra 'Premium' existente é mantida.
-- O efeito aparece em até 5 minutos (cache access:rules no KV).
-- ================================================================

DELETE FROM access_rules
 WHERE resource_key = 'arvore_talentos' AND member_type <> 'Estagiário(a)';

INSERT INTO access_rules (resource_key, member_type, created_at)
SELECT 'arvore_talentos', 'Estagiário(a)', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE NOT EXISTS (SELECT 1 FROM access_rules WHERE resource_key = 'arvore_talentos' AND member_type = 'Estagiário(a)');

INSERT INTO access_rules (resource_key, member_type, created_at)
SELECT 'area-estagio', 'Estagiário(a)', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE NOT EXISTS (SELECT 1 FROM access_rules WHERE resource_key = 'area-estagio' AND member_type = 'Estagiário(a)');

-- Conferência (deve listar: area-estagio → Estagiário(a), Premium · arvore_talentos → Estagiário(a))
SELECT resource_key, GROUP_CONCAT(member_type) AS tipos
  FROM access_rules WHERE resource_key IN ('arvore_talentos', 'area-estagio')
 GROUP BY resource_key;
