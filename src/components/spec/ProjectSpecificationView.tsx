import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Copy,
  Printer,
  Check,
  Search,
  BookOpen,
  ChevronRight,
  Shield,
  Building2,
  User,
  Fuel,
  Layers,
  Database,
  Lock,
  Compass,
  ArrowRight,
  ArrowLeft,
  Award,
  Sparkles,
} from 'lucide-react';

export const ProjectSpecificationView: React.FC = () => {
  const { setActiveView, isAuthenticated, setAuthScreen } = useApp();
  const [activeSection, setActiveSection] = useState<string>('sec-1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const sections = [
    { id: 'sec-1', number: '1.0', title: 'Project Title & Metadata' },
    { id: 'sec-2', number: '2.0', title: 'Executive Introduction' },
    { id: 'sec-3', number: '3.0', title: 'Problem Statement & Traditional Refueling Bottlenecks' },
    { id: 'sec-4', number: '4.0', title: 'Proposed Solution Architecture' },
    { id: 'sec-5', number: '5.0', title: 'Project Objectives & Measurable Goals' },
    { id: 'sec-6', number: '6.0', title: 'Scope of the System (In-Scope vs Out-of-Scope)' },
    { id: 'sec-7', number: '7.0', title: 'System Entities & Actor Roles' },
    { id: 'sec-8', number: '8.0', title: 'Detailed Feature Matrix' },
    { id: 'sec-9', number: '9.0', title: 'Admin Governance Module' },
    { id: 'sec-10', number: '10.0', title: 'Gas Station Fulfillment Module' },
    { id: 'sec-11', number: '11.0', title: 'User & Fleet Operations Module' },
    { id: 'sec-12', number: '12.0', title: 'System Workflow & Data Flow Diagrams (DFD 0/1)' },
    { id: 'sec-13', number: '13.0', title: 'Order State Machine & Lifecycle Rules' },
    { id: 'sec-14', number: '14.0', title: 'Inventory Management & Threshold Rules' },
    { id: 'sec-15', number: '15.0', title: 'Payment, Billing & Automated Refund Engine' },
    { id: 'sec-16', number: '16.0', title: 'In-App Notification & Alert Broadcasting' },
    { id: 'sec-17', number: '17.0', title: 'Reports & Analytical Intelligence' },
    { id: 'sec-18', number: '18.0', title: 'Database Schema & Data Dictionary (14 Tables)' },
    { id: 'sec-19', number: '19.0', title: 'Role-Based Access Control (RBAC) Matrix' },
    { id: 'sec-20', number: '20.0', title: 'Security Architecture & Anti-Tampering Rules' },
    { id: 'sec-21', number: '21.0', title: 'Expected Quantitative & Qualitative Benefits' },
    { id: 'sec-22', number: '22.0', title: 'Future Enhancements & Scalability Roadmap' },
  ];

  const handleCopyMarkdown = () => {
    const el = document.getElementById('spec-doc-content');
    if (el) {
      navigator.clipboard.writeText(el.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-16">
      
      {/* Left Sticky Navigation Menu (4 cols) */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sticky top-24 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">SRS Specification Index</h3>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-semibold border border-indigo-800">
              22 Sections
            </span>
          </div>

          {/* Return Button */}
          <button
            onClick={() => {
              if (isAuthenticated) {
                setActiveView('app');
              } else {
                setActiveView('app');
                setAuthScreen('landing');
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isAuthenticated ? 'Return to FuelFlow Dashboard' : 'Return to Brand Welcome Page'}</span>
          </button>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search specification topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied SRS!' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>
          </div>

          {/* Section List */}
          <div className="max-h-[58vh] overflow-y-auto space-y-1 pr-1 text-xs divide-y divide-slate-800/40">
            {sections
              .filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.number.includes(searchQuery))
              .map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveSection(s.id);
                    const el = document.getElementById(s.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full text-left py-2 px-2.5 rounded-lg flex items-center justify-between transition-colors ${
                    activeSection === s.id
                      ? 'bg-indigo-950/80 text-indigo-300 font-bold border border-indigo-800/80'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <span className="truncate">
                    <span className="font-mono text-slate-500 mr-1.5">{s.number}</span>
                    {s.title}
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Right Document Canvas (8 cols) */}
      <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl text-slate-200 space-y-12 leading-relaxed font-sans" id="spec-doc-content">
        
        {/* Document Header Banner */}
        <div className="border-b border-slate-800 pb-8 space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <Award className="w-3.5 h-3.5" />
            Software Requirements Specification (SRS) & Architecture Blueprint
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Online Fuel Delivery Management System
          </h1>
          <p className="text-sm text-slate-400 max-w-3xl">
            A Web-Based On-Demand Fuel Dispensing & Fleet Logistics Platform with Dynamic Station Routing, Central Price Governance, and Real-Time Inventory Control.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 font-mono">
            <span>Project Standard: IEEE 830 / ISO-IEC 25010</span>
            <span>Target Level: Final Year B.Tech / MCA / Master Capstone</span>
            <span>Version: 1.0 (Production Architecture)</span>
          </div>
        </div>

        {/* SECTION 1.0 */}
        <section id="sec-1" className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-indigo-400 font-mono">1.0</span> Project Title & Metadata
          </h2>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
            <p><strong>Project Title:</strong> Online Fuel Delivery Management System (FuelFlow)</p>
            <p><strong>Domain:</strong> Supply Chain, Logistics Automation, Smart City Infrastructure & Energy Dispensing</p>
            <p><strong>Technology Stack:</strong> React 19, TypeScript, Tailwind CSS, Node.js/Express, Dynamic Routing Algorithms (Haversine Geo-Spatial Optimization), Role-Based Access Control (RBAC)</p>
            <p><strong>Target Users:</strong> Commercial Fleet Operators (Taxis, Buses, Long-Haul Logistics), Industrial Generator Depots, Individual Motorists, Gas Station Franchisees, and Energy Regulatory Administrators.</p>
          </div>
        </section>

        {/* SECTION 2.0 */}
        <section id="sec-2" className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-indigo-400 font-mono">2.0</span> Executive Introduction
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The <strong>Online Fuel Delivery Management System</strong> is an enterprise web platform designed to eliminate the operational overhead, vehicle downtime, and fuel loss associated with traditional retail petrol pump refueling. By establishing an on-demand logistics bridge between certified gas station dealers and end customers, the system facilitates the direct, metered doorstep delivery of <strong>Unleaded Petrol, Ultra-Low Sulfur Diesel, and Biofuels</strong> to designated coordinates.
          </p>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The architecture strictly isolates <strong>Central Regulatory Pricing</strong> from retail gas station dealers. While gas station operators manage their assigned inventory and fulfill delivery orders via certified mobile bowsers, only the System Administrator maintains authority over benchmark prices, preventing arbitrary price manipulation and ensuring complete transactional transparency.
          </p>
        </section>

        {/* SECTION 3.0 */}
        <section id="sec-3" className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-indigo-400 font-mono">3.0</span> Problem Statement & Traditional Inefficiencies
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-slate-300">
            <p>In conventional refueling paradigms, vehicles must divert from their routes and queue at physical retail gas stations. For corporate fleet owners (taxi aggregates, intercity bus operators, and distribution logistics), this introduces severe operational bottlenecks:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400 text-xs">
              <li><strong>Dead Mileage & Fuel Wastage:</strong> Vehicles expend substantial fuel simply traveling to and from refueling stations.</li>
              <li><strong>Severe Fleet Downtime:</strong> Idling in peak-hour gas station lines delays schedule adherence, escalating commercial labor costs.</li>
              <li><strong>Fuel Pilferage & Inaccurate Metering:</strong> Manual driver cash disbursements and paper receipts lead to discrepancies, fraudulent expense claims, and unauthorized fuel diversion.</li>
              <li><strong>Price Inconsistency:</strong> Lack of centralized pricing transparency across different regional pump franchises results in unpredictable operating expenditures.</li>
            </ul>
          </div>
        </section>

        {/* SECTION 4.0 */}
        <section id="sec-4" className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-indigo-400 font-mono">4.0</span> Proposed Solution Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            The proposed system deploys an <strong>Automated Nearest-Station Routing Engine</strong> coupled with a Three-Tier Role-Based Portal.
          </p>
          
          {/* Architectural Diagram Box */}
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 space-y-3 overflow-x-auto">
            <div className="text-indigo-400 font-bold">// SYSTEM ARCHITECTURAL FLOW</div>
            <pre className="text-[11px] leading-relaxed text-slate-300">
{`+-----------------------+         +-------------------------------+
|  CUSTOMER / FLEET     | ------> |  CENTRAL ENGINE & ALGORITHM   |
|  - Select Fuel & Qty  |         |  1. Capture Lat/Lng GPS       |
|  - Pin Delivery Bay   |         |  2. Query Active Stations     |
|  - Digital Checkout   |         |  3. Validate Tank Inventory   |
+-----------------------+         |  4. Haversine Distance Calc   |
                                  |  5. Assign Nearest Depot      |
                                  +---------------+---------------+
                                                  |
                                                  v
+-----------------------+         +---------------+---------------+
|  ADMIN MASTER CONTROL | <====== |  ASSIGNED GAS STATION         |
|  - Sets Central Price |         |  - Accepts Order              |
|  - Global Inventory   |         |  - Dispenses into Bowser      |
|  - Audit & Refunds    |         |  - Dispatches Mobile Driver   |
+-----------------------+         +-------------------------------+`}
            </pre>
          </div>
        </section>

        {/* SECTION 5.0 */}
        <section id="sec-5" className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-indigo-400 font-mono">5.0</span> Project Objectives & Measurable Goals
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="font-bold text-emerald-400 block mb-1">1. Doorstep On-Demand Delivery</span>
              <p className="text-slate-400">Deliver certified Petrol/Diesel in calibrated mobile hazard bowsers to parked vehicle locations.</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="font-bold text-emerald-400 block mb-1">2. Centralized Anti-Gouging Pricing</span>
              <p className="text-slate-400">Ensure retail fuel prices are exclusively established by Admin, preventing pump dealer manipulation.</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="font-bold text-emerald-400 block mb-1">3. Automated Station Assignment</span>
              <p className="text-slate-400">Select the closest gas station containing sufficient stock (Quantity Requested &le; Available Inventory).</p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="font-bold text-emerald-400 block mb-1">4. Real-time Inventory Protection</span>
              <p className="text-slate-400">Instantly lock and deduct inventory on order confirmation; prevent negative tank balances.</p>
            </div>
          </div>
        </section>

        {/* SECTION 6.0 */}
        <section id="sec-6" className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-indigo-400 font-mono">6.0</span> Scope of the System
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/50 space-y-2">
              <h4 className="font-bold text-emerald-400 text-sm">In-Scope Modules</h4>
              <ul className="list-disc pl-4 space-y-1 text-slate-300">
                <li>End-to-end fuel ordering with quantity calculation.</li>
                <li>Haversine geo-distance station allocation logic.</li>
                <li>Station inventory tracking with Low/Critical alerts.</li>
                <li>Digital mock payment integration & immediate invoicing.</li>
                <li>Strict gas station pricing freeze & Admin price audit.</li>
                <li>In-app multi-channel event notification pipeline.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-rose-900/50 space-y-2">
              <h4 className="font-bold text-rose-400 text-sm">Out-of-Scope (Future Roadmapped)</h4>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                <li>IoT hardware flowmeter telemetry sensors.</li>
                <li>Physical hazardous material transport permits integration.</li>
                <li>Drone or autonomous fuel dispensing vehicles.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 7.0 */}
        <section id="sec-7" className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-indigo-400 font-mono">7.0</span> System Entities & Actor Roles
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-slate-300">
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <span className="font-bold text-rose-400">Entity 1: System Administrator (Super Admin)</span>
              <p className="text-slate-400 text-xs">Maintains ultimate authority over registered gas stations, user accounts, fuel catalog, centralized pricing, system-wide inventory surveillance, and audit trails.</p>
            </div>
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <span className="font-bold text-amber-400">Entity 2: Gas Station Operator (Franchisee / Depot)</span>
              <p className="text-slate-400 text-xs">Fulfills assigned orders, manages local tank stock, dispatches mobile bowsers with driver assignments, and can only cancel orders when inventory is insufficient.</p>
            </div>
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <span className="font-bold text-emerald-400">Entity 3: Customer / Fleet Operator</span>
              <p className="text-slate-400 text-xs">Places fuel delivery orders, manages depot addresses, executes payments, monitors bowser dispatch in real-time, accesses tax invoices, and submits star ratings.</p>
            </div>
          </div>
        </section>

        {/* SECTION 8.0 - 11.0: Detailed Modules */}
        <section id="sec-8" className="space-y-6 pt-4 border-t border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-indigo-400 font-mono">8.0 - 11.0</span> Detailed Functional Specifications
          </h2>
          
          {/* Admin Specs */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
            <h3 className="font-bold text-rose-400 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" /> 9.0 Admin Governance Specifications
            </h3>
            <ul className="list-disc pl-4 space-y-1.5 text-slate-300 leading-relaxed">
              <li><strong>Central Price Adjustment:</strong> Ability to alter fuel rates with mandatory justification reason; updates propagate instantaneously across all downstream order calculations.</li>
              <li><strong>Gas Station Commissioning:</strong> Add, edit, approve, or suspend gas station accounts and set geographic coverage radius (km).</li>
              <li><strong>Global Inventory Dashboard:</strong> Side-by-side surveillance of all station tanks with color-coded Low and Critical stock markers.</li>
              <li><strong>Audit Logging:</strong> Automatic creation of tamper-evident log records whenever prices, inventory, or order states are altered.</li>
            </ul>
          </div>

          {/* Station Specs */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
            <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4" /> 10.0 Gas Station Fulfillment Specifications
            </h3>
            <ul className="list-disc pl-4 space-y-1.5 text-slate-300 leading-relaxed">
              <li><strong>Order Pipeline:</strong> Transition orders through <code className="text-indigo-300">CONFIRMED &rarr; PROCESSING &rarr; OUT_FOR_DELIVERY &rarr; DELIVERED</code>.</li>
              <li><strong>Driver & Bowser Assignment:</strong> Input driver name, contact phone, and vehicle registration prior to dispatch.</li>
              <li><strong>Restricted Cancellation:</strong> Permitted to cancel an order ONLY when stock is insufficient. Requires mandatory explanation string.</li>
              <li><strong>Price Lock:</strong> Prohibited from editing fuel rates, discounts, or delivery surcharges.</li>
            </ul>
          </div>

          {/* User Specs */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
            <h3 className="font-bold text-emerald-400 text-sm flex items-center gap-2">
              <User className="w-4 h-4" /> 11.0 Customer & Fleet Ordering Specifications
            </h3>
            <ul className="list-disc pl-4 space-y-1.5 text-slate-300 leading-relaxed">
              <li><strong>Order Wizard:</strong> Select fuel grade, input quantity (with commercial presets up to 500L), select delivery coordinates, and view cost breakdown.</li>
              <li><strong>Live Auto-Routing Feedback:</strong> View which nearby gas station is auto-assigned based on proximity and tank availability.</li>
              <li><strong>Live Delivery Tracker:</strong> Interactive visual progression of the mobile refueling unit with estimated arrival countdown.</li>
              <li><strong>Tax Invoice Generator:</strong> Instant printable invoice with itemized fuel base cost, delivery fee, state tax, and transaction reference.</li>
            </ul>
          </div>
        </section>

        {/* SECTION 12.0 & 13.0 */}
        <section id="sec-12" className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-indigo-400 font-mono">12.0 & 13.0</span> System Workflow & Order State Machine
          </h2>
          
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 space-y-2 overflow-x-auto">
            <div className="text-emerald-400 font-bold">// ORDER STATE TRANSITION MATRIX</div>
            <pre className="text-[11px] text-slate-300">
{`[PENDING] --------> [CONFIRMED] --------> [PROCESSING] --------> [OUT_FOR_DELIVERY] --------> [DELIVERED]
   |                    |                    |                         |                          |
   | (User cancels)     | (User cancels)     | (Stock Deficit)         | (Refuel Completed)       v
   v                    v                    v                         v                  [INVOICE & RATING]
[CANCELLED]          [CANCELLED]          [CANCELLED]          [DELIVERED]
(Auto-Refund)        (Restore Stock &     (Restore Stock &
                      Auto-Refund)         Auto-Refund)`}
            </pre>
          </div>
        </section>

        {/* SECTION 14.0 & 15.0 */}
        <section id="sec-14" className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-indigo-400 font-mono">14.0 & 15.0</span> Inventory Rules & Billing Engine
          </h2>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-3 text-slate-300">
            <p><strong>Inventory Mathematical Constraint:</strong> <code className="text-amber-400">New_Stock = Current_Stock - Requested_Quantity</code> where <code className="text-emerald-400">Requested_Quantity &le; Current_Stock</code>. Negative stock transactions are hard-blocked by database constraints.</p>
            <p><strong>Billing Mathematical Formula:</strong></p>
            <div className="p-3 bg-slate-900 rounded-lg font-mono text-[11px] text-slate-200">
              Fuel_Cost = Quantity_Litres &times; Central_Price_Per_Litre<br />
              Delivery_Fee = Base_Fee ($5.00) + (Distance_Km &times; $0.75/km)<br />
              Tax_Amount = (Fuel_Cost + Delivery_Fee) &times; 12%<br />
              Grand_Total = Fuel_Cost + Delivery_Fee + Tax_Amount
            </div>
          </div>
        </section>

        {/* SECTION 18.0: Database Schema */}
        <section id="sec-18" className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-indigo-400 font-mono">18.0</span> Database Schema & Data Dictionary (14 Entities)
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Entity Name</th>
                  <th className="py-2.5 px-3">Primary Key</th>
                  <th className="py-2.5 px-3">Foreign Keys</th>
                  <th className="py-2.5 px-3">Key Attributes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 text-[11px]">
                <tr>
                  <td className="py-2 px-3 font-bold text-white">Users</td>
                  <td className="py-2 px-3 font-mono text-indigo-300">id</td>
                  <td className="py-2 px-3">-</td>
                  <td className="py-2 px-3">name, email, phone, role, user_type, status</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-white">GasStations</td>
                  <td className="py-2 px-3 font-mono text-indigo-300">id</td>
                  <td className="py-2 px-3">-</td>
                  <td className="py-2 px-3">name, manager, contact, lat, lng, coverage_km, status</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-white">FuelTypes</td>
                  <td className="py-2 px-3 font-mono text-indigo-300">id</td>
                  <td className="py-2 px-3">-</td>
                  <td className="py-2 px-3">code, name, octane_cetane, density, is_active</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-white">FuelPrices</td>
                  <td className="py-2 px-3 font-mono text-indigo-300">fuel_type_code</td>
                  <td className="py-2 px-3 font-mono text-slate-400">FuelTypes.code</td>
                  <td className="py-2 px-3">price_per_litre, tax_percent, base_delivery, updated_by</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-white">Inventory</td>
                  <td className="py-2 px-3 font-mono text-indigo-300">id</td>
                  <td className="py-2 px-3 font-mono text-slate-400">station_id, fuel_type_code</td>
                  <td className="py-2 px-3">available_litres, capacity, low_threshold, crit_threshold</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-white">Orders</td>
                  <td className="py-2 px-3 font-mono text-indigo-300">id</td>
                  <td className="py-2 px-3 font-mono text-slate-400">user_id, station_id, address_id</td>
                  <td className="py-2 px-3">quantity_litres, price_per_litre, fuel_cost, status, total</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-white">Payments</td>
                  <td className="py-2 px-3 font-mono text-indigo-300">id</td>
                  <td className="py-2 px-3 font-mono text-slate-400">order_id, user_id</td>
                  <td className="py-2 px-3">txn_id, amount, method, status, paid_at, refund_at</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold text-white">AuditLogs</td>
                  <td className="py-2 px-3 font-mono text-indigo-300">id</td>
                  <td className="py-2 px-3 font-mono text-slate-400">actor_id</td>
                  <td className="py-2 px-3">action, entity, details, ip_address, timestamp</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 19.0: RBAC Matrix */}
        <section id="sec-19" className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-indigo-400 font-mono">19.0</span> Role-Based Access Control (RBAC) Matrix
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Operation / Capability</th>
                  <th className="py-2.5 px-3 text-center">Admin</th>
                  <th className="py-2.5 px-3 text-center">Gas Station</th>
                  <th className="py-2.5 px-3 text-center">Customer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 text-[11px]">
                <tr>
                  <td className="py-2 px-3">Set Central Fuel Prices</td>
                  <td className="py-2 px-3 text-center text-emerald-400 font-bold">FULL</td>
                  <td className="py-2 px-3 text-center text-rose-500 font-bold">BLOCKED</td>
                  <td className="py-2 px-3 text-center text-rose-500 font-bold">BLOCKED</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Manage Station Inventory</td>
                  <td className="py-2 px-3 text-center text-emerald-400 font-bold">ALL STATIONS</td>
                  <td className="py-2 px-3 text-center text-amber-400 font-bold">OWN STATION</td>
                  <td className="py-2 px-3 text-center text-rose-500 font-bold">BLOCKED</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Update Order Status</td>
                  <td className="py-2 px-3 text-center text-emerald-400 font-bold">OVERRIDE</td>
                  <td className="py-2 px-3 text-center text-emerald-400 font-bold">ASSIGNED ONLY</td>
                  <td className="py-2 px-3 text-center text-rose-500 font-bold">BLOCKED</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Order Fuel & Make Payment</td>
                  <td className="py-2 px-3 text-center text-slate-500">-</td>
                  <td className="py-2 px-3 text-center text-slate-500">-</td>
                  <td className="py-2 px-3 text-center text-emerald-400 font-bold">FULL</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 21.0 & 22.0 */}
        <section id="sec-21" className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-indigo-400 font-mono">21.0 & 22.0</span> Benefits & Future Enhancements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <h4 className="font-bold text-emerald-400 text-sm">Key Project Benefits</h4>
              <ul className="list-disc pl-4 space-y-1 text-slate-300">
                <li>Eliminates up to 90% of vehicle refueling downtime for fleet operators.</li>
                <li>Stops pump-level price gouging through central administrative controls.</li>
                <li>100% digital auditability of fuel purchases with automated VAT tax invoices.</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <h4 className="font-bold text-indigo-400 text-sm">Future Roadmap</h4>
              <ul className="list-disc pl-4 space-y-1 text-slate-300">
                <li>Native iOS/Android Driver Mobile Application with turn-by-turn routing.</li>
                <li>AI-Powered Station Demand Prediction & Auto-Replenishment.</li>
                <li>Recurring monthly subscription models for corporate taxi fleets.</li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
