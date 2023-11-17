import { TranslateFunction } from "@refinedev/core/dist/interfaces/bindings/i18n";

export const PRODUCT_STATUS_OPTIONS = [
  {
    label: "Active",
    value: "ACTIVE",
  },
  {
    label: "Inactive",
    value: "INACTIVE",
  },
];

export const getProductStatusOptions = (t: TranslateFunction) => [
  {
    label: t("enum.productStatuses.ACTIVE"),
    value: "ACTIVE",
  },
  {
    label: t("enum.productStatuses.IN_ACTIVE"),
    value: "IN_ACTIVE",
  },
];

export const getUserGenderOptions = (t: TranslateFunction) => [
  {
    label: t("customers.fields.gender.options.Male"),
    value: "Male",
  },
  {
    label: t("customers.fields.gender.options.Female"),
    value: "Female",
  },
  {
    label: t("customers.fields.gender.options.Other"),
    value: "Other",
  },
];

export const getUserStatusOptions = (t: TranslateFunction) => [
  {
    label: t("enum.userStatuses.ACTIVE"),
    value: "ACTIVE",
  },
  {
    label: t("enum.userStatuses.IN_ACTIVE"),
    value: "IN_ACTIVE",
  },
  {
    label: t("enum.userStatuses.BLOCKED"),
    value: "BLOCKED",
  },
];

export const getVouccherStatusOptions = (t: TranslateFunction) => [
  {
    label: t("enum.userStatuses.ACTIVE"),
    value: "ACTIVE",
  },
  {
    label: t("enum.userStatuses.IN_ACTIVE"),
    value: "IN_ACTIVE",
  },
  {
    label: t("enum.userStatuses.BLOCKED"),
    value: "BLOCKED",
  },
];

export const getPromotionStatusOptions = (t: TranslateFunction) => [
  {
    label: t("enum.promotionsStatuses.ACTIVE"),
    value: "ACTIVE",
  },
  {
    label: t("enum.promotionsStatuses.IN_ACTIVE"),
    value: "IN_ACTIVE",
  },
  {
    label: t("enum.promotionsStatuses.EXPIRED"),
    value: "EXPIRED",
  },
];

export const getOrderTypeOptions = (t: TranslateFunction) => [
  {
    label: t("orders.fields.type.OFFLINE"),
    value: "OFFLINE",
  },
  {
    label: t("orders.fields.type.ONLINE"),
    value: "ONLINE",
  },
];

export const getOrderStatusOptions = (t: TranslateFunction) => [
  {
    label: t("enum.orderStatuses.PENDING"),
    value: "PENDING",
  },
  {
    label: t("enum.orderStatuses.WAIT_FOR_CONFIRMATION"),
    value: "WAIT_FOR_CONFIRMATION",
  },
  {
    label: t("enum.orderStatuses.WAIT_FOR_DELIVERY"),
    value: "WAIT_FOR_DELIVERY",
  },
  {
    label: t("enum.orderStatuses.DELIVERING"),
    value: "DELIVERING",
  },
  {
    label: t("enum.orderStatuses.COMPLETED"),
    value: "COMPLETED",
  },
  {
    label: t("enum.orderStatuses.CANCELED"),
    value: "CANCELED",
  },
  {
    label: t("enum.orderStatuses.EXPIRED"),
    value: "EXPIRED",
  },
  {
    label: t("enum.orderStatuses.RETURNED"),
    value: "RETURNED",
  },
  {
    label: t("enum.orderStatuses.EXCHANGED"),
    value: "EXCHANGED",
  },
];
