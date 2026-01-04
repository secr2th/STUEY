/**
 * 메인 어플리케이션 진입점
 */
import { store } from './store.js';
import { generateStudyPlan } from './api.js';
import { PomodoroTimer } from './utils.js';
import * as UI from './ui.js';

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // 1. 상태에 따른 화면 분기
    store.checkStreak();
    UI.applyTheme();
    UI.renderHeader();

    if (store.state.isOnboarded) {
        switchView('view-dashboard');
        UI.renderTasks();
        if (store.state.aiFeedback) {
            document.getElementById('ai-feedback').innerText = store.state.aiFeedback;
        }
    } else {
        switchView('view-onboarding');
        UI.createSkillForm();
    }

    // 2. 이벤트 리스너 등록
    setupEventListeners();
}

function setupEventListeners() {
    // 네비게이션
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.currentTarget.dataset.target;
            
            // UI 업데이트
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            // 뷰 전환
            switchView(targetId);
            
            if (targetId === 'view-gallery') UI.renderGallery();
        });
    });

    // 온보딩: 분석 시작
    document.getElementById('btn-start-analysis').addEventListener('click', async () => {
        const apiKey = document.getElementById('api-key-input').value;
        if (!apiKey) return alert("API Key를 입력해주세요!");

        // 폼 데이터 수집
        const form = document.getElementById('skill-form');
        const formData = new FormData(form); // Form 태그가 필요함.
        const skills = {};
        // select 요소들을 순회하며 수집
        form.querySelectorAll('select').forEach(sel => {
            skills[sel.name] = sel.value;
        });

        // 저장
        store.setApiKey(apiKey);
        store.updateSkills(skills);

        // 로딩 표시
        const btn = document.getElementById('btn-start-analysis');
        btn.innerText = "AI가 맞춤 커리큘럼을 짜는 중... 🧠";
        btn.disabled = true;

        // API 호출
        const result = await generateStudyPlan();
        if (result) {
            store.state.tasks = result.tasks;
            store.state.aiFeedback = result.feedback;
            store.save();
            location.reload(); // 새로고침하여 대시보드로 이동
        } else {
            btn.innerText = "분석 및 플랜 생성";
            btn.disabled = false;
        }
    });

    // 타이머
    const timerDisplay = document.querySelector('.timer-display');
    const timer = new PomodoroTimer(timerDisplay);
    document.getElementById('btn-timer-toggle').addEventListener('click', (e) => {
        const isRunning = timer.toggle();
        const icon = e.currentTarget.querySelector('span');
        icon.innerText = isRunning ? 'pause' : 'play_arrow';
    });

    // 갤러리 업로드
    const fileInput = document.getElementById('file-input');
    document.getElementById('btn-upload-art').addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                store.addGalleryItem({
                    id: Date.now(),
                    date: new Date().toLocaleDateString(),
                    data: event.target.result
                });
                UI.renderGallery();
                store.addPoints(50); // 그림 업로드 시 대량 포인트
                alert("그림 저장 완료! +50 포인트 🎉");
            };
            reader.readAsDataURL(file);
        }
    });

    // 설정: 테마 변경
    document.getElementById('theme-color-picker').addEventListener('input', (e) => {
        store.setTheme(e.target.value);
        UI.applyTheme();
    });
    
    // 설정: 폰트 변경 (동적 로딩)
    document.getElementById('font-url-input').addEventListener('change', (e) => {
        const url = e.target.value;
        if(url) {
            const link = document.createElement('link');
            link.href = url;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
            // URL에서 font-family 이름 추출은 복잡하므로 예시로 전체 적용
            document.body.style.fontFamily = 'cursive, sans-serif'; 
            alert("폰트가 적용되었습니다! (일부 폰트는 CSS 이름 지정 필요)");
        }
    });

    // 설정: 초기화
    document.getElementById('btn-reset').addEventListener('click', () => {
        if(confirm("정말 모든 데이터를 삭제하시겠습니까?")) store.reset();
    });
}

function switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
}
