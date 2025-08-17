from rest_framework import serializers
from .models import Order, OrderItem, Product


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_category = serializers.CharField(source='product.category', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_category', 
                 'quantity', 'unit_price', 'total_price']
        read_only_fields = ['id', 'total_price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = ['id', 'order_number', 'customer_name', 'customer_email', 
                 'customer_phone', 'customer_address', 'status', 'total_amount',
                 'notes', 'items', 'items_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'order_number', 'total_amount', 'created_at', 'updated_at']
    
    def get_items_count(self, obj):
        return obj.items.count()


class OrderItemCreateSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=255)
    customer_email = serializers.EmailField()
    customer_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    customer_address = serializers.CharField()
    notes = serializers.CharField(required=False, allow_blank=True)
    items = OrderItemCreateSerializer(many=True)
    
    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one item is required.")
        return value