import streamlit as st
import json
import os
from google import genai
from google.genai import types

# -------------------------------------------------------------
# 1. 제작자 API 키 설정 (보안 관리)
# -------------------------------------------------------------
# 로컬 테스트 시에는 아래 따옴표 안에 키를 적으셔도 되며, 
# Streamlit Cloud 배포 시에는 Secrets 설정의 GEMINI_API_KEY를 자동으로 읽어옵니다.
DEFAULT_API_KEY = "여기에_제작자_GEMINI_API_키를_입력하세요"

API_KEY = (
    st.secrets.get("GEMINI_API_KEY", None)
    if hasattr(st, "secrets") and "GEMINI_API_KEY" in st.secrets
    else os.environ.get("GEMINI_API_KEY", DEFAULT_API_KEY)
)

st.set_page_config(
    page_title="Google AI 파이프라인 아키텍트",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="expanded"
)

# -------------------------------------------------------------
# 2. 모던 화이트 테마 CSS
# -------------------------------------------------------------
st.markdown("""
<style>
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
    * { font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; }
    
    .stApp { background-color: #FFFFFF; color: #202124; }
    
    .header-box {
        background: linear-gradient(135deg, #1A73E8 0%, #1557B0 100%);
        color: white;
        padding: 28px 32px;
        border-radius: 12px;
        margin-bottom: 24px;
        box-shadow: 0 4px 12px rgba(26, 115, 232, 0.15);
    }
    .header-box h1 { color: #FFFFFF !important; font-size: 24px; font-weight: 700; margin: 0 0 8px 0; }
    .header-box p { color: #E8F0FE; margin: 0; font-size: 14px; line-height: 1.5; }
    
    .step-card {
        background: #FFFFFF;
        border: 1px solid #E8EAED;
        border-radius: 10px;
        padding: 20px 24px;
        margin-bottom: 16px;
        box-shadow: 0 1px 3px rgba(60,64,67, 0.08);
        transition: border-color 0.2s ease;
    }
    .step-card:hover { border-color: #1A73E8; }
    
    .badge-tool {
        display: inline-block;
        background-color: #E8F0FE;
        color: #1A73E8;
        font-weight: 600;
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 20px;
        margin-bottom: 10px;
    }
</style>
""", unsafe_allow_html=True)

# -------------------------------------------------------------
# 3. 사이드바 (사용자 안내용)
# -------------------------------------------------------------
with st.sidebar:
    st.title("🌐 서비스 안내")
    st.markdown("""
    본 서비스는 **Google 최신 AI 생태계**를 활용해 어떤 프로젝트든 **가장 빠른 실행 파이프라인과 실전 프롬프트**를 맞춤 설계해 드리는 업무 자동화 도구입니다.
    
    별도의 API 키 입력 없이 누구나 즉시 무료로 이용하실 수 있습니다.
    
    ---
    **주요 연동 도구:**
    - 💡 **Gemini / Deep Research**: 탐색 & 기획
    - 📚 **NotebookLM**: 출처 기반 팩트 검증
    - 📊 **Google Colab & Sheets**: 수치 분석
    - ⚙️ **AI Studio & Antigravity**: 앱/MVP 개발
    - 🎬 **Veo / Flow & Vids**: 미디어 영상 제작
    """)

# -------------------------------------------------------------
# 4. 메인 화면 헤더 & 입력부
# -------------------------------------------------------------
st.markdown("""
<div class="header-box">
    <h1>🚀 Google AI 파이프라인 맞춤형 설계 아키텍트</h1>
    <p>해결하고 싶은 과업이나 프로젝트 목표를 입력하세요. 구글 AI 풀스택 도구를 조합한 최적의 6단계 실행 로드맵과 바로 복사해 쓰는 맞춤 프롬프트를 원클릭으로 설계해 드립니다.</p>
</div>
""", unsafe_allow_html=True)

preset = st.radio(
    "💡 추천 예시 선택 (클릭 시 자동 입력)",
    ["직접 입력", "중기부 '모두의 창업 시즌 2' 3주 완성 지원", "학술 논문 50편 기반 메타 분석 및 연구계획서", "실시간 금융 데이터 모니터링 웹 대시보드 구축"],
    horizontal=True
)

default_text = "중기부 '모두의 창업 시즌 2'에 지원하려고 해. 비개발자이고 3주 안에 사업계획서와 데모 앱 링크, 1분 소개 영상을 준비해야 해."
if preset == "학술 논문 50편 기반 메타 분석 및 연구계획서":
    default_text = "ESG 평가 지표와 우리사주제도의 상관관계에 대한 국내외 논문 50편을 교차 분석하고 연구계획서와 실증 모형을 설계하고 싶어."
elif preset == "실시간 금융 데이터 모니터링 웹 대시보드 구축":
    default_text = "실시간 종목 랭킹 및 호가 데이터를 수집해 Streamlit 기반의 대시보드를 구축하고, 이상치 탐지 로직을 연동하고 싶어."

user_input = st.text_area("프로젝트 목표, 기간, 희망 산출물 및 요구사항을 작성해 주세요:", value=default_text, height=110)

