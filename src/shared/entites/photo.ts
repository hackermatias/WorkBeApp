export class Photo implements IPhoto {
  id: number;
  id_empresa: number;
  numero_documento: string;
  tipo_marca: number;
  hora_marca: string;
  fecha: string;
  usuario: string;
  img: string;

  constructor(data?: IPhoto) {
    if (data) {
      this.id = data.id;
      this.id_empresa = data.id_empresa;
      this.numero_documento = data.numero_documento;
      this.tipo_marca = data.tipo_marca;
      this.hora_marca = data.hora_marca;
      this.fecha = data.fecha;
      this.usuario = data.usuario;
      this.img = data.img;
    }
  }
}
interface IPhoto {
  id: number;
  id_empresa: number;
  numero_documento: string;
  tipo_marca: number;
  hora_marca: string;
  fecha: string;
  usuario: string;
  img: string;
}
