import React from "react";
import { useState } from "react";
import { Form } from "./ui/Form";
import { ResultsTable } from "./ui/ResultsTable";
import { Button } from "./ui/Button";
import type { ResultadoTalla } from "../medir";
import "./ResultsView.css";
export const useMockMedidas = () => {
  const [mockMedidas, setMockMedidas] = useState<ResultadoTalla[]>([]);
  const testData = () => {
    const datosFalsos: ResultadoTalla[] = [
      { nombreDedo: "Pulgar", anchoCm: 1.85, altoCm: 2.1, talla: "0" },
      { nombreDedo: "Índice", anchoCm: 1.35, altoCm: 1.6, talla: "4" },
      { nombreDedo: "Medio", anchoCm: 1.45, altoCm: 1.7, talla: "3" },
      { nombreDedo: "Anular", anchoCm: 1.3, altoCm: 1.55, talla: "5" },
      { nombreDedo: "Meñique", anchoCm: 1.1, altoCm: 1.3, talla: "7" },
    ];
    setMockMedidas(datosFalsos);
  };

  const limpiarDatos = () => {
    setMockMedidas([]);
  };
  return { mockMedidas, testData, limpiarDatos };
};

interface MeasurementsTableProps {
  medidas: ResultadoTalla[];
}

export const ResultsView: React.FC<MeasurementsTableProps> = ({ medidas = [] }) => {
  return (
    <div className="master-container">
      <div className="done-confetti">
        <h1>✨</h1>
        <div className="headers-group">
          <h2>¡Listo!</h2>
          <h2>Medidas tomadas</h2>
          <hr className="div" />
        </div>

        <h1>✨</h1>
      </div>

      {/* Columna Izquierda: Celebración y Captura */}

      {/* Columna Derecha: Datos y Exportación */}
      <div className="layout-panel">
        <ResultsTable>
          <thead>
            <tr>
              <th>Dedo</th>
              <th>Medida</th>
              <th>Talla</th>
            </tr>
          </thead>
          <tbody>
            {medidas?.map((item, index) => (
              <tr key={index}>
                <td className="finger-name">{item.nombreDedo}</td>
                <td className="finger-value">{item.anchoCm} cm</td>
                <td className="finger-size font-bold">{item.talla}</td>
              </tr>
            ))}
          </tbody>
        </ResultsTable>

        <div className="form-contenedor">
          <Form buttonText="Guardar Cliente">
            <Form.Input label="Nombre completo" placeholder="Ej. Amaranta" />
            <Form.Input label="Contacto / IG" placeholder="@usuario" />
          </Form>
        </div>

        {/* Mockup de botón de exportación */}
      </div>

      <Button onClick={() => console.log("trying")}>⬇ Exportar como Imagen</Button>
    </div>
  );
};
