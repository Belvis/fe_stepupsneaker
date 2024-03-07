import { Pie, PieConfig } from "@ant-design/charts";
import { useApiUrl, useCustom, useTranslate } from "@refinedev/core";
import { useMemo } from "react";
import { ICustomer } from "../../../../interfaces";
import { Typography } from "antd";
const { Text } = Typography;

export const AddressCustomersPie: React.FC = () => {
  const t = useTranslate();
  const API_URL = useApiUrl();

  const url = `${API_URL}/customers`;
  const { data, isLoading } = useCustom<{ data: ICustomer[] }>({
    url,
    method: "get",
    config: {
      query: {
        pageSize: 1000,
      },
    },
  });

  const config = useMemo(() => {
    const addressCounts: Record<string, number> = {};

    data?.data.data.forEach((customer) => {
      const defaultAddress = customer.addressList.find(
        (address) => address.isDefault
      );

      const province = defaultAddress
        ? defaultAddress.provinceName || "Khác"
        : "Khác";

      addressCounts[province] = (addressCounts[province] || 0) + 1;
    });

    const pieData = Object.entries(addressCounts).map(([address, count]) => ({
      type: address,
      value: count,
    }));

    const config: PieConfig = {
      data: pieData ? pieData : [],
      loading: isLoading,
      appendPadding: 10,
      angleField: "value",
      colorField: "type",
      radius: 0.75,
      label: {
        type: "outer",
        labelHeight: 28,
        content: `{name}\n{percentage}"`,
      },
      interactions: [
        {
          type: "element-selected",
        },
        {
          type: "element-active",
        },
      ],
    };

    return config;
  }, [data]);

  return (
    <div>
      <div style={{ textAlign: "center", padding: "5px" }}>
        <Text strong>{t(`dashboard.addressCustomerPie.title`)}</Text>
      </div>

      <Pie {...config} />
    </div>
  );
};
