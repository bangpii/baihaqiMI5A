import React, { useState, useEffect } from 'react';
import { getVisiMisiData, initializeSocket, getSocket } from '../api/api';

const VisiMisi = () => {
    const [selectedContent, setSelectedContent] = useState(null);
    const [visiMisiData, setVisiMisiData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        initializeSocket();
        const socket = getSocket();

        socket.on('visimisi_updated', (updatedData) => {
            console.log('🔄 Realtime update VisiMisi received!', updatedData);
            setVisiMisiData(updatedData);
        });

        const fetchData = async () => {
            try {
                const data = await getVisiMisiData();
                setVisiMisiData(data);
            } catch (error) {
                console.error('Error fetching VisiMisi data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

  
        return () => {
            if (socket) {
                socket.off('visimisi_updated');
            }
        };
    }, []);

    useEffect(() => {
        if (selectedContent) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }, [selectedContent]);

    const visi = visiMisiData.filter(item => item.type === "visi");
    const misi = visiMisiData.filter(item => item.type === "misi");
    const strategi_misi = visiMisiData.filter(item => item.type === "strategi_misi");
    const gambar = visiMisiData.filter(item => item.type === "gambar");
    const content = visiMisiData.filter(item => item.type === "content");


    const formatContent = (contentData) => {
        const contentObj = {};
        contentData.forEach(item => {
            if (item.data && item.data.title) {
                const key = item.data.title.toLowerCase().replace(' ', '');
                contentObj[key] = {
                    title: item.data.title || '',
                    visi: item.data.visi || '',
                    strategi: item.data.strategi || [],
                    target: item.data.target || [],
                    gambar: item.data.gambar || ''
                };
            }
        });
        return contentObj;
    };

    const contentObj = formatContent(content);

    const handleImageClick = (title) => {
        const contentKey = title.toLowerCase().replace(' ', '');
        if (contentObj[contentKey]) {
            setSelectedContent(contentObj[contentKey]);
        } else {
            console.warn('Content not found for:', title);
        }
    };

    const closeModal = () => {
        setSelectedContent(null);
    };

    if (loading) {
        return (
            <div className="w-full py-16 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <p>Loading data Visi & Misi...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {selectedContent && (
                <div className="
                    fixed inset-0 w-full 
                    min-h-[270rem]        
                    md:min-h-[170rem]     
                    h-full 
                    bg-black/70 backdrop-blur-lg 
                    z-[99]
                "></div>
            )}

            <div className="w-full py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
                        <div className="text-center">
                            <div className="mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl font-bold text-white">V</span>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-6">VISI</h2>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                                {visi.length > 0 ? (
                                    visi.map((item, index) => (
                                        <p key={item._id || index} className="text-lg text-gray-700 leading-relaxed text-justify">
                                            "{item.data?.desk || 'Data visi tidak tersedia'}"
                                        </p>
                                    ))
                                ) : (
                                    <p className="text-lg text-gray-700 leading-relaxed text-justify">
                                        "Data visi sedang dalam pengembangan"
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl font-bold text-white">M</span>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-6">MISI</h2>
                            </div>
                            
                            <div className="space-y-4">
                                {misi.length > 0 ? (
                                    misi.map((item, index) => (
                                        <div key={item._id || index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-bold text-sm">{index + 1}</span>
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 leading-relaxed text-justify flex-1">
                                                    {item.data?.desk || 'Data misi tidak tersedia'}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                                        <p className="text-gray-700 leading-relaxed text-justify">
                                            Data misi sedang dalam pengembangan
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl font-bold text-white">S</span>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-6">STRATEGI</h2>
                            </div>
                            
                            <div className="space-y-6">
                                {strategi_misi.length > 0 ? (
                                    strategi_misi.map((strategi, index) => (
                                        <div key={strategi._id || index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-left">
                                                {strategi.data?.title || 'Strategi'}
                                            </h3>
                                            <ul className="space-y-2 text-left">
                                                {(strategi.data?.items || []).map((item, itemIndex) => (
                                                    <li key={itemIndex} className="flex items-start space-x-2">
                                                        <span className="text-green-600 mt-1">•</span>
                                                        <span className="text-gray-700 leading-relaxed">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                                        <p className="text-gray-700 leading-relaxed text-justify">
                                            Data strategi sedang dalam pengembangan
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    <div className="mt-20">
                        <div className="flex flex-wrap justify-center gap-10 md:gap-12">
                            {gambar.length > 0 ? (
                                gambar.map((item, index) => (
                                    <div
                                        key={item._id || index}
                                        className="relative group transition-all duration-500 cursor-pointer"
                                        onClick={() => handleImageClick(item.data?.title || 'Default')}
                                    >
                                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-6 bg-black/40 blur-2xl opacity-70 group-hover:opacity-90 transition-all duration-500"></div>
                                        <img
                                            src={item.data?.item ? `http://localhost:5000${item.data.item}` : '/default-image.png'}
                                            alt={item.data?.title || 'Devisi'}
                                            className="relative w-40 h-40 md:w-52 md:h-52 rounded-2xl object-cover border-4 border-gray-300 shadow-[0_10px_25px_rgba(0,0,0,0.5)] group-hover:shadow-[0_20px_40px_rgba(90,71,206,0.8)] transform group-hover:-translate-y-3 transition-all duration-500"
                                            onError={(e) => {
                                                e.target.src = '/default-image.png'
                                            }}
                                        />
                                        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 mt-4 text-center">
                                            <span className="text-gray-800 font-medium text-center">{item.data?.title || 'Devisi'}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500">
                                    Data gambar devisi sedang dalam pengembangan
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            <footer className="relative z-10 bg-white border-t border-gray-200 py-8 mt-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col items-center justify-center gap-6">
                        <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-t from-white/10 to-transparent rounded-t-3xl"></div>
                        <div className="flex gap-6 relative z-10">
                            <a
                                href="#"
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-[#232323] hover:bg-[#232323] hover:text-white transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.4)]"
                            >
                                <i className="bx bxl-instagram text-2xl"></i>
                            </a>
                            <a
                                href="#"
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-[#232323] hover:bg-[#232323] hover:text-white transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.4)]"
                            >
                                <i className="bx bxl-facebook text-2xl"></i>
                            </a>
                            <a
                                href="#"
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-[#232323] hover:bg-[#232323] hover:text-white transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.4)]"
                            >
                                <i className="bx bx-mail-send text-2xl"></i>
                            </a>
                        </div>

                        <p className="text-black text-sm mt-2 flex items-center gap-2 relative z-10">
                            <span>Created by <b>HMPS MI .</b> |  <i className="bx bx-copyright text-base"></i> 2025</span>
                        </p>
                    </div>
                </div>
            </footer>

            {selectedContent && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative mt-[5rem] 
                                [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <button 
                            onClick={closeModal}
                            className="absolute top-4 right-4 z-10 w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors duration-300 shadow-lg"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                            {/* Gambar di kiri */}
                            <div className="flex flex-col items-center justify-center">
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-lg opacity-30"></div>
                                    <img
                                        src={selectedContent.gambar ? `http://localhost:5000${selectedContent.gambar}` : '/default-image.png'}
                                        alt={selectedContent.title}
                                        className="relative w-64 h-64 rounded-2xl object-cover shadow-2xl border-4 border-white"
                                        onError={(e) => {
                                            e.target.src = '/default-image.png'
                                        }}
                                    />
                                </div>
                                <div className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full shadow-lg">
                                    <h3 className="text-xl font-bold text-center">{selectedContent.title}</h3>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="text-center lg:text-left">
                                    <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                                        {selectedContent.title}
                                    </h2>
                                    <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto lg:mx-0"></div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100 shadow-lg">
                                    <div className="flex items-center mb-4">
                                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-white font-bold text-lg">V</span>
                                        </div>
                                        <h3 className="text-xl font-semibold text-purple-700">Visi</h3>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed text-justify italic">
                                        "{selectedContent.visi || 'Visi sedang dalam pengembangan'}"
                                    </p>
                                </div>
                                
                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100 shadow-lg">
                                    <div className="flex items-center mb-4">
                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-white font-bold text-lg">S</span>
                                        </div>
                                        <h3 className="text-xl font-semibold text-blue-700">Strategi</h3>
                                    </div>
                                    <ul className="space-y-3">
                                        {(selectedContent.strategi || []).length > 0 ? (
                                            selectedContent.strategi.map((item, index) => (
                                                <li key={index} className="flex items-start space-x-3">
                                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                                                        <span className="text-white text-sm font-bold">{index + 1}</span>
                                                    </div>
                                                    <span className="text-gray-700 leading-relaxed flex-1">
                                                        {item}
                                                    </span>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="text-gray-500">Strategi sedang dalam pengembangan</li>
                                        )}
                                    </ul>
                                </div>
                                
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 shadow-lg">
                                    <div className="flex items-center mb-4">
                                        <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-white font-bold text-lg">T</span>
                                        </div>
                                        <h3 className="text-xl font-semibold text-green-700">Target</h3>
                                    </div>
                                    <ul className="space-y-3">
                                        {(selectedContent.target || []).length > 0 ? (
                                            selectedContent.target.map((item, index) => (
                                                <li key={index} className="flex items-start space-x-3">
                                                    <div className="flex-shrink-0 mt-1.5">
                                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                    </div>
                                                    <span className="text-gray-700 leading-relaxed flex-1">
                                                        {item}
                                                    </span>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="text-gray-500">Target sedang dalam pengembangan</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VisiMisi;