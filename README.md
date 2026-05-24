# Tony Kipchirchir | Engineering Portfolio Website

Welcome to my personal portfolio repository. This website serves as a showcase of my skills, projects, and interactive simulations in the domains of embedded systems, hardware engineering, and telecommunications.

**Live Site:** [https://TheTramp.github.io](https://TheTramp.github.io)

---

## 🚀 Key Features & Simulations

This website is designed not just as a static resume, but as an interactive laboratory highlighting concepts in analog circuitry and signal processing:

### 1. **Interactive Oscilloscope Simulator** (`oscilloscope.js`)
* **Real-time Waveforms:** Generates and renders Sine, Square, Triangle, and Noise waves on an HTML5 canvas.
* **Live Telemetry:** Computes and displays real-time values including peak-to-peak voltage ($V_{pp}$), root-mean-square voltage ($V_{rms}$), signal frequency, and period.
* **Control Board:** Functional triggers for adjusting frequency, amplitude, turning the grid overlay ON/OFF, and freezing the wave sweep.

### 2. **Visible Light Communication (VLC) Sandbox** (`vlc-simulator.js`)
* **Baseband Link Simulation:** Simulates optical wireless data transmission.
* **Encoding & Decoding:** Illustrates character-to-binary streams, baseband line coding, 4B5B data clock alignment, and photo-detector state decoding.
* **Interactive Controls:** Adjustable clock speeds (Hz) and visual indicators simulating the GaAs LED Transmitter and the BPW34 PIN photodiode receiver.

### 3. **Interactive Systems Block Map** (`app.js`)
* Interactive 3-pillar breakdown mapping out my skills, toolchains, and instrumentation across **Embedded Systems**, **Hardware Engineering**, and **Telecommunications**.

---

## 🛠️ Technology Stack

* **Structure:** Semantic HTML5
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) (CDN integration with custom styling parameters)
* **Logic:** Vanilla ES6+ JavaScript
* **Math Rendering:** [MathJax](https://www.mathjax.org/) (for rendering clean engineering formulas)
* **Graphics:** HTML5 Canvas API

---

## 💻 Running the Project Locally

Because the project fetches data dynamically from `projects.json` to load portfolio items, modern browsers will block the request if you try to open the `index.html` file directly from your local filesystem (due to CORS policy restrictions).

To run the site locally, you must run it through a local development server:

### Option A: VS Code Live Server (Easiest)
1. Open the project folder in VS Code.
2. Install the **Live Server** extension by Ritwick Dey.
3. Click the **Go Live** button in the bottom right corner of VS Code.

### Option B: Python (No installation needed)
If you have Python installed, run this command in your project directory:
```bash
# For Python 3.x
python -m http.server 8000
```
Then open your browser and navigate to `http://localhost:8000`.

### Option C: NodeJS / NPM
If you have Node.js installed, run:
```bash
npx serve .
```

---

## 📂 Repository Structure

```
├── index.html                # Main entry point & layout
├── style.css                 # Custom styles, ambient background gradients, & animations
├── app.js                    # Core logic & dynamic projects rendering engine
├── oscilloscope.js           # Signal math and Canvas oscilloscope rendering
├── vlc-simulator.js          # Baseband VLC pulse generator & photodiode simulation
├── projects.json             # Structured database of engineering projects
├── Tony Kipchirchir.pdf      # My professional curriculum vitae
├── vlc_transceiver.png       # VLC transceiver project system schematic capture
└── smart_irrigation.png      # IoT Smart Irrigation project system schematic capture
```

---

## 📬 Contact & Connections

Feel free to connect or reach out regarding junior engineering roles, graduate internships, or collaborative hardware prototyping:

* **Email:** [kipchirchir.tony@outlook.com](mailto:kipchirchir.tony@outlook.com)
* **LinkedIn:** [tonykipchirchir](https://linkedin.com/in/tonykipchirchir)
* **GitHub:** [TheTramp](https://github.com/TheTramp)
