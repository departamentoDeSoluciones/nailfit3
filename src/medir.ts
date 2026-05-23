import cv from "@techstark/opencv-js";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import type {
  ResultadoTalla,
  MedicionMoneda,
  ResultadoProcesamiento,
  MedicionUna,
} from "./types/types";
export enum EstadoDeteccion {
  NADA = 0,
  MANO = 1,
  MONEDA = 2,
  AMBAS = 3,
}

class medir {
  private isReady: boolean = false;
  public handLandmarker: any = null;
  private isInitializing: boolean = false;
  public async init(): Promise<void> {
    if (this.isReady || this.isInitializing) return;
    this.isInitializing = true;
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
      );
      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "IMAGE",
        numHands: 1,
      });
      await new Promise<void>((resolve) => {
        if (typeof cv.getBuildInformation === "function") {
          this.isReady = true;
          resolve();
        } else {
          cv.onRuntimeInitialized = () => {
            this.isReady = true;
            resolve();
          };
        }
      });
      this.isReady = true;
    } finally {
      this.isInitializing = false;
    }
  }
  public async capturarDedos(img: HTMLImageElement): Promise<any[]> {
    const results = await this.handLandmarker.detect(img);
    const roiMat: any[] = [];
    if (!results || results.landmarks === 0) {
      console.warn("No se detectaron manos en la imagen.");
      return roiMat;
    }
    const src = cv.imread(img);
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const dedos = [
      { dip: 3, tip: 4 }, // Pulgar
      { dip: 7, tip: 8 }, // Índice
      { dip: 11, tip: 12 }, // Medio
      { dip: 15, tip: 16 }, // Anular
      { dip: 19, tip: 20 }, // Meñique
    ];
    const mano = results.landmarks[0];
    let dedosValidos = 0;

    for (const puntos of dedos) {
      const dip = mano[puntos.dip];
      const tip = mano[puntos.tip];

      // Convertir a coordenadas absolutas en píxeles
      const pxTipX = tip.x * width;
      const pxTipY = tip.y * height;
      const pxDipX = dip.x * width;
      const pxDipY = dip.y * height;

      // Calcular distancia entre articulación y punta
      const dx = pxTipX - pxDipX;
      const dy = pxTipY - pxDipY;
      const distancia = Math.sqrt(dx * dx + dy * dy);

      // Calcular el tamaño del cuadrado de recorte con margen (200% de la distancia)
      const boxSize = distancia * 1.55;
      const halfBox = boxSize / 2;

      // Desplazar el centro del recorte ligeramente hacia abajo (hacia el nudillo)
      // para asegurar que toda la base de la uña (cutícula) entre en el cuadro.
      const cx = pxTipX;
      const cy = pxTipY + distancia * 0.4;

      // Coordenadas de la esquina superior izquierda
      const rx = Math.max(0, cx - halfBox);
      const ry = Math.max(0, cy - halfBox);
      let rw = boxSize;
      let rh = boxSize;

      // Clamping para evitar salir de los límites de la imagen original
      if (rx + rw > width) rw = width - rx;
      if (ry + rh > height) rh = height - ry;

      // Si el rectángulo es válido, recortar
      if (rw > 0 && rh > 0) {
        const rect = new cv.Rect(Math.floor(rx), Math.floor(ry), Math.floor(rw), Math.floor(rh));
        // Usar .clone() para aislar la memoria de la matriz resultante
        const roi = src.roi(rect).clone();
        roiMat.push(roi);
        dedosValidos++;
      }
    }

    console.log(`Dedos válidos detectados: ${dedosValidos}`);
    src.delete();
    return roiMat;
  }

  public procesarDedos(arrayDeUnas: any[]): any[] {
    const unasProcesadas: any[] = [];

    for (let i = 0; i < arrayDeUnas.length; i++) {
      const src = arrayDeUnas[i]; // Mat original del ROI

      const resized = new cv.Mat();
      const gray = new cv.Mat();
      const blurred = new cv.Mat();
      const thresh = new cv.Mat();
      const morph = new cv.Mat();
      const kernel = cv.Mat.ones(5, 5, cv.CV_8U);

      try {
        // 1. Estandarizar resolución (128x128) para homogeneizar el algoritmo
        const dsize = new cv.Size(128, 128);
        cv.resize(src, resized, dsize, 0, 0, cv.INTER_AREA);

        // 2. Escala de grises
        cv.cvtColor(resized, gray, cv.COLOR_RGBA2GRAY, 0);

        // 3. Suavizado bilateral
        cv.bilateralFilter(gray, blurred, 9, 75, 75, cv.BORDER_DEFAULT);

        // 4. Umbralización adaptativa (INV para que la uña sea blanca y fondo negro)
        cv.adaptiveThreshold(
          blurred,
          thresh,
          255,
          cv.ADAPTIVE_THRESH_GAUSSIAN_C,
          cv.THRESH_BINARY_INV,
          11,
          2,
        );

        // 5. Cierre morfológico
        cv.morphologyEx(thresh, morph, cv.MORPH_CLOSE, kernel);

        // 6. Guardar clon en el array de salida
        unasProcesadas.push(morph.clone());
      } catch (error) {
        console.error(`Error procesando recorte del dedo ${i}:`, error);
      } finally {
        // Limpiar memoria temporal de esta iteración estricamente
        if (!resized.isDeleted()) resized.delete();
        if (!gray.isDeleted()) gray.delete();
        if (!blurred.isDeleted()) blurred.delete();
        if (!thresh.isDeleted()) thresh.delete();
        if (!morph.isDeleted()) morph.delete();
        if (!kernel.isDeleted()) kernel.delete();
      }
    }

    return unasProcesadas;
  }

  public async procesarMano(
    fotoDeMano: HTMLImageElement,
    datosMoneda: MedicionMoneda,
  ): Promise<ResultadoProcesamiento | null> {
    const roisCrudosMat = await this.capturarDedos(fotoDeMano);
    if (!roisCrudosMat || roisCrudosMat.length === 0) return null;

    const roisProcesadosMat = this.procesarDedos(roisCrudosMat);
    const medidasJSON: MedicionUna[] = this.medirUnasPixeles(roisProcesadosMat);
    for (const rawMat of roisCrudosMat) {
      if (rawMat && !rawMat.isDeleted()) rawMat.delete();
    }
    for (const rawMats of roisProcesadosMat) {
      if (rawMats && !rawMats.isDeleted()) rawMats.delete();
    }
    return {
      medidas: medidasJSON,
      moneda: datosMoneda,
    };
  }

  public async detectarManoRapido(
    imgOrigen: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement,
  ): Promise<boolean> {
    if (!this.handLandmarker) throw new Error("MediaPipe no inicializado");
    const results = await this.handLandmarker.detect(imgOrigen);
    return results && results.landmarks && results.landmarks.length > 0;
  }
  public medirUnasPixeles(unasProcesadasMat: any[]): MedicionUna[] {
    const resultados: MedicionUna[] = [];

    for (let i = 0; i < unasProcesadasMat.length; i++) {
      const src = unasProcesadasMat[i];
      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();

      try {
        // 1. Extraer contornos externos
        cv.findContours(src, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        if (contours.size() === 0) {
          resultados.push({
            indiceDedo: i,
            anchoPixeles: 0,
            altoPixeles: 0,
            areaPixeles: 0,
            valido: false,
          });
          continue;
        }

        // 2. Filtrar el contorno con la mayor área
        let mayorArea = 0;
        let mejorContorno = contours.get(0);

        for (let j = 0; j < contours.size(); ++j) {
          const cnt = contours.get(j);
          const area = cv.contourArea(cnt);
          if (area > mayorArea) {
            mayorArea = area;
            mejorContorno = cnt;
          }
        }

        // 3. Obtener distancias
        const rect = cv.boundingRect(mejorContorno);

        resultados.push({
          indiceDedo: i,
          anchoPixeles: rect.width,
          altoPixeles: rect.height,
          areaPixeles: mayorArea,
          valido: true,
        });
      } catch (error) {
        console.error(`Error midiendo el dedo ${i}:`, error);
        resultados.push({
          indiceDedo: i,
          anchoPixeles: 0,
          altoPixeles: 0,
          areaPixeles: 0,
          valido: false,
        });
      } finally {
        // 4. Destruir los vectores de memoria obligatoriamente
        if (contours && !contours.isDeleted()) contours.delete();
        if (hierarchy && !hierarchy.isDeleted()) hierarchy.delete();
      }
    }

    return resultados;
  }

  public encontrarMoneda(origen: HTMLImageElement | HTMLCanvasElement | null): MedicionMoneda {
    const resultadoNulo: MedicionMoneda = {
      encontrada: false,
      radioPixeles: 0,
      centroX: 0,
      centroY: 0,
    };

    let src = new cv.Mat();
    let isSrcLocal = false;

    if (origen instanceof HTMLImageElement || origen instanceof HTMLCanvasElement) {
      src = cv.imread(origen);
      isSrcLocal = true;
    } else {
      src = origen;
    }

    const gray = new cv.Mat();
    const blurred = new cv.Mat();
    const circles = new cv.Mat();

    try {
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
      cv.medianBlur(gray, blurred, 5);
      cv.HoughCircles(blurred, circles, cv.HOUGH_GRADIENT, 1, 50, 100, 50, 20, 200);

      if (circles.cols > 0) {
        const x = circles.data32F[0];
        const y = circles.data32F[1];
        const r = circles.data32F[2];

        const margin = r * 0.1;
        let rx = x - r - margin;
        let ry = y - r - margin;
        let rw = (r + margin) * 2;
        let rh = (r + margin) * 2;

        if (rx < 0) rx = 0;
        if (ry < 0) ry = 0;
        if (rx + rw > src.cols) rw = src.cols - rx;
        if (ry + rh > src.rows) rh = src.rows - ry;

        const rect = new cv.Rect(Math.floor(rx), Math.floor(ry), Math.floor(rw), Math.floor(rh));
        const roi = src.roi(rect);

        roi.delete();

        return {
          encontrada: true,
          radioPixeles: r,
          centroX: x,
          centroY: y,
        };
      }

      return resultadoNulo;
    } catch (error) {
      console.error("Error buscando moneda:", error);
      return resultadoNulo;
    } finally {
      if (!gray.isDeleted()) gray.delete();
      if (!blurred.isDeleted()) blurred.delete();
      if (!circles.isDeleted()) circles.delete();
      if (isSrcLocal && !src.isDeleted()) src.delete();
    }
  }

  public pxACM(medidasDedos: MedicionUna[], moneda: MedicionMoneda): ResultadoTalla[] {
    if (!moneda.encontrada || moneda.radioPixeles <= 0) {
      console.warn("Análisis omitido: No hay moneda para escalar.");
      return [];
    }

    // Moneda de 10 pesos MXN = 28 mm = 2.8 cm
    const diametroMonedaCm = 2.8;
    const diametroMonedaPx = moneda.radioPixeles * 2;
    const factorConversion = diametroMonedaCm / diametroMonedaPx;
    const nombresDedos = ["Pulgar", "Índice", "Medio", "Anular", "Meñique"];
    const resultados: ResultadoTalla[] = [];

    for (const dedo of medidasDedos) {
      if (!dedo.valido) continue;
      const anchoCm = dedo.anchoPixeles * factorConversion;
      const altoCm = dedo.altoPixeles * factorConversion;
      const anchoMm = anchoCm * 10;
      // Árbol de decisión para Talla (Press-on estándar)
      let talla = "Desconocida";
      if (anchoMm >= 18) talla = "0";
      else if (anchoMm >= 16) talla = "1";
      else if (anchoMm >= 15) talla = "2";
      else if (anchoMm >= 14) talla = "3";
      else if (anchoMm >= 13) talla = "4";
      else if (anchoMm >= 12) talla = "5";
      else if (anchoMm >= 11) talla = "6";
      else if (anchoMm >= 10) talla = "7";
      else if (anchoMm >= 9) talla = "8";
      else talla = "9";

      resultados.push({
        nombreDedo: nombresDedos[dedo.indiceDedo] || `Dedo ${dedo.indiceDedo}`,
        anchoCm: parseFloat(anchoCm.toFixed(2)),
        altoCm: parseFloat(altoCm.toFixed(2)),
        talla: talla,
      });
    }
    return resultados;
  }

  public async analizarTallas(imagen: HTMLImageElement): Promise<ResultadoTalla[] | null> {
    // 1. Validar presencia de mano
    const hayMano = await this.detectarManoRapido(imagen);
    if (!hayMano) {
      console.warn("Abortado: No se detectó mano.");
      return null;
    }

    // 2. Validar presencia de moneda
    const datosMoneda = this.encontrarMoneda(imagen);
    if (!datosMoneda.encontrada) {
      console.warn("Abortado: No se detectó moneda de referencia.");
      return null;
    }

    // 3. Procesar y extraer medidas (si ambos existen)
    const resultadoProcesamiento = await this.procesarMano(imagen, datosMoneda);
    if (!resultadoProcesamiento) {
      console.warn("Abortado: Fallo en el procesamiento de los dedos.");
      return null;
    }

    // 4. Calcular tallas e imprimir en consola
    const tallasFinales = this.pxACM(resultadoProcesamiento.medidas, datosMoneda);
    console.log("Resultados de medición completados:", tallasFinales);

    return tallasFinales;
  }
}
export const Medir = new medir();
