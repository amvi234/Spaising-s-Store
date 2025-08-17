import React, { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2, Plus, Search, X, AlertCircle, CheckCircle, Package, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Types
interface OrderItem {
    id: string;
    product: string;
    product_name: string;
    product_category: string;
    quantity: number;
    unit_price: string;
    total_price: string;
}

interface Order {
    id: string;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    status: string;
    total_amount: string;
    notes: string;
    items: OrderItem[];
    items_count: number;
    created_at: string;
    updated_at: string;
}

interface OrderFormData {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    notes: string;
    items: { product_id: string; quantity: number; product_name?: string }[];
}

interface Notification {
    message: string;
    type: 'success' | 'error';
}

// Constants
const ORDER_STATUSES = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
];

const STATUS_COLORS = {
    pending: 'bg-yellow-600',
    confirmed: 'bg-blue-600',
    processing: 'bg-purple-600',
    shipped: 'bg-orange-600',
    delivered: 'bg-green-600',
    cancelled: 'bg-red-600'
};

const formatCurrency = (value: string | number): string => `$${parseFloat(String(value) || '0').toFixed(2)}`;
const formatNumber = (value: number): string => new Intl.NumberFormat().format(value || 0);
const formatDate = (dateString: string): string => new Date(dateString).toLocaleDateString();

