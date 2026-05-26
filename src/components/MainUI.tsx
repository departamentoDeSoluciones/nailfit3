import { DropBox } from "./ui/DropBox";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";
import { ResultsView } from "./ResultsView";
import { useState, useEffect } from "react";
import { useRecognitionEngine } from "../hooks/useRecognitionEngine";
export const MainUI = () => {
  const { clearError, ejecutarAnalisis, uiState, errorMessage, tallas, resetFlow } =
    useRecognitionEngine();
  const [isReady, setIsReady] = useState<HTMLImageElement | null>(null);
  const showButton = isReady && uiState !== "LOADING" && uiState !== "ANALYZING";
  const handleCloseError = () => {
    clearError();
    setIsReady(null);
  };

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (uiState === "ERROR") {
      console.error("Fallo en el motor:", errorMessage);
    }
  }, [uiState, errorMessage]);
  if (uiState === "DONE") {
    return (
      <ResultsView
        medidas={tallas}
        onReset={() => {
          resetFlow();
          setIsReady(null);
        }}
      />
    );
  }
  return (
    <div className="master-container">
      {uiState === "ERROR" && <Modal message={errorMessage} onClose={handleCloseError} />}
      <DropBox onImageReady={setIsReady} uiState={uiState} />

      <div
        className="button-wrapper"
        style={{
          paddingTop: "1rem",
          opacity: showButton ? 1 : 0,
          width: "50%",
          pointerEvents: showButton ? "auto" : "none",
          transition: "opacity 0.3s ease", // Transición suave
        }}
      >
        <Button onClick={() => isReady && ejecutarAnalisis(isReady.src)}>Comenzar</Button>
      </div>
    </div>
  );
};
