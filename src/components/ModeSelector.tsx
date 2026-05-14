type Mode = 'UPLOAD' | 'VIDEO';

interface Props {
  mode: Mode;
  onChangeMode: (mode: Mode) => void;
}

export default function ModeSelector({ mode, onChangeMode }: Props) {
  return (
    <div className="mode-selector">
      <button
        className={`btn-mode ${mode === 'UPLOAD' ? 'active' : 'inactive'}`}
        onClick={() => onChangeMode('UPLOAD')}
      >
        📂 Cargar Foto
      </button>

      <button
        className={`btn-mode ${mode === 'VIDEO' ? 'active' : 'inactive'}`}
        onClick={() => onChangeMode('VIDEO')}
      >
        🎥 Escáner Vivo
      </button>
    </div>
  );
}