// Component
const Order: React.FC = () => {
    // States
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [showViewModal, setShowViewModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [notification, setNotification] = useState<Notification | null>(null);
    const [selectedProducts] = useState<any[]>([]); // This would come from props or context

    const [formData, setFormData] = useState<OrderFormData>({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        customer_address: '',
        notes: '',
        items: []
    });

    const [errors, setErrors] = useState<Partial<OrderFormData>>({});
    const navigate = useNavigate();

    // Mock data for demonstration
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            const mockOrders: Order[] = [
                {
                    id: '1',
                    order_number: 'ORD-20250817-1001',
                    customer_name: 'John Doe',
                    customer_email: 'john@example.com',
                    customer_phone: '+1-555-0123',
                    customer_address: '123 Main St, City, State 12345',
                    status: 'pending',
                    total_amount: '299.99',
                    notes: 'Rush delivery requested',
                    items: [
                        {
                            id: '1',
                            product: 'prod-1',
                            product_name: 'Wireless Headphones',
                            product_category: 'electronics',
                            quantity: 2,
                            unit_price: '149.99',
                            total_price: '299.98'
                        }
                    ],
                    items_count: 1,
                    created_at: '2025-08-17T10:30:00Z',
                    updated_at: '2025-08-17T10:30:00Z'
                },
                {
                    id: '2',
                    order_number: 'ORD-20250817-1002',
                    customer_name: 'Jane Smith',
                    customer_email: 'jane@example.com',
                    customer_phone: '+1-555-0124',
                    customer_address: '456 Oak Ave, City, State 12346',
                    status: 'confirmed',
                    total_amount: '89.97',
                    notes: '',
                    items: [
                        {
                            id: '2',
                            product: 'prod-2',
                            product_name: 'Notebook Set',
                            product_category: 'stationary',
                            quantity: 3,
                            unit_price: '29.99',
                            total_price: '89.97'
                        }
                    ],
                    items_count: 1,
                    created_at: '2025-08-17T09:15:00Z',
                    updated_at: '2025-08-17T11:45:00Z'
                }
            ];
            setOrders(mockOrders);
            setLoading(false);
        }, 1000);
    }, []);

    // Initialize form with selected products from Product component
    useEffect(() => {
        if (selectedProducts.length > 0) {
            const items = selectedProducts.map(product => ({
                product_id: product.id,
                quantity: 1,
                product_name: product.name
            }));
            setFormData(prev => ({ ...prev, items }));
        }
    }, [selectedProducts]);

    // Handlers
    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<OrderFormData> = {};

        if (!formData.customer_name.trim()) newErrors.customer_name = 'Customer name is required';
        if (!formData.customer_email.trim()) newErrors.customer_email = 'Customer email is required';
        if (!formData.customer_address.trim()) newErrors.customer_address = 'Customer address is required';
        // if (!formData.items.length) newErrors.items = 'At least one item is required';

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.customer_email && !emailRegex.test(formData.customer_email)) {
            newErrors.customer_email = 'Valid email is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            customer_name: '',
            customer_email: '',
            customer_phone: '',
            customer_address: '',
            notes: '',
            items: []
        });
        setErrors({});
    };

    const handleCreateOrder = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const newOrder: Order = {
                id: String(Date.now()),
                order_number: `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 9000) + 1000}`,
                ...formData,
                status: 'pending',
                total_amount: '199.99', // Would be calculated
                items: formData.items.map((item, index) => ({
                    id: String(Date.now() + index),
                    product: item.product_id,
                    product_name: item.product_name || 'Unknown Product',
                    product_category: 'unknown',
                    quantity: item.quantity,
                    unit_price: '99.99',
                    total_price: String(item.quantity * 99.99)
                })),
                items_count: formData.items.length,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            setOrders(prev => [newOrder, ...prev]);
            setShowCreateModal(false);
            resetForm();
            showNotification('Order created successfully!');
        } catch (error) {
            showNotification('Failed to create order', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            setOrders(prev => prev.map(order => 
                order.id === orderId 
                    ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
                    : order
            ));
            showNotification('Order status updated successfully!');
        } catch (error) {
            showNotification('Failed to update order status', 'error');
        }
    };

    const handleDeleteOrder = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            try {
                setOrders(prev => prev.filter(order => order.id !== id));
                showNotification('Order deleted successfully!');
            } catch (error) {
                showNotification('Failed to delete order', 'error');
            }
        }
    };

    const handleViewOrder = (order: Order) => {
        setSelectedOrder(order);
        setShowViewModal(true);
    };

    const handleEditOrder = (order: Order) => {
        setSelectedOrder(order);
        setFormData({
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            customer_phone: order.customer_phone,
            customer_address: order.customer_address,
            notes: order.notes,
            items: order.items.map(item => ({
                product_id: item.product,
                quantity: item.quantity,
                product_name: item.product_name
            }))
        });
        setShowEditModal(true);
    };

    const handleUpdateQuantity = (index: number, quantity: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) => 
                i === index ? { ...item, quantity } : item
            )
        }));
    };

    const handleRemoveItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    // Filter orders
    const filteredOrders = orders.filter(order => {
        const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
        const matchesSearch = searchTerm === '' || 
            order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const renderFormField = (
        label: string,
        name: keyof OrderFormData,
        type: string = 'text',
        placeholder: string = '',
        required: boolean = false
    ) => (
        <div>
            <label className="block text-sm font-medium mb-2">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            {type === 'textarea' ? (
                <textarea
                    value={formData[name] as string}
                    onChange={(e) => setFormData(prev => ({ ...prev, [name]: e.target.value }))}
                    placeholder={placeholder}
                    rows={3}
                    className={`w-full bg-gray-700 text-white px-3 py-2 rounded-md border focus:outline-none transition-colors resize-none ${
                        errors[name] ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-red-400'
                    }`}
                />
            ) : (
                <input
                    type={type}
                    value={formData[name] as string}
                    onChange={(e) => setFormData(prev => ({ ...prev, [name]: e.target.value }))}
                    placeholder={placeholder}
                    className={`w-full bg-gray-700 text-white px-3 py-2 rounded-md border focus:outline-none transition-colors ${
                        errors[name] ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-red-400'
                    }`}
                />
            )}
            {errors[name] && (
                <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {/* {errors[name]} */}
                </p>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg flex items-center space-x-2 ${
                    notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
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
                        <h1 className="text-2xl font-bold text-red-400">Spaising's Orders</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-300">Welcome, Admin</span>
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">A</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub Header */}
            <div className="bg-black px-6 py-3 border-t border-gray-700">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center space-x-4">
                        <button 
                            className="text-gray-400 hover:text-white transition-colors" 
                            onClick={() => navigate('/product')}
                        >
                            ← Products
                        </button>
                        <h2 className="text-xl font-semibold">Order Management</h2>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-black text-white pl-10 pr-4 py-2 rounded-md border border-red-600 focus:outline-none transition-colors w-64"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="bg-black text-white px-3 py-2 rounded-md border border-red-600 focus:outline-none transition-colors"
                        >
                            {ORDER_STATUSES.map(status => (
                                <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                        </select>

                        {/* Create Order Button */}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-red-400 hover:bg-red-500 text-black px-4 py-2 rounded-md flex items-center space-x-2 transition-colors font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create Order</span>
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
                                        <th className="text-left p-4 font-medium">Order #</th>
                                        <th className="text-left p-4 font-medium">Customer</th>
                                        <th className="text-left p-4 font-medium">Email</th>
                                        <th className="text-left p-4 font-medium">Items</th>
                                        <th className="text-left p-4 font-medium">Total</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-left p-4 font-medium">Created</th>
                                        <th className="text-left p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center p-8 text-gray-400">
                                                {searchTerm || selectedStatus !== 'all' ?
                                                    'No orders match your search criteria.' :
                                                    'No orders found. Create your first order to get started.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrders.map((order, index) => (
                                            <tr key={order.id} className={`border-b border-gray-700 hover:bg-gray-750 transition-colors ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-825'}`}>
                                                <td className="p-4 font-medium text-red-400">{order.order_number}</td>
                                                <td className="p-4">{order.customer_name}</td>
                                                <td className="p-4 text-gray-300">{order.customer_email}</td>
                                                <td className="p-4">{order.items_count} item{order.items_count !== 1 ? 's' : ''}</td>
                                                <td className="p-4 font-semibold text-green-400">{formatCurrency(order.total_amount)}</td>
                                                <td className="p-4">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                                        className={`px-2 py-1 rounded-full text-xs font-medium text-white border-0 ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] || 'bg-gray-600'}`}
                                                    >
                                                        {ORDER_STATUSES.slice(1).map(status => (
                                                            <option key={status.value} value={status.value}>{status.label}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-4 text-gray-300">{formatDate(order.created_at)}</td>
                                                <td className="p-4">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleViewOrder(order)}
                                                            className="text-blue-400 hover:text-blue-300 transition-colors"
                                                            title="View Order"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditOrder(order)}
                                                            className="text-yellow-400 hover:text-yellow-300 transition-colors"
                                                            title="Edit Order"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        {order.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleDeleteOrder(order.id)}
                                                                className="text-red-400 hover:text-red-300 transition-colors"
                                                                title="Delete Order"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Order Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold">Create New Order</h3>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    resetForm();
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderFormField('Customer Name', 'customer_name', 'text', 'Enter customer name', true)}
                            {renderFormField('Customer Email', 'customer_email', 'email', 'Enter customer email', true)}
                            {renderFormField('Customer Phone', 'customer_phone', 'tel', 'Enter customer phone')}
                        </div>
                        
                        <div className="mt-6">
                            {renderFormField('Customer Address', 'customer_address', 'textarea', 'Enter customer address', true)}
                        </div>

                        <div className="mt-6">
                            {renderFormField('Notes', 'notes', 'textarea', 'Enter any additional notes')}
                        </div>

                        {/* Order Items */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium mb-2">
                                Order Items <span className="text-red-400">*</span>
                            </label>
                            {formData.items.length === 0 ? (
                                <div className="text-gray-400 text-center py-8 border-2 border-dashed border-gray-600 rounded-lg">
                                    <Package className="w-12 h-12 mx-auto mb-2" />
                                    <p>No items selected</p>
                                    <p className="text-sm">Go to Products page and select items to create an order</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {formData.items.map((item, index) => (
                                        <div key={index} className="bg-gray-700 p-4 rounded-lg flex items-center justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-medium">{item.product_name}</h4>
                                                <p className="text-sm text-gray-400">Product ID: {item.product_id}</p>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <label className="text-sm">Qty:</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => handleUpdateQuantity(index, parseInt(e.target.value) || 1)}
                                                        className="w-20 bg-gray-600 text-white px-2 py-1 rounded border border-gray-500 focus:outline-none focus:border-red-400"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="text-red-400 hover:text-red-300 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {errors.items && (
                                <p className="text-red-400 text-sm mt-1 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    {/* {errors.items} */}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-4 mt-8">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    resetForm();
                                }}
                                className="px-6 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateOrder}
                                disabled={loading || formData.items.length === 0}
                                className="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-700 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                            >
                                {loading ? 'Creating...' : 'Create Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Order Modal */}
            {showViewModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold">Order Details</h3>
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setSelectedOrder(null);
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h4 className="text-lg font-semibold mb-4 text-red-400">Order Information</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Order Number</label>
                                        <p className="text-white font-mono">{selectedOrder.order_number}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${STATUS_COLORS[selectedOrder.status as keyof typeof STATUS_COLORS]}`}>
                                            {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Total Amount</label>
                                        <p className="text-green-400 font-semibold text-lg">{formatCurrency(selectedOrder.total_amount)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Created</label>
                                        <p className="text-white">{formatDate(selectedOrder.created_at)}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-lg font-semibold mb-4 text-red-400">Customer Information</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                                        <p className="text-white">{selectedOrder.customer_name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                        <p className="text-white">{selectedOrder.customer_email}</p>
                                    </div>
                                    {selectedOrder.customer_phone && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                                            <p className="text-white">{selectedOrder.customer_phone}</p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
                                        <p className="text-white">{selectedOrder.customer_address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold mb-4 text-red-400">Order Items</h4>
                            <div className="bg-gray-700 rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-600">
                                        <tr>
                                            <th className="text-left p-3 font-medium">Product</th>
                                            <th className="text-left p-3 font-medium">Category</th>
                                            <th className="text-left p-3 font-medium">Quantity</th>
                                            <th className="text-left p-3 font-medium">Unit Price</th>
                                            <th className="text-left p-3 font-medium">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items.map((item) => (
                                            <tr key={item.id} className="border-t border-gray-600">
                                                <td className="p-3">{item.product_name}</td>
                                                <td className="p-3 capitalize">{item.product_category}</td>
                                                <td className="p-3">{item.quantity}</td>
                                                <td className="p-3">{formatCurrency(item.unit_price)}</td>
                                                <td className="p-3 font-semibold">{formatCurrency(item.total_price)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {selectedOrder.notes && (
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold mb-2 text-red-400">Notes</h4>
                                <p className="text-gray-300 bg-gray-700 p-3 rounded-lg">{selectedOrder.notes}</p>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setSelectedOrder(null);
                                }}
                                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Order Modal */}
            {showEditModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold">Edit Order</h3>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    resetForm();
                                    setSelectedOrder(null);
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderFormField('Customer Name', 'customer_name', 'text', 'Enter customer name', true)}
                            {renderFormField('Customer Email', 'customer_email', 'email', 'Enter customer email', true)}
                            {renderFormField('Customer Phone', 'customer_phone', 'tel', 'Enter customer phone')}
                        </div>
                        
                        <div className="mt-6">
                            {renderFormField('Customer Address', 'customer_address', 'textarea', 'Enter customer address', true)}
                        </div>

                        <div className="mt-6">
                            {renderFormField('Notes', 'notes', 'textarea', 'Enter any additional notes')}
                        </div>

                        <div className="flex justify-end space-x-4 mt-8">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    resetForm();
                                    setSelectedOrder(null);
                                }}
                                className="px-6 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    // Handle update logic here
                                    setShowEditModal(false);
                                    resetForm();
                                    setSelectedOrder(null);
                                    showNotification('Order updated successfully!');
                                }}
                                disabled={loading}
                                className="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-700 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                            >
                                {loading ? 'Updating...' : 'Update Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Order;