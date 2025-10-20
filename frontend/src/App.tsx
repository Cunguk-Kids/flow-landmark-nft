import { useState } from 'react'
import Auth from './components/Auth'
import Counter from './components/Counter'
import CollectionSetup from './components/CollectionSetup'
import NFTGallery from './components/NFTGallery'
import MintNFT from './components/MintNFT'

function App() {
  const [activeTab, setActiveTab] = useState<'counter' | 'gallery' | 'mint'>('gallery')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleMintSuccess = () => {
    setRefreshKey(prev => prev + 1)
    setActiveTab('gallery')
  }

  const tabs = [
    { id: 'counter', label: 'Counter Demo', icon: '🔢' },
    { id: 'gallery', label: 'NFT Gallery', icon: '🖼️' },
    { id: 'mint', label: 'Mint NFT', icon: '✨' },
  ] as const

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🌺</div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-sky-600 to-purple-600 dark:from-sky-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Flow NFT Moments
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Preserve Indonesian culture on blockchain
                </p>
              </div>
            </div>
            <Auth />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Collection Setup Banner */}
        <CollectionSetup onSetupComplete={() => setRefreshKey(prev => prev + 1)} />

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 min-w-[140px] px-6 py-3 rounded-xl font-semibold transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-sky-500 to-purple-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === 'counter' && (
            <div className="space-y-6">
              <Counter />
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                <h4 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  About this DApp
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  This is a decentralized application built on Flow blockchain featuring:
                </p>
                <ul className="space-y-2 text-left max-w-2xl">
                  <li className="flex items-start gap-2">
                    <span className="text-sky-500 mt-1">🔢</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      <strong>Counter Demo:</strong> Simple blockchain state management
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">🌺</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      <strong>NFT Moments:</strong> Culturally-rich NFTs with Indonesian heritage
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">📍</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      <strong>Location-based:</strong> Capture moments with GPS, weather, and metadata
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">🎨</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      <strong>Cultural Elements:</strong> Batik borders, Javanese script, Gamelan audio
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'gallery' && <NFTGallery key={refreshKey} />}
          {activeTab === 'mint' && <MintNFT onMintSuccess={handleMintSuccess} />}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="text-sm">
              Built with Flow Blockchain • Powered by Cadence Smart Contracts
            </p>
            <p className="text-xs mt-2">
              Preserving Indonesian cultural heritage through decentralized technology
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
