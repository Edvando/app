
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, 
  Package, 
  User as UserIcon, 
  MapPin, 
  History, 
  PlusCircle, 
  Bell, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  CreditCard,
  MessageSquare,
  ShieldCheck,
  Star,
  Settings,
  LogOut,
  FileText,
  BadgeCheck,
  Loader2,
  PartyPopper
} from 'lucide-react';
import { User, UserRole, DeliveryOrder, OrderStatus, DriverDetails } from './types';
import { getDeliveryEstimate } from './services/geminiService';
import MapSimulator from './components/MapSimulator';

// Mock Initial Data
const MOCK_USER: User = {
  id: 'u1',
  name: 'Bruno Silva',
  email: 'bruno@example.com',
  role: 'sender',
  rating: 4.8,
  avatar: 'https://picsum.photos/seed/bruno/100/100',
  balance: 150.00,
  isDriverVerified: false
};

const INITIAL_ORDERS: DeliveryOrder[] = [
  {
    id: 'ord-1',
    senderId: 'u1',
    pickupAddress: 'Av. Paulista, 1000 - São Paulo',
    deliveryAddress: 'Rua Augusta, 500 - São Paulo',
    productType: 'Documentos',
    dimensions: '30x20x2cm',
    weight: '0.5kg',
    price: 18.50,
    status: 'delivered',
    createdAt: Date.now() - 86400000,
    description: 'Envelope lacrado'
  }
];

