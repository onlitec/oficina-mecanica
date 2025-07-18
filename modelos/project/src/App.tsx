import React, { useState } from 'react';
import { 
  Users, 
  Settings, 
  Car, 
  Package, 
  FileText, 
  DollarSign, 
  BarChart3, 
  Shield,
  Search,
  List,
  UserPlus,
  CarFront,
  PackagePlus,
  Wrench
} from 'lucide-react';

function App() {
  const [searchClient, setSearchClient] = useState('');
  const [searchVehicle, setSearchVehicle] = useState('');
  const [searchPart, setSearchPart] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuItems = [
    { id: 'clientes', label: 'Clientes', icon: Users, active: false },
    { id: 'veiculos', label: 'Veículos', icon: Car, active: false },
    { id: 'servicos', label: 'Serviços', icon: Wrench, active: false },
    { id: 'pecas', label: 'Peças', icon: Package, active: false },
  ];

  const statsCards = [
    { title: 'Clientes', count: '-', icon: Users, color: 'bg-green-500' },
    { title: 'Veículos', count: '-', icon: Car, color: 'bg-red-500' },
    { title: 'Serviços', count: '-', icon: Wrench, color: 'bg-orange-500' },
    { title: 'Peças', count: '-', icon: Package, color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Oficina</h1>
                  <p className="text-sm opacity-90">Mecânica</p>
                </div>
              </div>
              
              <nav className="hidden md:flex space-x-6">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === item.id 
                        ? 'bg-white bg-opacity-20 text-white' 
                        : 'text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <div className="text-right">
                <p className="text-sm font-semibold">Administrador</p>
                <p className="text-xs opacity-80">(ADMIN)</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Bem-vindo ao Dashboard!</h2>
          <p className="text-gray-600">Sistema de Gestão de Oficina Mecânica - Painel de Controle</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((card, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-gray-800">{card.count}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700">{card.title}</h3>
            </div>
          ))}
        </div>

        {/* Search and Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Client Search */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Buscar Clientes</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Cliente</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchClient}
                    onChange={(e) => setSearchClient(e.target.value)}
                    placeholder="Digite o nome do cliente..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1">
                  <Search className="w-4 h-4" />
                  <span>Buscar</span>
                </button>
                <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-1">
                  <List className="w-4 h-4" />
                  <span>Listar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Vehicle Search */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Car className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-800">Buscar Veículos</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Placa do Veículo</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchVehicle}
                    onChange={(e) => setSearchVehicle(e.target.value)}
                    placeholder="Digite a placa do veículo..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-1">
                  <Search className="w-4 h-4" />
                  <span>Buscar</span>
                </button>
                <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-1">
                  <List className="w-4 h-4" />
                  <span>Listar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Parts Search */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Package className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-800">Buscar Peças</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modelo da Peça</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchPart}
                    onChange={(e) => setSearchPart(e.target.value)}
                    placeholder="Digite o modelo da peça..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-1">
                  <Search className="w-4 h-4" />
                  <span>Buscar</span>
                </button>
                <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-1">
                  <List className="w-4 h-4" />
                  <span>Listar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Management Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Management */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Gerenciar Clientes</h3>
            </div>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                <UserPlus className="w-4 h-4" />
                <span>Adicionar Cliente</span>
              </button>
              <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                <List className="w-4 h-4" />
                <span>Listar Clientes</span>
              </button>
            </div>
          </div>

          {/* Vehicle Management */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Car className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-800">Gerenciar Veículos</h3>
            </div>
            <div className="space-y-3">
              <button className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2">
                <CarFront className="w-4 h-4" />
                <span>Adicionar Veículo</span>
              </button>
              <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                <List className="w-4 h-4" />
                <span>Listar Veículos</span>
              </button>
            </div>
          </div>

          {/* Parts Management */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Package className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-800">Gerenciar Peças</h3>
            </div>
            <div className="space-y-3">
              <button className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2">
                <PackagePlus className="w-4 h-4" />
                <span>Adicionar Peça</span>
              </button>
              <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                <List className="w-4 h-4" />
                <span>Listar Peças</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;