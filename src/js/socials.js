/**
 * socials.js
 * Interactive particle icon carousel for social media links.
 * One big icon shown at a time; prev/next arrows to navigate.
 * Hover on the active icon scatters particles, they drift back on leave.
 */

(function () {
  'use strict';

  // ── CONFIG ─────────────────────────────────────────────
  const IMG   = 400;   // logo texture resolution
  const STEP  = 5;     // pixel-grid sampling step (larger canvas → denser)
  const LAYER = 20;    // depth layers per sample point
  const DEPTH = 0.45;  // Z-range across layers
  const HOVER = 0.6;   // scatter radius (world units)
  const BOX   = { w: 2.2, h: 2.2, d: 1.0 };

  // ── LOGO DRAWERS ───────────────────────────────────────
  function drawInstagram(s) {
    const cv = mc(s), ctx = cv.getContext('2d');
    fill(ctx, s, '#000');
    const pad = s*0.08, r = s*0.28, lw = s*0.11;
    ctx.strokeStyle='#fff'; ctx.lineWidth=lw; ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.beginPath();
    ctx.moveTo(pad+r,pad); ctx.lineTo(s-pad-r,pad); ctx.arcTo(s-pad,pad,s-pad,pad+r,r);
    ctx.lineTo(s-pad,s-pad-r); ctx.arcTo(s-pad,s-pad,s-pad-r,s-pad,r);
    ctx.lineTo(pad+r,s-pad); ctx.arcTo(pad,s-pad,pad,s-pad-r,r);
    ctx.lineTo(pad,pad+r); ctx.arcTo(pad,pad,pad+r,pad,r);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(s/2,s/2,s*0.22,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(s*0.72,s*0.28,s*0.07,0,Math.PI*2); ctx.fill();
    return px(cv,s);
  }

  function drawGitHub(s) {
    const cv = mc(s), ctx = cv.getContext('2d');
    fill(ctx, s, '#000');
    const path = new Path2D("M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z");
    ctx.save();
    ctx.scale(s/16, s/16);
    ctx.fillStyle = '#fff';
    ctx.fill(path);
    ctx.restore();
    return px(cv,s);
  }

  function drawLinkedIn(s) {
    const cv = mc(s), ctx = cv.getContext('2d');
    fill(ctx, s, '#000');
    const path = new Path2D("M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z");
    ctx.save();
    ctx.scale(s/24, s/24);
    ctx.fillStyle = '#fff';
    ctx.fill(path);
    ctx.restore();
    return px(cv,s);
  }

  function mc(s) { const c=document.createElement('canvas'); c.width=c.height=s; return c; }
  function fill(ctx,s,col) { ctx.fillStyle=col; ctx.fillRect(0,0,s,s); }
  function px(cv,s) { return cv.getContext('2d').getImageData(0,0,s,s).data; }

  // ── PIXEL SAMPLER ──────────────────────────────────────
  function samplePixels(data) {
    const pts = [];
    for (let y=0; y<IMG; y+=STEP) {
      for (let x=0; x<IMG; x+=STEP) {
        if (data[(y*IMG+x)*4] > 100) {
          for (let l=0; l<LAYER; l++) {
            const z = (l/(LAYER-1)-0.5)*DEPTH + (Math.random()-0.5)*0.04;
            pts.push(new THREE.Vector3(
               (x/IMG-0.5)*2.8 + (Math.random()-0.5)*0.01,
              -(y/IMG-0.5)*2.8 + (Math.random()-0.5)*0.01,
               z
            ));
          }
        }
      }
    }
    return pts;
  }

  function randBox() {
    return new THREE.Vector3(
      (Math.random()-0.5)*BOX.w*1.8,
      (Math.random()-0.5)*BOX.h*1.8,
      (Math.random()-0.5)*BOX.d*1.8
    );
  }

  // ── ICON FACTORY ───────────────────────────────────────
  function createIcon(canvas, drawFn) {
    const DPR = Math.min(window.devicePixelRatio, 2);
    const SZ  = canvas.offsetWidth || 500;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
    renderer.setSize(SZ, SZ);
    renderer.setPixelRatio(DPR);
    renderer.setClearColor(0x020408, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 5;

    const home  = samplePixels(drawFn(IMG));
    const COUNT = home.length;

    const mesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.012, 6, 6),
      new THREE.MeshStandardMaterial({ color:0xffffff, emissive:0x003344, roughness:0.2, metalness:0.9 }),
      COUNT
    );
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(mesh);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const pl = new THREE.PointLight(0x00d4ff,3,15); pl.position.set(2,2,3);   scene.add(pl);
    const ol = new THREE.PointLight(0xff6b35,2,15); ol.position.set(-2,-2,2); scene.add(ol);
    const bl = new THREE.PointLight(0x002233,2,15); bl.position.set(0,0,-2);  scene.add(bl);

    const cT=new THREE.Color(0x00d4ff), cM=new THREE.Color(0xff6b35), cB=new THREE.Color(0x004466), tmp=new THREE.Color();
    for (let i=0;i<COUNT;i++) {
      const t=(home[i].y/1.4+1)/2;
      if (t>0.5) tmp.lerpColors(cM,cT,(t-0.5)*2); else tmp.lerpColors(cB,cM,t*2);
      tmp.multiplyScalar(Math.max(0.4,Math.min(1,0.5+(home[i].z+0.3)*0.8)));
      mesh.setColorAt(i,tmp);
    }
    mesh.instanceColor.needsUpdate = true;

    const cur  = home.map(p => p.clone());
    const vel  = home.map(() => new THREE.Vector3());
    const amt  = new Float32Array(COUNT).fill(0);
    const wand = home.map(() => randBox());
    const dum  = new THREE.Object3D();

    // Mouse tracking — relative to the canvas
    let mwX=9999, mwY=9999;
    const ray=new THREE.Raycaster(), ndc=new THREE.Vector2(), hit=new THREE.Vector3();
    const plane=new THREE.Plane(new THREE.Vector3(0,0,1),0);
    const slide = canvas.closest('.social-slide') || canvas.parentElement;

    slide.addEventListener('mousemove', e => {
      const r=canvas.getBoundingClientRect();
      ndc.set(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1);
      ray.setFromCamera(ndc,camera);
      ray.ray.intersectPlane(plane,hit);
      mwX=hit.x; mwY=hit.y;
    });
    slide.addEventListener('mouseleave', () => { mwX=9999; mwY=9999; });

    return { renderer,scene,camera,mesh,home,cur,vel,amt,wand,dum,pl,ol,bl, getMX:()=>mwX, getMY:()=>mwY };
  }

  // ── ICONS ──────────────────────────────────────────────
  const defs = [
    { id:'social-instagram', draw:drawInstagram },
    { id:'social-github',    draw:drawGitHub    },
    { id:'social-linkedin',  draw:drawLinkedIn  },
  ];

  const icons = defs.map(({id,draw}) => {
    const el = document.getElementById(id);
    return el ? createIcon(el, draw) : null;
  }).filter(Boolean);

  if (!icons.length) return;

  // ── CAROUSEL NAVIGATION ────────────────────────────────
  const slides    = Array.from(document.querySelectorAll('.social-slide'));
  const dots      = Array.from(document.querySelectorAll('.carousel-dots .dot'));
  const nameLabel = document.getElementById('social-current-name');
  let activeIndex = 0;

  function showSlide(newIndex) {
    // Remove active from current
    slides[activeIndex].classList.remove('active');
    dots[activeIndex].classList.remove('active');

    // Clamp / wrap
    activeIndex = (newIndex + slides.length) % slides.length;

    // Activate next
    slides[activeIndex].classList.add('active', 'entering');
    dots[activeIndex].classList.add('active');
    if (nameLabel) nameLabel.textContent = slides[activeIndex].dataset.name || '';

    // Remove entering class after animation
    slides[activeIndex].addEventListener('animationend', () => {
      slides[activeIndex].classList.remove('entering');
    }, { once: true });
  }

  document.getElementById('social-prev')?.addEventListener('click', e => {
    e.preventDefault();
    showSlide(activeIndex - 1);
  });

  document.getElementById('social-next')?.addEventListener('click', e => {
    e.preventDefault();
    showSlide(activeIndex + 1);
  });

  // ── RESIZE HANDLER ─────────────────────────────────────
  function onResize() {
    icons.forEach(icon => {
      if (!icon) return;
      const { renderer } = icon;
      const canvas = renderer.domElement;
      const newSize = canvas.offsetWidth;

      if (canvas.width !== newSize) {
        renderer.setSize(newSize, newSize);
      }
    });
  }
  window.addEventListener('resize', onResize);

  // ── ANIMATION LOOP ─────────────────────────────────────
  const clock = new THREE.Clock();
  let rotY = 0;

  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    rotY += 0.009;
    const cosR = Math.cos(rotY), sinR = Math.sin(rotY);
    const floatY = Math.sin(t * 0.6) * 0.12;

    // Only fully simulate + render the active icon; idle icons just render
    icons.forEach((ic, idx) => {
      const isActive = idx === activeIndex;
      const { renderer,scene,camera,mesh,home,cur,vel,amt,wand,dum,pl,ol,bl } = ic;
      const mwX = isActive ? ic.getMX() : 9999;
      const mwY = isActive ? ic.getMY() : 9999;
      const COUNT = home.length;

      for (let i=0; i<COUNT; i++) {
        const h=home[i];
        const tx= h.x*cosR - h.z*sinR;
        const ty= h.y + floatY;
        const tz= h.x*sinR + h.z*cosR;

        const dx=tx-mwX, dy=ty-mwY;
        const isNear = dx*dx+dy*dy < HOVER*HOVER;
        amt[i] = isNear ? Math.min(1,amt[i]+0.008) : Math.max(0,amt[i]-0.005);
        const s=amt[i];

        if (s>0.01) {
          const wx=tx*(1-s)+wand[i].x*s, wy=ty*(1-s)+wand[i].y*s, wz=tz*(1-s)+wand[i].z*s;
          vel[i].x+=(wx-cur[i].x)*0.004; vel[i].y+=(wy-cur[i].y)*0.004; vel[i].z+=(wz-cur[i].z)*0.004;
          if (Math.abs(cur[i].x-wand[i].x)<0.1 && Math.abs(cur[i].y-wand[i].y)<0.1) wand[i]=randBox();
          const b=0.2;
          if(cur[i].x> BOX.w){cur[i].x= BOX.w;vel[i].x*=-b;} if(cur[i].x<-BOX.w){cur[i].x=-BOX.w;vel[i].x*=-b;}
          if(cur[i].y> BOX.h){cur[i].y= BOX.h;vel[i].y*=-b;} if(cur[i].y<-BOX.h){cur[i].y=-BOX.h;vel[i].y*=-b;}
          if(cur[i].z> BOX.d){cur[i].z= BOX.d;vel[i].z*=-b;} if(cur[i].z<-BOX.d){cur[i].z=-BOX.d;vel[i].z*=-b;}
        } else {
          vel[i].x+=(tx-cur[i].x)*0.04; vel[i].y+=(ty-cur[i].y)*0.04; vel[i].z+=(tz-cur[i].z)*0.04;
        }
        vel[i].multiplyScalar(0.92);
        cur[i].add(vel[i]);
        dum.position.copy(cur[i]); dum.scale.setScalar(1); dum.updateMatrix();
        mesh.setMatrixAt(i, dum.matrix);
      }

      mesh.instanceMatrix.needsUpdate = true;
      pl.intensity = 2.5+Math.sin(t*1.5)*0.8;
      ol.intensity = 1.8+Math.sin(t*2.1+1)*0.6;
      bl.intensity = 1.5+Math.sin(t*1.8+2)*0.5;

      // Render only the active icon (others are display:none but we keep sim running)
      if (isActive) renderer.render(scene, camera);
    });
  })();
})();
