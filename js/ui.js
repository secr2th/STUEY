import { store } from './store.js';

let radarChart = null; // 차트 인스턴스

export function renderHeader() {
    document.getElementById('user-level').textContent = store.state.level;
    document.getElementById('user-points').textContent = store.state.points;
    document.getElementById('user-streak').textContent = store.state.streak;
}

export function applyTheme() {
    document.documentElement.style.setProperty('--primary-color', store.state.themeColor);
    // 차트 색상도 업데이트를 위해 다시 그리기
    if(store.state.isOnboarded) renderChart();
}

// ✅ 레이더 차트 그리기
export function renderChart() {
    const ctx = document.getElementById('skillChart').getContext('2d');
    const { labels, data } = store.getSkillScores();
    const color = store.state.themeColor;

    if (radarChart) radarChart.destroy(); // 기존 차트 삭제

    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: '현재 실력',
                data: data,
                backgroundColor: color + '33', // 투명도 20%
                borderColor: color,
                pointBackgroundColor: color,
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: { display: true },
                    suggestedMin: 0,
                    suggestedMax: 5, // 최대 점수
                    ticks: { display: false } // 숫자 숨김
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// ✅ 컬러 팔레트 생성 (못생긴 color input 대체)
export function renderColorPalette() {
    const palette = document.getElementById('color-palette');
    const colors = ['#3182f6', '#f04452', '#33c759', '#ffb300', '#8e44ad', '#2c3e50'];
    
    palette.innerHTML = '';
    colors.forEach(c => {
        const btn = document.createElement('div');
        btn.className = 'color-swatch';
        btn.style.backgroundColor = c;
        if (store.state.themeColor === c) btn.classList.add('selected');
        
        btn.addEventListener('click', () => {
            store.state.themeColor = c;
            store.save();
            applyTheme();
            renderColorPalette(); // 선택 상태 갱신
        });
        palette.appendChild(btn);
    });
}

// 폼 생성 및 기존 데이터 채우기 (수정 모드 지원)
export function createSkillForm() {
    const categories = ['인체/해부학', '원근법/투시', '명암/빛', '색채학', '구도/연출', '디지털툴'];
    const form = document.getElementById('skill-form');
    form.innerHTML = '';
    
    categories.forEach(cat => {
        const val = store.state.skills[cat] || '입문'; // 기존 값 있으면 사용
        const div = document.createElement('div');
        div.className = 'form-group';
        div.innerHTML = `
            <label>${cat}</label>
            <select name="${cat}">
                <option value="입문" ${val==='입문'?'selected':''}>입문 (Lv.1)</option>
                <option value="초급" ${val==='초급'?'selected':''}>초급 (Lv.2)</option>
                <option value="중급" ${val==='중급'?'selected':''}>중급 (Lv.3)</option>
                <option value="고급" ${val==='고급'?'selected':''}>고급 (Lv.4)</option>
            </select>
        `;
        form.appendChild(div);
    });
}

// 로딩 화면 제어
export function toggleLoading(show, text="AI가 생각 중입니다...") {
    const el = document.getElementById('loading-overlay');
    document.getElementById('loading-text').innerText = text;
    if(show) el.classList.remove('hidden');
    else el.classList.add('hidden');
}

// 과제 렌더링 (기존과 동일하되 디자인 살짝 수정)
export function renderTasks() {
    const list = document.getElementById('daily-tasks');
    list.innerHTML = '';
    if (!store.state.tasks?.length) return;

    store.state.tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        // (생략: 기존 체크박스 로직 동일)
        li.innerHTML = `
            <input type="checkbox" class="task-check">
            <div class="task-content">
                <span class="task-title">${task.title}</span>
                <span class="task-desc">${task.desc}</span>
            </div>
            <span class="task-tag">${task.type}</span>
        `;
        list.appendChild(li);
    });
}
