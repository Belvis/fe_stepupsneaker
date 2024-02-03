export interface IFile {
  name: string;
  percent: number;
  size: number;
  status: "error" | "success" | "done" | "uploading" | "removed";
  type: string;
  uid: string;
  url: string;
}

export interface IEvent {
  date: number | undefined;
  status: OrderStatus;
}

export interface IOption {
  value: string;
  label: string | React.ReactNode;
}
export interface INotification {
  id: string;
  content: string;
  employee: IEmployee;
  customer: ICustomer;
  href: string;
  notificationType:
    | "ORDER_PLACED"
    | "ORDER_PENDING"
    | "ORDER_CHANGED"
    | "PRODUCT_LOW_STOCK";
  read: boolean;
  delivered: boolean;
  createdAt: number;
  loading: boolean;
}
export interface IOrderNotification {
  status: OrderStatus;
  count: number;
}

export interface ConfirmDialogOptions {
  message?: string;
  header?: string;
  icon?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  acceptClassName?: string;
  accept: any;
  reject: any;
}
interface QRCodeData {
  cicNumber: string;
  idcNumber: string;
  fullName: string;
  dob: string;
  gender: string;
  address: string;
  issueDate: string;
}
export interface ITransportAddress {
  more: string;
  fullName: string;
  phoneNumber: string;
  districtId: number;
  provinceId: number;
  wardCode: string;
  height: number;
  length: number;
  weight: number;
  width: number;
  insuranceValue: number;
  codFailedAmount: number;
  coupon: string;
}

export interface ISalesChart {
  date: string;
  title: "Order Count" | "Order Amount";
  value: number;
}

export interface IOrderAudit {
  revisionType: RevisionType;
  revisionNumber: number;
  entity: IOrder;
  changes: {
    [key: string]: {
      oldValue: any;
      newValue: any;
    };
  };
  creator: string;
  at: number;
}
export interface IOrder {
  id: string;
  customer: ICustomer;
  employee: IEmployee;
  voucher?: IVoucher;
  address: IAddress;
  phoneNumber: string;
  fullName: string;
  totalMoney: number;
  shippingMoney: number;
  totalMoney: number;
  originMoney: number;
  reduceMoney: number;
  confirmationDate: number;
  expectedDeliveryDate: number;
  deliveryStartDate: number;
  receivedDate: number;
  createdAt: number;
  type: OrderType;
  note: string;
  code: string;
  orderDetails: IOrderDetail[];
  orderHistories: IOrderHistory[];
  payments: IPayment[];
  status: OrderStatus;
}

export interface IOrderDetail {
  id: string;
  order: IOrder;
  productDetail: IProductDetail;
  quantity: number;
  price: number;
  totalPrice: number;
  status: OrderStatus;
}

export interface IOrderHistory {
  id: string;
  order: IOrder;
  actionDescription: string;
  actionStatus: OrderStatus;
  note: string;
  createdAt: number;
}

export interface IProvince {
  ProvinceName: any;
  ProvinceID: number;
}

export interface IDistrict {
  DistrictID: number;
  ProvinceID: number;
  DistrictName: string;
}

export interface IWard {
  DistrictID: number;
  WardName: string;
  WardCode: number;
}

export interface IOrderDetailConvertedPayload {
  id?: string;
  order: string;
  productDetail: string;
  quantity: number;
  price: number;
  totalPrice: number;
  status: OrderStatus;
}
export interface IOrderConvertedPayload {
  id: string;
  customer: string | null;
  employee: string | null;
  voucher: string | null;
  address: string | null;
  phoneNumber: string;
  fullName: string;
  totalMoney: number;
  shippingMoney: number;
  type: OrderType;
  note: string;
  code: string;
  status: OrderStatus;
}
export interface IProductDetailConvertedPayload {
  product: string;
  tradeMark: string;
  style: string;
  size: string;
  material: string;
  color: string;
  brand: string;
  sole: string;
  image: string;
  price: number;
  quantity: number;
  status: string;
}

