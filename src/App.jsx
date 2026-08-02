import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ======================================================================
// IKON UI
// ======================================================================
const Icons = {
  Plus: (props) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Minus: (props) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="5" y1="12" x2="19" y2="12"/></svg>,
};

// ======================================================================
// KOMPONEN UI KUSTOM (Diperbarui ke Tema Mega Studio)
// ======================================================================
const Accordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#222]">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center justify-between w-full py-4 px-5 bg-transparent hover:bg-[#111] transition-colors text-[11px] font-bold text-[#00FFFF] uppercase tracking-[0.2em]"
        style={{ fontFamily: "'Space Mono', monospace" }}
      >
        <span>{title}</span>
        {isOpen ? <Icons.Minus className="text-[#00FFFF]" /> : <Icons.Plus className="text-[#00FFFF]" />}
      </button>
      {isOpen && <div className="px-5 pb-5 space-y-6 bg-transparent">{children}</div>}
    </div>
  );
};

const Slider = ({ label, desc, value, min, max, step, onChange }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-1">
        <div>
          <div className="text-[10px] font-bold text-[#888] uppercase tracking-widest">{label}</div>
          {desc && <div className="text-[9px] text-[#555] font-medium mt-0.5 leading-tight">{desc}</div>}
        </div>
        <div className="text-[11px] text-[#10B981] font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>{value}</div>
      </div>
      <div className="relative mt-2 h-3 flex items-center group">
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full absolute z-10 opacity-0 cursor-pointer h-full"
        />
        <div className="w-full h-[3px] bg-[#333] rounded-full overflow-hidden absolute">
           <div className="h-full bg-[#00FFFF] transition-all duration-75 shadow-[0_0_5px_rgba(0,255,255,0.5)]" style={{ width: `${percentage}%` }}></div>
        </div>
        <div 
          className="h-3 w-3 bg-[#10B981] rounded-full absolute transition-colors shadow-[0_0_8px_rgba(16,185,129,0.8)] pointer-events-none" 
          style={{ left: `calc(${percentage}% - 6px)` }}
        ></div>
      </div>
    </div>
  );
};

