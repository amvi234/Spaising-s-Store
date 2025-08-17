from django.contrib import admin

from order_manager.models import OrderItem, Order

# Register your models here.
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['id', 'total_price', 'created_at']
    fields = ['product', 'quantity', 'unit_price', 'total_price']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('product')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'order_number', 'customer_name', 'customer_email', 
        'status', 'total_amount', 'created_by', 'created_at'
    ]
    list_filter = ['status', 'created_by', 'created_at']
    search_fields = [
        'order_number', 'customer_name', 'customer_email', 
        'customer_phone', 'created_by__username'
    ]
    readonly_fields = ['id', 'order_number', 'created_at', 'updated_at']
    inlines = [OrderItemInline]
    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'status', 'total_amount', 'notes')
        }),
        ('Customer Details', {
            'fields': ('customer_name', 'customer_email', 'customer_phone', 'customer_address')
        }),
        ('System Information', {
            'fields': ('id', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    ordering = ['-created_at']
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only set created_by for new objects
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = [
        'order', 'product', 'quantity', 'unit_price', 
        'total_price', 'created_at'
    ]
    list_filter = ['created_at', 'product__category']
    search_fields = [
        'order__order_number', 'product__name', 
        'order__customer_name'
    ]
    readonly_fields = ['id', 'total_price', 'created_at']
    fieldsets = (
        ('Order Item Details', {
            'fields': ('order', 'product', 'quantity', 'unit_price', 'total_price')
        }),
        ('System Information', {
            'fields': ('id', 'created_at'),
            'classes': ('collapse',)
        })
    )
    ordering = ['-created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('order', 'product')
