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

interface ChangeDetailProps {
  restModalProps: {
    open?: boolean | undefined;
    confirmLoading?: boolean | undefined;
    title?: ReactNode;
    closable?: boolean | undefined;
  };
  callBack: any;
  close: () => void;
  changes: {
    [key: string]: {
      oldValue: any;
      newValue: any;
    };
  };
}

const { Title } = Typography;

const ChangeDetail: React.FC<ChangeDetailProps> = ({
  restModalProps,
  callBack,
  close,
  changes,
}) => {
  const { t } = useTranslation();

  const handleOk = () => {};

  console.log(changes);

  return (
    <Modal
      title={
        <Space align="baseline">
          <Title level={5}>Chi tiết thay đổi</Title>
          <Tooltip title="Lê Văn Ri.">
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      }
      {...restModalProps}
      open={restModalProps.open}
      width="700px"
      zIndex={2000}
      centered
      onOk={handleOk}
    >
      Hehe
    </Modal>
  );
};

export default ChangeDetail;
