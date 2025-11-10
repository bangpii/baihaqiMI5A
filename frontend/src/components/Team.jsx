import React, { useEffect, useState } from 'react';
import { getTeamData, initializeSocket, getSocket } from '../api/api';

const Team = () => {
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDivision, setActiveDivision] = useState("Internal");

  useEffect(() => {
    initializeSocket();
    const socket = getSocket();

    socket.on('team_updated', (updatedData) => {
      console.log('🔄 Realtime update Team received!', updatedData);
      setTeamData(updatedData);
    });

    const fetchData = async () => {
      try {
        const data = await getTeamData();
        setTeamData(data);
      } catch (error) {
        console.error('Error fetching Team data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (socket) {
        socket.off('team_updated');
      }
    };
  }, []);

  const getDivisionMapping = () => {
    return {
      "Internal": "internal",
      "Eksternal": "eksternal", 
      "IPTEK": "iptek",
      "SDM": "sdm",
      "Business Development": "business"
    };
  };

  const getLeadersByDivision = () => {
    const divisionMap = getDivisionMapping();
    const backendDivision = divisionMap[activeDivision];
    
    return teamData.filter(member => 
      member.divisi === backendDivision && 
      member.position.includes('Ketua')
    );
  };

  const getMembersByDivision = () => {
    const divisionMap = getDivisionMapping();
    const backendDivision = divisionMap[activeDivision];
    
    return teamData.filter(member => 
      member.divisi === backendDivision && 
      !member.position.includes('Ketua')
    );
  };

  const leaders = getLeadersByDivision();
  const members = getMembersByDivision();

  if (loading) {
    return (
      <div className="flex flex-col items-center text-gray-800 w-full">
        <div className="w-full max-w-3xl px-5 sm:px-6 py-6 text-center">
          <p>Loading data Team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-gray-800 w-full">

      <div
        className="
          w-screen
          bg-[url('/team/bg_team.png')]
          bg-no-repeat 
          bg-center 
          bg-contain 
          sm:bg-contain
          md:bg-cover
          scale-110
          sm:scale-100
          transition-all duration-500
          aspect-[16/10] sm:aspect-[16/9] md:aspect-[16/8]
          -mt-10 
          -ml-4 -mr-4
          sm:-ml-6 sm:-mr-6
          md:-ml-8 md:-mr-8
          mb-4
          rounded-t-2xl
        "
      />

      <div 
        className="w-full max-w-3xl px-5 sm:px-6 py-6 text-left space-y-6 mb-[5rem] content-hmps"
      >
        <style>
          {`
            /* 💻 Desktop besar (1321px ke atas) */
            @media (min-width: 1321px) {
              .content-hmps {
                max-width: 80rem !important; 
                padding-left: 8rem !important;
                padding-right: 8rem !important;
              }

              .content-hmps p {
                font-size: 1.3rem !important;
                line-height: 2rem !important;
              }
            }
          `}
        </style>

        <p className="leading-relaxed text-black text-justify">
          HMPS MI adalah wadah resmi mahasiswa Manajemen Informatika yang berkomitmen 
          untuk mengembangkan potensi akademik, kepemimpinan, dan kreativitas setiap anggotanya. 
          Melalui berbagai program, workshop, dan kegiatan rutin, kami mendorong mahasiswa 
          untuk berinovasi dan mengasah kemampuan mereka, sehingga siap menghadapi tantangan di dunia kampus maupun industri.
        </p>

        <p className="leading-relaxed text-blck text-justify">
          Tim HMPS MI terdiri dari individu-individu berdedikasi yang aktif merancang proyek, kegiatan sosial, 
          dan inovasi yang bermanfaat bagi seluruh mahasiswa MI. Bersama-sama, kami bekerja untuk membangun komunitas 
          yang inspiratif, kolaboratif, dan produktif, sambil menanamkan nilai-nilai kepemimpinan, tanggung jawab, 
          dan semangat kebersamaan di setiap kegiatan yang kami lakukan.
        </p>

        <form className="flex flex-wrap justify-center gap-4 mt-6">
          {["Internal", "Eksternal", "IPTEK", "SDM", "Business Development"].map((text, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveDivision(text)}
              className="px-6 py-3 font-semibold rounded-full text-black border-2 border-black shadow-lg transition-all duration-300"
              style={{
                background: activeDivision === text 
                  ? "radial-gradient(circle at center, #5a47ce, #232323 80%)" 
                  : "white",
                color: activeDivision === text ? "white" : "black",
                transform: activeDivision === text ? "scale(1.05)" : "scale(1)",
                filter: activeDivision === text ? "drop-shadow(0 0 15px rgba(90,71,206,0.7))" : "none"
              }}
              onMouseEnter={e => {
                if (activeDivision !== text) {
                  e.currentTarget.style.background = "radial-gradient(circle at center, #5a47ce, #232323 80%)";
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.filter = "drop-shadow(0 0 15px rgba(90,71,206,0.7))";
                }
              }}
              onMouseLeave={e => {
                if (activeDivision !== text) {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.color = "black";
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.filter = "none";
                } else {
                  // Tombol aktif tetap gradient
                  e.currentTarget.style.background = "radial-gradient(circle at center, #5a47ce, #232323 80%)";
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.filter = "drop-shadow(0 0 15px rgba(90,71,206,0.7))";
                }
              }}
            >
              {text}
            </button>
          ))}
        </form>
      </div>

      <div
        className="flex flex-col items-center gap-24 p-16 w-full rounded-3xl relative pb-56 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, #5a47ce 0%, #232323 100%),
            url('/bg_card.png')
          `,
          backgroundBlendMode: 'overlay'
        }}
      >
        <div 
          className="flex flex-wrap justify-center items-center gap-20 w-full"
        >
          {leaders.map((leader, index) => (
            <div
              key={leader._id || index}
              className="flex flex-col items-center bg-white/30 backdrop-blur-lg rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] hover:shadow-[0_15px_50px_rgba(90,71,206,0.7)] hover:scale-105 transition-all duration-500 border border-white/40 w-80 h-[27rem] overflow-hidden"
            >
              <div className="relative mt-4">

                <div className="absolute -inset-2 bg-gradient-to-tr from-purple-400 via-indigo-400 to-transparent opacity-30 blur-2xl rounded-full" />
                <img
                  src={`http://localhost:5000${leader.image}`}
                  alt={leader.name}
                  className="relative w-48 h-48 rounded-full object-cover border-4 border-white shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
                />
              </div>
              <h1 className="text-xl font-semibold text-white mt-8 tracking-wide drop-shadow-md text-center">
                {leader.name}
              </h1>
              <p
                className="
                  text-base text-white mt-3 italic text-center
                  bg-white/20 backdrop-blur-md 
                  border border-white/30 
                  px-4 py-1 
                  rounded-full 
                  shadow-[0_4px_15px_rgba(0,0,0,0.3)]
                "
              >
                {leader.position}
              </p>
            </div>
          ))}
        </div>

        <div 
          className="flex flex-wrap justify-center items-center gap-20 w-full"
        >
          {members.map((member, index) => (
            <div
              key={member._id || index}
              className="flex flex-col items-center bg-white/20 backdrop-blur-lg rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_10px_40px_rgba(90,71,206,0.6)] hover:scale-105 transition-all duration-500 border border-white/30 w-72 h-[25rem] overflow-hidden"
            >
              <div className="relative mt-6">
                <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-400 via-purple-400 to-transparent opacity-25 blur-2xl rounded-full" />
                <img
                  src={`http://localhost:5000${member.image}`}
                  alt={member.name}
                  className="relative w-40 h-40 rounded-full object-cover border-4 border-white shadow-[0_6px_18px_rgba(0,0,0,0.4)]"
                />
              </div>
              <h1 className="text-lg font-semibold text-white mt-8 text-center">{member.name}</h1>
              <p className="
                text-base text-white mt-3 italic text-center
                bg-white/20 backdrop-blur-md 
                border border-white/30 
                px-4 py-1 
                rounded-full 
                shadow-[0_4px_15px_rgba(0,0,0,0.3)]
              ">{member.position}</p>
            </div>
          ))}
        </div>

     
        <footer 
          className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center gap-6 py-8 bg-white backdrop-blur-lg rounded-t-3xl border-t border-white"
        >
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
        </footer>
      </div>
    </div>
  )
}

export default Team;