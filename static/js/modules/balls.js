import { gsap } from "gsap";

export default function initBalls() {
    const container = document.getElementById('balls-container');
    if (!container) return;

    const balls = [];
    
    // Create 10 balls
    for (let i = 0; i < 10; i++) {
        const ball = document.createElement('div');
        ball.className = 'ball';
        ball.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
        container.appendChild(ball);
        
        gsap.set(ball, {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight * 0.5
        });
        
        animateBall(ball);
    }

    function animateBall(ball) {
        const duration = 2 + Math.random() * 1;
        
        gsap.to(ball, {
            y: window.innerHeight - 40,
            duration: duration,
            ease: "bounce.out",
            yoyo: true,
            repeat: -1,
            delay: Math.random() * 2
        });
        
        gsap.to(ball, {
            x: "+=" + (Math.random() * 200 - 100),
            duration: duration * 1.5,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        });
    }
}

// Initialize when imported
initBalls();