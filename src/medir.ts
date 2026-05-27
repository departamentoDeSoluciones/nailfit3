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
  public debugImages: { indiceDedo: number; base64: string }[] = [];
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

  public async capturarDedos(
    img: HTMLImageElement,
    indicesRequeridos?: number[],
  ): Promise<{ indiceDedo: number; mat: any | null }[]> {
    const results = await this.handLandmarker.detect(img);
    const roiMats: { indiceDedo: number; mat: any | null }[] = [];

    if (!results || results.landmarks.length === 0) {
      console.warn("No se detectaron manos en la imagen.");
      return roiMats; // Vacío
    }

    const src = cv.imread(img);
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const mano = results.landmarks[0];
    let dedosValidos = 0;

    // SÍ mantienes las coordenadas matemáticas
    const dedos = [
      { dip: 3, tip: 4 }, // i = 0 (Pulgar)
      { dip: 7, tip: 8 }, // i = 1 (Índice)
      { dip: 11, tip: 12 }, // i = 2 (Medio)
      { dip: 15, tip: 16 }, // i = 3 (Anular)
      { dip: 19, tip: 20 }, // i = 4 (Meñique)
    ];

    // Bucle con 'let i' para saber EXACTAMENTE qué dedo estamos evaluando
    for (let i = 0; i < dedos.length; i++) {
      if (indicesRequeridos && !indicesRequeridos.includes(i)) continue;
      const puntos = dedos[i];
      const dip = mano[puntos.dip];
      const tip = mano[puntos.tip];

      const pxTipX = tip.x * width;
      const pxTipY = tip.y * height;
      const pxDipX = dip.x * width;
      const pxDipY = dip.y * height;

      const dx = pxTipX - pxDipX;
      const dy = pxTipY - pxDipY;
      const distancia = Math.sqrt(dx * dx + dy * dy);

      const boxSize = distancia * 1.55;
      const halfBox = boxSize / 2;

      const cx = pxTipX;
      const cy = pxTipY + distancia * 0.4;

      const rx = Math.max(0, cx - halfBox);
      const ry = Math.max(0, cy - halfBox);
      let rw = boxSize;
      let rh = boxSize;

      if (rx + rw > width) rw = width - rx;
      if (ry + rh > height) rh = height - ry;

      // Si el recorte es válido, guardamos la imagen y SU ÍNDICE (i)
      if (rw > 0 && rh > 0) {
        const rect = new cv.Rect(Math.floor(rx), Math.floor(ry), Math.floor(rw), Math.floor(rh));
        const roi = src.roi(rect).clone();
        roiMats.push({ indiceDedo: i, mat: roi });
        dedosValidos++;
      } else {
        // Si falló (ej. dedo fuera de la foto), guardamos un NULL pero conservamos el índice (i)
        roiMats.push({ indiceDedo: i, mat: null });
      }
    }

    console.log(`Dedos válidos detectados: ${dedosValidos}/5`);
    src.delete();
    return roiMats;
  }

  public procesarDedos(
    arrayDeUnas: { indiceDedo: number; mat: any | null }[],
  ): { indiceDedo: number; mat: any | null }[] {
    const unasProcesadas: { indiceDedo: number; mat: any | null }[] = [];

    // Uso de for...of para tener la variable 'item' disponible automáticamente
    for (const item of arrayDeUnas) {
      if (!item.mat) {
        unasProcesadas.push({ indiceDedo: item.indiceDedo, mat: null });
        continue;
      }

      // Declarar src a partir del item actual
      const src = item.mat;
      const resized = new cv.Mat();
      const gray = new cv.Mat();
      const blurred = new cv.Mat();
      const thresh = new cv.Mat();
      const morph = new cv.Mat();
      const kernel = cv.Mat.ones(5, 5, cv.CV_8U);

      try {
        const dsize = new cv.Size(128, 128);
        cv.resize(src, resized, dsize, 0, 0, cv.INTER_AREA);
        cv.cvtColor(resized, gray, cv.COLOR_RGBA2GRAY, 0);
        cv.bilateralFilter(gray, blurred, 9, 75, 75, cv.BORDER_DEFAULT);

        cv.adaptiveThreshold(
          blurred,
          thresh,
          255,
          cv.ADAPTIVE_THRESH_GAUSSIAN_C,
          cv.THRESH_BINARY_INV,
          11,
          2,
        );

        cv.morphologyEx(thresh, morph, cv.MORPH_CLOSE, kernel);

        // Se inserta el objeto con el formato correcto ANTES de limpiar la memoria
        unasProcesadas.push({
          indiceDedo: item.indiceDedo,
          mat: morph.clone(),
        });
      } catch (error) {
        console.error(`Error procesando recorte del dedo ${item.indiceDedo}:`, error);
        // Si OpenCV falla en este dedo, pasamos un null para mantener la cadena
        unasProcesadas.push({ indiceDedo: item.indiceDedo, mat: null });
      } finally {
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
    for (const item of roisCrudosMat) {
      if (item.mat && !item.mat.isDeleted()) item.mat.delete();
    }

    this.debugImages = []; // Limpiar debug anterior

    for (const item of roisProcesadosMat) {
      if (item.mat && !item.mat.isDeleted()) {
        const b64 = this.matToBase64(item.mat);
        if (b64) {
          this.debugImages.push({ indiceDedo: item.indiceDedo, base64: b64 });
        }
      }
    }

    for (const item of roisProcesadosMat) {
      if (item.mat && !item.mat.isDeleted()) item.mat.delete();
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
  public medirUnasPixeles(
    unasProcesadasMat: { indiceDedo: number; mat: any | null }[],
  ): MedicionUna[] {
    const resultados: MedicionUna[] = [];

    for (const item of unasProcesadasMat) {
      // 1. Validar si el dedo existe en este slot
      if (!item.mat) {
        resultados.push({
          indiceDedo: item.indiceDedo,
          anchoPixeles: 0,
          altoPixeles: 0,
          areaPixeles: 0,
          valido: false,
        });
        continue;
      }

      const src = item.mat;
      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();

      try {
        // 2. Extraer contornos externos
        cv.findContours(src, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        if (contours.size() === 0) {
          resultados.push({
            indiceDedo: item.indiceDedo,
            anchoPixeles: 0,
            altoPixeles: 0,
            areaPixeles: 0,
            valido: false,
          });
          continue;
        }

        // 3. Filtrar el contorno con la mayor área
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

        // 4. Obtener caja delimitadora (Bounding Box)
        const rect = cv.boundingRect(mejorContorno);

        resultados.push({
          indiceDedo: item.indiceDedo,
          anchoPixeles: rect.width,
          altoPixeles: rect.height,
          areaPixeles: mayorArea,
          valido: true,
        });
      } catch (error) {
        console.error(`Error midiendo el dedo ${item.indiceDedo}:`, error);
        resultados.push({
          indiceDedo: item.indiceDedo,
          anchoPixeles: 0,
          altoPixeles: 0,
          areaPixeles: 0,
          valido: false,
        });
      } finally {
        // 5. Destruir los vectores de memoria obligatoriamente
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
    if (!origen) return resultadoNulo;
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
    const diametroMonedaCm = 2.8;
    const diametroMonedaPx = moneda.radioPixeles * 2;
    const factorConversion = diametroMonedaCm / diametroMonedaPx;
    const nombresDedos = ["Pulgar", "Índice", "Medio", "Anular", "Meñique"];
    const resultados: ResultadoTalla[] = [];
    for (const dedo of medidasDedos) {
      if (!dedo.valido) {
        resultados.push({
          nombreDedo: nombresDedos[dedo.indiceDedo] || `Dedo ${dedo.indiceDedo}`,
          anchoCm: 0,
          altoCm: 0,
          talla: "Faltante", // O N/A
          valido: false,
        });
        continue;
      }
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
        valido: true,
      });
    }
    return resultados;
  }

  public async analizarTallas(imagen: HTMLImageElement): Promise<ResultadoTalla[]> {
    // 1. Validar presencia de mano
    const hayMano = await this.detectarManoRapido(imagen);
    if (!hayMano) throw new Error("No se detecto ninguna mano. Porfavor intenta de nuevo");

    // 2. Validar presencia de moneda
    const datosMoneda = this.encontrarMoneda(imagen);
    if (!datosMoneda.encontrada)
      throw new Error("No se detecto ninguna moneda. Porfavor intenta de nuevo");

    // 3. Procesar y extraer medidas (si ambos existen)
    const resultadoProcesamiento = await this.procesarMano(imagen, datosMoneda);
    if (!resultadoProcesamiento)
      throw new Error("Error al procesar los datos. Porfavor intenta de nuevo");
    // 4. Calcular tallas e imprimir en consola
    const tallasFinales = this.pxACM(resultadoProcesamiento.medidas, datosMoneda);
    console.log("Resultados de medición completados:", tallasFinales);

    return tallasFinales;
  }

  public async analizarDedosEspecificos(
    imagen: HTMLImageElement,
    indicesFaltantes: number[],
  ): Promise<ResultadoTalla[]> {
    if (!indicesFaltantes || indicesFaltantes.length === 0) return [];

    const hayMano = await this.detectarManoRapido(imagen);
    if (!hayMano) throw new Error("No se detectó mano en la nueva imagen.");

    const datosMoneda = this.encontrarMoneda(imagen);
    if (!datosMoneda.encontrada) throw new Error("No se detectó moneda en la nueva imagen.");

    // Pasamos el arreglo al método modificado
    const roisCrudosMat = await this.capturarDedos(imagen, indicesFaltantes);
    if (!roisCrudosMat || roisCrudosMat.length === 0)
      throw new Error("Error extrayendo los dedos específicos.");

    const roisProcesadosMat = this.procesarDedos(roisCrudosMat);
    const medidasJSON: MedicionUna[] = this.medirUnasPixeles(roisProcesadosMat);

    // Limpieza de memoria
    for (const item of roisCrudosMat) if (item.mat && !item.mat.isDeleted()) item.mat.delete();
    for (const item of roisProcesadosMat) if (item.mat && !item.mat.isDeleted()) item.mat.delete();

    // pxACM ya itera solo sobre los dedos que traen el objeto MedicionUna
    const tallasFinales = this.pxACM(medidasJSON, datosMoneda);

    return tallasFinales;
  }

  private matToBase64(mat: any): string | null {
    if (!mat || mat.isDeleted()) return null;
    const canvas = document.createElement("canvas");
    try {
      cv.imshow(canvas, mat);
      return canvas.toDataURL("image/png");
    } catch (e) {
      return null;
    }
  }

  public async generarImagenesDebug(
    imagen: HTMLImageElement,
  ): Promise<{ indiceDedo: number; base64: string }[]> {
    const roisCrudos = await this.capturarDedos(imagen);
    const roisProcesados = this.procesarDedos(roisCrudos);

    const debugImages: { indiceDedo: number; base64: string }[] = [];

    for (const item of roisProcesados) {
      if (item.mat) {
        const base64Str = this.matToBase64(item.mat);
        if (base64Str) {
          debugImages.push({ indiceDedo: item.indiceDedo, base64: base64Str });
        }
      }
    }

    // Limpiar memoria
    for (const item of roisCrudos) if (item.mat && !item.mat.isDeleted()) item.mat.delete();
    for (const item of roisProcesados) if (item.mat && !item.mat.isDeleted()) item.mat.delete();

    return debugImages;
  }
}
export const Medir = new medir();
