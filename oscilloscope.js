// -------------------------------------------------------------
// OSCILLOSCOPE SIMULATOR CODE
// -------------------------------------------------------------
(function() {
    const canvas = document.getElementById('scopeCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    let isRunning = true;
    let showGrid = true;
    let waveType = 'sine';
    let frequency = 5.0;
    let amplitude = 40;
    let timeOffset = 0;
    let animationId;

    // UI Sliders & Values
    const slideFreq = document.getElementById('slideFreq');
    const slideAmp = document.getElementById('slideAmp');
    const valFreq = document.getElementById('valFreq');
    const valAmp = document.getElementById('valAmp');

    // Readout overlays
    const readVpp = document.getElementById('readVpp');
    const readVrms = document.getElementById('readVrms');
    const readFreq = document.getElementById('readFreq');
    const readPeriod = document.getElementById('readPeriod');

    // Buttons
    const btnFreeze = document.getElementById('btn-freeze');
    const btnGrid = document.getElementById('btn-grid');

    // Resize Canvas to fit its container
    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Control adjustments listeners
    if (slideFreq) {
        slideFreq.addEventListener('input', (e) => {
            frequency = parseFloat(e.target.value);
            if (valFreq) valFreq.innerText = frequency.toFixed(1);
        });
    }

    if (slideAmp) {
        slideAmp.addEventListener('input', (e) => {
            amplitude = parseInt(e.target.value);
            // Translate visual pixel amplitude to simulated voltage readout (e.g. max 80px = 5.0V)
            const voltVal = (amplitude * (5.0 / 80)).toFixed(1);
            if (valAmp) valAmp.innerText = voltVal;
        });
    }

    window.setWave = function(type) {
        waveType = type;
        // Highlight selected button
        ['sine', 'square', 'triangle', 'noise'].forEach(w => {
            const btn = document.getElementById(`btn-${w}`);
            if (btn) {
                if (w === type) {
                    btn.className = "px-2 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded text-center text-[10px] uppercase font-bold transition";
                } else {
                    btn.className = "px-2 py-1 bg-slate-900 text-slate-500 border border-slate-800 rounded text-center text-[10px] uppercase font-bold transition";
                }
            }
        });
    };

    window.toggleFreeze = function() {
        isRunning = !isRunning;
        if (btnFreeze) {
            if (isRunning) {
                btnFreeze.className = "flex-1 px-2.5 py-1.5 border border-slate-800 bg-slate-900 text-slate-400 rounded hover:border-slate-700 transition text-[10px] text-center uppercase font-bold";
                btnFreeze.innerText = "Freeze";
            } else {
                btnFreeze.className = "flex-1 px-2.5 py-1.5 border border-amber-500/30 bg-amber-950/20 text-amber-500 rounded transition text-[10px] text-center uppercase font-bold";
                btnFreeze.innerText = "Run";
            }
        }
    };

    window.toggleGrid = function() {
        showGrid = !showGrid;
        if (btnGrid) {
            if (showGrid) {
                btnGrid.className = "flex-1 px-2.5 py-1.5 border border-cyan-500/20 bg-cyan-950/20 text-cyan-400 rounded transition text-[10px] text-center uppercase font-bold";
                btnGrid.innerText = "Grid: On";
            } else {
                btnGrid.className = "flex-1 px-2.5 py-1.5 border border-slate-800 bg-slate-900 text-slate-500 rounded transition text-[10px] text-center uppercase font-bold";
                btnGrid.innerText = "Grid: Off";
            }
        }
    };

    function runOscilloscope() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const width = canvas.width;
        const height = canvas.height;
        const centerY = height / 2;

        // Draw oscilloscope screen background grid
        if (showGrid) {
            ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)'; // slate-700
            ctx.lineWidth = 1;
            
            // Dividers
            const xDivs = 10;
            const yDivs = 8;
            
            for (let i = 1; i < xDivs; i++) {
                const x = (width / xDivs) * i;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
            for (let i = 1; i < yDivs; i++) {
                const y = (height / yDivs) * i;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Bold Center Axis Lines
            ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)'; // slate-500
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            ctx.lineTo(width, centerY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(width / 2, 0);
            ctx.lineTo(width / 2, height);
            ctx.stroke();
        }

        // Draw Wave Form
        ctx.strokeStyle = '#06b6d4'; // Cyan-500 signal
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#06b6d4';
        
        ctx.beginPath();
        
        for (let x = 0; x < width; x++) {
            // Formula calculating instantaneous voltages
            const scaleVal = (x / width) * frequency * 2 * Math.PI + timeOffset;
            let val = 0;
            
            switch(waveType) {
                case 'sine':
                    val = Math.sin(scaleVal) * amplitude;
                    break;
                case 'square':
                    val = Math.sign(Math.sin(scaleVal)) * amplitude;
                    break;
                case 'triangle':
                    val = (Math.asin(Math.sin(scaleVal)) * (2 / Math.PI)) * amplitude;
                    break;
                case 'noise':
                    val = (Math.sin(scaleVal) + (Math.random() - 0.5) * 0.4) * amplitude;
                    break;
            }
            
            if (x === 0) {
                ctx.moveTo(x, centerY + val);
            } else {
                ctx.lineTo(x, centerY + val);
            }
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // reset glows

        // Update Telemetry Display calculations (simulated voltage scale: 80 pixels = 5V)
        const voltAmp = amplitude * (5.0 / 80);
        const vpp = (voltAmp * 2).toFixed(2);
        let vrms = 0;
        
        if (waveType === 'sine') {
            vrms = (voltAmp / Math.sqrt(2)).toFixed(2);
        } else if (waveType === 'square') {
            vrms = (voltAmp).toFixed(2);
        } else if (waveType === 'triangle') {
            vrms = (voltAmp / Math.sqrt(3)).toFixed(2);
        } else {
            vrms = (voltAmp * 0.73).toFixed(2); // estimated noise profile RMS
        }

        // simulated physical parameters
        const displayFreq = (frequency * 2.4).toFixed(2); // kHz range
        const displayPeriod = (1.0 / (frequency * 2.4)).toFixed(3); // ms range

        if (readVpp) readVpp.innerText = `${vpp}V`;
        if (readVrms) readVrms.innerText = `${vrms}V`;
        if (readFreq) readFreq.innerText = `${displayFreq} kHz`;
        if (readPeriod) readPeriod.innerText = `${(displayPeriod * 1000).toFixed(0)} ns`;

        if (isRunning) {
            timeOffset += 0.05;
        }

        animationId = requestAnimationFrame(runOscilloscope);
    }

    // Start Oscilloscope Loop
    runOscilloscope();
})();
