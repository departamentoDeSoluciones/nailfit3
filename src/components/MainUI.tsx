import { DropBox } from "./ui/DropBox";
import { Button } from "./ui/Button";
import { useState, useEffect } from "react";
import { useRecognitionEngine } from "../hooks/useRecognitionEngine";
export const MainUI = () => {
  const { ejecutarAnalisis, uiState, errorMessage } = useRecognitionEngine();

  const [isReady, setIsReady] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (uiState === "ERROR") {
      console.error("Fallo en el motor:", errorMessage);
    }
  }, [uiState, errorMessage]);

  return (
    <div className="master-container">
      <DropBox onImageReady={setIsReady} />
      {isReady && uiState !== "LOADING" && (
        <Button onClick={() => ejecutarAnalisis(isReady.src)}>Comenzar</Button>
      )}
    </div>
  );
};
