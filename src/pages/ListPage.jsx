import { useParams } from "react-router-dom";

export default function ListPage() {
  const { listId } = useParams();

  return <p>listId: {listId}</p>;
}