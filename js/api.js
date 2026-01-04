/**
 * Gemini API 통신 모듈
 */
import { store } from './store.js';

export async function generateStudyPlan() {
    const { apiKey, skills } = store.state;
    if (!apiKey) throw new Error("API Key가 없습니다.");

    const prompt = `
    나는 ADHD가 있고 의지가 조금 부족한 그림 초보자야. 내 실력은 다음과 같아: ${JSON.stringify(skills)}.
    나를 위해 동기부여가 되는 따뜻한 말투의 튜터가 되어줘.
    
    다음 두 가지를 포함한 JSON 형식으로만 답변해줘 (마크다운 없이 순수 JSON):
    1. "feedback": 내 현재 상태에 대한 짧은 분석과 격려 (한글)
    2. "tasks": 오늘 할 수 있는 재미있고 구체적인 3가지 그림 과제 리스트. 각 과제는 {"id": 1, "title": "제목", "desc": "상세설명", "type": "드로잉|크로키|이론"} 형태여야 해.
    
    과제는 15분 내로 끝낼 수 있는 부담 없는 것으로 해줘.
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        
        // JSON 파싱 (마크다운 백틱 제거 처리)
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '');
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Gemini API Error:", error);
        alert("AI 플랜 생성 중 오류가 발생했습니다. API 키를 확인해주세요.");
        return null;
    }
}
