import { useTranslate } from "@refinedev/core";
import { Tag } from "antd";
import { TagProps } from "antd/lib";

type ProductStatusProps = {
  status?: "IN_ACTIVE" | "ACTIVE";
};

export const ProductStatus: React.FC<ProductStatusProps> = ({ status }) => {
  const t = useTranslate();

  let color: TagProps["color"];

  switch (status) {
    case "IN_ACTIVE":
      color = "red";
      break;
    case "ACTIVE":
      color = "green";
      break;
  }

  return <Tag color={color}>{t(`enum.productStatuses.${status}`)}</Tag>;
};
