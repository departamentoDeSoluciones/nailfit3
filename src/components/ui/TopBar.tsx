import './TopBar.css'
interface TopbarBtn {
  id: string;
  icon: string;
  action: () => void;
}
const TOPBAR_BUTTONS: TopbarBtn[] = [
  { id: 'settings', icon: '⚙️', action: () => console.log('Abrir Ajustes') },
  { id: 'profile', icon: '👤', action: () => console.log('Abrir Perfil') }
];
export const TopBar = () => {
  return (
    <header className="bar">
      {/* Izquierda: Logo Tipográfico */}
      <div className="logo"> <h1>MedNails</h1></div>

      {/* Derecha: Botones mapeados */}
      <nav className="bar-actions">
        {TOPBAR_BUTTONS.map((btn) => (
          <button
            key={btn.id}
            onClick={btn.action}
            className="bar-icon-btn"
          >
            {btn.icon}
          </button>
        ))}
      </nav>
    </header>
  );
};
