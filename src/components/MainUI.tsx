import { DropBox } from "./ui/DropBox";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";
import { ResultsView } from "./ResultsView";
import { useEffect } from "react";
import { useRecognitionEngine } from "../hooks/useRecognitionEngine";

export const MainUI = () => {
  const { state, actions } = useRecognitionEngine();

  const showButton =
    state.imgIsReady && state.uiState !== "LOADING" && state.uiState !== "ANALYZING";

  const handleCloseError = () => {
    actions.resetFlow();
  };

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    if (state.uiState === "ERROR") {
      console.error("Fallo en el motor:", state.errorMessage);
    }
  }, [state.uiState, state.errorMessage]);

  if (state.uiState === "DONE") {
    return <ResultsView medidas={state.tallas} onReset={actions.resetFlow} />;
  }

  return (
    <div className="master-container">
      {state.uiState === "ERROR" && (
        <Modal message={state.errorMessage} onClose={handleCloseError} />
      )}
      <DropBox
        onImageReady={actions.onImageReady}
        uiState={state.uiState}
        hasImage={!!state.imgIsReady}
      />

      <div
        className="button-wrapper"
        style={{
          paddingTop: "1rem",
          opacity: showButton ? 1 : 0,
          width: "50%",
          pointerEvents: showButton ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      >
        <Button onClick={() => state.imgIsReady && actions.ejecutarAnalisis(state.imgIsReady)}>
          Comenzar
        </Button>
      </div>
    </div>
  );
};
