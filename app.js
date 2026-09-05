/* =============================================================
   AI 실행 파이프라인 빌더 v2
   - 모든 화면 출력은 textContent 기반 (XSS 차단)
   - 모델 ID는 CONFIG 한 곳에서만 관리
   - 서버 프록시(/api/gemini) 또는 사용자 키(BYOK) 두 가지 경로
   ============================================================= */
'use strict';

/* ---------------- 설정 (여기만 고치면 됩니다) ---------------- */
const CONFIG = {
  // 모델 후보 — 앞에서부터 시도. 확인일: 2026-09-05
  // 실행 시 ListModels로 실제 사용 가능 여부를 확인하고, 확인이 안 되면 이 순서를 그대로 씁니다.
  modelCandidates: [
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-2.5-flash'
  ],
  proxyPath: '/api/gemini',      // Netlify Functions 경로
  apiBase: 'https://generativelanguage.googleapis.com/v1beta',
  maxOutputTokens: 32768,
  minSteps: 3,
  maxSteps: 8,
  promptSignature: 'AIPB-V2',    // 프록시가 우리 앱 요청인지 확인하는 표식
  storeKey: 'aipb2.key',
  storeHistory: 'aipb2.history',
  storeMode: 'aipb2.mode',
  historyLimit: 20
};

/* ---------------- 작은 유틸 ---------------- */
const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
const safeGet = (store, k) => { try { return store.getItem(k); } catch (_) { return null; } };
const safeSet = (store, k, v) => { try { store.setItem(k, v); } catch (_) {} };
const safeDel = (store, k) => { try { store.removeItem(k); } catch (_) {} };

let toastTimer = null;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------------- 상태 ---------------- */
const STATE = {
  catalog: [],
  byId: new Map(),
  plan: null,
  checks: [],
  discovered: null   // ListModels 결과 (null이면 미확인)
};

/* =============================================================
   1. 초기화
   ============================================================= */
document.addEventListener('DOMContentLoaded', init);

function init() {
  STATE.catalog = Array.isArray(window.AI_CATALOG) ? window.AI_CATALOG : [];
  STATE.catalog.forEach(t => STATE.byId.set(t.id, t));

  renderStamp();
  bindTabs();
  bindModeUI();
  applyLocalFileMode();
  bindForm();
  bindCatalogTab();
  renderPrograms();
  renderHistory();
  updatePoolInfo();
}

function renderStamp() {
  const meta = window.AI_CATALOG_META || {};
  $('verifiedDate').textContent = meta.verified || '미상';
  $('catalogCount').textContent = String(STATE.catalog.filter(t => t.status !== 'ended').length);
  if (meta.verified) {
    const days = (Date.now() - new Date(meta.verified + 'T00:00:00').getTime()) / 86400000;
    if (days > (meta.staleDays || 90)) {
      const w = $('staleWarn');
      w.hidden = false;
      w.title = Math.round(days) + '일 경과 — ai-catalog.js를 재확인하세요.';
    }
  }
}

