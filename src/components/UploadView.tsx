import { Menu } from './ui/Menu';
import { TopBar } from './ui/TopBar'
import { DropBox } from './ui/DropBox';
import { Form } from './ui/Form'
export const UploadView = () => {
  return (
    <div>
      <TopBar />
      <DropBox />
      <Menu />
      <Form buttonText="Confirmar"
        onSubmit={(e) => e.preventDefault()}
        onButtonClick={console.log("hey")}
      >
        <Form.Input label="Nombre completo" placeholder="Juan Pérez" />
        <Form.Input label="Correo" type="email" placeholder="juan@mail.com" />
      </Form>
    </div>

  )
}
