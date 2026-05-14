import { useEffect, useRef } from 'react';
import { useRecognitionEngine } from './hooks/useRecognitionEngine';
import './App.css';

function App() {
  const {
    uiState,
    estadoScan,
    dedosImgs,
    medidas,
    errorMessage,
    videoRef,
    startCamera,
    scanVideoFrame,
    resetFlow,
    manualCapture // Asegúrate de exportarlo desde tu hook modificado
  } = useRecognitionEngine();

  const requestRef = useRef<number>(0);
  const isScanningRef = useRef<boolean>(false);

  useEffect(() => {
    const loop = async () => {
      if (uiState !== 'DETECTING') return;

      if (!isScanningRef.current) {
        isScanningRef.current = true;
        await scanVideoFrame();
        isScanningRef.current = false;
      }
      requestRef.current = requestAnimationFrame(loop);
    };

    if (uiState === 'DETECTING') {
      requestRef.current = requestAnimationFrame(loop);
    }

    return () => cancelAnimationFrame(requestRef.current);
  }, [uiState, scanVideoFrame]);

  const renderStatusEmojis = () => {
    const hayMano = estadoScan === 1 || estadoScan === 3;
    const hayMoneda = estadoScan === 2 || estadoScan === 3;
    return (
      <div className="status-bar">
        <span>{hayMano ? "👋✅" : "👋❌"}</span>
        <span style={{ margin: "0 15px" }}>{hayMoneda ? "🪙✅" : "🪙❌"}</span>
        {estadoScan === 3 && <span className="badge">¡LISTO!</span>}
      </div>
    );
  };

  return (
    <div className="app-container">
      <div className="dynamic-view">
        {uiState === 'LOADING' && <div className="status-header">Cargando visión artificial...</div>}

        {uiState === 'IDLE' && (
          <div className="hero-zone">
            <h2> mednail motor </h2>
            <button className="btn-action" onClick={startCamera}>
              📸 Iniciar Cámara
            </button>
          </div>
        )}

        {uiState === 'DETECTING' && (
          <div className="scanner-container">
            <video ref={videoRef} autoPlay playsInline muted className="video-feed" />
            {renderStatusEmojis()}
            <div className="controls">
              <button
                className={`btn-action ${estadoScan !== 3 ? 'disabled' : ''}`}
                onClick={manualCapture}
                disabled={estadoScan !== 3}
              >
                Capturar Medición
              </button>
              <button className="btn-action " onClick={resetFlow}>Cancelar</button>
            </div>
          </div>
        )}

        {uiState === 'ANALYZING' && <div className="status-header">⚙️ Calculando mm reales...</div>}

        {uiState === 'DONE' && (
          <div className="results-container">
            <div className="status-header">✨ Resultados Finales</div>
            <div className="results-grid">
              {dedosImgs.map((s, i) => (
                <div key={i} className="result-item">
                  <img src={s} className="result-thumb" alt="Uña" />
                  <div className="result-data">{medidas[i]?.anchoPixeles || 0}px</div>
                </div>
              ))}
            </div>
            <button className="btn-action" onClick={resetFlow}>Nueva Medición</button>
          </div>
        )}

        {uiState === 'ERROR' && (
          <div className="error-zone">
            <div className="status-header">❌ Error</div>
            <p>{errorMessage}</p>
            <button className="btn-action" onClick={resetFlow}>Reintentar</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
