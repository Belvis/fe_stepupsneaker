import { DollarOutlined, PercentageOutlined } from "@ant-design/icons";
import { DateField, useSimpleList } from "@refinedev/antd";
import { HttpError, useTranslate, useUpdate } from "@refinedev/core";
import {
  List as AntdList,
  Avatar,
  Checkbox,
  Col,
  Grid,
  Modal,
  Row,
  message,
  theme,
} from "antd";
import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { ColorModeContext } from "../../../../contexts/color-mode";
import {
  ICustomer,
  IOrder,
  IVoucher,
  IVoucherFilterVariables,
} from "../../../../interfaces";
import Voucher from "./Voucher";

type DiscountModalProps = {
  open: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  customer: ICustomer | undefined;
  order: IOrder | undefined;
  callBack: any;
};

const { useToken } = theme;

export const DiscountModal: React.FC<DiscountModalProps> = ({
  open,
  handleOk,
  handleCancel,
  order,
  customer,
  callBack,
}) => {
  const t = useTranslate();
  const { token } = useToken();
  const { mutate: mutateUpdate, isLoading: isLoadingOrderUpdate } = useUpdate();
  const { mode } = useContext(ColorModeContext);
  const [messageApi, contextHolder] = message.useMessage();
  const breakpoint = Grid.useBreakpoint();
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>();

  useEffect(() => {
    if (open) refetch();
  }, [open]);

  const handleFinish = () => {
    if (order && selectedVoucherId) {
      mutateUpdate(
        {
          resource: "orders",
          values: {
            ...order,
            employee: order.employee ? order.employee.id : "",
            customer: order.customer ? order.customer.id : "",
            voucher: selectedVoucherId,
            address: order.address ? order.address.id : "",
          },
          id: order.id,
          successNotification: () => {
            return false;
          },
          errorNotification: () => {
            return false;
          },
        },
        {
          onError: (error, variables, context) => {
            messageApi.open({
              type: "error",
              content: t("orders.notification.voucher.edit.error"),
            });
          },
          onSuccess: (data, variables, context) => {
            callBack();
            messageApi.open({
              type: "success",
              content: t("orders.notification.voucher.edit.success"),
            });
            handleOk();
          },
        }
      );
    } else {
      messageApi.open({
        type: "error",
        content: t("orders.notification.voucher.edit.notFound"),
      });
    }
  };

  const onCancel = () => {
    handleCancel();
  };

  const handleRowClick = (id: string) => {
    setSelectedVoucherId((prevId) => (prevId === id ? null : id));
  };

  const {
    listProps: voucherListProps,
    setFilters,
    queryResult: { refetch },
  } = useSimpleList<IVoucher, HttpError, IVoucherFilterVariables>({
    resource: "vouchers",
    filters: {
      initial: [
        {
          field: "status",
          operator: "eq",
          value: "ACTIVE",
        },
        // {
        //   field: "customer",
        //   operator: "eq",
        //   value: customer?.id,
        // },
      ],
    },
    pagination: {
      pageSize: 5,
    },
    syncWithLocation: false,
  });

  return (
    <Modal
      title={t("vouchers.vouchers")}
      width={breakpoint.sm ? "1000px" : "100%"}
      zIndex={1001}
      onOk={handleFinish}
      onCancel={onCancel}
      open={open}
      confirmLoading={isLoadingOrderUpdate}
    >
      {contextHolder}
      <Row gutter={[16, 24]}>
        <Col span={24}>
          <AntdList
            {...voucherListProps}
            itemLayout="horizontal"
            bordered
            style={{ padding: "1rem" }}
            renderItem={(item) => {
              return (
                <AntdList.Item key={item.id}>
                  <Voucher item={item} />
                </AntdList.Item>
              );
            }}
          />
        </Col>
      </Row>
    </Modal>
  );
};