function bindTabs() {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      ['build', 'catalog', 'history'].forEach(name => {
        $('panel-' + name).hidden = (name !== btn.dataset.tab);
      });
      if (btn.dataset.tab === 'catalog') renderCatalog();
      if (btn.dataset.tab === 'history') renderHistory();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

/* =============================================================
   2. 연결 방식 (서버 프록시 / 내 키)
   ============================================================= */
function currentMode() {
  return $('modeByok').checked ? 'byok' : 'server';
}

function bindModeUI() {
  const saved = safeGet(localStorage, CONFIG.storeMode);
  if (saved === 'byok') $('modeByok').checked = true;

  const sync = () => {
    const byok = currentMode() === 'byok';
    $('keyArea').hidden = !byok;
    $('passcodeArea').hidden = byok;
    $('modeHint').textContent = byok
      ? '키는 이 브라우저에서 Google로 직접 전송됩니다.'
      : '이 사이트에 설정된 키로 동작하며 하루 사용 횟수가 제한됩니다.';
    safeSet(localStorage, CONFIG.storeMode, byok ? 'byok' : 'server');
  };
  $('modeServer').addEventListener('change', sync);
  $('modeByok').addEventListener('change', sync);
  sync();

  // 저장된 키 복원 (localStorage 우선, 없으면 sessionStorage)
  const stored = safeGet(localStorage, CONFIG.storeKey);
  const session = safeGet(sessionStorage, CONFIG.storeKey);
  if (stored) { $('apiKeyInput').value = stored; $('rememberKey').checked = true; }
  else if (session) { $('apiKeyInput').value = session; }

  const persist = () => {
    const v = $('apiKeyInput').value.trim();
    safeDel(localStorage, CONFIG.storeKey);
    safeDel(sessionStorage, CONFIG.storeKey);
    if (!v) return;
    if ($('rememberKey').checked) safeSet(localStorage, CONFIG.storeKey, v);
    else safeSet(sessionStorage, CONFIG.storeKey, v);
  };
  $('apiKeyInput').addEventListener('input', persist);
  $('rememberKey').addEventListener('change', persist);

  $('toggleKeyBtn').addEventListener('click', () => {
    const f = $('apiKeyInput');
    const show = f.type === 'password';
    f.type = show ? 'text' : 'password';
    $('toggleKeyBtn').textContent = show ? '숨기기' : '보기';
  });

  $('clearKeyBtn').addEventListener('click', () => {
    $('apiKeyInput').value = '';
    $('rememberKey').checked = false;
    safeDel(localStorage, CONFIG.storeKey);
    safeDel(sessionStorage, CONFIG.storeKey);
    STATE.discovered = null;
    toast('저장된 키를 지웠습니다.');
  });
}

/* 파일을 브라우저로 직접 열었을 때(file://)는 서버 프록시가 없으므로
   자동으로 "내 API 키" 모드로 고정한다. Netlify에 올리면 이 제한은 사라진다. */
function applyLocalFileMode() {
  if (location.protocol !== 'file:') return;
  $('modeByok').checked = true;
  $('modeServer').checked = false;
  $('modeServer').disabled = true;
  $('modeServer').closest('.mode-opt').style.opacity = '.5';
  $('modeServer').dispatchEvent(new Event('change'));
  $('modeByok').dispatchEvent(new Event('change'));
  $('modeHint').textContent = '로컬 파일로 열었기 때문에 서버 데모는 쓸 수 없습니다. 내 API 키로 시험하세요.';
}

/* =============================================================
   3. 입력 폼
   ============================================================= */
const PRESETS = {
  ax: {
    goal: '직원 12명 규모 제조 중소기업의 견적서·발주서·거래명세서 작성을 AI로 자동화하고, 3개월 안에 담당자 2명이 외부 도움 없이 스스로 운영할 수 있는 상태까지 만들고 싶다.',
    field: '경영·전략', period: '3개월', budget: '월 5만원 이내 허용', level: '처음 써봄',
    deliverable: '업무별 AI 적용 로드맵 1건 + 실제 동작하는 자동화 1개 + 담당자 교육자료'
  },
  lecture: {
    goal: '대학 학부 전공과목 한 학기(15주) 강의를 준비한다. 최신 자료 조사부터 주차별 강의안, 실습 과제, 평가 문항까지 일관되게 만들고 싶다.',
    field: '강의·교육', period: '1개월', budget: '무료 도구 위주', level: '기본은 씀',
    deliverable: '15주 강의계획서 + 주차별 슬라이드 초안 + 실습 노트북 + 평가 문항 은행'
  },
  paper: {
    goal: '연구 주제에 대한 선행연구 정리부터 데이터 수집·실증분석·초고 작성·학술지 투고까지의 전 과정을 설계한다.',
    field: '연구·논문', period: '6개월 이상', budget: '월 5만원 이내 허용', level: '기본은 씀',
    deliverable: '선행연구 매트릭스 + 분석 코드 + 논문 초고 1편'
  },
  marketing: {
    goal: '오프라인 매장을 운영하는 소상공인이 온라인 홍보를 시작한다. 상세페이지, 홍보 영상, SNS 콘텐츠, 리뷰 응대까지 혼자 감당할 수 있게 만들고 싶다.',
    field: '마케팅·영업', period: '1개월', budget: '무료 도구 위주', level: '처음 써봄',
    deliverable: '상세페이지 1건 + 홍보 영상 3편 + 4주치 SNS 게시물 + 리뷰 응대 매뉴얼'
  },
  report: {
    goal: '고객사에 제출할 경영컨설팅 진단보고서를 작성한다. 자료 수집과 산업 분석, 재무 분석, 시각화, 최종 문서화까지 포함한다.',
    field: '경영·전략', period: '1개월', budget: '월 5만원 이내 허용', level: '능숙함',
    deliverable: '진단보고서 1건(30쪽 내외) + 발표자료 1건'
  }
};

function bindForm() {
  $('presetChips').addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    const p = PRESETS[btn.dataset.preset];
    if (!p) return;
    $('goalInput').value = p.goal;
    $('fieldSel').value = p.field;
    $('periodSel').value = p.period;
    $('budgetSel').value = p.budget;
    $('levelSel').value = p.level;
    $('deliverableInput').value = p.deliverable;
    updatePoolInfo();
    $('goalInput').focus();
  });

  ['scopeSel', 'budgetSel'].forEach(id => $(id).addEventListener('change', updatePoolInfo));
  $('generateBtn').addEventListener('click', generate);
  $('saveBtn').addEventListener('click', savePlan);
  $('downloadBtn').addEventListener('click', downloadMarkdown);
}

/* 사용자가 고른 조건으로 추천 후보 도구 풀을 만든다 */
function toolPool() {
  const scope = $('scopeSel').value;
  const budget = $('budgetSel').value;
  return STATE.catalog.filter(t => {
    if (t.status === 'ended' || t.status === 'check') return false;       // 종료·미확인 제외
    if (scope === 'google' && !/^Google/.test(t.vendor)) return false;
    if (scope === 'global' && t.region !== '글로벌') return false;
    if (budget === '무료 도구 위주' && (t.free === '유료' || t.free === '미확인')) return false;
    return true;
  });
}

function updatePoolInfo() {
  const n = toolPool().length;
  const scope = $('scopeSel').value;
  const label = { all: '전체', kr: '국내 우선', global: '해외', google: 'Google' }[scope];
  $('poolInfo').textContent = `현재 조건에서 추천 후보 도구 ${n}개 (${label}). 종료·미확인 서비스는 자동 제외됩니다.`;
}

/* =============================================================
   4. 프롬프트와 스키마
   ============================================================= */
