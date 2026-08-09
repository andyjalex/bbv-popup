import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase";

export async function exportFirestore() {
  const collections = ["slots", "bookings"];
  const output = {};

  for (const name of collections) {
    try {
      console.log(`Reading ${name}...`);

      const snapshot = await getDocs(collection(db, name));

      output[name] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(`${name}: OK`);
    } catch (error) {
      console.error(`${name}: FAILED`, error);
    }
  }

  const blob = new Blob([JSON.stringify(output, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "firestore-backup.json";
  a.click();

  URL.revokeObjectURL(url);
}