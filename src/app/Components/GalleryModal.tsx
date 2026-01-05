// src/app/Components/FloatingGallery.tsx
"use client";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import {
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";

const images = [
  {
    img: "/assets/img/Lahan/Lahan4.jpg",
    fase: 1,
    title: "Fase Vegetatif Awal",
    date: "2024-01-15",
  },
  {
    img: "/assets/img/Lahan/Lahan3.jpg",
    fase: 2,
    title: "Fase Vegetatif Akhir",
    date: "2024-02-10",
  },
  {
    img: "/assets/img/Lahan/Lahan2.jpg",
    fase: 3,
    title: "Fase Reproduktif",
    date: "2024-03-05",
  },
  {
    img: "/assets/img/Lahan/Lahan.jpg",
    fase: 4,
    title: "Fase Pematangan",
    date: "2024-03-30",
  },
];

const FloatingGallery = () => {
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const toggleGallery = () => setShowGallery(!showGallery);
  const nextImage = () =>
    setSelectedImage((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="relative">
      {/* Tombol Gallery - ABSOLUTE di dalam container */}
      <button
        onClick={toggleGallery}
        className="absolute top-3 right-3 z-20 p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center group"
      >
        <Camera className="w-5 h-5" />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {images.length}
        </div>
        <span className="sr-only">Buka Gallery</span>
      </button>

      {/* Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[9999] animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Gallery Lahan
                  </h3>
                  <p className="text-sm text-gray-600">
                    Dokumentasi perkembangan tanaman
                  </p>
                </div>
              </div>
              <button
                onClick={toggleGallery}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Selected Image Preview */}
              <div className="mb-6">
                <div className="relative h-64 md:h-96 rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={images[selectedImage].img}
                    alt={`Lahan fase ${images[selectedImage].fase}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="text-white">
                      <h4 className="text-lg font-semibold">
                        {images[selectedImage].title}
                      </h4>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                            Fase {images[selectedImage].fase}
                          </span>
                          <span className="text-sm text-white/80">
                            {images[selectedImage].date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={prevImage}
                            className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5 text-white" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                          >
                            <ChevronRight className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Thumbnails */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Semua Foto ({images.length})
                </h4>
                <Swiper
                  spaceBetween={16}
                  slidesPerView={3}
                  breakpoints={{
                    640: { slidesPerView: 3 },
                    768: { slidesPerView: 4 },
                    1024: { slidesPerView: 5 },
                  }}
                  className="pb-2"
                >
                  {images
                    .sort((a, b) => b.fase - a.fase)
                    .map((image, index) => (
                      <SwiperSlide key={index}>
                        <div
                          className={`relative rounded-lg overflow-hidden cursor-pointer transition-all ${
                            selectedImage === index
                              ? "ring-2 ring-blue-500 ring-offset-2"
                              : "hover:ring-2 hover:ring-gray-300"
                          }`}
                          onClick={() => setSelectedImage(index)}
                        >
                          <img
                            src={image.img}
                            alt={`Lahan fase ${image.fase}`}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                            <div className="text-white text-xs font-medium">
                              <div className="flex items-center justify-between">
                                <span>Fase {image.fase}</span>
                                {selectedImage === index && (
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                </Swiper>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Camera className="w-4 h-4" />
                  <span>
                    {selectedImage + 1} dari {images.length} foto
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleGallery}
                    className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingGallery;
