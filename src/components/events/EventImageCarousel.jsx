import Slider from "react-slick";

export default function EventImageCarousel({link}) {

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        arrows: false,
        autoplay: true,
        autoplaySpeed: 3000,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

  return (
    
    <div
      className="overflow-hidden rounded-xl shadow-md bg-gray-100 backdrop-blur-3xl "
      style={{ width: "250px", height: "200px", aspectRatio: "3 / 4" }}
    >
      {
        link ? (<Slider {...settings}>
          {images.map((src, i) => (
            <div key={i} className="flex justify-center items-center">
              <img
                src={src}
                alt={`carousel-${i}`}
                className="object-cover w-full h-full rounded-xl"
              />
            </div>
          ))}
        </Slider>) : ( <div className="flex justify-center items-center h-full text-gray-500 text-sm"> No images available</div>)
      }
        
    </div>
  )
}

