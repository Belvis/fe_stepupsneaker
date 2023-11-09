import { HttpError, useOne, useTranslate } from "@refinedev/core";
import { Modal, ModalProps, Form, FormProps, Input, Select, Grid } from "antd";
import { ISize } from "../../interfaces";
import { confirmDialog } from "primereact/confirmdialog";

type EditSizeProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  id: any;
  onFinish: (values: any) => void;
};

export const EditSize: React.FC<EditSizeProps> = ({
  modalProps,
  formProps,
  id,
  onFinish,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const { data, isLoading, isError } = useOne<ISize, HttpError>({
    resource: "sizes",
    id,
  });

  const onFinishHandler = (values: any) => {
    confirmDialog({
      message: t("confirmDialog.edit.message"),
      header: t("confirmDialog.edit.header"),
      icon: "pi pi-exclamation-triangle",
      acceptLabel: t("confirmDialog.edit.acceptLabel"),
      rejectLabel: t("confirmDialog.edit.rejectLabel"),
      acceptClassName: "p-button-warning",
      accept: () => {
        onFinish(values);
      },
      reject: () => {},
    });
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
        initialValues={{
          isActive: true,
        }}
        onFinish={onFinishHandler}
      >
        <Form.Item
          label={t("sizes.fields.name")}
          name="name"
          initialValue={data?.data.name}
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
          initialValue={data?.data.status}
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
