export interface ResultadoTalla {
  nombreDedo: string;
  anchoCm: number;
  altoCm: number;
  talla: string;
  valido: boolean;
}
export interface MedicionUna {
  indiceDedo: number;
  anchoPixeles: number;
  altoPixeles: number;
  areaPixeles: number;
  valido: boolean;
}
export interface MedicionMoneda {
  encontrada: boolean;
  radioPixeles: number;
  centroX: number;
  centroY: number;
}
export interface ResultadoProcesamiento {
  medidas: MedicionUna[];
  moneda: MedicionMoneda; // Se inyecta al orquestador principal
}
export interface RegistroCliente {
  id: string;
  nombreCompleto: string; // Simplificado en un solo campo, o divídelo si la DB lo exige
  usuarioIg?: string; // Basado en tu Form.Input actual
  fechaMedicion: string; // Se llenará con new Date().toISOString()
  medidas: ResultadoTalla[]; // Composición pura
}
export type UIState = "LOADING" | "IDLE" | "DETECTING" | "ANALYZING" | "DONE" | "ERROR";
