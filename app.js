(function () {
    const scenes = {
      heart: document.getElementById('scene-heart'),
      valentine: document.getElementById('scene-valentine'),
      loveMe: document.getElementById('scene-love-me'),
      loader: document.getElementById('scene-loader'),
      iloveyou: document.getElementById('scene-iloveyou'),
      final: document.getElementById('scene-final')
    };
  
    function goTo(id) {
      Object.keys(scenes).forEach(k => {
        scenes[k].classList.toggle('scene-active', scenes[k].id === id);
      });
    }
  
    let threeScene, threeCamera, threeRenderer, particles, heartGroup, geometry, vertices;
    const pathEl = document.getElementById('heart-path').querySelector('path');
    const HEART_W = 600, HEART_H = 552;
  
    function updateHeartScale() {
      if (!heartGroup || !threeCamera) return;
      const aspect = threeCamera.aspect;
      const vFov = (75 * Math.PI) / 180;
      const visibleH = 2 * threeCamera.position.z * Math.tan(vFov / 2);
      const visibleW = visibleH * aspect;
      const scale = Math.min(visibleW / HEART_W, visibleH / HEART_H, 1) * 0.92;
      heartGroup.scale.set(scale, scale, scale);
    }
  
    function initThree() {
      const container = document.getElementById('three-container');
      threeScene = new THREE.Scene();
      threeCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
      threeCamera.position.set(0, 0, 500);
      threeCamera.lookAt(0, 0, 0);
      threeRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      threeRenderer.setSize(window.innerWidth, window.innerHeight);
      threeRenderer.setClearColor(0x000000, 0);
      container.appendChild(threeRenderer.domElement);
  
      const length = pathEl.getTotalLength();
      vertices = [];
      const tl = gsap.timeline({ repeat: -1, yoyo: true });
      for (let i = 0; i < length; i += 0.1) {
        const point = pathEl.getPointAtLength(i);
        const v = new THREE.Vector3(point.x, -point.y, 0);
        v.x += (Math.random() - 0.5) * 30;
        v.y += (Math.random() - 0.5) * 30;
        v.z += (Math.random() - 0.5) * 70;
        vertices.push(v);
        tl.from(v, {
          x: HEART_W / 2, y: -HEART_H / 2, z: 0,
          ease: 'power2.inOut',
          duration: 'random(2, 5)'
        }, i * 0.002);
      }
      geometry = new THREE.BufferGeometry().setFromPoints(vertices);
      const material = new THREE.PointsMaterial({
        color: 0xee5282,
        blending: THREE.AdditiveBlending,
        size: 3
      });
      particles = new THREE.Points(geometry, material);
      particles.position.set(-HEART_W / 2, HEART_H / 2, 0);
      heartGroup = new THREE.Group();
      heartGroup.add(particles);
      heartGroup.position.set(0, 0, 0);
      threeScene.add(heartGroup);
      updateHeartScale();
      gsap.fromTo(heartGroup.rotation, { y: -0.2 }, {
        y: 0.2, repeat: -1, yoyo: true, ease: 'power2.inOut', duration: 3
      });
    }
  
    function threeRender() {
      if (!threeRenderer || !scenes.heart.classList.contains('scene-active')) {
        requestAnimationFrame(threeRender);
        return;
      }
      geometry.setFromPoints(vertices);
      threeRenderer.render(threeScene, threeCamera);
      requestAnimationFrame(threeRender);
    }
  
    function onResize() {
      if (threeCamera && threeRenderer) {
        threeCamera.aspect = window.innerWidth / window.innerHeight;
        threeCamera.updateProjectionMatrix();
        threeRenderer.setSize(window.innerWidth, window.innerHeight);
        updateHeartScale();
      }
    }
  
    setTimeout(() => goTo('scene-valentine'), 125000);
  
    const valentineMessages = [
      'Emin misin?', 'Cidden mi??', 'Pozitif misin?', 'Lütfen...', 'Bir düşün!',
      'Hayır dersen çok üzülürüm...', 'Çok üzüleceğim...', 'Çok çok üzüleceğim...',
      'Tamam sormayı bırakıyorum...', 'Şaka! Evet de lütfen ❤️'
    ];
    let valentineMsgIndex = 0;
    const valentineYes = document.getElementById('valentine-yes');
    const valentineNo = document.getElementById('valentine-no');
  
    valentineNo.addEventListener('click', () => {
      valentineNo.textContent = valentineMessages[valentineMsgIndex];
      valentineMsgIndex = (valentineMsgIndex + 1) % valentineMessages.length;
      let step = parseInt(valentineYes.dataset.step || '0', 10);
      step += 1;
      valentineYes.dataset.step = step;
      const pad = 14 + step * 4;
      const minW = 100 + step * 12;
      valentineYes.style.padding = `${pad}px ${pad + 14}px`;
      valentineYes.style.minWidth = `${minW}px`;
    });
  
    valentineYes.addEventListener('click', () => goTo('scene-love-me'));
  
  // "Beni seviyor musun?" sahnesindeki Hayır butonu
  const loveNo = document.getElementById('love-no');
  const loveYes = document.getElementById('love-yes');
  const loveMeCard = scenes.loveMe.querySelector('.card');
  
  function getNewPosition() {
    // Card'ın boyutlarını al
    const cardRect = loveMeCard.getBoundingClientRect();
    const buttonWidth = loveNo.offsetWidth;
    const buttonHeight = loveNo.offsetHeight;
    
    // Butonun gidebileceği maksimum alanı hesapla
    const maxLeft = cardRect.width - buttonWidth - 20; // 20px padding
    const maxTop = cardRect.height - buttonHeight - 20;
    
    // "Evet" butonunun konumunu al
    const yesRect = loveYes.getBoundingClientRect();
    const yesLeft = yesRect.left - cardRect.left;
    const yesTop = yesRect.top - cardRect.top;
    const yesRight = yesLeft + yesRect.width;
    const yesBottom = yesTop + yesRect.height;
    
    let newLeft, newTop;
    let attempts = 0;
    const safeDistance = 80; // Evet butonundan minimum uzaklık
    
    // Evet butonundan uzak bir konum bul
    do {
      newLeft = 20 + Math.random() * (maxLeft - 20);
      newTop = 20 + Math.random() * (maxTop - 20);
      
      // Evet butonuna çok yakın mı kontrol et
      const distanceToYes = Math.sqrt(
        Math.pow(newLeft - yesLeft, 2) + 
        Math.pow(newTop - yesTop, 2)
      );
      
      if (distanceToYes > safeDistance) {
        break;
      }
      
      attempts++;
    } while (attempts < 20);
    
    return { left: newLeft, top: newTop };
  }
  
  function moveLoveNo(immediate = false) {
    const pos = getNewPosition();
    if (pos) {
      if (immediate) {
        loveNo.style.transition = 'none';
        loveNo.style.left = `${pos.left}px`;
        loveNo.style.top = `${pos.top}px`;
        requestAnimationFrame(() => {
          loveNo.style.transition = 'left 0.3s ease-out, top 0.3s ease-out';
        });
      } else {
        loveNo.style.left = `${pos.left}px`;
        loveNo.style.top = `${pos.top}px`;
      }
    }
  }
  
  if (loveNo && loveMeCard) {
    const escapeDistance = 100;
    
    function checkMouseDistance(e) {
      if (!scenes.loveMe.classList.contains('scene-active')) return;
      
      const rect = loveNo.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;
      
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      const distance = Math.sqrt(
        Math.pow(clientX - btnCenterX, 2) + 
        Math.pow(clientY - btnCenterY, 2)
      );
      
      if (distance < escapeDistance) {
        moveLoveNo();
      }
    }
  
    // Desktop için mousemove
    document.addEventListener('mousemove', checkMouseDistance);
    
    // Mobil için touchmove
    document.addEventListener('touchmove', checkMouseDistance, { passive: true });
    
    // Tıklama için
    loveNo.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      moveLoveNo(true);
    });
    
    loveNo.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      moveLoveNo(true);
    });
    
    // Sahne aktif olduğunda başlangıç pozisyonunu ayarla
    const observer = new MutationObserver(() => {
      if (scenes.loveMe.classList.contains('scene-active')) {
        setTimeout(() => {
          moveLoveNo(true);
        }, 200);
      }
    });
    observer.observe(scenes.loveMe, { attributes: true, attributeFilter: ['class'] });
  }
  
    let loveAnimationInterval = null;
    
    loveYes.addEventListener('click', () => {
      goTo('scene-iloveyou');
      setTimeout(() => {
        startLoveYouAnimation();
      }, 100);
    });
    
    scenes.iloveyou.addEventListener('click', () => {
      if (loveAnimationInterval) {
        clearInterval(loveAnimationInterval);
        loveAnimationInterval = null;
      }
      goTo('scene-final');
    });
  
    function startLoveYouAnimation() {
      if (typeof mojs === 'undefined' || !mojs.easing) {
        console.warn('mojs not loaded, retrying...');
        let retries = 0;
        const checkMojs = setInterval(() => {
          retries++;
          if (typeof mojs !== 'undefined' && mojs.easing) {
            clearInterval(checkMojs);
            startLoveYouAnimation();
          } else if (retries > 10) {
            clearInterval(checkMojs);
            console.error('mojs failed to load after retries, skipping animation');
            setTimeout(() => goTo('scene-final'), 1000);
          }
        }, 200);
        return;
      }
      
      const qs = document.querySelector.bind(document);
      const easingHeart = mojs.easing.path('M0,100C2.9,86.7,33.6-7.3,46-7.3s15.2,22.7,26,22.7S89,0,100,0');
      
      const el = {
        container: qs('.love-container'),
        i: qs('.love-ltr--I'),
        l: qs('.love-ltr--L'),
        o: qs('.love-ltr--O'),
        v: qs('.love-ltr--V'),
        e: qs('.love-ltr--E'),
        y: qs('.love-ltr--Y'),
        o2: qs('.love-ltr--O2'),
        u: qs('.love-ltr--U'),
        lineLeft: qs('.love-line--left'),
        lineRight: qs('.love-line--right'),
        blup: qs('.blup'),
        blop: qs('.blop'),
        sound: qs('.sound'),
        colTxt: '#ff4081',
        colHeart: '#ff1744'
      };
      
      if (!el.container || !el.i) {
        setTimeout(() => goTo('scene-final'), 1000);
        return;
      }
      
      [el.i, el.l, el.o, el.v, el.e, el.y, el.o2, el.u].forEach((e) => {
        if (e) {
          e.style.opacity = '1';
          e.style.transform = 'translate(0px, 0px) rotate(0deg) skew(0deg, 0deg) scale(1, 1)';
          e.style.display = 'block';
        }
      });
      
      if (el.lineLeft) el.lineLeft.style.opacity = '1';
      if (el.lineRight) el.lineRight.style.opacity = '1';
    
      class Heart extends mojs.CustomShape {
        getShape() {
          return '<path d="M50,88.9C25.5,78.2,0.5,54.4,3.8,31.1S41.3,1.8,50,29.9c8.7-28.2,42.8-22.2,46.2,1.2S74.5,78.2,50,88.9z"/>';
        }
        getLength() {
          return 200;
        }
      }
      mojs.addShape('heart', Heart);
    
      const crtBoom = (delay = 0, x = 0, rd = 46) => {
        const crcl = new mojs.Shape({
          shape: 'circle',
          fill: 'none',
          stroke: el.colTxt,
          strokeWidth: { 5: 0 },
          radius: { [rd]: [rd + 20] },
          easing: 'quint.out',
          duration: 500 / 3,
          parent: el.container,
          delay,
          x
        });
        
        const brst = new mojs.Burst({
          radius: { [rd + 15]: 110 },
          angle: 'rand(60, 180)',
          count: 3,
          timeline: { delay },
          parent: el.container,
          x,
          children: {
            radius: [5, 3, 7],
            fill: el.colTxt,
            scale: { 1: 0, easing: 'quad.in' },
            pathScale: [0.8, null],
            degreeShift: ['rand(13, 60)', null],
            duration: 1000 / 3,
            easing: 'quint.out'
          }
        });
        
        return [crcl, brst];
      };
    
      const move = 1000, boom = 200, easing = 'sin.inOut', easingBoom = 'sin.in', easingOut = 'sin.out';
      const opts = { duration: move, easing, opacity: 1 };
      const delta = 150;
      const letters = [el.i, el.l, el.o, el.v, el.e, el.y, el.o2, el.u];
    
      const loveTl = new mojs.Timeline().add([
        new mojs.Tween({
          duration: move,
          onStart: () => {
            [el.i, el.l, el.o, el.v, el.e, el.y, el.o2, el.u].forEach((e) => {
              if (e) {
                e.style.opacity = 1;
                e.style = 'transform: translate(0px, 0px) rotate(0deg) skew(0deg, 0deg) scale(1, 1); opacity: 1;';
              }
            });
          },
          onComplete: () => {
            [el.l, el.o, el.v, el.e].forEach((e) => {
              if (e) e.style.opacity = 0;
            });
            if (el.blop) el.blop.play();
          }
        }),
        new mojs.Tween({
          duration: move * 2 + boom,
          onComplete: () => {
            [el.y, el.o2].forEach((e) => {
              if (e) e.style.opacity = 0;
            });
            if (el.blop) el.blop.play();
          }
        }),
        new mojs.Tween({
          duration: move * 3 + boom * 2 - delta,
          onComplete: () => {
            if (el.i) el.i.style.opacity = 0;
            if (el.blop) el.blop.play();
          }
        }),
        new mojs.Tween({
          duration: move * 3 + boom * 2,
          onComplete: () => {
            if (el.u) el.u.style.opacity = 0;
            if (el.blup) el.blup.play();
          }
        }),
        new mojs.Tween({
          duration: 50,
          delay: 4050,
          onUpdate: (progress) => {
            [el.i, el.l, el.o, el.v, el.e, el.y, el.o2, el.u].forEach((e) => {
              if (e) {
                e.style = `transform: translate(0px, 0px) rotate(0deg) skew(0deg, 0deg) scale(1, 1); opacity: ${1 * progress};`;
              }
            });
          },
          onComplete: () => {
            [el.i, el.l, el.o, el.v, el.e, el.y, el.o2, el.u].forEach((e) => {
              if (e) {
                e.style.opacity = 1;
                e.style = 'transform: translate(0px, 0px) rotate(0deg) skew(0deg, 0deg) scale(1, 1); opacity: 1;';
              }
            });
          }
        }),
        
        new mojs.Html({
          ...opts,
          el: el.lineLeft,
          x: { 0: 52 }
        })
          .then({
            duration: boom + move,
            easing,
            x: { to: 52 + 54 }
          })
          .then({
            duration: boom + move,
            easing,
            x: { to: 52 + 54 + 60 }
          })
          .then({
            duration: 150,
            easing,
            x: { to: 52 + 54 + 60 + 10 }
          })
          .then({
            duration: 300
          })
          .then({
            duration: 350,
            x: { to: 0 },
            easing: easingOut
          }),
      new mojs.Html({
        ...opts,
        el: el.lineRight,
        x: { 0: -52 }
      })
        .then({
          duration: boom + move,
          easing,
          x: { to: -52 - 54 }
        })
        .then({
          duration: boom + move,
          easing,
          x: { to: -52 - 54 - 60 }
        })
        .then({
          duration: 150,
          easing,
          x: { to: -52 - 54 - 60 - 10 }
        })
        .then({
          duration: 300
        })
        .then({
          duration: 350,
          x: { to: 0 },
          easing: easingOut
        }),
        
        new mojs.Html({
          ...opts,
          el: el.i,
          x: { 0: 34 }
        })
          .then({
            duration: boom,
            easing: easingBoom,
            x: { to: 34 + 19 }
          })
          .then({
            duration: move,
            easing,
            x: { to: 34 + 19 + 40 }
          })
          .then({
            duration: boom,
            easing: easingBoom,
            x: { to: 34 + 19 + 40 + 30 }
          })
          .then({
            duration: move,
            easing,
            x: { to: 34 + 19 + 40 + 30 + 30 }
          }),
          
        new mojs.Html({
          ...opts,
          el: el.l,
          x: { 0: 15 }
        }),
        
        new mojs.Html({
          ...opts,
          el: el.o,
          x: { 0: 11 }
        }),
        
        new mojs.Html({
          ...opts,
          el: el.v,
          x: { 0: 3 }
        }),
        
        new mojs.Html({
          ...opts,
          el: el.e,
          x: { 0: -3 }
        }),
        
        new mojs.Html({
          ...opts,
          el: el.y,
          x: { 0: -20 }
        })
          .then({
            duration: boom,
            easing: easingBoom,
            x: { to: -20 - 33 }
          })
          .then({
            duration: move,
            easing,
            x: { to: -20 - 33 - 24 }
          }),
          
        new mojs.Html({
          ...opts,
          el: el.o2,
          x: { 0: -27 }
        })
          .then({
            duration: boom,
            easing: easingBoom,
            x: { to: -27 - 27 }
          })
          .then({
            duration: move,
            easing,
            x: { to: -27 - 27 - 30 }
          }),
          
        new mojs.Html({
          ...opts,
          el: el.u,
          x: { 0: -32 }
        })
          .then({
            duration: boom,
            easing: easingBoom,
            x: { to: -32 - 21 }
          })
          .then({
            duration: move,
            easing,
            x: { to: -32 - 21 - 36 }
          })
          .then({
            duration: boom,
            easing: easingBoom,
            x: { to: -32 - 21 - 36 - 31 }
          })
          .then({
            duration: move,
            easing,
            x: { to: -32 - 21 - 36 - 31 - 27 }
          }),
        
        new mojs.Shape({
          parent: el.container,
          shape: 'heart',
          delay: move,
          fill: el.colHeart,
          x: -64,
          scale: { 0: 0.95, easing: easingHeart },
          duration: 500
        })
          .then({
            x: { to: -62, easing },
            scale: { to: 0.65, easing },
            duration: boom + move - 500
          })
          .then({
            duration: boom - 50,
            x: { to: -62 + 48 },
            scale: { to: 0.9 },
            easing: easingBoom
          })
          .then({
            duration: 125,
            scale: { to: 0.8 },
            easing: easingOut
          })
          .then({
            duration: 125,
            scale: { to: 0.85 },
            easing: easingOut
          })
          .then({
            duration: move - 200,
            scale: { to: 0.45 },
            easing
          })
          .then({
            delay: -75,
            duration: 150,
            x: { to: 0 },
            scale: { to: 0.9 },
            easing: easingBoom
          })
          .then({
            duration: 125,
            scale: { to: 0.8 },
            easing: easingOut
          })
          .then({
            duration: 125,
            scale: { to: 0.85 },
            easing: easingOut
          })
          .then({
            duration: 125
          })
          .then({
            duration: 350,
            scale: { to: 0 },
            easing: easingOut
          }),
        
        ...crtBoom(move, -64, 46),
        ...crtBoom(move * 2 + boom, 18, 34),
        ...crtBoom(move * 3 + boom * 2 - delta, -64, 34),
        ...crtBoom(move * 3 + boom * 2, 45, 34)
      ]);
    
      setTimeout(() => {
        loveTl.play();
        loveAnimationInterval = setInterval(() => {
          if (scenes.iloveyou.classList.contains('scene-active')) {
            loveTl.replay();
          } else {
            if (loveAnimationInterval) {
              clearInterval(loveAnimationInterval);
              loveAnimationInterval = null;
            }
          }
        }, 4300);
      }, 50);
    }
  
    const blupEl = document.querySelector('.blup');
    const blopEl = document.querySelector('.blop');
    const soundEl = document.querySelector('.sound');
    
    if (blupEl && blopEl && soundEl) {
      const volume = 0.2;
      blupEl.volume = volume;
      blopEl.volume = volume;
      
      const toggleSound = () => {
        let on = true;
        return () => {
          if (on) {
            blupEl.volume = 0.0;
            blopEl.volume = 0.0;
            soundEl.classList.add('sound--off');
          } else {
            blupEl.volume = volume;
            blopEl.volume = volume;
            soundEl.classList.remove('sound--off');
          }
          on = !on;
        };
      };
      soundEl.addEventListener('click', toggleSound());
    }
  
    window.addEventListener('resize', onResize);
    initThree();
    threeRender();
  })();
  
