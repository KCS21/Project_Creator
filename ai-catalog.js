/* =============================================================
   AI 도구 카탈로그  —  최종 확인일 2026-09-05
   -------------------------------------------------------------
   유지보수 규칙 (중요):
   1) 분기(3개월)마다 status / free / url 을 각 공식 페이지에서 재확인하고
      META.verified 날짜를 갱신할 것. 90일이 지나면 앱이 "확인 필요"를 표시함.
   2) status 값:
      'active'   정상 서비스 중        → 추천 대상
      'preview'  프리뷰/실험 단계      → 추천 대상이나 경고 표시
      'check'    사실 재확인 필요      → 추천 대상에서 제외
      'ended'    서비스 종료·단종      → 추천 대상에서 제외, 도감에만 표시
   3) free 값: '무료' | '부분무료' | '유료' | '미확인'
   4) 모델 이름(GPT-6, Gemini 3.8 등)은 분기마다 바뀌므로 본문에 박지 말고
      caution 필드에만 최소한으로 적을 것.
   ============================================================= */

window.AI_CATALOG_META = {
  version: '2.0',
  verified: '2026-09-05',
  staleDays: 90
};

window.AI_CATALOG = [
  /* ---------------- Google 생태계 ---------------- */
  { id:'gemini-app', tags:'챗봇,글쓰기,요약,검색', name:'Gemini 앱', vendor:'Google', region:'글로벌', category:'범용대화',
    use:'문서·이미지·리서치를 한 창에서 처리하는 범용 AI',
    strength:'긴 자료를 통째로 넣고 조사·요약하는 작업에 강함',
    caution:'"Gemini Advanced" 명칭은 폐지되고 Google AI Plus/Pro/Ultra 구독 체계로 바뀜',
    free:'부분무료', status:'active', url:'https://gemini.google.com' },

  { id:'google-ai-studio', tags:'API키,프로토타입,실험', name:'Google AI Studio', vendor:'Google', region:'글로벌', category:'API·개발',
    use:'Gemini 모델 실험과 앱 프로토타입 제작',
    strength:'프롬프트 실험에서 웹앱 생성까지 한 자리에서 이어짐, API 키 발급처',
    caution:'무료 티어 입력 데이터는 제품 개선에 쓰일 수 있어 기밀·개인정보 투입 금지',
    free:'부분무료', status:'active', url:'https://aistudio.google.com' },

  { id:'gemini-api', tags:'API,개발,무료티어', name:'Gemini API', vendor:'Google', region:'글로벌', category:'API·개발',
    use:'Gemini를 코드에서 직접 호출하는 개발자 API',
    strength:'텍스트·이미지·음성·영상을 한 API에서 처리, Flash 계열에 무료 티어 있음',
    caution:'모델 ID 회전이 매우 빨라(2026년에만 Flash가 네 번 교체) 앱에 하드코딩하면 안 됨',
    free:'부분무료', status:'active', url:'https://ai.google.dev' },

  { id:'notebooklm', tags:'자료정리,요약,PDF,연구노트,강의자료', name:'NotebookLM', vendor:'Google', region:'글로벌', category:'지식베이스',
    use:'내가 올린 자료만 근거로 답하는 리서치 노트북',
    strength:'출처 인용이 붙고 오디오·비디오 개요, 퀴즈, 플래시카드로 재가공됨',
    caution:'노트북 수와 오디오 개요·딥리서치 횟수가 플랜별로 제한됨',
    free:'부분무료', status:'active', url:'https://notebooklm.google.com' },

  { id:'colab', tags:'파이썬,통계,머신러닝,데이터분석,실습', name:'Google Colab', vendor:'Google', region:'글로벌', category:'데이터분석',
    use:'브라우저에서 쓰는 Gemini 내장 파이썬 노트북',
    strength:'자연어 지시로 데이터 로드→전처리→시각화 노트북을 통째로 작성',
    caution:'무료 런타임은 세션 시간·GPU가 유동적이라 장시간 학습에는 부적합',
    free:'부분무료', status:'active', url:'https://colab.research.google.com' },

  { id:'antigravity', tags:'코딩,개발,에이전트,CLI', name:'Google Antigravity', vendor:'Google', region:'글로벌', category:'코딩',
    use:'구글의 에이전트 중심 개발 환경(앱·CLI·SDK)',
    strength:'병렬 태스크와 서브에이전트를 데스크톱·CLI·SDK가 같은 방식으로 실행',
    caution:'Gemini CLI는 2026-06 Antigravity CLI로 통합·단종되어 옛 문서는 무효',
    free:'부분무료', status:'active', url:'https://antigravity.google' },

  { id:'jules', tags:'코딩,개발,깃허브,PR', name:'Jules', vendor:'Google', region:'글로벌', category:'코딩',
    use:'GitHub 저장소에서 비동기로 일하는 코딩 에이전트',
    strength:'이슈를 받아 브랜치를 파고 PR을 올리며 CI 실패까지 스스로 수정',
    caution:'비동기 배치형이라 실시간 페어 프로그래밍에는 맞지 않음',
    free:'부분무료', status:'active', url:'https://jules.google' },

  { id:'opal', tags:'노코드,미니앱,워크플로우', name:'Opal', vendor:'Google Labs', region:'글로벌', category:'노코드',
    use:'말로 만드는 노코드 AI 미니앱 빌더',
    strength:'프롬프트 체인을 시각 워크플로로 엮어 링크로 공유·리믹스',
    caution:'Labs 실험 단계라 SLA·데이터 보관 보장이 없어 업무 핵심에 의존 금지',
    free:'무료', status:'preview', url:'https://opal.google' },

  { id:'gemini-image', tags:'이미지,그림,포스터,썸네일,디자인', name:'Gemini Image (Nano Banana)', vendor:'Google', region:'글로벌', category:'이미지',
    use:'구글의 현행 이미지 생성·편집 모델',
    strength:'대화형 다중 턴 편집과 이미지 속 글자 렌더링 품질이 높음',
    caution:'Imagen은 전 모델 폐지되어 이쪽으로 대체됨, API는 유료 전용',
    free:'부분무료', status:'active', url:'https://ai.google.dev/gemini-api/docs/interactions/image-generation' },

  { id:'veo-omni', tags:'영상,동영상,생성', name:'Veo 3.1 / Gemini Omni Flash', vendor:'Google', region:'글로벌', category:'영상',
    use:'텍스트·이미지에서 영상을 만드는 생성 모델',
    strength:'장면 확장·보간·4K 업스케일까지 한 모델에서 처리',
    caution:'Veo 2와 3.0은 2026-06-30 종료, "Veo 3"을 현행 세대로 쓰면 오류',
    free:'유료', status:'active', url:'https://deepmind.google/models/veo/' },

  { id:'flow', tags:'영상,편집,스토리보드', name:'Google Flow', vendor:'Google', region:'글로벌', category:'영상',
    use:'AI 영상용 씬 편집·스토리보드 도구',
    strength:'카메라 워크와 캐릭터 일관성을 유지한 채 여러 클립을 이어 붙임',
    caution:'무료로는 사실상 쓸 수 없고 Pro 이상 구독에서 실사용 크레딧이 열림',
    free:'유료', status:'active', url:'https://labs.google/flow' },

  { id:'workspace-gemini', tags:'PPT,발표자료,문서,스프레드시트,메일', name:'Gemini in Workspace', vendor:'Google', region:'글로벌', category:'오피스',
    use:'Docs·Sheets·Slides·Vids에 내장된 AI 작성 보조',
    strength:'기존 발표자료 스타일을 참조해 새 덱을 만들고 한국어 보이스오버까지 생성',
    caution:'전 Workspace 플랜에 포함되나 Business Starter는 주요 앱의 Gemini가 빠짐',
    free:'유료', status:'active', url:'https://workspace.google.com/solutions/ai/' },

  { id:'gemini-transcribe', tags:'자막,받아쓰기,회의록,STT', name:'Gemini Transcribe', vendor:'Google', region:'글로벌', category:'음성',
    use:'실시간 음성 인식 전용 모델',
    strength:'소음·전문용어 환경에서 정확도가 높고 라이브 자막 스트리밍 지원',
    caution:'신규 모델이라 한국어 정확도는 별도 검증 필요',
    free:'부분무료', status:'active', url:'https://ai.google.dev/gemini-api/docs/models' },

  { id:'lyria', tags:'음악,BGM,작곡', name:'Lyria', vendor:'Google', region:'글로벌', category:'음악',
    use:'풀렝스 곡을 만드는 음악 생성 모델',
    strength:'곡 전체 길이 생성과 음악적 일관성, 자연스러운 보컬',
    caution:'프리뷰 단계이며 상업적 이용·저작권 조건을 별도 확인해야 함',
    free:'유료', status:'preview', url:'https://ai.google.dev/gemini-api/docs/models' },

  { id:'gemma', tags:'오픈소스,로컬,온프레미스', name:'Gemma', vendor:'Google', region:'글로벌', category:'오픈모델',
    use:'직접 서버에 올려 쓰는 구글 오픈 웨이트 모델',
    strength:'데이터 반출 없이 온프레미스로 운영 가능',
    caution:'프런티어 모델 대비 성능이 낮고 사용 제한 라이선스 확인 필요',
    free:'무료', status:'active', url:'https://ai.google.dev/gemma' },

  /* ---------------- 글로벌 · 범용 대화형 ---------------- */
  { id:'chatgpt', tags:'챗봇,글쓰기,요약,번역', name:'ChatGPT', vendor:'OpenAI', region:'글로벌', category:'범용대화',
    use:'대화·문서·코딩·리서치 올인원',
    strength:'생태계(Codex·앱·API)가 가장 넓고 모델 선택지가 많음',
    caution:'최상위 모델은 Plus 이상 유료 전용, 무료 등급은 하위 모델로 제한',
    free:'부분무료', status:'active', url:'https://chatgpt.com' },

  { id:'claude', tags:'챗봇,글쓰기,장문,분석', name:'Claude', vendor:'Anthropic', region:'글로벌', category:'범용대화',
    use:'장문 추론·문서작업·에이전트 작업',
    strength:'초장문 컨텍스트와 장시간 실행 에이전트 작업에 강함',
    caution:'플래그십 모델의 API 단가가 높고 핵심 기능은 Pro 이상 유료',
    free:'부분무료', status:'active', url:'https://claude.ai' },

  { id:'grok', tags:'챗봇,실시간,소셜', name:'Grok', vendor:'xAI', region:'글로벌', category:'범용대화',
    use:'실시간 X·웹 검색을 결합한 대화 AI',
    strength:'실시간 소셜·웹 정보 접근이 빠름',
    caution:'소셜 데이터 의존도가 높아 출처 신뢰도 편차가 큼',
    free:'부분무료', status:'active', url:'https://grok.com' },

  { id:'deepseek', tags:'챗봇,무료,추론', name:'DeepSeek', vendor:'DeepSeek(중국)', region:'글로벌', category:'범용대화',
    use:'무료로 쓰는 고성능 추론·코딩 챗봇',
    strength:'웹·앱에서 사실상 무제한 무료로 가격 대비 성능이 압도적',
    caution:'중국 기업 서비스로 데이터 주권·규제 검토 필요, 공공·금융 업무 부적합',
    free:'무료', status:'active', url:'https://chat.deepseek.com' },

  { id:'mistral-vibe', tags:'챗봇,유럽,데이터주권', name:'Mistral Vibe', vendor:'Mistral AI(프랑스)', region:'글로벌', category:'범용대화',
    use:'유럽산 업무·코딩용 AI 어시스턴트',
    strength:'EU 데이터 주권 요건에 맞고 원격 에이전트·Work 모드 제공',
    caution:'구 명칭 Le Chat에서 2026-05 리브랜딩, 최상위 추론 성능은 프런티어 대비 낮음',
    free:'부분무료', status:'active', url:'https://mistral.ai/products/vibe' },

  { id:'meta-ai', tags:'챗봇,메신저', name:'Meta AI', vendor:'Meta', region:'글로벌', category:'범용대화',
    use:'메신저에 내장된 무료 생활형 AI',
    strength:'WhatsApp·Instagram에 기본 내장돼 별도 가입이 필요 없음',
    caution:'업무용 문서 처리 기능이 약하고 구동 모델 세대는 미확인',
    free:'무료', status:'check', url:'https://www.meta.ai' },

  /* ---------------- 리서치·학술 ---------------- */
  { id:'perplexity', tags:'검색,리서치,출처,조사', name:'Perplexity', vendor:'Perplexity AI', region:'글로벌', category:'리서치',
    use:'출처 인용이 붙는 AI 검색·딥리서치',
    strength:'모든 답변에 인용 링크가 붙어 사실 검증이 빠름',
    caution:'인용이 붙어도 요약 과정의 왜곡이 있어 원문 확인이 필수',
    free:'부분무료', status:'active', url:'https://www.perplexity.ai' },

  { id:'elicit', tags:'논문,문헌고찰,선행연구,메타분석', name:'Elicit', vendor:'Elicit', region:'글로벌', category:'학술',
    use:'논문 1.4억 편 기반 체계적 문헌고찰',
    strength:'논문을 표로 구조화해 근거 기반 리포트를 자동 생성',
    caution:'영문 학술 논문 중심이라 한국어 자료·회색문헌 커버리지가 낮음',
    free:'부분무료', status:'active', url:'https://elicit.com' },

  { id:'consensus', tags:'논문,근거,선행연구', name:'Consensus', vendor:'Consensus', region:'글로벌', category:'학술',
    use:'동료심사 논문만 검색하는 근거 엔진',
    strength:'"이 주장에 대한 학계 합의"를 요약해 근거 강도 판단이 빠름',
    caution:'피어리뷰 논문에 한정돼 산업 리포트·프리프린트는 놓침',
    free:'부분무료', status:'active', url:'https://consensus.app' },

  { id:'scispace', tags:'논문,PDF,인용,문헌고찰', name:'SciSpace', vendor:'SciSpace', region:'글로벌', category:'학술',
    use:'논문 PDF와 대화하며 문헌고찰·인용 생성',
    strength:'2.8억 편 DB에서 PDF 대화·인용 생성까지 한 곳에서 처리',
    caution:'자동 생성 인용·요약에 오류가 섞일 수 있어 제출 전 원문 대조 필요',
    free:'부분무료', status:'active', url:'https://scispace.com' },

  /* ---------------- 코딩·개발 ---------------- */
  { id:'claude-code', tags:'코딩,개발,프로그래밍,리팩토링', name:'Claude Code', vendor:'Anthropic', region:'글로벌', category:'코딩',
    use:'터미널 기반 자율 코딩 에이전트',
    strength:'코드베이스 전체를 이해하고 다중 파일 편집과 PR 제출까지 수행',
    caution:'무료 플랜에 포함되지 않고 Pro 이상 구독이 필요',
    free:'유료', status:'active', url:'https://www.claude.com/product/claude-code' },

  { id:'openai-codex', tags:'코딩,개발,프로그래밍', name:'OpenAI Codex', vendor:'OpenAI', region:'글로벌', category:'코딩',
    use:'ChatGPT와 연동되는 클라우드 코딩 에이전트',
    strength:'GitHub Copilot에서도 에이전트로 직접 호출 가능',
    caution:'ChatGPT 구독 등급에 따라 쓸 수 있는 모델과 태스크 수가 갈림',
    free:'부분무료', status:'active', url:'https://openai.com/codex' },

  { id:'cursor', tags:'코딩,개발,에디터,IDE', name:'Cursor', vendor:'SpaceX(2026-08 인수)', region:'글로벌', category:'코딩',
    use:'AI 우선 코드 에디터와 클라우드 에이전트',
    strength:'IDE·CLI·클라우드 에이전트·PR 리뷰를 묶어 병렬 장시간 작업 지원',
    caution:'2026-08 SpaceX 인수로 소유 구조와 모델 라인업이 재편 중이라 기업 도입 시 정책 변동 리스크',
    free:'부분무료', status:'active', url:'https://cursor.com' },

  { id:'devin', tags:'코딩,개발,에이전트', name:'Devin / Devin Desktop', vendor:'Cognition', region:'글로벌', category:'코딩',
    use:'병렬 클라우드 코딩 에이전트와 IDE',
    strength:'다수 에이전트를 병렬 실행하며 PR 리뷰·마이그레이션·문서화 처리',
    caution:'Windsurf가 2026-06 Devin Desktop으로 개명되어 옛 이름 문서와 혼선 주의',
    free:'부분무료', status:'active', url:'https://devin.ai' },

  { id:'github-copilot', tags:'코딩,개발,자동완성', name:'GitHub Copilot', vendor:'GitHub(Microsoft)', region:'글로벌', category:'코딩',
    use:'IDE에 내장된 코드 제안·에이전트',
    strength:'무료 등급이 있고 여러 벤더의 에이전트를 한 곳에서 배정·추적',
    caution:'프리미엄 모델은 상위 플랜이 필요하고 월별 AI 크레딧 한도에 묶임',
    free:'부분무료', status:'active', url:'https://github.com/features/copilot' },

  { id:'replit', tags:'앱개발,노코드,배포,웹사이트', name:'Replit', vendor:'Replit', region:'글로벌', category:'노코드',
    use:'브라우저에서 앱을 만들고 바로 배포',
    strength:'코드 작성부터 DB·배포까지 한 화면에서 끝남',
    caution:'무료 등급은 라이브 배포 수가 제한되고 상위 모델은 크레딧 소진 방식',
    free:'부분무료', status:'active', url:'https://replit.com' },

  { id:'v0', tags:'앱개발,노코드,웹사이트,UI', name:'v0', vendor:'Vercel', region:'글로벌', category:'노코드',
    use:'프롬프트로 풀스택 웹앱 생성',
    strength:'텍스트에서 동작하는 앱을 만들고 시각 편집·즉시 배포까지 이어짐',
    caution:'Vercel 생태계 종속성이 강하고 무료 등급 세부는 미확인',
    free:'부분무료', status:'active', url:'https://v0.app' },

  /* ---------------- 이미지 ---------------- */
  { id:'midjourney', tags:'이미지,그림,일러스트,컨셉아트', name:'Midjourney', vendor:'Midjourney', region:'글로벌', category:'이미지',
    use:'고품질 아트워크·컨셉 이미지 생성',
    strength:'심미성과 개인화(Personalization) 품질이 가장 높은 축',
    caution:'무료 체험이 없는 전면 유료이고 글자 렌더링·정밀 제어는 약함',
    free:'유료', status:'active', url:'https://www.midjourney.com' },

  { id:'firefly', tags:'이미지,디자인,저작권,상업이용', name:'Adobe Firefly', vendor:'Adobe', region:'글로벌', category:'이미지',
    use:'상업 이용이 안전한 생성형 크리에이티브',
    strength:'자사 모델과 외부 모델을 한 캔버스에서 골라 씀',
    caution:'무료는 일일 생성량이 제한되고 파트너 모델 사용 시 상업 안전성 보장 범위가 달라짐',
    free:'부분무료', status:'active', url:'https://www.adobe.com/products/firefly.html' },

  { id:'ideogram', tags:'이미지,포스터,로고,썸네일,타이포', name:'Ideogram', vendor:'Ideogram', region:'글로벌', category:'이미지',
    use:'글자가 정확한 포스터·로고 이미지',
    strength:'이미지 안 텍스트 가독성이 뛰어나 타이포 포함 디자인에 강함',
    caution:'무료는 주간 크레딧이 소량',
    free:'부분무료', status:'active', url:'https://ideogram.ai' },

  { id:'stable-diffusion', tags:'이미지,로컬설치,파인튜닝', name:'Stable Diffusion', vendor:'Stability AI', region:'글로벌', category:'오픈모델',
    use:'로컬 설치·커스텀 학습이 가능한 이미지 생성',
    strength:'오픈 웨이트로 자체 호스팅·파인튜닝·온프레미스 배포 가능',
    caution:'상업 라이선스가 분리돼 있고 직접 운용 시 GPU 비용·기술 부담이 큼',
    free:'부분무료', status:'active', url:'https://stability.ai/stable-image' },

  /* ---------------- 영상 ---------------- */
  { id:'runway', tags:'영상,동영상,편집,모션', name:'Runway', vendor:'Runway', region:'글로벌', category:'영상',
    use:'방송급 AI 영상 생성·편집',
    strength:'모션 품질과 프롬프트 충실도가 최상위, 영상·이미지·오디오 편집을 함께 제공',
    caution:'고품질 렌더는 크레딧 소모가 커서 무료 범위로는 실무 분량이 어려움',
    free:'부분무료', status:'active', url:'https://runway.com' },

  { id:'kling', tags:'영상,동영상,숏폼', name:'Kling AI', vendor:'Kuaishou(중국)', region:'글로벌', category:'영상',
    use:'멀티모달 지시 기반 영상 생성',
    strength:'복합 연출 프롬프트 해석력이 좋음',
    caution:'요금·무료 크레딧이 미확인이고 중국 서비스라 지역별 정책 편차가 있음',
    free:'미확인', status:'active', url:'https://kling.ai' },

  { id:'luma', tags:'영상,동영상,숏폼', name:'Luma Dream Machine', vendor:'Luma AI', region:'글로벌', category:'영상',
    use:'텍스트·이미지로 짧은 영상 제작',
    strength:'이미지→영상 변환과 카메라 무빙 제어가 직관적',
    caution:'공식 요금제가 유료 3단계만 명시돼 무료 등급 존재 여부 불명확',
    free:'미확인', status:'active', url:'https://lumalabs.ai/dream-machine' },

  { id:'pika', tags:'영상,숏폼,릴스,이펙트', name:'Pika', vendor:'Pika Labs', region:'글로벌', category:'영상',
    use:'짧은 소셜용 이펙트 영상 제작',
    strength:'SNS 바이럴 포맷 영상을 빠르게 뽑아냄',
    caution:'장척 서사 영상에는 부적합하고 무료 등급 세부는 미확인',
    free:'미확인', status:'active', url:'https://pika.art' },

  /* ---------------- 음성·음악 ---------------- */
  { id:'elevenlabs', tags:'성우,더빙,오디오북,TTS,음성합성', name:'ElevenLabs', vendor:'ElevenLabs', region:'글로벌', category:'음성',
    use:'초현실 TTS·음성복제·더빙',
    strength:'음성 에이전트와 STT까지 라인업이 완결적, 70개 언어 지원',
    caution:'음성 복제는 권리자 동의가 필요한 법적 리스크 영역',
    free:'부분무료', status:'active', url:'https://elevenlabs.io' },

  { id:'suno', tags:'음악,BGM,작곡,노래', name:'Suno', vendor:'Suno', region:'글로벌', category:'음악',
    use:'가사를 넣으면 완성곡을 만들어 줌',
    strength:'하루 10곡 무료로 진입장벽이 가장 낮음',
    caution:'상업적 이용권은 유료 구독자에게만 부여되고 라이선스 전환으로 기존 모델이 순차 폐기 예정',
    free:'부분무료', status:'active', url:'https://suno.com' },

  { id:'udio', tags:'음악,BGM,작곡', name:'Udio', vendor:'Udio', region:'글로벌', category:'음악',
    use:'고음질 AI 작곡·리믹스',
    strength:'48kHz 고음질 보컬 표현과 구간 편집이 강함',
    caution:'라이선스 전환 기간 중 다운로드·내보내기가 차단된 이력이 있어 사용 전 상태 재확인 필수',
    free:'미확인', status:'check', url:'https://www.udio.com' },

  /* ---------------- 문서·오피스 ---------------- */
  { id:'notion-ai', tags:'노트,회의록,위키,협업,문서', name:'Notion AI', vendor:'Notion', region:'글로벌', category:'문서',
    use:'워크스페이스에 내장된 AI 에이전트',
    strength:'Slack·Drive·GitHub 통합 검색과 AI 회의록을 워크스페이스 문맥으로 처리',
    caution:'핵심 기능이 상위 플랜 중심이고 커스텀 에이전트는 크레딧 과금으로 전환됨',
    free:'부분무료', status:'active', url:'https://www.notion.com/product/ai' },

  { id:'m365-copilot', tags:'엑셀,워드,PPT,발표자료,메일,회의', name:'Microsoft 365 Copilot', vendor:'Microsoft', region:'글로벌', category:'오피스',
    use:'Word·Excel·Teams에 내장된 업무 AI',
    strength:'사내 문서·메일·회의 데이터에 직접 접근해 초안·요약·분석 생성',
    caution:'전체 기능은 별도 라이선스가 필요하고 요금 체계가 복잡함',
    free:'부분무료', status:'active', url:'https://www.microsoft.com/en-us/microsoft-365-copilot' },

  { id:'gamma', tags:'PPT,피피티,발표자료,슬라이드,제안서', name:'Gamma', vendor:'Gamma', region:'글로벌', category:'프레젠테이션',
    use:'프롬프트로 발표자료·웹페이지 생성',
    strength:'PPT·PDF·Google Slides로 내보내기가 되어 초안 속도가 빠름',
    caution:'무료는 크레딧이 적고 브랜딩 배지 제거·프리미엄 모델은 유료',
    free:'부분무료', status:'active', url:'https://gamma.app' },

  { id:'napkin', tags:'도표,다이어그램,인포그래픽,발표자료,시각화', name:'Napkin AI', vendor:'Napkin', region:'글로벌', category:'프레젠테이션',
    use:'텍스트를 다이어그램으로 자동 변환',
    strength:'글만 넣으면 플로차트·인포그래픽·데이터 차트로 바꿔 줌',
    caution:'무료는 주간 크레딧 제한이고 PPT·SVG 내보내기는 유료',
    free:'부분무료', status:'active', url:'https://www.napkin.ai' },

  /* ---------------- 자동화·분석 ---------------- */
  { id:'n8n', tags:'자동화,연동,워크플로우,RPA', name:'n8n', vendor:'n8n', region:'글로벌', category:'자동화',
    use:'오픈소스 워크플로우·AI 에이전트 구축',
    strength:'셀프호스팅이 가능하고 에이전트 추론 과정을 캔버스에서 단계별로 추적',
    caution:'노드·코드 개념 이해가 필요해 비개발자 진입장벽이 있음',
    free:'부분무료', status:'active', url:'https://n8n.io' },

  { id:'zapier', tags:'자동화,연동,워크플로우,RPA', name:'Zapier', vendor:'Zapier', region:'글로벌', category:'자동화',
    use:'9,000개 앱을 연결하는 AI 자동화',
    strength:'연동 앱 폭이 가장 넓고 MCP로 AI를 사내 앱에 직접 연결',
    caution:'태스크 과금이라 대량 실행 시 비용이 급증',
    free:'부분무료', status:'active', url:'https://zapier.com' },

  { id:'make', tags:'자동화,연동,워크플로우,RPA', name:'Make', vendor:'Make', region:'글로벌', category:'자동화',
    use:'시각적 캔버스 기반 AI 자동화',
    strength:'대화만으로 에이전트를 만들고 3,000개 이상 앱과 연동',
    caution:'오퍼레이션 단위 과금이라 고빈도 워크플로우의 비용 예측이 어려움',
    free:'부분무료', status:'active', url:'https://www.make.com' },

  { id:'manus', tags:'에이전트,자동화,대행', name:'Manus', vendor:'Manus', region:'글로벌', category:'자동화',
    use:'목표만 주면 끝까지 실행하는 범용 에이전트',
    strength:'발표자료·웹사이트·이미지 제작과 브라우저 자동화를 자율 수행',
    caution:'크레딧 소모형이고 장시간 자율 실행의 결과 검증 부담이 큼',
    free:'미확인', status:'active', url:'https://manus.im' },

  { id:'hex', tags:'BI,대시보드,SQL,데이터분석,리포트', name:'Hex', vendor:'Hex Technologies', region:'글로벌', category:'데이터분석',
    use:'데이터 웨어하우스 기반 AI 분석 노트북',
    strength:'쿼리·차트·연쇄 분석을 자동 작성하고 답변을 실제 데이터에 근거시킴',
    caution:'웨어하우스와 시맨틱 모델이 갖춰져야 효과가 남',
    free:'부분무료', status:'active', url:'https://hex.tech' },

  { id:'deepl', tags:'번역,논문번역,계약서', name:'DeepL', vendor:'DeepL(독일)', region:'글로벌', category:'번역',
    use:'논문·계약서용 고품질 한↔외 번역',
    strength:'문서 파일 서식을 유지한 채 통째로 번역, 격식 있는 장문에 안정적',
    caution:'무료는 글자 수·파일 수 제한이 있고 구어체 자연스러움은 파파고보다 약함',
    free:'부분무료', status:'active', url:'https://www.deepl.com/ko/translator' },

  /* ---------------- 국내 ---------------- */
  { id:'naver-ai-briefing', tags:'검색,맛집,장소,쇼핑,국내정보', name:'네이버 AI 브리핑 / AI탭', vendor:'네이버', region:'국내', category:'리서치',
    use:'네이버 검색창에서 바로 쓰는 AI 검색',
    strength:'블로그·카페·플레이스·쇼핑 등 국내 전용 데이터를 근거로 답하고 예약·구매까지 연결',
    caution:'심층 추론·장문 문서 작업은 전용 챗봇보다 약하고 근거가 네이버 콘텐츠에 편중됨',
    free:'무료', status:'active', url:'https://www.naver.com' },

  { id:'clovanote', tags:'회의록,녹취,속기,받아쓰기,STT,자막', name:'클로바노트', vendor:'네이버클라우드', region:'국내', category:'음성',
    use:'회의·강의 녹음을 한국어 텍스트로 변환',
    strength:'한국어 음성인식과 화자 분리가 안정적이고 한국식 회의 용어를 잘 처리',
    caution:'무료는 월 300~600분 제한, 다인 회의·잡음 환경에서 화자 분리 오류',
    free:'부분무료', status:'active', url:'https://clovanote.naver.com' },

  { id:'papago', tags:'번역,통역,외국어', name:'파파고', vendor:'네이버', region:'국내', category:'번역',
    use:'한국어 중심 텍스트·음성·이미지 번역',
    strength:'구어체·존댓말 처리와 사진 속 글자 번역이 자연스러움',
    caution:'긴 문서·전문 논문 번역은 DeepL 대비 약하고 웹 통번역 기능은 축소됨',
    free:'무료', status:'active', url:'https://papago.naver.com' },

  { id:'clova-studio', tags:'API,사내AI,망분리,공공', name:'클로바 스튜디오', vendor:'네이버클라우드', region:'국내', category:'API·개발',
    use:'하이퍼클로바X로 사내 AI 서비스 구축',
    strength:'국내 리전·국내 계약이라 공공·금융의 망분리와 개인정보 국외이전 이슈를 피함',
    caution:'개발 인력이 필요한 B2B 플랫폼이라 소상공인이 직접 쓰기 어려움',
    free:'부분무료', status:'active', url:'https://www.ncloud.com/product/aiService/clovaStudio' },

  { id:'clova-dubbing', tags:'더빙,나레이션,성우,자막', name:'클로바더빙', vendor:'네이버클라우드', region:'국내', category:'음성',
    use:'영상에 한국어 AI 목소리 입히기',
    strength:'약 100종의 한국어 보이스를 무료 구간에서 쓸 수 있어 진입장벽이 낮음',
    caution:'무료 사용 시 출처 표기가 필수이고 상업적 사용에 제한이 있음',
    free:'부분무료', status:'active', url:'https://www.ncloud.com/product/aiService/clovaDubbing' },

  { id:'naverworks-ai', tags:'메일,주간보고,사내문서,협업', name:'네이버웍스 AI 스튜디오', vendor:'네이버클라우드', region:'국내', category:'문서',
    use:'사내 자료 기반 맞춤 AI 비서 제작',
    strength:'코딩 없이 메일 초안·주간보고·파일 요약을 한국어 업무 문체로 생성',
    caution:'네이버웍스를 쓰지 않는 조직은 이용 불가, 요금 미공개',
    free:'미확인', status:'active', url:'https://naver.worksmobile.com/' },

  { id:'kanana', tags:'카카오톡,일정,요약,메신저', name:'카나나', vendor:'카카오', region:'국내', category:'범용대화',
    use:'카카오톡 맥락을 아는 대화형 AI 비서',
    strength:'단톡방 일정 조율·요약·리마인더를 한국 사용 패턴에 맞춰 처리',
    caution:'개인 일상·쇼핑 중심이라 기업 문서 작업에는 부족, 대화 학습 프라이버시 검토 필요',
    free:'무료', status:'active', url:'https://mate.kanana.ai/home' },

  { id:'adot', tags:'통화,녹음,통역,회의록', name:'에이닷', vendor:'SK텔레콤', region:'국내', category:'음성',
    use:'통화 녹음·요약·통역을 해주는 AI 비서',
    strength:'통신망에 직접 붙어 통화 요약과 통역콜, 고객센터 대기 대행을 제공',
    caution:'핵심 기능인 A.전화는 SKT 가입자 전용',
    free:'부분무료', status:'active', url:'https://adot.ai' },

  { id:'midm-k', tags:'오픈소스,국산모델,공공', name:'믿:음 K', vendor:'KT', region:'국내', category:'오픈모델',
    use:'한국 문화·제도를 학습한 기업용 한국어 LLM',
    strength:'오픈소스로 공개돼 국내 기업이 자체 서버에 올려 상업적으로 사용 가능',
    caution:'B2B·B2G 중심이라 일반 사용자용 챗봇이 없고 글로벌 프런티어와 성능 격차가 있음',
    free:'부분무료', status:'active', url:'https://huggingface.co/K-intelligence' },

  { id:'exaone', tags:'오픈소스,국산모델,파인튜닝', name:'엑사원 / 챗엑사원', vendor:'LG AI연구원', region:'국내', category:'오픈모델',
    use:'무료로 받아 쓰는 국산 오픈소스 AI 모델',
    strength:'특허·제조·화학 등 산업 도메인에 강하고 외부 유출 없이 한국어 파인튜닝 가능',
    caution:'ChatEXAONE은 기업 대상이라 개인 가입 불가, 상용 시 라이선스 확인 필요',
    free:'부분무료', status:'active', url:'https://www.lgresearch.ai/exaone/' },

  { id:'wrtn', tags:'무료,블로그,이력서,PPT,자소서', name:'뤼튼', vendor:'뤼튼테크놀로지스', region:'국내', category:'범용대화',
    use:'해외 상용 모델을 무료로 쓰는 한국형 AI 창구',
    strength:'이력서·PPT·블로그 등 한국 실무 양식 템플릿이 있고 요금제 없이 무료',
    caution:'무료 정책이 바뀔 수 있고 모델 선택·컨텍스트 제어가 원 서비스보다 제한적',
    free:'무료', status:'active', url:'https://wrtn.ai' },

  { id:'upstage', tags:'OCR,문서인식,파싱,RAG', name:'업스테이지 Solar / Document Parse', vendor:'업스테이지', region:'국내', category:'API·개발',
    use:'한국어 문서를 AI가 읽게 만드는 API',
    strength:'복잡한 한국식 표·양식 문서를 좌표까지 살려 변환, 국내 RAG 구축에 유리',
    caution:'개발자용 API라 비개발자가 바로 쓰기 어렵고 페이지 단위 종량 과금',
    free:'부분무료', status:'active', url:'https://www.upstage.ai/' },

  { id:'liner', tags:'논문,학술,리서치,출처,선행연구', name:'라이너 / 라이너 스콜라', vendor:'라이너', region:'국내', category:'학술',
    use:'문장별 출처가 붙는 AI 검색·논문 리서치',
    strength:'영문 논문의 한국어 요약이 자연스럽고 선행연구 비교·실험설계 검토를 지원',
    caution:'무료는 월 크레딧이 적고 학술 기능을 제대로 쓰려면 유료 전환 필요',
    free:'부분무료', status:'active', url:'https://liner.com' },

  { id:'hancom-assistant', tags:'한글,HWP,공문,기안문,보고서,관공서', name:'한컴어시스턴트', vendor:'한글과컴퓨터', region:'국내', category:'문서',
    use:'한글(HWP) 문서를 AI로 쓰고 고치기',
    strength:'관공서 제출용 HWP 양식을 유지한 채 초안 작성·요약·교정, 글로벌 도구가 대체 못 하는 영역',
    caution:'한컴오피스 2024 이상 설치 환경이 필요하고 무료 등급은 일 10회 제한',
    free:'부분무료', status:'active', url:'https://www.hancomassistant.com/' },

  { id:'hancom-docs-ai', tags:'한글,HWP,공문,문서,협업', name:'한컴독스 AI', vendor:'한글과컴퓨터', region:'국내', category:'문서',
    use:'브라우저에서 HWP 문서를 AI로 편집',
    strength:'설치 없이 웹에서 HWP·DOCX를 열어 문장·목차·표 생성과 번역 처리',
    caution:'무료·유료 구분이 공식 안내에 명확하지 않아 도입 전 요금 확인 필요',
    free:'미확인', status:'active', url:'https://www.hancomdocs.com/ko/' },

  { id:'douzone-oneai', tags:'회계,세무,ERP,급여,전표', name:'ONE AI', vendor:'더존비즈온', region:'국내', category:'회계·ERP',
    use:'ERP 데이터를 읽는 회계·세무 AI 비서',
    strength:'더존 ERP와 직접 연동돼 회계·인사 데이터를 근거로 답하고 한국 세법 기반 세무 지원',
    caution:'더존 ERP 고객 위주이고 가격이 비공개라 상담이 필요',
    free:'유료', status:'active', url:'https://www.douzone.com/product/oneai.jsp' },

  { id:'cashnote-ai', tags:'리뷰,댓글,평판,고객관리', name:'캐시노트 AI 리뷰관리', vendor:'한국신용데이터', region:'국내', category:'마케팅',
    use:'악성 리뷰를 걸러내고 답글까지 작성',
    strength:'리뷰를 감정 수위로 분류하고 네 가지 톤의 한국어 답글을 제안',
    caution:'지원 리뷰 플랫폼 범위와 요금이 공식 자료에 미공개',
    free:'미확인', status:'active', url:'https://cashnote.kr' },

  { id:'channeltalk-alf', tags:'챗봇,상담,고객응대,CS,문의', name:'채널톡 알프', vendor:'채널코퍼레이션', region:'국내', category:'상담',
    use:'반복 문의를 자동 응대하는 AI 상담원',
    strength:'카카오톡·네이버 톡톡·인스타 DM을 한 번에 물고 원화 결제·부가세까지 국내 기준',
    caution:'대화 건당 종량 과금이라 문의량이 많으면 비용이 급증',
    free:'부분무료', status:'active', url:'https://channel.io/ko' },

  { id:'dbpia-ai', tags:'논문,학술,문헌,선행연구', name:'디비피아 AI', vendor:'누리미디어', region:'국내', category:'학술',
    use:'국내 논문을 AI로 검색·요약·번역',
    strength:'국내 학술지 커버리지가 글로벌 도구와 비교되지 않고 본문까지 읽어 인용',
    caution:'딥리서치는 월 10회 무료이며 무제한은 소속 기관 구독에 좌우됨',
    free:'부분무료', status:'active', url:'https://dbpia.ai' },

  { id:'riss', tags:'논문,학위논문,학술,문헌', name:'RISS', vendor:'한국교육학술정보원', region:'국내', category:'학술',
    use:'국내 학위논문·학술지 무료 통합 검색',
    strength:'대국민 무료로 국내 학위논문과 학술지를 통합 검색·원문 제공',
    caution:'생성형 AI 요약 기능의 범위는 미확인, 원문 열람은 기관 인증에 따라 제한',
    free:'무료', status:'active', url:'https://www.riss.kr' },

  { id:'edibot', tags:'상세페이지,쇼핑몰,이커머스,상품등록', name:'에디봇 / 에디봇핏', vendor:'카페24', region:'국내', category:'마케팅',
    use:'상품 사진만 올리면 상세페이지 자동 완성',
    strength:'이미지를 자동 분류·배치하고 오픈마켓 연동과 영·중·일 번역까지 붙음',
    caution:'카페24 쇼핑몰 계정이 전제이고 템플릿 기반이라 고유 디자인 표현은 제한적',
    free:'무료', status:'active', url:'https://store.cafe24.com/kr/apps/795' },

  { id:'vcat', tags:'광고영상,릴스,숏폼,배너,소재', name:'브이캣', vendor:'파이온코퍼레이션', region:'국내', category:'마케팅',
    use:'상품 URL만 넣으면 광고 영상 자동 생성',
    strength:'국내 쇼핑몰 URL을 붙여넣으면 릴스·틱톡·배너 규격으로 자동 편집',
    caution:'템플릿 기반이라 소재가 비슷해지기 쉽고 무료는 워터마크 등 제약',
    free:'부분무료', status:'active', url:'https://vcat.ai/' },

  { id:'typecast', tags:'성우,나레이션,더빙,TTS,음성합성', name:'타입캐스트', vendor:'네오사피엔스', region:'국내', category:'음성',
    use:'한국어 AI 성우로 내레이션 제작',
    strength:'700종 이상 한국어 캐릭터의 감정·운율 조절이 가능해 억양이 자연스러움',
    caution:'무료는 월 5분 수준이라 실무는 유료 전환 필요, 최신 요금 재확인 권장',
    free:'부분무료', status:'active', url:'https://typecast.ai/kr' },

  /* ---------------- 종료·단종 (추천 제외, 도감에만 표시) ---------------- */
  { id:'sora', name:'Sora', vendor:'OpenAI', region:'글로벌', category:'영상',
    use:'(종료) 텍스트 기반 영상 생성',
    strength:'—',
    caution:'웹·앱 서비스가 2026-04-26 종료되고 API도 2026-09-24 종료 예정. 대안: Runway, Veo/Omni, Kling',
    free:'—', status:'ended', url:'https://help.openai.com/en/articles/20001152-what-to-know-about-the-sora-discontinuation' },

  { id:'imagen', name:'Imagen', vendor:'Google', region:'글로벌', category:'이미지',
    use:'(종료) 구글 전용 이미지 생성 모델',
    strength:'—',
    caution:'전 모델 폐지되어 2026-08-17부터 순차 종료. 대안: Gemini Image(Nano Banana)',
    free:'—', status:'ended', url:'https://firebase.google.com/docs/ai-logic/imagen-models-migration' },

  { id:'gemini-cli', name:'Gemini CLI', vendor:'Google', region:'글로벌', category:'코딩',
    use:'(통합 종료) 터미널용 Gemini 도구',
    strength:'—',
    caution:'2026-06-18 소비자 요청 처리를 중단하고 Antigravity CLI로 통합. 대안: Antigravity',
    free:'—', status:'ended', url:'https://antigravity.google' },

  { id:'clova-x', name:'CLOVA X / Cue:', vendor:'네이버', region:'국내', category:'범용대화',
    use:'(종료) 네이버의 대화형 AI 서비스',
    strength:'—',
    caution:'2026-04-09 서비스 종료, 네이버 AI 브리핑·AI탭으로 흡수됨. HyperCLOVA X는 B2B 모델로 전환',
    free:'—', status:'ended', url:'https://www.naver.com' }
];

