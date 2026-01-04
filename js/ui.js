/**
 * UI 렌더링 모듈
 */
import { store } from './store.js';

export function renderHeader() {
    document.getElementById('user-level').textContent = store.state.level;
    document.getElementById('user-points').textContent = store.state.points;
    document.getElementById('user-streak').textContent = store.state.streak;
}

export function applyTheme() {
    document.documentElement.style.setProperty('--primary-color', store.state.themeColor);
}

export function renderTasks() {
    const list = document.getElementById('daily-tasks');
    list.innerHTML = '';
    
    // 저장된 태스크가 없으면 안내 문구
    if (!store.state.tasks || store.state.tasks.length === 0) {
        list.innerHTML = '<li style="text-align:center; color:#888;">AI가 오늘의 과제를 준비 중입니다...</li>';
        return;
    }

    store.state.tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        // 완료 여부(임시)는 로컬스토리지 구조 확장이 필요하나, 간단히 UI만 구현
        li.innerHTML = `
            <input type="checkbox" class="task-check" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <span class="task-title">${task.title}</span>
                <span class="task-desc">${task.desc}</span>
            </div>
            <span style="font-size:12px; background:#eee; padding:2px 6px; border-radius:4px;">${task.type}</span>
        `;
        
        // 체크박스 이벤트
        li.querySelector('.task-check').addEventListener('change', (e) => {
            if (e.target.checked) {
                store.addPoints(10); // 10점 획득
                li.style.opacity = '0.5';
                alert("훌륭해요! +10 포인트 획득! 🎨");
            }
        });
        
        list.appendChild(li);
    });
}

export function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';
    store.state.gallery.forEach(img => {
        const div = document.createElement('div');
        const image = new Image();
        image.src = img.data;
        image.className = 'gallery-item';
        div.appendChild(image);
        grid.appendChild(div);
    });
}

// 스킬 체크리스트 폼 생성
export function createSkillForm() {
    const categories = ['인체/해부학', '원근법/투시', '명암/빛', '색채학', '구도/연출', '디지털툴 숙련도'];
    const form = document.getElementById('skill-form');
    
    categories.forEach(cat => {
        const div = document.createElement('div');
        div.style.marginBottom = '15px';
        div.innerHTML = `
            <label style="font-weight:600; font-size:14px; display:block; margin-bottom:5px;">${cat}</label>
            <select name="${cat}" style="width:100%; padding:10px; border-radius:12px; border:1px solid #ddd;">
                <option value="입문">완전 처음 (입문)</option>
                <option value="초급">조금 알아요 (초급)</option>
                <option value="중급">익숙해요 (중급)</option>
                <option value="고급">자신 있어요 (고급)</option>
            </select>
        `;
        form.appendChild(div);
    });
}
