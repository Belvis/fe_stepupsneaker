import {
  IOrder,
  IOrderConvertedPayload,
  IPayment,
  IPaymentConvertedPayload,
  IProductDetail,
  IProductDetailConvertedPayload,
} from "../../interfaces";

export const productDetailToPayload = (
  productDetails: IProductDetail[]
): IProductDetailConvertedPayload[] => {
  if (!productDetails) return [];
  return productDetails.map((detail) => ({
    product: detail.product.id,
    tradeMark: detail.tradeMark.id,
    style: detail.style.id,
    size: detail.size.id,
    material: detail.material.id,
    color: detail.color.id,
    brand: detail.brand.id,
    sole: detail.sole.id,
    image: detail.image,
    price: detail.price,
    quantity: detail.quantity,
    status: detail.status,
  }));
};

export const orderToPayload = (order: IOrder): IOrderConvertedPayload => {
  return {
    id: order.id,
    customer: order.customer ? order.customer.id : "",
    employee: order.employee ? order.employee.id : "",
    voucher: order.voucher ? order.voucher.id : "",
    address: order.address ? order.address.id : "",
    phoneNumber: order.phoneNumber,
    fullName: order.fullName,
    totalMoney: order.totalMoney,
    shippingMoney: order.shippingMoney,
    type: order.type,
    note: order.note,
    code: order.code,
    status: order.status,
  };
};

export const paymentToPayload = (
  payments: IPayment[]
): IPaymentConvertedPayload[] => {
  if (!payments) return [];
  return payments.map((payment) => ({
    order: payment.order.id,
    paymentMethod: payment.paymentMethod.id,
    totalMoney: payment.totalMoney,
    transactionCode: payment.transactionCode,
  }));
};
