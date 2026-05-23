import React from "react";
import type { ResultadoTalla } from "../../medir";
import "./ResultsTable.css";

// 1. Constante estática tipo Singleton para datos mock
const MOCK_MEDIDAS: ResultadoTalla[] = [
  { nombreDedo: "Pulgar", anchoCm: 1.85, altoCm: 2.1, talla: "0" },
  { nombreDedo: "Índice", anchoCm: 1.35, altoCm: 1.6, talla: "4" },
  { nombreDedo: "Medio", anchoCm: 1.45, altoCm: 1.7, talla: "3" },
  { nombreDedo: "Anular", anchoCm: 1.3, altoCm: 1.55, talla: "5" },
  { nombreDedo: "Meñique", anchoCm: 1.1, altoCm: 1.3, talla: "7" },
];

interface MeasurementsTableProps {
  medidas?: ResultadoTalla[]; // Hacemos el prop opcional (?)
}

// 2. Asignación por defecto en la desestructuración
export const ResultsTable: React.FC<MeasurementsTableProps> = ({ medidas = MOCK_MEDIDAS }) => {
  return (
    <div className="table-container">
      <table className="measurements-table">
        <thead>
          <tr>
            <th>Dedo</th>
            <th>Medida</th>
            <th>Talla</th>
          </tr>
        </thead>
        <tbody>
          {medidas.map((item, index) => (
            <tr key={index}>
              <td className="finger-name">{item.nombreDedo}</td>
              <td className="finger-value">{item.anchoCm} cm</td>
              <td className="finger-size font-bold">{item.talla}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
