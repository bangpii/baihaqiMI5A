import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSocket, initializeSocket } from '../api/apiAdmin'

const VisiMisi = () => {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [activeTable, setActiveTable] = useState('visiMisi')
  const [dataVisiMisi, setDataVisiMisi] = useState([])
  const [dataMenuDevisi, setDataMenuDevisi] = useState([])
  const [dataVisiDevisi, setDataVisiDevisi] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    desk: '',
    visi: '',
    strategi: '',
    item: '',
    gambar: '',
    type: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [socket, setSocket] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  // Fetch data dari backend saat component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log('🔄 Fetching VisiMisi data from API...')
        const response = await fetch('http://localhost:5000/api/visimisi')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const allData = await response.json()
        console.log('✅ VisiMisi data received:', allData)
        
        // Filter data berdasarkan type untuk masing-masing tab
        const visiMisiData = allData.filter(item => 
          item.type === 'visi' || item.type === 'misi' || item.type === 'strategi_misi'
        )
        const menuDevisiData = allData.filter(item => item.type === 'gambar')
        const visiDevisiData = allData.filter(item => item.type === 'content')
        
        setDataVisiMisi(visiMisiData)
        setDataMenuDevisi(menuDevisiData)
        setDataVisiDevisi(visiDevisiData)
      } catch (error) {
        console.error('❌ Error fetching VisiMisi data:', error)
        alert('Gagal memuat data Visi & Misi: ' + error.message)
      } finally {
        setLoading(false)
      }
    }

    // Initialize Socket.io
    console.log('🔌 Initializing Socket.io for VisiMisi...')
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

    console.log('👂 Setting up Socket.io listeners for VisiMisi...')

    const handleVisiMisiUpdate = (data) => {
      console.log('🔄 Realtime VisiMisi update received:', data)
      
      // Filter data berdasarkan type untuk masing-masing tab
      const visiMisiData = data.filter(item => 
        item.type === 'visi' || item.type === 'misi' || item.type === 'strategi_misi'
      )
      const menuDevisiData = data.filter(item => item.type === 'gambar')
      const visiDevisiData = data.filter(item => item.type === 'content')
      
      setDataVisiMisi(visiMisiData)
      setDataMenuDevisi(menuDevisiData)
      setDataVisiDevisi(visiDevisiData)
    }

    const handleConnect = () => {
      console.log('🔌 Socket.io connected for VisiMisi')
      socket.emit('join_visimisi_room')
    }

    // Event listeners
    socket.on('connect', handleConnect)
    socket.on('visimisi_updated', handleVisiMisiUpdate)

    // Jika sudah connected, langsung join room
    if (socket.connected) {
      socket.emit('join_visimisi_room')
    }

    return () => {
      console.log('🧹 Cleaning up Socket.io listeners...')
      socket.off('connect', handleConnect)
      socket.off('visimisi_updated', handleVisiMisiUpdate)
    }
  }, [socket])

  const handleHomeClick = () => {
    navigate('/admin/dashboard')
  }

  const handleTambahData = () => {
    console.log('➕ Opening modal for new VisiMisi data')
    setIsEdit(false)
    setFormData({
      title: '',
      desk: '',
      visi: '',
      strategi: '',
      item: '',
      gambar: '',
      type: getDefaultTypeForActiveTable()
    })
    setSelectedImage(null)
    setImagePreview(null)
    setEditingId(null)
    setShowModal(true)
  }

  const getDefaultTypeForActiveTable = () => {
    switch(activeTable) {
      case 'visiMisi': return 'visi'
      case 'menuDevisi': return 'gambar'
      case 'visiDevisi': return 'content'
      default: return 'visi'
    }
  }

  const handleEditData = (item) => {
    console.log('✏️ Opening modal for edit:', item)
    setIsEdit(true)
    
    let formDataToSet = {
      title: item.data?.title || '',
      desk: item.data?.desk || '',
      visi: item.data?.visi || '',
      strategi: '',
      item: item.data?.item || '',
      gambar: item.data?.gambar || '',
      type: item.type
    }

    // PERBAIKAN: Handle data untuk strategi_misi
    if (item.type === 'strategi_misi') {
      // Untuk strategi_misi, gunakan title dari data
      formDataToSet.title = item.data?.title || ''
      // Gabungkan items menjadi string dengan newline
      if (Array.isArray(item.data?.items)) {
        formDataToSet.desk = item.data.items.join('\n')
      }
    }
    
    // PERBAIKAN: Handle data untuk content (visi devisi)
    if (item.type === 'content') {
      formDataToSet.title = item.data?.title || ''
      formDataToSet.visi = item.data?.visi || ''
      // Gabungkan strategi menjadi string dengan newline
      if (Array.isArray(item.data?.strategi)) {
        formDataToSet.strategi = item.data.strategi.join('\n')
      }
    }

    setFormData(formDataToSet)
    setEditingId(item.id)
    setSelectedImage(null)
    
    // Set image preview jika ada gambar
    if (item.data?.gambar || item.data?.item) {
      const imageUrl = item.data.gambar || item.data.item
      setImagePreview(imageUrl ? `http://localhost:5000${imageUrl}` : null)
    } else {
      setImagePreview(null)
    }
    
    setShowModal(true)
  }

  const handleCloseModal = () => {
    console.log('❌ Closing VisiMisi modal')
    setShowModal(false)
    setFormData({
      title: '',
      desk: '',
      visi: '',
      strategi: '',
      item: '',
      gambar: '',
      type: ''
    })
    setSelectedImage(null)
    setImagePreview(null)
    setEditingId(null)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      console.log('🖼️ Image selected for VisiMisi:', file.name)
      setSelectedImage(file)
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  const handleRemoveImage = () => {
    console.log('🗑️ Removing VisiMisi image')
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
    
    console.log('🚀 Submitting VisiMisi form:', { isEdit, editingId, formData, selectedImage, activeTable })
    
    try {
      const submitData = new FormData()
      
      // Tentukan type berdasarkan active table
      let type = formData.type
      if (!type) {
        type = getDefaultTypeForActiveTable()
      }
      
      // Siapkan data object berdasarkan type
      let dataObject = {}
      
      switch(type) {
        case 'visi':
        case 'misi':
          dataObject = { desk: formData.desk }
          break
        case 'strategi_misi':
          dataObject = { 
            title: formData.title,
            items: formData.desk.split('\n').filter(item => item.trim() !== '')
          }
          break
        case 'gambar':
          dataObject = { 
            title: formData.title,
            item: formData.item
          }
          break
        case 'content':
          dataObject = {
            title: formData.title,
            visi: formData.visi,
            strategi: formData.strategi.split('\n').filter(item => item.trim() !== ''),
            gambar: formData.gambar
          }
          break
      }

      console.log('📝 Data object to send:', dataObject)

      // Append data utama
      submitData.append('type', type)
      submitData.append('data', JSON.stringify(dataObject))

      // Append image jika selected
      if (selectedImage) {
        submitData.append('image', selectedImage)
        console.log('📸 VisiMisi image appended:', selectedImage.name)
      }

      let url, method
      if (isEdit) {
        // Update existing data
        url = `http://localhost:5000/api/visimisi/${editingId}`
        method = 'PUT'
        console.log('🔄 Updating VisiMisi data at:', url)
      } else {
        // Create new data
        url = 'http://localhost:5000/api/visimisi'
        method = 'POST'
        console.log('🆕 Creating VisiMisi data at:', url)
      }

      const response = await fetch(url, {
        method: method,
        body: submitData
      })

      console.log('📡 VisiMisi response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ VisiMisi server error response:', errorText)
        throw new Error(errorText || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ VisiMisi success response:', result)
      
      // Socket.io akan otomatis update data via realtime
      handleCloseModal()
      alert(`✅ Data berhasil ${isEdit ? 'diupdate' : 'ditambahkan'}`)

    } catch (error) {
      console.error(`❌ Error ${isEdit ? 'updating' : 'creating'} VisiMisi data:`, error)
      alert(`❌ Gagal ${isEdit ? 'mengupdate' : 'menambahkan'} data: ${error.message}`)
    }
  }

  const handleDeleteData = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      return
    }

    console.log('🗑️ Deleting VisiMisi data with id:', id)

    try {
      const response = await fetch(`http://localhost:5000/api/visimisi/${id}`, {
        method: 'DELETE'
      })

      console.log('📡 VisiMisi delete response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ VisiMisi delete error response:', errorText)
        throw new Error(errorText || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ VisiMisi delete success:', result)
      
      // Socket.io akan otomatis update data via realtime
      alert('✅ Data berhasil dihapus')

    } catch (error) {
      console.error('❌ Error deleting VisiMisi data:', error)
      alert(`❌ Gagal menghapus data: ${error.message}`)
    }
  }

  // Function untuk mendapatkan URL gambar
  const getImageUrl = (imagePath) => {
    if (!imagePath) return ''
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
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex space-x-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
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
          <span className="text-blue-600 font-semibold">Visi & Misi</span>
        </div>
        
        {/* Header dengan Tombol Tambah Data - Desktop */}
        <div className="hidden lg:flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 font-poppins">Data Visi & Misi</h2>
            <p className="text-gray-600 font-poppins mt-1">Kelola data Visi & Misi organisasi</p>
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
            <h2 className="text-3xl font-bold text-gray-800 font-poppins">Data Visi & Misi</h2>
            <p className="text-gray-600 font-poppins mt-1">Kelola data Visi & Misi organisasi</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTable('visiMisi')}
            className={`px-4 py-2 rounded-lg font-poppins font-medium transition-all duration-200 ${
              activeTable === 'visiMisi' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Visi & Misi
          </button>
          <button
            onClick={() => setActiveTable('menuDevisi')}
            className={`px-4 py-2 rounded-lg font-poppins font-medium transition-all duration-200 ${
              activeTable === 'menuDevisi' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Menu Devisi
          </button>
          <button
            onClick={() => setActiveTable('visiDevisi')}
            className={`px-4 py-2 rounded-lg font-poppins font-medium transition-all duration-200 ${
              activeTable === 'visiDevisi' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Visi Devisi
          </button>
        </div>

        {/* Table Visi & Misi */}
        {activeTable === 'visiMisi' && (
          <div className="overflow-x-auto">
            <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins border-b sticky top-0 bg-gray-50 z-10">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins border-b sticky top-0 bg-gray-50 z-10">
                      Deskripsi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins border-b sticky top-0 bg-gray-50 z-10">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dataVisiMisi.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-4 py-3 text-sm text-gray-800 font-poppins capitalize">
                        {item.type === 'strategi_misi' ? 'Strategi' : item.type}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-poppins">
                        {item.type === 'strategi_misi' ? (
                          <>
                            <div className="font-medium">{item.data?.title}</div>
                            <ul className="list-disc list-inside space-y-1 mt-2">
                              {item.data?.items?.map((point, i) => (
                                <li key={i}>{point}</li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          item.data?.desk
                        )}
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
              {dataVisiMisi.length === 0 && (
                <div className="text-center py-8 text-gray-500 font-poppins">
                  Tidak ada data Visi & Misi
                </div>
              )}
            </div>
          </div>
        )}

        {/* Table Menu Devisi */}
        {activeTable === 'menuDevisi' && (
          <div className="overflow-x-auto">
            <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins border-b sticky top-0 bg-gray-50 z-10">
                      Title
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
                  {dataMenuDevisi.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-4 py-3 text-sm text-gray-800 font-poppins">{item.data?.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-poppins">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                          <img 
                            src={getImageUrl(item.data?.item)} 
                            alt={item.data?.title} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/visimisi/default.png'
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
              {dataMenuDevisi.length === 0 && (
                <div className="text-center py-8 text-gray-500 font-poppins">
                  Tidak ada data Menu Devisi
                </div>
              )}
            </div>
          </div>
        )}

        {/* Table Visi Devisi */}
        {activeTable === 'visiDevisi' && (
          <div className="overflow-x-auto">
            <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins border-b sticky top-0 bg-gray-50 z-10">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins border-b sticky top-0 bg-gray-50 z-10">
                      Visi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins border-b sticky top-0 bg-gray-50 z-10">
                      Strategi
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
                  {dataVisiDevisi.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-4 py-3 text-sm text-gray-800 font-poppins">{item.data?.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-poppins">{item.data?.visi}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-poppins">
                        <ul className="list-disc list-inside space-y-1">
                          {item.data?.strategi?.map((strategy, index) => (
                            <li key={index}>{strategy}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-poppins">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                          <img 
                            src={getImageUrl(item.data?.gambar)} 
                            alt={item.data?.title} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/visimisi/default.png'
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
              {dataVisiDevisi.length === 0 && (
                <div className="text-center py-8 text-gray-500 font-poppins">
                  Tidak ada data Visi Devisi
                </div>
              )}
            </div>
          </div>
        )}
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
                {isEdit ? 'Edit Data' : 'Tambah Data'} {activeTable === 'visiMisi' ? 'Visi & Misi' : activeTable === 'menuDevisi' ? 'Menu Devisi' : 'Visi Devisi'}
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
              {/* Upload Foto Section untuk menuDevisi dan visiDevisi */}
              {(activeTable === 'menuDevisi' || activeTable === 'visiDevisi') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                    Gambar
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
                        <i className="bx bx-image text-2xl text-gray-400"></i>
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
                        <span>Pilih Gambar</span>
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
              )}

              <div className="grid grid-cols-1 gap-4">
                {/* Title - untuk semua type kecuali visi/misi biasa */}
                {(activeTable === 'menuDevisi' || activeTable === 'visiDevisi' || activeTable === 'visiMisi') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                      {activeTable === 'visiMisi' && (formData.type === 'strategi_misi') ? 'Judul Strategi' : 
                       activeTable === 'visiMisi' ? 'Type' : 'Title'}
                    </label>
                    {activeTable === 'visiMisi' && (formData.type !== 'strategi_misi') ? (
                      <select 
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-poppins"
                        required
                      >
                        <option value="">Pilih Type</option>
                        <option value="visi">Visi</option>
                        <option value="misi">Misi</option>
                        <option value="strategi_misi">Strategi</option>
                      </select>
                    ) : (
                      <input 
                        type="text" 
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-poppins"
                        placeholder={
                          activeTable === 'visiMisi' && formData.type === 'strategi_misi' ? 
                          "Masukkan judul strategi" : "Masukkan title"
                        }
                        required
                      />
                    )}
                  </div>
                )}

                {/* Deskripsi untuk visiMisi */}
                {activeTable === 'visiMisi' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                      {formData.type === 'strategi_misi' ? 'Strategi (pisahkan dengan enter)' : 'Deskripsi'}
                    </label>
                    <textarea 
                      name="desk"
                      value={formData.desk}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-poppins"
                      placeholder={formData.type === 'strategi_misi' ? "Masukkan strategi (pisahkan dengan enter)" : "Masukkan deskripsi"}
                      rows={formData.type === 'strategi_misi' ? 4 : 3}
                      required
                    />
                  </div>
                )}

                {/* Visi dan Strategi untuk visiDevisi */}
                {activeTable === 'visiDevisi' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                        Visi
                      </label>
                      <textarea 
                        name="visi"
                        value={formData.visi}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-poppins"
                        placeholder="Masukkan visi"
                        rows="3"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                        Strategi (pisahkan dengan enter)
                      </label>
                      <textarea 
                        name="strategi"
                        value={formData.strategi}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-poppins"
                        placeholder="Masukkan strategi (pisahkan dengan enter)"
                        rows="4"
                        required
                      />
                    </div>
                  </>
                )}
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

export default VisiMisi