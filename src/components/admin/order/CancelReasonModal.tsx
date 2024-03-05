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
import { IOrder } from "../../../pages/interfaces";
import { showWarningConfirmDialog } from "../../../utils";

interface CancelReasonModalProps {
  restModalProps: {
    open?: boolean | undefined;
    confirmLoading?: boolean | undefined;
    title?: ReactNode;
    closable?: boolean | undefined;
  };
  order: IOrder;
  callBack: any;
  close: () => void;
}

const { Title } = Typography;

const CancelReasonModal: React.FC<CancelReasonModalProps> = ({
  restModalProps,
  order,
  callBack,
  close,
}) => {
  const { t } = useTranslation();

  const { mutate: update, isLoading: isLoadingUpdate } = useUpdate();

  const [value, setValue] = useState(1);

  const [selectedReason, setSelectedReason] = useState("Khác");

  const onChange = (e: RadioChangeEvent) => {
    setValue(e.target.value);
  };

  useEffect(() => {
    if (value && value !== 6) {
      setSelectedReason(() => {
        switch (value) {
          case 1:
            return "Muốn nhập/thay đổi mã voucher";
          case 2:
            return "Muốn thay đổi sản phẩm trong đơn hàng (size, màu sắc,...)";
          case 3:
            return "Tìm thấy giá rẻ hơn ở chỗ khác";
          case 4:
            return "Đổi ý, không muốn mua nữa";
          case 5:
            return "Ngứa tay";
          default:
            return "";
        }
      });
    }
  }, [value]);

  const handleOk = () => {
    showWarningConfirmDialog({
      options: {
        accept: () => {
          update(
            {
              resource: `orders/confirmation-order`,
              values: {
                status: "CANCELED",
              },
              id: order.id,
              successNotification: (data, values, resource) => {
                return {
                  message: `Hủy đơn hàng thành công!`,
                  description: "Thành công",
                  type: "success",
                };
              },
            },
            {
              onError: (error, variables, context) => {},
              onSuccess: (data, variables, context) => {
                callBack();
                close();
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
          <Title level={5}>Vui lòng chọn lý do huỷ</Title>
          <Tooltip title="Để gia tăng chất lượng dịch vụ, xin vui lòng cho chúng tôi biết lý do bạn huỷ đơn hàng.">
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      }
      {...restModalProps}
      open={restModalProps.open}
      width="500px"
      centered
      onOk={handleOk}
    >
      <Radio.Group onChange={onChange} value={value}>
        <Space direction="vertical" size="large">
          <Radio value={1}>Muốn nhập/thay đổi mã voucher</Radio>
          <Radio value={2}>
            Muốn thay đổi sản phẩm trong đơn hàng (size, màu sắc,...)
          </Radio>
          <Radio value={3}>Tìm thấy giá rẻ hơn ở chỗ khác</Radio>
          <Radio value={4}>Đổi ý, không muốn mua nữa</Radio>
          <Radio value={5}>Ngứa tay</Radio>
          <Radio value={6}>
            Khác
            {value === 6 ? (
              <Input
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const { value: inputValue } = e.target;
                  setSelectedReason(inputValue);
                }}
                style={{ width: 200, marginLeft: 10 }}
              />
            ) : null}
          </Radio>
        </Space>
      </Radio.Group>
    </Modal>
  );
};

export default CancelReasonModal;
