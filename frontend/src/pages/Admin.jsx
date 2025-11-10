import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "../admin/Header";
import NavigasiKiri from "../admin/NavigasiKiri";
import Dashboard from "../admin/Dashboard";
import BPH from "../admin/BPH";
import Devisi from "../admin/Devisi";
import Team from "../admin/Team";
import Anggota from "../admin/Anggota";
import VisiMisi from "../admin/VisiMisi";
import Gallery from "../admin/Gallery";
import Article from "../admin/Article";
import News from "../admin/News";
import { getBphData, getDevisiData, getTeamData, initializeSocket } from '../api/apiAdmin';

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLogin, setShowLogin] = useState(true)
  const [userData, setUserData] = useState(null)
  const [loginError, setLoginError] = useState('')
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [searchTerm, setSearchTerm] = useState('') 

  const allowedNIMs = [
    // BPH NIM
    "2305102132", "2305102002", "2305102054", "2405102025", 
    "2305102096", "2405102125", "2305102108", "2305102042",
    
    // Devisi NIM
    "2405102038", "2305102134", "2305102004", "2405102149",
    "2405102007", "2405102073",
    
    // Ketua Tim NIM
    "2305102047", "2305102066", "2405102134", "2405102055",
    "2305102005", "2305102105", "2405102001", "2405102087",
    "2405102004", "2305102124", "2305102016"
  ];

  useEffect(() => {
    const checkStoredSession = () => {
      try {
        const storedUserData = localStorage.getItem('adminUserData')
        const storedLoginStatus = localStorage.getItem('adminIsLoggedIn')
        
        if (storedUserData && storedLoginStatus === 'true') {
          const userData = JSON.parse(storedUserData)
          setUserData(userData)
          setIsLoggedIn(true)
          setShowLogin(false)
          initializeSocket()
        }
      } catch (error) {
        console.error('Error restoring session:', error)
        localStorage.removeItem('adminUserData')
        localStorage.removeItem('adminIsLoggedIn')
      }
    }

    checkStoredSession()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (loginError) {
      setLoginError('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const form = e.target.form
      const index = Array.prototype.indexOf.call(form, e.target)
      form.elements[index + 1].focus()
    }
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    setLoginError('')

    const { username, password } = formData

    console.log('Login attempt:', { username, password })

    if (!username.trim() || !password.trim()) {
      setLoginError('NIM dan password harus diisi!')
      return
    }

    const isNIMAllowed = allowedNIMs.includes(username)
    
    const isPasswordCorrect = username === password

    if (isNIMAllowed && isPasswordCorrect) {
      findUserData(username)
    } else if (!isNIMAllowed) {
      setLoginError('Access denied. Unauthorized NIM')
    } else {
      setLoginError('Password denied')
    }
  }

  const findUserData = async (nim) => {
    try {
      const [bphData, devisiData, teamData] = await Promise.all([
        getBphData(),
        getDevisiData(),
        getTeamData()
      ]);

      const allUsers = [...bphData, ...devisiData, ...teamData]
      const foundUser = allUsers.find(user => user.nomorInduk === nim)

      if (foundUser) {
        setUserData(foundUser)
        setIsLoggedIn(true)
        setShowLogin(false)
        setLoginError('')
        
        localStorage.setItem('adminUserData', JSON.stringify(foundUser))
        localStorage.setItem('adminIsLoggedIn', 'true')
        
        initializeSocket()
        console.log('✅ Login berhasil! User:', foundUser.name, '-', foundUser.position)
      } else {
        setLoginError('User data not found in system')
      }
    } catch (error) {
      console.error('Error finding user data:', error)
      setLoginError('Error loading user data')
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setShowLogin(true)
    setUserData(null)
    setLoginError('')
    setFormData({ username: '', password: '' })
    setSearchTerm('') 
    
    localStorage.removeItem('adminUserData')
    localStorage.removeItem('adminIsLoggedIn')
  }

  const canSubmit = formData.username.trim() && formData.password.trim()

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #6b21a8 0%, #1e3a8a 100%)", 
        minHeight: "100vh",        
        width: "100%",
        padding: "2rem",           
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"></div>
      )}
      <div
        style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "16px",
          boxShadow: `
            0 10px 25px -5px rgba(0, 0, 0, 0.3),
            0 8px 10px -6px rgba(0, 0, 0, 0.2),
            inset 0 -2px 4px rgba(255, 255, 255, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.1)
          `,
          minHeight: "93vh",
          transform: "perspective(1000px) rotateX(1deg)",
          transformStyle: "preserve-3d",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          position: "relative",
          overflow: "hidden",
          filter: showLogin ? "blur(5px)" : "none",
          transition: "filter 0.3s ease"
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)",
            borderRadius: "16px 16px 0 0"
          }}
        />
        <div className="flex flex-col h-full" style={{ position: "relative", zIndex: 1, minHeight: "calc(93vh - 3rem)" }}>
          <Header 
            userData={userData} 
            onLogout={handleLogout}
            onSearch={handleSearch} 
          />
          <div className="flex flex-1 gap-6">
            <div className="flex-shrink-0">
              <NavigasiKiri/>
            </div>

            <div className="hidden lg:block flex-1 bg-white rounded-2xl overflow-auto">
              <Routes>
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard searchTerm={searchTerm} />} />
                <Route path="/bph" element={<BPH />} />
                <Route path="/devisi" element={<Devisi />} />
                <Route path="/team" element={<Team />} />
                <Route path="/anggota" element={<Anggota />} />
                <Route path="/visimisi" element={<VisiMisi />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/article" element={<Article />} />
                <Route path="/news" element={<News />} />
              </Routes>
            </div>

            <div className="lg:hidden fixed inset-0 bg-white rounded-2xl overflow-auto z-30 ml-0 transition-all duration-300" 
                 style={{ 
                   top: '8rem', 
                   left: '2rem', 
                   right: '2rem', 
                   bottom: '2rem',
                   transform: 'perspective(1000px) rotateX(1deg)'
                 }}>
              <div className="h-full overflow-auto">
                <Routes>
                  <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard searchTerm={searchTerm} />} />
                  <Route path="/bph" element={<BPH />} />
                  <Route path="/devisi" element={<Devisi />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/anggota" element={<Anggota />} />
                  <Route path="/visimisi" element={<VisiMisi />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/article" element={<Article />} />
                  <Route path="/news" element={<News />} />
                </Routes>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "-10px",
            left: "5%",
            right: "5%",
            height: "20px",
            background: "rgba(0, 0, 0, 0.1)",
            borderRadius: "50%",
            filter: "blur(10px)",
            transform: "translateZ(-10px)"
          }}
        />
      </div>

      {showLogin && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div
            className="w-full max-w-md"
            style={{
              transform: "perspective(1000px) rotateX(2deg)",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 relative overflow-hidden"
              style={{
                boxShadow: `
                  0 20px 40px -10px rgba(0, 0, 0, 0.3),
                  0 15px 25px -5px rgba(0, 0, 0, 0.2),
                  inset 0 -4px 8px rgba(255, 255, 255, 0.5),
                  0 0 0 1px rgba(255, 255, 255, 0.1)
                `,
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
              />

              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg border border-white border-opacity-30">
                  <img 
                    src="/icon.png" 
                    alt="Logo HMPS MI" 
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 font-poppins mb-2">
                  HMPS MI Login
                </h1>
                <p className="text-gray-600 font-poppins text-sm">
                  Masuk ke Dashboard Admin
                </p>
              </div>

              {loginError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm font-poppins">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6" noValidate>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                    NIM
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-poppins transition-all duration-200 bg-white shadow-sm"
                      placeholder="Masukkan Username"
                      autoComplete="username"
                      autoFocus
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <i className="bx bx-user text-gray-400 text-lg"></i>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && canSubmit) {
                          handleLogin(e)
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-poppins transition-all duration-200 bg-white shadow-sm"
                      placeholder="Masukkan Password"
                      autoComplete="current-password"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <i className="bx bx-lock-alt text-gray-400 text-lg"></i>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-poppins font-semibold py-3 px-4 rounded-xl shadow-lg transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    canSubmit 
                      ? 'hover:shadow-xl hover:-translate-y-0.5 cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  disabled={!canSubmit}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <i className="bx bx-log-in text-lg"></i>
                    <span>{canSubmit ? 'Masuk' : 'Isi form terlebih dahulu'}</span>
                  </span>
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-500 font-poppins text-xs">
                  &copy; 2025 HMPS MI - Management Informatika
                </p>
              </div>
            </div>

            <div
              className="mx-auto mt-4"
              style={{
                width: '90%',
                height: '20px',
                background: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '50%',
                filter: 'blur(10px)',
                transform: 'translateZ(-10px)'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;