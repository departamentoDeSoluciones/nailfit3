import React, { useEffect, useState } from "react";
import { Medir } from "../medir"; // Ajusta la ruta a tu medir.ts

export const Debugger: React.FC = () => {
  const [images, setImages] = useState<{ indiceDedo: number; base64: string }[]>([]);

  useEffect(() => {
    // Al montarse, lee lo que medir.ts guardó en memoria
    setImages(Medir.debugImages);
  }, []);

  if (!images || images.length === 0) return null;

  const nombresDedos = ["Pulgar", "Índice", "Medio", "Anular", "Meñique"];

  return (
    <div
      style={{
        marginTop: "2rem",
        padding: "1rem",
        border: "2px dashed #ff0055",
        borderRadius: "8px",
      }}
    >
      <h3 style={{ color: "#ff0055", marginBottom: "1rem" }}>🔧 Debugger Visión</h3>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {images.map((img) => (
          <div
            key={img.indiceDedo}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                color: "#888",
                marginBottom: "0.5rem",
              }}
            >
              {nombresDedos[img.indiceDedo]}
            </span>
            <img
              src={img.base64}
              alt={`Debug ${img.indiceDedo}`}
              style={{
                width: "128px",
                height: "128px",
                backgroundColor: "#111",
                objectFit: "contain",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
