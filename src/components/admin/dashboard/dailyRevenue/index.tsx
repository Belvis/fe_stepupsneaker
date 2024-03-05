import { useContext, useMemo, useState } from "react";
import { useApiUrl, useCustom, useTranslate } from "@refinedev/core";
import { NumberField } from "@refinedev/antd";
import { Typography } from "antd";
import { Line } from "@ant-design/charts";
import { LineConfig } from "@ant-design/plots/lib/components/line";
import dayjs, { Dayjs } from "dayjs";

import { IncreaseIcon, DecreaseIcon } from "../../../icons";

import { ISalesChart } from "../../../../pages/interfaces";
import {
  DailyRevenueWrapper,
  TitleAreNumber,
  TitleArea,
  TitleAreaAmount,
  RangePicker,
} from "./styled";
import { DashboardContext } from "../../../../contexts/admin/dashboard";
import { formatCurrency } from "../../../../utils";

const { Text, Title } = Typography;

export const DailyRevenue: React.FC = () => {
  const t = useTranslate();
  const API_URL = useApiUrl();

  const { dateRange, setDateRange } = useContext(DashboardContext);

  const [start, end] = dateRange;

  const query = {
    start,
    end,
  };

  const url = `${API_URL}/statistic/daily-revenue`;
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

  const config = useMemo(() => {
    const config: LineConfig = {
      data: data?.data.data || [],
      loading: isLoading,
      padding: "auto",
      xField: "date",
      yField: "value",
      color: "rgba(255, 255, 255, 0.5)",
      tooltip: {
        customContent: (title, data) => {
          return `<div style="padding: 8px 4px; font-size:16px; font-weight:600">${dayjs(
            new Date(Number(title) * 1000)
          ).format("LL")}: ${formatCurrency(data[0]?.value)} </div>`;
        },
      },

      xAxis: {
        label: null,
        line: null,
      },
      yAxis: {
        label: null,
        grid: null,
      },
      smooth: true,
      lineStyle: {
        lineWidth: 4,
      },
    };

    return config;
  }, [data]);

  const disabledDate = (date: Dayjs) => date > dayjs();

  return (
    <DailyRevenueWrapper>
      <TitleArea>
        <TitleAreaAmount>
          <Typography.Title level={3}>
            {t("dashboard.dailyRevenue.title")}
          </Typography.Title>
          <TitleAreNumber>
            <NumberField
              style={{ fontSize: 36 }}
              strong
              options={{
                currency: "VND",
                style: "currency",
                notation: "compact",
              }}
              locale="vi"
              value={data?.data.total ?? 0}
            />
            <div style={{ marginLeft: "1rem" }}>
              <Text strong>{data?.data.trend ?? 0}%</Text>
              {(data?.data?.trend ?? 0) > 0 ? (
                <IncreaseIcon />
              ) : (
                <DecreaseIcon />
              )}
            </div>
          </TitleAreNumber>
        </TitleAreaAmount>

        <RangePicker
          size="small"
          value={[dayjs(new Date(dateRange[0])), dayjs(new Date(dateRange[1]))]}
          onChange={(values: any) => {
            if (values && values[0] && values[1]) {
              setDateRange([values[0].valueOf(), values[1].valueOf()]);
            }
          }}
          disabledDate={disabledDate}
          style={{
            float: "right",
            color: "#fffff !important",
            background: "rgba(255, 255, 255, 0.3)",
          }}
          ranges={{
            "This Week": [dayjs().startOf("week"), dayjs().endOf("week")],
            "Last Month": [
              dayjs().startOf("month").subtract(1, "month"),
              dayjs().endOf("month").subtract(1, "month"),
            ],
            "This Month": [dayjs().startOf("month"), dayjs().endOf("month")],
            "This Year": [dayjs().startOf("year"), dayjs().endOf("year")],
          }}
          format="YYYY/MM/DD"
        />
      </TitleArea>
      <Line
        padding={0}
        appendPadding={10}
        height={115}
        style={{ maxHeight: "115px" }}
        {...config}
      />
    </DailyRevenueWrapper>
  );
};
