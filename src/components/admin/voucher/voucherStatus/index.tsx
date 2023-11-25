import { useTranslate } from "@refinedev/core";
import { Tag } from "antd";
import { TagProps } from "antd/lib";

type VoucherStatusProps = {
  status?: "IN_ACTIVE" | "ACTIVE" | "EXPIRED" | "CANCELLED" | "UP_COMING";
};

export const VoucherStatus: React.FC<VoucherStatusProps> = ({ status }) => {
  const t = useTranslate();

  let color: TagProps["color"];

  switch (status) {
    case "IN_ACTIVE":
      color = "warning";
      break;
    case "ACTIVE":
      color = "success";
      break;
    case "EXPIRED":
      color = "error";
      break;
    case "CANCELLED":
      color = "magenta";
      break;
    case "UP_COMING":
      color = "processing";
      break;
  }

  return <Tag color={color}>{t(`enum.vouchersStatuses.${status}`)}</Tag>;
};
