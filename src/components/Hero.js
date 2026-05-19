import { seedSlots } from "../services/seedSlots";
const Hero = () => {
  return (



      <section className="hero">
     
        <p className="eyebrow">BBVC Charity Event</p>
        <h1>24 hours of beach volleyball by Bournemouth Pier</h1>
        <p>
          We’re playing non-stop from 22–23 August 2026 to raise money for
          charity. Pick a time slot, bring your energy, and help keep the rally
          going.
        </p>
        <p className="organiser">Organised by Bournemouth Beach Volleyball Community</p>
        <a href="#slots" className="primaryBtn">
          Book a time slot
        </a>
        {/* <button onClick={seedSlots}>Seed Slots</button> */}
      </section>

  );
};

export default Hero;
