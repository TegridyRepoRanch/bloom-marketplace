import { useState, useEffect, lazy, Suspense } from 'react';
import { supabase } from '../shared/supabase';
import { useLanguage } from './hooks/useLanguage';
import { trackEvent } from './lib/analytics';
import { Navigation } from './components/Navbar';
import { HeroSection } from './components/Hero';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';

// Retry wrapper for lazy imports — handles stale chunk errors after deploys.
// If a chunk fails to load (e.g. filename changed after deploy), retries once
// then reloads the page to get fresh HTML with correct chunk references.
const lazyLoad = (importFn, exportName) =>
  lazy(() =>
    importFn()
      .then(m => ({ default: m[exportName] }))
      .catch(() => {
        const reloaded = sessionStorage.getItem('chunk_retry');
        if (!reloaded) {
          sessionStorage.setItem('chunk_retry', '1');
          window.location.reload();
          return { default: () => null };
        }
        sessionStorage.removeItem('chunk_retry');
        return importFn().then(m => ({ default: m[exportName] }));
      })
  );

// Lazy-load route components for faster initial page load
const ProductsPage = lazyLoad(() => import('./components/ProductsPage'), 'ProductsPage');
const ProductDetailPage = lazyLoad(() => import('./components/ProductDetail'), 'ProductDetailPage');
const CartPage = lazyLoad(() => import('./components/CartPage'), 'CartPage');
const CheckoutPage = lazyLoad(() => import('./components/CheckoutPage'), 'CheckoutPage');
const OrderConfirmationPage = lazyLoad(() => import('./components/OrderConfirmation'), 'OrderConfirmationPage');
const VendorsPage = lazyLoad(() => import('./components/VendorsPage'), 'VendorsPage');
const HowItWorksPage = lazyLoad(() => import('./components/HowItWorks'), 'HowItWorksPage');
const AboutPage = lazyLoad(() => import('./components/AboutPage'), 'AboutPage');
const ContactPage = lazyLoad(() => import('./components/ContactPage'), 'ContactPage');
const NotFoundPage = lazyLoad(() => import('./components/NotFoundPage'), 'NotFoundPage');

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
    <div style={{ width: 32, height: 32, border: '3px solid #E8F5E9', borderTopColor: '#2D7D46', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  </div>
);

// =============================================
// MAIN APP
// =============================================
const App = () => {
  const { lang, t, toggleLang } = useLanguage();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('siamclones_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [orderDetails, setOrderDetails] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    try { localStorage.setItem('siamclones_cart', JSON.stringify(cart)); } catch {}
  }, [cart]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Navigation wrapper with History API
  const navigateTo = (page, data) => {
    setCurrentPage(page);
    window.history.pushState({ page, data }, '', `#${page}`);
    // Analytics: track page views
    trackEvent('page_view', { page });
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    navigateTo('product-detail', { product });
    trackEvent('view_listing', { listing_id: product.id, category: product.category, price: product.price });
  };

  const handleAddToCart = (product, quantity) => {
    const maxAvailable = product.quantity_available || 999;
    const existing = cart.findIndex(item => item.product.id === product.id);
    if (existing >= 0) {
      const newCart = [...cart];
      const newQty = Math.min(newCart[existing].quantity + quantity, maxAvailable);
      newCart[existing] = { ...newCart[existing], quantity: newQty };
      setCart(newCart);
    } else {
      setCart([...cart, { product, quantity: Math.min(quantity, maxAvailable) }]);
    }
    setToastMessage(t('add_to_cart') + '!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
    trackEvent('add_to_cart', { listing_id: product.id, quantity, price: product.price });
  };

  const handleUpdateQuantity = (index, quantity) => {
    if (quantity <= 0) {
      setCart(cart.filter((_, i) => i !== index));
    } else {
      const newCart = [...cart];
      const maxAvailable = newCart[index].product.quantity_available || 999;
      newCart[index] = { ...newCart[index], quantity: Math.min(quantity, maxAvailable) };
      setCart(newCart);
    }
  };

  const handleRemoveFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handlePlaceOrder = (details) => {
    trackEvent('order_placed', {
      order_value: details.total,
      payment_method: details.paymentMethod,
      seller_count: new Set(cart.map(i => i.product.seller_id)).size,
      items_count: cart.length,
    });
    setOrderDetails({ ...details, items: [...cart] });
    setCart([]);
    try { localStorage.removeItem('siamclones_cart'); } catch {}
    navigateTo('order-confirmation');
  };

  // Popstate listener for browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.page) {
        setCurrentPage(event.state.page);
        if (event.state.data && event.state.data.product) {
          setSelectedProduct(event.state.data.product);
        }
      } else {
        setCurrentPage('home');
      }
    };
    window.addEventListener('popstate', handlePopState);

    // Deep link support: ?listing=ID or #page
    const params = new URLSearchParams(window.location.search);
    const listingId = params.get('listing');
    const hash = window.location.hash.replace('#', '');
    if (listingId) {
      // Fetch the listing and navigate to product detail
      supabase.from('listings').select('*, profiles(display_name, farm_name, location, phone, promptpay_id)').eq('id', listingId).single()
        .then(({ data }) => {
          if (data) {
            setSelectedProduct(data);
            setCurrentPage('product-detail');
            trackEvent('deep_link', { listing_id: listingId });
          } else {
            setCurrentPage('products');
          }
        });
    } else if (hash && hash !== 'home') {
      setCurrentPage(hash);
      window.history.replaceState({ page: hash }, '', `#${hash}`);
    } else {
      window.history.replaceState({ page: 'home' }, '', '#home');
    }

    // Track initial page view
    trackEvent('page_view', { page: listingId ? 'product-detail' : (hash || 'home') });

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HeroSection onNavigate={navigateTo} t={t} />;
      case 'products': return <ProductsPage onSelectProduct={handleSelectProduct} t={t} />;
      case 'product-detail': return <ProductDetailPage product={selectedProduct} onBack={() => navigateTo('products')} onAddToCart={handleAddToCart} t={t} />;
      case 'cart': return <CartPage cart={cart} onUpdateQuantity={handleUpdateQuantity} onRemove={handleRemoveFromCart} onCheckout={() => { navigateTo('checkout'); trackEvent('begin_checkout', { cart_value: cart.reduce((s,i) => s + i.product.price * i.quantity, 0), items_count: cart.length }); }} onContinueShopping={() => navigateTo('products')} t={t} />;
      case 'checkout': return <CheckoutPage cart={cart} onPlaceOrder={handlePlaceOrder} onBack={() => navigateTo('cart')} t={t} lang={lang} />;
      case 'order-confirmation': return <OrderConfirmationPage order={orderDetails} onContinueShopping={() => navigateTo('products')} t={t} />;
      case 'growers': return <VendorsPage t={t} />;
      case 'how-it-works': return <HowItWorksPage t={t} />;
      case 'about': return <AboutPage t={t} />;
      case 'contact': return <ContactPage t={t} />;
      default: return <NotFoundPage onNavigate={navigateTo} t={t} />;
    }
  };

  return (
    <div>
      <Navigation currentPage={currentPage} onNavigate={navigateTo} cartCount={cartCount} t={t} toggleLang={toggleLang} lang={lang} />
      <main id="main-content" key={currentPage} className="page-transition" role="main" style={{ animation: 'pageIn 0.3s ease-out' }}>
        <Suspense fallback={<PageLoader />}>
          {renderPage()}
        </Suspense>
      </main>
      <Footer onNavigate={navigateTo} />
      <Toast message={toastMessage || t('add_to_cart') + '!'} visible={showToast} />
    </div>
  );
};

export default App;
