interface Props {
  imagePreview: string | null;
  onPreviewReady: (src: string) => void;
  onAnalyze: () => void;
}

export default function UploadView({
  imagePreview,
  onPreviewReady,
  onAnalyze,
}: Props) {
  if (!imagePreview) {
    return (
      <div
        className="drop-zone"
        onDrop={e => {
          e.preventDefault();

          const file = e.dataTransfer.files[0];

          if (!file) return;

          const reader = new FileReader();

          reader.onload = ev => {
            onPreviewReady(ev.target?.result as string);
          };

          reader.readAsDataURL(file);
        }}
        onDragOver={e => e.preventDefault()}
      >
        Suelta tu imagen aquí 📥
      </div>
    );
  }

  return (
    <div>
      <img
        src={imagePreview}
        className="preview-img"
        alt="Preview"
      />

      <button
        className="drop-zone"
        onClick={onAnalyze}
      >
        ⚙️ Analizar Ahora
      </button>
    </div>
  );
}
