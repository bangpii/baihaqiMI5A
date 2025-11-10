import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSocket, initializeSocket } from '../api/apiAdmin'

const BPH = () => {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [dataTable, setDataTable] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    nomorInduk: '',
    kelas: '',
    jk: '',
    position: '',
    prodi: '',
    image: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [socket, setSocket] = useState(null)

  // Fetch data dari backend saat component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log('🔄 Fetching BPH data from API...')
        const response = await fetch('http://localhost:5000/api/bph')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log('✅ BPH data received:', data)
        setDataTable(data)
      } catch (error) {
        console.error('❌ Error fetching BPH data:', error)
        alert('Gagal memuat data BPH: ' + error.message)
      } finally {
        setLoading(false)
      }
    }

    // Initialize Socket.io
    console.log('🔌 Initializing Socket.io...')
    const socketInstance = initializeSocket()
    setSocket(socketInstance)

    fetchData()

    // Cleanup socket on unmount
    return () => {
      if (socketInstance) {
        console.log('🔌 Disconnecting Socket.io...')
        socketInstance.disconnect()
      }
    }
  }, [])

 // Setup Socket.io listener untuk realtime updates
useEffect(() => {
  if (!socket) {
      console.log('⚠️ Socket not initialized yet')
      return
  }

  console.log('👂 Setting up Socket.io listeners...')

  const handleBphUpdate = (data) => {
      console.log('🔄 Realtime update received:', data)
      setDataTable(data)
  }

  const handleConnect = () => {
      console.log('🔌 Socket.io connected')
      // Join room untuk BPH updates
      socket.emit('join_bph_room')
  }

  // Event listeners
  socket.on('connect', handleConnect)
  socket.on('bph_updated', handleBphUpdate)

  // Jika sudah connected, langsung join room
  if (socket.connected) {
      socket.emit('join_bph_room')
  }

  return () => {
      console.log('🧹 Cleaning up Socket.io listeners...')
      socket.off('connect', handleConnect)
      socket.off('bph_updated', handleBphUpdate)
  }
}, [socket])

  const handleHomeClick = () => {
    navigate('/admin/dashboard')
  }

  const handleTambahData = () => {
    console.log('➕ Opening modal for new data')
    setIsEdit(false)
    setFormData({
      name: '',
      nomorInduk: '',
      kelas: '',
      jk: '',
      position: '',
      prodi: '',
      image: ''
    })
    setSelectedImage(null)
    setImagePreview(null)
    setEditingId(null)
    setShowModal(true)
  }

  const handleEditData = (member) => {
    console.log('✏️ Opening modal for edit:', member)
    setIsEdit(true)
    setFormData({
      name: member.name,
      nomorInduk: member.nomorInduk,
      kelas: member.kelas,
      jk: member.jk,
      position: member.position,
      prodi: member.prodi,
      image: member.image || ''
    })
    setEditingId(member.id)
    setSelectedImage(null)
    setImagePreview(member.image ? `http://localhost:5000${member.image}` : null)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    console.log('❌ Closing modal')
    setShowModal(false)
    setFormData({
      name: '',
      nomorInduk: '',
      kelas: '',
      jk: '',
      position: '',
      prodi: '',
      image: ''
    })
    setSelectedImage(null)
    setImagePreview(null)
    setEditingId(null)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      console.log('🖼️ Image selected:', file.name)
      setSelectedImage(file)
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  const handleRemoveImage = () => {
    console.log('🗑️ Removing image')
    setSelectedImage(null)
    setImagePreview(null)
    const fileInput = document.getElementById('imageUpload')
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log('🚀 Submitting form:', { isEdit, editingId, formData, selectedImage })
    
    try {
      const submitData = new FormData()
      
      // Append form data
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key])
          console.log(`📦 Form data - ${key}:`, formData[key])
        }
      })

      // Append image if selected
      if (selectedImage) {
        submitData.append('image', selectedImage)
        console.log('📸 Image appended:', selectedImage.name)
      }

      let url, method
      if (isEdit) {
        // Update existing data
        url = `http://localhost:5000/api/bph/${editingId}`
        method = 'PUT'
        console.log('🔄 Updating data at:', url)
      } else {
        // Create new data
        url = 'http://localhost:5000/api/bph'
        method = 'POST'
        console.log('🆕 Creating data at:', url)
      }

      const response = await fetch(url, {
        method: method,
        body: submitData
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Server error response:', errorText)
        throw new Error(errorText || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Success response:', result)
      
      // Socket.io akan otomatis update data via realtime
      handleCloseModal()
      alert(`✅ Data berhasil ${isEdit ? 'diupdate' : 'ditambahkan'}`)

    } catch (error) {
      console.error(`❌ Error ${isEdit ? 'updating' : 'creating'} data:`, error)
      alert(`❌ Gagal ${isEdit ? 'mengupdate' : 'menambahkan'} data: ${error.message}`)
    }
  }

  const handleDeleteData = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      return
    }

    console.log('🗑️ Deleting data with id:', id)

    try {
      const response = await fetch(`http://localhost:5000/api/bph/${id}`, {
        method: 'DELETE'
      })

      console.log('📡 Delete response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Delete error response:', errorText)
        throw new Error(errorText || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Delete success:', result)
      
      // Socket.io akan otomatis update data via realtime
      alert('✅ Data berhasil dihapus')

    } catch (error) {
      console.error('❌ Error deleting data:', error)
      alert(`❌ Gagal menghapus data: ${error.message}`)
    }
  }

  // Function untuk mendapatkan URL gambar
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/profile/cowo.png'
    if (imagePath.startsWith('http')) return imagePath
    return `http://localhost:5000${imagePath}`
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Loading Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
          
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="space-y-3">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="flex space-x-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 font-poppins">
          <span 
            onClick={handleHomeClick}
            className="hover:text-blue-600 cursor-pointer transition-colors duration-200"
          >
            Home
          </span>
          <i className="bx bx-chevron-right text-xs"></i>
          <span className="text-blue-600 font-semibold">BPH</span>
        </div>
        
        {/* Header dengan Tombol Tambah Data - Desktop */}
        <div className="hidden lg:flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 font-poppins">Data BPH</h2>
            <p className="text-gray-600 font-poppins mt-1">Kelola data Badan Pengurus Harian organisasi</p>
          </div>
          <button 
            onClick={handleTambahData}
            className="bg-gradient-to-r from-purple-700 to-blue-800 text-white font-semibold font-poppins py-3 px-6 rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <i className="bx bx-plus text-xl"></i>
            <span>Tambah Data</span>
          </button>
        </div>

        {/* Header tanpa Tombol - Mobile */}
        <div className="lg:hidden">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 font-poppins">Data BPH</h2>
            <p className="text-gray-600 font-poppins mt-1">Kelola data Badan Pengurus Harian organisasi</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="overflow-x-auto">
          <div className="max-h-[500px] overflow-y-auto scrollbar-hide">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins border-b sticky top-0 bg-gray-50 z-10">
                    Nama Lengkap
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins border-b sticky top-0 bg-gray-50 z-10">
                    Nomor Induk
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins border-b sticky top-0 bg-gray-50 z-10">
                    Kelas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins border-b sticky top-0 bg-gray-50 z-10">
                    JK
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins border-b sticky top-0 bg-gray-50 z-10">
                    Jabatan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins border-b sticky top-0 bg-gray-50 z-10">
                    Prodi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins border-b sticky top-0 bg-gray-50 z-10">
                    Gambar
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins border-b sticky top-0 bg-gray-50 z-10">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dataTable.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-4 py-3 text-sm text-gray-800 font-poppins">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-poppins">{item.nomorInduk}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-poppins">{item.kelas}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-poppins">{item.jk}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-poppins">{item.position}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-poppins">{item.prodi}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-poppins">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        <img 
                          src={getImageUrl(item.image)} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/profile/cowo.png'
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditData(item)}
                          className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors duration-200"
                        >
                          <i className="bx bx-edit text-sm"></i>
                        </button>
                        <button 
                          onClick={() => handleDeleteData(item.id)}
                          className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors duration-200"
                        >
                          <i className="bx bx-trash text-sm"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {dataTable.length === 0 && (
              <div className="text-center py-8 text-gray-500 font-poppins">
                Tidak ada data BPH
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tombol Tambah Data - Mobile Only */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button 
          onClick={handleTambahData}
          className="bg-gradient-to-r from-purple-700 to-blue-800 text-white font-semibold font-poppins py-4 px-6 rounded-full flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <i className="bx bx-plus text-2xl"></i>
        </button>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 font-poppins">
                {isEdit ? 'Edit Data BPH' : 'Tambah Data BPH'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
              >
                <i className="bx bx-x text-lg"></i>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Upload Foto Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                  Foto Profil
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <i className="bx bx-user text-2xl text-gray-400"></i>
                    )}
                  </div>
                  <div className="flex-1">
                    <input 
                      id="imageUpload"
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label 
                      htmlFor="imageUpload"
                      className="bg-blue-600 text-white font-poppins text-sm font-medium py-2 px-4 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors duration-200 inline-flex items-center space-x-2"
                    >
                      <i className="bx bx-cloud-upload text-lg"></i>
                      <span>Pilih Foto</span>
                    </label>
                    {imagePreview && (
                      <button 
                        type="button"
                        onClick={handleRemoveImage}
                        className="ml-2 bg-red-600 text-white font-poppins text-sm font-medium py-2 px-4 rounded-lg cursor-pointer hover:bg-red-700 transition-colors duration-200 inline-flex items-center space-x-2"
                      >
                        <i className="bx bx-trash text-lg"></i>
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                    Nama Lengkap
                  </label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-poppins"
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>

                {/* Nomor Induk */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                    Nomor Induk
                  </label>
                  <input 
                    type="text" 
                    name="nomorInduk"
                    value={formData.nomorInduk}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-poppins"
                    placeholder="Masukkan nomor induk"
                    required
                  />
                </div>

                {/* Kelas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                    Kelas
                  </label>
                  <input 
                    type="text" 
                    name="kelas"
                    value={formData.kelas}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-poppins"
                    placeholder="Masukkan kelas"
                    required
                  />
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                    Jenis Kelamin
                  </label>
                  <select 
                    name="jk"
                    value={formData.jk}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-poppins"
                    required
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                {/* Jabatan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                    Jabatan
                  </label>
                  <input 
                    type="text" 
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-poppins"
                    placeholder="Masukkan jabatan"
                    required
                  />
                </div>

                {/* Prodi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                    Prodi
                  </label>
                  <input 
                    type="text" 
                    name="prodi"
                    value={formData.prodi}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-poppins"
                    placeholder="Masukkan program studi"
                    required
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 font-poppins font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-poppins font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  {isEdit ? 'Update Data' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BPH