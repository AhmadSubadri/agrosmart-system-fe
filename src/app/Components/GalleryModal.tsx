// src/app/Components/FloatingGallery.tsx
'use client';
import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { IoMdClose } from 'react-icons/io';
import { IoMdPhotos } from "react-icons/io";

const images = [
    {img: '/assets/img/Lahan/Lahan4.jpg', fase: 1},
    {img: '/assets/img/Lahan/Lahan3.jpg', fase: 2},
    {img: '/assets/img/Lahan/Lahan2.jpg', fase: 3},
    {img: '/assets/img/Lahan/Lahan.jpg', fase: 4}
];

const FloatingGallery = () => {
    const [showGallery, setShowGallery] = useState(false);

    const toggleGallery = () => setShowGallery(!showGallery);

    return (
        <> {/* Wrapper dengan relative */}
            {/* Tombol Gallery - Ganti fixed menjadi absolute */}
            <div 
                onClick={toggleGallery} 
                className="p-2 bg-abu text-white bg-opacity-40 rounded-full absolute right-4 top-4 cursor-pointer hover:bg-primary hover:text-black duration-150 z-20"
                style={{
                  position: 'between',
                  padding: '12px',
                  backgroundColor: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  zIndex: 9999
                }}
            >
                <IoMdPhotos className="w-6 h-6" />
                <span className="sr-only">Buka Gallery</span>
            </div>

            {/* Modal tetap menggunakan fixed */}
            {showGallery && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[1000]">
                    <div className="bg-white rounded-xl p-4 w-[80%] h-[70%] relative">
                        <h3 className='text-center font-bold text-2xl'>Foto Lahan</h3>
                        <button 
                            className="absolute top-2 right-2 p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600"
                            onClick={toggleGallery}
                        >
                            <IoMdClose />
                        </button>
                        <div className='mt-8 h-[calc(100%-50px)]'>
                            <Swiper 
                                spaceBetween={10} 
                                slidesPerView={3}
                                className="h-full"
                            >
                                {images.sort((a, b) => b.fase - a.fase).map((image, index) => (
                                    <SwiperSlide key={index}>
                                        <div className="flex flex-col items-center h-full">
                                            <img 
                                                src={image.img} 
                                                alt={`Lahan fase ${image.fase}`} 
                                                className="w-full h-full max-h-[400px] object-cover rounded-lg"
                                            />
                                            <span className="mt-2 text-center font-normal">Fase {image.fase}</span>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FloatingGallery;