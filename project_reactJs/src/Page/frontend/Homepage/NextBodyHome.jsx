import "./nextBodyHome.css"
const NextBodyHome = () => {
  // Sample data for the grid of images
  const images = [
    { id: 1, src: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600", alt: "Babel Guesthouse Bedroom 1", className: "col-span-2 md:col-span-1 h-48 md:h-64" },
    { id: 2, src: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600", alt: "Tacos food dish", className: "h-24 md:h-32" },
    { id: 3, src: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600", alt: "Dumplings and side", className: "h-24 md:h-32" },
    { id: 4, src: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?q=80&w=600", alt: "Flatbread dish", className: "col-span-2 md:col-span-1 h-24 md:h-32" },
    { id: 5, src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600", alt: "Twin Bedroom Layout", className: "col-span-2 md:col-span-1 h-48 md:h-64" },
    { id: 6, src: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=600", alt: "Tropical Swimming Pool View", className: "col-span-2 md:col-span-1 h-48 md:h-48" },
    { id: 7, src: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=600", alt: "Babel Guesthouse Bedroom 2", className: "col-span-2 md:col-span-1 h-48 md:h-48" },
    { id: 8, src: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600", alt: "Lounge Area and Plants", className: "col-span-2 md:col-span-1 h-48 md:h-48" },
  ];

  return (
    <section className="bg-[#b5ad8a] text-[#0d0d0d] font-sans py-16 px-6 md:px-12 lg:px-24 flex flex-col items-center container" style={{marginBottom: "2rem"}}>
      
      {/* Header Info */}
      <div className="max-w-3xl text-center space-y-6 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Your sustainable choice
        </h2>
        <p className="text-lg md:text-xl font-medium leading-relaxed">
          Babel Guesthouse has been welcoming families and conscious travellers to Siem Reap since 2008.
        </p>
        <p className="text-base md:text-lg leading-relaxed">
          Set around a tropical garden and pool, our 22 rooms give you a peaceful base after a day exploring the temples — with a restaurant serving everything from local Khmer dishes to kid-friendly favourites, all vegan-friendly options included.
        </p>
        <p className="text-sm md:text-base opacity-90 max-w-2xl mx-auto pt-2">
          We're also home to Cambodia's first Eco-Shop and Refill Station, so you can travel well and tread lightly at the same time.
        </p>
      </div>

      {/* Image Collage Grid */}
      <div className="image-controller">
        <div>
            <img src={images[0].src} alt={images[0].alt}/>
            <img src={images[1].src} alt={images[1].alt}/>
            <img src={images[2].src} alt={images[2].alt}/>
            <img src={images[3].src} alt={images[3].alt}/>
            <img src={images[4].src} alt={images[4].alt}/>
            <img src={images[5].src} alt={images[5].alt}/>
            {/* <img src={images[6].src} alt={images[6].alt}/>
            <img src={images[7].src} alt={images[7].alt}/> */}
        </div>
      </div>

      

    </section>
  );
};

export default NextBodyHome;