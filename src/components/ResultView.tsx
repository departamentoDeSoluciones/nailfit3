import type { MedicionUna } from '../medir';

interface Props {
  dedosImgs: string[];
  medidas: MedicionUna[];

  onReset: () => void;
}

export default function ResultsView({
  dedosImgs = [],
  medidas = [],
  onReset,
}: Props) {
  return (
    <div>
      <div className="status-header">
        ✨ Análisis Completado
      </div>

      <div className="results-grid">
        {dedosImgs.map((src, i) => (
          <div
            key={i}
            className="result-item"
          >
            <img
              src={src}
              className="result-thumb"
              alt="Recorte uña"
            />

            <div className="result-data">
              {medidas[i]?.anchoPixeles}px
            </div>
          </div>
        ))}
      </div>

      <button
        className="btn-action btn-secondary"
        onClick={onReset}
      >
        🔄 Nueva Medición
      </button>
    </div>
  );
}
