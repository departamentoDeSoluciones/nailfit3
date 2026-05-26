import { useState, useEffect, useRef } from "react";
import "./TopBar.css";
interface TopbarBtn {
  id: string;
  icon: string;
  action: () => void;
}
const TOPBAR_BUTTONS: TopbarBtn[] = [
  { id: "settings", icon: "⚙️", action: () => console.log("Abrir Ajustes") },
  { id: "profile", icon: "👤", action: () => console.log("Abrir Perfil") },
];
export const TopBar = () => {
  const [isFaded, setIsFaded] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Centraliza la lógica de iniciar el contador
  const startTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsFaded(true);
    }, 3000);
  };

  // Cancela el contador y muestra la barra
  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsFaded(false);
  };

  // Reinicia el contador al salir
  const handleMouseLeave = () => {
    startTimer();
  };

  useEffect(() => {
    startTimer(); // Inicia al montar
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <header
      className={`bar ${isFaded ? "is-faded" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Izquierda: Logo Tipográfico */}
      <div className="logo">
        {" "}
        <h1>MedNails</h1>
      </div>

      {/* Derecha: Botones mapeados */}
      <nav className="bar-actions">
        {TOPBAR_BUTTONS.map((btn) => (
          <button key={btn.id} onClick={btn.action} className="bar-icon-btn">
            {btn.icon}
          </button>
        ))}
      </nav>
    </header>
  );
};
