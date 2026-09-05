/* =============================================================
   Gemini 프록시 — Netlify Functions
   -------------------------------------------------------------
   목적: 사용자가 API 키를 발급받지 않아도 앱을 쓸 수 있게 한다.
        키는 이 서버(환경변수)에만 있고 브라우저로 내려가지 않는다.

   환경변수 (Netlify > Site configuration > Environment variables)
     GEMINI_API_KEY   필수. Google AI Studio에서 발급한 키.
     DAILY_LIMIT      선택. IP당 하루 허용 횟수 (기본 15)
     DEMO_PASSCODE    선택. 설정하면 이 암호를 아는 사람만 데모 사용 가능.
                      강의·상담 때만 열고 싶을 때 쓴다.
     ALLOWED_ORIGIN   선택. 지정하면 그 도메인에서 온 요청만 받는다.
   ============================================================= */

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const SIGNATURE = 'AIPB-V2';           // 이 앱이 보낸 요청인지 확인하는 표식
const MAX_BODY = 200 * 1024;           // 200KB
const MAX_OUTPUT_TOKENS = 32768;

/* --- 사용량 카운터: Netlify Blobs가 있으면 쓰고, 없으면 인스턴스 메모리 --- */
const memCounter = new Map();          // key -> {day, n}

async function bumpCount(key, limit) {
  const day = new Date().toISOString().slice(0, 10);
  const id = `${day}:${key}`;

  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('aipb-usage');
    const cur = Number((await store.get(id)) || 0);
    if (cur >= limit) return { ok: false, used: cur };
    await store.set(id, String(cur + 1));
    return { ok: true, used: cur + 1 };
  } catch (_) {
    // Blobs를 못 쓰는 환경 — 인스턴스 메모리로 최소한의 방어
    const rec = memCounter.get(key);
    if (!rec || rec.day !== day) { memCounter.set(key, { day, n: 1 }); return { ok: true, used: 1 }; }
    if (rec.n >= limit) return { ok: false, used: rec.n };
    rec.n += 1;
    return { ok: true, used: rec.n };
  }
}

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });

export default async (req, context) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const limit = Number(process.env.DAILY_LIMIT || 15);
  const passcodeRequired = process.env.DEMO_PASSCODE || '';
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '';

  if (!apiKey) {
    return json({ error: { message: '서버에 GEMINI_API_KEY가 설정되지 않았습니다. 관리자에게 문의하거나 "내 API 키" 모드를 쓰세요.' } }, 503);
  }
  if (allowedOrigin) {
    const origin = req.headers.get('origin') || '';
    if (origin && origin !== allowedOrigin) return json({ error: { message: '허용되지 않은 도메인입니다.' } }, 403);
  }

  const url = new URL(req.url);

  /* ---------- 모델 목록 조회 ---------- */
  if (req.method === 'GET' && url.searchParams.get('op') === 'models') {
    const r = await fetch(`${API_BASE}/models?key=${encodeURIComponent(apiKey)}&pageSize=200`);
    const body = await r.text();
    return new Response(body, {
      status: r.status,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
    });
  }

  if (req.method !== 'POST') return json({ error: { message: 'POST만 허용됩니다.' } }, 405);

  /* ---------- 본문 검증 ---------- */
  const raw = await req.text();
  if (raw.length > MAX_BODY) return json({ error: { message: '요청이 너무 큽니다.' } }, 413);

  let payload;
  try { payload = JSON.parse(raw); } catch (_) { return json({ error: { message: '잘못된 JSON입니다.' } }, 400); }

  const { model, system, user, schema, jsonMime, passcode } = payload || {};

  if (passcodeRequired && String(passcode || '') !== passcodeRequired) {
    return json({ error: { message: '데모 접속 암호가 필요합니다. 강의·상담 시 안내받은 암호를 입력하세요.' } }, 401);
  }
  if (typeof model !== 'string' || !/^gemini-[a-z0-9.\-]+$/i.test(model)) {
    return json({ error: { message: '허용되지 않은 모델입니다.' } }, 400);
  }
  if (typeof system !== 'string' || !system.startsWith(SIGNATURE)) {
    return json({ error: { message: '이 엔드포인트는 파이프라인 빌더 전용입니다.' } }, 400);
  }
  if (typeof user !== 'string' || !user.trim() || user.length > 8000) {
    return json({ error: { message: '입력 길이가 올바르지 않습니다.' } }, 400);
  }

  /* ---------- 사용량 제한 ---------- */
  const ip = req.headers.get('x-nf-client-connection-ip')
    || (req.headers.get('x-forwarded-for') || '').split(',')[0].trim()
    || context?.ip || 'unknown';
  const gate = await bumpCount(ip, limit);
  if (!gate.ok) {
    return json({ error: { message: `오늘의 무료 사용 횟수(${limit}회)를 모두 쓰셨습니다. "내 API 키" 모드로 바꾸면 계속 쓸 수 있습니다.` } }, 429);
  }

  /* ---------- Gemini 호출 ---------- */
  // 클라이언트가 요청 방식을 단계적으로 낮출 수 있게 그대로 반영한다.
  const genCfg = { maxOutputTokens: MAX_OUTPUT_TOKENS };
  if (jsonMime !== false) genCfg.responseMimeType = 'application/json';
  if (schema && typeof schema === 'object') genCfg.responseSchema = schema;

  const body = {
    contents: [{ role: 'user', parts: [{ text: user }] }],
    systemInstruction: { parts: [{ text: system }] },
    generationConfig: genCfg
  };

  let r = await fetch(`${API_BASE}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  // 스키마가 거부되면 스키마 없이 한 번 더 시도 (API 스펙 변화 대비)
  if (r.status === 400 && body.generationConfig.responseSchema) {
    const t = await r.clone().text();
    if (/schema/i.test(t)) {
      delete body.generationConfig.responseSchema;
      r = await fetch(`${API_BASE}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    }
  }

  const out = await r.text();
  return new Response(out, {
    status: r.status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Daily-Used': String(gate.used),
      'X-Daily-Limit': String(limit)
    }
  });
};

export const config = { path: '/api/gemini' };
