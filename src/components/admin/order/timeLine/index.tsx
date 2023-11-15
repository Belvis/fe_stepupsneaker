import { useTranslate } from "@refinedev/core";
import { Card, Grid, Modal, Tag, Timeline } from "antd";
import { TimeLineItemProps } from "antd/es/timeline/TimelineItem";
import { IOrderHistory, OrderStatus } from "../../../../interfaces";
import dayjs from "dayjs";
import { DateField } from "@refinedev/antd";

type OrderHistoryTimeLineProps = {
  orderHistories: IOrderHistory[];
  open: boolean;
  handleOk: () => void;
  handleCancel: () => void;
};

export const OrderHistoryTimeLine: React.FC<OrderHistoryTimeLineProps> = ({
  orderHistories,
  open,
  handleCancel,
  handleOk,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const mapOrderHistoryToTimelineItem = (
    orderHistory: IOrderHistory
  ): TimeLineItemProps | undefined => {
    if (!orderHistory.actionStatus) return undefined;
    return {
      color: getColorBasedOnActionStatus(orderHistory.actionStatus), // Function to determine color based on actionStatus
      children: (
        <>
          <p>{orderHistory.actionDescription}</p>
          <p>{orderHistory.note}</p>
          <p>
            {
              <>
                <DateField
                  value={dayjs(new Date(orderHistory.createdAt || 0))}
                  format="LLL"
                />
                {` bởi admin`}
              </>
            }
          </p>
        </>
      ),
    };
  };

  const getColorBasedOnActionStatus = (actionStatus: OrderStatus): string => {
    let color = "green";
    switch (actionStatus) {
      case "PENDING":
        color = "orange";
        break;
      case "WAIT_FOR_CONFIRMATION":
        color = "cyan";
        break;
      case "DELIVERING":
        color = "green";
        break;
      case "WAIT_FOR_DELIVERY":
        color = "lime";
        break;
      case "COMPLETED":
        color = "blue";
        break;
      case "CANCELED":
        color = "red";
        break;
      case "RETURNED":
        color = "purple";
        break;
      case "EXCHANGED":
        color = "green";
        break;
    }
    return color;
  };

  const items = orderHistories.map(mapOrderHistoryToTimelineItem);

  return (
    <Modal
      title="Lịch sử đơn hàng"
      width={breakpoint.sm ? "800px" : "100%"}
      zIndex={1001}
      onOk={handleOk}
      onCancel={handleCancel}
      open={open}
    >
      <Card>
        <Timeline items={items.filter(Boolean) as TimeLineItemProps[]} />
      </Card>
    </Modal>
  );
};
