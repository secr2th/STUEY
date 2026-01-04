/**
 * Gemini API 통신 모듈 (SDK 사용)
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { store } from './store.js';

export async function generateStudyPlan(apiKey, skills) {
    if (!apiKey) throw new Error("API Key가 누락되었습니다.");

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // JSON 모드를 지원하는 최신 모델 사용
        const model = genAI.getModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
        나는 ADHD 성향이 있고 그림 실력을 늘리고 싶은 성인 여성이다.
        나의 현재 실력 평가: ${JSON.stringify(skills)}
        
        나에게 맞는 '오늘의 학습 플랜'을 JSON 형식으로 작성해라.
        격려하는 따뜻한 말투의 피드백과, 구체적이고 재미있는 짧은 과제 3개를 줘.
        
        JSON 스키마:
        {
            "feedback": "문자열 (격려와 분석 멘트)",
            "tasks": [
                { "id": 1, "title": "제목", "desc": "상세설명", "type": "드로잉/크로키/이론 중 택1" }
            ]
        }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        // 결과 파싱
        return JSON.parse(text);

    } catch (error) {
        console.error("Gemini API Error:", error);
        // 에러 내용을 구체적으로 던짐
        if (error.message.includes('API key')) {
            throw new Error("API 키가 잘못되었습니다. 키를 확인해주세요.");
        }
        throw new Error("AI 연결 실패: " + error.message);
    }
}
        console.error("Gemini API Error:", error);
        alert("AI 플랜 생성 중 오류가 발생했습니다. API 키를 확인해주세요.");
        return null;
    }
}
