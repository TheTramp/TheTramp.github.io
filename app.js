// -------------------------------------------------------------
// APP LOGIC: DYNAMIC PROJECTS LOADING & SKILLS DETAILS
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // 1. Fetch and Render Projects from projects.json
    fetch('./projects.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load projects.json database');
            }
            return response.json();
        })
        .then(projects => {
            renderProjects(projects);
        })
        .catch(err => {
            console.error('Error initializing projects database:', err);
            renderFallbackProjects();
        });

    // 2. Wire up the Interactive Skills Block Map
    initializeSkillsBlockMap();
});

function renderProjects(projects) {
    const featuredContainer = document.getElementById('featured-project-container');
    const otherGrid = document.getElementById('other-projects-grid');
    
    if (!featuredContainer || !otherGrid) return;
    
    featuredContainer.innerHTML = '';
    otherGrid.innerHTML = '';

    // Find featured project
    const featuredProj = projects.find(p => p.isFeatured) || projects[0];
    const otherProjs = projects.filter(p => p.id !== (featuredProj ? featuredProj.id : ''));

    if (featuredProj) {
        featuredContainer.appendChild(createProjectCard(featuredProj, true));
        toggleProjectTab(featuredProj.id, 'overview');
    }

    otherProjs.forEach(proj => {
        otherGrid.appendChild(createProjectCard(proj, false));
        toggleProjectTab(proj.id, 'overview');
    });

    // Re-trigger MathJax to typeset equations in newly added elements
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise();
    }
}

