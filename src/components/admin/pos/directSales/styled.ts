import { CloseOutlined, UserOutlined } from "@ant-design/icons";
import { Col, Typography, theme } from "antd";
import styled from "styled-components";

const { Text, Title } = Typography;

export const CustomerInfor = styled(Col)`
  width: 100%;
  background: ${(props) => props.color};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  padding: 4px 11px;
  color: rgba(0, 0, 0, 0.88);
  font-size: 14px;
  line-height: 1.5714285714285714;
  border-width: 1px;
  border-style: solid;
  border-color: #d9d9d9;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
  }
`;

export const UserIcon = styled(UserOutlined)`
  color: ${(props) => props.color};
  font-size: 16px;
  margin-right: 8px;
`;

export const TextContainer = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const CustomerName = styled(Text)`
  font-weight: bold;
  transition: text-decoration 0.3s;
  color: ${(props) => props.color};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

export const CloseButtonWrapper = styled.div`
  position: absolute;
  right: 11px;
  top: 50%;
  transform: translateY(-50%);
`;
