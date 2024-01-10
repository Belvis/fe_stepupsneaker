import { HttpError, useTranslate, useUpdate } from "@refinedev/core";
import {
  Col,
  Grid,
  Modal,
  Row,
  Typography,
  message,
  theme,
  List as AntdList,
  Checkbox,
  Avatar,
} from "antd";
import {
  ICustomer,
  IOrder,
  IVoucher,
  IVoucherFilterVariables,
} from "../../../../interfaces";
import { DateField, useSimpleList } from "@refinedev/antd";
import { useContext, useEffect, useState } from "react";
import { ColorModeContext } from "../../../../contexts/color-mode";
import dayjs from "dayjs";
import { DollarOutlined, PercentageOutlined } from "@ant-design/icons";

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
      width={breakpoint.sm ? "800px" : "100%"}
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
              const {
                id,
                image,
                code,
                name,
                constraint,
                quantity,
                type,
                startDate,
                endDate,
                value,
              } = item;
              const isChecked = selectedVoucherId === id;

              const icon =
                type === "PERCENTAGE" ? (
                  <PercentageOutlined />
                ) : (
                  <DollarOutlined />
                );

              return (
                <AntdList.Item
                  key={id}
                  actions={[
                    <Checkbox checked={isChecked} onChange={() => {}} />,
                  ]}
                  onClick={() => handleRowClick(id)}
                  style={{
                    cursor: "pointer",
                    backgroundColor:
                      mode === "light" && isChecked ? "#fff2e8" : undefined,
                  }}
                >
                  <AntdList.Item.Meta
                    avatar={<Avatar size={100} shape="square" src={image} />}
                    title={
                      <span>
                        {name} - {code} {icon}
                      </span>
                    }
                    description={
                      <span>
                        {value} | {constraint} | x{quantity} from{" "}
                        <DateField
                          value={dayjs(new Date(startDate || 0))}
                          format="LLL"
                        />{" "}
                        to{" "}
                        <DateField
                          value={dayjs(new Date(endDate || 0))}
                          format="LLL"
                        />
                      </span>
                    }
                  />
                </AntdList.Item>
              );
            }}
          />
        </Col>
      </Row>
    </Modal>
  );
};
