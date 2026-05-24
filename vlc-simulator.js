// -------------------------------------------------------------
// VLC OPTICAL TRANSMISSION SANDBOX
// -------------------------------------------------------------
(function() {
    // standard 4B/5B translation table
    const codeTable4B5B = {
        '0000': '11110', '0001': '01001', '0010': '10100', '0011': '10101',
        '0100': '01010', '0101': '01011', '0110': '01110', '0111': '01111',
        '1000': '10010', '1001': '10011', '1010': '10110', '1011': '10111',
        '1100': '11010', '1101': '11011', '1110': '11100', '1111': '11101'
    };

    const reverseTable4B5B = Object.fromEntries(
        Object.entries(codeTable4B5B).map(([k, v]) => [v, k])
    );

    let vlcInterval = null;
    let vlcIsActive = false;

    const vlcSpeed = document.getElementById('vlcSpeed');
    const vlcSpeedRead = document.getElementById('vlcSpeedRead');
    if (vlcSpeed && vlcSpeedRead) {
        vlcSpeed.addEventListener('input', (e) => {
            vlcSpeedRead.innerText = `${e.target.value} Hz`;
        });
    }

    window.clearVlcSandbox = function() {
        if (vlcInterval) clearInterval(vlcInterval);
        vlcIsActive = false;

        const statusEl = document.getElementById('vlcStatus');
        const bitEl = document.getElementById('vlcBit');
        const txBufEl = document.getElementById('vlcTxBuffer');
        const bitStrEl = document.getElementById('vlcBitStream');
        const decodedEl = document.getElementById('vlcDecoded');
        const btnTx = document.getElementById('btn-vlc-tx');

        if (statusEl) statusEl.innerText = "STANDBY";
        if (bitEl) bitEl.innerText = "--";
        if (txBufEl) txBufEl.innerText = "--";
        if (bitStrEl) bitStrEl.innerText = "// Awaiting frame sync pulses...";
        if (decodedEl) decodedEl.innerText = "--";

        const txLed = document.getElementById('txLed');
        const rxPd = document.getElementById('rxPd');
        if (txLed) {
            txLed.style.backgroundColor = '';
            txLed.style.boxShadow = '';
        }
        if (rxPd) {
            rxPd.style.backgroundColor = '';
            rxPd.style.boxShadow = '';
        }
        
        const photonBeam = document.getElementById('photonBeam');
        if (photonBeam) photonBeam.classList.add('hidden');
        
        if (btnTx) {
            btnTx.disabled = false;
            btnTx.innerText = "Tx: Trigger Optical Stream";
        }
    };

    window.startVlcTransmission = function() {
        if (vlcIsActive) return;
        vlcIsActive = true;
        
        const inputEl = document.getElementById('vlcInput');
        if (!inputEl) {
            vlcIsActive = false;
            return;
        }

        const inputVal = inputEl.value.toUpperCase().replace(/[^A-Z0-9 ]/g, '');
        if (inputVal.length === 0) {
            alert("Please enter at least one character to modulate!");
            vlcIsActive = false;
            return;
        }

        const btnTx = document.getElementById('btn-vlc-tx');
        if (btnTx) {
            btnTx.disabled = true;
            btnTx.innerText = "Tx: Modulating...";
        }

        // 1. Convert Characters to Binary and 4B5B Bitstream
        let fullBitstream = "";
        let logBufferText = "";
        
        for (let i = 0; i < inputVal.length; i++) {
            const charCode = inputVal.charCodeAt(i);
            const binaryByte = charCode.toString(2).padStart(8, '0');
            const highNibble = binaryByte.substring(0, 4);
            const lowNibble = binaryByte.substring(4, 8);
            
            const encodedHigh = codeTable4B5B[highNibble] || "00000";
            const encodedLow = codeTable4B5B[lowNibble] || "00000";
            
            fullBitstream += encodedHigh + encodedLow;
            logBufferText += `[${inputVal[i]}:${encodedHigh} ${encodedLow}] `;
        }

        const txBufEl = document.getElementById('vlcTxBuffer');
        const bitStrEl = document.getElementById('vlcBitStream');
        const decodedEl = document.getElementById('vlcDecoded');
        const statusEl = document.getElementById('vlcStatus');

        if (txBufEl) txBufEl.innerText = logBufferText;
        if (bitStrEl) bitStrEl.innerText = "";
        if (decodedEl) decodedEl.innerText = "";
        if (statusEl) statusEl.innerText = "TRANSMITTING";

        const speedVal = vlcSpeed ? parseInt(vlcSpeed.value) : 5;
        const periodMs = 1000 / speedVal;

        let currentBitIdx = 0;
        const streamLength = fullBitstream.length;
        const txLed = document.getElementById('txLed');
        const rxPd = document.getElementById('rxPd');
        const photonBeam = document.getElementById('photonBeam');

        vlcInterval = setInterval(() => {
            if (currentBitIdx >= streamLength) {
                // Transmission Finished
                clearInterval(vlcInterval);
                if (statusEl) statusEl.innerText = "COMPLETED";
                const bitEl = document.getElementById('vlcBit');
                if (bitEl) bitEl.innerText = "END";
                
                // Decode full bitstream back to character
                decodeFullStream(fullBitstream, inputVal);
                
                if (btnTx) {
                    btnTx.disabled = false;
                    btnTx.innerText = "Tx: Trigger Optical Stream";
                }
                vlcIsActive = false;
                
                // Return LED states to normal
                if (txLed) {
                    txLed.style.backgroundColor = '';
                    txLed.style.boxShadow = '';
                }
                if (rxPd) {
                    rxPd.style.backgroundColor = '';
                    rxPd.style.boxShadow = '';
                }
                if (photonBeam) photonBeam.classList.add('hidden');
                return;
            }

            const activeBit = fullBitstream[currentBitIdx];
            const bitEl = document.getElementById('vlcBit');
            if (bitEl) bitEl.innerText = `Bit ${currentBitIdx + 1}/${streamLength} (${activeBit})`;

            // Write bit to receiving log
            if (bitStrEl) {
                const span = document.createElement('span');
                span.innerText = activeBit;
                span.className = activeBit === '1' ? 'text-pink-400 font-bold mx-[1px]' : 'text-slate-600 mx-[1px]';
                bitStrEl.appendChild(span);
                bitStrEl.scrollTop = bitStrEl.scrollHeight;
            }

            // Animate Tx LED and Rx photodiode states
            if (activeBit === '1') {
                if (txLed) {
                    txLed.style.backgroundColor = '#d946ef'; // Magenta
                    txLed.style.boxShadow = '0 0 24px #d946ef';
                }
                
                if (photonBeam) {
                    photonBeam.className = 'absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-pink-400 glow-magenta';
                    photonBeam.style.left = '0%';
                    photonBeam.classList.remove('hidden');
                }
                
                animatePhoton(speedVal);
                
                setTimeout(() => {
                    if (rxPd) {
                        rxPd.style.backgroundColor = 'rgba(217, 70, 239, 0.4)';
                        rxPd.style.boxShadow = '0 0 12px rgba(217, 70, 239, 0.4)';
                    }
                }, periodMs * 0.7);

            } else {
                if (txLed) {
                    txLed.style.backgroundColor = '#1e1b4b'; // Muted dark purple
                    txLed.style.boxShadow = 'none';
                }
                
                if (photonBeam) photonBeam.classList.add('hidden');
                
                setTimeout(() => {
                    if (rxPd) {
                        rxPd.style.backgroundColor = 'rgba(30, 27, 75, 0.4)';
                        rxPd.style.boxShadow = 'none';
                    }
                }, periodMs * 0.7);
            }

            currentBitIdx++;
        }, periodMs);
    };

    function animatePhoton(hz) {
        const photonBeam = document.getElementById('photonBeam');
        if (!photonBeam) return;
        let start = null;
        const duration = hz > 10 ? 80 : 180; // milliseconds travel

        function step(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percentage = Math.min(progress / duration, 1) * 100;
            photonBeam.style.left = `${percentage}%`;
            if (progress < duration) {
                window.requestAnimationFrame(step);
            }
        }
        window.requestAnimationFrame(step);
    }

    function decodeFullStream(bitstream, expectedString) {
        let decodedResult = "";
        
        for (let i = 0; i < bitstream.length; i += 10) {
            if (i + 10 > bitstream.length) break;
            
            const highSymbol5B = bitstream.substring(i, i + 5);
            const lowSymbol5B = bitstream.substring(i + 5, i + 10);
            
            const highNibble4B = reverseTable4B5B[highSymbol5B];
            const lowNibble4B = reverseTable4B5B[lowSymbol5B];
            
            if (highNibble4B && lowNibble4B) {
                const binaryByte = highNibble4B + lowNibble4B;
                const charCode = parseInt(binaryByte, 2);
                decodedResult += String.fromCharCode(charCode);
            } else {
                decodedResult += "?"; // Alignment error code representation
            }
        }
        
        const decodedEl = document.getElementById('vlcDecoded');
        if (decodedEl) decodedEl.innerText = decodedResult;
    }
})();
