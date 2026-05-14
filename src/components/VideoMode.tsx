import { useEffect, useRef } from 'react';
import { EstadoDeteccion } from '../medir';
import type { UIState } from '../hooks/useRecognitionEngine';
interface Props {
  uiState: UIState;
  estadoScan: EstadoDeteccion;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onStartCamera: () => void;
  onScanFrame: () => void;
}

export default function VideoMode({
  uiState,
  estadoScan,
  videoRef,
  onStartCamera,
  onScanFrame,
}: Props) {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let intervalId: number;
    let activeStream: MediaStream | null = null;

    async function start() {
      // Si no estamos en modo detección o el video aún no existe en el DOM, abortar
      if (uiState !== 'DETECTING' || !videoRef.current) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });

        activeStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Iniciar el loop de escaneo
          intervalId = window.setInterval(() => {
            onScanFrame();
          }, 400);
        }
      } catch (err) {
        console.error("Error cámara:", err);
      }
    }

    start();

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [uiState]);
  if (uiState !== 'DETECTING') {
    return (
      <button
        className="btn-action btn-secondary btn-huge"
        onClick={onStartCamera}
      >
        Activar Cámara 📷
      </button>
    );
  }

  return (<

    div className="video-container" style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
    {/* Indicador de "Buscando" si no hay nada detectado */}
    {estadoScan === EstadoDeteccion.NADA && (
      <div className="searching-overlay">
        <p>Buscando mano y moneda...</p>
        <div className="spinner"></div>
      </div>
    )}

    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        backgroundColor: '#000' // Para verificar si el elemento existe
      }}
      className={`video-scanner ${estadoScan === EstadoDeteccion.AMBAS ? 'video-success' : 'video-warning'
        }`}
    />

    <p className="scan-feedback">
      Mano: {estadoScan === 1 || estadoScan === 3 ? '✅' : '❌'} |
      Moneda: {estadoScan === 2 || estadoScan === 3 ? '✅' : '❌'}
    </p>
  </div>


  );
}
