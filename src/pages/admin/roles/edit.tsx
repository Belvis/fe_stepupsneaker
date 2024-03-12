import { HttpError, useOne, useTranslate } from "@refinedev/core";
import { Form, FormProps, Grid, Input, Modal, ModalProps } from "antd";
import { IRole } from "../../../interfaces";
import { showWarningConfirmDialog } from "../../../utils";
import { validateCommon } from "../../../helpers/validate";

type EditRoleProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  id: any;
  onFinish: (values: any) => void;
};

export const EditRole: React.FC<EditRoleProps> = ({
  modalProps,
  formProps,
  id,
  onFinish,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const { data } = useOne<IRole, HttpError>({
    resource: "roles",
    id,
  });

  const onFinishHandler = (values: any) => {
    showWarningConfirmDialog({
      options: {
        accept: () => {
          onFinish(values);
        },
        reject: () => {},
      },
      t: t,
    });
  };

  return (
    <Modal
      {...modalProps}
      width={breakpoint.sm ? "500px" : "100%"}
      zIndex={1001}
    >
      <Form {...formProps} layout="vertical" onFinish={onFinishHandler}>
        <Form.Item
          label={
            <div>
              <span>{t("roles.fields.name")}</span>
              <span className="sub-label">(Tối đa 255 ký tự)</span>
            </div>
          }
          required
          name="name"
          initialValue={data?.data.name}
          rules={[
            {
              validator: (_, value) => validateCommon(_, value, t, "name"),
            },
          ]}
        >
          <Input maxLength={255} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
};
