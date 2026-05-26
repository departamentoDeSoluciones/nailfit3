import { useEffect, useState } from "react";
import type { ResultadoTalla, UIState } from "../types/types";
import { Medir, EstadoDeteccion } from "../medir";

export function useRecognitionEngine() {
  const [uiState, setUiState] = useState<UIState>("LOADING");
  const [estadoScan, setEstadoScan] = useState<EstadoDeteccion>(EstadoDeteccion.NADA);
  const [errorMessage, setErrorMessage] = useState("");
  const [tallas, setTallas] = useState<ResultadoTalla[]>([]);
  const [imgIsReady, setImgIsReady] = useState<string | null>(null);
  useEffect(() => {
    Medir.init()
      .then(() => setUiState("IDLE"))
      .catch(() => {
        setErrorMessage("No se pudo iniciar el motor");
        setUiState("ERROR");
      });
  }, []);

  const resetFlow = () => {
    setEstadoScan(EstadoDeteccion.NADA);
    setErrorMessage("");
    setTallas([]);
    setUiState("IDLE");
    setImgIsReady(null);
  };

  const ejecutarAnalisis = async (src: string) => {
    setUiState("ANALYZING");
    const img = new Image();
    img.src = src;
    img.onload = async () => {
      try {
        const res = await Medir.analizarTallas(img);
        setTallas(res);
        setUiState("DONE");
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Uknown error");
        }
        setUiState("ERROR");
      }
    };
  };

  const clearError = () => {
    setUiState("IDLE");
  };
  const onImageReady = (img: string | null) => setImgIsReady(img);
  return {
    state: {
      uiState,
      estadoScan,
      errorMessage,
      tallas,
      imgIsReady,
    },
    actions: {
      ejecutarAnalisis,
      resetFlow,
      clearError,
      onImageReady,
    },
  };
}
