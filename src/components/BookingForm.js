import { useEffect, useMemo, useState } from "react";
import { BookingConflictError, createBooking } from "../services/bookings";
import {
  ConfirmationEmailError,
  sendBookingConfirmation,
} from "../services/email";

const KOTC_SLOT_ID = "Rf1i5AxWhVBYq7u7bPnk";
const KOTC_TEAM_KEY = "kotc";

const KOTC_NIGHT_SLOT_ID ="PLsxV4nuVRwB8EwclCM0";
const KOTC_MAX_BOOKINGS = 6;
const CHILDRENS_SLOT_ID = "ijnUNfhyB6wQbEBxwjUr";

const isChildrensSlot = (slot) => {
  return slot.id === CHILDRENS_SLOT_ID;
};

const isKOTCSlot = (slot) => {
  return slot.id === KOTC_SLOT_ID || slot.id === KOTC_NIGHT_SLOT_ID;
};

const getTeamOptions = (slot) => {  
  return ["sunrise", "sunset"]
    .filter((teamKey) => slot[teamKey])
    .map((teamKey) => ({
      key: teamKey,
      name: slot[teamKey].name || `Team ${teamKey}`,
      max: Number(slot[teamKey].max ?? 0),
      spaces:
        Number(slot[teamKey].max ?? 0) -
        (Array.isArray(slot[teamKey].players)
          ? slot[teamKey].players.length
          : 0),
    }));
};

