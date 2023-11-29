import { Card, Col, Flex, Row, Segmented, Select, Typography } from "antd";
import { useTranslation } from "react-i18next";

import {
  DailyOrders,
  DailyRevenue,
  NewCustomers,
  OrderTimeline,
  RecentOrders,
  TrendingMenu,
} from "../../../components";
import OverviewTab from "../../../components/admin/dashboard/overviewTab";
import { useState } from "react";
import dayjs from "dayjs";
import { SegmentedValue } from "antd/es/segmented";

const { Text } = Typography;

type TrendingOption = "Ngày" | "Tuần" | "Tháng" | "Năm";

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedTrendingOption, setSelectedTrendingOption] =
    useState<TrendingOption>("Ngày");

  const calculateTimeRange = (option: TrendingOption) => {
    const currentDate = dayjs();

    switch (option) {
      case "Ngày":
        return {
          start: currentDate.valueOf(),
          end: currentDate.valueOf(),
        };
      case "Tuần":
        const startDateWeek = currentDate.subtract(1, "week");
        return {
          start: startDateWeek.valueOf(),
          end: currentDate.valueOf(),
        };
      case "Tháng":
        const startDateMonth = currentDate.subtract(1, "month");
        return {
          start: startDateMonth.valueOf(),
          end: currentDate.valueOf(),
        };
      case "Năm":
        const startDateYear = currentDate.subtract(1, "year");
        return {
          start: startDateYear.valueOf(),
          end: currentDate.valueOf(),
        };
      default:
        return {
          start: currentDate.valueOf(),
          end: currentDate.valueOf(),
        };
    }
  };

  const handleOptionChange = (value: SegmentedValue) => {
    const option: TrendingOption = value as TrendingOption;
    setSelectedTrendingOption(option);
  };

  return (
    <Row gutter={[16, 16]}>
      <Col md={24}>
        <Row gutter={[16, 16]}>
          <Col xl={10} lg={24} md={24} sm={24} xs={24}>
            <Card
              bodyStyle={{
                padding: 10,
                paddingBottom: 0,
              }}
              style={{
                background: "#081523",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right",
                backgroundSize: "cover",
              }}
            >
              <DailyRevenue />
            </Card>
          </Col>
          <Col xl={7} lg={12} md={24} sm={24} xs={24}>
            <Card
              bodyStyle={{
                padding: 10,
                paddingBottom: 0,
              }}
              style={{
                background: "#081523",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right",
                backgroundSize: "cover",
              }}
            >
              <DailyOrders />
            </Card>
          </Col>
          <Col xl={7} lg={12} md={24} sm={24} xs={24}>
            <Card
              bodyStyle={{
                padding: 10,
                paddingBottom: 0,
              }}
              style={{
                background: "#081523",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right",
                backgroundSize: "cover",
              }}
            >
              <NewCustomers />
            </Card>
          </Col>
        </Row>
      </Col>
      <Col xl={17} lg={16} md={24} sm={24} xs={24}>
        <Card
          bodyStyle={{
            height: 550,
            paddingLeft: 0,
            paddingRight: 0,
          }}
          title={<Text strong>Biểu đồ phân tích</Text>}
        >
          <OverviewTab />
        </Card>
      </Col>
      <Col xl={7} lg={8} md={24} sm={24} xs={24}>
        <Card
          bodyStyle={{
            height: 550,
            overflowY: "scroll",
          }}
          title={
            <Text strong style={{ textTransform: "capitalize" }}>
              {t("dashboard.timeline.title")}
            </Text>
          }
        >
          <OrderTimeline />
        </Card>
      </Col>
      <Col xl={17} lg={16} md={24} sm={24} xs={24}>
        <Card title={<Text strong>{t("dashboard.recentOrders.title")}</Text>}>
          <RecentOrders />
        </Card>
      </Col>
      <Col xl={7} lg={8} md={24} sm={24} xs={24}>
        <Card
          title={
            <Flex align="center" justify="space-between">
              <Text strong>{t("dashboard.trendingMenus.title")}</Text>
              <Segmented
                options={["Ngày", "Tuần", "Tháng", "Năm"]}
                onChange={handleOptionChange}
              />
            </Flex>
          }
        >
          <TrendingMenu range={calculateTimeRange(selectedTrendingOption)} />
        </Card>
      </Col>
    </Row>
  );
};
