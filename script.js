// Pastikan DOM sudah dimuat sebelum menjalankan animasi
document.addEventListener("DOMContentLoaded", () => {
    
    // --- CURSOR LOGIC ---
    const dot = document.getElementById('cursor-dot');
    const trail = document.getElementById('cursor-trail');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let trailX = mouseX;
    let trailY = mouseY;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
    });

    // Smooth trailing
    gsap.ticker.add(() => {
        trailX += (mouseX - trailX) * 0.15;
        trailY += (mouseY - trailY) * 0.15;
        trail.style.left = trailX + 'px';
        trail.style.top = trailY + 'px';
    });

    // Hover effect mapping
    document.querySelectorAll('.interactive').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });


    // --- PARALLAX HERO ---
    const fence = document.getElementById('fence');
    const wire = document.getElementById('wire');
    const frame = document.getElementById('frame');

    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        
        gsap.to(fence, { x: x * -20, y: y * -20, duration: 1, ease: "power2.out" });
        gsap.to(wire, { x: x * 40, y: y * 20, rotation: -3 + x, duration: 1, ease: "power2.out" });
        gsap.to(frame, { x: x * 10, y: y * 10, duration: 1, ease: "power2.out" });
    });


    // --- INTERACTION 1: HERO TEXT PHYSICS (FALL & RETURN) ---
    const title = document.getElementById('hero-title');
    const letters = title.querySelectorAll('span');
    let isAnimating = false;

    // Hover glitch
    title.addEventListener('mouseenter', () => { if(!isAnimating) title.classList.add('glitch-hover'); });
    title.addEventListener('mouseleave', () => title.classList.remove('glitch-hover'));

    // Click gravity physics
    title.addEventListener('click', () => {
        if(isAnimating) return;
        isAnimating = true;
        title.classList.remove('glitch-hover');

        // Fall down
        gsap.to(letters, {
            y: () => window.innerHeight,
            rotation: () => (Math.random() - 0.5) * 180,
            duration: 1.2,
            ease: "power2.in",
            stagger: 0.05,
            onComplete: () => {
                // Wait then snap back up
                setTimeout(() => {
                    gsap.to(letters, {
                        y: 0,
                        rotation: 0,
                        duration: 1.5,
                        ease: "elastic.out(1, 0.4)",
                        stagger: 0.05,
                        onComplete: () => { isAnimating = false; }
                    });
                }, 2500);
            }
        });
    });


    // --- GSAP SCROLL ANIMATIONS ---
    gsap.registerPlugin(ScrollTrigger);

    // About text reveal
    gsap.utils.toArray('.about-text p').forEach((p) => {
        gsap.to(p, {
            scrollTrigger: { trigger: p, start: "top 85%" },
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out"
        });
    });

    // Ritual Slam Effect (Screen shake equivalent)
    ScrollTrigger.create({
        trigger: "#ritual",
        start: "top 50%",
        onEnter: () => {
            // Slam text
            gsap.to("#ritual-text", {
                scale: 1,
                opacity: 1,
                duration: 0.4,
                ease: "power4.in"
            });
            // Screen shake
            setTimeout(() => {
                gsap.to(document.body, {
                    x: () => (Math.random() - 0.5) * 20,
                    y: () => (Math.random() - 0.5) * 20,
                    yoyo: true,
                    repeat: 5,
                    duration: 0.05,
                    onComplete: () => gsap.set(document.body, {x:0, y:0})
                });
            }, 400); // Trigger shake right when scale hits 1
        }
    });


    // --- EASTER EGGS / SECRET INTERACTIONS ---
    
    // 1. Press 'R' for Glitch
    const flash = document.getElementById('flash');
    document.addEventListener('keydown', (e) => {
        if(e.key.toLowerCase() === 'r') {
            gsap.to(flash, { opacity: 0.8, duration: 0.05, yoyo: true, repeat: 3, onComplete: ()=> gsap.set(flash, {opacity: 0}) });
        }
    });

    // 2. Click Background 5x
    let clickCount = 0;
    let clickTimer;
    document.addEventListener('click', (e) => {
        if(!e.target.closest('.interactive')) {
            clickCount++;
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => { clickCount = 0; }, 2000); // reset if slow
            
            if(clickCount === 5) {
                const secret = document.getElementById('secret-text');
                gsap.to(secret, { opacity: 1, scale: 1.1, duration: 0.5, yoyo: true, repeat: 1, hold: 2, onComplete: ()=> {secret.style.opacity = 0; clickCount = 0;} });
            }
        }
    });

    // 3. Long hover logo changes text
    let hoverTimeout;
    const originalHTML = title.innerHTML;
    title.addEventListener('mouseenter', () => {
        hoverTimeout = setTimeout(() => {
            if(!isAnimating) {
                // Quick replace to string, no spans needed for this state
                title.innerHTML = "UDAH MAKAN BELUM?";
                title.style.fontSize = "clamp(2rem, 6vw, 5rem)";
            }
        }, 3000);
    });
    title.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout);
        if(!isAnimating) {
            title.innerHTML = originalHTML;
            title.style.fontSize = ""; // Reset
        }
    });

    // 4. Bottom Scroll Fade in
    window.addEventListener('scroll', () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
            document.getElementById('bottom-msg').style.opacity = "1";
        }
    });


    // --- GALLERY DRAG LOGIC ---
    const slider = document.getElementById('gallery');
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => isDown = false);
    slider.addEventListener('mouseup', () => isDown = false);
    slider.addEventListener('mousemove', (e) => {
        if(!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2;
        slider.scrollLeft = scrollLeft - walk;
    });

});