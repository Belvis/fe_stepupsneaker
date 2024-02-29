import { InfoCircleOutlined } from "@ant-design/icons";
import { useUpdate } from "@refinedev/core";
import {
  Input,
  Modal,
  Radio,
  RadioChangeEvent,
  Space,
  Tooltip,
  Typography,
} from "antd";
import React, { ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IOrder, OrderStatus } from "../../../interfaces";
import { showWarningConfirmDialog } from "../../../utils";

interface ReasonModalProps {
  restModalProps: {
    open?: boolean | undefined;
    confirmLoading?: boolean | undefined;
    title?: ReactNode;
    closable?: boolean | undefined;
  };
  order: IOrder;
  status: OrderStatus;
  callBack: any;
  close: () => void;
}

const { Title } = Typography;

const ReasonModal: React.FC<ReasonModalProps> = ({
  restModalProps,
  order,
  status,
  callBack,
  close,
}) => {
  const { t } = useTranslation();

  const { mutate: update, isLoading: isLoadingUpdate } = useUpdate();

  const [value, setValue] = useState("");

  useEffect(() => {
    console.log("restModalProps.open", restModalProps.open);

    if (restModalProps.open) {
      setValue("");
    }
  }, [restModalProps]);

  const handleOk = () => {
    showWarningConfirmDialog({
      options: {
        accept: () => {
          update(
            {
              resource: `orders/confirmation-order`,
              values: {
                status: status,
                orderHistoryNote: value,
              },
              id: order.id,
              successNotification: (data, values, resource) => {
                return {
                  message: `Hủy đơn hàng thành công!`,
                  description: "Thành công",
                  type: "success",
                };
              },
              errorNotification(error) {
                return {
                  message: "Cập nhật đơn hàng thất bại: " + error?.message,
                  description: "Đã xảy ra lỗi",
                  type: "success",
                };
              },
            },
            {
              onError: (error, variables, context) => {},
              onSuccess: (data, variables, context) => {
                callBack();
                close();
                setValue("");
              },
            }
          );
        },
        reject: () => {},
      },
      t: t,
    });
  };

  return (
    <Modal
      title={
        <Space align="baseline">
          <Title level={5}>Nhập ghi chú trạng thái</Title>
        </Space>
      }
      {...restModalProps}
      open={restModalProps.open}
      width="500px"
      centered
      onOk={handleOk}
    >
      <Input
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const { value: inputValue } = e.target;
          setValue(inputValue);
        }}
      />
    </Modal>
  );
};

export default ReasonModal;
