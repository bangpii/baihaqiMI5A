import React, { useState } from 'react'

const Header = ({ userData, onLogout, onSearch }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown)
  }

  const handleEditPhoto = () => {
    // Trigger file input untuk memilih foto
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        console.log('File selected:', file.name)
        uploadUserPhoto(file)
      }
    }
    fileInput.click()
  }

  const uploadUserPhoto = async (file) => {
    if (!userData) return
    
    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      // Tentukan endpoint berdasarkan jenis user
      let endpoint = ''
      let updateEndpoint = ''
      
      if (userData.position && (
          userData.position.includes('Ketua') || 
          userData.position.includes('Wakil') || 
          userData.position.includes('Sekertaris') || 
          userData.position.includes('Bendahara') || 
          userData.position.includes('Kontrol')
      )) {
        endpoint = '/api/bph/upload'
        updateEndpoint = `/api/bph/${userData.id}`
      } else if (userData.position && (
          userData.position.includes('Kepala Devisi') || 
          userData.position.includes('Manager')
      )) {
        endpoint = '/api/devisi/upload'
        updateEndpoint = `/api/devisi/${userData.id}`
      } else {
        endpoint = '/api/team/upload'
        updateEndpoint = `/api/team/${userData.id}`
      }

      console.log('Uploading to:', endpoint)
      console.log('Update endpoint:', updateEndpoint)

      // 1. Upload gambar baru
      const uploadResponse = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        throw new Error(`Upload failed: ${errorText}`)
      }

      const uploadData = await uploadResponse.json()
      console.log('Upload success:', uploadData)

      // 2. Update user data dengan gambar baru
      const updateResponse = await fetch(`http://localhost:5000${updateEndpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: uploadData.imageUrl
          // Hanya update image field, biarkan field lain tetap
        })
      })

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text()
        throw new Error(`Update failed: ${errorText}`)
      }

      const updatedUser = await updateResponse.json()
      console.log('User updated:', updatedUser)
      
      // Update localStorage dengan data terbaru
      localStorage.setItem('adminUserData', JSON.stringify(updatedUser))
      
      // Refresh page untuk mendapatkan data terbaru
      setTimeout(() => {
        window.location.reload()
      }, 1000)

    } catch (error) {
      console.error('Error uploading photo:', error)
      alert(`Gagal mengupload foto: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleLogout = () => {
    setShowProfileDropdown(false)
    onLogout()
  }

  // Function untuk mendapatkan URL gambar user
  const getUserImage = () => {
    if (userData && userData.image) {
      // Jika gambar sudah full URL, gunakan langsung
      if (userData.image.startsWith('http')) {
        return userData.image
      }
      // Jika gambar adalah path relative, tambahkan base URL
      return `http://localhost:5000${userData.image}`
    }
    // Default icon jika tidak ada gambar
    return null
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    // Panggil fungsi search dari parent component
    if (onSearch) {
      onSearch(value)
    }
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('')
    if (onSearch) {
      onSearch('')
    }
  }

  return (
    <div className="w-full bg-gradient-to-r from-purple-700 to-blue-800 rounded-2xl shadow-xl mb-6">
      <div className="flex items-center justify-between px-4 lg:px-8 py-3 lg:py-4">
        
        <div className="flex items-center space-x-3 lg:space-x-4">

          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center border border-white border-opacity-30">
            <img 
              src="/icon.png" 
              alt="Logo HMPS MI" 
              className="w-6 h-6 lg:w-8 lg:h-8 object-contain"
            />
          </div>
          
          {/* Teks */}
          <div>
            <h1 className="text-base lg:text-lg font-bold text-white tracking-wide font-poppins">
              Dashboard HMPS MI
            </h1>
            <p className="text-white text-opacity-80 font-poppins text-xs lg:text-sm">
              Selamat datang, {userData ? userData.name : 'Admin'}
            </p>
          </div>
        </div>

        {/* Bagian Kanan - Pencarian dan Profile */}
        <div className="flex items-center space-x-4 lg:space-x-6">
          {/* Form Pencarian */}
          <div className="hidden sm:block relative">
            <input
              type="text"
              placeholder="Cari data..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-48 lg:w-64 px-4 py-2 pl-10 pr-8 rounded-xl border-0 focus:ring-2 focus:ring-white focus:ring-opacity-50 bg-white bg-opacity-15 backdrop-blur-sm text-white placeholder-white placeholder-opacity-70 font-poppins transition-all duration-300 hover:bg-opacity-20 text-sm"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <i className="bx bx-search text-white text-base"></i>
            </div>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200 transition-colors duration-200"
              >
                <i className="bx bx-x text-base"></i>
              </button>
            )}
          </div>

          {/* Profile User */}
          <div className="flex items-center space-x-3 relative">
            <div className="hidden sm:block h-6 w-px bg-white bg-opacity-30"></div>
            <div 
              onClick={toggleProfileDropdown}
              className="flex items-center space-x-2 lg:space-x-3 bg-white bg-opacity-10 rounded-xl lg:rounded-2xl px-2 lg:px-3 py-1.5 lg:py-2 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300 cursor-pointer"
            >
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center border border-white border-opacity-30 overflow-hidden">
                {getUserImage() ? (
                  <img 
                    src={getUserImage()} 
                    alt={userData ? userData.name : 'User'} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Jika gambar gagal load, tampilkan icon default
                      e.target.style.display = 'none'
                      const icon = e.target.parentNode.querySelector('.default-icon')
                      if (icon) icon.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div className={`default-icon w-full h-full flex items-center justify-center ${getUserImage() ? 'hidden' : 'flex'}`}>
                  <i className="bx bx-user text-white text-sm lg:text-base"></i>
                </div>
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <div className="hidden lg:block">
                <p className="text-white font-semibold font-poppins text-xs">
                  {userData ? userData.name : 'Admin'}
                </p>
                <p className="text-white text-opacity-80 font-poppins text-xs">
                  {userData ? userData.position : 'Super User'}
                </p>
              </div>
              <i className="bx bx-chevron-down text-white text-base hidden lg:block"></i>
            </div>

            {/* Profile Dropdown */}
            {showProfileDropdown && userData && (
              <>
                {/* Overlay Blur */}
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
                  onClick={() => setShowProfileDropdown(false)}
                />
                
                {/* Dropdown Content */}
                <div className="absolute top-full right-0 mt-2 w-72 lg:w-80 bg-white rounded-2xl shadow-xl z-50 border border-gray-200 overflow-hidden">
                  {/* Header Dropdown */}
                  <div className="bg-gradient-to-r from-purple-700 to-blue-800 p-4 lg:p-6 relative">
                    <div className="flex items-center space-x-3 lg:space-x-4">
                      <div className="relative">
                        <div 
                          className="w-12 h-12 lg:w-16 lg:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center border border-white border-opacity-30 cursor-pointer overflow-hidden"
                          onClick={handleEditPhoto}
                        >
                          {getUserImage() ? (
                            <img 
                              src={getUserImage()} 
                              alt={userData.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Jika gambar gagal load, tampilkan icon default
                                e.target.style.display = 'none'
                                const icon = e.target.parentNode.querySelector('.default-icon-large')
                                if (icon) icon.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <div className={`default-icon-large w-full h-full flex items-center justify-center ${getUserImage() ? 'hidden' : 'flex'}`}>
                            <i className="bx bx-user text-white text-xl lg:text-2xl"></i>
                          </div>
                          {isUploading && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            </div>
                          )}
                        </div>
                        {/* Edit Photo Button */}
                        <button 
                          className="absolute -bottom-1 -right-1 w-5 h-5 lg:w-6 lg:h-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                          onClick={handleEditPhoto}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-white"></div>
                          ) : (
                            <i className="bx bx-pencil text-white text-xs"></i>
                          )}
                        </button>
                      </div>
                      <div>
                        <h3 className="text-white font-bold font-poppins text-sm lg:text-lg">
                          {userData.name}
                        </h3>
                        <p className="text-white text-opacity-80 font-poppins text-xs lg:text-sm">
                          {userData.position}
                        </p>
                        {isUploading && (
                          <p className="text-white text-opacity-60 font-poppins text-xs mt-1">
                            Uploading...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Profile Details - Hidden di mobile */}
                  <div className="hidden lg:block p-4 lg:p-6 space-y-3 lg:space-y-4">
                    <div className="grid grid-cols-1 gap-3 lg:gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 font-poppins mb-1">
                          Nama Lengkap
                        </label>
                        <p className="text-sm text-gray-800 font-poppins">{userData.name}</p>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 font-poppins mb-1">
                          Nomor Induk
                        </label>
                        <p className="text-sm text-gray-800 font-poppins">{userData.nomorInduk}</p>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 font-poppins mb-1">
                          Kelas
                        </label>
                        <p className="text-sm text-gray-800 font-poppins">{userData.kelas}</p>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 font-poppins mb-1">
                          Jabatan
                        </label>
                        <p className="text-sm text-gray-800 font-poppins">{userData.position}</p>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 font-poppins mb-1">
                          Prodi
                        </label>
                        <p className="text-sm text-gray-800 font-poppins">{userData.prodi}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Footer */}
                  <div className="border-t border-gray-200 p-3 lg:p-4 bg-gray-50">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white font-poppins font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
                      disabled={isUploading}
                    >
                      <i className="bx bx-log-out text-sm"></i>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header