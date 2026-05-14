import { useEffect, useRef, useState } from 'react';
import type { MedicionUna } from '../medir';
import { Medir, EstadoDeteccion } from '../medir';

export type UIState =
  | 'LOADING'
  | 'IDLE'
  | 'DETECTING'
  | 'ANALYZING'
  | 'DONE'
  | 'ERROR';

export function useRecognitionEngine() {
  const [uiState, setUiState] = useState<UIState>('LOADING');
  const [estadoScan, setEstadoScan] = useState<EstadoDeteccion>(EstadoDeteccion.NADA);
  const [dedosImgs, setDedosImgs] = useState<string[]>([]);
  const [medidas, setMedidas] = useState<MedicionUna[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasOcultoRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));

  useEffect(() => {
    Medir.init()
      .then(() => setUiState('IDLE'))
      .catch(() => {
        setErrorMessage('No se pudo iniciar el motor');
        setUiState('ERROR');
      });
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const resetFlow = () => {
    stopCamera();

    setDedosImgs([]);
    setMedidas([]);
    setEstadoScan(EstadoDeteccion.NADA);
    setErrorMessage('');

    setUiState('IDLE');
  };

  const processFinalImage = async (src: string) => {
    setUiState('ANALYZING');

    stopCamera();

    const img = new Image();
    img.src = src;

    img.onload = async () => {
      const res = await Medir.procesarMano(img);

      if (!res) {
        setErrorMessage('No se pudo procesar la imagen');
        setUiState('ERROR');
        return;
      }

      setDedosImgs(res.imagenesBase64);
      setMedidas(res.medidas);

      setUiState('DONE');
    };
  };

  const startCamera = async () => {
    // 1. Forzar el montaje del DOM primero
    setUiState('DETECTING');

    try {
      // 2. Esperar hardware (mientras esto pasa, el <video> ya se está renderizando)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      streamRef.current = stream;

      // 3. Asignar el stream al ref que AHORA sí existe
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Evitar que errores de autoplay rompan la app
        await videoRef.current.play().catch(e => console.warn("Autoplay ignorado:", e));
      }
    } catch {
      // Si el usuario deniega el permiso o falla la cámara, regresamos a ERROR
      setErrorMessage('No se pudo acceder a la cámara');
      setUiState('ERROR');
    }
  };

  const scanVideoFrame = async () => {
    if (!videoRef.current) return;

    const estado = await Medir.conseguirCaptura(
      videoRef.current,
      canvasOcultoRef.current
    );

    setEstadoScan(estado);

    if (estado === EstadoDeteccion.AMBAS) {
      console.log("¡Mano y moneda detectados! Listos para capturar.");
    }
  };
  const manualCapture = () => {
    if (!canvasOcultoRef.current) return;
    const src = canvasOcultoRef.current.toDataURL('image/jpeg');
    processFinalImage(src);
  };

  return {
    uiState,
    setUiState,

    estadoScan,

    dedosImgs,
    medidas,
    manualCapture,
    errorMessage,

    videoRef,

    processFinalImage,
    startCamera,
    scanVideoFrame,
    resetFlow,
  };
}
