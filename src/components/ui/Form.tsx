import { InputField } from "./InputField";
import { Button } from "./Button";
import "./Form.css";
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  buttonText?: string; // Texto personalizado para el botón
  onButtonClick?: () => void; // Acción del botón
}
type FormComponent = React.FC<FormProps> & {
  Input: typeof InputField;
};
export const Form: FormComponent = ({
  children,
  buttonText = "ENVIAR",
  onButtonClick = () => {},
  ...props
}) => {
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Bloquea el refresh automático
    onButtonClick(); // Ejecuta tu recolección de JSON
  };
  return (
    <form className="form-container" {...props} onSubmit={handleFormSubmit}>
      {children}
      <div className="button-wrapper">
        <Button>{buttonText}</Button>
      </div>
    </form>
  );
};
Form.Input = InputField;
