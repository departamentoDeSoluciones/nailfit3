import "./Button.css";
interface ButtonProps {
  children: React.ReactNode; // El texto o ícono dentro del botón
  onClick?: () => void; // La acción a ejecutar
  variant?: "primary" | "outline"; // La variante visual (opcional)
  disabled?: boolean; // Estado de apagado (opcional)
}
export const Button = ({ children, onClick }: ButtonProps) => {
  return (
    <button className="btn-start" onClick={onClick}>
      {children}
    </button>
  );
};
