from product_manager.views import ProductViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"", ProductViewSet, basename="order")

urlpatterns = router.urls