import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { deleteOrder } from "@/lib/order-actions";
import type { OrderView } from "@/lib/orders";
import { EditOrderDialog } from "./edit-order-dialog";

function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (o: OrderView) => deleteOrder(o.pedido, o.status),
    onSuccess: (avisos, o) => {
      toast.success(`Pedido #${o.pedido.id} excluído`);
      if (avisos.length) toast.warning(`Atenção: ${avisos.join("; ")}.`);
    },
    onError: (e: Error) => toast.error(`Não foi possível excluir: ${e.message}`),
    // Refresh even after a failure: some linked records may already be gone.
    onSettled: () => qc.invalidateQueries(),
  });
}

/** Edit and delete buttons for one order, with their dialogs. */
export function OrderActions({ order, labels = false }: { order: OrderView; labels?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const del = useDeleteOrder();
  const id = order.pedido.id;
  const cancelado = order.status === "Cancelado";
  return (
    <>
      <Button size={labels ? "default" : "icon"} variant={labels ? "outline" : "ghost"} aria-label={`Editar pedido #${id}`}
        title={cancelado ? "Pedidos cancelados não podem ser editados" : "Editar"} disabled={cancelado || del.isPending} onClick={() => setEditing(true)}>
        <Pencil />{labels && "Editar"}
      </Button>
      <Button size={labels ? "default" : "icon"} variant={labels ? "outline" : "ghost"} className="text-destructive" aria-label={`Excluir pedido #${id}`}
        title="Excluir" disabled={del.isPending} onClick={() => setConfirming(true)}>
        <Trash2 />{labels && (del.isPending ? "Excluindo…" : "Excluir")}
      </Button>

      {editing && <EditOrderDialog order={order} onClose={() => setEditing(false)} />}

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent className="w-[calc(100%-1.5rem)] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pedido #{id}?</AlertDialogTitle>
            <AlertDialogDescription>O pedido, seus itens, o histórico e o pagamento serão apagados. Essa ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button variant="destructive" onClick={() => { setConfirming(false); del.mutate(order); }}>Excluir</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