# -------------------------------------------------------------
# 5. 실행 및 백엔드 AI 호출
# -------------------------------------------------------------
if st.button("✨ 최적 구글 AI 파이프라인 생성하기", type="primary", use_container_width=True):
    if not API_KEY or API_KEY == "여기에_제작자_GEMINI_API_키를_입력하세요":
        st.error("서버에 Gemini API 키가 설정되지 않았습니다. 관리자에게 문의해 주세요.")
    elif not user_input.strip():
        st.warning("프로젝트 목표를 입력해 주세요.")
    else:
        with st.spinner("구글 AI 전문가 엔진이 프로젝트에 최적화된 파이프라인을 설계 중입니다..."):
            try:
                client = genai.Client(api_key=API_KEY)
                
                system_instruction = """
                너는 구글 AI 도구 생태계(Gemini, NotebookLM, Colab, AI Studio, Antigravity, Jules, Opal, Imagen, Veo, Workspace)의 아키텍처 설계 최고 전문가다.
                사용자의 프로젝트 목표를 분석하여 [탐색 -> 팩트 검증 -> 데이터/수치 분석 -> 문서화 -> 시제품 개발 -> 미디어/피칭]에 맞춘 최적의 구글 AI 툴 연동 파이프라인을 설계하라.
                반드시 아래 JSON 스키마 규격으로만 응답하라.
                {
                  "project_title": "프로젝트 제목",
                  "recommended_flow": ["도구1", "도구2"],
                  "pipeline_steps": [
                    {
                      "step_number": 1,
                      "step_name": "단계 명칭",
                      "tool_name": "구글 도구명",
                      "core_objective": "목표",
                      "action_guide": "작업 지침",
                      "ready_to_use_prompt": "해당 도구에 복사해 넣을 정밀 프롬프트 전문",
                      "expected_deliverable": "산출물"
                    }
                  ],
                  "quality_checklist": [
                    {"checkpoint": "검증 항목", "validation_tool": "검증 도구"}
                  ]
                }
                """
                
                response = None
                last_err = None
                for model_candidate in ["gemini-2.5-flash", "gemini-2.0-flash"]:
                    try:
                        response = client.models.generate_content(
                            model=model_candidate,
                            contents=user_input,
                            config=types.GenerateContentConfig(
                                system_instruction=system_instruction,
                                temperature=0.2,
                                response_mime_type="application/json"
                            )
                        )
                        if response and response.text:
                            break
                    except Exception as e:
                        last_err = e
                        continue
                
                if not response or not response.text:
                    raise ValueError(f"AI 모델 호출 실패: {str(last_err)}")
                
                result_data = json.loads(response.text)
                
                st.success("✅ 최적의 실행 파이프라인 설계가 완료되었습니다!")
                
                # 추천 흐름 표시
                st.subheader(f"📋 {result_data.get('project_title', '프로젝트 로드맵')}")
                flows = result_data.get("recommended_flow", [])
                if flows:
                    f_cols = st.columns(len(flows))
                    for idx, flow in enumerate(flows):
                        f_cols[idx].info(f"**Step {idx+1}**\n\n{flow}")
                
                st.markdown("---")
                
                # 단계별 상세 카드
                st.subheader("🛠️ 단계별 실행 매뉴얼 & 실전 프롬프트")
                for step in result_data.get("pipeline_steps", []):
                    st.markdown(f"""
                    <div class="step-card">
                        <span class="badge-tool">{step.get('tool_name')}</span>
                        <h4 style="margin: 4px 0 10px 0;">Step {step.get('step_number')}. {step.get('step_name')}</h4>
                        <p><strong>🎯 핵심 목표:</strong> {step.get('core_objective')}</p>
                        <p><strong>📝 작업 가이드:</strong> {step.get('action_guide')}</p>
                        <p><strong>📦 최종 산출물:</strong> {step.get('expected_deliverable')}</p>
                    </div>
                    """, unsafe_allow_html=True)
                    st.caption("👇 해당 도구에 바로 복사해 넣을 프롬프트 전문:")
                    st.code(step.get("ready_to_use_prompt", ""), language="markdown")
                
                st.markdown("---")
                
                # 체크리스트
                st.subheader("✅ 최종 제출 전 품질 검수 체크리스트")
                checklists = result_data.get("quality_checklist", [])
                if checklists:
                    c_cols = st.columns(len(checklists) if len(checklists) <= 4 else 2)
                    for c_idx, check in enumerate(checklists):
                        with c_cols[c_idx % len(c_cols)]:
                            st.checkbox(
                                f"**{check.get('checkpoint')}**",
                                help=f"권장 검증 도구: {check.get('validation_tool')}"
                            )
                
                st.markdown("---")
                
                # 마크다운 작업계획서 다운로드
                md_content = f"# {result_data.get('project_title', 'Google AI 파이프라인 계획서')}\n\n"
                if flows:
                    md_content += f"## 추천 연동 흐름\n" + " ➔ ".join(flows) + "\n\n---\n\n"
                for step in result_data.get("pipeline_steps", []):
                    md_content += f"### Step {step.get('step_number')}. {step.get('step_name')} ({step.get('tool_name')})\n"
                    md_content += f"- **핵심 목표:** {step.get('core_objective')}\n"
                    md_content += f"- **작업 가이드:** {step.get('action_guide')}\n"
                    md_content += f"- **최종 산출물:** {step.get('expected_deliverable')}\n\n"
                    md_content += f"```markdown\n{step.get('ready_to_use_prompt', '')}\n```\n\n---\n\n"
                
                st.download_button(
                    label="📄 전체 작업계획서 마크다운(.md) 다운로드",
                    data=md_content,
                    file_name="google_ai_pipeline_plan.md",
                    mime="text/markdown",
                    use_container_width=True
                )
                
            except Exception as e:
                st.error(f"처리 중 예외 발생: {str(e)}")
