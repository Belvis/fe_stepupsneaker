import { Line, LineConfig } from "@ant-design/plots";
import { useApiUrl, useCustom, useTranslate } from "@refinedev/core";
import dayjs from "dayjs";
import { useContext } from "react";
import { DashboardContext } from "../../../../contexts/admin/dashboard";
import { Datum } from "@ant-design/charts";
import { Typography } from "antd";
const { Text } = Typography;

const OverviewGrowth = () => {
  const t = useTranslate();
  const API_URL = useApiUrl();

  const { dateRange, setDateRange } = useContext(DashboardContext);

  const [start, end] = dateRange;

  const query = {
    start,
    end,
  };

  const url = `${API_URL}/statistic`;

  const { data, isLoading } = useCustom<any>({
    url,
    method: "get",
    config: {
      query,
    },
  });

  const growth = data?.data ?? ([] as any);

  const config: LineConfig = {
    data: growth.map((item: { name: string }) => ({
      ...item,
      name: t(`dashboard.overviewTab.overview.${item.name}`),
    })),
    xField: "date",
    yField: "dailyGrowth",
    xAxis: {
      label: {
        formatter: (v) =>
          `${dayjs(new Date(Number(v) * 1000)).format("DD/MM/YYYY")}`,
      },
    },
    tooltip: {
      formatter: (datum: Datum) => {
        return {
          name: datum.name,
          value: datum.dailyGrowth + "%",
        };
      },
      title(title, datum) {
        return dayjs(new Date(Number(title) * 1000)).format("DD/MM/YYYY");
      },
    },
    seriesField: "name",
    legend: {
      position: "top",
    },
    smooth: true,
    animation: {
      appear: {
        animation: "path-in",
        duration: 5000,
      },
    },
  };

  return (
    <>
      <div style={{ textAlign: "center", padding: "5px" }}>
        <Text strong>Biểu đồ biểu thị tốc độ tăng trưởng</Text>
      </div>
      <Line {...config} style={{ padding: "20px", height: "100%" }} />
    </>
  );
};

export default OverviewGrowth;
