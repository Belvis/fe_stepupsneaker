import { Line, LineConfig } from "@ant-design/charts";
import { useApiUrl, useCustom, useTranslate } from "@refinedev/core";
import { Typography } from "antd";
import { useMemo } from "react";
import { ICustomer } from "../../../../interfaces";
const { Text } = Typography;

export const GroupAge: React.FC = () => {
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

  const AgeGroups = {
    UNDER_18: t("customers.age.UNDER_18"),
    AGE_18_30: t("customers.age.AGE_18_30"),
    AGE_31_50: t("customers.age.AGE_31_50"),
    AGE_51_60: t("customers.age.AGE_51_60"),
    OVER_60: t("customers.age.OVER_60"),
  };

  const ageGroupOrder = [
    AgeGroups.UNDER_18,
    AgeGroups.AGE_18_30,
    AgeGroups.AGE_31_50,
    AgeGroups.AGE_51_60,
    AgeGroups.OVER_60,
  ];

  const config = useMemo(() => {
    const ageCounts: Record<string, number> = {};

    data?.data.data.forEach((customer) => {
      const birthYear = new Date(customer.dateOfBirth).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;

      let ageGroup;

      if (age < 18) {
        ageGroup = AgeGroups.UNDER_18;
      } else if (age >= 18 && age <= 30) {
        ageGroup = AgeGroups.AGE_18_30;
      } else if (age >= 31 && age <= 50) {
        ageGroup = AgeGroups.AGE_31_50;
      } else if (age >= 51 && age <= 60) {
        ageGroup = AgeGroups.AGE_51_60;
      } else {
        ageGroup = AgeGroups.OVER_60;
      }

      ageCounts[ageGroup] = (ageCounts[ageGroup] || 0) + 1;
    });

    const lineData = Object.entries(ageCounts).map(([ageGroup, count]) => ({
      type: ageGroup,
      value: count,
    }));

    const sortedLineData = lineData.sort((a, b) => {
      return ageGroupOrder.indexOf(a.type) - ageGroupOrder.indexOf(b.type);
    });

    const config: LineConfig = {
      data: sortedLineData ? sortedLineData : [],
      loading: isLoading,
      xField: "type",
      yField: "value",
      label: {},
      point: {
        size: 5,
        shape: "diamond",
        style: {
          fill: "white",
          stroke: "#5B8FF9",
          lineWidth: 2,
        },
      },
      tooltip: {
        showMarkers: false,
      },
      state: {
        active: {
          style: {
            shadowBlur: 4,
            stroke: "#000",
            fill: "red",
          },
        },
      },
      interactions: [
        {
          type: "marker-active",
        },
      ],
    };

    return config;
  }, [data]);

  return (
    <div>
      <div style={{ textAlign: "center" }}>
        <Text strong>{t(`dashboard.groupAge.title`)}</Text>
      </div>
      <Line style={{ padding: "20px" }} {...config} />
    </div>
  );
};
