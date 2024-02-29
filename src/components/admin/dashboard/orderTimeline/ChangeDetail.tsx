import { InfoCircleOutlined } from "@ant-design/icons";
import { Modal, Space, Tooltip, Typography } from "antd";
import React, { ReactNode } from "react";
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
  changes:
    | {
        [key: string]: {
          oldValue: any;
          newValue: any;
        };
      }
    | undefined;
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

  const keys = Object.keys(changes ?? {});

  console.log(keys);

  const renderChange = (key: string) => {
    switch (
      key
      // case
    ) {
    }
    return <></>;
  };
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
      {changes && keys && <></>}
    </Modal>
  );
};

export default ChangeDetail;