const StandardBookingForm = ({ selectedSlot }) => {
  console.log('standard')
  const teamOptions = useMemo(
    () => getTeamOptions(selectedSlot),
    [selectedSlot],
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [ability, setAbility] = useState("Beginner");
  const [teamKey, setTeamKey] = useState(teamOptions[0]?.key || "");
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const availableTeam = teamOptions.find((team) => team.spaces > 0);
    setTeamKey(availableTeam?.key || teamOptions[0]?.key || "");
    setFeedback(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlot.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedWhatsapp = whatsapp.trim();
    const selectedTeam = teamOptions.find((team) => team.key === teamKey);

    if (!selectedTeam) {
      setFeedback({
        type: "error",
        text: "Please choose a team before booking this slot.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await createBooking({
        name: trimmedName,
        email: trimmedEmail,
        whatsapp: trimmedWhatsapp,
        ability,
        teamKey,
        teamName: selectedTeam.name,
        teamMaxCapacity: selectedTeam.max,
        slotId: selectedSlot.id,
        slotLabel: selectedSlot.label,
        status: "booked",
      });

      try {
        await sendBookingConfirmation({
          name: trimmedName,
          email: trimmedEmail,
          whatsapp: trimmedWhatsapp,
          ability,
          teamName: selectedTeam.name,
          slotLabel: selectedSlot.label,
        });

        setFeedback({
          type: "success",
          text: `Thanks ${trimmedName}! You're booked for ${selectedSlot.label} with ${selectedTeam.name}. A confirmation email is on its way.`,
        });
      } catch (emailError) {
        if (!(emailError instanceof ConfirmationEmailError)) {
          throw emailError;
        }

        setFeedback({
          type: "warning",
          text: `Thanks ${trimmedName}! You're booked for ${selectedSlot.label} with ${selectedTeam.name}, but we could not send the confirmation email.`,
        });
      }

      setName("");
      setEmail("");
      setWhatsapp("");
      setAbility("Beginner");
      setTeamKey(teamOptions[0]?.key || "");
    } catch (error) {
      if (error instanceof BookingConflictError) {
        setFeedback({
          type: "error",
          text: "Sorry, that team is already full for this slot. Please choose another team or slot.",
        });
      } else {
        setFeedback({
          type: "error",
          text: "Sorry, we could not complete your booking request. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bookingSection">
      <form onSubmit={handleSubmit} className="bookingForm">
        <h3>{selectedSlot.label}</h3>

        <label>
          <span>Your name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            required
          />
        </label>

        <label>
          <span>Email address</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            autoComplete="email"
            required
          />
        </label>

        <label>
          <span>WhatsApp number</span>
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="WhatsApp number"
            autoComplete="tel"
            required
          />
        </label>
        <label>
          <span>Ability</span>
          <select value={ability} onChange={(e) => setAbility(e.target.value)}>
            <option>Beginner</option>
            <option>Improver</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </label>
        <label>
          <span>Team</span>
          <select value={teamKey} onChange={(e) => setTeamKey(e.target.value)}>
            {teamOptions.map((team) => (
              <option
                key={team.key}
                value={team.key}
                disabled={team.spaces <= 0}
              >
                {team.name} - {team.spaces} of {team.max} spaces left
              </option>
            ))}
          </select>
        </label>

        <div className="bookingTerms">
          <p>Slots may change — we’ll update you on WhatsApp.</p>
          <p>
            By booking, you agree that event photography and video may be used
            by BBVC for social media, promotion, and event coverage. All event
            photography and video belongs to BBVC.
          </p>
          <p>You must be 18 or over to book and take part.</p>
        </div>

        <button type="submit" disabled={isSubmitting || !teamKey}>
          {isSubmitting ? "Booking..." : "Book this slot"}
        </button>

        {feedback && (
          <p className={`bookingFeedback bookingFeedback--${feedback.type}`}>
            {feedback.text}
          </p>
        )}
      </form>
    </section>
  );
};

const KOTCBookingForm = ({ selectedSlot }) => {
  const [playerOneName, setPlayerOneName] = useState("");
  const [playerTwoName, setPlayerTwoName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const teamName = "KOTC mixed pairs";
  const kotcPlayers = Array.isArray(selectedSlot.kotc?.players)
    ? selectedSlot.kotc.players
    : [];
  const kotcSpaces = KOTC_MAX_BOOKINGS - kotcPlayers.length;

  useEffect(() => {
    setFeedback(null);
  }, [selectedSlot.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    const trimmedPlayerOneName = playerOneName.trim();
    const trimmedPlayerTwoName = playerTwoName.trim();
    const trimmedEmail = email.trim();
    const trimmedWhatsapp = whatsapp.trim();

    const pairName = `${trimmedPlayerOneName} & ${trimmedPlayerTwoName}`;

    try {
      await createBooking({
        name: pairName,
        email: trimmedEmail,
        whatsapp: trimmedWhatsapp,
        ability: "KOTC mixed pair",
        teamKey: KOTC_TEAM_KEY,
        teamName,
        teamMaxCapacity: KOTC_MAX_BOOKINGS,
        slotId: selectedSlot.id,
        slotDocumentId: selectedSlot.id,
        slotLabel: selectedSlot.label,
        playerOneName: trimmedPlayerOneName,
        playerTwoName: trimmedPlayerTwoName,
        bookingType: "kotc-mixed-pair",
        status: "booked",
      });

      try {
        await sendBookingConfirmation({
          name: pairName,
          email: trimmedEmail,
          whatsapp: trimmedWhatsapp,
          ability: "KOTC mixed pair",
          teamName,
          slotLabel: selectedSlot.label,
        });

        setFeedback({
          type: "success",
          text: `Thanks ${trimmedPlayerOneName}! Your pair is booked for ${selectedSlot.label}. A confirmation email is on its way.`,
        });
      } catch (emailError) {
        if (!(emailError instanceof ConfirmationEmailError)) {
          throw emailError;
        }

        setFeedback({
          type: "warning",
          text: `Thanks ${trimmedPlayerOneName}! Your pair is booked for ${selectedSlot.label}, but we could not send the confirmation email.`,
        });
      }

      setPlayerOneName("");
      setPlayerTwoName("");
      setEmail("");
      setWhatsapp("");
    } catch (error) {
      if (error instanceof BookingConflictError) {
        setFeedback({
          type: "error",
          text: "Sorry, KOTC is already full.",
        });
      } else {
        console.error("KOTC booking failed:", error);
        setFeedback({
          type: "error",
          text: "Sorry, we could not complete your booking request. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bookingSection">
      <form onSubmit={handleSubmit} className="bookingForm">
        <h3>KOTC mixed pairs - {selectedSlot.label}</h3>

        <label>
          <span>Player 1 name</span>
          <input
            value={playerOneName}
            onChange={(e) => setPlayerOneName(e.target.value)}
            placeholder="Player 1 name"
            autoComplete="name"
            required
          />
        </label>

        <label>
          <span>Player 2 name</span>
          <input
            value={playerTwoName}
            onChange={(e) => setPlayerTwoName(e.target.value)}
            placeholder="Player 2 name"
            autoComplete="off"
            required
          />
        </label>

        <label>
          <span>Email address</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            autoComplete="email"
            required
          />
        </label>

        <label>
          <span>WhatsApp number</span>
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="WhatsApp number"
            autoComplete="tel"
            required
          />
        </label>

        <div className="bookingTerms">
          <p>
            {Math.max(kotcSpaces, 0)} of {KOTC_MAX_BOOKINGS} KOTC pair spaces
            left.
          </p>
          <p>Please sign up as a mixed pair for KOTC.</p>
          <p>Slots may change — we’ll update you on WhatsApp.</p>
          <p>
            By booking, you agree that event photography and video may be used
            by BBVC for social media, promotion, and event coverage. All event
            photography and video belongs to BBVC.
          </p>
          <p>You must be 18 or over to book and take part.</p>
        </div>

        <button type="submit" disabled={isSubmitting || kotcSpaces <= 0}>
          {isSubmitting ? "Booking..." : "Book KOTC pair"}
        </button>

        {feedback && (
          <p className={`bookingFeedback bookingFeedback--${feedback.type}`}>
            {feedback.text}
          </p>
        )}
      </form>
    </section>
  );
};

const BookingForm = ({ selectedSlot }) => {
  if (isChildrensSlot(selectedSlot)) {
    return null;
  }

  console.log(selectedSlot)

  if (isKOTCSlot(selectedSlot)) {
    return <KOTCBookingForm selectedSlot={selectedSlot} />;
  }

  return <StandardBookingForm selectedSlot={selectedSlot} />;
};

export default BookingForm;
