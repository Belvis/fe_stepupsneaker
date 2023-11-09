import { HttpError, useOne, useTranslate } from "@refinedev/core";
import {
  Modal,
  ModalProps,
  Form,
  FormProps,
  Input,
  Select,
  Grid,
  ColorPicker,
} from "antd";
import type { Color } from "antd/es/color-picker";
import { IColor } from "../../interfaces";
import { confirmDialog } from "primereact/confirmdialog";

type EditColorProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  id: any;
  onFinish: (values: any) => void;
  close: () => void;
};

export const EditColor: React.FC<EditColorProps> = ({
  modalProps,
  formProps,
  id,
  onFinish,
  close,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const { data, isLoading, isError } = useOne<IColor, HttpError>({
    resource: "colors",
    id,
  });

  const handleChange = (newColor: Color) => {
    const hexColor = newColor.toHex();

    if (formProps && formProps.form) {
      formProps.form.setFieldValue("code", hexColor);
    }
  };

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
          label={t("colors.fields.name")}
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
          label={t("colors.fields.code")}
          name="code"
          initialValue={data?.data.code}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <ColorPicker onChange={handleChange} showText />
        </Form.Item>
        <Form.Item
          label={t("colors.fields.status")}
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
