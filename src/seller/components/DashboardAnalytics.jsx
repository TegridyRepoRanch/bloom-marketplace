import { colors, shadows } from '../../shared/theme';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';

export const DashboardAnalytics = ({
  orders,
  listings,
  loading,
  isMobile,
  t,
}) => {
  return (
    <div style={{ marginBottom: 32 }}>
      {loading ? (
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <Spinner size={32} />
          <p style={{ color: colors.gray, marginTop: 12 }}>Loading analytics...</p>
        </Card>
      ) : (
        <div>
          {/* Stats Cards Row */}
          {(() => {
            const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
            const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;
            const activeCount = listings.filter(l => l.is_available).length;
            return (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
            {/* Total Revenue */}
            <Card style={{ padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: colors.gray, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('analytics_revenue')}</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: colors.primary, marginBottom: 4 }}>
                ฿{totalRevenue.toFixed(0)}
              </p>
              <p style={{ fontSize: 12, color: colors.gray }}>From {orders.length} orders</p>
            </Card>

            {/* Total Orders */}
            <Card style={{ padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: colors.gray, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('analytics_orders_count')}</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: colors.secondary, marginBottom: 4 }}>
                {orders.length}
              </p>
              <p style={{ fontSize: 12, color: colors.gray }}>All time</p>
            </Card>

            {/* Active Listings */}
            <Card style={{ padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: colors.gray, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Active Listings</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: colors.mint, marginBottom: 4 }}>
                {activeCount}
              </p>
              <p style={{ fontSize: 12, color: colors.gray }}>Out of {listings.length}</p>
            </Card>

            {/* Average Order Value */}
            <Card style={{ padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: colors.gray, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('analytics_avg_order')}</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: colors.lavender, marginBottom: 4 }}>
                ฿{avgOrder.toFixed(0)}
              </p>
              <p style={{ fontSize: 12, color: colors.gray }}>Per order</p>
            </Card>
          </div>
            );
          })()}

          {/* Orders by Day Chart */}
          {orders.length > 0 && (
            <Card style={{ padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.dark, marginBottom: 20 }}>{t('analytics_daily')}</h3>
              {(() => {
                const last7Days = Array.from({length: 7}, (_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (6 - i));
                  return d;
                });
                const ordersByDay = last7Days.map(day => ({
                  label: day.toLocaleDateString('en', {weekday: 'short'}),
                  count: orders.filter(o => {
                    const od = new Date(o.created_at);
                    return od.toDateString() === day.toDateString();
                  }).length
                }));
                const maxCount = Math.max(...ordersByDay.map(d => d.count), 1);
                return (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 200 }}>
                    {ordersByDay.map((day, idx) => (
                      <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                        <div style={{
                          width: '100%',
                          height: `${(day.count / maxCount) * 150}px`,
                          background: colors.gradient1,
                          borderRadius: '8px 8px 0 0',
                          boxShadow: shadows.soft,
                        }}></div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: colors.dark, textAlign: 'center' }}>{day.label}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: colors.primary }}>{day.count}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </Card>
          )}

          {/* Top Listings */}
          {orders.length > 0 && (
            <Card style={{ padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.dark, marginBottom: 20 }}>{t('analytics_top')}</h3>
              {(() => {
                const itemCounts = {};
                orders.forEach(order => {
                  if (Array.isArray(order.items)) {
                    order.items.forEach(item => {
                      if (!itemCounts[item.title]) {
                        itemCounts[item.title] = { title: item.title, count: 0, total: 0, image: item.image };
                      }
                      itemCounts[item.title].count += item.quantity || 1;
                      itemCounts[item.title].total += (item.price * (item.quantity || 1)) || 0;
                    });
                  }
                });
                const topItems = Object.values(itemCounts)
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 3);
                return (
                  <div>
                    {topItems.length === 0 ? (
                      <p style={{ color: colors.gray }}>No product data available</p>
                    ) : (
                      topItems.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: idx < topItems.length - 1 ? 16 : 0, paddingBottom: idx < topItems.length - 1 ? 16 : 0, borderBottom: idx < topItems.length - 1 ? `1px solid ${colors.lightGray}` : 'none' }}>
                          <div style={{ fontSize: 28, fontWeight: 700, color: colors.primary, minWidth: 40, textAlign: 'center' }}>#{idx + 1}</div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 600, color: colors.dark, marginBottom: 4 }}>{item.title}</p>
                            <p style={{ fontSize: 14, color: colors.gray }}>{item.count} {item.count === 1 ? 'unit' : 'units'} • ฿{item.total.toFixed(0)} revenue</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                );
              })()}
            </Card>
          )}

          {/* Revenue Breakdown by Payment Method */}
          {orders.length > 0 && (
            <Card style={{ padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.dark, marginBottom: 20 }}>Revenue by Payment Method</h3>
              {(() => {
                const paymentBreakdown = {
                  cod: { label: 'PromptPay (Legacy)', amount: 0 },
                  promptpay: { label: 'PromptPay', amount: 0 },
                  btc: { label: 'Bitcoin (BTC)', amount: 0 },
                  eth: { label: 'Ethereum (ETH)', amount: 0 },
                  sol: { label: 'Solana (SOL)', amount: 0 },
                };
                orders.forEach(order => {
                  const method = (order.payment_method || 'cod').toLowerCase();
                  if (paymentBreakdown[method]) {
                    paymentBreakdown[method].amount += parseFloat(order.total) || 0;
                  }
                });
                const totalRevenue = Object.values(paymentBreakdown).reduce((sum, p) => sum + p.amount, 0);
                return (
                  <div>
                    {Object.entries(paymentBreakdown).map(([key, method], idx) => {
                      const percentage = totalRevenue > 0 ? ((method.amount / totalRevenue) * 100).toFixed(1) : 0;
                      return (
                        <div key={key} style={{ marginBottom: idx === Object.keys(paymentBreakdown).length - 1 ? 0 : 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <p style={{ fontWeight: 600, color: colors.dark }}>{method.label}</p>
                            <p style={{ fontSize: 14, fontWeight: 700, color: colors.primary }}>฿{method.amount.toFixed(0)}</p>
                          </div>
                          <div style={{ width: '100%', height: 8, background: colors.lightGray, borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ width: `${percentage}%`, height: '100%', background: key === 'promptpay' ? colors.lavender : colors.secondary, borderRadius: 4 }}></div>
                          </div>
                          <p style={{ fontSize: 12, color: colors.gray, marginTop: 4 }}>{percentage}% of total</p>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </Card>
          )}

          {orders.length === 0 && (
            <Card style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📊</div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: colors.dark, marginBottom: 8 }}>
                No data yet
              </h3>
              <p style={{ color: colors.gray }}>
                Analytics will appear here once you receive your first order!
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
