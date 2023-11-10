import { useTranslate } from "@refinedev/core";
import { Form, FormProps, Grid, Input, Modal, ModalProps } from "antd";
import { ISize } from "../../../../interfaces";

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

  const onFinishHandler = (values: ISize) => {
    const submitData = {
      name: values.name,
      status: "ACTIVE",
    };
    onFinish(submitData);
  };

  return (
    <Modal
      {...modalProps}
      width={breakpoint.sm ? "500px" : "100%"}
      zIndex={1001}
    >
      <Form {...formProps} layout="vertical" onFinish={onFinishHandler}>
        <Form.Item
          label={t("brands.fields.name")}
          name="name"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
