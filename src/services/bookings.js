import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export class BookingConflictError extends Error {
  constructor() {
    super("This team is full for this slot.");
    this.name = "BookingConflictError";
  }
}

export const createBooking = async (booking) => {
  const slotId = String(booking.slotId);
  const teamKey = booking.teamKey;

  return await runTransaction(db, async (transaction) => {
    const slotRef = doc(db, "slots", slotId);
    const slotSnapshot = await transaction.get(slotRef);

    if (!slotSnapshot.exists()) {
      throw new BookingConflictError();
    }

    const slot = slotSnapshot.data();
    const team = slot[teamKey];
    const players = Array.isArray(team?.players) ? team.players : [];
    const maxCapacity = Number(team?.max ?? booking.teamMaxCapacity ?? 0);

    if (!team || players.length >= maxCapacity) {
      throw new BookingConflictError();
    }

    const bookingRef = doc(collection(db, "bookings"));
    const createdAt = serverTimestamp();
    const player = {
      bookingId: bookingRef.id,
      name: booking.name,
      whatsapp: booking.whatsapp,
      ability: booking.ability,
      teamName: booking.teamName,
    };

    transaction.update(slotRef, {
      [`${teamKey}.players`]: [...players, player],
    });
    transaction.set(bookingRef, {
      ...booking,
      slotId,
      teamMaxCapacity: maxCapacity,
      createdAt,
    });

    return bookingRef;
  });
};
