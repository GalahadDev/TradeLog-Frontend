import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const BUCKET = 'trade-screenshots';

export const uploadScreenshot = async (file: File, userId: string): Promise<string | null> => {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("Tipo de archivo no permitido. Solo se aceptan JPG, PNG o WebP.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("El archivo supera el límite de 5 MB.");
  }

  const ext = file.name.split('.').pop();
  const filePath = `${userId}/${uuidv4()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(filePath, file);
  if (error) {
    console.error('Error uploading screenshot:', error);
    return null;
  }
  return filePath;
};

export const deleteScreenshot = async (path: string): Promise<void> => {
  if (path.startsWith('https://')) return;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.error('Error deleting screenshot:', error);
};

export const resolveUrls = async (items: string[]): Promise<Record<string, string>> => {
  if (items.length === 0) return {};

  const paths = items.filter(p => !p.startsWith('https://'));
  const result: Record<string, string> = {};

  items.filter(p => p.startsWith('https://')).forEach(url => { result[url] = url; });

  if (paths.length === 0) return result;

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 3600);
  if (error || !data) {
    console.error('Error creating signed URLs:', error);
    return result;
  }

  data.forEach(item => {
    if (item.signedUrl) result[item.path] = item.signedUrl;
  });

  return result;
};
