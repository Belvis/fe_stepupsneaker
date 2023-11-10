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

export const USER_STATUS_OPTIONS = [
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
