import { useTranslate } from "@refinedev/core";
import { Modal, ModalProps, Form, FormProps, Input, Select, Grid } from "antd";

type CreateSizeProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  onFinish: (values: any) => void;
};

export const CreateSize: React.FC<CreateSizeProps> = ({
  modalProps,
  formProps,
  onFinish,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const onFinishHandler = (values: any) => {
    onFinish(values);
  };

  return (
    <Modal
      {...modalProps}
      width={breakpoint.sm ? "500px" : "100%"}
      zIndex={1001}
    >
      <Form
        {...formProps}
        layout="vertical"
        onFinish={onFinishHandler}
        initialValues={{
          isActive: true,
        }}
      >
        <Form.Item
          label={t("sizes.fields.name")}
          name="name"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t("sizes.fields.status")}
          name="status"
          initialValue={"ACTIVE"}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select
            options={[
              {
                label: "Active",
                value: "ACTIVE",
              },
              {
                label: "In Active",
                value: "IN_ACTIVE",
              },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
