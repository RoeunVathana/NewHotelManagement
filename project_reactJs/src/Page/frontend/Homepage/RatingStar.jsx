import "./RatingStar.css";
import hotelImage from "../../../.././public/imageCover/cover.webp"; // change to your image

const RatingStars = () => {
  return (
    <div className="stars-container">
      {[...Array(5)].map((_, i) => (
        <span key={i} className="star-icon">
          ★
        </span>
      ))}
    </div>
  );
};

const TestimonialPage = () => {
  const images = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600",
      alt: "Babel Guesthouse Bedroom 1",
      className: "col-span-2 md:col-span-1 h-48 md:h-64",
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600",
      alt: "Tacos food dish",
      className: "h-24 md:h-32",
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600",
      alt: "Dumplings and side",
      className: "h-24 md:h-32",
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?q=80&w=600",
      alt: "Flatbread dish",
      className: "col-span-2 md:col-span-1 h-24 md:h-32",
    },
    {
      id: 5,
      src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600",
      alt: "Twin Bedroom Layout",
      className: "col-span-2 md:col-span-1 h-48 md:h-64",
    },
    {
      id: 6,
      src: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=600",
      alt: "Tropical Swimming Pool View",
      className: "col-span-2 md:col-span-1 h-48 md:h-48",
    },
    {
      id: 7,
      src: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=600",
      alt: "Babel Guesthouse Bedroom 2",
      className: "col-span-2 md:col-span-1 h-48 md:h-48",
    },
    {
      id: 8,
      src: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600",
      alt: "Lounge Area and Plants",
      className: "col-span-2 md:col-span-1 h-48 md:h-48",
    },
  ];
  return (
    <>
      <div className="faq-section">
        <section className="testimonial-section container">
          <div className="testimonial-image">
            <img src={hotelImage} alt="Hotel" />
          </div>

          <div className="testimonial-content">
            <h2>Don't just take our word for it</h2>

            <div className="review">
              <p>
                Brilliant as our first place to stay in Cambodia with the
                family. Really relaxing, staff very friendly and helpful, and
                their tuk tuk drivers were also brilliant.
                <span> — TripAdvisor</span>
              </p>

              <RatingStars />
            </div>

            <div className="review">
              <p>
                Whenever the family visits Siem Reap, Babel Guesthouse is where
                we stay. The staff are very friendly, the rooms clean, and the
                pool is a great way to cool off after a day out exploring.
                <span> — Booking.com Guest</span>
              </p>

              <RatingStars />
            </div>

            <div className="review">
              <p>
                A funky little hotel geared for eco, vegan and family
                travellers. For the price it's extremely good value in a nice
                walkable location.
                <span> — Family Hotel Guide</span>
              </p>

              <RatingStars />
            </div>

            <div className="review">
              <p>
                Not only a great place to stay, but a fantastic place to book
                your activities sustainably and ethically. They offered a unique
                opportunity to visit the tuk-tuk drivers at home in their
                village and share a meal with them.
                <span> — TripAdvisor</span>
              </p>

              <RatingStars />
            </div>
          </div>
        </section>
      </div>

      <section className="faq-section">
        <div className="faq-container">
          <div className="faq-left">
            <h2>Got Questions?</h2>

            <p>
              From family facilities and eco credentials to temple tours and
              local tips — everything you need to plan your stay is in our FAQ.
            </p>
          </div>

          <div className="faq-right">
            <button>Visit our FAQ page!</button>
          </div>
        </div>
      </section>
      <div
        className="image-controller container "
        style={{ marginTop: "2rem" }}
      >
        <div>
          <img src={images[0].src} alt={images[0].alt} />
          <img src={images[1].src} alt={images[1].alt} />
          <img src={images[2].src} alt={images[2].alt} />
          <img src={images[3].src} alt={images[3].alt} />
          <img src={images[4].src} alt={images[4].alt} />
          <img src={images[5].src} alt={images[5].alt} />
        </div>
      </div>
    </>
  );
};

export default TestimonialPage;
