import { useEffect, useRef } from 'react';
import qrcode from 'qrcode-generator';
import { colors } from '../../shared/theme';

// =============================================
// PROMPTPAY QR GENERATOR
// =============================================
// Generates EMVCo-compliant PromptPay payload
export const generatePromptPayPayload = (promptpayId, amount) => {
  const formatTLV = (id, value) => {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  };
  // Clean the ID (remove dashes, spaces)
  const cleanId = promptpayId.replace(/[-\s]/g, '');
  // Determine if phone (9-10 digits) or national ID (13 digits)
  let aid, formattedId;
  if (cleanId.length >= 13) {
    // National ID
    aid = '02';
    formattedId = cleanId;
  } else {
    // Phone number — add 66 country code, strip leading 0
    aid = '01';
    formattedId = '0066' + (cleanId.startsWith('0') ? cleanId.slice(1) : cleanId);
  }
  const merchantInfo = formatTLV('00', 'A000000677010111') + formatTLV(aid, formattedId);
  let payload = '';
  payload += formatTLV('00', '01'); // Payload format indicator
  payload += formatTLV('01', amount ? '12' : '11'); // Point of initiation (12=dynamic, 11=static)
  payload += formatTLV('29', merchantInfo); // Merchant account info (PromptPay)
  payload += formatTLV('53', '764'); // Transaction currency (THB)
  payload += formatTLV('58', 'TH'); // Country code
  if (amount && amount > 0) {
    payload += formatTLV('54', amount.toFixed(2)); // Transaction amount
  }
  // CRC placeholder
  payload += '6304';
  // Calculate CRC-16/CCITT-FALSE
  const crc16 = (str) => {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
        crc &= 0xFFFF;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  };
  return payload + crc16(payload);
};

// PromptPay QR Code component
export const PromptPayQR = ({ promptpayId, amount, size = 200, t = (key) => key }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!promptpayId || !canvasRef.current) return;
    try {
      const payload = generatePromptPayPayload(promptpayId, amount);
      const qr = qrcode(0, 'M');
      qr.addData(payload);
      qr.make();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const moduleCount = qr.getModuleCount();
      const cellSize = size / moduleCount;
      canvas.width = size;
      canvas.height = size;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#000000';
      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          if (qr.isDark(row, col)) {
            ctx.fillRect(col * cellSize, row * cellSize, cellSize + 0.5, cellSize + 0.5);
          }
        }
      }
    } catch (err) {
      // QR generation error handled silently
    }
  }, [promptpayId, amount, size]);

  if (!promptpayId) return null;
  return (
    <div style={{ textAlign: 'center' }}>
      <canvas
        ref={canvasRef}
        style={{ borderRadius: 12, border: `2px solid ${colors.blush}` }}
        aria-label={`PromptPay QR code for payment of ${amount ? amount + ' THB' : 'amount'}`}
        role="img"
      />
      <p style={{ fontSize: 12, color: colors.gray, marginTop: 8 }}>
        {t('qr_scan')}
      </p>
      <p style={{ fontSize: 11, color: colors.gray, marginTop: 4, fontStyle: 'italic' }}>
        {t('payment_confirm_note') || 'Payment is confirmed by the seller within 1-2 hours during business hours.'}
      </p>
    </div>
  );
};