const App: React.FC = () => {
  const [user, setUser] = useState<User>(MOCK_USER);
  const [orders, setOrders] = useState<DeliveryOrder[]>(INITIAL_ORDERS);
  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'profile' | 'create' | 'driver_reg'>('home');
  const [isDriverMode, setIsDriverMode] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Registration State
  const [regForm, setRegForm] = useState<DriverDetails>({
    fullName: '',
    cpf: '',
    cnh: '',
    vehicleModel: '',
    vehiclePlate: ''
  });
  const [isVerifying, setIsVerifying] = useState(false);

  // Order Creation State
  const [newOrder, setNewOrder] = useState({
    pickup: '',
    delivery: '',
    product: '',
    size: '',
    weight: '',
    desc: ''
  });
  const [estimate, setEstimate] = useState<any>(null);
  const [isLoadingEstimate, setIsLoadingEstimate] = useState(false);

  const toggleRole = () => {
    if (!isDriverMode && !user.isDriverVerified) {
      setActiveTab('driver_reg');
    } else {
      setIsDriverMode(!isDriverMode);
    }
  };

  const handleDriverRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    
    // Simulate API delay for document verification
    setTimeout(() => {
      setUser(prev => ({
        ...prev,
        name: regForm.fullName || prev.name,
        isDriverVerified: true,
        driverDetails: regForm
      }));
      setIsVerifying(false);
      setShowSuccessModal(true);
    }, 2000);
  };

  const closeModalAndGoToHome = () => {
    setShowSuccessModal(false);
    setIsDriverMode(true);
    setActiveTab('home');
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.pickup || !newOrder.delivery) return;

    setIsLoadingEstimate(true);
    const est = await getDeliveryEstimate({
      product: newOrder.product,
      dimensions: newOrder.size,
      weight: newOrder.weight,
      distance: "5.2km"
    });
    setEstimate(est);
    setIsLoadingEstimate(false);
  };

  const confirmOrder = () => {
    const order: DeliveryOrder = {
      id: `ord-${Date.now()}`,
      senderId: user.id,
      pickupAddress: newOrder.pickup,
      deliveryAddress: newOrder.delivery,
      productType: newOrder.product,
      dimensions: newOrder.size,
      weight: newOrder.weight,
      price: estimate.estimatedPrice,
      status: 'pending',
      createdAt: Date.now(),
      description: newOrder.desc
    };
    setOrders([order, ...orders]);
    setActiveTab('orders');
    setEstimate(null);
    setNewOrder({ pickup: '', delivery: '', product: '', size: '', weight: '', desc: '' });
  };

  const updateOrderStatus = (id: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus, driverId: user.id } : o));
  };

  const activeOrders = useMemo(() => orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled'), [orders]);
  const historyOrders = useMemo(() => orders.filter(o => o.status === 'delivered' || o.status === 'cancelled'), [orders]);
  const availableOrders = useMemo(() => orders.filter(o => o.status === 'pending'), [orders]);

  // --- Render Helpers ---

  const renderSuccessModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"></div>
      <div className="bg-white rounded-[32px] p-8 w-full max-w-sm relative z-10 shadow-2xl animate-slideUp text-center">
        <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
           <BadgeCheck size={48} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Conta Verificada!</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Parabéns! Seus documentos foram validados com sucesso. Você agora é oficialmente um motorista parceiro <b>LevaAí</b>.
        </p>
        <button 
          onClick={closeModalAndGoToHome}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          Ir para o Painel <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );

  const renderDriverRegistration = () => (
    <div className="space-y-6 animate-slideUp">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => setActiveTab('home')} className="p-2 hover:bg-slate-100 rounded-full">
           <ArrowRight className="rotate-180" />
        </button>
        <h1 className="text-xl font-bold">Cadastro de Motorista</h1>
      </div>

      <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg mb-4">
         <Truck className="mb-4" size={32} />
         <h2 className="text-xl font-bold mb-2">Seja um parceiro LevaAí</h2>
         <p className="text-indigo-100 text-sm leading-relaxed">
           Complete seu cadastro com os dados pessoais e do veículo para começar a realizar entregas em sua região.
         </p>
      </div>

      <form onSubmit={handleDriverRegistration} className="space-y-4 pb-20">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Dados Pessoais</label>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-indigo-400 transition-colors">
                <UserIcon size={18} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Nome Completo" 
                  className="bg-transparent w-full text-sm outline-none"
                  value={regForm.fullName}
                  onChange={e => setRegForm({...regForm, fullName: e.target.value})}
                  required
                />
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-indigo-400 transition-colors">
                <FileText size={18} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="CPF (000.000.000-00)" 
                  className="bg-transparent w-full text-sm outline-none"
                  value={regForm.cpf}
                  onChange={e => setRegForm({...regForm, cpf: e.target.value})}
                  required
                />
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-indigo-400 transition-colors">
                <BadgeCheck size={18} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Número da CNH" 
                  className="bg-transparent w-full text-sm outline-none"
                  value={regForm.cnh}
                  onChange={e => setRegForm({...regForm, cnh: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Dados do Veículo</label>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-indigo-400 transition-colors">
                <Truck size={18} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Modelo do Veículo (Ex: Honda CG 160)" 
                  className="bg-transparent w-full text-sm outline-none"
                  value={regForm.vehicleModel}
                  onChange={e => setRegForm({...regForm, vehicleModel: e.target.value})}
                  required
                />
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-indigo-400 transition-colors">
                <CreditCard size={18} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Placa do Veículo" 
                  className="bg-transparent w-full text-sm outline-none"
                  value={regForm.vehiclePlate}
                  onChange={e => setRegForm({...regForm, vehiclePlate: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isVerifying}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-70"
        >
          {isVerifying ? (
            <><Loader2 className="animate-spin" size={20} /> Verificando Documentos...</>
          ) : (
            'Finalizar Cadastro'
          )}
        </button>
      </form>
    </div>
  );

  const renderHome = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Olá, {user.name.split(' ')[0]}!</h1>
          <p className="text-slate-500 text-sm">Pronto para {isDriverMode ? 'ganhar dinheiro?' : 'enviar algo?'}</p>
        </div>
        <button 
          onClick={toggleRole} 
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            isDriverMode ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
          }`}
        >
          {isDriverMode ? <Package size={14} /> : <Truck size={14} />}
          {isDriverMode ? 'Ir para Cliente' : 'Modo Motorista'}
        </button>
      </div>

      {/* Hero Stats Card */}
      <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-indigo-100 text-xs font-medium mb-1 uppercase tracking-wider">Saldo na Carteira</p>
          <h2 className="text-3xl font-bold mb-4">R$ {user.balance.toFixed(2)}</h2>
          <div className="flex gap-3">
             <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                Recarregar
             </button>
             <button className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all">
                Extrato
             </button>
          </div>
        </div>
        <div className="absolute top-[-20px] right-[-20px] bg-indigo-500/30 w-40 h-40 rounded-full blur-2xl"></div>
      </div>

      {/* Main Action or Active Delivery */}
      {isDriverMode ? (
        <section>
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-slate-800">Entregas Disponíveis</h3>
             <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">AO VIVO</span>
          </div>
          {availableOrders.length > 0 ? (
            <div className="space-y-4">
              {availableOrders.map(order => (
                <div key={order.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-indigo-600 font-bold text-lg">R$ {order.price.toFixed(2)}</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                      <Clock size={12} /> {order.productType}
                    </span>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                        <div className="w-0.5 h-full bg-slate-200 my-1"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      </div>
                      <div className="flex flex-col gap-3 text-sm">
                        <p className="line-clamp-1 text-slate-600"><b>De:</b> {order.pickupAddress}</p>
                        <p className="line-clamp-1 text-slate-600"><b>Para:</b> {order.deliveryAddress}</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => updateOrderStatus(order.id, 'accepted')}
                    className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
                  >
                    Aceitar Entrega
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300">
               <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-slate-300" />
               </div>
               <p className="text-slate-400 text-sm">Buscando novas entregas na sua região...</p>
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => { setActiveTab('create'); }}
              className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all group"
            >
              <div className="bg-indigo-50 p-4 rounded-2xl mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <PlusCircle size={28} />
              </div>
              <span className="font-bold text-slate-700">Nova Entrega</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all group">
              <div className="bg-amber-50 p-4 rounded-2xl mb-3 group-hover:bg-amber-500 group-hover:text-white transition-all">
                <ShieldCheck size={28} className="text-amber-600 group-hover:text-white" />
              </div>
              <span className="font-bold text-slate-700">Seguros</span>
            </button>
          </div>

          <div className="flex justify-between items-center px-1">
             <h3 className="font-bold text-slate-800">Minhas Entregas Ativas</h3>
             <button onClick={() => setActiveTab('orders')} className="text-indigo-600 text-xs font-bold">Ver Tudo</button>
          </div>
          
          {activeOrders.length > 0 ? (
            <div className="space-y-4">
              {activeOrders.slice(0, 2).map(order => (
                <div key={order.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="bg-indigo-100 p-3 rounded-xl">
                        <Package className="text-indigo-600" />
                     </div>
                     <div className="flex-1">
                        <h4 className="font-bold text-sm text-slate-800">{order.productType}</h4>
                        <div className="flex items-center gap-2">
                           <span className={`w-2 h-2 rounded-full ${order.status === 'in_transit' ? 'bg-indigo-500' : 'bg-amber-500'} animate-pulse`}></span>
                           <p className="text-xs text-slate-500 capitalize">{order.status.replace('_', ' ')}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="font-bold text-slate-900">R$ {order.price.toFixed(2)}</p>
                     </div>
                  </div>
                  <MapSimulator pickup={order.pickupAddress} delivery={order.deliveryAddress} status={order.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center">
               <Package className="mx-auto text-slate-200 mb-3" size={48} />
               <p className="text-slate-400 text-sm">Você não tem entregas ativas no momento.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );

  const renderCreateOrder = () => (
    <div className="space-y-6 animate-slideUp">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => setActiveTab('home')} className="p-2 hover:bg-slate-100 rounded-full">
           <ArrowRight className="rotate-180" />
        </button>
        <h1 className="text-xl font-bold">Solicitar Entrega</h1>
      </div>

      {!estimate ? (
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Endereço de Retirada</label>
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-indigo-400 transition-colors">
                <MapPin size={18} className="text-indigo-500" />
                <input 
                  type="text" 
                  placeholder="De onde vamos retirar?" 
                  className="bg-transparent w-full text-sm outline-none"
                  value={newOrder.pickup}
                  onChange={e => setNewOrder({...newOrder, pickup: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Endereço de Entrega</label>
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-indigo-400 transition-colors">
                <MapPin size={18} className="text-emerald-500" />
                <input 
                  type="text" 
                  placeholder="Onde vamos entregar?" 
                  className="bg-transparent w-full text-sm outline-none"
                  value={newOrder.delivery}
                  onChange={e => setNewOrder({...newOrder, delivery: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-2">O que é?</label>
                   <input 
                      type="text" 
                      placeholder="Ex: Celular" 
                      className="bg-slate-50 w-full p-3 rounded-xl border border-slate-200 text-sm outline-none"
                      value={newOrder.product}
                      onChange={e => setNewOrder({...newOrder, product: e.target.value})}
                      required
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Peso (kg)</label>
                   <input 
                      type="text" 
                      placeholder="Ex: 2kg" 
                      className="bg-slate-50 w-full p-3 rounded-xl border border-slate-200 text-sm outline-none"
                      value={newOrder.weight}
                      onChange={e => setNewOrder({...newOrder, weight: e.target.value})}
                   />
                </div>
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Dimensões / Obs</label>
                <textarea 
                  rows={2} 
                  placeholder="Tamanho aproximado ou observações extras..." 
                  className="bg-slate-50 w-full p-3 rounded-xl border border-slate-200 text-sm outline-none resize-none"
                  value={newOrder.desc}
                  onChange={e => setNewOrder({...newOrder, desc: e.target.value})}
                />
             </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoadingEstimate}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            {isLoadingEstimate ? 'Calculando Estimativa...' : 'Ver Estimativa de Preço'}
          </button>
        </form>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl">
             <div className="flex justify-between items-start mb-6">
                <div>
                   <p className="text-indigo-100 text-xs uppercase font-bold tracking-widest mb-1">Preço Estimado LevaAí</p>
                   <h2 className="text-4xl font-black">R$ {estimate.estimatedPrice.toFixed(2)}</h2>
                </div>
                <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold">
                   {estimate.category}
                </div>
             </div>
             <div className="p-4 bg-white/10 rounded-2xl text-sm border border-white/10">
                <p className="flex items-center gap-2 mb-2 font-semibold">
                   <Star size={16} fill="currentColor" className="text-amber-400" />
                   Análise da IA:
                </p>
                <p className="text-indigo-50 leading-relaxed italic">"{estimate.reasoning}"</p>
                <div className="mt-3 flex items-center gap-2">
                   <span className="text-xs font-bold opacity-60">RISCO:</span>
                   <span className={`text-xs font-bold uppercase ${estimate.riskLevel === 'Low' ? 'text-emerald-300' : 'text-amber-300'}`}>{estimate.riskLevel}</span>
                </div>
             </div>
          </div>

          <button 
            onClick={confirmOrder}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-3"
          >
            Confirmar Solicitação <CheckCircle2 size={24} />
          </button>
          
          <button 
            onClick={() => setEstimate(null)}
            className="w-full bg-slate-100 text-slate-500 py-3 rounded-2xl font-bold text-sm"
          >
            Voltar e Editar
          </button>
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6 animate-fadeIn pb-24">
       <h1 className="text-2xl font-bold">Minhas Entregas</h1>
       
       <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Ativas</h3>
          {activeOrders.length === 0 && <p className="text-sm text-slate-400 italic ml-1">Nenhuma entrega em andamento.</p>}
          {activeOrders.map(order => (
            <div key={order.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${
                       order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                     }`}>
                        {order.status.replace('_', ' ')}
                     </span>
                     <span className="text-[10px] text-slate-400 font-medium">#{order.id.split('-')[1]}</span>
                  </div>
                  <p className="font-bold text-indigo-600">R$ {order.price.toFixed(2)}</p>
               </div>
               
               <div className="space-y-4">
                  <div className="flex gap-4">
                     <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full border-2 border-indigo-500 bg-white"></div>
                        <div className="flex-1 w-0.5 border-l-2 border-dashed border-slate-200 my-1"></div>
                        <div className="w-3 h-3 rounded-full border-2 border-emerald-500 bg-white"></div>
                     </div>
                     <div className="flex flex-col justify-between py-0.5 flex-1 min-w-0">
                        <p className="text-xs text-slate-800 font-medium line-clamp-1">{order.pickupAddress}</p>
                        <p className="text-xs text-slate-800 font-medium line-clamp-1">{order.deliveryAddress}</p>
                     </div>
                  </div>
                  
                  {isDriverMode && order.status === 'accepted' && (
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'in_transit')}
                      className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                    >
                      Coletado <CheckCircle2 size={16} />
                    </button>
                  )}

                  {isDriverMode && order.status === 'in_transit' && (
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                    >
                      Marcar como Entregue <CheckCircle2 size={16} />
                    </button>
                  )}
               </div>
            </div>
          ))}
       </div>

       <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Histórico</h3>
          {historyOrders.map(order => (
            <div key={order.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-4 opacity-80">
               <div className="bg-slate-200 p-2 rounded-xl text-slate-500">
                  <History size={20} />
               </div>
               <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-700 truncate">{order.productType}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
               </div>
               <div className="text-right">
                  <p className="font-bold text-slate-600 text-sm">R$ {order.price.toFixed(2)}</p>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase">Entregue</span>
               </div>
            </div>
          ))}
       </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6 animate-fadeIn pb-24">
       <h1 className="text-2xl font-bold">Meu Perfil</h1>
       
       <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center">
          <div className="relative mb-4">
             <img src={user.avatar} className="w-24 h-24 rounded-full border-4 border-indigo-50 shadow-md" alt="Avatar" />
             {user.isDriverVerified && (
               <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-1.5 rounded-full shadow-md border-2 border-white">
                  <BadgeCheck size={16} className="text-white" />
               </div>
             )}
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            {user.name}
            {user.isDriverVerified && <span className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">Motorista</span>}
          </h2>
          <p className="text-slate-500 text-sm mb-4">{user.email}</p>
          
          <div className="flex gap-4 w-full px-4">
             <div className="flex-1 bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Avaliação</p>
                <div className="flex items-center justify-center gap-1">
                   <Star size={14} className="text-amber-500 fill-amber-500" />
                   <span className="font-bold text-slate-800">{user.rating}</span>
                </div>
             </div>
             <div className="flex-1 bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Entregas</p>
                <span className="font-bold text-slate-800">{orders.length}</span>
             </div>
          </div>
       </div>

       {user.isDriverVerified && user.driverDetails && (
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Truck size={18} /> Dados de Parceiro</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
               <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-slate-400 font-bold uppercase mb-1">Veículo</p>
                  <p className="text-slate-800 font-semibold">{user.driverDetails.vehicleModel}</p>
               </div>
               <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-slate-400 font-bold uppercase mb-1">Placa</p>
                  <p className="text-slate-800 font-semibold uppercase">{user.driverDetails.vehiclePlate}</p>
               </div>
            </div>
         </div>
       )}

       <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <button className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-100">
             <div className="flex items-center gap-4">
                <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                   <CreditCard size={20} />
                </div>
                <span className="font-bold text-slate-700">Formas de Pagamento</span>
             </div>
             <ArrowRight size={18} className="text-slate-300" />
          </button>
          {!user.isDriverVerified && (
            <button 
              onClick={() => setActiveTab('driver_reg')}
              className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-100"
            >
              <div className="flex items-center gap-4">
                  <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                    <Truck size={20} />
                  </div>
                  <span className="font-bold text-slate-700">Seja um Motorista</span>
              </div>
              <ArrowRight size={18} className="text-slate-300" />
            </button>
          )}
          <button className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-100">
             <div className="flex items-center gap-4">
                <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
                   <ShieldCheck size={20} />
                </div>
                <span className="font-bold text-slate-700">Central de Segurança</span>
             </div>
             <ArrowRight size={18} className="text-slate-300" />
          </button>
          <button className="w-full p-5 flex items-center justify-between hover:bg-red-50 transition-colors text-red-500">
             <div className="flex items-center gap-4">
                <div className="bg-red-50 p-2 rounded-xl text-red-500">
                   <LogOut size={20} />
                </div>
                <span className="font-bold">Sair da Conta</span>
             </div>
          </button>
       </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col relative bg-slate-50 pb-20">
      {/* Top Status Bar */}
      <header className="px-6 pt-6 pb-4 flex justify-between items-center z-10 sticky top-0 bg-slate-50/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
           <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Truck size={18} className="text-white" />
           </div>
           <span className="font-black text-xl tracking-tighter text-indigo-950">LevaAí</span>
        </div>
        <div className="flex gap-2">
           <button className="p-2 bg-white rounded-full shadow-sm border border-slate-200">
              <Bell size={20} className="text-slate-600" />
           </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-6 pt-2">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'create' && renderCreateOrder()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'driver_reg' && renderDriverRegistration()}
      </main>

      {/* Modals */}
      {showSuccessModal && renderSuccessModal()}

      {/* Persistent Bottom Tab Bar */}
      {activeTab !== 'create' && activeTab !== 'driver_reg' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-between items-center z-50 max-w-md mx-auto">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'home' ? 'bg-indigo-50' : ''}`}>
               <Package size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Início</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'orders' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'orders' ? 'bg-indigo-50' : ''}`}>
               <History size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Pedidos</span>
          </button>

          {!isDriverMode && (
             <button 
               onClick={() => { setActiveTab('create'); }}
               className="bg-indigo-600 text-white p-4 rounded-full shadow-lg shadow-indigo-200 -mt-12 border-4 border-slate-50 active:scale-95 transition-all"
             >
               <PlusCircle size={28} />
             </button>
          )}

          <button 
            className="flex flex-col items-center gap-1 text-slate-400 transition-all opacity-40 cursor-not-allowed"
          >
            <div className="p-1">
               <Bell size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Avisos</span>
          </button>

          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <div className={`p-1 rounded-lg ${activeTab === 'profile' ? 'bg-indigo-50' : ''}`}>
               <UserIcon size={24} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Perfil</span>
          </button>
        </nav>
      )}

      {/* Global CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
      `}</style>
    </div>
  );
};

export default App;
