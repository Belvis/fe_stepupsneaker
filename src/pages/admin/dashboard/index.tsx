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

const { Text } = Typography;

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();

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
          // title={<Text strong>{t("dashboard.deliveryMap.title")}</Text>}
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
              <Segmented options={["Ngày", "Tuần", "Tháng", "Năm"]} />
            </Flex>
          }
        >
          <TrendingMenu />
        </Card>
      </Col>
    </Row>
  );
};
