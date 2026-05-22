import { useEffect, useMemo, useState } from "react";
import { BookingConflictError, createBooking } from "../services/bookings";
import { ConfirmationEmailError, sendBookingConfirmation } from "../services/email";

const getTeamOptions = (slot) => {
    console.log("Calculating team options for slot:", slot);
  return ["sunrise", "sunset"]
    .filter((teamKey) => slot[teamKey])
    .map((teamKey, index) => ({
      key: teamKey,
      name: slot[teamKey].name || `Team ${teamKey}`,
      max: Number(slot[teamKey].max ?? 0),
      spaces:
        Number(slot[teamKey].max ?? 0) -
        (Array.isArray(slot[teamKey].players) ? slot[teamKey].players.length : 0),
    }));
};

const BookingForm = ({ selectedSlot }) => {
  const teamOptions = useMemo(() => getTeamOptions(selectedSlot), [selectedSlot]);
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
  }, [selectedSlot.id, teamOptions]);

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
        <option>Intermediate</option>
        <option>Advanced</option>
      </select>
      </label>
      <label>
        <span>Team</span>
        <select value={teamKey} onChange={(e) => setTeamKey(e.target.value)}>
        {teamOptions.map((team) => (
          <option key={team.key} value={team.key} disabled={team.spaces <= 0}>
            {team.name} - {team.spaces} of {team.max} spaces left
          </option>
        ))}
      </select>
      </label>

      <div className="bookingTerms">
        <p>Slots may change — we’ll update you on WhatsApp.</p>
        <p>
          By booking, you agree that event photography and video may be used by
          BBVC for social media, promotion, and event coverage. All event
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
}

export default BookingForm;
