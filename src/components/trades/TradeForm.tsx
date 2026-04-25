import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Trade } from "@/types";
import { tradeService } from "@/lib/api";
import { uploadScreenshot, deleteScreenshot } from "@/lib/storage";
import { supabase } from "@/integrations/supabase/client";
import { normalizeTradeDate } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface TradeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  tradeToEdit?: Trade | null;
  accountId: string;
  signedUrlMap?: Record<string, string>;
}

type TradeFormData = Omit<Trade, 'tags'> & { tags: string };

export function TradeForm({ open, onOpenChange, onSuccess, tradeToEdit, accountId, signedUrlMap }: TradeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingPaths, setExistingPaths] = useState<string[]>([]);
  const [removedPaths, setRemovedPaths] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const { register, handleSubmit, setValue, reset, watch, control } = useForm<Partial<TradeFormData>>({
    defaultValues: {
      direction: 'long',
      status: 'closed',
      size: 1,
      commission: 0,
    }
  });

  useEffect(() => {
    if (tradeToEdit) {
      reset({
        ...tradeToEdit,
        tags: tradeToEdit.tags ? tradeToEdit.tags.join(", ") : "",
        entry_date: tradeToEdit.entry_date ? tradeToEdit.entry_date.split('T')[0] : '',
        exit_date: tradeToEdit.exit_date ? tradeToEdit.exit_date.split('T')[0] : '',
      });
      setExistingPaths(tradeToEdit.screenshot_urls ?? []);
      setRemovedPaths([]);
      setNewFiles([]);
      setNewPreviews([]);
    } else {
      reset({ direction: 'long', status: 'closed', size: 1, commission: 0 });
      setExistingPaths([]);
      setRemovedPaths([]);
      setNewFiles([]);
      setNewPreviews([]);
    }
  }, [tradeToEdit, reset, open]);

  useEffect(() => {
    return () => {
      newPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [newPreviews]);

  const canAddMore = existingPaths.length + newFiles.length < 3;

  const getExistingDisplayUrl = (path: string) =>
    path.startsWith('https://') ? path : (signedUrlMap?.[path] ?? '');

  const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !canAddMore) return;
    const file = e.target.files[0];
    setNewFiles(prev => [...prev, file]);
    setNewPreviews(prev => [...prev, URL.createObjectURL(file)]);
    e.target.value = '';
  };

  const handleRemoveExisting = (index: number) => {
    setRemovedPaths(prev => [...prev, existingPaths[index]]);
    setExistingPaths(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNew = (index: number) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: Partial<TradeFormData>) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const uploadedPaths = await Promise.all(
        newFiles.map(f => uploadScreenshot(f, user.id))
      );
      const validNewPaths = uploadedPaths.filter((p): p is string => p !== null);
      const screenshotUrls = [...existingPaths, ...validNewPaths];

      const tagsArray = data.tags
        ? data.tags.split(',').map(t => t.trim()).filter(t => t !== "")
        : [];

      const payload = {
        ...data,
        entry_price: Number(data.entry_price),
        exit_price: Number(data.exit_price),
        size: Number(data.size),
        pnl: Number(data.pnl),
        commission: Number(data.commission),
        tags: tagsArray,
        screenshot_urls: screenshotUrls,
        entry_date: normalizeTradeDate(data.entry_date) ?? new Date().toISOString(),
        exit_date: normalizeTradeDate(data.exit_date),
      };

      if (tradeToEdit) {
        await tradeService.update(accountId, tradeToEdit.id, payload);
        toast.success("Trade actualizado");
      } else {
        await tradeService.create(accountId, payload);
        toast.success("Trade registrado exitosamente");
      }

      await Promise.all(removedPaths.map(p => deleteScreenshot(p)));

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Error al guardar el trade");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-card border-l border-border text-foreground">
        <SheetHeader>
          <SheetTitle className="text-xl font-display font-bold">
            {tradeToEdit ? "Editar Operación" : "Registrar Nuevo Trade"}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-6">

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Símbolo</Label>
              <Input {...register("symbol", { required: true })} placeholder="NQ" className="uppercase bg-black/20" />
            </div>
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Select
                onValueChange={(val) => setValue("direction", val as 'long' | 'short')}
                defaultValue={tradeToEdit?.direction || "long"}
              >
                <SelectTrigger className="bg-black/20">
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long" className="text-profit">LONG (Compra)</SelectItem>
                  <SelectItem value="short" className="text-loss">SHORT (Venta)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Precio Entrada</Label>
              <Input type="number" step="0.00001" {...register("entry_price", { required: true })} className="bg-black/20" />
            </div>
            <div className="space-y-2">
              <Label>Precio Salida</Label>
              <Input type="number" step="0.00001" {...register("exit_price")} className="bg-black/20" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tamaño (Size)</Label>
              <Input type="number" step="0.01" {...register("size", { required: true })} className="bg-black/20" placeholder="1.0" />
            </div>
            <div className="space-y-2">
              <Label>Comisión ($)</Label>
              <Input type="number" step="0.01" {...register("commission")} className="bg-black/20" placeholder="0.00" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>PnL Bruto ($)</Label>
            <Input
              type="number"
              step="0.01"
              {...register("pnl", { required: true })}
              className={`bg-black/20 font-bold ${Number(watch('pnl')) >= 0 ? 'text-profit' : 'text-loss'}`}
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha Entrada</Label>
              <Controller
                control={control}
                name="entry_date"
                rules={{ required: true }}
                render={({ field }) => (
                  <DatePicker
                    date={field.value ? new Date(field.value + 'T12:00:00') : undefined}
                    setDate={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                    className="bg-black/20 w-full"
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha Salida</Label>
              <Controller
                control={control}
                name="exit_date"
                render={({ field }) => (
                  <DatePicker
                    date={field.value ? new Date(field.value + 'T12:00:00') : undefined}
                    setDate={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                    className="bg-black/20 w-full"
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Etiquetas (Separadas por comas)</Label>
            <Input {...register("tags")} placeholder="scalping, fvg, news" className="bg-black/20" />
          </div>

          <div className="space-y-2">
            <Label>
              Screenshots{" "}
              <span className="text-muted-foreground text-xs">
                ({existingPaths.length + newFiles.length}/3)
              </span>
            </Label>

            <div className="flex flex-wrap gap-3">
              {existingPaths.map((path, i) => (
                <div key={path} className="relative w-24 h-24">
                  <img
                    src={getExistingDisplayUrl(path)}
                    alt={`Screenshot ${i + 1}`}
                    className="w-full h-full object-cover rounded-md border border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                    onClick={() => handleRemoveExisting(i)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}

              {newPreviews.map((preview, i) => (
                <div key={preview} className="relative w-24 h-24">
                  <img
                    src={preview}
                    alt={`Nueva ${i + 1}`}
                    className="w-full h-full object-cover rounded-md border border-primary/50"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                    onClick={() => handleRemoveNew(i)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}

              {canAddMore && (
                <label className="relative w-24 h-24 border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                  <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Agregar</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleAddFile}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea {...register("notes")} className="bg-black/20" placeholder="¿Qué aprendiste de este trade?" />
          </div>

          <SheetFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tradeToEdit ? "Guardar Cambios" : "Registrar Trade"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
