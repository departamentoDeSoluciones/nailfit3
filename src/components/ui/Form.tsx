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
  return (
    <form className="form-container" {...props}>
      {children}
      {/* El botón ya está integrado internamente */}
      <div className="button-wrapper">
        <Button onClick={onButtonClick}>{buttonText}</Button>
      </div>
    </form>
  );
};
Form.Input = InputField;
