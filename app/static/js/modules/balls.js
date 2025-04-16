// balls.js
export default async function initBalls() {
    try {
      // Dynamic import if needed
      const { gsap } = window.gsap ? { gsap: window.gsap } : await import('https://cdn.skypack.dev/gsap');
      
      const container = document.getElementById('balls-container');
      if (!container) return;
  
      // Clear existing balls
      container.innerHTML = '';
  
      // Create and animate balls
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
        const duration = 2 + Math.random();
        gsap.to(ball, {
          y: window.innerHeight - 40,
          duration,
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
    } catch (error) {
      console.error("Failed to load GSAP:", error);
    }
  }