/**
 * Ticket Service
 *
 * Generates unique tickets & QR codes upon successful payment confirmation.
 */
const QRCode = require('qrcode');
const { supabaseAdmin } = require('./supabaseAdmin');

const ticketService = {
  /**
   * Generate unique ticket code
   * @returns {string} e.g. "KT-8F3A-9C2E"
   */
  generateTicketCode() {
    const randomHex = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    return `KT-${randomHex()}-${randomHex()}`;
  },

  /**
   * Generate QR Code as Data URL
   * @param {string} text - Payload to encode in QR Code
   * @returns {Promise<string>} Data URL (base64 string)
   */
  async generateQRCodeDataUrl(text) {
    return QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: '#1B120F',
        light: '#FFFFFF',
      },
    });
  },

  /**
   * Issue ticket for a confirmed booking
   * @param {Object} params
   * @param {string} params.bookingId
   * @param {string} params.customerName
   * @returns {Promise<Object>} Created ticket record
   */
  async issueTicketForBooking({ bookingId, customerName }) {
    // Check if ticket already exists for this booking (idempotency)
    const { data: existingTicket } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('booking_id', bookingId)
      .single();

    if (existingTicket) {
      return existingTicket;
    }

    const ticketCode = this.generateTicketCode();
    const qrPayload = JSON.stringify({
      ticketCode,
      bookingId,
      issuedAt: new Date().toISOString(),
    });

    const qrDataUrl = await this.generateQRCodeDataUrl(qrPayload);

    const { data: ticket, error } = await supabaseAdmin
      .from('tickets')
      .insert([
        {
          booking_id: bookingId,
          ticket_code: ticketCode,
          customer_name: customerName || 'Valued Guest',
          qr_code_url: qrDataUrl,
          qr_code_data: qrPayload,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }

    return ticket;
  }
};

module.exports = ticketService;
