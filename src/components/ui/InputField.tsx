import './InputField.css';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const InputField = ({ label, ...props }: InputFieldProps) => {
  return (
    <div className="input-wrapper">
      <label className="input-label">{label}</label>
      <input className="input-field" {...props} />
    </div>
  );
};
