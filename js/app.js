import { store } from './store.js';
import { generateStudyPlan } from './api.js';
import * as UI from './ui.js';
import { PomodoroTimer } from './utils.js'; // utils는 기존 코드 사용

document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    store.checkStreak();
    UI.applyTheme();
    UI.renderHeader();

    // 시작 화면 분기
    if (store.state.isOnboarded) {
        showDashboard();
    } else {
        showOnboarding();
    }

    setupEventListeners();
}

function showDashboard() {
    switchView('view-dashboard');
    UI.renderTasks();
    UI.renderChart(); // 차트 그리기
    if (store.state.aiFeedback) {
        document.getElementById('ai-feedback').innerText = store.state.aiFeedback;
    }
}

function showOnboarding() {
    switchView('view-onboarding');
    // API 키가 있으면 미리 채워줌
    if(store.state.apiKey) {
        document.getElementById('api-key-input').value = store.state.apiKey;
    }
    UI.createSkillForm(); // 폼 생성
}

async function handleAnalysis() {
    const apiKey = document.getElementById('api-key-input').value.trim();
    if (!apiKey) return alert("API Key를 입력해주세요!");

    // 폼 데이터 수집
    const form = document.getElementById('skill-form');
    const skills = {};
    form.querySelectorAll('select').forEach(sel => skills[sel.name] = sel.value);

    // 로딩 시작
    UI.toggleLoading(true, "AI가 작가님의 실력을 분석하고 있어요...🎨");

    try {
        // API 호출
        const result = await generateStudyPlan(apiKey, skills);
        
        // 성공 시 데이터 저장
        store.setApiKey(apiKey);
        store.updateSkills(skills); // 여기서 isOnboarded = true 됨
        store.state.tasks = result.tasks;
        store.state.aiFeedback = result.feedback;
        store.save();

        // 대시보드로 이동
        showDashboard();

    } catch (error) {
        alert(error.message); // 에러 메시지 출력
        console.error(error);
    } finally {
        // 성공하든 실패하든 로딩 끄기 (버그 해결)
        UI.toggleLoading(false);
    }
}

function setupEventListeners() {
    // 분석 시작 버튼
    document.getElementById('btn-start-analysis').addEventListener('click', handleAnalysis);

    // 재평가 버튼 (설정 탭)
    document.getElementById('btn-reassess').addEventListener('click', () => {
        if(confirm("기존 플랜이 초기화되고 새로운 플랜을 짭니다. 계속할까요?")) {
            showOnboarding(); // 온보딩 화면으로 강제 이동
        }
    });

    // 네비게이션
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            const target = e.currentTarget.dataset.target;
            switchView(target);
            
            if (target === 'view-settings') UI.renderColorPalette();
        });
    });

    // 타이머 등 기타 기능 (기존 유지)
    const timerDisplay = document.querySelector('.timer-display');
    const timer = new PomodoroTimer(timerDisplay);
    document.getElementById('btn-timer-toggle').addEventListener('click', () => {
        timer.toggle();
    });
    
    // 초기화
    document.getElementById('btn-reset').addEventListener('click', () => {
        if(confirm("정말 초기화하시겠습니까?")) store.reset();
    });
}

function switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
}
