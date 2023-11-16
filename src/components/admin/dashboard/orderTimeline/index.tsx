import { useTranslate, useNavigation } from "@refinedev/core";
import { useSimpleList } from "@refinedev/antd";
import {
  Typography,
  List as AntdList,
  Tooltip,
  ConfigProvider,
  theme,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { IOrder, OrderStatus } from "../../../../interfaces";
import {
  TimelineContent,
  CreatedAt,
  Number,
  Timeline,
  TimelineItem,
} from "./styled";

dayjs.extend(relativeTime);

export const OrderTimeline: React.FC = () => {
  const t = useTranslate();
  const { show } = useNavigation();

  const { listProps } = useSimpleList<IOrder>({
    resource: "orders",
    initialSorter: [
      {
        field: "createdAt",
        order: "desc",
      },
    ],
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
      }}
    >
      <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
        <Timeline>
          {dataSource?.map(({ createdAt, code, status, id }) => (
            <TimelineItem
              key={code.toUpperCase()}
              color={orderStatusColor(status)?.indicatorColor}
            >
              <TimelineContent
                backgroundColor={
                  orderStatusColor(status)?.backgroundColor || "transparent"
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
                      orderStatusColor(status)?.text
                    }`
                  )}
                </Text>
                <Number onClick={() => show("orders", id)} strong>
                  #{code.toUpperCase()}
                </Number>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </ConfigProvider>
    </AntdList>
  );
};
