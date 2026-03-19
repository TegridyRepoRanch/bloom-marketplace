// =============================================
// ANALYTICS TRACKING (lightweight)
// =============================================
export const trackEvent = (eventName, data = {}) => {
  try {
    // Get or create session ID
    let sessionId = sessionStorage.getItem('sc_session');
    if (!sessionId) {
      sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      sessionStorage.setItem('sc_session', sessionId);
    }
    // Store events locally (can be sent to analytics service later)
    const events = JSON.parse(localStorage.getItem('sc_events') || '[]');
    events.push({
      event: eventName,
      ...data,
      session_id: sessionId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });
    // Keep last 200 events max
    if (events.length > 200) events.splice(0, events.length - 200);
    localStorage.setItem('sc_events', JSON.stringify(events));

    // Also push to dataLayer for GA4 if present
    if (window.dataLayer) {
      window.dataLayer.push({ event: eventName, ...data });
    }
  } catch (e) {
    // Silently fail
  }
};
