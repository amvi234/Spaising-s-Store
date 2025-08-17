import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { localStorageManager } from '../../../lib/utils';
import type { Product as PriceOptimized, CategoryOption } from './types';
import { useListProducts } from '../../../shared/api/product/product-api';
import { useNavigate } from 'react-router-dom';

// Constants.
const PRODUCT_CATEGORIES: CategoryOption[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'stationary', label: 'Stationary' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'books', label: 'Books' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'sports', label: 'Sports' },
  { value: 'other', label: 'Other' }
];

const formatCurrency = (value: string | number): string => `$${parseFloat(String(value) || '0').toFixed(2)}`;

// Component.
const PriceOptimized: React.FC = () => {

  // States.
  const [globalDemandForecastEnabled, setGlobalDemandForecastEnabled] = useState<boolean>(false);
  const [products, setProducts] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userName] = useState<any>(localStorageManager.getName());

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  // Hooks.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: productsResponse, isLoading: loading, isSuccess: successProductData, error: errorProductData } = useListProducts({
    category: selectedCategory,
    search: debouncedSearchTerm
  });

  // useEffects.
  useEffect(() => {
    if (successProductData && productsResponse) {
      setProducts(productsResponse);
    }
  }, [successProductData, errorProductData, productsResponse])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-teal-400">Price Optimization Tool</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Welcome, {userName}</span>
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">{userName.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Header */}
      <div className="bg-black px-6 py-3 border-t border-gray-700">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            {/* <button className="text-gray-400 hover:text-white transition-colors" onClick={() => navigate('/product')}>← Back</button> */}
            <h2 className="text-xl font-semibold">Pricing Optimization</h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Demand Forecast Toggle */}
            <div className="flex items-center space-x-3 px-3 py-2 rounded-md bg-black">
              <button
                type="button"
                onClick={() => setGlobalDemandForecastEnabled(!globalDemandForecastEnabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${globalDemandForecastEnabled ? 'bg-teal-500' : 'bg-gray-600'
                  }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${globalDemandForecastEnabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                />
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white">With Demand Forecast</span>
              </div>

            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 " />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black text-white pl-10 pr-4 py-2 rounded-md border border-teal-600 focus:outline-none transition-colors w-64"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-black text-white px-3 py-2 rounded-md border  border-teal-600 focus:outline-none transition-colors"
            >
              {PRODUCT_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            {/* Filter Button */}
            <button className="border border-teal-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors">
              <span>∀</span>
              <span>Filter</span>
            </button>



          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-400"></div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left p-4 font-medium">

                    </th>
                    <th className="text-left p-4 font-medium">Product Name</th>
                    <th className="text-left p-4 font-medium">Product Category</th>
                    <th className="text-left p-4 font-medium">Description</th>
                    <th className="text-left p-4 font-medium">Cost Price</th>
                    <th className="text-left p-4 font-medium">Selling Price</th>
                    <th className="text-left p-4 font-medium">Optimized Price</th>
                  </tr>
                </thead>
                <tbody>
                  {products === undefined ? (
                    <tr>
                      <td colSpan={9} className="text-center p-8 text-gray-400">
                        {searchTerm || selectedCategory !== 'all' ?
                          'No products match your search criteria.' :
                          'No products found. Add your first product to get started.'}
                      </td>
                    </tr>
                  ) : (
                    products.map((product: PriceOptimized, index: number) => (
                      <tr key={product.id} className={`border-r border-gray-800 bg-white hover:bg-gray-750 transition-colors ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-825'}`}>
                        <td className="p-4">

                        </td>
                        <td className="p-4 text-gray-800 border-r border-gray-800 font-medium">{product.name}</td>
                        <td className="p-4 text-gray-800 border-r border-gray-800 capitalize">{product.category}</td>

                        <td className="p-4 max-w-xs border-r border-gray-800">
                          <div className="truncate text-gray-800 " title={product.description}>
                            {product.description || 'No description'}
                          </div>
                        </td>
                        <td className="p-4 text-gray-800 border-r border-gray-800">{formatCurrency(product.cost_price)}</td>
                        <td className="p-4 text-gray-800 border-r border-gray-800">{formatCurrency(product.selling_price)}</td>
                        <td className="p-4 text-green-800 border-r border-gray-800">
                          {product.optimized_price ? formatCurrency(product.optimized_price) : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {products !== undefined && (
              <div className="bg-black px-6 py-3 text-sm text-gray-300 flex justify-end">
                <div className="flex items-center space-x-3 px-3 py-2 rounded-md ">
                  {/* Demand Forecast Button */}
                  <button
                    onClick={() => { }}
                    className="border border-teal-500 bg-black hover:bg-teal-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors font-medium"
                  >
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={() => { }}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors font-medium"
                  >
                    <span>Save</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceOptimized;