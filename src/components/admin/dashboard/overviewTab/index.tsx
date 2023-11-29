import {
  BarChartOutlined,
  LineChartOutlined,
  ManOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import type { TabsProps } from "antd";
import { Grid, Tabs } from "antd";
import React from "react";
import { AddressCustomersPie } from "../addressCustomersPie";
import { GenderCustomersPie } from "../genderCustomersPie";
import { GroupAge } from "../groupAgeCustomers";
import OverviewGrowth from "../overviewGrowth";

const items: TabsProps["items"] = [
  {
    key: "1",
    label: (
      <span>
        <BarChartOutlined /> Tổng quát
      </span>
    ),

    children: <OverviewGrowth />,
  },
  {
    key: "2",
    label: (
      <span>
        <ManOutlined /> Giới tính
      </span>
    ),
    children: <GenderCustomersPie />,
  },
  {
    key: "3",
    label: (
      <span>
        <PieChartOutlined /> Khu vực
      </span>
    ),
    children: <AddressCustomersPie />,
  },
  {
    key: "4",
    label: (
      <span>
        <LineChartOutlined /> Độ tuổi
      </span>
    ),
    children: <GroupAge />,
  },
];

const OverviewTab: React.FC = () => {
  const breakpoint = Grid.useBreakpoint();

  return (
    <Tabs
      centered={breakpoint.xs}
      tabPosition="bottom"
      size="small"
      defaultActiveKey="1"
      items={items}
    />
  );
};

export default OverviewTab;
