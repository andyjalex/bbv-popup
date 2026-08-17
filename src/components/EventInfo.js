import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import BookingForm from "./BookingForm";
import { subscribeToSlots } from "../services/slots";

const KOTC_SLOT_ID = "Rf1i5AxWhVBYq7u7bPnk";
const KOTC_NIGHT_SLOT_ID = "PLsxV4nuVRwB8EwclCM0";
const KOTC_MAX_BOOKINGS = 6;
const CHILDRENS_SLOT_ID = "ijnUNfhyB6wQbEBxwjUr";
const LASTSLOT = "m6sVVDAfbIuDXg4ldHqI";
const LAST_MAX_BOOKINGS = 12;

const isChildrensSlot = (slot) => {
  return slot.id === CHILDRENS_SLOT_ID;
};

const isKOTCSlot = (slot) => {
  return slot.id === KOTC_SLOT_ID || slot.id === KOTC_NIGHT_SLOT_ID;
};

const isNightKOTCSlot = (slot) => {
  console.log(slot)
  return slot.id === KOTC_NIGHT_SLOT_ID;
};

const isLastSlot = (slot) => {
  return slot.id === LASTSLOT;
};

const getSlotPeriod = (slot) => {
  if (slot.period === "night" || slot.dayPeriod === "night") {
    return "night";
  }

  if (slot.period === "day" || slot.dayPeriod === "day") {
    return "day";
  }

  const hourMatch = String(slot.label || "").match(
    /\b([01]?\d|2[0-3]):\d{2}\b/,
  );
  const hour = hourMatch ? Number(hourMatch[1]) : null;

  if (hour !== null && (hour < 7 || hour >= 20)) {
    return "night";
  }

  return "day";
};

const convertLevel = (level) => {
  switch (level) {
    case "Beginner":
      return "Bgn";
    case "Intermediate":
      return "Int";
    case "advanced":
      return "Adv";
    default:
      return level;
  }
};

