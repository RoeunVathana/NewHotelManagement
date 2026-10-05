import "./bodyHome.css";
const BodyHomePage = () => {
  return (
    <div className="bg-white p-10 font-sans">
      <div className="container mx-auto flex flex-col items-center gap-10 md:flex-row md:items-start md:justify-center body-homepage">
        {/* Left Column - Text Content */}
        <div className="w-full text-zinc-900 md:w-1/2 text-controller">
          {/* Main Heading in a stylish script/hand-drawn font */}
          <h1 className="mb-6 font-serif text-5xl font-medium" style={{ fontFamily: "'Permanent Marker', cursive" }}>
            Why Book Direct?
          </h1>
          
          <div className="space-y-6 text-base leading-relaxed">
            <p>
              When you book directly with Babel, you get the best of everything — and none of the hassle.
            </p>
            
            <p>
              <strong>Free cancellation until 2 days of arrival.</strong>
              Life happens. Cancel up until two days before your arrival at no charge. Any cancellation after this - Full charge - full stay.
            </p>
            
            <p>
              <strong>No deposit required.</strong>
              We trust you. Book your room without paying anything upfront.
            </p>
            
            <p>
              <strong>A real person to talk to.</strong>
              Have a question? Email us!
            </p>
            
            <p>
              <strong>You support us directly.</strong>
              Every booking through a third-party platform costs us a significant commission fee. When you book direct, more of your money stays with our team, our drivers, and our community.
            </p>
            
            <p>
              <strong>The best price.</strong>
              If you ever find us cheaper somewhere else, just contact us and we will match it.
            </p>
          </div>
        </div>
        
        {/* Right Column - Image Stack */}
        <div className="relative w-full md:w-1/2 cover-image">
          {/* Main Photo - Staff Member Back View */}
          <img 
            src="../../../.././public/imageCover/cover.webp" 
            alt="Babel staff member wearing a branded green shirt with a lotus logo" 
            className="w-full h-auto rounded-lg shadow-xl"
          />
        </div>
      </div>
    </div>
  );
};

export default BodyHomePage;