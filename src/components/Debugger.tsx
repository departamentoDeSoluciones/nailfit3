import React, { useEffect, useState } from "react";
import { Medir, type DebugStep } from "../medir"; // Ajusta la ruta a tu medir.ts

export const Debugger: React.FC = () => {
  const [images, setImages] = useState<{ indiceDedo: number; pasos: DebugStep[] }[]>([]);

  useEffect(() => {
    // Al montarse, lee lo que medir.ts guardó en memoria
    setImages(Medir.debugImages);
  }, []);

  if (!images || images.length === 0) return null;

  const nombresDedos = ["Pulgar", "Índice", "Medio", "Anular", "Meñique"];

  return (
    <div>
      {images.map((dedo) => (
        <div
          key={dedo.indiceDedo}
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: "2rem",
          }}
        >
          <h4 style={{ color: "white" }}>{nombresDedos[dedo.indiceDedo]}</h4>
          <div style={{ display: "flex", gap: "1rem" }}>
            {dedo.pasos?.map((paso, idx) => (
              <div key={idx} style={{ textAlign: "center" }}>
                <span style={{ fontSize: "0.7rem", color: "#888" }}>{paso.nombrePaso}</span>
                <br />
                <img
                  src={paso.base64}
                  alt={paso.nombrePaso}
                  style={{
                    width: "100px",
                    height: "100px",
                    backgroundColor: "#111",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
