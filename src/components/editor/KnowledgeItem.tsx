import { XCCM_KNOWLEDGE_MIME, KnowledgeDragPayload } from "@/types/editor.types";

type Props = {
  item: KnowledgeDragPayload;
};

export default function KnowledgeItem({ item }: Props) {
  const handleDragStart = (event: React.DragEvent) => {
    event.dataTransfer.effectAllowed = "copy";

    event.dataTransfer.setData(
      XCCM_KNOWLEDGE_MIME,
      JSON.stringify(item)
    );
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="cursor-grab rounded px-2 py-1 hover:bg-muted"
    >
      {item.title}
    </div>
  );
}
