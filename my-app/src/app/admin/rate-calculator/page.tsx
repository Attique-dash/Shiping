"use client";

import { useState, useEffect } from "react";
import { 
  DollarSign, 
  Package, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  Calculator,
  Globe,
  Weight
} from "lucide-react";

type PricingRule = {
  id: string;
  name: string;
  origin: string;
  destination: string;
  weightMin: number;
  weightMax: number;
  baseRate: number;
  perKgRate: number;
  currency: string;
  active: boolean;
};

export default function RateCalculatorPage() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [editing, setEditing] = useState<PricingRule | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Calculator state
  const [calcWeight, setCalcWeight] = useState("");
  const [calcOrigin, setCalcOrigin] = useState("");
  const [calcDest, setCalcDest] = useState("");
  const [calcResult, setCalcResult] = useState<number | null>(null);

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    try {
      const res = await fetch("/api/admin/pricing-rules");
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function calculateRate() {
    const weight = parseFloat(calcWeight);
    if (!weight || !calcOrigin || !calcDest) {
      alert("Please enter weight, origin, and destination");
      return;
    }

    // Find matching rule
    const matchingRule = rules.find(r => 
      r.active &&
      r.origin.toLowerCase() === calcOrigin.toLowerCase() &&
      r.destination.toLowerCase() === calcDest.toLowerCase() &&
      weight >= r.weightMin &&
      weight <= r.weightMax
    );

    if (matchingRule) {
      const cost = matchingRule.baseRate + (weight * matchingRule.perKgRate);
      setCalcResult(cost);
    } else {
      alert("No pricing rule found for these parameters");
      setCalcResult(null);
    }
  }

  async function saveRule(rule: Partial<PricingRule>) {
    try {
      const res = await fetch("/api/admin/pricing-rules", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rule)
      });

      if (res.ok) {
        await loadRules();
        setShowForm(false);
        setEditing(null);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteRule(id: string) {
    if (!confirm("Delete this pricing rule?")) return;
    
    try {
      const res = await fetch(`/api/admin/pricing-rules?id=${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        await loadRules();
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0f4d8a] to-[#E67919] bg-clip-text text-transparent">
              Rate Calculator
            </h1>
            <p className="text-slate-600 mt-1">Manage shipping rates and calculate costs</p>
          </div>
          
          <button 
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#0f4d8a] to-[#E67919] text-white font-medium hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Pricing Rule
          </button>
        </div>

        {/* Quick Calculator */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="w-6 h-6 text-[#0f4d8a]" />
            <h2 className="text-xl font-semibold text-slate-800">Quick Rate Calculator</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Weight (kg)</label>
              <input
                type="number"
                value={calcWeight}
                onChange={(e) => setCalcWeight(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d8a]"
                placeholder="5.5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Origin</label>
              <input
                type="text"
                value={calcOrigin}
                onChange={(e) => setCalcOrigin(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d8a]"
                placeholder="USA"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Destination</label>
              <input
                type="text"
                value={calcDest}
                onChange={(e) => setCalcDest(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f4d8a]"
                placeholder="Pakistan"
              />
            </div>
            
            <div className="flex items-end">
              <button 
                onClick={calculateRate}
                className="w-full px-4 py-2 rounded-lg bg-[#E67919] text-white font-medium hover:bg-[#d66f15] transition-colors"
              >
                Calculate
              </button>
            </div>
          </div>
          
          {calcResult !== null && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-green-700 font-medium">Estimated Cost:</span>
                <span className="text-2xl font-bold text-green-600">${calcResult.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Rules List */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Pricing Rules</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Weight Range</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Base Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Per Kg</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{rule.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {rule.origin} → {rule.destination}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {rule.weightMin} - {rule.weightMax} kg
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      ${rule.baseRate}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                      ${rule.perKgRate}/kg
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rule.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditing(rule);
                          setShowForm(true);
                        }}
                        className="inline-flex items-center px-3 py-1 rounded-lg border border-[#0f4d8a] text-[#0f4d8a] hover:bg-[#0f4d8a] hover:text-white transition-colors"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="inline-flex items-center px-3 py-1 rounded-lg border border-red-300 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal - Implementation would go here */}
    </div>
  );
}