const ToggleButton = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full py-2.5 text-[12px] font-bold transition-all border ${
      active ? 'bg-[#111] text-[#10B981] border-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-transparent text-[#888] border-[#333] hover:border-[#555] hover:text-[#ccc]'
    }`}
    style={{ fontFamily: "'Space Mono', monospace" }}
  >
    {label}
  </button>
);

const ButtonGroup = ({ options, active, onChange }) => (
  <div className="flex border border-[#333] w-full bg-[#111] rounded overflow-hidden">
    {options.map((opt, i) => (
      <button
        key={opt} onClick={() => onChange(opt)}
        className={`flex-1 text-[11px] py-2 font-bold tracking-wide transition-colors ${i !== 0 ? 'border-l border-[#333]' : ''} ${
          active === opt ? 'bg-[#222] text-[#00FFFF] shadow-[inset_0_-2px_0_#00FFFF]' : 'bg-transparent text-[#888] hover:bg-[#222] hover:text-[#ccc]'
        }`}
        style={{ fontFamily: "'Space Mono', monospace" }}
      >
        {opt}
      </button>
    ))}
  </div>
);

// ======================================================================
// KONFIGURASI GLOBAL & RESOLUSI (TIDAK DISENTUH LOGIKANYA)
// ======================================================================
const RESOLUTIONS = {
  'Square 1:1 (1080x1080)': { w: 1080, h: 1080 },
  'Portrait 4:5 (1080x1350)': { w: 1080, h: 1350 },
  'Landscape 16:9 (1920x1080)': { w: 1920, h: 1080 },
  'Instagram Story (1080x1920)': { w: 1080, h: 1920 },
  'Poster (2400x3000)': { w: 2400, h: 3000 }
};

const PRESET_IMAGES = [
  { name: 'MI Image 01 (Bird)', url: 'https://images.unsplash.com/photo-1553285991-4c759f20e4db?q=80&w=1600&auto=format&fit=crop' },
  { name: 'MI Image 02 (Horse)', url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=1600&auto=format&fit=crop' },
  { name: 'MI Image 03 (Buddha)', url: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1600&auto=format&fit=crop' },
  { name: 'MI Image 04 (Eye)', url: 'https://images.unsplash.com/photo-1505144808419-f951152011b9?q=80&w=1600&auto=format&fit=crop' }
];

export default function App() {
  const canvasRef = useRef(null);
  
  // State Gambar
  const [baseImage, setBaseImage] = useState(null);
  const [textureImage, setTextureImage] = useState(null);
  const [offscreenPixelCanvas, setOffscreenPixelCanvas] = useState(null);
  
  // State Interaksi (Sensor, Gravitasi, Tipografi)
  const [activeTool, setActiveTool] = useState('Pixelate'); // Pixelate, Gravity, Move Text
  const [isInteracting, setIsInteracting] = useState(false);
  
  const [pixelZones, setPixelZones] = useState([]);
  const [gravityZones, setGravityZones] = useState([]);
  
  // Custom Stamps (Typography)
  const [stampInput, setStampInput] = useState('CLASSIFIED DATA');
  const [customStamps, setCustomStamps] = useState([]);
  const [draggingStampId, setDraggingStampId] = useState(null);
  
  // ======================================================================
  // MASTER MEMORY & IMAGE DATA CACHE
  // ======================================================================
  const imgDataRef = useRef(null);

  const [config, setConfig] = useState({
    imageOpacity: 0.85,
    pixelSize: 16, zoneSize: 100, strokeOn: true,
    gravityRadius: 200, gravityStrength: 0.8,
    
    // REBRANDING TEXT
    textTL: 'Riddlebush Archive', textTR: 'Generative Engine', 
    textBL: 'https://riddlebushapp.vercel.app/', textBR: 'Jakarta, Indonesia', frameTextSize: 12,
    
    // Crosshair Frame
    frameOn: true, frameStyle: 'Blueprint', frameSize: 100, dashPattern: 20, frameStroke: 2, starSize: 80, starPoints: 8,
    
    chainOn: true, chainCount: 11, chainAngle: 45, chainBaseRadius: 250, chainSizeRatio: 0.79, intersectionsOn: true, markerSize: 50,
    
    // 4 Mode Detection Terpisah
    detectMode: 'Contrast', // Pilihan: 'Combined', 'Contrast', 'Bright', 'Dark'
    blockSize: 20, threshold: 25, maxCircles: 150,
    
    // Shapes & Connections
    shapeType: 'Square', minRadius: 4, maxRadius: 24, shapeStroke: 1, 
    seed: 525, labelSize: 10, overlayOpacity: 100, maxDistanceLine: 40, lineWeight: 0.8,
    lineColor: 'rgba(255, 255, 255, 0.85)', bgColor: '#050505',
    resolution: 'Portrait 4:5 (1080x1350)', textureOpacity: 0.50
  });

  const activeRes = RESOLUTIONS[config.resolution];

  useEffect(() => { loadBaseImage(PRESET_IMAGES[0].url); }, []);

  const loadBaseImage = (url) => {
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => { 
        setBaseImage(img); setPixelZones([]); 
        extractImageData(img);
    }; 
    img.src = url;
  };

  const handleImageUpload = (e, isTexture = false) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image(); img.onload = () => { 
        if (isTexture) setTextureImage(img); 
        else { setBaseImage(img); setPixelZones([]); extractImageData(img); }
      }; img.src = url;
    }
  };

  // ======================================================================
  // FUNGSI EKSTRAKSI DATA GAMBAR (Hanya jalan saat gambar berubah)
  // ======================================================================
  const extractImageData = useCallback((img = baseImage) => {
      if(!img) return;
      const { w, h } = activeRes;
      const offCanvas = document.createElement('canvas');
      offCanvas.width = w; offCanvas.height = h;
      const ctx = offCanvas.getContext('2d', { willReadFrequently: true });
      
      const imgRatio = img.width / img.height; const canvasRatio = w / h;
      let sWidth = img.width, sHeight = img.height, sx = 0, sy = 0;
      if (imgRatio > canvasRatio) { sWidth = img.height * canvasRatio; sx = (img.width - sWidth) / 2; } 
      else { sHeight = img.width / canvasRatio; sy = (img.height - sHeight) / 2; }
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, w, h);
      
      try { imgDataRef.current = ctx.getImageData(0, 0, w, h).data; } catch (e) {}
  }, [activeRes, baseImage]);

  useEffect(() => { extractImageData(); }, [extractImageData]);

  useEffect(() => {
    if (!baseImage) return;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = activeRes.w; offCanvas.height = activeRes.h;
    const ctx = offCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const scale = Math.max(0.01, (100 - config.pixelSize) / 100); 
    const sw = Math.max(1, activeRes.w * scale); const sh = Math.max(1, activeRes.h * scale);
    const imgRatio = baseImage.width / baseImage.height; const canvasRatio = activeRes.w / activeRes.h;
    let sWidth = baseImage.width, sHeight = baseImage.height, sx = 0, sy = 0;
    if (imgRatio > canvasRatio) { sWidth = baseImage.height * canvasRatio; sx = (baseImage.width - sWidth) / 2; } 
    else { sHeight = baseImage.width / canvasRatio; sy = (baseImage.height - sHeight) / 2; }
    ctx.drawImage(baseImage, sx, sy, sWidth, sHeight, 0, 0, sw, sh);
    ctx.drawImage(offCanvas, 0, 0, sw, sh, 0, 0, activeRes.w, activeRes.h);
    setOffscreenPixelCanvas(offCanvas);
  }, [baseImage, activeRes, config.pixelSize]);


  // ======================================================================
  // OTAK UTAMA: MONTE CARLO ORGANIC SAMPLING
  // Menghasilkan distribusi titik konstelasi yang natural
  // ======================================================================
  const activeNodesFiltered = useMemo(() => {
      if (!imgDataRef.current) return [];
      const candidates = [];
      const { w, h } = activeRes;
      const imgData = imgDataRef.current;
      const bs = config.blockSize;

      // Pseudo-random dinamis berdasar Seed untuk mengatur jitter dan label
      let currentSeed = config.seed;
      const random = () => { const x = Math.sin(currentSeed++) * 10000; return x - Math.floor(x); };

      // MONTE CARLO ORGANIC SAMPLING: Menyebar titik secara natural seperti konstelasi
      const attempts = Math.floor((w * h) / (bs * 1.5));
      for (let i = 0; i < attempts; i++) {
          const x = bs + (random() * (w - bs * 2));
          const y = bs + (random() * (h - bs * 2));
          const pxX = Math.floor(x); const pxY = Math.floor(y);
          const pxIdx = (pxY * w + pxX) * 4;
          const lumaCenter = (imgData[pxIdx] * 0.299 + imgData[pxIdx+1] * 0.587 + imgData[pxIdx+2] * 0.114);

          let score = 0;

          if (config.detectMode === 'Contrast') {
              let maxLuma = lumaCenter; let minLuma = lumaCenter;
              const offsets = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
              for (let [dx, dy] of offsets) {
                  const nx = Math.floor(x + (dx * bs)); const ny = Math.floor(y + (dy * bs));
                  const nIdx = (ny * w + nx) * 4;
                  if (nIdx >= 0 && nIdx < imgData.length) {
                      const luma = (imgData[nIdx] * 0.299 + imgData[nIdx+1] * 0.587 + imgData[nIdx+2] * 0.114);
                      if (luma > maxLuma) maxLuma = luma; if (luma < minLuma) minLuma = luma;
                  }
              }
              score = (Math.abs(maxLuma - minLuma) / 255) * 100;
          } else if (config.detectMode === 'Combined') {
              const scoreBright = (lumaCenter / 255) * 100;
              const scoreDark = ((255 - lumaCenter) / 255) * 100;
              score = Math.max(scoreBright, scoreDark);
          } else if (config.detectMode === 'Bright') {
              score = (lumaCenter / 255) * 100;
          } else if (config.detectMode === 'Dark') {
              score = ((255 - lumaCenter) / 255) * 100;
          }
          
          if (score >= config.threshold) {
              candidates.push({ x, y, score, sizeBias: random(), labelVal1: random(), labelVal2: random() });
          }
      }

      // Mengurutkan dan mengambil titik dengan skor tertinggi (Top-Tier Sorting)
      candidates.sort((a, b) => b.score - a.score);
      const topCandidates = candidates.slice(0, config.maxCircles);

      return topCandidates.map(node => {
          const radius = config.minRadius + (node.sizeBias * (config.maxRadius - config.minRadius));
          
          let label = '';
          if (node.labelVal1 < 0.3) label = `${Math.floor(node.x)}x${Math.floor(node.y)}`;
          else if (node.labelVal1 < 0.6) label = `R: ${(node.labelVal2 * 100).toFixed(2)}`;
          else label = `${Math.floor(node.labelVal1 * 50)}+${Math.floor(node.labelVal2 * 50)}`;

          return { baseX: node.x, baseY: node.y, x: node.x, y: node.y, radius, label };
      });
  }, [activeRes, config.detectMode, config.threshold, config.blockSize, config.maxCircles, config.minRadius, config.maxRadius, config.seed]);


  // ======================================================================
  // OTAK RENDERER: K-NEAREST NEIGHBOR (SOLUSI ANTI-KUSUT MUTLAK)
  // ======================================================================
  const renderCanvas = useCallback(() => {
    if (!canvasRef.current || !baseImage) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { w, h } = activeRes;

    ctx.clearRect(0, 0, w, h); ctx.fillStyle = config.bgColor; ctx.fillRect(0, 0, w, h);

    // 1. Gambar Asli
    ctx.globalAlpha = config.imageOpacity;
    const imgRatio = baseImage.width / baseImage.height; const canvasRatio = w / h;
    let sWidth = baseImage.width, sHeight = baseImage.height, sx = 0, sy = 0;
    if (imgRatio > canvasRatio) { sWidth = baseImage.height * canvasRatio; sx = (baseImage.width - sWidth) / 2; } 
    else { sHeight = baseImage.width / canvasRatio; sy = (baseImage.height - sHeight) / 2; }
    ctx.drawImage(baseImage, sx, sy, sWidth, sHeight, 0, 0, w, h);
    ctx.globalAlpha = 1.0;

    // 2. Pixelate Area
    if (offscreenPixelCanvas && pixelZones.length > 0) {
        pixelZones.forEach(zone => {
            const zs = config.zoneSize; const zx = zone.x - zs/2; const zy = zone.y - zs/2;
            ctx.drawImage(offscreenPixelCanvas, zx, zy, zs, zs, zx, zy, zs, zs);
            if (config.strokeOn) { 
                ctx.strokeStyle = config.lineColor; ctx.globalAlpha = 0.4;
                ctx.lineWidth = 0.8; ctx.strokeRect(zx, zy, zs, zs); ctx.globalAlpha = 1.0;
            }
        });
    }

    // 3. Kalkulasi Gravitasi
    const renderNodes = activeNodesFiltered.map(node => {
        let nx = node.baseX, ny = node.baseY;
        gravityZones.forEach(gz => {
            const dx = nx - gz.x; const dy = ny - gz.y; const dist = Math.hypot(dx, dy);
            if (dist < config.gravityRadius) {
                const pull = (config.gravityRadius - dist) / config.gravityRadius;
                nx -= dx * pull * config.gravityStrength; ny -= dy * pull * config.gravityStrength;
            }
        });
        return { ...node, x: nx, y: ny };
    });

    if (activeTool === 'Gravity' && gravityZones.length > 0) {
        gravityZones.forEach(gz => {
            ctx.beginPath(); ctx.arc(gz.x, gz.y, config.gravityRadius, 0, Math.PI*2);
            ctx.strokeStyle = config.gravityStrength > 0 ? 'rgba(0,255,0,0.3)' : 'rgba(255,0,0,0.3)';
            ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]);
        });
    }

    // ==================================================================
    // ALGORITMA PENYORTIRAN JARAK SPASIAL (K-NEAREST NEIGHBORS)
    // ==================================================================
    ctx.globalAlpha = config.overlayOpacity / 100;
    ctx.strokeStyle = config.lineColor; ctx.fillStyle = config.lineColor;
    ctx.lineWidth = config.lineWeight;
    
    for (let i = 0; i < renderNodes.length; i++) {
        const n1 = renderNodes[i];
        
        let neighbors = [];
        for (let j = i + 1; j < renderNodes.length; j++) {
            const n2 = renderNodes[j];
            const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
            if (dist <= config.maxDistanceLine) {
                neighbors.push({ node: n2, dist: dist });
            }
        }
        
        // MENGURUTKAN BERDASARKAN JARAK TERDEKAT. Garis hanya menyambung ke tetangga terdekat.
        neighbors.sort((a, b) => a.dist - b.dist);
        
        // SAMBUNGAN ORGANIK: Dinamis dengan ketebalan dan transparansi berdasarkan jarak
        const limit = Math.min(6, neighbors.length);
        for(let k = 0; k < limit; k++) {
            const neighbor = neighbors[k];
            ctx.beginPath(); 
            ctx.moveTo(n1.x, n1.y); 
            ctx.lineTo(neighbor.node.x, neighbor.node.y);
            
            // ALPHA & WEIGHT DINAMIS: Dekat = tebal & terang, Jauh = tipis & pudar
            const alpha = Math.max(0.05, 1 - (neighbor.dist / config.maxDistanceLine));
            ctx.lineWidth = config.lineWeight * (alpha + 0.3);
            ctx.strokeStyle = config.lineColor.replace(/[^,]+(?=\))/, alpha.toFixed(2)); 
            ctx.stroke();
        }
    }

    // 4. Render Bentuk dan Label
    renderNodes.forEach(node => {
        ctx.strokeStyle = config.lineColor.replace(/[^,]+(?=\))/, '0.9'); 
        ctx.lineWidth = config.shapeStroke; 
        ctx.beginPath();
        if (config.shapeType === 'Circle') ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        else ctx.rect(node.x - node.radius, node.y - node.radius, node.radius * 2, node.radius * 2);
        ctx.stroke();

        ctx.lineWidth = config.shapeStroke * 0.4; 
        const crossLen = node.radius * 0.3; 
        ctx.beginPath();
        ctx.moveTo(node.x - crossLen, node.y); ctx.lineTo(node.x + crossLen, node.y);
        ctx.moveTo(node.x, node.y - crossLen); ctx.lineTo(node.x, node.y + crossLen);
        ctx.stroke();

        if (config.labelSize > 0) {
            ctx.fillStyle = config.lineColor.replace(/[^,]+(?=\))/, '0.8');
            ctx.font = `${config.labelSize}px "Courier New", monospace`;
            ctx.fillText(node.label, node.x + node.radius + 4, node.y - node.radius - 2);
        }
    });

    // 5. Typography Custom Stamps
    customStamps.forEach(stamp => {
        ctx.fillStyle = config.lineColor;
        ctx.font = `600 ${stamp.size}px "Space Mono", monospace`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (stamp.id === draggingStampId) { ctx.shadowColor = config.lineColor; ctx.shadowBlur = 15; }
        ctx.fillText(stamp.text, stamp.x, stamp.y);
        ctx.shadowBlur = 0; 
    });

    // 6. Chain
    if (config.chainOn) {
        const drawChainSide = (directionAngle) => {
            let cx = w/2, cy = h/2, r = config.chainBaseRadius;
            const angleRad = directionAngle * (Math.PI / 180);
            ctx.lineWidth = config.shapeStroke; 
            const chainColor = config.lineColor.replace(/[^,]+(?=\))/, '0.6');
            ctx.strokeStyle = chainColor; ctx.fillStyle = chainColor;

            for (let i = 0; i < config.chainCount; i++) {
                ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.stroke();
                
                const tLen = r * 0.5;
                ctx.beginPath(); ctx.moveTo(cx, cy - tLen); ctx.lineTo(cx, cy + tLen); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(cx - tLen, cy); ctx.lineTo(cx + tLen, cy); ctx.stroke();

                const nx = cx + r * Math.cos(angleRad); const ny = cy + r * Math.sin(angleRad);
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny); ctx.stroke();
                
                if (config.intersectionsOn) { ctx.beginPath(); ctx.arc(nx, ny, config.markerSize / 10, 0, Math.PI*2); ctx.fill(); }
                const nextR = r * config.chainSizeRatio;
                cx += (r + nextR) * Math.cos(angleRad); cy += (r + nextR) * Math.sin(angleRad); r = nextR;
            }
        };
        drawChainSide(config.chainAngle); drawChainSide(config.chainAngle + 180);
    }

    // 7. Crosshair Frame Blueprint
    if (config.frameOn) {
        const m = config.frameSize; const cx = w / 2; const cy = h / 2;
        
        ctx.strokeStyle = config.lineColor.replace(/[^,]+(?=\))/, '0.6'); 
        ctx.lineWidth = config.frameStroke; 
        
        if (config.dashPattern > 0) ctx.setLineDash([config.dashPattern, config.dashPattern]);
        ctx.strokeRect(m, m, w - m*2, h - m*2); 
        
        if (config.frameStyle === 'Blueprint') {
            ctx.beginPath(); 
            ctx.moveTo(cx, 0); ctx.lineTo(cx, h); 
            ctx.moveTo(0, cy); ctx.lineTo(w, cy); 
            ctx.stroke();
        }
        
        ctx.setLineDash([]); 
        ctx.strokeStyle = config.lineColor.replace(/[^,]+(?=\))/, '0.9');

        if (config.frameStyle === 'Blueprint') {
            const cl = 30 + config.frameStroke * 2; 
            ctx.beginPath();
            ctx.moveTo(m, m + cl); ctx.lineTo(m, m); ctx.lineTo(m + cl, m); 
            ctx.moveTo(w - m - cl, m); ctx.lineTo(w - m, m); ctx.lineTo(w - m, m + cl); 
            ctx.moveTo(w - m, h - m - cl); ctx.lineTo(w - m, h - m); ctx.lineTo(w - m - cl, h - m); 
            ctx.moveTo(m, h - m - cl); ctx.lineTo(m, h - m); ctx.lineTo(m + cl, h - m); 
            ctx.stroke();

            const cMid = 15 + config.frameStroke;
            const drawMidCross = (x, y) => { 
                ctx.beginPath(); ctx.moveTo(x - cMid, y); ctx.lineTo(x + cMid, y); 
                ctx.moveTo(x, y - cMid); ctx.lineTo(x, y + cMid); ctx.stroke(); 
            };
            drawMidCross(cx, m); drawMidCross(cx, h - m); drawMidCross(m, cy); drawMidCross(w - m, cy);
            
            if(config.starSize > 0) {
                const step = (Math.PI * 2) / config.starPoints;
                ctx.beginPath();
                for(let i=0; i<config.starPoints; i++) {
                    const angle = i * step; 
                    ctx.moveTo(cx, cy); 
                    ctx.lineTo(cx + Math.cos(angle)*(config.starSize/2), cy + Math.sin(angle)*(config.starSize/2)); 
                }
                ctx.stroke();
            }

        } else {
            const cl = 20 + config.frameStroke; 
            const drawCross = (x, y) => { ctx.beginPath(); ctx.moveTo(x - cl, y); ctx.lineTo(x + cl, y); ctx.moveTo(x, y - cl); ctx.lineTo(x, y + cl); ctx.stroke(); };
            drawCross(m, m); drawCross(w-m, m); drawCross(m, h-m); drawCross(w-m, h-m);
            
            if(config.starSize > 0) {
                const drawStar = (x, y) => {
                    const step = (Math.PI * 2) / config.starPoints;
                    for(let i=0; i<config.starPoints; i++) {
                        const angle = i * step; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(angle)*(config.starSize/2), y + Math.sin(angle)*(config.starSize/2)); ctx.stroke();
                    }
                };
                drawStar(w/2, m); drawStar(w/2, h-m); drawStar(m, h/2); drawStar(w-m, h/2);
            }
        }
    }

    // 8. Teks Sudut
    ctx.fillStyle = config.lineColor.replace(/[^,]+(?=\))/, '0.9'); 
    ctx.font = `300 ${config.frameTextSize}px "Space Mono", monospace`;
    const textPad = config.frameOn ? config.frameSize - 20 : 30;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText(config.textTL, textPad, textPad);
    ctx.textAlign = 'right'; ctx.fillText(config.textTR, w - textPad, textPad);
    ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.fillText(config.textBL, textPad, h - textPad);
    ctx.textAlign = 'right'; ctx.fillText(config.textBR, w - textPad, h - textPad);

    // 9. Tekstur
    ctx.globalAlpha = config.textureOpacity;
    if (textureImage) { ctx.globalCompositeOperation = 'overlay'; ctx.drawImage(textureImage, 0, 0, w, h); } 
    ctx.globalAlpha = 1.0; ctx.globalCompositeOperation = 'source-over';

  }, [baseImage, activeRes, config, activeNodesFiltered, pixelZones, gravityZones, customStamps, draggingStampId, offscreenPixelCanvas, textureImage, activeTool]);

  useEffect(() => {
    let animationFrameId;
    const renderLoop = () => { renderCanvas(); animationFrameId = requestAnimationFrame(renderLoop); };
    renderLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [renderCanvas]);

  const handleCanvasAction = (e) => {
    if(!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (activeRes.w / rect.width);
    const y = (e.clientY - rect.top) * (activeRes.h / rect.height);

    if (e.type === 'mousedown') {
        setIsInteracting(true);
        if (activeTool === 'Move Text') {
            const hit = customStamps.find(s => {
                const w = s.text.length * (s.size * 0.6); const h = s.size;
                return (x >= s.x - w/2 && x <= s.x + w/2 && y >= s.y - h/2 && y <= s.y + h/2);
            });
            if (hit) setDraggingStampId(hit.id);
        } else if (activeTool === 'Pixelate') { setPixelZones(prev => [...prev, { x, y }]);
        } else if (activeTool === 'Gravity') { setGravityZones(prev => [...prev, { x, y }]); }
    } else if (e.type === 'mousemove' && isInteracting) {
        if (activeTool === 'Move Text' && draggingStampId) { setCustomStamps(prev => prev.map(s => s.id === draggingStampId ? { ...s, x, y } : s)); } 
        else if (activeTool === 'Pixelate') { setPixelZones(prev => [...prev, { x, y }]); } 
        else if (activeTool === 'Gravity') { setGravityZones(prev => [...prev, { x, y }]); }
    } else if (e.type === 'mouseup' || e.type === 'mouseleave') { setIsInteracting(false); setDraggingStampId(null); }
  };

  const addStamp = () => {
      if(!stampInput) return;
      setCustomStamps(prev => [...prev, { id: Date.now(), text: stampInput, x: activeRes.w/2, y: activeRes.h/2, size: 48 }]);
      setActiveTool('Move Text');
  };

  // ======================================================================
  // SMART RANDOMIZER: RUMUS KUNCI ANTI-KUSUT SPAGHETTI
  // ======================================================================
  const randomizeAll = () => {
    // AESTHETIC SWEET SPOT: Mengunci rentang acak pada rasio emas agar selalu elegan
    const randomBlockSize = Math.floor(Math.random() * 12) + 8; // 8 - 20 (Sangat detail/halus)
    const maxLineDist = Math.floor(Math.random() * 35) + 15; // 15 - 50 (Garis selalu pendek/lokal)

    setConfig(prev => ({ ...prev,
        detectMode: ['Combined', 'Contrast', 'Bright', 'Dark'][Math.floor(Math.random() * 4)],
        seed: Math.floor(Math.random() * 1000),
        chainAngle: Math.floor(Math.random() * 360),
        
        // Threshold dijaga moderat agar menangkap detail wajah tanpa over-exposure
        threshold: Math.floor(Math.random() * 25) + 10, // 10 - 35
        
        blockSize: randomBlockSize,
        maxDistanceLine: maxLineDist, 
        
        shapeType: Math.random() > 0.7 ? 'Square' : 'Circle', 
        // Titik diperbanyak untuk kepadatan konstelasi
        maxCircles: Math.floor(Math.random() * 300) + 150, // 150 - 450
        
        // KUNCIAN ESTETIKA: Ketebalan garis & bentuk DIKUNCI tipis maksimal 0.4
        lineWeight: Number((Math.random() * 0.3 + 0.1).toFixed(2)), // 0.1 - 0.4
        shapeStroke: Number((Math.random() * 0.3 + 0.1).toFixed(2)) // 0.1 - 0.4
    }));
  };

  const exportPNG = () => {
    const link = document.createElement('a'); link.download = `Blueprint_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0); link.click();
  };

  const exportSVG = () => {
      const { w, h } = activeRes;
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`;
      svg += `<rect width="${w}" height="${h}" fill="${config.bgColor}" />`;
      
      const renderNodes = activeNodesFiltered.map(node => {
          let nx = node.baseX, ny = node.baseY;
          gravityZones.forEach(gz => {
              const dx = nx - gz.x; const dy = ny - gz.y; const dist = Math.hypot(dx, dy);
              if (dist < config.gravityRadius) { const pull = (config.gravityRadius - dist) / config.gravityRadius; nx -= dx * pull * config.gravityStrength; ny -= dy * pull * config.gravityStrength; }
          });
          return { ...node, x: nx, y: ny };
      });

      svg += `<g stroke="${config.lineColor.replace(/[^,]+(?=\))/, '0.85')}" stroke-width="${config.lineWeight}">`;
      
      for (let i = 0; i < renderNodes.length; i++) {
        let n1 = renderNodes[i];
        let neighbors = [];
        for (let j = i + 1; j < renderNodes.length; j++) {
            let n2 = renderNodes[j];
            let dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
            if (dist <= config.maxDistanceLine) neighbors.push({node: n2, dist});
        }
        neighbors.sort((a,b) => a.dist - b.dist);
        let limit = Math.min(5, neighbors.length);
        for(let k = 0; k < limit; k++) {
            svg += `<line x1="${n1.x}" y1="${n1.y}" x2="${neighbors[k].node.x}" y2="${neighbors[k].node.y}" />`;
        }
      }
      svg += `</g>`;

      svg += `<g stroke="${config.lineColor.replace(/[^,]+(?=\))/, '0.9')}" stroke-width="${config.shapeStroke}" fill="none">`;
      renderNodes.forEach(node => {
          if (config.shapeType === 'Circle') svg += `<circle cx="${node.x}" cy="${node.y}" r="${node.radius}" />`;
          else svg += `<rect x="${node.x - node.radius}" y="${node.y - node.radius}" width="${node.radius*2}" height="${node.radius*2}" />`;
      });
      svg += `</g>`;

      svg += `<g fill="${config.lineColor.replace(/[^,]+(?=\))/, '0.9')}" text-anchor="middle" dominant-baseline="middle">`;
      customStamps.forEach(stamp => {
          svg += `<text x="${stamp.x}" y="${stamp.y}" font-family="Space Mono, monospace" font-weight="600" font-size="${stamp.size}">${stamp.text}</text>`;
      });
      svg += `</g></svg>`;

      const blob = new Blob([svg], {type: "image/svg+xml;charset=utf-8"});
      const link = document.createElement("a"); link.href = URL.createObjectURL(blob);
      link.download = `Blueprint_Vector_${Date.now()}.svg`; link.click();
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-[#050505] text-[#e5e5e5] selection:bg-[#00FFFF] selection:text-black">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-[360px] bg-[#0a0a0a] border-r border-[#222] flex flex-col h-[60vh] md:h-full order-2 md:order-1 shadow-2xl z-20 shrink-0">
        
        {/* HEADER (REBRANDING) */}
        <div className="p-6 border-b border-[#222] flex-none bg-[#111] z-10">
          <h1 className="text-[17px] font-bold text-[#10B981] tracking-wide" style={{ fontFamily: "'Space Mono', monospace" }}>Riddlebush Archive</h1>
          <p className="text-[11px] text-[#888] font-medium mt-0.5 tracking-wide">Data Generator Engine</p>
          
          <div className="mt-5 space-y-2">
            <button onClick={() => randomizeAll()} className="w-full bg-transparent border border-[#10B981] hover:bg-[#10B981] hover:text-black text-[#10B981] py-3.5 text-[13px] font-bold transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)]" style={{ fontFamily: "'Space Mono', monospace" }}>
              Randomize All
            </button>
          </div>
          <p className="text-[9.5px] text-[#555] mt-3 font-medium leading-relaxed">
            Shuffles every parameter except chain settings.
          </p>
        </div>

        {/* AREA GULIR */}
        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pb-10">
          
          <Accordion title="IMAGE">
             <input type="file" accept="image/*" id="imgUpload" className="hidden" onChange={handleImageUpload} />
             <label htmlFor="imgUpload" className="block w-full border border-[#00FFFF] text-[#00FFFF] hover:bg-[#222] hover:shadow-[0_0_10px_rgba(0,255,255,0.2)] text-center py-2.5 cursor-pointer transition-all text-[12px] font-bold bg-[#111] mb-4" style={{ fontFamily: "'Space Mono', monospace" }}>
                Upload Image
             </label>
             <Slider label="IMAGE OPACITY" desc="Fade the background image" min={0} max={1} step={0.05} value={config.imageOpacity} onChange={v => setConfig({...config, imageOpacity: v})} />
          </Accordion>

          <Accordion title="INTERACTIVE TOOLS" defaultOpen={true}>
             <div className="mb-4">
                 <p className="text-[10px] text-[#888] font-bold tracking-widest mb-2 uppercase">Select Active Tool</p>
                 <ButtonGroup options={['Pixelate', 'Gravity', 'Move Text']} active={activeTool} onChange={setActiveTool} />
             </div>
             {activeTool === 'Pixelate' && (
                 <div className="space-y-4 animate-in fade-in">
                     <Slider label="PIXEL SIZE" min={2} max={100} step={2} value={config.pixelSize} onChange={v => setConfig({...config, pixelSize: v})} />
                     <Slider label="ZONE SIZE" min={20} max={400} step={10} value={config.zoneSize} onChange={v => setConfig({...config, zoneSize: v})} />
                     <div className="flex gap-2">
                         <button onClick={() => setPixelZones(prev => prev.slice(0, -1))} className="flex-1 border border-[#333] bg-[#111] text-[#ccc] py-2.5 text-[12px] hover:bg-[#222] font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>Undo</button>
                         <button onClick={() => setPixelZones([])} className="flex-1 border border-[#333] bg-[#111] text-[#ccc] py-2.5 text-[12px] hover:bg-[#222] font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>Clear</button>
                     </div>
                 </div>
             )}
             {activeTool === 'Gravity' && (
                 <div className="space-y-4 animate-in fade-in">
                     <Slider label="GRAVITY RADIUS" min={50} max={500} step={10} value={config.gravityRadius} onChange={v => setConfig({...config, gravityRadius: v})} />
                     <Slider label="FORCE STRENGTH" min={-2} max={2} step={0.1} value={config.gravityStrength} onChange={v => setConfig({...config, gravityStrength: v})} />
                     <div className="flex gap-2">
                         <button onClick={() => setGravityZones(prev => prev.slice(0, -1))} className="flex-1 border border-[#333] bg-[#111] text-[#ccc] py-2.5 text-[12px] hover:bg-[#222] font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>Undo</button>
                         <button onClick={() => setGravityZones([])} className="flex-1 border border-[#333] bg-[#111] text-[#ccc] py-2.5 text-[12px] hover:bg-[#222] font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>Clear</button>
                     </div>
                 </div>
             )}
          </Accordion>

          <Accordion title="CUSTOM STAMPS">
             <input type="text" value={stampInput} onChange={e=>setStampInput(e.target.value)} className="w-full border border-[#333] p-2.5 text-xs outline-none bg-[#111] text-white font-medium focus:border-[#00FFFF] mb-2" placeholder="Enter text..." />
             <button onClick={addStamp} className="w-full bg-[#0891B2] hover:bg-[#06B6D4] text-black font-bold py-2.5 text-[12px] mb-4 transition-colors" style={{ fontFamily: "'Space Mono', monospace" }}>Add Stamp to Canvas</button>
             {customStamps.length > 0 && (
                 <div className="space-y-2">
                     <p className="text-[10px] text-[#888] font-bold tracking-widest uppercase">Active Stamps</p>
                     {customStamps.map(s => (
                         <div key={s.id} className="flex justify-between items-center bg-[#111] border border-[#333] p-2 text-xs">
                             <span className="truncate max-w-[200px] text-white" style={{ fontFamily: "'Space Mono', monospace" }}>{s.text}</span>
                             <button onClick={() => setCustomStamps(prev => prev.filter(x => x.id !== s.id))} className="text-red-500 hover:text-red-400 font-bold">X</button>
                         </div>
                     ))}
                 </div>
             )}
          </Accordion>

          <Accordion title="FRAME TEXT">
             <div className="space-y-2">
                <input type="text" value={config.textTL} onChange={e=>setConfig({...config, textTL:e.target.value})} className="w-full border border-[#333] p-2.5 text-xs outline-none bg-[#111] text-white focus:border-[#00FFFF]"/>
                <input type="text" value={config.textTR} onChange={e=>setConfig({...config, textTR:e.target.value})} className="w-full border border-[#333] p-2.5 text-xs outline-none bg-[#111] text-white focus:border-[#00FFFF]"/>
                <input type="text" value={config.textBL} onChange={e=>setConfig({...config, textBL:e.target.value})} className="w-full border border-[#333] p-2.5 text-xs outline-none bg-[#111] text-white focus:border-[#00FFFF]"/>
                <input type="text" value={config.textBR} onChange={e=>setConfig({...config, textBR:e.target.value})} className="w-full border border-[#333] p-2.5 text-xs outline-none bg-[#111] text-white focus:border-[#00FFFF]"/>
             </div>
             <div className="pt-2"><Slider label="TEXT SIZE" min={8} max={48} step={1} value={config.frameTextSize} onChange={v => setConfig({...config, frameTextSize: v})} /></div>
          </Accordion>

          <Accordion title="CROSSHAIR FRAME" defaultOpen={true}>
             <ToggleButton active={config.frameOn} label={config.frameOn ? "Frame On" : "Frame Off"} onClick={() => setConfig({...config, frameOn: !config.frameOn})} />
             <div className="pt-2">
                 <div className="text-[10px] text-[#888] font-bold tracking-widest mb-2 uppercase">Style</div>
                 <ButtonGroup options={['Classic', 'Blueprint']} active={config.frameStyle} onChange={v => setConfig({...config, frameStyle: v})} />
             </div>
             <Slider label="FRAME SIZE" min={0} max={500} step={2} value={config.frameSize} onChange={v => setConfig({...config, frameSize: v})} />
             <Slider label="DASH PATTERN" min={0} max={100} step={1} value={config.dashPattern} onChange={v => setConfig({...config, dashPattern: v})} />
             <Slider label="STROKE" min={1} max={30} step={1} value={config.frameStroke} onChange={v => setConfig({...config, frameStroke: v})} />
             <Slider label="STAR SIZE" min={0} max={200} step={2} value={config.starSize} onChange={v => setConfig({...config, starSize: v})} />
             <Slider label="STAR POINTS" min={4} max={32} step={2} value={config.starPoints} onChange={v => setConfig({...config, starPoints: v})} />
          </Accordion>

          <Accordion title="CHAIN">
            <ToggleButton active={config.chainOn} label={config.chainOn ? "Chain On" : "Chain Off"} onClick={() => setConfig({...config, chainOn: !config.chainOn})} />
            <Slider label="COUNT" min={1} max={50} step={1} value={config.chainCount} onChange={v => setConfig({...config, chainCount: v})} />
            <Slider label="ANGLE" min={0} max={360} step={1} value={config.chainAngle} onChange={v => setConfig({...config, chainAngle: v})} />
            <Slider label="BASE RADIUS" min={10} max={500} step={5} value={config.chainBaseRadius} onChange={v => setConfig({...config, chainBaseRadius: v})} />
            <Slider label="SIZE RATIO" min={0.1} max={2.0} step={0.01} value={config.chainSizeRatio} onChange={v => setConfig({...config, chainSizeRatio: v})} />
          </Accordion>

          <Accordion title="DETECTION" defaultOpen={true}>
            <div className="flex gap-2">
                <button
                    onClick={() => setConfig({...config, detectMode: 'Combined'})}
                    className={`flex-1 text-[11px] py-2 font-bold tracking-wide transition-colors border border-[#333] ${config.detectMode === 'Combined' ? 'bg-[#222] text-[#00FFFF] shadow-[inset_0_-2px_0_#00FFFF]' : 'bg-transparent text-[#888] hover:bg-[#222]'}`}
                    style={{ fontFamily: "'Space Mono', monospace" }}
                >Combined</button>
                <button
                    onClick={() => setConfig({...config, detectMode: 'Contrast'})}
                    className={`flex-1 text-[11px] py-2 font-bold tracking-wide transition-colors border border-[#333] ${config.detectMode === 'Contrast' ? 'bg-[#222] text-[#00FFFF] shadow-[inset_0_-2px_0_#00FFFF]' : 'bg-transparent text-[#888] hover:bg-[#222]'}`}
                    style={{ fontFamily: "'Space Mono', monospace" }}
                >Contrast</button>
            </div>
            
            <div className="flex gap-2 mt-2">
                <button
                    onClick={() => setConfig({...config, detectMode: 'Bright'})}
                    className={`flex-1 text-[11px] py-2 font-bold tracking-wide transition-colors border border-[#333] ${config.detectMode === 'Bright' ? 'bg-[#222] text-[#00FFFF] shadow-[inset_0_-2px_0_#00FFFF]' : 'bg-transparent text-[#888] hover:bg-[#222]'}`}
                    style={{ fontFamily: "'Space Mono', monospace" }}
                >Bright</button>
                <button
                    onClick={() => setConfig({...config, detectMode: 'Dark'})}
                    className={`flex-1 text-[11px] py-2 font-bold tracking-wide transition-colors border border-[#333] ${config.detectMode === 'Dark' ? 'bg-[#222] text-[#00FFFF] shadow-[inset_0_-2px_0_#00FFFF]' : 'bg-transparent text-[#888] hover:bg-[#222]'}`}
                    style={{ fontFamily: "'Space Mono', monospace" }}
                >Dark</button>
            </div>
            
            <div className="mt-5 space-y-6">
                <Slider label="BLOCK SIZE" min={4} max={100} step={2} value={config.blockSize} onChange={v => setConfig({...config, blockSize: v})} />
                <Slider label="THRESHOLD" min={5} max={100} step={1} value={config.threshold} onChange={v => setConfig({...config, threshold: v})} />
                <Slider label="MAX CIRCLES" min={10} max={500} step={10} value={config.maxCircles} onChange={v => setConfig({...config, maxCircles: v})} />
            </div>
          </Accordion>

          <Accordion title="SHAPES">
            <ButtonGroup options={['Circle', 'Square']} active={config.shapeType} onChange={v => setConfig({...config, shapeType: v})} />
            <div className="mt-5 space-y-6">
                <Slider label="MIN RADIUS" min={1} max={50} step={1} value={config.minRadius} onChange={v => setConfig({...config, minRadius: v})} />
                <Slider label="MAX RADIUS" min={5} max={100} step={1} value={config.maxRadius} onChange={v => setConfig({...config, maxRadius: v})} />
                <Slider label="STROKE" min={0.1} max={10} step={0.1} value={config.shapeStroke} onChange={v => setConfig({...config, shapeStroke: v})} />
                <Slider label="SEED" min={1} max={1000} step={1} value={config.seed} onChange={v => setConfig({...config, seed: v})} />
                <Slider label="LABEL SIZE" min={0} max={24} step={1} value={config.labelSize} onChange={v => setConfig({...config, labelSize: v})} />
                <Slider label="OVERLAY OPACITY" min={0} max={100} step={5} value={config.overlayOpacity} onChange={v => setConfig({...config, overlayOpacity: v})} />
            </div>
          </Accordion>

          <Accordion title="CONNECTIONS">
             <Slider label="MAX DISTANCE" min={0} max={500} step={10} value={config.maxDistanceLine} onChange={v => setConfig({...config, maxDistanceLine: v})} />
             <Slider label="LINE WEIGHT" min={0.1} max={5} step={0.1} value={config.lineWeight} onChange={v => setConfig({...config, lineWeight: v})} />
          </Accordion>

          <Accordion title="PALETTE">
             <div className="space-y-4">
                 <div>
                     <p className="text-[10px] text-[#888] font-bold tracking-widest mb-2 uppercase">Line Color</p>
                     <ButtonGroup 
                        options={['White', 'Black', 'Green']} 
                        active={config.lineColor.includes('255, 255, 255') ? 'White' : (config.lineColor.includes('0, 0, 0') ? 'Black' : 'Green')} 
                        onChange={v => {
                            if(v==='White') setConfig({...config, lineColor: 'rgba(255, 255, 255, 0.85)'});
                            if(v==='Black') setConfig({...config, lineColor: 'rgba(0, 0, 0, 0.85)'});
                            if(v==='Green') setConfig({...config, lineColor: 'rgba(16, 185, 129, 0.85)'}); // Emerald Green
                        }} 
                     />
                 </div>
                 <div>
                     <p className="text-[10px] text-[#888] font-bold tracking-widest mb-2 uppercase">Background Color</p>
                     <input type="color" value={config.bgColor} onChange={e => setConfig({...config, bgColor: e.target.value})} className="w-full h-10 border-none cursor-pointer bg-transparent" />
                 </div>
             </div>
          </Accordion>

          <Accordion title="EXPORT" defaultOpen={true}>
             <select 
                value={config.resolution} onChange={(e) => setConfig({...config, resolution: e.target.value})}
                className="w-full bg-[#111] border border-[#333] text-white text-[12px] font-bold p-3 outline-none cursor-pointer focus:border-[#00FFFF] mb-4"
                style={{ fontFamily: "'Space Mono', monospace" }}
             >
                {Object.keys(RESOLUTIONS).map(res => <option key={res} value={res}>{res}</option>)}
             </select>
             <div className="flex gap-2">
                 <button onClick={exportPNG} className="flex-1 bg-[#10B981] hover:bg-[#059669] text-black py-4 font-bold text-[14px] transition-colors shadow-[0_0_10px_rgba(16,185,129,0.2)]" style={{ fontFamily: "'Space Mono', monospace" }}>PNG</button>
                 <button onClick={exportSVG} className="flex-1 bg-[#00FFFF] hover:bg-[#0891B2] text-black py-4 font-bold text-[14px] transition-colors shadow-[0_0_10px_rgba(0,255,255,0.2)] flex items-center justify-center gap-2" style={{ fontFamily: "'Space Mono', monospace" }}>
                    <span className="text-[10px] bg-[#000] text-[#00FFFF] border border-[#00FFFF] px-1.5 py-0.5 rounded font-bold">PRO</span> SVG
                 </button>
             </div>
          </Accordion>
          
        </div>
      </div>

      {/* KANVAS KERJA */}
      <div className="flex-1 bg-[#050505] relative flex items-center justify-center p-6 md:p-12 order-1 md:order-2 h-[40vh] md:h-full shadow-inner overflow-hidden">
        <div className="relative shadow-[0_0_50px_rgba(0,0,0,0.8)] flex justify-center items-center group h-full max-w-full border border-[#222]" style={{ cursor: activeTool === 'Move Text' ? 'grab' : 'crosshair' }}>
           <canvas
             ref={canvasRef} width={activeRes.w} height={activeRes.h}
             onMouseDown={handleCanvasAction} onMouseMove={handleCanvasAction} onMouseUp={handleCanvasAction} onMouseLeave={handleCanvasAction}
             className="bg-[#050505] max-w-full max-h-full object-contain" style={{ aspectRatio: `${activeRes.w} / ${activeRes.h}` }}
           />
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>
    </div>
  );
}