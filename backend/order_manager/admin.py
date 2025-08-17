from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'category', 'cost_price', 'selling_price', 
        'profit_margin_display', 'stock_available', 'units_sold', 
        'customer_rating', 'created_by', 'created_at'
    ]
    list_filter = [
        'category', 'created_by', 'created_at', 'customer_rating'
    ]
    search_fields = ['name', 'description', 'created_by__username']
    readonly_fields = ['id', 'created_at', 'updated_at', 'profit_margin_display']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'category')
        }),
        ('Pricing', {
            'fields': ('cost_price', 'selling_price', 'optimized_price')
        }),
        ('Inventory & Performance', {
            'fields': ('stock_available', 'units_sold', 'customer_rating', 'demand_forecast')
        }),
        ('System Information', {
            'fields': ('id', 'created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    ordering = ['-created_at']
    
    def profit_margin_display(self, obj):
        return f"{obj.profit_margin:.2f}%"
    profit_margin_display.short_description = 'Profit Margin'
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only set created_by for new objects
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