export interface IPaymentConvertedPayload {
  order: string;
  paymentMethod: string;
  totalMoney: number;
  transactionCode: string;
}

export interface IUserSelected {
  product: IProduct;
  tradeMark: ITradeMark;
  style: IStyle;
  size: ISize[];
  material: IMaterial;
  color: IColor[];
  brand: IBrand;
  sole: ISole;
  image: string;
  price: number;
  quantity: number;
  status: ProductStatus;
}

// Enums define

export type ProductStatus = "ACTIVE" | "IN_ACTIVE";
export type UserStatus = "ACTIVE" | "IN_ACTIVE" | "BLOCKED";
export type VoucherStatus = "ACTIVE" | "IN_ACTIVE" | "EXPIRED";
export type PromotionStatus = "ACTIVE" | "IN_ACTIVE" | "EXPIRED";
export type VoucherType = "PERCENTAGE" | "CASH";
export type OrderType = "ONLINE" | "OFFLINE";
export type OrderStatus =
  | "PLACE_ORDER"
  | "PENDING"
  | "WAIT_FOR_CONFIRMATION"
  | "WAIT_FOR_DELIVERY"
  | "DELIVERING"
  | "COMPLETED"
  | "CANCELED"
  | "EXPIRED"
  | "RETURNED"
  | "EXCHANGED";
export type RevisionType = "UNKNOWN" | "INSERT" | "UPDATE" | "DELETE";

type IDiscountInfo = {
  value: number;
  endDate: number;
};
export interface IProductStatus {
  id: number;
  text: "Active";
}

// Entities

export interface IColor {
  id: string;
  code: string;
  name: string;
  status: ProductStatus;
  createdAt: number;
}

export interface IBrand {
  id: string;
  name: string;
  status: ProductStatus;
}

export interface IStyle {
  id: string;
  name: string;
  status: ProductStatus;
}

export interface IMaterial {
  id: string;
  name: string;
  status: ProductStatus;
}

export interface ISize {
  id: string;
  name: string;
  status: ProductStatus;
}

export interface ITradeMark {
  id: string;
  name: string;
  status: ProductStatus;
}

export interface ISole {
  id: string;
  name: string;
  status: ProductStatus;
}

export interface IVoucher {
  id: string;
  code: string;
  name: string;
  status: VoucherStatus;
  type: VoucherType;
  value: number;
  constraint: number;
  quantity: number;
  startDate: number;
  endDate: number;
  image: string;
}

export interface IVoucherList {
  id: string;
  voucher: IVoucherResponse;
}
export interface IPromotion {
  id: string;
  code: string;
  name: string;
  status: PromotionStatus;
  value: number;
  startDate: number;
  endDate: number;
  image: string;
}

export interface IVoucherHistory {
  id: string;
  voucher: IVoucher;
  order: IOrder;
  moneyBeforeReduction: number;
  moneyAfterReduction: number;
  moneyReduction: number;
  createdAt: number;
}

export interface ICustomer {
  id: string;
  fullName: string;
  email: string;
  dateOfBirth: number;
  password: string;
  status: UserStatus;
  gender: string;
  image: string;
  addressList: IAddress[];
  customerVoucherList: IVoucherList[];
}

export interface IEmployee {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phoneNumber;
  status: UserStatus;
  gender: string;
  image: string;
  role: IRole;
  address: string;
}

export interface IRole {
  id: string;
  name: string;
}

export interface IAddress {
  id: string;
  phoneNumber: string;
  isDefault: boolean;
  districtId: number;
  districtName: string;
  provinceId: number;
  provinceName: string;
  wardCode: string;
  wardName: string;
  more: string;
  customerResponse: ICustomer;
}

export interface IProduct {
  id: string;
  name: string;
  code: string;
  description: string;
  image: string;
  status: ProductStatus;
  productDetails: IProductDetail[];
  saleCount: number;
  createdAt: number;
}

