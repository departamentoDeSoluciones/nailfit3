import React from "react";
import { Button } from "./Button";
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
            <tr key={index} className={item.valido ? "" : "row-error"}>
              <td className="finger-name">{item.nombreDedo}</td>

              {/* Celda de Medida: Condicional */}
              <td className="finger-value">{item.valido ? `${item.anchoCm} cm` : "--"}</td>

              {/* Celda de Talla: Condicional */}
              <td className="finger-size font-bold">
                {item.valido ? (
                  item.talla
                ) : (
                  <Button onClick={() => console.log(`Acción manual para ${item.nombreDedo}`)}>
                    Ingresar
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