/* 정부·공공 AI 도입 지원 제도 (2026-09-05 확인)
   ※ 연간 공고제이므로 "제도"가 아니라 "그 해 공고"를 봐야 함.
     2026년 주요 사업은 상반기~7월에 대부분 마감됨. */
window.AI_SUPPORT_PROGRAMS = [
  { name:'소상공인 AI 상생협업교육', org:'중기부·소진공', state:'접수 가능(추정)',
    detail:'참가비 0원 국비 교육 + AI 구독권·광고·컨설팅 등 상생 혜택, 전국 5,000명',
    note:'소상공인 지식배움터 사전교육 이수가 조건, 정확한 마감일 미확인',
    url:'https://www.sbiz24.kr' },
  { name:'AI 활용 우수사례 공모', org:'중기부·중진공', state:'2026-09-21 접수 중',
    detail:'AI 도입 성과 기업 10개사 선정, 장관상·기술개발 지원사업 우대',
    note:'관할 지방중소벤처기업청에 이메일 제출',
    url:'https://www.mss.go.kr' },
  { name:'AI 통합 바우처 지원사업', org:'과기정통부·NIPA', state:'2026년분 마감',
    detail:'수요기업에 최대 2억원 바우처, 공급기업과 컨소시엄 신청',
    note:'2026년 접수는 3월 종료. 2027년 공고 대기',
    url:'https://www.nipa.kr' },
  { name:'혁신 소상공인 AI 활용지원', org:'중기부·창조경제혁신센터', state:'2026년분 마감(7/3)',
    detail:'AI 역량진단·컨설팅 후 680개사에 최대 4,000만원(정부 80%)',
    note:'2027년 공고 대기',
    url:'https://aiplusinnovation.kr/' },
  { name:'스마트상점 기술보급사업', org:'중기부·소진공', state:'2026년분 마감(4/1)',
    detail:'키오스크·테이블오더·경영관리 SW 도입 지원',
    note:'2027년 공고 대기',
    url:'https://www.sbiz24.kr' },
  { name:'지자체 디지털·AI 전환 지원', org:'각 지자체', state:'상시(예산 소진 시까지)',
    detail:'지역별로 최대 100만원 내외의 디지털 전환 비용·컨설팅 지원',
    note:'기업마당에서 "지역명 + AI/디지털"로 검색',
    url:'https://www.bizinfo.go.kr' }
];