export interface IPromotionProductDetailResponse {
  id: string;
  promotion: IPromotionResponse;
}
export interface IPromotionResponse {
  id: string;
  code: string;
  name: string;
  status: VoucherStatus;
  value: number;
  startDate: number;
  endDate: number;
}

export interface IProductDetail {
  id: string;
  tradeMark: ITradeMark;
  style: IStyle;
  size: ISize;
  product: IProduct;
  material: IMaterial;
  color: IColor;
  brand: IBrand;
  sole: ISole;
  image: string;
  price: number;
  quantity: number;
  status: ProductStatus;
  promotionProductDetails: IPromotionProductDetailResponse[];
}
export interface IProductClient {
  id: string;
  code: string;
  name: string;
  price: {
    min: number;
    max: number;
  };
  discount: number;
  saleCount: number;
  offerEnd: number;
  new: boolean;
  variation: IVariation[];
  image: string[];
  description: string;
}
export interface IVariation {
  color: IColor;
  image: string[];
  size: ISizeClient[];
}
export interface ISizeClient {
  id: string;
  name: string;
  stock: number;
  price: number;
  discount: number;
  saleCount: number;
  offerEnd: number;
  productDetailId: string;
}
export interface IPayment {
  id: string;
  order: IOrder;
  paymentMethod: IPaymentMethod;
  transactionCode: string;
  totalMoney: number;
  description: string;
  createdAt: number;
}

export interface IPaymentMethod {
  id: string;
  name: string;
}

// Filter variables

export interface IColorFilterVariables {
  q?: string;
  status: ProductStatus;
}

export interface IBrandFilterVariables {
  q?: string;
  status: ProductStatus;
}

export interface IStyleFilterVariables {
  q?: string;
  status: ProductStatus;
}

export interface IMaterialFilterVariables {
  q?: string;
  status: ProductStatus;
}

export interface ISizeFilterVariables {
  q?: string;
  status: ProductStatus;
}

export interface ITradeMarkFilterVariables {
  q?: string;
  status: ProductStatus;
}

export interface ISoleFilterVariables {
  q?: string;
  status: ProductStatus;
}

export interface IVoucherFilterVariables {
  q?: string;
  status: VoucherStatus;
  customer: string;
  type: VoucherType;
  value: number;
  constraint: number;
  quantity: number;
  startDate: number;
  endDate: number;
}

export interface IPromotionFilterVariables {
  q?: string;
  status: PromotionStatus;
  value: number;
  startDate: number;
  endDate: number;
}

export interface IProductFilterVariables {
  q?: string;
  status: ProductStatus;
}

export interface IProductDetailFilterVariables {
  q?: string;
  tradeMark: string;
  style: string;
  size: string;
  material: string;
  color: string;
  brand: string;
  sole: string;
  priceMin: number;
  priceMax: number;
  quantity: number;
  status: ProductStatus;
}

export interface IOrderFilterVariables {
  q?: string;
  customer: string;
  employee: string;
  voucher: string;
  address: string;
  phoneNumber: string;
  fullName: string;
  type: OrderType;
  code: string;
  status: OrderStatus;
  priceMin: string;
  priceMax: string;
  startDate: number;
  endDate: number;
}

export interface ICustomerFilterVariables {
  q?: string;
  dateOfBirth: number;
  status: UserStatus;
  gender: string;
}

export interface IEmployeeFilterVariables {
  q?: string;
  dateOfBirth: number;
  status: UserStatus;
  gender: string;
}

export interface IRoleFilterVariables {
  q?: string;
}

export interface IPaymentMethodFilterVariables {
  q?: string;
}

export interface IPaymentFilterVariables {
  q?: string;
}

export interface IAddressFilterVariables {
  phoneNumber: string;
  isDefault: boolean;
  city: string;
  province: string;
}

//

export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};
