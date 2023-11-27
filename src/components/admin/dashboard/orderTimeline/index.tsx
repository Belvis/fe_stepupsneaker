import { useSimpleList } from "@refinedev/antd";
import { useNavigation, useTranslate } from "@refinedev/core";
import {
  List as AntdList,
  ConfigProvider,
  Tooltip,
  Typography,
  theme,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { IOrderHistory, OrderStatus } from "../../../../interfaces";
import {
  CreatedAt,
  Number,
  Timeline,
  TimelineContent,
  TimelineItem,
} from "./styled";

dayjs.extend(relativeTime);

type OrderTimelineProps = {
  id?: string;
};

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ id }) => {
  const t = useTranslate();
  const { show } = useNavigation();

  const { listProps } = useSimpleList<IOrderHistory>({
    resource: "order-histories",
    initialSorter: [
      {
        field: "createdAt",
        order: "desc",
      },
    ],
    filters: {
      initial: [
        {
          field: "order",
          operator: "eq",
          value: id,
        },
      ],
    },
    pagination: {
      pageSize: 6,
    },
    syncWithLocation: false,
  });

  const { dataSource } = listProps;

  const { Text } = Typography;

  const orderStatusColor = (
    status: OrderStatus
  ):
    | { indicatorColor: string; backgroundColor: string; text: string }
    | undefined => {
    switch (status) {
      case "PENDING":
        return {
          indicatorColor: "orange",
          backgroundColor: "#fff7e6",
          text: "pending",
        };
      case "WAIT_FOR_CONFIRMATION":
        return {
          indicatorColor: "cyan",
          backgroundColor: "#e6fffb",
          text: "ready",
        };
      case "WAIT_FOR_DELIVERY":
        return {
          indicatorColor: "green",
          backgroundColor: "#e6f7ff",
          text: "wait for delivery",
        };
      case "DELIVERING":
        return {
          indicatorColor: "green",
          backgroundColor: "#e6f7ff",
          text: "on the way",
        };
      case "COMPLETED":
        return {
          indicatorColor: "blue",
          backgroundColor: "#e6fffb",
          text: "delivered",
        };
      case "CANCELED":
      case "EXPIRED":
      case "RETURNED":
      case "EXCHANGED":
        return {
          indicatorColor: "red",
          backgroundColor: "#fff1f0",
          text: "cancelled",
        };
      default:
        break;
    }
  };

  return (
    <AntdList
      {...listProps}
      pagination={{
        ...listProps.pagination,
        simple: true,
        hideOnSinglePage: true,
      }}
    >
      <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
        <Timeline>
          {dataSource?.map(({ createdAt, order, actionStatus }) => {
            return (
              <TimelineItem
                key={order.code.toUpperCase()}
                color={orderStatusColor(actionStatus)?.indicatorColor}
              >
                <TimelineContent
                  backgroundColor={
                    orderStatusColor(actionStatus)?.backgroundColor ||
                    "transparent"
                  }
                >
                  <Tooltip
                    overlayInnerStyle={{ color: "#626262" }}
                    color="rgba(255, 255, 255, 0.3)"
                    placement="topLeft"
                    title={dayjs(createdAt).format("lll")}
                  >
                    <CreatedAt italic>{dayjs(createdAt).fromNow()}</CreatedAt>
                  </Tooltip>
                  <Text>
                    {t(
                      `dashboard.timeline.orderStatuses.${
                        orderStatusColor(actionStatus)?.text
                      }`
                    )}
                  </Text>
                  <Number onClick={() => show("orders", order.id)} strong>
                    #{order.code.toUpperCase()}
                  </Number>
                </TimelineContent>
              </TimelineItem>
            );
          })}
        </Timeline>
      </ConfigProvider>
    </AntdList>
  );
};
