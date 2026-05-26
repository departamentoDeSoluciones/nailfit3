import { useState, useEffect } from "react";
import type { DragEvent } from "react";
import "./DropBox.css";
import type { UIState } from "../../types/types";

interface DropBoxProps {
  onImageReady: (imageElement: HTMLImageElement) => void;
  uiState: UIState;
}

export const DropBox = ({ onImageReady, uiState }: DropBoxProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const getStatusText = () => {
    if (uiState === "ERROR") return "Error en el motor ⚠️";
    if (uiState === "LOADING") return "Iniciando motor ⏳";
    if (uiState === "ANALYZING") return "Analizando imagen 🔍";
    if (imgSrc) return "Imagen lista para procesar 📊";
    return "Arrastra imagen aca 📥";
  };

  useEffect(() => {
    if (uiState === "IDLE") {
      setImgSrc(null);
      setIsDragging(false);
    }
  }, [uiState]);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true); // Activa el estilo
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false); // Desactiva el estilo
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    console.log("Datos crudos del archivo:", {
      nombre: file.name,
      tipo: file.type,
    });

    const isValidType = file.type === "image/jpeg" || file.type === "image/png";
    const isValidExtension = /\.(jpg|jpeg|png)$/i.test(file.name);

    if (isValidExtension || isValidType) {
      console.log(`Cargado exitosamente: ${file.name}`);
      const imageUrl = URL.createObjectURL(file);
      setImgSrc(imageUrl);
      const img = new Image();
      img.onload = () => {
        onImageReady(img);
      };
      img.src = imageUrl;
    } else {
      console.error(`Error: Archivo rechazado (${file.name}). Solo se permite JPG o PNG.`);
    }
  };
  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      className={`dropbox ${isDragging ? "dragging" : ""} ${imgSrc ? "loaded" : ""}`}
      onDragLeave={handleDragLeave}
    >
      <p>{getStatusText()}</p>
    </div>
  );
};
