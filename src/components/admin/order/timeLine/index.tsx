import { useTranslate } from "@refinedev/core";
import { Card, Grid, Modal } from "antd";
import { OrderTimeline } from "../../dashboard";

type OrderHistoryTimeLineProps = {
  id: string;
  open: boolean;
  handleOk: () => void;
  handleCancel: () => void;
};

export const OrderHistoryTimeLine: React.FC<OrderHistoryTimeLineProps> = ({
  id,
  open,
  handleCancel,
  handleOk,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  return (
    <Modal
      title="Lịch sử đơn hàng"
      width={breakpoint.sm ? "500px" : "100%"}
      zIndex={1001}
      onOk={handleOk}
      onCancel={handleCancel}
      open={open}
      footer={<></>}
    >
      <Card bordered={false}>
        <OrderTimeline id={id} />
      </Card>
    </Modal>
  );
};
