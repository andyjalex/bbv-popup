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

const withoutUndefinedValues = (booking) => {
  return Object.fromEntries(
    Object.entries(booking).filter(([, value]) => value !== undefined),
  );
};

export const createBooking = async (booking) => {
  const slotId = String(booking.slotId);
  const teamKey = booking.teamKey;
  const isKOTCBooking =
    booking.bookingType === "kotc-mixed-pair" && teamKey === "kotc";

  return await runTransaction(db, async (transaction) => {
    const slotRef = doc(db, "slots", slotId);
    const slotSnapshot = await transaction.get(slotRef);

    if (!slotSnapshot.exists()) {
      throw new BookingConflictError();
    }

    const slot = slotSnapshot.data();
    const bookingRef = doc(collection(db, "bookings"));
    const createdAt = serverTimestamp();

    if (!teamKey) {
      transaction.set(bookingRef, {
        ...withoutUndefinedValues(booking),
        slotId,
        slotDocumentId: slotId,
        createdAt,
      });

      return bookingRef;
    }

    const team = slot[teamKey];
    const teamName = team?.name || booking.teamName || teamKey;
    const effectiveTeam = team || (isKOTCBooking
      ? {
          name: teamName,
          max: booking.teamMaxCapacity,
          players: [],
        }
      : null);
    const teamPlayers = Array.isArray(effectiveTeam?.players)
      ? effectiveTeam.players
      : [];
    const maxCapacity = Number(
      isKOTCBooking
        ? booking.teamMaxCapacity
        : effectiveTeam?.max ?? booking.teamMaxCapacity ?? 0,
    );

    if (!effectiveTeam || maxCapacity <= 0 || teamPlayers.length >= maxCapacity) {
      throw new BookingConflictError();
    }

    const player = withoutUndefinedValues({
      bookingId: bookingRef.id,
      name: booking.name,
      whatsapp: booking.whatsapp,
      ability: booking.ability,
      teamName,
      bookingType: booking.bookingType,
      playerOneName: booking.playerOneName,
      playerTwoName: booking.playerTwoName,
    });

    const updatedPlayers = [...teamPlayers, player];

    if (isKOTCBooking) {
      transaction.set(
        slotRef,
        {
          [teamKey]: {
            name: teamName,
            max: maxCapacity,
            players: updatedPlayers,
          },
        },
        { merge: true },
      );
    } else {
      transaction.update(slotRef, {
        [`${teamKey}.players`]: updatedPlayers,
      });
    }

    transaction.set(bookingRef, {
      ...withoutUndefinedValues(booking),
      slotId,
      slotDocumentId: slotId,
      teamMaxCapacity: maxCapacity,
      createdAt,
    });

    return bookingRef;
  });
};
