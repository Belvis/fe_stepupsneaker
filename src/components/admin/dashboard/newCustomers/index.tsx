import { useContext, useMemo } from "react";
import { useApiUrl, useCustom, useTranslate } from "@refinedev/core";
import { ConfigProvider, theme, Typography } from "antd";
import { Column } from "@ant-design/charts";
import { ColumnConfig } from "@ant-design/plots/lib/components/column";

import { IncreaseIcon, DecreaseIcon } from "../../../icons";

import { ISalesChart } from "../../../../interfaces";
import { Header, HeaderNumbers, NewCustomersWrapper } from "./styled";
import { DashboardContext } from "../../../../contexts/admin/dashboard";
import dayjs from "dayjs";

export const NewCustomers: React.FC = () => {
  const t = useTranslate();
  const API_URL = useApiUrl();

  const { dateRange, setDateRange } = useContext(DashboardContext);

  const [start, end] = dateRange;

  const query = {
    start,
    end,
  };

  const url = `${API_URL}/statistic/daily-customers`;
  const { data, isLoading } = useCustom<{
    data: ISalesChart[];
    total: number;
    trend: number;
  }>({
    url,
    method: "get",
    config: {
      query,
    },
  });

  const { Text, Title } = Typography;

  const config = useMemo(() => {
    const config: ColumnConfig = {
      data: data?.data.data || [],
      loading: isLoading,
      padding: 0,
      xField: "date",
      yField: "value",
      maxColumnWidth: 16,
      columnStyle: {
        radius: [4, 4, 0, 0],
      },
      color: "rgba(255, 255, 255, 0.5)",
      tooltip: {
        customContent: (title, data) => {
          return `<div style="padding: 8px 4px; font-size:16px; font-weight:600">${dayjs(
            new Date(Number(title) * 1000)
          ).format("LL")}: ${data[0]?.value} khách hàng mới</div>`;
        },
      },

      xAxis: {
        label: null,
        line: null,
        tickLine: null,
      },
      yAxis: {
        label: null,
        grid: null,
        tickLine: null,
      },
      label: {
        // type: "outer",
        position: "middle",
        style: {
          fill: "#FFFFFF",
          fontWeight: 700,
          opacity: 0.6,
        },
      },
    };

    return config;
  }, [data]);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <NewCustomersWrapper>
        <Header>
          <Title level={3}>{t("dashboard.newCustomers.title")}</Title>
          <HeaderNumbers>
            <Text strong>{data?.data.total ?? 0}</Text>
            <div>
              <Text strong>{data?.data.trend ?? 0}%</Text>
              {(data?.data?.trend ?? 0) > 0 ? (
                <IncreaseIcon />
              ) : (
                <DecreaseIcon />
              )}
            </div>
          </HeaderNumbers>
        </Header>
        <Column
          style={{ padding: 0, height: 162 }}
          appendPadding={10}
          {...config}
        />
      </NewCustomersWrapper>
    </ConfigProvider>
  );
};
