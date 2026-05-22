/* ==========================================
   Anti-Gravity Café - Robot Kitchen Telemetry
   Live System Logs & Dashboard Controllers
   ========================================== */

const LOG_TEMPLATES = [
  { type: 'info', text: 'CALIBRATING: Barista Arm joint #2 rotation angles...' },
  { type: 'info', text: 'MONITORING: Electromagnetic pressure: 1.4 Tesla.' },
  { type: 'success', text: 'NOMINAL: Levitation Plate #4 cooled to -180°C.' },
  { type: 'info', text: 'TELEMETRY: Drone fleet dispatch lanes locked at Vector 4.' },
  { type: 'success', text: 'NOMINAL: Energy Core plasma shields holding at 100%.' },
  { type: 'info', text: 'REFUELING: Dispatch drone #2 battery charge at 96%.' },
  { type: 'info', text: 'OPTIMIZING: Molecular coffee particles alignment matrix...' },
  { type: 'success', text: 'STABILIZED: Localized gravity fields set to 0.05G.' },
  { type: 'warning', text: 'INTERFERENCE: Solar flare electromagnetic waves detected.' },
  { type: 'info', text: 'CALIBRATING: Laser grill thermal beam set to 420nm.' },
  { type: 'success', text: 'NOMINAL: Microwave synthetic chef assembly offline (idle).' }
];

// Initialize logs with initial records
const INITIAL_LOGS = [
  { type: 'success', text: 'SYSTEM: Sub-space communication array online. Earth L2.' },
  { type: 'info', text: 'BOOTING: Robotics operating system (RO-OS v9.22) launched.' },
  { type: 'success', text: 'BOOTING: Anti-gravity generator containing magnetic grid.' }
];

export function initializeDashboard() {
  const terminal = document.getElementById('kitchen-log-terminal');
  const stabilityVal = document.getElementById('dashboard-core-stability');
  const stabilityFill = document.getElementById('dashboard-stability-fill');

  if (!terminal) return;

  // Add initial boot logs
  INITIAL_LOGS.forEach(log => {
    addLog(log.type, log.text);
  });

  // Loop to simulate ongoing robotic activity logs and stats fluctuations
  setInterval(() => {
    // 1. Fluctuating core stability
    const randStability = (97.0 + Math.random() * 2.5).toFixed(2);
    if (stabilityVal) stabilityVal.textContent = `${randStability}%`;
    if (stabilityFill) stabilityFill.style.width = `${randStability}%`;

    // Trigger warning sounds if stability dips very low
    if (parseFloat(randStability) < 97.5) {
      addLog('warning', `ALERT: Plasma core density fluctuating. Stability: ${randStability}%`);
      triggerUIAudio('warning');
    } else {
      // Choose random log template
      const randomTemplate = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
      addLog(randomTemplate.type, randomTemplate.text);
    }
  }, 4000);
}

// Function to append a log line to the dashboard
export function addLog(type, text) {
  const terminal = document.getElementById('kitchen-log-terminal');
  if (!terminal) return;

  const now = new Date();
  const timestamp = `[${now.toTimeString().split(' ')[0]}]`;

  const logEntry = document.createElement('div');
  logEntry.className = `log-entry ${type}`;
  logEntry.innerHTML = `<span style="color:#8b9bb4">${timestamp}</span> ${text}`;

  // Prepend to show latest logs at the top
  terminal.appendChild(logEntry);
  terminal.scrollTop = terminal.scrollHeight;

  // Keep max logs to 30 to avoid rendering issues
  while (terminal.childElementCount > 30) {
    terminal.removeChild(terminal.firstChild);
  }
}

// Helper to trigger UI audio effects
function triggerUIAudio(type) {
  const event = new CustomEvent('play-sfx', { detail: { type: type } });
  window.dispatchEvent(event);
}
