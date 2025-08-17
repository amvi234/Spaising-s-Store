from rest_framework.viewsets import ViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.db import transaction

from product_manager.models import Product
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer


class OrderViewSet(ViewSet):
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """List all orders for the authenticated user"""
        orders = Order.objects.filter(created_by=request.user).prefetch_related('items__product')
        
        # Optional filtering
        status_filter = request.query_params.get('status', None)
        search = request.query_params.get('search', None)
        
        if status_filter and status_filter != 'all':
            orders = orders.filter(status=status_filter)
            
        if search:
            orders = orders.filter(
                Q(order_number__icontains=search) | 
                Q(customer_name__icontains=search) |
                Q(customer_email__icontains=search)
            )
        
        serializer = OrderSerializer(orders, many=True)
        return Response({
            "meta": {"message": "Orders fetched successfully."},
            "data": serializer.data,
        })
    
    def create(self, request):
        """Create a new order"""
        serializer = OrderCreateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    # Create the order
                    order = Order.objects.create(
                        customer_name=serializer.validated_data['customer_name'],
                        customer_email=serializer.validated_data['customer_email'],
                        customer_phone=serializer.validated_data.get('customer_phone', ''),
                        customer_address=serializer.validated_data['customer_address'],
                        notes=serializer.validated_data.get('notes', ''),
                        total_amount=0,  # Will be calculated below
                        created_by=request.user
                    )
                    
                    total_amount = 0
                    items_data = serializer.validated_data['items']
                    
                    # Create order items
                    for item_data in items_data:
                        product = get_object_or_404(Product, 
                                                  id=item_data['product_id'], 
                                                  created_by=request.user)
                        
                        # Check stock availability
                        if product.stock_available < item_data['quantity']:
                            return Response({
                                "meta": {"message": "Insufficient stock."},
                                "errors": {"stock": f"Only {product.stock_available} units of {product.name} available"}
                            }, status=status.HTTP_400_BAD_REQUEST)
                        
                        # Create order item
                        order_item = OrderItem.objects.create(
                            order=order,
                            product=product,
                            quantity=item_data['quantity'],
                            unit_price=product.selling_price
                        )
                        
                        # Update product stock and units sold
                        product.stock_available -= item_data['quantity']
                        product.units_sold += item_data['quantity']
                        product.save()
                        
                        total_amount += order_item.total_price
                    
                    # Update order total
                    order.total_amount = total_amount
                    order.save()
                    
                    # Return the created order
                    response_serializer = OrderSerializer(order)
                    return Response({
                        "meta": {"message": "Order created successfully."},
                        "data": response_serializer.data,
                    }, status=status.HTTP_201_CREATED)
                    
            except Exception as e:
                return Response({
                    "meta": {"message": "Failed to create order."},
                    "errors": {"detail": str(e)}
                }, status=status.HTTP_400_BAD_REQUEST)
                
        return Response({
            "meta": {"message": "Validation failed."},
            "errors": serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def retrieve(self, request, pk=None):
        """Get a single order"""
        order = get_object_or_404(Order, pk=pk, created_by=request.user)
        serializer = OrderSerializer(order)
        return Response({
            "meta": {"message": "Order fetched successfully."},
            "data": serializer.data,
        })
    
    def update(self, request, pk=None):
        """Update an order (mainly status)"""
        order = get_object_or_404(Order, pk=pk, created_by=request.user)
        
        # Only allow status, notes, and customer details updates
        allowed_fields = ['status', 'notes', 'customer_name', 'customer_email', 
                         'customer_phone', 'customer_address']
        
        for field in allowed_fields:
            if field in request.data:
                setattr(order, field, request.data[field])
        
        order.save()
        
        serializer = OrderSerializer(order)
        return Response({
            "meta": {"message": "Order updated successfully."},
            "data": serializer.data,
        })
    
    def destroy(self, request, pk=None):
        """Delete an order (only if pending)"""
        order = get_object_or_404(Order, pk=pk, created_by=request.user)
        
        if order.status != 'pending':
            return Response({
                "meta": {"message": "Only pending orders can be deleted."},
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Restore product stock when deleting order
        with transaction.atomic():
            for item in order.items.all():
                product = item.product
                product.stock_available += item.quantity
                product.units_sold -= item.quantity
                product.save()
            
            order.delete()
        
        return Response({
            "meta": {"message": "Order deleted successfully."}
        }, status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get order statistics"""
        orders = Order.objects.filter(created_by=request.user)
        
        stats = {
            'total_orders': orders.count(),
            'pending_orders': orders.filter(status='pending').count(),
            'confirmed_orders': orders.filter(status='confirmed').count(),
            'shipped_orders': orders.filter(status='shipped').count(),
            'delivered_orders': orders.filter(status='delivered').count(),
            'cancelled_orders': orders.filter(status='cancelled').count(),
            'total_revenue': sum([order.total_amount for order in orders])
        }
        
        return Response({
            "meta": {"message": "Order statistics fetched successfully."},
            "data": stats,
        })