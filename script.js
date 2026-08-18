(() => {
  'use strict';

  /* ============================================================
     Career-layer data — drives the 3D slab labels only.
     The visible 2D content is static HTML; this just feeds the canvas textures.
     ============================================================ */
  const LAYERS = [
    { kind: 'NOW',           mark: 'IBM',          when: 'Dec 2024 – Present', motto: 'Fraud & Abuse platforms',          color: 0xd98a4f, motif: 'grid' },
    { kind: 'PROJECT',       mark: 'WI-TP',        when: '2026 – Present',     motto: 'GitHub → Guard → Transform → DB',  color: 0xc9c1b6, motif: 'pipe' },
    { kind: 'MSC',           mark: 'EUDE · MSc',   when: 'Jan 2025 – Nov 2025', motto: '1,125 h · 45 ECTS · Honors',      color: 0x9c9186, motif: 'bars' },
    { kind: 'PREVIOUS',      mark: 'West Monroe',  when: 'Mar 2024 – Nov 2024', motto: '20+ apps migrated in six months', color: 0xa89d92, motif: 'migrate' },
    { kind: 'APPRENTICESHIP',mark: 'Konrad Group', when: 'May 2022 – Jul 2022', motto: '3 apps shipped in 3 months',      color: 0x8b8178, motif: 'bars' },
    { kind: 'FOUNDATION',    mark: 'CENFOTEC',     when: 'Jan 2020 – Jul 2024', motto: 'BSc · Honors · 2× best project',  color: 0x6f665e, motif: 'nodes' }
  ];

  /* ============================================================
     Layer picker <-> detail panel <-> 3D scene sync
     ============================================================ */
  let selectedLayer = 0;
  const layerListeners = [];

  function selectLayer(i) {
    if (i === selectedLayer) return;
    selectedLayer = i;
    document.querySelectorAll('.layer-card').forEach((el, idx) => {
      const active = idx === i;
      el.classList.toggle('is-active', active);
      el.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('.layer-detail').forEach((el, idx) => {
      el.hidden = idx !== i;
    });
    layerListeners.forEach(fn => fn(i));
  }

  document.querySelectorAll('.layer-card').forEach(btn => {
    btn.addEventListener('click', () => selectLayer(Number(btn.dataset.layer)));
  });

  /* ============================================================
     Project screenshot picker
     ============================================================ */
  document.querySelectorAll('.project-thumbs').forEach(group => {
    const projectId = group.dataset.project;
    const mainImg = document.querySelector(`.js-shot[data-project="${projectId}"]`);
    const caption = document.querySelector(`.js-caption[data-project="${projectId}"]`);
    const titlePrefix = mainImg.closest('.project-card').querySelector('.project-title').textContent;

    group.querySelectorAll('.thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        group.querySelectorAll('.thumb').forEach(t => t.classList.remove('is-active'));
        thumb.classList.add('is-active');
        const wide = thumb.dataset.wide === 'true';
        const cap = thumb.dataset.caption;
        mainImg.src = thumb.dataset.src;
        mainImg.alt = `${titlePrefix} — ${cap}`;
        mainImg.classList.toggle('shot--wide', wide);
        mainImg.classList.toggle('shot--narrow', !wide);
        caption.textContent = cap;
      });
    });
  });

  /* ============================================================
     3D career-stack scene
     ============================================================ */
  function motif(T, g, l) {
    const dot = op => new T.MeshBasicMaterial({ color: l.color, transparent: true, opacity: op });
    const line = (a, b, op) => new T.Line(new T.BufferGeometry().setFromPoints([a, b]), new T.LineBasicMaterial({ color: l.color, transparent: true, opacity: op }));
    const box = (w, h, d, op) => new T.Mesh(new T.BoxGeometry(w, h, d), dot(op));
    const anim = [];

    if (l.motif === 'grid') {
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
        const m = box(.3, .055, .3, r === 0 && c === 0 ? .95 : .3);
        m.position.set(-.62 + c * .42, .03, -.5 + r * .5);
        m.userData.ph = r * 4 + c;
        g.add(m); anim.push(m);
      }
      g.userData.tick = t => anim.forEach(m => { m.material.opacity = .22 + Math.abs(Math.sin(t * 1.4 + m.userData.ph * .55)) * .6; });
    }

    if (l.motif === 'pipe') {
      g.add(line(new T.Vector3(-1.1, .04, 0), new T.Vector3(1.1, .04, 0), .35));
      [-1.1, -.37, .37, 1.1].forEach(x => {
        const n = box(.16, .16, .16, .55); n.position.set(x, .04, 0); g.add(n);
      });
      const cars = [0, 1, 2].map(() => { const m = new T.Mesh(new T.SphereGeometry(.075, 10, 10), dot(1)); g.add(m); return m; });
      g.userData.tick = t => cars.forEach((m, k) => {
        const p = (t * .42 + k / 3) % 1;
        m.position.set(-1.1 + p * 2.2, .04, 0);
        m.material.opacity = Math.sin(p * Math.PI) * .9 + .1;
      });
    }

    if (l.motif === 'bars') {
      const bars = [.5, .85, .35, 1, .62, .78].map((h, k) => {
        const m = box(.16, .5, .16, .7);
        m.position.set(-.9 + k * .36, .25, 0);
        m.userData.h = h; m.userData.ph = k * .5;
        g.add(m); return m;
      });
      g.userData.tick = t => bars.forEach(m => {
        const s = m.userData.h * (.72 + Math.sin(t + m.userData.ph) * .28);
        m.scale.y = s; m.position.y = .25 * s;
      });
    }

    if (l.motif === 'migrate') {
      const src = new T.Group(), dst = new T.Group();
      for (let k = 0; k < 6; k++) {
        const a = box(.19, .19, .19, .55); a.position.set(-1.15 + (k % 2) * .26, .1, -.3 + Math.floor(k / 2) * .3); src.add(a);
        const b = box(.19, .19, .19, .22); b.position.set(.95 + (k % 2) * .26, .1, -.3 + Math.floor(k / 2) * .3); dst.add(b);
      }
      g.add(src); g.add(dst);
      g.add(line(new T.Vector3(-.55, .1, 0), new T.Vector3(.62, .1, 0), .3));
      const fly = box(.19, .19, .19, 1); g.add(fly);
      g.userData.tick = t => {
        const p = (t * .34) % 1;
        fly.position.set(-.55 + p * 1.17, .1 + Math.sin(p * Math.PI) * .3, 0);
        fly.rotation.y = p * 3.2;
        dst.children.forEach((b, k) => { b.material.opacity = .22 + (p > (k + 1) / 7 ? .34 : 0); });
      };
    }

    if (l.motif === 'nodes') {
      const ring = [];
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        const m = new T.Mesh(new T.SphereGeometry(.075, 10, 10), dot(.6));
        m.position.set(Math.cos(a) * .78, .05, Math.sin(a) * .6);
        g.add(m); ring.push(m);
        g.add(line(new T.Vector3(0, .05, 0), m.position.clone(), .18));
      }
      const core = new T.Mesh(new T.SphereGeometry(.12, 12, 12), dot(.95));
      core.position.y = .05; g.add(core);
      g.userData.tick = t => {
        ring.forEach((m, k) => { m.material.opacity = .3 + Math.abs(Math.sin(t * 1.1 + k * .9)) * .6; });
        core.scale.setScalar(1 + Math.sin(t * 1.6) * .14);
        g.rotation.y = t * .16;
      };
    }
  }

  function initScene() {
    const canvas = document.getElementById('scene-canvas');
    const T = window.THREE;
    if (!canvas || !T) return;

    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(34, 1, .1, 200);
    cam.position.set(0, 3.2, 12.4);
    const rend = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    rend.setPixelRatio(Math.min(devicePixelRatio, 2));
    scene.add(new T.AmbientLight(0xffffff, .58));
    const key = new T.DirectionalLight(0xffffff, .85); key.position.set(4, 9, 6); scene.add(key);
    const fill = new T.DirectionalLight(0xd98a4f, .4); fill.position.set(-6, -2, -4); scene.add(fill);
    const glow = new T.PointLight(0xd98a4f, .5, 22); glow.position.set(2.6, 1.2, 4.2); scene.add(glow);
    const rim = new T.PointLight(0x8fb6c9, .3, 24); rim.position.set(-5, 4, -5); scene.add(rim);

    const grp = new T.Group(); scene.add(grp);
    const slabs = [];
    const bodyGeo = new T.BoxGeometry(4.7, .34, 3.1);
    const edgeGeo = new T.EdgesGeometry(bodyGeo);
    const hex = n => '#' + n.toString(16).padStart(6, '0');

    const faceTexture = l => {
      const c = document.createElement('canvas');
      c.width = 1024; c.height = 676;
      const x = c.getContext('2d');
      x.fillStyle = '#241f1b'; x.fillRect(0, 0, 1024, 676);
      x.strokeStyle = 'rgba(255,255,255,.05)'; x.lineWidth = 1;
      for (let gx = 0; gx < 1024; gx += 48) { x.beginPath(); x.moveTo(gx, 0); x.lineTo(gx, 676); x.stroke(); }
      for (let gy = 0; gy < 676; gy += 48) { x.beginPath(); x.moveTo(0, gy); x.lineTo(1024, gy); x.stroke(); }
      x.fillStyle = hex(l.color);
      x.font = "500 26px 'JetBrains Mono', monospace";
      x.fillText(l.kind, 54, 150);
      x.fillStyle = '#f7f3ec';
      x.font = "700 " + (l.mark.length > 11 ? 62 : 84) + "px 'Space Grotesk', sans-serif";
      x.fillText(l.mark, 54, 262);
      x.fillStyle = 'rgba(247,243,236,.42)';
      x.font = "400 27px 'JetBrains Mono', monospace";
      x.fillText(l.when.toUpperCase(), 56, 330);
      x.fillStyle = hex(l.color);
      x.fillRect(54, 372, 300, 3);
      x.fillStyle = 'rgba(247,243,236,.3)';
      x.font = "400 23px 'JetBrains Mono', monospace";
      x.fillText(l.motto, 56, 428);
      const t = new T.CanvasTexture(c);
      t.anisotropy = 4;
      t.center.set(.5, .5); t.rotation = Math.PI;
      return t;
    };

    LAYERS.forEach((l, i) => {
      const g = new T.Group();
      const mat = new T.MeshStandardMaterial({
        color: 0x241f1b, metalness: .55, roughness: .38,
        emissive: new T.Color(l.color), emissiveIntensity: 0
      });
      const top = new T.MeshStandardMaterial({ map: faceTexture(l), metalness: .3, roughness: .55 });
      const body = new T.Mesh(bodyGeo, [mat, mat, top, mat, mat, mat]);
      body.userData.i = i;
      g.add(body);
      const mo = new T.Group();
      mo.position.set(-1.2, .175, 0);
      motif(T, mo, l);
      g.add(mo);

      const rail = new T.Mesh(new T.BoxGeometry(4.74, .07, .07), new T.MeshBasicMaterial({ color: l.color, transparent: true, opacity: .55 }));
      rail.position.set(0, .175, 1.545);
      g.add(rail);

      const side = new T.Mesh(new T.BoxGeometry(.07, .07, 3.14), new T.MeshBasicMaterial({ color: l.color, transparent: true, opacity: .35 }));
      side.position.set(-2.35, .175, 0);
      g.add(side);

      const edge = new T.LineSegments(edgeGeo, new T.LineBasicMaterial({ color: 0xf7f3ec, transparent: true, opacity: .2 }));
      g.add(edge);

      g.position.set(0, 2.6 - i * 1.3, 0);
      g.rotation.y = i * 0.12;
      g.userData = { i, mat, top, rail, side, edge, mo };
      grp.add(g); slabs.push(g);
    });
    grp.add(new T.Mesh(new T.CylinderGeometry(.045, .045, .34 + (LAYERS.length - 1) * 1.3 + .56, 8), new T.MeshBasicMaterial({ color: 0xd98a4f, transparent: true, opacity: .22 })));

    const floor = new T.GridHelper(26, 26, 0x3a302a, 0x2a231f);
    floor.position.y = -4.5;
    floor.material.transparent = true; floor.material.opacity = .38;
    scene.add(floor);
    const pool = new T.Mesh(new T.CircleGeometry(4.6, 48), new T.MeshBasicMaterial({ color: 0xd98a4f, transparent: true, opacity: .05 }));
    pool.rotation.x = -Math.PI / 2; pool.position.y = -4.47;
    scene.add(pool);

    let ry = -0.55, rx = 0.52, spin = 0.0016, dragging = false, px = 0, py = 0, moved = 0;
    const box3 = new T.Box3(), bSize = new T.Vector3(), bCtr = new T.Vector3();
    let fitZ = 16, fitY = 0, frame = 0, sel = selectedLayer;
    const ray = new T.Raycaster(), pt = new T.Vector2();

    layerListeners.push(i => { sel = i; });

    canvas.addEventListener('pointerdown', e => { dragging = true; moved = 0; px = e.clientX; py = e.clientY; spin = 0; canvas.classList.add('is-dragging'); });
    window.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - px, dy = e.clientY - py;
      moved += Math.abs(dx) + Math.abs(dy);
      ry += dx * 0.008;
      rx = Math.max(-0.15, Math.min(1.05, rx + dy * 0.005));
      px = e.clientX; py = e.clientY;
    });
    window.addEventListener('pointerup', () => { if (dragging) { dragging = false; canvas.classList.remove('is-dragging'); } });
    canvas.addEventListener('click', e => {
      if (moved > 12) return;
      const r = canvas.getBoundingClientRect();
      pt.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pt.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(pt, cam);
      const hit = ray.intersectObjects(slabs, true)[0];
      if (hit) { let o = hit.object; while (o && o.userData.i === undefined) o = o.parent; if (o) selectLayer(o.userData.i); }
    });

    const loop = () => {
      requestAnimationFrame(loop);
      if (!canvas.isConnected || !canvas.clientWidth) return;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * rend.getPixelRatio()) || canvas.height !== Math.round(h * rend.getPixelRatio())) {
        rend.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
        frame = 0;
      }
      ry += spin;
      grp.rotation.y += (ry - grp.rotation.y) * .1;
      grp.rotation.x += (rx - grp.rotation.x) * .1;
      const pulse = .42 + Math.sin(performance.now() / 620) * .1;
      slabs.forEach((g, i) => {
        const on = i === sel, u = g.userData;
        g.position.x += ((on ? .82 : 0) - g.position.x) * .1;
        g.position.y += (((2.6 - i * 1.3) + (on ? .22 : 0)) - g.position.y) * .1;
        g.rotation.y += ((on ? i * 0.12 - .1 : i * 0.12) - g.rotation.y) * .1;
        u.mat.emissiveIntensity += ((on ? pulse : .04) - u.mat.emissiveIntensity) * .1;
        u.top.color.setScalar(u.top.color.r + ((on ? 1 : .74) - u.top.color.r) * .1);
        u.mat.metalness += ((on ? .3 : .55) - u.mat.metalness) * .1;
        u.rail.material.opacity += ((on ? 1 : .45) - u.rail.material.opacity) * .1;
        u.side.material.opacity += ((on ? .8 : .28) - u.side.material.opacity) * .1;
        u.edge.material.opacity += ((on ? .55 : .16) - u.edge.material.opacity) * .1;
        if (u.mo && u.mo.userData.tick) u.mo.userData.tick(performance.now() / 1000 + i * 1.7);
      });
      glow.intensity = .42 + Math.sin(performance.now() / 900) * .08;

      if (frame++ % 8 === 0) {
        grp.updateMatrixWorld(true);
        box3.setFromObject(grp);
        box3.getSize(bSize); box3.getCenter(bCtr);
        const tan = Math.tan(34 * Math.PI / 360);
        const dV = (bSize.y / 2) / tan;
        const dH = (bSize.x / 2) / (tan * cam.aspect);
        fitZ = Math.max(dV, dH) * 1.04 + bSize.z / 2;
        fitY = bCtr.y;
      }
      cam.position.y += (fitY - cam.position.y) * .08;
      cam.position.z += (fitZ - cam.position.z) * .08;
      cam.lookAt(0, fitY, 0);
      rend.render(scene, cam);
    };
    loop();
  }

  // script.js is loaded at the end of <body>, after three.min.js, so the DOM
  // and window.THREE are already available — no need to wait for an event.
  try { initScene(); } catch (e) { console.warn('3D scene failed to initialize:', e); }
})();