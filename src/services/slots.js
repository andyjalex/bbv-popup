import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const sortSlots = (slots) => {
  return [...slots].sort((a, b) => {
    if (typeof a.order === "number" && typeof b.order === "number") {
      return a.order - b.order;
    }

    return String(a.label || a.time || a.id).localeCompare(
      String(b.label || b.time || b.id)
    );
  });
};

export const subscribeToSlots = (onSlots, onError) => {
  return onSnapshot(
    collection(db, "slots"),
    (snapshot) => {
      const slots = snapshot.docs.map((slotDoc) => ({
        ...slotDoc.data(),
        id: slotDoc.id,
      }));

      onSlots(sortSlots(slots));
    },
    onError
  );
};
