import insta from "../assets/Insta.png";
const Hero = () => {
  return (
    <section className="hero">
      <p className="eyebrow">BBVC Charity Event</p>
      <h1>24 hours of beach volleyball by Bournemouth Pier</h1>
      <p>
        We’re playing non-stop from 22nd–23rd of August 2026 to raise money for
        the Steve Bernard Foundation. Pick a time slot, bring your energy, and
        help keep the rally going.
      </p>
      <p>
        Donate on our
        <a href="https://www.justgiving.com/page/sbf-bbv"> Just giving page </a>
      </p>
      <p className="organiser">
        Organised by Bournemouth Beach Volleyball Community
      </p>
      <a href="#slots" className="primaryBtn">
        Book a time slot
      </a>
      {/* <button type="button" className="primaryBtn" onClick={exportFirestore}>
        Export bookings
      </button> */}

      <div className="instaLink">
        <a
          href="https://www.instagram.com/bournemouthbeachvolley/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={insta} alt="Instagram" />
          <span>Follow us on Instagram</span>
        </a>
      </div>
    </section>
  );
};

export default Hero;
