/**
 * 상태 관리 모듈
 * 로컬 스토리지를 사용하여 데이터 영속성 보장
 */
const STORAGE_KEY = 'artquest_data_v1';

const initialState = {
    apiKey: null,
    isOnboarded: false,
    level: 1,
    points: 0,
    streak: 0,
    lastLoginDate: null,
    skills: {}, // { "인체": "초급", "명암": "중급" ... }
    themeColor: '#3182f6',
    tasks: [], // 오늘의 과제 리스트
    gallery: [], // { id, date, imageBase64, note }
    aiFeedback: "아직 분석 데이터가 없습니다."
};

export const store = {
    state: JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialState,

    save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        // 데이터 변경 시 이벤트 발생 (간이 리액티브 시스템)
        document.dispatchEvent(new CustomEvent('stateChanged'));
    },

    setApiKey(key) {
        this.state.apiKey = key;
        this.save();
    },

    updateSkills(skillsObj) {
        this.state.skills = skillsObj;
        this.state.isOnboarded = true;
        this.save();
    },

    addPoints(amount) {
        this.state.points += amount;
        // 100포인트마다 레벨업 로직
        if (this.state.points >= this.state.level * 100) {
            this.state.level++;
            alert("🎉 레벨 업! 축하합니다!");
        }
        this.save();
    },

    checkStreak() {
        const today = new Date().toDateString();
        if (this.state.lastLoginDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (this.state.lastLoginDate === yesterday.toDateString()) {
                this.state.streak++;
            } else {
                this.state.streak = 1; // 끊김, 다시 1일
            }
            this.state.lastLoginDate = today;
            this.save();
        }
    },

    setTheme(color) {
        this.state.themeColor = color;
        this.save();
    },

    addGalleryItem(item) {
        this.state.gallery.unshift(item);
        this.save();
    },
    
    reset() {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    }
};
