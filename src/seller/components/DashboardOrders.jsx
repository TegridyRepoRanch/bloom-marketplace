import { useState } from 'react';
import { colors } from '../../shared/theme';
import { sanitize, exportToCSV } from '../lib/utils';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';

export const DashboardOrders = ({
  orders,
  loading,
  orderSearch,
  setOrderSearch,
  statusFilter,
  setStatusFilter,
  updateOrderStatus,
  setCancelConfirm,
  onRefresh,
  t,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(null);

  const handleRefresh = async () => {
    if (refreshing || !onRefresh) return;
    setRefreshing(true);
    setRefreshError(null);
    try {
      await onRefresh();
    } catch {
      setRefreshError(t('refresh_error') || 'Failed to refresh orders');
    }
    setRefreshing(false);
  };
  const filteredOrders = orders.filter(order => {
    const statusMatch = statusFilter === 'all' || order.status === statusFilter;
    if (!orderSearch) return statusMatch;
    const searchLower = orderSearch.toLowerCase();
    const customerNameMatch = order.customer_name && order.customer_name.toLowerCase().includes(searchLower);
    const customerPhoneMatch = order.customer_phone && order.customer_phone.includes(orderSearch);
    const orderIdMatch = order.id && order.id.toString().includes(orderSearch);
    return statusMatch && (customerNameMatch || customerPhoneMatch || orderIdMatch);
  });

  return (
    <div style={{ marginBottom: 32 }}>
      {/* Search and Status Filter */}
      {orders.length > 0 && (
        <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="text"
              placeholder={t('search_orders')}
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 8,
                border: `1px solid ${colors.gray}`,
                background: colors.white,
                color: colors.dark,
                fontSize: 14,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            />
            {orderSearch && (
              <button
                onClick={() => setOrderSearch('')}
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${colors.gray}`,
                  background: colors.white,
                  color: colors.gray,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = colors.lightGray;
                  e.target.style.color = colors.dark;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = colors.white;
                  e.target.style.color = colors.gray;
                }}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontWeight: 600, color: colors.dark, fontSize: 14 }}>{t('filter_status')}</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: `1px solid ${colors.gray}`,
                background: colors.white,
                color: colors.dark,
                fontWeight: 500,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              <option value="all">{t('all_orders')}</option>
              <option value="pending">{t('status_pending')}</option>
              <option value="confirmed">{t('status_confirmed')}</option>
              <option value="shipped">{t('status_shipped')}</option>
              <option value="delivered">{t('status_delivered')}</option>
              <option value="cancelled">{t('status_cancelled')}</option>
            </select>
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${colors.gray}`,
                  background: colors.white,
                  color: colors.gray,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = colors.lightGray;
                  e.target.style.color = colors.dark;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = colors.white;
                  e.target.style.color = colors.gray;
                }}
                title="Clear status filter"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Export Orders + Refresh Buttons */}
      {orders.length > 0 && (
        <div style={{ marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            onClick={() => {
              const columns = [
                { label: 'Order ID', accessor: (o) => o.id },
                { label: 'Customer Name', accessor: (o) => o.customer_name },
                { label: 'Phone', accessor: (o) => o.customer_phone },
                { label: 'Status', accessor: (o) => o.status },
                { label: 'Total', accessor: (o) => `฿${parseFloat(o.total).toFixed(2)}` },
                { label: 'Items', accessor: (o) => Array.isArray(o.items) ? o.items.map(item => item.title).join(', ') : '' },
                { label: 'Date', accessor: (o) => new Date(o.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) }
              ];

              const timestamp = new Date().toLocaleDateString('th-TH');
              exportToCSV(filteredOrders, columns, `orders_${timestamp}.csv`);
            }}
            style={{ padding: '12px 20px', fontSize: 14 }}
          >
            {t('export_orders')}
          </Button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            title={t('refresh_orders') || 'Refresh Orders'}
            style={{
              padding: '12px 20px',
              borderRadius: 12,
              border: `1px solid ${colors.primary}`,
              background: refreshing ? colors.cream : colors.white,
              color: colors.primary,
              fontWeight: 600,
              fontSize: 14,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s ease',
              opacity: refreshing ? 0.7 : 1,
            }}
            onMouseEnter={(e) => { if (!refreshing) { e.currentTarget.style.background = colors.primary; e.currentTarget.style.color = colors.white; } }}
            onMouseLeave={(e) => { if (!refreshing) { e.currentTarget.style.background = colors.white; e.currentTarget.style.color = colors.primary; } }}
          >
            <span style={{ display: 'inline-block', animation: refreshing ? 'spin 1s linear infinite' : 'none' }}>🔄</span>
            {refreshing ? (t('refreshing') || 'Refreshing...') : (t('refresh_orders') || 'Refresh')}
          </button>
          {refreshError && (
            <span style={{ color: colors.error, fontSize: 13, fontWeight: 500 }}>{refreshError}</span>
          )}
        </div>
      )}

      {loading ? (
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <Spinner size={32} />
          <p style={{ color: colors.gray, marginTop: 12 }}>Loading orders...</p>
        </Card>
      ) : orders.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
          <h3 style={{ fontSize: 20, fontWeight: 600, color: colors.dark, marginBottom: 8 }}>
            {t('no_orders')}
          </h3>
          <p style={{ color: colors.gray }}>
            {t('no_orders_sub')}
          </p>
        </Card>
      ) : (
        filteredOrders.map(order => (
          <Card key={order.id} style={{ marginBottom: 16, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  background: order.status === 'pending' ? colors.accent :
                             order.status === 'confirmed' ? colors.primary :
                             order.status === 'shipped' ? colors.lavender :
                             order.status === 'delivered' ? colors.mint :
                             order.status === 'cancelled' ? colors.error : colors.lightGray,
                  color: order.status === 'pending' ? colors.dark : colors.white,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  {order.status === 'pending' ? t('status_pending') :
                   order.status === 'confirmed' ? t('status_confirmed') :
                   order.status === 'shipped' ? t('status_shipped') :
                   order.status === 'delivered' ? t('status_delivered') :
                   order.status === 'cancelled' ? t('status_cancelled') : order.status}
                </span>
                <p style={{ fontSize: 12, color: colors.gray, marginTop: 8 }}>
                  {new Date(order.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <p style={{ fontSize: 24, fontWeight: 800, color: colors.primary }}>
                ฿{parseFloat(order.total).toFixed(0)}
              </p>
            </div>

            {/* Items */}
            <div style={{ background: colors.cream, borderRadius: 12, padding: 16, marginBottom: 16 }}>
              {Array.isArray(order.items) && order.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: i < order.items.length - 1 ? 8 : 0 }}>
                  <span style={{ color: colors.dark }}>{item.title} × {item.quantity}</span>
                  <span style={{ fontWeight: 600, color: colors.dark }}>฿{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>

            {/* Customer Info */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontWeight: 600, color: colors.dark, marginBottom: 8 }}>
                👤 {sanitize(order.customer_name)}
              </p>
              <p style={{ fontSize: 14, color: colors.gray, marginBottom: 4 }}>
                📱 {order.customer_phone}
              </p>
              <p style={{ fontSize: 14, color: colors.gray }}>
                📍 {sanitize(order.address)}, {sanitize(order.district)}, {sanitize(order.province)} {order.postal_code}
              </p>
              {order.delivery_notes && (
                <p style={{ fontSize: 14, color: colors.lavender, marginTop: 8 }}>
                  📝 {order.delivery_notes}
                </p>
              )}
            </div>

            {/* Payment Method & Proof */}
            <div style={{
              marginBottom: 16, padding: 16, borderRadius: 12,
              background: ['btc','eth','sol'].includes(order.payment_method)
                ? `linear-gradient(135deg, ${{'btc':'#F7931A','eth':'#627EEA','sol':'#9945FF'}[order.payment_method]}08 0%, ${{'btc':'#F7931A','eth':'#627EEA','sol':'#9945FF'}[order.payment_method]}15 100%)`
                : order.payment_method === 'promptpay'
                  ? 'linear-gradient(135deg, #E8F0FE 0%, #F0F7FF 100%)'
                  : colors.cream,
              border: ['btc','eth','sol'].includes(order.payment_method)
                ? `1px solid ${{'btc':'#F7931A','eth':'#627EEA','sol':'#9945FF'}[order.payment_method]}40`
                : order.payment_method === 'promptpay' ? '1px solid #B8D4FE' : `1px solid ${colors.blush}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: order.payment_proof_url ? 12 : 0 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: colors.dark }}>
                  {{'btc':'₿','eth':'Ξ','sol':'◎'}[order.payment_method] || '💳'} {t(`payment_method_${order.payment_method}`) || order.payment_method}
                </span>
                {order.payment_method !== 'cod' && (
                  <span style={{
                    fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                    background: order.payment_proof_url ? '#C8E6C9' : '#FFF3CD',
                    color: order.payment_proof_url ? '#2E7D32' : '#856404',
                  }}>
                    {order.payment_proof_url ? `✅ ${t('payment_proof_verified')}` : `⏳ ${t('payment_proof_none')}`}
                  </span>
                )}
              </div>

              {order.payment_proof_url && (
                <div>
                  <a
                    href={order.payment_proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      textDecoration: 'none', color: 'inherit',
                      padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.8)',
                      border: `1px solid ${colors.blush}`, cursor: 'pointer',
                      transition: 'box-shadow 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(45,125,70,0.15)'}
                    onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <img
                      src={order.payment_proof_url}
                      alt="Payment proof"
                      style={{
                        width: 56, height: 56, borderRadius: 8,
                        objectFit: 'cover', border: `1px solid ${colors.blush}`,
                        flexShrink: 0,
                      }}
                      onError={e => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div style={{
                      width: 56, height: 56, borderRadius: 8,
                      background: colors.cream, display: 'none',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, flexShrink: 0,
                    }}>📷</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#1A4DB0' }}>
                        📸 {t('payment_proof_view')}
                      </p>
                      <p style={{ fontSize: 12, color: colors.gray, marginTop: 2 }}>
                        {t('payment_proof')} — ฿{parseFloat(order.total).toFixed(0)}
                      </p>
                    </div>
                    <span style={{ fontSize: 18, color: colors.gray }}>↗</span>
                  </a>
                </div>
              )}
            </div>

            {/* Actions */}
            {order.status === 'pending' && (
              <div style={{ display: 'flex', gap: 10 }}>
                <Button
                  onClick={() => updateOrderStatus(order.id, 'confirmed')}
                  style={{ flex: 1, padding: '12px 16px', fontSize: 14 }}
                >
                  {t('btn_confirm')}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setCancelConfirm({ show: true, orderId: order.id })}
                  style={{ padding: '12px 16px', fontSize: 14, color: colors.error }}
                >
                  {t('btn_cancel_order')}
                </Button>
              </div>
            )}
            {order.status === 'confirmed' && (
              <div style={{ display: 'flex', gap: 10 }}>
                <Button
                  onClick={() => updateOrderStatus(order.id, 'shipped')}
                  style={{ flex: 1, padding: '12px 16px', fontSize: 14 }}
                >
                  {t('btn_ship')}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setCancelConfirm({ show: true, orderId: order.id })}
                  style={{ padding: '12px 16px', fontSize: 14, color: colors.error }}
                >
                  {t('btn_cancel_order')}
                </Button>
              </div>
            )}
            {order.status === 'shipped' && (
              <Button
                variant="success"
                onClick={() => updateOrderStatus(order.id, 'delivered')}
                fullWidth
                style={{ padding: '12px 16px', fontSize: 14 }}
              >
                {t('btn_deliver')}
              </Button>
            )}
            {order.status === 'delivered' && (
              <div style={{
                padding: '12px 16px',
                background: colors.mint,
                color: colors.white,
                borderRadius: 8,
                textAlign: 'center',
                fontWeight: 600,
                fontSize: 14,
              }}>
                ✅ Completed
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
};
