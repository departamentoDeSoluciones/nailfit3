import './Menu.css'
import { Button } from "./Button";
interface MenuItem {
  content: string;
  path: string;
}
const MENU_ITEMS: MenuItem[] = [
  { content: 'Procesar Medidadores', path: '/procesar-medidores' },
  { content: 'Mis Clientes', path: '/mis-clientes' },
  { content: 'ajustes', path: '/ajustes' },
];
export const Menu = () => {
  const handleNavigation = (path: string) => {
    console.log(`Navegando a ${path}`);
  };
  return (
    <div className="menu-container">
      {MENU_ITEMS.map((item) => (
        <Button
          key={item.path}
          onClick={() => handleNavigation(item.path)}
        >
          {item.content}
        </Button>
      ))}
    </div>
  );
};
