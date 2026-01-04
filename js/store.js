const STORAGE_KEY = 'artquest_data_v2'; // 버전 업

const initialState = {
    apiKey: '',
    isOnboarded: false,
    level: 1,
    points: 0,
    streak: 0,
    lastLoginDate: null,
    skills: {}, 
    themeColor: '#3182f6',
    tasks: [],
    aiFeedback: "아직 분석 데이터가 없습니다.",
    gallery: []
};

export const store = {
    state: JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialState,

    save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    },

    setApiKey(key) {
        this.state.apiKey = key;
        this.save();
    },

    // 실력 업데이트 및 상태 변경
    updateSkills(skillsObj) {
        this.state.skills = skillsObj;
        this.state.isOnboarded = true; // 온보딩 완료 처리
        this.save();
    },

    // '초급' 같은 텍스트를 차트용 숫자(1~5)로 변환
    getSkillScores() {
        const scoreMap = { '입문': 1, '초급': 2, '중급': 3, '고급': 4, '프로': 5 };
        const labels = [];
        const data = [];
        
        for (const [key, value] of Object.entries(this.state.skills)) {
            labels.push(key);
            data.push(scoreMap[value] || 1);
        }
        return { labels, data };
    },

    reset() {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    },
    
    // ... 기존 addPoints, checkStreak 등 유지
    addPoints(amount) {
        this.state.points += amount;
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
                this.state.streak = 1;
            }
            this.state.lastLoginDate = today;
            this.save();
        }
    }
};
