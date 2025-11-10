import React, { useState, useEffect } from 'react'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { getSocket, initializeSocket } from '../api/apiAdmin'

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend)

const Dashboard = ({ searchTerm = '' }) => { // 🔹 ADD searchTerm prop dengan default value
  const [jumlahIndex, setJumlahIndex] = useState([])
  const [dataTable, setDataTable] = useState([])
  const [filteredDataTable, setFilteredDataTable] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState(null)
  const [socket, setSocket] = useState(null)

  // Fetch data dari semua API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch semua data secara paralel
        const [
          bphResponse, 
          devisiResponse, 
          teamResponse, 
          newsResponse, 
          galleryResponse, 
          articleResponse, 
          visimisiResponse
        ] = await Promise.all([
          fetch('http://localhost:5000/api/bph'),
          fetch('http://localhost:5000/api/devisi'),
          fetch('http://localhost:5000/api/team'),
          fetch('http://localhost:5000/api/news'),
          fetch('http://localhost:5000/api/gallery'),
          fetch('http://localhost:5000/api/articles'),
          fetch('http://localhost:5000/api/visimisi')
        ])

        const [
          bphData, 
          devisiData, 
          teamData, 
          newsData, 
          galleryData, 
          articleData, 
          visimisiData
        ] = await Promise.all([
          bphResponse.json(),
          devisiResponse.json(),
          teamResponse.json(),
          newsResponse.json(),
          galleryResponse.json(),
          articleResponse.json(),
          visimisiResponse.json()
        ])

        // Process and set data
        processAndSetData(bphData, devisiData, teamData, newsData, galleryData, articleData, visimisiData)

      } catch (error) {
        console.error('Error fetching data:', error)
        // Fallback data jika error
        setJumlahIndex([
          { id: 'bph', icon: 'bx bx-group', label: 'BPH', jumlah: 0, color: 'from-purple-500 to-purple-700' },
          { id: 'devisi', icon: 'bx bx-category', label: 'Devisi', jumlah: 0, color: 'from-blue-500 to-blue-700' },
          { id: 'team', icon: 'bx bx-user-circle', label: 'Team', jumlah: 0, color: 'from-green-500 to-green-700' },
          { id: 'anggota', icon: 'bx bx-user-plus', label: 'Anggota', jumlah: 0, color: 'from-orange-500 to-orange-700' },
          { id: 'visimisi', icon: 'bx bx-target-lock', label: 'Visi & Misi', jumlah: 0, color: 'from-red-500 to-red-700' },
          { id: 'gallery', icon: 'bx bx-photo-album', label: 'Gallery', jumlah: 0, color: 'from-indigo-500 to-indigo-700' },
          { id: 'article', icon: 'bx bx-news', label: 'Article', jumlah: 0, color: 'from-teal-500 to-teal-700' },
          { id: 'news', icon: 'bx bx-news', label: 'News', jumlah: 0, color: 'from-pink-500 to-pink-700' },
        ])
        setDataTable([])
        setFilteredDataTable([])
      } finally {
        setLoading(false)
      }
    }

    // Initialize Socket.io
    const socketInstance = initializeSocket()
    setSocket(socketInstance)

    fetchData()

    // Cleanup socket on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect()
      }
    }
  }, [])

  // 🔹 ADD THIS EFFECT: Handle search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDataTable(dataTable)
      return
    }

    const term = searchTerm.toLowerCase().trim()
    
    // Search sekali dengan filter yang komprehensif
    const filtered = dataTable.filter(item => 
      item.name?.toLowerCase().includes(term) ||
      item.position?.toLowerCase().includes(term) ||
      item.prodi?.toLowerCase().includes(term) ||
      item.kategori?.toLowerCase().includes(term) ||
      item.nomorInduk?.toString().includes(term) ||
      item.kelas?.toLowerCase().includes(term)
    )
    
    setFilteredDataTable(filtered)
  }, [searchTerm, dataTable]) // 🔹 Depend on searchTerm and dataTable

  // Setup Socket.io listeners
  useEffect(() => {
    if (!socket) return

    // Listen for realtime updates from all collections
    const updateHandlers = {
      'bph_updated': () => refreshBPHData(),
      'devisi_updated': () => refreshDevisiData(),
      'team_updated': () => refreshTeamData(),
      'news_updated': () => refreshNewsData(),
      'gallery_updated': () => refreshGalleryData(),
      'article_updated': () => refreshArticleData(),
      'visimisi_updated': () => refreshVisiMisiData()
    }

    Object.entries(updateHandlers).forEach(([event, handler]) => {
      socket.on(event, handler)
    })

    return () => {
      Object.keys(updateHandlers).forEach(event => {
        socket.off(event)
      })
    }
  }, [socket])

  // Function to process and set all data
  const processAndSetData = (bphData, devisiData, teamData, newsData, galleryData, articleData, visimisiData) => {
    // Hitung jumlah berdasarkan kategori
    const bphCount = bphData.length
    const devisiCount = devisiData.length
    const teamCount = teamData.filter(item => item.kategori === 'TIM').length
    const anggotaCount = teamData.filter(item => item.kategori === 'ANGGOTA').length
    const newsCount = newsData.length
    const galleryCount = galleryData.length
    const articleCount = articleData.length
    const visimisiCount = visimisiData.length

    // Update jumlahIndex dengan data real
    setJumlahIndex([
      { id: 'bph', icon: 'bx bx-group', label: 'BPH', jumlah: bphCount, color: 'from-purple-500 to-purple-700' },
      { id: 'devisi', icon: 'bx bx-category', label: 'Devisi', jumlah: devisiCount, color: 'from-blue-500 to-blue-700' },
      { id: 'team', icon: 'bx bx-user-circle', label: 'Team', jumlah: teamCount, color: 'from-green-500 to-green-700' },
      { id: 'anggota', icon: 'bx bx-user-plus', label: 'Anggota', jumlah: anggotaCount, color: 'from-orange-500 to-orange-700' },
      { id: 'visimisi', icon: 'bx bx-target-lock', label: 'Visi & Misi', jumlah: visimisiCount, color: 'from-red-500 to-red-700' },
      { id: 'gallery', icon: 'bx bx-photo-album', label: 'Gallery', jumlah: galleryCount, color: 'from-indigo-500 to-indigo-700' },
      { id: 'article', icon: 'bx bx-news', label: 'Article', jumlah: articleCount, color: 'from-teal-500 to-teal-700' },
      { id: 'news', icon: 'bx bx-news', label: 'News', jumlah: newsCount, color: 'from-pink-500 to-pink-700' },
    ])

    // Gabungkan semua data pengurus untuk table
    const allPengurus = [
      ...bphData.map(item => ({ ...item, kategori: 'BPH' })),
      ...devisiData.map(item => ({ ...item, kategori: 'DEVISI' })),
      ...teamData.filter(item => item.kategori === 'TIM').map(item => ({ ...item, kategori: 'TIM' })),
      ...teamData.filter(item => item.kategori === 'ANGGOTA').map(item => ({ ...item, kategori: 'ANGGOTA' }))
    ]

    setDataTable(allPengurus)
    // 🔹 UPDATE: Apply current search term when setting new data
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim()
      const filtered = allPengurus.filter(item => 
        item.name?.toLowerCase().includes(term) ||
        item.position?.toLowerCase().includes(term) ||
        item.prodi?.toLowerCase().includes(term) ||
        item.kategori?.toLowerCase().includes(term) ||
        item.nomorInduk?.toString().includes(term) ||
        item.kelas?.toLowerCase().includes(term)
      )
      setFilteredDataTable(filtered)
    } else {
      setFilteredDataTable(allPengurus)
    }

    // Update chart data
    setChartData({
      labels: ['BPH', 'Devisi', 'Anggota'],
      datasets: [
        {
          data: [bphCount, devisiCount, anggotaCount],
          backgroundColor: [
            'rgba(147, 51, 234, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(249, 115, 22, 0.8)',
          ],
          borderColor: [
            'rgba(147, 51, 234, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(249, 115, 22, 1)',
          ],
          borderWidth: 2,
        },
      ],
    })
  }

  // Refresh functions for realtime updates (keep the same as before)
  const refreshBPHData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bph')
      const bphData = await response.json()
      // Re-fetch all data to maintain consistency
      const [devisiResponse, teamResponse, newsResponse, galleryResponse, articleResponse, visimisiResponse] = await Promise.all([
        fetch('http://localhost:5000/api/devisi'),
        fetch('http://localhost:5000/api/team'),
        fetch('http://localhost:5000/api/news'),
        fetch('http://localhost:5000/api/gallery'),
        fetch('http://localhost:5000/api/articles'),
        fetch('http://localhost:5000/api/visimisi')
      ])
      
      const [devisiData, teamData, newsData, galleryData, articleData, visimisiData] = await Promise.all([
        devisiResponse.json(),
        teamResponse.json(),
        newsResponse.json(),
        galleryResponse.json(),
        articleResponse.json(),
        visimisiResponse.json()
      ])
      
      processAndSetData(bphData, devisiData, teamData, newsData, galleryData, articleData, visimisiData)
    } catch (error) {
      console.error('Error refreshing BPH data:', error)
    }
  }

  const refreshDevisiData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/devisi')
      const devisiData = await response.json()
      // Re-fetch all data
      const [bphResponse, teamResponse, newsResponse, galleryResponse, articleResponse, visimisiResponse] = await Promise.all([
        fetch('http://localhost:5000/api/bph'),
        fetch('http://localhost:5000/api/team'),
        fetch('http://localhost:5000/api/news'),
        fetch('http://localhost:5000/api/gallery'),
        fetch('http://localhost:5000/api/articles'),
        fetch('http://localhost:5000/api/visimisi')
      ])
      
      const [bphData, teamData, newsData, galleryData, articleData, visimisiData] = await Promise.all([
        bphResponse.json(),
        teamResponse.json(),
        newsResponse.json(),
        galleryResponse.json(),
        articleResponse.json(),
        visimisiResponse.json()
      ])
      
      processAndSetData(bphData, devisiData, teamData, newsData, galleryData, articleData, visimisiData)
    } catch (error) {
      console.error('Error refreshing Devisi data:', error)
    }
  }

  const refreshTeamData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/team')
      const teamData = await response.json()
      // Re-fetch all data
      const [bphResponse, devisiResponse, newsResponse, galleryResponse, articleResponse, visimisiResponse] = await Promise.all([
        fetch('http://localhost:5000/api/bph'),
        fetch('http://localhost:5000/api/devisi'),
        fetch('http://localhost:5000/api/news'),
        fetch('http://localhost:5000/api/gallery'),
        fetch('http://localhost:5000/api/articles'),
        fetch('http://localhost:5000/api/visimisi')
      ])
      
      const [bphData, devisiData, newsData, galleryData, articleData, visimisiData] = await Promise.all([
        bphResponse.json(),
        devisiResponse.json(),
        newsResponse.json(),
        galleryResponse.json(),
        articleResponse.json(),
        visimisiResponse.json()
      ])
      
      processAndSetData(bphData, devisiData, teamData, newsData, galleryData, articleData, visimisiData)
    } catch (error) {
      console.error('Error refreshing Team data:', error)
    }
  }

  const refreshNewsData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/news')
      const newsData = await response.json()
      // Update only news count
      setJumlahIndex(prev => prev.map(item => 
        item.id === 'news' ? { ...item, jumlah: newsData.length } : item
      ))
    } catch (error) {
      console.error('Error refreshing News data:', error)
    }
  }

  const refreshGalleryData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/gallery')
      const galleryData = await response.json()
      // Update only gallery count
      setJumlahIndex(prev => prev.map(item => 
        item.id === 'gallery' ? { ...item, jumlah: galleryData.length } : item
      ))
    } catch (error) {
      console.error('Error refreshing Gallery data:', error)
    }
  }

  const refreshArticleData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/articles')
      const articleData = await response.json()
      // Update only article count
      setJumlahIndex(prev => prev.map(item => 
        item.id === 'article' ? { ...item, jumlah: articleData.length } : item
      ))
    } catch (error) {
      console.error('Error refreshing Article data:', error)
    }
  }

  const refreshVisiMisiData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/visimisi')
      const visimisiData = await response.json()
      // Update only visimisi count
      setJumlahIndex(prev => prev.map(item => 
        item.id === 'visimisi' ? { ...item, jumlah: visimisiData.length } : item
      ))
    } catch (error) {
      console.error('Error refreshing VisiMisi data:', error)
    }
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            family: 'Poppins',
          },
        },
      },
    },
  }

  // Hitung total untuk chart
  const totalChart = chartData ? chartData.datasets[0].data.reduce((a, b) => a + b, 0) : 0

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Loading Skeleton untuk Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-4 border border-gray-200 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-8"></div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Skeleton untuk Table dan Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="w-64 h-64 bg-gray-200 rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Jumlah Index Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {jumlahIndex.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-lg p-4 border border-gray-200 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-poppins font-medium">{item.label}</p>
                <p className="text-2xl font-bold text-gray-800 font-poppins mt-1">{item.jumlah}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center`}>
                <i className={`${item.icon} text-white text-lg`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table dan Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table - Sebelah Kiri */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 font-poppins mb-4">Data Pengurus</h3>
          <div className="overflow-x-auto">
            <div className="max-h-80 overflow-y-auto scrollbar-hide">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins border-b sticky top-0 bg-gray-50 z-10">
                      Nama Lengkap
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins border-b sticky top-0 bg-gray-50 z-10">
                      Jabatan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins border-b sticky top-0 bg-gray-50 z-10">
                      Prodi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins border-b sticky top-0 bg-gray-50 z-10">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDataTable.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-4 py-3 text-sm text-gray-800 font-poppins">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-poppins">{item.position}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 font-poppins">{item.prodi}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.kategori === 'BPH' ? 'bg-purple-100 text-purple-800' :
                          item.kategori === 'DEVISI' ? 'bg-blue-100 text-blue-800' :
                          item.kategori === 'TIM' ? 'bg-green-100 text-green-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {item.kategori}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredDataTable.length === 0 && (
                <div className="text-center py-8 text-gray-500 font-poppins">
                  {searchTerm ? 'Tidak ada data yang ditemukan' : 'Tidak ada data pengurus'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grafik Bulat - Sebelah Kanan */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 font-poppins mb-4">
            Jumlah BPH + Devisi + Anggota
          </h3>
          <div className="flex justify-center">
            <div className="w-64 h-64">
              {chartData ? (
                <Doughnut data={chartData} options={chartOptions} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  Data tidak tersedia
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-600 text-sm font-poppins">
              Total: <span className="font-bold text-purple-600">{totalChart}</span> Orang
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard