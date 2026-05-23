export interface ResultadoTalla {
  nombreDedo: string;
  anchoCm: number;
  altoCm: number;
  talla: string;
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

export type UIState = "LOADING" | "IDLE" | "DETECTING" | "ANALYZING" | "DONE" | "ERROR";
