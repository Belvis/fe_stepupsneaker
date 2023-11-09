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

export interface IOrder {
  id: string;
  customer: ICustomer;
  employee: IEmployee;
  voucher: IVoucher;
  address: IAddress;
  phoneNumber: string;
  fullName: string;
  totalMoney: number;
  shippingMoney: number;
  confirmationDate: number;
  expectedDeliveryDate: number;
  deliveryStartDate: number;
  receivedDate: number;
  createdAt: number;
  type: OrderType;
  note: string;
  code: string;
  orderDetails: IOrderDetail[];
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
export type VoucherType = "PERCENTAGE" | "CASH";
export type OrderType = "ONLINE" | "OFFLINE";
export type OrderStatus =
  | "PENDING"
  | "WAIT_FOR_CONFIRMATION"
  | "WAIT_FOR_DELIVERY"
  | "DELIVERING"
  | "COMPLETED"
  | "CANCELED"
  | "EXPIRED"
  | "RETURNED"
  | "EXCHANGED";

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
  type: VoucherType;
  value: number;
  constraint: number;
  quantity: number;
  startDate: number;
  endDate: number;
}

export interface IProductFilterVariables {
  q?: string;
  status: ProductStatus;
}

export interface IProductDetailFilterVariables {
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
