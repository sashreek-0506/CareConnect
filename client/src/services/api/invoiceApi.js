import axiosClient from './axiosClient';

export const invoiceApi = {
  mine: () => axiosClient.get('/invoices/mine'),
  forBooking: (bookingId) => axiosClient.get(`/invoices/booking/${bookingId}`),
};
