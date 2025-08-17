import React, { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2, Plus, Search, X, AlertCircle, CheckCircle } from 'lucide-react';
import { localStorageManager } from '../../../lib/utils';
import type { Product, FormData, Notification, CategoryOption } from './types';
import { useCreateProduct, useDeleteProduct, useListProducts, useUpdateProduct } from '../../../shared/api/product/product-api';
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
const formatNumber = (value: number): string => new Intl.NumberFormat().format(value || 0);

// Component.
const Product: React.FC = () => {

    // States.
    const [selectedProductsForForecast, setSelectedProductsForForecast] = useState<string[]>([]);
    const [products, setProducts] = useState<any>([]);
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [showViewModal, setShowViewModal] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [notification, setNotification] = useState<Notification | null>(null);
    const [userName] = useState<any>(localStorageManager.getName());
    const [showOrderModal, setShowOrderModal] = useState(false);
const [orderFormData, setOrderFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    notes: ''
});
const [orderErrors, setOrderErrors] = useState({});

    const [formData, setFormData] = useState<FormData>({
        name: '',
        category: 'stationary',
        cost_price: '',
        selling_price: '',
        description: '',
        stock_available: '',
        units_sold: '',
        demand_forecast: '',
        optimized_price: '',
    });

    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // UseEffects.
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // update the useListProducts call to use debouncedSearchTerm:
    const { data: productsResponse, isLoading: loading, isSuccess: successProductData, error: errorProductData } = useListProducts({
        category: selectedCategory,
        search: debouncedSearchTerm
    });

    const createProductMutation = useCreateProduct();
    const updateProductMutation = useUpdateProduct();
    const deleteProductMutation = useDeleteProduct();
    const navigate = useNavigate();

    // useEffects.
    useEffect(() => {
        if (successProductData && productsResponse) {
            setProducts(productsResponse);
        }
    }, [successProductData, errorProductData, productsResponse])

    // Handlers. 
    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };
    const handlePlaceOrder = () => {
        if (selectedProductsForForecast.length === 0) {
            showNotification('Please select at least one product to place an order', 'error');
            return;
        }
        setShowOrderModal(true);
    };
    
    const validateOrderForm = () => {
        const newErrors = {};
        
        
        
        setOrderErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleCreateOrderFromProducts = async () => {
        if (!validateOrderForm()) return;
        
        try {
            const selectedProducts = products.filter((product: Product) => 
                selectedProductsForForecast.includes(product.id)
            );
            
            const orderData = {
                customer_name: orderFormData.customer_name,
                customer_email: orderFormData.customer_email,
                customer_phone: orderFormData.customer_phone,
                customer_address: orderFormData.customer_address,
                notes: orderFormData.notes,
                items: selectedProducts.map((product: Product) => ({
                    product_id: product.id,
                    quantity: 1 // Default quantity, user can modify later
                }))
            };
            
            // Here you would call your order creation API
            console.log('Creating order with data:', orderData);
            
            // For now, just show success and navigate
            setShowOrderModal(false);
            setOrderFormData({
                customer_name: '',
                customer_email: '',
                customer_phone: '',
                customer_address: '',
                notes: ''
            });
            setSelectedProductsForForecast([]);
            showNotification('Order created successfully!');
            
            // Navigate to orders page with the new order data
            navigate('/order', { state: { newOrderData: orderData } });
            
        } catch (error) {
            showNotification('Failed to create order', 'error');
        }
    };
    
    const resetOrderForm = () => {
        setOrderFormData({
            customer_name: '',
            customer_email: '',
            customer_phone: '',
            customer_address: '',
            notes: ''
        });
        setOrderErrors({});
    };
    
    const renderOrderFormField = (
        label: any,
        name: any,
        type = 'text',
        placeholder = '',
        required = false
    ) => (
        <div>
            <label className="block text-sm font-medium mb-2">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            {/* {type === 'textarea' ? (
                <textarea
                    value={orderFormData[name]}
                    onChange={(e) => setOrderFormData(prev => ({ ...prev, [name]: e.target.value }))}
                    placeholder={placeholder}
                    rows={3}
                    className={`w-full bg-gray-700 text-white px-3 py-2 rounded-md border focus:outline-none transition-colors resize-none ${
                        orderErrors[name] ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-red-400'
                    }`}
                />
            ) : (
                <input
                    type={type}
                    value={orderFormData[name]}
                    onChange={(e) => setOrderFormData(prev => ({ ...prev, [name]: e.target.value }))}
                    placeholder={placeholder}
                    className={`w-full bg-gray-700 text-white px-3 py-2 rounded-md border focus:outline-none transition-colors ${
                        orderErrors[name] ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-red-400'
                    }`}
                />
            )} */}

        </div>
    );
    const validateForm = (): boolean => {
        const newErrors: Partial<FormData> = {};

        if (!formData.name.trim()) newErrors.name = 'Product name is required';
        if (!formData.cost_price || parseFloat(formData.cost_price) <= 0) {
            newErrors.cost_price = 'Valid cost price is required';
        }
        if (!formData.selling_price || parseFloat(formData.selling_price) <= 0) {
            newErrors.selling_price = 'Valid selling price is required';
        }
        if (parseFloat(formData.selling_price) <= parseFloat(formData.cost_price)) {
            newErrors.selling_price = 'Selling price must be greater than cost price';
        }
        if (formData.stock_available && parseInt(formData.stock_available) < 0) {
            newErrors.stock_available = 'Stock cannot be negative';
        }
        if (formData.units_sold && parseInt(formData.units_sold) < 0) {
            newErrors.units_sold = 'Units sold cannot be negative';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: 'stationary',
            cost_price: '',
            selling_price: '',
            description: '',
            stock_available: '',
            units_sold: '',
            demand_forecast: '',
            optimized_price: ''
        });
        setErrors({});
    };


    const handleAddProduct = async () => {
        if (!validateForm()) return;

        try {
            let productData: any = {
                name: formData.name,
                category: formData.category,
                cost_price: formData.cost_price,
                selling_price: formData.selling_price,
                description: formData.description,
                stock_available: parseInt(formData.stock_available) || 0,
                units_sold: parseInt(formData.units_sold) || 0,
            };

            // Calculate demand forecast and optimized price if enabled
            
            await createProductMutation.mutateAsync(productData);

            setShowAddModal(false);
            resetForm();
            showNotification('Product added successfully!');
        } catch (error) {
            showNotification('Failed to add product', 'error');
        }
    };

    const handleProductSelection = (productId: string) => {
        setSelectedProductsForForecast(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };


    

    const handleEditProduct = async () => {
        if (!validateForm() || !selectedProduct) return;

        try {
            let productData: any = {
                id: selectedProduct.id,
                name: formData.name,
                category: formData.category,
                cost_price: formData.cost_price,
                selling_price: formData.selling_price,
                description: formData.description,
                stock_available: parseInt(formData.stock_available) || 0,
                units_sold: parseInt(formData.units_sold) || 0,
            };



            await updateProductMutation.mutateAsync(productData);

            setShowEditModal(false);
            resetForm();
            setSelectedProduct(null);
            showNotification('Product updated successfully!');
        } catch (error) {
            showNotification('Failed to update product', 'error');
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProductMutation.mutateAsync({ productId: id });
                showNotification('Product deleted successfully!');
            } catch (error) {
                showNotification('Failed to delete product', 'error');
            }
        }
    };

    const handleViewProduct = (product: Product) => {
        setSelectedProduct(product);
        setShowViewModal(true);
    };

    const handleEditClick = (product: Product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            category: product.category,
            cost_price: product.cost_price,
            selling_price: product.selling_price,
            description: product.description || '',
            stock_available: product.stock_available.toString(),
            units_sold: product.units_sold.toString(),
            demand_forecast: product.demand_forecast?.toString() || '',
            optimized_price: product.optimized_price?.toString() || ''
        });
        setShowEditModal(true);
    };


    
    
    const renderFormField = (
        label: string,
        name: keyof FormData,
        type: string = 'text',
        placeholder: string = '',
        required: boolean = false,
        options: CategoryOption[] | null = null
    ) => (
        <div>
            <label className="block text-sm font-medium mb-2">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            {options ? (
                <select
                    value={formData[name]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [name]: e.target.value }))}
                    className={`w-full bg-gray-700 text-white px-3 py-2 rounded-md border focus:outline-none transition-colors ${errors[name] ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-red-400'
                        }`}
                >
                    {options.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            ) : type === 'textarea' ? (
                <textarea
                    value={formData[name]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [name]: e.target.value }))}
                    placeholder={placeholder}
                    rows={3}
                    className={`w-full bg-gray-700 text-white px-3 py-2 rounded-md border focus:outline-none transition-colors resize-none ${errors[name] ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-red-400'
                        }`}
                />
            ) : (
                <input
                    type={type}
                    value={formData[name]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [name]: e.target.value }))}
                    placeholder={placeholder}
                    step={type === 'number' ? '0.01' : undefined}
                    min={type === 'number' ? '0' : undefined}
                    className={`w-full bg-gray-700 text-white px-3 py-2 rounded-md border focus:outline-none transition-colors ${errors[name] ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-red-400'
                        }`}
                />
            )}
            {errors[name] && (
                <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors[name]}
                </p>
            )}
        </div>
    );
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg flex items-center space-x-2 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                    {notification.type === 'success' ?
                        <CheckCircle className="w-5 h-5" /> :
                        <AlertCircle className="w-5 h-5" />
                    }
                    <span>{notification.message}</span>
                </div>
            )}

            {/* Header */}
            <div className="bg-gray-800 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-2xl font-bold text-red-400">Spaising's store</h1>
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
                        <button className="text-gray-400 hover:text-white transition-colors" onClick={() => navigate('/order')}>← Orders</button>
                        <h2 className="text-xl font-semibold">Product Catalog</h2>
                    </div>

                    <div className="flex items-center space-x-4">

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 " />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-black text-white pl-10 pr-4 py-2 rounded-md border border-red-600 focus:outline-none transition-colors w-64"
                            />
                        </div>

                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-black text-white px-3 py-2 rounded-md border  border-red-600 focus:outline-none transition-colors"
                        >
                            {PRODUCT_CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>

                        {/* Filter Button */}
                        <button className="border border-red-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors">
                            <span>∀</span>
                            <span>Filter</span>
                        </button>

                        {/* Add New Products Button */}
                        <button
                            onClick={() => {
                                setShowAddModal(true);
                            }}
                            className="bg-red-400 hover:bg-red-500 text-black px-4 py-2 rounded-md flex items-center space-x-2 transition-colors font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add New Products</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-400"></div>
                    </div>
                ) : (
                    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="text-left p-4 font-medium">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedProductsForForecast(products.map((p: { id: any; }) => p.id));
                                                    } else {
                                                        setSelectedProductsForForecast([]);
                                                    }
                                                }}
                                                checked={selectedProductsForForecast.length === products.length && products.length > 0}
                                                className="rounded bg-gray-700 text-white border border-gray-600 checked:bg-red-400 checked:border-red-500"
                                            />
                                        </th>
                                        <th className="text-left p-4 font-medium">Product Name</th>
                                        <th className="text-left p-4 font-medium">Category</th>
                                        <th className="text-left p-4 font-medium">Cost Price</th>
                                        <th className="text-left p-4 font-medium">Selling Price</th>
                                        <th className="text-left p-4 font-medium">Description</th>
                                        <th className="text-left p-4 font-medium">Stock</th>
                                        <th className="text-left p-4 font-medium">Units Sold</th>
                                        <th className="text-left p-4 font-medium">Actions</th>
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
                                        products.map((product: Product, index: number) => (
                                            <tr key={product.id} className={`border-r border-gray-800 bg-white hover:bg-gray-750 transition-colors ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-825'}`}>
                                                <td className="p-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedProductsForForecast.includes(product.id)}
                                                        onChange={() => handleProductSelection(product.id)}
                                                        className="rounded bg-gray-700 text-white border border-gray-600 checked:bg-red-400"
                                                    />
                                                </td>
                                                <td className="p-4 text-gray-800 border-r border-gray-800 font-medium">{product.name}</td>
                                                <td className="p-4 text-gray-800 border-r border-gray-800 capitalize">{product.category}</td>
                                                <td className="p-4 text-gray-800 border-r border-gray-800">{formatCurrency(product.cost_price)}</td>
                                                <td className="p-4 text-gray-800 border-r border-gray-800">{formatCurrency(product.selling_price)}</td>

                                                <td className="p-4 max-w-xs border-r border-gray-800">
                                                    <div className="truncate text-gray-800 " title={product.description}>
                                                        {product.description || 'No description'}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-800 border-r border-gray-800">{formatNumber(product.stock_available)}</td>
                                                <td className="p-4 text-gray-800 border-r border-gray-800">{formatNumber(product.units_sold)}</td>
                                               
                                                <td className="p-4">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleViewProduct(product)}
                                                            className="text-black hover:text-blue-300 transition-colors"
                                                            title="View Product"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditClick(product)}
                                                            className="text-black hover:text-yellow-300 transition-colors"
                                                            title="Edit Product"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(product.id)}
                                                            className="text-red-400 hover:text-red-300 transition-colors"
                                                            title="Delete Product"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
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
                                    <button
                                        onClick={() => { }}
                                        className="border border-red-500 bg-black hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors font-medium"
                                    >
                                        <span>Cancel</span>
                                    </button>
                                    <button
                                        onClick={() => { }}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors font-medium"
                                    >
                                        <span>Place Order</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            

            {/* Add Product Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold">Add New Product</h3>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    resetForm();
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderFormField('Product Name', 'name', 'text', 'Enter product name', true)}
                            {renderFormField('Category', 'category', 'select', '', true, PRODUCT_CATEGORIES.slice(1))}
                            {renderFormField('Cost Price', 'cost_price', 'number', '0.00', true)}
                            {renderFormField('Selling Price', 'selling_price', 'number', '0.00', true)}
                        </div>
                        <div className="mt-6 mb-6">
                            {renderFormField('Description', 'description', 'textarea', 'Enter product description')}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderFormField('Stock Available', 'stock_available', 'number', '0')}
                            {renderFormField('Units Sold', 'units_sold', 'number', '0')}
                        </div>

                        <div className="flex justify-end space-x-4 mt-8">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    resetForm();
                                }}
                                className="px-6 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddProduct}
                                disabled={createProductMutation.isPending}
                                className="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-700 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                            >
                                {createProductMutation.isPending ? 'Adding...' : 'Add Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {showEditModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold">Edit Product</h3>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    resetForm();
                                    setSelectedProduct(null);
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderFormField('Product Name', 'name', 'text', 'Enter product name', true)}
                            {renderFormField('Category', 'category', 'select', '', true, PRODUCT_CATEGORIES.slice(1))}
                            {renderFormField('Cost Price', 'cost_price', 'number', '0.00', true)}
                            {renderFormField('Selling Price', 'selling_price', 'number', '0.00', true)}
                            {renderFormField('Stock Available', 'stock_available', 'number', '0')}
                            {renderFormField('Units Sold', 'units_sold', 'number', '0')}
                        </div>

                        <div className="mt-6">
                            {renderFormField('Description', 'description', 'textarea', 'Enter product description')}
                        </div>

                        <div className="flex justify-end space-x-4 mt-8">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    resetForm();
                                    setSelectedProduct(null);
                                }}
                                className="px-6 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditProduct}
                                disabled={updateProductMutation.isPending}
                                className="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-700 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                            >
                                {updateProductMutation.isPending ? 'Updating...' : 'Update Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Product Modal */}
            {showViewModal && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold">Product Details</h3>
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setSelectedProduct(null);
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Product Name</label>
                                    <p className="text-white">{selectedProduct.name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                                    <p className="text-white capitalize">{selectedProduct.category}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Cost Price</label>
                                    <p className="text-green-400 font-semibold">{formatCurrency(selectedProduct.cost_price)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Selling Price</label>
                                    <p className="text-blue-400 font-semibold">{formatCurrency(selectedProduct.selling_price)}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Optimized Price</label>
                                <p className="text-purple-400 font-semibold">
                                    {selectedProduct.optimized_price ? formatCurrency(selectedProduct.optimized_price) : '-'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Stock Available</label>
                                    <p className="text-white">{formatNumber(selectedProduct.stock_available)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Units Sold</label>
                                    <p className="text-white">{formatNumber(selectedProduct.units_sold)}</p>
                                </div>
                            </div>
                            


                            {selectedProduct.description && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                    <p className="text-white">{selectedProduct.description}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end mt-8">
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setSelectedProduct(null);
                                }}
                                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Product;