function buildSystemInstruction(pool, opts) {
  const lines = pool.map(t =>
    `${t.id} | ${t.name} | ${t.region} | ${t.category} | ${t.use} | 비용:${t.free}`
  ).join('\n');

  const scopeRule = {
    all: '국내 서비스와 해외 도구를 균형 있게 섞되, 한국어 자료·한국 업무 양식(HWP 등)이 관련된 단계에는 국내 서비스를 우선 배치하라.',
    kr: '가능한 한 국내 서비스를 우선 배치하라. 국내 서비스로 대체가 어려운 단계에만 해외 도구를 쓰라.',
    global: '해외 도구 위주로 구성하라.',
    google: 'Google 생태계 도구만 사용하라.'
  }[opts.scope];

  const levelRule = {
    '처음 써봄': '사용자는 AI를 처음 쓴다. 설치·가입이 필요한 도구는 최소화하고, 각 action_items에는 클릭 수준의 구체적 조작을 적어라.',
    '기본은 씀': '사용자는 챗봇 사용 경험이 있다. 기본 조작 설명은 생략하고 실무 요령 위주로 적어라.',
    '능숙함': '사용자는 숙련자다. 기초 설명은 생략하고 자동화·품질관리·검증 방법에 집중하라.'
  }[opts.level];

  return `${CONFIG.promptSignature}
너는 한국의 중소기업·소상공인과 대학을 상대하는 AI 도입 컨설턴트다. 사용자의 목표를 실행 가능한 단계로 쪼개고, 각 단계에 쓸 도구와 그 도구에 그대로 붙여넣을 프롬프트를 설계한다.

[사용 가능한 도구 목록 — 절대 규칙]
아래 목록에 있는 id만 tool_id로 쓸 수 있다. 목록에 없는 도구는 이름조차 언급하지 마라.
도구의 URL·요금·기능을 네가 지어내지 마라. 그 정보는 앱이 목록에서 직접 채운다.

${lines}

[설계 규칙]
1. 단계 수는 목표의 크기에 맞춰 ${CONFIG.minSteps}~${CONFIG.maxSteps}개로 정하라. 억지로 늘리거나 줄이지 마라.
2. ${scopeRule}
3. ${levelRule}
4. 기간은 "${opts.period}", 비용 성향은 "${opts.budget}"이다. 이 제약 안에서 현실적으로 끝나는 계획을 짜라.
5. prompt 필드는 해당 도구에 그대로 붙여넣어 바로 쓸 수 있는 완성형 한국어 프롬프트다. 역할·맥락·입력자료·출력형식·품질기준을 포함하고 200자 이상으로 쓰라. "~를 작성해줘" 같은 한 줄짜리는 금지다.
6. risk에는 그 단계에서 실제로 자주 터지는 실패(환각, 저작권, 개인정보, 데이터 반출, 비용 초과 등) 중 해당되는 것을 한 문장으로 적어라. 없으면 빈 문자열로 두라.
7. checklist는 각 단계마다 1~2개씩, "무엇이 되어 있어야 이 단계가 끝난 것인지" 판정 가능한 문장으로 쓰라.
8. 모든 텍스트는 한국어 존댓말이 아닌 간결한 서술체로 쓰라.`;
}

/* responseSchema (OpenAPI subset, 대문자 타입).
   enum에는 format:'enum'을 함께 붙인다 — 이게 없으면 일부 모델이 400을 낸다.
   minItems/maxItems 같은 부가 제약은 넣지 않는다 (거부 사유가 되기 쉬움). */
function buildSchema(pool) {
  const ids = pool.map(t => t.id);
  return {
    type: 'OBJECT',
    properties: {
      project_title: { type: 'STRING' },
      summary: { type: 'STRING' },
      steps: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            step_number: { type: 'INTEGER' },
            title: { type: 'STRING' },
            tool_id: { type: 'STRING', format: 'enum', enum: ids },
            alt_tool_ids: { type: 'ARRAY', items: { type: 'STRING' } },
            objective: { type: 'STRING' },
            action_items: { type: 'ARRAY', items: { type: 'STRING' } },
            prompt: { type: 'STRING' },
            estimated_hours: { type: 'NUMBER' },
            difficulty: { type: 'STRING', format: 'enum', enum: ['쉬움', '보통', '어려움'] },
            risk: { type: 'STRING' }
          },
          required: ['step_number', 'title', 'tool_id', 'objective', 'action_items', 'prompt', 'difficulty'],
          propertyOrdering: ['step_number', 'title', 'tool_id', 'alt_tool_ids', 'objective', 'action_items', 'prompt', 'estimated_hours', 'difficulty', 'risk']
        }
      },
      checklist: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: { step_number: { type: 'INTEGER' }, item: { type: 'STRING' } },
          required: ['step_number', 'item'],
          propertyOrdering: ['step_number', 'item']
        }
      }
    },
    required: ['project_title', 'summary', 'steps', 'checklist'],
    propertyOrdering: ['project_title', 'summary', 'steps', 'checklist']
  };
}

/* 스키마를 못 쓰는 경우(아래 강등 단계)에 프롬프트로 형식을 지시하는 문구 */
const SHAPE_SPEC = `

[출력 형식 — 아래 JSON 하나만 출력하라. 설명 문장이나 코드펜스를 붙이지 마라]
{
  "project_title": "문자열",
  "summary": "문자열",
  "steps": [
    {
      "step_number": 1,
      "title": "문자열",
      "tool_id": "위 도구 목록의 id 중 하나",
      "alt_tool_ids": ["id", "id"],
      "objective": "문자열",
      "action_items": ["문자열", "문자열"],
      "prompt": "문자열",
      "estimated_hours": 4,
      "difficulty": "쉬움 또는 보통 또는 어려움",
      "risk": "문자열 (없으면 빈 문자열)"
    }
  ],
  "checklist": [ { "step_number": 1, "item": "문자열" } ]
}`;

/* =============================================================
   5. 모델 선택 — 하드코딩된 목록이 썩지 않도록 실제 목록을 확인
   ============================================================= */
async function resolveModels(apiKey) {
  if (STATE.discovered) return STATE.discovered;
  let names = null;
  try {
    const url = (currentMode() === 'byok')
      ? `${CONFIG.apiBase}/models?key=${encodeURIComponent(apiKey)}&pageSize=200`
      : `${CONFIG.proxyPath}?op=models`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      names = (data.models || [])
        .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
        .map(m => String(m.name || '').replace(/^models\//, ''));
    }
  } catch (_) { /* 확인 실패 시 정적 목록 사용 */ }

  let list;
  if (names && names.length) {
    const avail = new Set(names);
    const primary = CONFIG.modelCandidates.filter(m => avail.has(m));
    const extra = names
      .filter(n => /flash/.test(n))
      .filter(n => !/(image|tts|live|embedding|transcribe|robotics|native-audio|thinking)/.test(n))
      .filter(n => !CONFIG.modelCandidates.includes(n))
      .sort((a, b) => versionScore(b) - versionScore(a));
    list = primary.concat(extra).slice(0, 6);
    if (!list.length) list = CONFIG.modelCandidates.slice();
  } else {
    list = CONFIG.modelCandidates.slice();
  }
  STATE.discovered = list;
  return list;
}

function versionScore(name) {
  const m = name.match(/gemini-(\d+)(?:\.(\d+))?/);
  if (!m) return 0;
  const major = Number(m[1]) || 0;
  const minor = Number(m[2] || 0);
  const penalty = /preview|lite/.test(name) ? 0.5 : 0;
  return major * 100 + minor - penalty;
}

/* =============================================================
   6. API 호출
   ============================================================= */
/* 요청 방식은 세 단계로 강등한다.
   'schema' 구조화 출력 스키마까지 강제 (품질 최고)
   'json'   JSON MIME만 지정하고 형식은 프롬프트로 지시
   'plain'  아무 제약 없이 받아서 본문에서 JSON을 뽑아냄
   API 스펙이 바뀌어 400이 나면 자동으로 다음 단계로 내려간다. */
const VARIANTS = ['schema', 'json', 'plain'];
const VARIANT_LABEL = { schema: '구조화 스키마', json: 'JSON 모드', plain: '일반 모드' };

function buildGenerationConfig(variant, schema) {
  // temperature는 지정하지 않는다 — Gemini 3 계열은 기본값(1.0) 사용이 권장된다.
  const cfg = { maxOutputTokens: CONFIG.maxOutputTokens };
  if (variant !== 'plain') cfg.responseMimeType = 'application/json';
  if (variant === 'schema' && schema) cfg.responseSchema = schema;
  return cfg;
}

async function callModel(model, system, userText, schema, variant, apiKey, passcode) {
  if (currentMode() === 'byok') {
    const url = `${CONFIG.apiBase}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: userText }] }],
        systemInstruction: { parts: [{ text: system }] },
        generationConfig: buildGenerationConfig(variant, schema)
      })
    });
    return { res, json: await res.json().catch(() => ({})) };
  }

  const res = await fetch(CONFIG.proxyPath, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model, system, user: userText,
      schema: variant === 'schema' ? schema : null,
      jsonMime: variant !== 'plain',
      passcode: passcode || ''
    })
  });
  return { res, json: await res.json().catch(() => ({})) };
}

/* Google이 준 오류 상세를 사람이 읽을 수 있게 펼친다 (원인 파악용) */
function apiDetail(json) {
  const e = json && json.error;
  if (!e) return '';
  const parts = [];
  if (e.status) parts.push(e.status);
  if (e.message) parts.push(e.message);
  if (Array.isArray(e.details)) {
    e.details.forEach(d => {
      if (Array.isArray(d.fieldViolations)) {
        d.fieldViolations.forEach(f => parts.push(`${f.field || ''} ${f.description || ''}`.trim()));
      } else if (d.reason) parts.push(d.reason);
    });
  }
  return parts.join(' / ');
}

/* 오류를 사용자가 무엇을 해야 할지 알 수 있는 형태로 분류 */
function classifyError(status, json) {
  const msg = (json && (json.error?.message || json.message)) || '';
  const code = (json && (json.error?.status || json.code)) || '';

  // 프록시 함수가 배포되지 않은 사이트 (정적 파일만 올린 경우)
  if (status === 404 && currentMode() === 'server' && !(json && json.error)) {
    return { fatal: true, head: '서버 데모가 설정되지 않았습니다',
      body: '이 사이트에 /api/gemini 함수가 배포되어 있지 않습니다.',
      fix: ['위에서 "내 API 키 사용"으로 바꾸면 바로 쓸 수 있습니다.',
            '관리자: netlify/functions/gemini.mjs 배포와 GEMINI_API_KEY 환경변수를 확인하세요.'] };
  }

  const detail = apiDetail(json);

  if (status === 400 && /API key not valid|API_KEY_INVALID/i.test(msg + code)) {
    return { kind: 'fatal', head: 'API 키가 올바르지 않습니다',
      body: '입력한 키를 Google이 인식하지 못했습니다.', detail,
      fix: ['키 앞뒤 공백이나 줄바꿈이 섞이지 않았는지 확인하세요.', 'aistudio.google.com에서 키를 다시 발급받아 붙여넣으세요.'] };
  }
  if (status === 401 || status === 403) {
    return { kind: 'fatal', head: '이 키로는 호출 권한이 없습니다',
      body: msg || '키가 만료되었거나 해당 모델에 대한 권한이 없습니다.', detail,
      fix: ['Google AI Studio에서 키가 살아 있는지 확인하세요.', '키에 IP·리퍼러 제한을 걸어두었다면 이 사이트 주소를 허용 목록에 넣으세요.'] };
  }
  if (status === 429) {
    return { kind: 'fatal', head: '사용 한도를 초과했습니다',
      body: msg || '무료 티어의 분당·일일 요청 한도에 걸렸습니다.', detail,
      fix: ['1~2분 뒤 다시 시도하세요.', '서버 데모 모드라면 오늘 할당량을 다 쓴 것입니다. 내 API 키 모드로 바꿔 계속하세요.'] };
  }
  if (status === 402 || /billing/i.test(msg)) {
    return { kind: 'fatal', head: '결제 설정이 필요한 요청입니다', body: msg, detail,
      fix: ['무료 티어 모델을 쓰도록 조건을 낮추거나 Google Cloud 결제를 설정하세요.'] };
  }
  if (status === 404) {
    // 이 모델이 없는 것 — 다음 모델로
    return { kind: 'nextModel', head: '해당 모델을 찾을 수 없습니다', body: msg, detail, fix: [] };
  }
  if (status === 400) {
    // 요청 형식 문제 — 요청 방식을 한 단계 낮춰 다시 시도
    return { kind: 'downgrade', head: '요청 형식이 거부되었습니다',
      body: msg || 'API가 요청의 일부를 받아들이지 않았습니다.', detail,
      fix: ['요청 방식을 한 단계 낮춰 자동으로 다시 시도합니다.'] };
  }
  if (status >= 500) {
    return { kind: 'nextModel', head: '모델 서버 오류', body: msg, detail, fix: [] };
  }
  return { kind: 'nextModel', head: '요청 실패', body: msg || ('HTTP ' + status), detail, fix: [] };
}

/* =============================================================
   7. 생성 실행
   ============================================================= */
async function generate() {
  const goal = $('goalInput').value.trim();
  if (!goal) { showError({ head: '목표를 입력해 주세요', body: '무엇을 하려는지 한두 문장이라도 적어야 설계할 수 있습니다.', fix: [] }); return; }

  const mode = currentMode();
  const apiKey = $('apiKeyInput').value.trim();
  const passcode = $('passcodeInput').value.trim();
  if (mode === 'byok' && !apiKey) {
    showError({ head: 'API 키를 입력해 주세요', body: '내 키 모드에서는 Google Gemini API 키가 필요합니다.',
      fix: ['aistudio.google.com에서 무료로 발급받을 수 있습니다.', '키 없이 쓰려면 위에서 "서버 데모"를 선택하세요.'] });
    return;
  }

  const opts = {
    scope: $('scopeSel').value,
    period: $('periodSel').value,
    budget: $('budgetSel').value,
    level: $('levelSel').value,
    field: $('fieldSel').value,
    deliverable: $('deliverableInput').value.trim()
  };
  const pool = toolPool();
  if (pool.length < 3) {
    showError({ head: '조건이 너무 좁습니다', body: '추천 후보 도구가 3개 미만입니다.', fix: ['도구 범위나 비용 성향을 넓혀 주세요.'] });
    return;
  }

  const system = buildSystemInstruction(pool, opts);
  const schema = buildSchema(pool);
  const userText =
    `분야: ${opts.field}\n기간: ${opts.period}\n비용 성향: ${opts.budget}\nAI 숙련도: ${opts.level}\n` +
    (opts.deliverable ? `원하는 산출물: ${opts.deliverable}\n` : '') +
    `\n목표:\n${goal}`;

  hideError();
  $('result').hidden = true;
  $('loading').hidden = false;
  $('generateBtn').disabled = true;

  try {
    const models = await resolveModels(apiKey);
    const COMPRESS = '\n\n[재시도] 직전 응답이 길이 제한으로 잘렸다. 단계 수를 줄이고 각 프롬프트를 600자 이내로 압축하라.';

    let startVariant = VARIANTS.indexOf(safeGet(sessionStorage, 'aipb2.variant') || 'schema');
    if (startVariant < 0) startVariant = 0;

    let lastErr = null, parsed = null, usedModel = '', usedVariant = '';

    let formatRejected = false;   // 요청 형식 자체가 거부되면 모델을 바꿔도 소용없다

    for (const model of models) {
      let vi = startVariant;
      while (vi < VARIANTS.length) {
        const variant = VARIANTS[vi];
        const sys = system + (variant === 'schema' ? '' : SHAPE_SPEC);
        let outcome = null;   // 'downgrade' | 'nextModel'

        for (let attempt = 1; attempt <= 2; attempt++) {
          $('loadingSub').textContent = `${model} · ${VARIANT_LABEL[variant]}로 설계 중입니다. 20초 정도 걸립니다.`;
          const { res, json } = await callModel(
            model, sys + (attempt === 2 ? COMPRESS : ''), userText, schema, variant, apiKey, passcode);

          if (!res.ok) {
            const info = classifyError(res.status, json);
            lastErr = info;
            if (info.kind === 'fatal') { showError(info); return; }
            outcome = (info.kind === 'downgrade') ? 'downgrade' : 'nextModel';
            break;
          }

          const cand = json.candidates && json.candidates[0];
          const finish = cand && cand.finishReason;

          if (finish === 'SAFETY' || finish === 'PROHIBITED_CONTENT' || json.promptFeedback?.blockReason) {
            showError({ head: '안전 필터에 걸렸습니다', body: '입력한 목표가 모델의 안전 정책에 걸렸습니다.', fix: ['표현을 바꾸어 다시 시도해 주세요.'] });
            return;
          }
          if (finish === 'MAX_TOKENS') {
            lastErr = { head: '응답이 길이 제한으로 잘렸습니다', body: '모델이 답을 끝맺지 못했습니다.',
              fix: ['목표를 더 좁게 나누어 두 번에 걸쳐 설계하세요.'] };
            if (attempt === 1) continue;      // 압축 지시를 붙여 한 번 더
            outcome = 'nextModel'; break;
          }

          const raw = cand?.content?.parts?.map(p => p.text || '').join('') || '';
          const data = parseJsonLoose(raw);
          if (!data || !Array.isArray(data.steps)) {
            lastErr = { head: '응답을 해석하지 못했습니다', body: '모델이 올바른 JSON을 반환하지 않았습니다.',
              detail: raw.slice(0, 200), fix: ['요청 방식을 낮춰 자동으로 다시 시도합니다.'] };
            if (attempt === 1) continue;
            outcome = 'downgrade'; break;
          }
          parsed = data; usedModel = model; usedVariant = variant; break;
        }

        if (parsed) break;
        if (outcome === 'downgrade') {
          vi++;
          if (vi >= VARIANTS.length) formatRejected = true;   // 세 방식 모두 거부됨
          continue;
        }
        break;   // 이 모델로는 안 됨 → 다음 모델
      }
      if (parsed || formatRejected) break;
    }

    if (!parsed) { showError(lastErr || { head: '설계에 실패했습니다', body: '모든 모델 호출이 실패했습니다.', fix: [] }); return; }
    safeSet(sessionStorage, 'aipb2.variant', usedVariant);   // 이번에 통한 방식을 기억

    const plan = normalizePlan(parsed, { ...opts, goal, model: usedModel, at: new Date().toISOString() });
    if (!plan.steps.length) {
      showError({ head: '쓸 수 있는 단계가 없습니다', body: '모델이 카탈로그에 없는 도구만 골랐습니다.', fix: ['도구 범위를 넓히거나 목표를 조금 더 구체적으로 적어 보세요.'] });
      return;
    }
    STATE.plan = plan;
    STATE.checks = plan.checklist.map(() => false);
    renderPlan(plan);
    toast(`${plan.steps.length}단계 파이프라인을 설계했습니다 (${usedModel}${usedVariant === 'schema' ? '' : ' · ' + VARIANT_LABEL[usedVariant]})`);

  } catch (err) {
    if (currentMode() === 'server') {
      showError({ head: '서버 데모에 연결하지 못했습니다',
        body: '/api/gemini 를 부를 수 없습니다. 이 파일을 배포하지 않고 직접 열었거나, 함수가 배포되지 않았습니다.',
        fix: ['위에서 "내 API 키 사용"으로 바꾸면 바로 쓸 수 있습니다.',
              '서버 데모를 쓰려면 Netlify에 배포하고 GEMINI_API_KEY를 설정하세요.'] });
    } else {
      showError({ head: '네트워크 오류', body: String(err && err.message || err),
        fix: ['인터넷 연결을 확인하고 다시 시도해 주세요.', '사내망에서 차단된 경우일 수 있습니다.'] });
    }
  } finally {
    $('loading').hidden = true;
    $('generateBtn').disabled = false;
  }
}

function parseJsonLoose(raw) {
  if (!raw) return null;
  let t = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  try { return JSON.parse(t); } catch (_) {}
  const s = t.indexOf('{'), e = t.lastIndexOf('}');
  if (s >= 0 && e > s) { try { return JSON.parse(t.slice(s, e + 1)); } catch (_) {} }
  return null;
}

/* id로 먼저 찾고, 스키마를 못 쓴 경우를 대비해 이름으로도 찾아준다 */
function resolveTool(v) {
  if (!v || typeof v !== 'string') return null;
  const key = v.trim();
  if (STATE.byId.has(key)) return STATE.byId.get(key);
  const low = key.toLowerCase();
  return STATE.catalog.find(t => t.name.toLowerCase() === low)
      || STATE.catalog.find(t => t.name.toLowerCase().includes(low) && low.length >= 3)
      || null;
}

/* 모델 출력에서 사실 정보는 버리고, 도구 정보는 카탈로그에서 다시 채운다 */
function normalizePlan(data, meta) {
  const steps = (Array.isArray(data.steps) ? data.steps : []).map((s, i) => {
    const tool = resolveTool(s.tool_id) || resolveTool(s.tool_name) || null;
    const alts = (Array.isArray(s.alt_tool_ids) ? s.alt_tool_ids : [])
      .map(id => resolveTool(id)).filter(Boolean).filter(t => !tool || t.id !== tool.id).slice(0, 3);
    return {
      n: Number(s.step_number) || (i + 1),
      title: String(s.title || '').trim(),
      toolId: tool ? tool.id : '',
      alts: alts.map(a => a.id),
      objective: String(s.objective || '').trim(),
      actions: (Array.isArray(s.action_items) ? s.action_items : []).map(x => String(x)).slice(0, 6),
      prompt: String(s.prompt || '').trim(),
      hours: Number(s.estimated_hours) || 0,
      difficulty: ['쉬움', '보통', '어려움'].includes(s.difficulty) ? s.difficulty : '보통',
      risk: String(s.risk || '').trim()
    };
  }).filter(s => s.title && s.toolId);

  const checklist = (Array.isArray(data.checklist) ? data.checklist : []).map(c => ({
    n: Number(c.step_number) || 0,
    item: String(c.item || c || '').trim()
  })).filter(c => c.item);

  return {
    title: String(data.project_title || '무제 프로젝트').trim(),
    summary: String(data.summary || '').trim(),
    steps, checklist, meta
  };
}

/* =============================================================
   8. 결과 렌더링 (전부 textContent — 주입 불가)
   ============================================================= */
function renderPlan(plan) {
  $('resultTitle').textContent = plan.title;
  const hours = plan.steps.reduce((a, s) => a + (s.hours || 0), 0);
  $('resultMeta').textContent =
    `${plan.steps.length}단계 · ${plan.meta.period} · ${plan.meta.budget}` +
    (hours ? ` · 예상 총 ${hours}시간` : '') + ` · ${plan.meta.model}`;
  $('resultSummary').textContent = plan.summary;

  // 흐름도
  const flow = $('flowBar');
  flow.textContent = '';
  plan.steps.forEach((s, i) => {
    const tool = STATE.byId.get(s.toolId);
    const node = el('div', 'flow-node');
    node.appendChild(el('span', 'flow-num', String(i + 1)));
    node.appendChild(el('span', null, tool ? tool.name : '도구'));
    flow.appendChild(node);
    if (i < plan.steps.length - 1) flow.appendChild(el('span', 'flow-arrow', '→'));
  });

  // 단계 카드
  const box = $('steps');
  box.textContent = '';
  plan.steps.forEach((s, idx) => box.appendChild(renderStep(s, idx)));

  // 체크리스트
  renderChecklist(plan);

  $('result').hidden = false;
  $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderStep(s, idx) {
  const tool = STATE.byId.get(s.toolId);
  const card = el('section', 'step');

  const head = el('div', 'step-head');
  const left = el('div');
  left.appendChild(el('span', 'step-no', 'STEP ' + (idx + 1)));
  left.appendChild(el('h3', 'step-title', s.title));
  head.appendChild(left);

  if (tool) {
    const tb = el('div', 'tool-box');
    const nm = el('div', 'tool-name');
    const a = el('a', null, tool.name);
    a.href = tool.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    nm.appendChild(a);
    tb.appendChild(nm);
    tb.appendChild(el('div', 'tool-line', tool.vendor + ' · ' + tool.category));
    const tags = el('div', 'tool-tags');
    tags.appendChild(el('span', 'tag ' + (tool.free === '유료' ? 'paid' : 'free'), tool.free));
    if (tool.region === '국내') tags.appendChild(el('span', 'tag kr', '국내'));
    if (tool.status === 'preview') tags.appendChild(el('span', 'tag preview', '프리뷰'));
    tb.appendChild(tags);
    head.appendChild(tb);
  }
  card.appendChild(head);

  card.appendChild(el('p', 'step-obj', s.objective));

  const meta = el('div', 'step-meta');
  const mk = (k, v) => { const d = el('span'); d.appendChild(el('b', null, k + ' ')); d.appendChild(el('span', null, v)); return d; };
  meta.appendChild(mk('난이도', s.difficulty));
  if (s.hours) meta.appendChild(mk('예상 소요', s.hours + '시간'));
  card.appendChild(meta);

  if (s.actions.length) {
    const ul = el('ul', 'acts');
    s.actions.forEach(t => ul.appendChild(el('li', null, t)));
    card.appendChild(ul);
  }

  if (tool && tool.caution) card.appendChild(el('div', 'caution', '도구 주의: ' + tool.caution));
  if (s.risk) card.appendChild(el('div', 'caution', '이 단계의 리스크: ' + s.risk));

  if (s.alts.length) {
    const alts = el('div', 'alts');
    alts.appendChild(el('span', null, '대안 도구: '));
    s.alts.forEach(id => {
      const t = STATE.byId.get(id); if (!t) return;
      const a = el('a', null, t.name);
      a.href = t.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      alts.appendChild(a);
    });
    card.appendChild(alts);
  }

  // 프롬프트 박스
  const wrap = el('div', 'prompt-wrap');
  const ph = el('div', 'prompt-head');
  ph.appendChild(el('span', null, (tool ? tool.name : '도구') + '에 붙여넣을 프롬프트'));
  const copyBtn = el('button', 'btn-copy', '복사');
  const code = el('pre', 'prompt-code', s.prompt);
  copyBtn.addEventListener('click', () => copyText(s.prompt, copyBtn));
  ph.appendChild(copyBtn);
  wrap.appendChild(ph);
  wrap.appendChild(code);
  card.appendChild(wrap);

  return card;
}

function renderChecklist(plan) {
  const box = $('checklist');
  box.textContent = '';
  plan.checklist.forEach((c, i) => {
    const row = el('div', 'check-item');
    const cb = el('input');
    cb.type = 'checkbox'; cb.id = 'chk' + i; cb.checked = !!STATE.checks[i];
    if (cb.checked) row.classList.add('done');
    const lb = el('label');
    lb.htmlFor = 'chk' + i;
    if (c.n) lb.appendChild(el('span', 'check-step', 'S' + c.n));
    lb.appendChild(el('span', null, c.item));
    cb.addEventListener('change', () => {
      STATE.checks[i] = cb.checked;
      row.classList.toggle('done', cb.checked);
      updateCheckProgress();
    });
    row.appendChild(cb); row.appendChild(lb);
    box.appendChild(row);
  });
  updateCheckProgress();
}

function updateCheckProgress() {
  const done = STATE.checks.filter(Boolean).length;
  $('checkProgress').textContent = `${done} / ${STATE.checks.length} 완료`;
}

async function copyText(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (_) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (__) {}
    document.body.removeChild(ta);
  }
  btn.textContent = '복사됨';
  btn.classList.add('done');
  setTimeout(() => { btn.textContent = '복사'; btn.classList.remove('done'); }, 1800);
}

/* =============================================================
   9. 오류 표시
   ============================================================= */
function showError(info) {
  $('errorHead').textContent = info.head || '오류';
  $('errorBody').textContent = info.body || '';
  const fix = $('errorFix');
  fix.textContent = '';
  if (info.fix && info.fix.length) {
    const ul = el('ul');
    info.fix.forEach(f => ul.appendChild(el('li', null, f)));
    fix.appendChild(el('div', null, '해결 방법:'));
    fix.appendChild(ul);
  }
  if (info.detail) {
    const d = el('details', 'error-detail');
    d.appendChild(el('summary', null, 'API가 보낸 원문 (문의 시 이 내용을 알려주세요)'));
    d.appendChild(el('pre', null, info.detail));
    fix.appendChild(d);
  }
  $('errorBox').hidden = false;
  $('errorBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function hideError() { $('errorBox').hidden = true; }

/* =============================================================
   10. 저장 · 다운로드
   ============================================================= */
function loadHistory() {
  try { return JSON.parse(safeGet(localStorage, CONFIG.storeHistory) || '[]'); } catch (_) { return []; }
}
function writeHistory(list) { safeSet(localStorage, CONFIG.storeHistory, JSON.stringify(list.slice(0, CONFIG.historyLimit))); }

function savePlan() {
  if (!STATE.plan) return;
  const list = loadHistory();
  const rec = { id: 'p' + Date.now(), plan: STATE.plan, checks: STATE.checks, savedAt: new Date().toISOString() };
  list.unshift(rec);
  writeHistory(list);
  renderHistory();
  toast('내 계획에 저장했습니다.');
}

function renderHistory() {
  const list = loadHistory();
  $('historyCount').textContent = String(list.length);
  const box = $('historyList');
  box.textContent = '';
  if (!list.length) { box.appendChild(el('p', 'empty', '저장한 계획이 없습니다. 설계 후 "내 계획에 저장"을 누르세요.')); return; }

  list.forEach(rec => {
    const row = el('div', 'hist');
    const left = el('div');
    left.appendChild(el('div', 'hist-title', rec.plan.title));
    const d = new Date(rec.savedAt);
    const done = (rec.checks || []).filter(Boolean).length;
    left.appendChild(el('div', 'hist-meta',
      `${d.toLocaleDateString('ko-KR')} · ${rec.plan.steps.length}단계 · 체크 ${done}/${(rec.checks || []).length}`));
    row.appendChild(left);

    const acts = el('div', 'hist-actions');
    const openBtn = el('button', 'btn-ghost', '열기');
    openBtn.addEventListener('click', () => {
      STATE.plan = rec.plan;
      STATE.checks = rec.checks || rec.plan.checklist.map(() => false);
      document.querySelector('.tab[data-tab="build"]').click();
      renderPlan(rec.plan);
    });
    const delBtn = el('button', 'btn-ghost danger', '삭제');
    delBtn.addEventListener('click', () => {
      writeHistory(loadHistory().filter(x => x.id !== rec.id));
      renderHistory();
      toast('삭제했습니다.');
    });
    acts.appendChild(openBtn); acts.appendChild(delBtn);
    row.appendChild(acts);
    box.appendChild(row);
  });
}

function downloadMarkdown() {
  const p = STATE.plan;
  if (!p) return;
  const meta = window.AI_CATALOG_META || {};
  let md = `# ${p.title}\n\n`;
  md += `- 작성일: ${new Date().toLocaleString('ko-KR')}\n`;
  md += `- 조건: ${p.meta.field} / ${p.meta.period} / ${p.meta.budget} / 숙련도 ${p.meta.level}\n`;
  md += `- 도구 카탈로그 확인일: ${meta.verified || '미상'}\n\n`;
  md += `## 개요\n${p.summary}\n\n## 전체 흐름\n`;
  md += p.steps.map((s, i) => {
    const t = STATE.byId.get(s.toolId);
    return `${i + 1}. ${t ? t.name : ''}`;
  }).join(' → ') + '\n\n---\n\n';

  p.steps.forEach((s, i) => {
    const t = STATE.byId.get(s.toolId);
    md += `## STEP ${i + 1}. ${s.title}\n\n`;
    if (t) {
      md += `- 도구: **${t.name}** (${t.vendor} · ${t.category} · 비용 ${t.free}) — ${t.url}\n`;
      if (t.caution) md += `- 도구 주의: ${t.caution}\n`;
    }
    md += `- 난이도: ${s.difficulty}${s.hours ? ` · 예상 ${s.hours}시간` : ''}\n`;
    md += `- 목표: ${s.objective}\n`;
    if (s.actions.length) { md += `- 실행 항목:\n`; s.actions.forEach(a => md += `  - ${a}\n`); }
    if (s.risk) md += `- 리스크: ${s.risk}\n`;
    if (s.alts.length) {
      md += `- 대안 도구: ` + s.alts.map(id => { const x = STATE.byId.get(id); return x ? `${x.name}(${x.url})` : ''; }).filter(Boolean).join(', ') + '\n';
    }
    md += `\n### 붙여넣을 프롬프트\n\n\`\`\`text\n${s.prompt}\n\`\`\`\n\n---\n\n`;
  });

  md += `## 검수 체크리스트\n`;
  p.checklist.forEach(c => md += `- [ ] ${c.n ? `(S${c.n}) ` : ''}${c.item}\n`);
  md += `\n> 도구의 요금·정책은 변동됩니다. 실행 전 각 공식 페이지에서 확인하십시오.\n`;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const a = document.createElement('a');
  a.href = url;
  a.download = stamp + '_' + (p.title.replace(/[\\/:*?"<>|]/g, '_').trim().slice(0, 50) || 'ai_pipeline') + '.md';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);   // 즉시 해제하면 일부 브라우저에서 다운로드가 취소됨
  toast('작업계획서를 내려받았습니다.');
}

/* =============================================================
   11. 도구 도감
   ============================================================= */
function bindCatalogTab() {
  const cats = Array.from(new Set(STATE.catalog.map(t => t.category))).sort();
  const sel = $('catCategory');
  cats.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; sel.appendChild(o); });
  ['catSearch', 'catRegion', 'catCategory', 'catFree', 'catShowEnded'].forEach(id => {
    $(id).addEventListener('input', renderCatalog);
    $(id).addEventListener('change', renderCatalog);
  });
}

function renderCatalog() {
  const q = $('catSearch').value.trim().toLowerCase();
  const region = $('catRegion').value;
  const cat = $('catCategory').value;
  const free = $('catFree').value;
  const showEnded = $('catShowEnded').checked;

  const rows = STATE.catalog.filter(t => {
    if (!showEnded && t.status === 'ended') return false;
    if (region && t.region !== region) return false;
    if (cat && t.category !== cat) return false;
    if (free && t.free !== free) return false;
    if (q) {
      const hay = (t.name + ' ' + t.vendor + ' ' + t.use + ' ' + t.category + ' ' +
                   (t.tags || '') + ' ' + (t.strength || '') + ' ' + (t.caution || '')).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  $('catCountLine').textContent = `${rows.length}개 표시 중 (전체 ${STATE.catalog.length}개)`;

  const grid = $('catGrid');
  grid.textContent = '';
  if (!rows.length) { grid.appendChild(el('p', 'empty', '조건에 맞는 도구가 없습니다.')); return; }

  rows.forEach(t => {
    const c = el('article', 'cat-card' + (t.status === 'ended' ? ' ended' : ''));
    const head = el('div', 'cat-head');
    head.appendChild(el('div', 'cat-name', t.name));
    head.appendChild(el('div', 'cat-vendor', t.vendor));
    c.appendChild(head);
    c.appendChild(el('p', 'cat-use', t.use));
    if (t.strength && t.strength !== '—') c.appendChild(el('p', 'cat-strength', '강점: ' + t.strength));
    if (t.caution) c.appendChild(el('p', 'cat-caution', '주의: ' + t.caution));

    const foot = el('div', 'cat-foot');
    const tags = el('div', 'tool-tags');
    tags.appendChild(el('span', 'tag', t.category));
    if (t.region === '국내') tags.appendChild(el('span', 'tag kr', '국내'));
    if (t.free && t.free !== '—') tags.appendChild(el('span', 'tag ' + (t.free === '유료' ? 'paid' : 'free'), t.free));
    if (t.status === 'preview') tags.appendChild(el('span', 'tag preview', '프리뷰'));
    if (t.status === 'ended') tags.appendChild(el('span', 'tag paid', '종료'));
    if (t.status === 'check') tags.appendChild(el('span', 'tag preview', '확인 필요'));
    foot.appendChild(tags);
    const a = el('a', 'cat-link', '공식 페이지');
    a.href = t.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    foot.appendChild(a);
    c.appendChild(foot);
    grid.appendChild(c);
  });
}

function renderPrograms() {
  const list = window.AI_SUPPORT_PROGRAMS || [];
  const box = $('programList');
  box.textContent = '';
  list.forEach(p => {
    const d = el('div', 'program');
    const head = el('div', 'program-head');
    head.appendChild(el('div', 'program-name', p.name + ' · ' + p.org));
    const open = /접수|상시/.test(p.state) && !/마감/.test(p.state);
    head.appendChild(el('span', 'program-state ' + (open ? 'open' : 'closed'), p.state));
    d.appendChild(head);
    d.appendChild(el('p', 'program-detail', p.detail));
    const note = el('p', 'program-note');
    note.appendChild(el('span', null, p.note + ' · '));
    const a = el('a', null, p.url);
    a.href = p.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    note.appendChild(a);
    d.appendChild(note);
    box.appendChild(d);
  });
}
