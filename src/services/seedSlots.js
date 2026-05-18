import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const generateSlots = () => {
  const slots = [];
  const start = new Date("2026-08-22T10:00:00");

  for (let i = 0; i < 24; i++) {
    const slotStart = new Date(start);
    slotStart.setHours(start.getHours() + i);

    const slotEnd = new Date(slotStart);
    slotEnd.setHours(slotStart.getHours() + 1);

    slots.push({
      id: i+1,
      label: `${slotStart.toLocaleString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })}, ${slotStart.getHours()}:00–${slotEnd.getHours()}:00`,

      date: slotStart.toISOString(),

      team1: {
        max: 2,
        players: []
      },

      team2: {
        max: 2,
        players: []
      },

      status: "open",
    });
  }

  return slots;
};



export const seedSlots = async () => {
  const batch = [];

  const slots = generateSlots(); // optional helper

  for (const slot of slots) {
    batch.push(addDoc(collection(db, "slots"), slot));
  }

  await Promise.all(batch);

  console.log("Slots added");
};