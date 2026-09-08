/* export interface SavedItem {
  id: string;
  title: string;
  type: 'tiktok' | 'whatsapp';
  url: string;
  date: string;
} */
// SE AGREGÓ EL CAMPO "mediaType" PARA SABER SI CADA ELEMENTO GUARDADO ES UNA IMAGEN O UN VIDEO,
// Y ASÍ PODER SEPARARLOS EN PESTAÑAS EN LAS PANTALLAS DE GUARDADOS Y WHATSAPP.
export type MediaType = 'image' | 'video';

export interface SavedItem {
  id: string;
  title: string;
  type: 'tiktok' | 'whatsapp';
  mediaType: MediaType;
  url: string;
  thumbnail?: string;
  date: string;
}
