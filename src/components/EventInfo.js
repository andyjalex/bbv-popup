import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import BookingForm from "./BookingForm";
import { subscribeToSlots } from "../services/slots";

const SlotBooking = ({ slots }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);

  return (
    <>
      <h2>Book your slot</h2>
      <p>Choose a time you can play and we'll add you to the schedule.</p>

      <div
        className={`slotGrid${
          selectedSlot ? " slotGrid--hasSelection" : ""
        }`}
      >
        {[...slots].sort((a, b) => Number(a.order ?? a.id) - Number(b.order ?? b.id)).map((slot) => {
          const team1Spaces =
            Number(slot.team1?.max ?? 0) -
            (Array.isArray(slot.team1?.players) ? slot.team1.players.length : 0);
          const team2Spaces =
            Number(slot.team2?.max ?? 0) -
            (Array.isArray(slot.team2?.players) ? slot.team2.players.length : 0);

          return (
            <button
              key={slot.id}
              className={`slotCard${
                selectedSlot?.id === slot.id ? " slotCard--selected" : ""
              }`}
              onClick={() => setSelectedSlot(slot)}
            >
              {selectedSlot?.id === slot.id && (
                <span
                  className="slotCardClose"
                  aria-label="Show all slots"
                  role="button"
                  tabIndex="0"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedSlot(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.stopPropagation();
                      setSelectedSlot(null);
                    }
                  }}
                >
                  <IoClose aria-hidden="true" />
                </span>
              )}
              <h3>{slot.label}</h3>
              <span>{slot.team1?.name || "Team 1"}</span>
              <small>
                {Math.max(team1Spaces, 0)} of {slot.team1?.max ?? 0} spaces left
              </small>
              <span>{slot.team2?.name || "Team 2"}</span>
              <small>
                {Math.max(team2Spaces, 0)} of {slot.team2?.max ?? 0} spaces left
              </small>
            </button>
          );
        })}
      </div>

      {selectedSlot && <BookingForm selectedSlot={selectedSlot} />}
    </>
  );
};

const EventInfo = () => {
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [slotError, setSlotError] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToSlots(
      (firebaseSlots) => {
        setSlots(firebaseSlots);
        setSlotError("");
        setLoading(false);
      },
      () => {
        setSlotError("Sorry, we could not load the slots. Please try again.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return (
    <div className="eventInfoContainer">
      <section className="eventInfo">
        <h2>Event info</h2>
        <p>
          <strong>Date:</strong> 22–23 August 2026
        </p>
        <p>
          <strong>Location:</strong> Bournemouth Pier beach
        </p>
        <p>
          <strong>Format:</strong> 24 hours of continuous beach volleyball
        </p>
        <p>
          <strong>Goal:</strong> Raise money for charity and bring the community
          together for a fun day.
        </p>
      </section>

      <section className="howItWorks">
        <h2>How it works</h2>
        <p>
          Choose a time slot you can play. We’ll organise the players across the
          day and night so there’s always a game running.
        </p>
      </section>

      <section id="slots" className="slots">
        {loading ? (
          <div>
            <h2>Book your slot</h2>
            <p>
              Add your name to a slot and let us know when you’re available.
            </p>
            Loading…
          </div>
        ) : slotError ? (
          <div>
            <h2>Book your slot</h2>
            <p className="bookingFeedback bookingFeedback--error">
              {slotError}
            </p>
          </div>
        ) : slots.length === 0 ? (
          <div>
            <h2>Book your slot</h2>
            <p>No slots are available yet. Please check back soon.</p>
          </div>
        ) : (
          <SlotBooking slots={slots} />
        )}
      </section>
    </div>
  );
};

export default EventInfo;
