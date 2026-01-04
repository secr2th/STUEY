/**
 * 유틸리티 함수 모음
 */

export class PomodoroTimer {
    constructor(displayElement, durationMinutes = 25) {
        this.display = displayElement;
        this.duration = durationMinutes * 60;
        this.timeLeft = this.duration;
        this.timerId = null;
        this.isRunning = false;
    }

    start(onComplete) {
        if (this.isRunning) return;
        this.isRunning = true;
        this.timerId = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            if (this.timeLeft <= 0) {
                this.stop();
                if(onComplete) onComplete();
            }
        }, 1000);
    }

    stop() {
        clearInterval(this.timerId);
        this.isRunning = false;
        this.timeLeft = this.duration; // 리셋
        this.updateDisplay();
    }

    updateDisplay() {
        const m = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
        const s = (this.timeLeft % 60).toString().padStart(2, '0');
        this.display.textContent = `${m}:${s}`;
    }
    
    toggle() {
        if(this.isRunning) this.stop();
        else this.start(() => alert("집중 시간 끝! 5분만 쉬세요 ☕️"));
        return this.isRunning; // 상태 반환
    }
}
