// Door check-in: scan QR codes with the camera where the browser can, or
// type the code under the QR. Every scan is checked by the server.

import { COLORS } from './shared';

const REFRESH_MS = 5000;
const RESULT_MS = 2200;
const SAME_CODE_MS = 3000;

const TONES = {
  ADMITTED: { bg: '#7B8B6E', fg: '#14201F', color: '#9FB58F' },
  DUPLICATE: { bg: '#E9B4AC', fg: '#14201F', color: '#E9B4AC' },
  INVALID: { bg: '#B8463A', fg: '#F7F1E6', color: '#F2A197' },
};

// The camera lives outside page state: a MediaStream and a timer.
const camera = { stream: null, timer: null, detector: null, last: '', lastAt: 0 };

function stopCamera() {
  window.clearInterval(camera.timer);
  camera.timer = null;
  camera.stream?.getTracks().forEach((track) => track.stop());
  camera.stream = null;
}

export const initialState = { manual: '', result: null, cameraOn: false, cameraError: null, supported: false };

export function onMount(ctx, set) {
  set((state) => ({ ...state, supported: typeof window !== 'undefined' && 'BarcodeDetector' in window && Boolean(navigator.mediaDevices?.getUserMedia) }));
  const slug = ctx.params.event;
  // Counts and the scan log follow every gate, not just this phone.
  const timer = slug
    ? window.setInterval(() => {
        if (document.visibilityState !== 'visible') return;
        ctx.api.get(`/api/events/${slug}/checkin`).then((fresh) => set((state) => ({ ...state, data: { ...state.data, ...fresh } }))).catch(() => {});
      }, REFRESH_MS)
    : null;
  return () => {
    window.clearInterval(timer);
    stopCamera();
  };
}

export function values(state, set, ctx) {
  const { data } = state;

  const showResult = (outcome) => {
    set((current) => ({ ...current, result: outcome }));
    window.setTimeout(() => set((current) => (current.result === outcome ? { ...current, result: null } : current)), RESULT_MS);
  };

  const scan = (code) =>
    ctx.run('scan', async () => {
      const response = await ctx.api.post(`/api/events/${data.event.slug}/checkin`, { code });
      set((current) => ({ ...current, data: { ...current.data, ...response } }));
      showResult(response.outcome);
      if (navigator.vibrate) navigator.vibrate(response.outcome.result === 'ADMITTED' ? 60 : [80, 60, 80]);
      return response;
    }, { reloadAfter: false });

  const startCamera = async () => {
    try {
      camera.detector = camera.detector || new window.BarcodeDetector({ formats: ['qr_code'] });
      camera.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      const video = document.getElementById('checkin-camera');
      video.srcObject = camera.stream;
      await video.play();
      set((current) => ({ ...current, cameraOn: true, cameraError: null }));
      camera.timer = window.setInterval(async () => {
        if (video.readyState < 2) return;
        const found = await camera.detector.detect(video).catch(() => []);
        const value = found[0]?.rawValue;
        // The same QR held in front of the lens counts once.
        if (!value || (value === camera.last && Date.now() - camera.lastAt < SAME_CODE_MS)) return;
        camera.last = value;
        camera.lastAt = Date.now();
        scan(value);
      }, 350);
    } catch (error) {
      stopCamera();
      set((current) => ({ ...current, cameraOn: false, cameraError: error.name === 'NotAllowedError' ? 'Camera permission was refused. Allow it in the browser settings, or type codes below.' : 'The camera could not start. Type codes below instead.' }));
    }
  };

  const checkManual = () => {
    const code = state.manual.trim();
    if (!code) return ctx.toast('Type the code under the QR.', 'err');
    set((current) => ({ ...current, manual: '' }));
    return scan(code);
  };

  const result = state.result;
  const tone = result ? TONES[result.result] : null;

  return {
    me: data.me,
    picking: !data.event,
    scanning: Boolean(data.event),
    events: data.events,
    noEvents: !data.event && data.events.length === 0,
    eventTitle: data.event?.title || '',
    liveDot: data.event ? '#7B8B6E' : 'rgba(247,241,230,0.4)',
    liveLabel: data.event ? 'LIVE · EVERY SCAN CHECKED BY THE SERVER' : 'CHOOSE AN EVENT',

    admitted: data.admitted ?? 0,
    total: data.total ?? 0,
    blocked: data.blocked ?? 0,

    hasResult: Boolean(result),
    resultBg: tone?.bg || 'transparent',
    resultFg: tone?.fg || COLORS.cream,
    resultTitle: result?.title || '',
    resultSub: result?.sub || '',

    canUseCamera: state.supported,
    cameraOn: state.cameraOn,
    cameraOff: !state.cameraOn,
    videoDisplay: state.cameraOn ? 'block' : 'none',
    cameraNote: state.cameraError || (state.supported ? 'Start the camera and hold a ticket QR inside the frame.' : 'This browser cannot read QR codes from the camera. Chrome on Android can; here, type the code under the QR.'),
    cameraBtnLabel: state.cameraOn ? 'Stop camera' : 'Start camera',
    cameraBtnBg: state.cameraOn ? COLORS.sand : COLORS.clay,
    cameraBtnFg: state.cameraOn ? COLORS.ink : COLORS.cream,
    toggleCamera: () => {
      if (state.cameraOn) {
        stopCamera();
        set((current) => ({ ...current, cameraOn: false }));
      } else {
        startCamera();
      }
    },

    manual: state.manual,
    setManual: (event) => set((current) => ({ ...current, manual: event.target.value })),
    manualKey: (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        checkManual();
      }
    },
    checkManual,
    checking: Boolean(state.busy?.scan),

    log: (data.log || []).map((row) => ({ ...row, color: TONES[row.status]?.color || COLORS.cream, status: `${row.status} · ${row.time}` })),
    empty: !(data.log || []).length,
  };
}
