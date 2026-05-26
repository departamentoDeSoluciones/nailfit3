import React from "react";
import type { ResultadoTalla } from "../../types/types";
import "./ResultsTable.css";

interface MeasurementsTableProps {
  medidas?: ResultadoTalla[]; // Hacemos el prop opcional (?)
}

// 2. Asignación por defecto en la desestructuración
export const ResultsTable: React.FC<MeasurementsTableProps> = ({ medidas = [] }) => {
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