function createProjectCard(proj, isFeatured) {
    const card = document.createElement('div');
    
    if (isFeatured) {
        card.className = "bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl";
    } else {
        card.className = "bg-slate-900/40 border border-slate-850 rounded-xl overflow-hidden shadow-lg hover:border-slate-750 transition flex flex-col justify-between";
    }

    // Prepare tags HTML
    const tagsHtml = proj.tags.map(t => `<span class="bg-slate-900 border border-slate-800 text-slate-350 px-2.5 py-0.5 rounded-full text-xs font-mono">${t}</span>`).join('');

    // Prepare specifications list
    const specsHtml = proj.specifications.map(s => `<li>${s}</li>`).join('');

    // GitHub Button HTML
    const githubBtnHtml = proj.repoUrl 
        ? `<a href="${proj.repoUrl}" target="_blank" class="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-cyan-400/60 rounded text-cyan-400 font-mono text-xs font-bold transition flex items-center space-x-1.5">
             <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" clip-rule="evenodd"></path></svg>
             <span>Repository</span>
           </a>`
        : '';

    // Check if project has an image, otherwise use schematic grid placeholder
    const imageSectionHtml = proj.imagePath 
        ? `<img src="${proj.imagePath}" alt="${proj.title}" class="rounded-xl border border-slate-800 max-h-56 object-cover shadow-lg w-full">`
        : `<div class="w-full h-56 rounded-xl schematic-placeholder-bg flex flex-col justify-center items-center p-6 text-center text-slate-500 font-mono text-xs">
             <svg class="w-8 h-8 text-slate-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
             [ System Schematic Pending Board Layout ]
           </div>`;

    if (isFeatured) {
        card.innerHTML = `
            <!-- Featured Header -->
            <div class="bg-slate-950 px-6 py-4 border-b border-slate-850 flex flex-wrap justify-between items-center gap-4">
                <div>
                    <span class="text-[10px] font-mono text-cyan-400 tracking-widest uppercase">Featured Project // ${proj.category}</span>
                    <h3 class="text-xl font-bold text-white">${proj.title}</h3>
                </div>
                <div class="flex flex-wrap gap-2 items-center">
                    ${tagsHtml}
                    <div class="ml-2">${githubBtnHtml}</div>
                </div>
            </div>

            <!-- Featured Content Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-12">
                <!-- Data column (left) -->
                <div class="lg:col-span-8 p-6 lg:p-8 flex flex-col justify-between">
                    <!-- Navigation Tabs -->
                    <div class="flex space-x-1 bg-slate-950 p-1 rounded-lg mb-6 max-w-[280px] border border-slate-850">
                        <button onclick="toggleProjectTab('${proj.id}', 'overview')" id="tab-${proj.id}-overview" class="flex-1 text-center font-mono py-1 text-[11px] font-bold rounded transition">Overview</button>
                        <button onclick="toggleProjectTab('${proj.id}', 'block')" id="tab-${proj.id}-block" class="flex-1 text-center font-mono py-1 text-[11px] font-bold rounded transition">Specs & Flow</button>
                    </div>

                    <!-- Tab panels -->
                    <div class="min-h-[220px]">
                        <!-- Overview -->
                        <div id="content-${proj.id}-overview" class="space-y-4">
                            <p class="text-slate-300 leading-relaxed text-sm md:text-base">${proj.overview}</p>
                        </div>
                        
                        <!-- Specs & Flow -->
                        <div id="content-${proj.id}-block" class="hidden space-y-4">
                            <div class="space-y-2">
                                <span class="text-xs font-mono text-slate-500 uppercase">System Block Flow:</span>
                                <div class="bg-slate-950 border border-slate-850 p-4 rounded-lg overflow-x-auto text-cyan-400 leading-relaxed whitespace-pre font-mono text-xs">${proj.architecture}</div>
                            </div>
                            <div class="space-y-2 pt-2">
                                <span class="text-xs font-mono text-slate-500 uppercase">Hardware Specifications:</span>
                                <ul class="list-disc pl-5 text-slate-400 text-xs space-y-1">${specsHtml}</ul>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Graphic/Visual column (right) -->
                <div class="lg:col-span-4 bg-slate-950/60 border-l border-slate-850 p-6 flex flex-col justify-center items-center min-h-[300px]">
                    ${imageSectionHtml}
                    <span class="text-[9px] font-mono text-slate-500 mt-3 text-center uppercase tracking-wide">Prototype System Assembly Capture</span>
                </div>
            </div>
        `;
    } else {
        card.innerHTML = `
            <div>
                <!-- Card Header Bezel -->
                <div class="bg-slate-950/80 px-5 py-4 border-b border-slate-850/60 flex justify-between items-center">
                    <div class="flex flex-col space-y-1">
                        <span class="text-[9px] font-mono text-slate-500 uppercase">${proj.category}</span>
                        <h3 class="text-base font-bold text-white tracking-wide truncate max-w-[200px]">${proj.title}</h3>
                    </div>
                    <div>
                        ${githubBtnHtml}
                    </div>
                </div>

                <!-- Card Body -->
                <div class="p-5 space-y-4">
                    <!-- Dynamic Navigation Tabs -->
                    <div class="flex space-x-1 bg-slate-950 p-1 rounded border border-slate-850 max-w-[220px]">
                        <button onclick="toggleProjectTab('${proj.id}', 'overview')" id="tab-${proj.id}-overview" class="flex-1 text-center font-mono py-1 text-[10px] font-bold rounded transition">Overview</button>
                        <button onclick="toggleProjectTab('${proj.id}', 'block')" id="tab-${proj.id}-block" class="flex-1 text-center font-mono py-1 text-[10px] font-bold rounded transition">Specs & Flow</button>
                    </div>

                    <!-- Visual Section -->
                    <div class="mt-2">
                        ${imageSectionHtml}
                    </div>

                    <!-- Content Panel -->
                    <div class="min-h-[160px] text-xs">
                        <div id="content-${proj.id}-overview" class="space-y-3">
                            <p class="text-slate-350 leading-relaxed">${proj.overview}</p>
                            <div class="flex flex-wrap gap-1.5 pt-2">${tagsHtml}</div>
                        </div>

                        <div id="content-${proj.id}-block" class="hidden space-y-3">
                            <div>
                                <span class="text-[9px] text-slate-500 uppercase tracking-widest block mb-1">Signal Pipeline:</span>
                                <div class="bg-slate-950 border border-slate-850 p-3 rounded overflow-x-auto text-[10px] text-cyan-400 whitespace-pre font-mono">${proj.architecture}</div>
                            </div>
                            <div class="space-y-1.5">
                                <span class="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Specifications:</span>
                                <ul class="list-disc pl-4 text-slate-400 space-y-0.5">${specsHtml}</ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    return card;
}

// Global project tab triggers
window.toggleProjectTab = function(projectId, tabName) {
    const tabs = ['overview', 'block'];
    tabs.forEach(t => {
        const btn = document.getElementById(`tab-${projectId}-${t}`);
        const content = document.getElementById(`content-${projectId}-${t}`);
        if (!btn || !content) return;

        if (t === tabName) {
            btn.className = "flex-1 text-center font-mono py-1 text-[11px] font-bold rounded transition bg-cyan-500/20 text-cyan-400";
            content.classList.remove('hidden');
        } else {
            btn.className = "flex-1 text-center font-mono py-1 text-[11px] font-bold rounded text-slate-500 transition hover:text-slate-350";
            content.classList.add('hidden');
        }
    });
};

function renderFallbackProjects() {
    const featuredContainer = document.getElementById('featured-project-container');
    if (featuredContainer) {
        featuredContainer.innerHTML = `<div class="p-6 bg-slate-950 border border-slate-850 rounded text-center font-mono text-slate-400 text-xs uppercase">
            // Lab offline: run index.html through a local web server to dynamically render JSON projects.
        </div>`;
    }
}

// -------------------------------------------------------------
// INTERACTIVE SKILLS MATRIX (SYSTEM BLOCK MAP - 3 PILLARS)
// -------------------------------------------------------------
function initializeSkillsBlockMap() {
    const skillBlocksData = {
        embedded: {
            title: "Embedded Systems Engineering",
            desc: "Bridging physical signals with computational logic. Skilled in low-level firmware development, microcontroller clock timer registers, hardware interrupts, and serial communication links. Proficient in optimizing sensor integration and analog-to-digital conversions on AVR and ARM core platforms.",
            tags: ["Embedded C / C++", "ATmega328P / AVR", "Raspberry Pi 4B", "Register-Level Programming", "UART / SPI / I2C Protocols", "Hardware Interrupt Vectors"],
            gear: "Microcontrollers, Logic Analyzer, Serial Oscilloscope Interfacing, Jumper Logic Probes",
            tools: "VS Code, Arduino IDE, PlatformIO, Linux GCC, CMake compilation systems"
        },
        hardware: {
            title: "Hardware Engineering & Diagnostics",
            desc: "Designing and diagnostic testing of electrical board modules. Experienced in troubleshooting multi-layer motherboards at the component level, isolation of short circuits, signal trace diagnostics using board-view files, and building low-noise transimpedance front-ends. Proficient in micro-soldering and prototype rework.",
            tags: ["Analog Circuit Design", "Board-View Trace Analysis", "Component Isolation Diagnostics", "Precision SMD Micro-Soldering", "PCB Schematic Design", "Multisim / LTSpice Simulation"],
            gear: "Digital Oscilloscope, SMD Rework Station, Multimeter, Logic Tracer Probe, Breadboards",
            tools: "Tina TI, KiCad, LTSpice simulation packages, board-view software suites"
        },
        telecom: {
            title: "Telecommunications & RF Systems",
            desc: "Analyzing physical wireless communication channels. Designed and fabricated a free-space optical data transceiver, implementing clock-synchronous baseband line coding protocols, and conducting high-frequency signal assessments, including RF signal matching and VSWR measurements.",
            tags: ["Optical Wireless (VLC / Li-Fi)", "Coding, Error Detection and Correction & Clock Alignment", "RF Signal Integrity Analysis", "VSWR (Standing Wave Ratio) Diagnostics", "Spectrum Analyzers", "Channel Budget Calculations"],
            gear: "Spectrum Analyzer, Optical Power Sensor, Laser Diodes, Photodetectors, RF Coaxial Lines",
            tools: "MATLAB math environments, Python SciPy calculations libraries"
        }
    };

    window.selectSkillBlock = function(blockKey) {
        // Highlight active block
        ['embedded', 'hardware', 'telecom'].forEach(b => {
            const element = document.getElementById(`block-${b}`);
            if (!element) return;
            const textHeader = element.querySelector('.font-mono');
            if (b === blockKey) {
                element.className = "p-6 bg-slate-900 border-2 border-cyan-500/30 rounded-xl cursor-pointer hover:border-cyan-400 hover:bg-slate-850/50 transition shadow-lg glow-cyan text-left";
                if (textHeader) textHeader.className = "font-mono text-cyan-400 text-xs mb-2";
            } else {
                element.className = "p-6 bg-slate-900 border border-slate-850 rounded-xl cursor-pointer hover:border-cyan-400 hover:bg-slate-850/50 transition text-left";
                if (textHeader) textHeader.className = "font-mono text-slate-500 text-xs mb-2";
            }
        });

        // Update detail views
        const data = skillBlocksData[blockKey];
        if (!data) return;

        const titleEl = document.getElementById('skill-detail-title');
        const descEl = document.getElementById('skill-detail-desc');
        const gearEl = document.getElementById('skill-detail-gear');
        const toolsEl = document.getElementById('skill-detail-tools');
        const tagsContainer = document.getElementById('skill-detail-tags');

        if (titleEl) titleEl.innerText = data.title;
        if (descEl) descEl.innerText = data.desc;
        if (gearEl) gearEl.innerText = data.gear;
        if (toolsEl) toolsEl.innerText = data.tools;

        if (tagsContainer) {
            tagsContainer.innerHTML = "";
            data.tags.forEach(tag => {
                const span = document.createElement('span');
                span.className = "bg-slate-950 text-cyan-400 border border-slate-850 text-xs px-3 py-1.5 rounded font-mono";
                span.innerText = tag;
                tagsContainer.appendChild(span);
            });
        }
    };
}
