import { useState } from "react";
import type { DragEvent, ChangeEvent } from "react";
import "./DropBox.css";
import type { UIState } from "../../types/types";

interface DropBoxProps {
  onImageReady: (src: string) => void;
  uiState: UIState;
  hasImage: boolean;
}

export const DropBox = ({ onImageReady, uiState, hasImage }: DropBoxProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const getStatusText = () => {
    if (uiState === "ERROR") return "Error en el motor ⚠️";
    if (uiState === "LOADING") return "Iniciando motor ⏳";
    if (uiState === "ANALYZING") return "Analizando imagen 🔍";
    if (hasImage) return "Imagen lista para procesar 📊";
    return "Arrastra imagen aca 📥";
  };

  const processFile = (file: File) => {
    console.log("Datos crudos del archivo:", {
      nombre: file.name,
      tipo: file.type,
    });
    const isValidType = file.type === "image/jpeg" || file.type === "image/png";
    const isValidExtension = /\.(jpg|jpeg|png)$/i.test(file.name);

    if (isValidExtension || isValidType) {
      console.log(`Cargado exitosamente: ${file.name}`);
      const imageUrl = URL.createObjectURL(file);
      onImageReady(imageUrl);
    } else {
      console.error(`Error: Archivo rechazado (${file.name}). Solo se permite JPG o PNG.`);
    }
  };

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
    if (file) processFile(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }

    e.target.value = "";
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      className={`dropbox ${isDragging ? "dragging" : ""} ${hasImage ? "loaded" : ""}`}
      onDragLeave={handleDragLeave}
    >
      <p className="dragText">{getStatusText()}</p>
      <p>
        {!hasImage && uiState !== "LOADING" && uiState !== "ANALYZING" && (
          <label htmlFor="file-upload" className="upload-link">
            o haz click aqui para seleccionar 📥
          </label>
        )}
      </p>
      <input
        id="file-upload"
        type="file"
        onChange={handleFileChange}
        accept="image/jpeg, image/png"
        style={{ display: "none" }}
      />
    </div>
  );
};
