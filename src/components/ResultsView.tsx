import { Form } from "./ui/Form";
import { Debugger } from "./Debugger";
import { ResultsTable } from "./ui/ResultsTable";
import { Button } from "./ui/Button";
import type { ResultadoTalla, RegistroCliente } from "../types/types";
import "./ResultsView.css";
import { useState } from "react";

interface MeasurementsTableProps {
  medidas: ResultadoTalla[];
  onReset: () => void;
}

export const ResultsView: React.FC<MeasurementsTableProps> = ({ medidas = [], onReset }) => {
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");

  const handleGuardarCliente = () => {
    const payloadCliente: RegistroCliente = {
      id: crypto.randomUUID(),
      nombreCompleto: nombre,
      usuarioIg: contacto,
      fechaMedicion: new Date().toISOString(),
      medidas: medidas,
    };
    console.log("JSON Listo:", JSON.stringify(payloadCliente, null, 2));
  };
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
      <div className="layout-panel">
        <ResultsTable medidas={medidas} />

        <div className="form-contenedor">
          <Form buttonText="Guardar Cliente" onButtonClick={handleGuardarCliente}>
            <Form.Input
              label="Nombre completo"
              placeholder="Ej. Amaranta"
              value={nombre}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
            />
            <Form.Input
              label="Contacto / IG"
              placeholder="@usuario"
              value={contacto}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContacto(e.target.value)}
            />
          </Form>
        </div>
      </div>
      <Button onClick={() => console.log("trying")}>⬇ Exportar como Imagen</Button>
      <Button onClick={onReset}> Nueva Captura </Button>

      <Debugger />
    </div>
  );
};