const SlotBooking = ({ slots }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleSelectSlot = (slot) => {
    console.log("handle click ", slot);

    if (isChildrensSlot(slot)) {
      setSelectedSlot(null);
      return;
    }

    setSelectedSlot(slot);
  };

  const KOTCCard = ({ slot, selectedSlot }) => {
    const kotcPlayers = Array.isArray(slot.kotc?.players)
      ? slot.kotc.players
      : [];
    const spaces = KOTC_MAX_BOOKINGS - kotcPlayers.length;
    const isSelected = selectedSlot?.id === slot.id;

    return (
      <>
        <div className="teamStatus">
          {Math.max(spaces, 0)} of {KOTC_MAX_BOOKINGS} pair spaces left
          {spaces <= 0 ? (
            <span
              style={{
                color: "red",
                marginTop: 0,
                borderColor: "red",
                borderWidth: "1px",
                borderStyle: "solid",
                padding: "0.25rem",
                borderRadius: "4px",
              }}
            >
              Full
            </span>
          ) : (
            ""
          )}
        </div>
        {isNightKOTCSlot(slot) ? (
          <div>Please sign up in pairs — any combination</div>
        ) : (
          
          <div>Please sign up in mixed pairs</div>
        )}

        {isSelected && kotcPlayers.length > 0 && (
          <ul className="playerList">
            <p className="playerList__title">Who is playing</p>
            {kotcPlayers.map((player) => (
              <div className="playerItem" key={player.bookingId}>
                {player.name}
              </div>
            ))}
          </ul>
        )}
      </>
    );
  };

  const MainDetails = ({
    slot,
    teamSunsetSpaces,
    teamSunriseSpaces,
    selectedSlot,
  }) => {
    return (
      <>
        <span>{slot.sunset?.name || "Team 1"}</span>
        <small>
          <div className="teamStatus">
            {Math.max(teamSunsetSpaces, 0)} of {slot.sunset?.max ?? 0} spaces
            left
            {teamSunsetSpaces === 0 ? (
              <span
                style={{
                  color: "red",
                  marginTop: 0,
                  borderColor: "red",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  padding: "0.25rem",
                  borderRadius: "4px",
                }}
              >
                Full
              </span>
            ) : (
              ""
            )}
          </div>
          {slot.sunset?.players?.length > 0 && (
            <ul className="playerList">
              <p className="playerList__title">Who is playing</p>
              {slot.sunset.players.map((player) => (
                <div className="playerItem" key={player.bookingId}>
                  {!selectedSlot ? convertLevel(player.ability) : player.name}
                </div>
              ))}
            </ul>
          )}
        </small>
        <span>{slot.sunrise?.name || "Team 2"}</span>
        <small>
          <div className="teamStatus">
            {Math.max(teamSunriseSpaces, 0)} of {slot.sunrise?.max ?? 0} spaces
            left
            {teamSunriseSpaces === 0 ? (
              <span
                style={{
                  color: "red",
                  marginTop: 0,
                  borderColor: "red",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  padding: "0.25rem",
                  borderRadius: "4px",
                }}
              >
                Full
              </span>
            ) : (
              ""
            )}
          </div>
          {slot.sunrise?.players?.length > 0 && (
            <ul className="playerList">
              <p className="playerList__title">Who is playing</p>
              {slot.sunrise.players.map((player) => (
                <div className="playerItem" key={player.bookingId}>
                  {!selectedSlot ? convertLevel(player.ability) : player.name}
                </div>
              ))}
            </ul>
          )}
        </small>{" "}
      </>
    );
  };

  return (
    <>
      <h2>Book your slot</h2>
      <p>Choose a time you can play and we'll add you to the schedule.</p>

      <div
        className={`slotGrid${selectedSlot ? " slotGrid--hasSelection" : ""}`}
      >
        {slots
          .sort((a, b) => Number(a.order ?? a.id) - Number(b.order ?? b.id))
          .map((slot) => {
            const isKOTC = isKOTCSlot(slot);
            const isLast = isLastSlot(slot)
            const slotPeriod = getSlotPeriod(slot);
            const teamSunsetSpaces =
              Number(slot.sunset?.max ?? 0) -
              (Array.isArray(slot.sunset?.players)
                ? slot.sunset.players.length
                : 0);
            const teamSunriseSpaces =
              Number(slot.sunrise?.max ?? 0) -
              (Array.isArray(slot.sunrise?.players)
                ? slot.sunrise.players.length
                : 0);

            return (
              <button
                key={slot.id}
                className={`slotCard slotCard--${slotPeriod}${
                  selectedSlot?.id === slot.id ? " slotCard--selected" : ""
                }${isChildrensSlot(slot) ? " childrens" : ""}`}
                //onClick={() => setSelectedSlot(slot)}
                onClick={() => handleSelectSlot(slot)}
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
                {isChildrensSlot(slot) ? (
                  <h3 className="childrens-text">Children's Hour</h3>
                ) : (
                  ""
                )}

                {isKOTC ? <h3 className="KOTC-text">KOTC Hour</h3> : ""}
                

                {isLast ? <h3 className="KOTC-text">6's Hour</h3> : ""}
                <h3>{slot.label}</h3>

                {isChildrensSlot(slot) ? (
                  <p>Please contact us on IG to enter your children</p>
                ) : !isKOTC ? (
                  <MainDetails
                    slot={slot}
                    teamSunsetSpaces={teamSunsetSpaces}
                    teamSunriseSpaces={teamSunriseSpaces}
                    selectedSlot={selectedSlot}
                  />
                ) : (
                  <KOTCCard
                    slot={slot}
                    teamSunsetSpaces={teamSunsetSpaces}
                    teamSunriseSpaces={teamSunriseSpaces}
                    selectedSlot={selectedSlot}
                  />
                )}
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
      },
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
          <strong>Location:</strong> Bournemouth beach (near Harry Ramsden's)
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
