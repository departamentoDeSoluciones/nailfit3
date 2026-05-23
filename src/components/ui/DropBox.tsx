import { useState } from "react";
import type { DragEvent } from "react";
import "./DropBox.css";

interface DropBoxProps {
  onImageReady: (imageElement: HTMLImageElement) => void;
}

export const DropBox = ({ onImageReady }: DropBoxProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);

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
      <p>{imgSrc ? "Imagen lista para procesar  📊 " : "Arrastra imagen aca 📥"}</p>
    </div>
  );
};
