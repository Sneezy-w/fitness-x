import {
  createMembershipType,
  deleteMembershipType,
  getAllMembershipTypes,
  restoreMembershipType,
  updateMembershipType,
} from '@/services/service/membership-types';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Form, Input, InputNumber, message, Modal, Space } from 'antd';
import { useRef, useState } from 'react';

const MembershipTypesPage = () => {
  const actionRef = useRef<ActionType>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [currentRecord, setCurrentRecord] =
    useState<API.Service.MembershipType | null>(null);
  const [form] = Form.useForm();

  const showCreateModal = () => {
    setModalType('create');
    setCurrentRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (record: API.Service.MembershipType) => {
    setModalType('edit');
    setCurrentRecord(record);
    form.setFieldsValue({
      name: record.name,
      monthly_price: parseFloat(record.monthly_price),
      class_limit: record.class_limit,
    });
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (modalType === 'create') {
        await createMembershipType(values);
        message.success('Membership type created successfully');
      } else {
        await updateMembershipType(currentRecord!.id, values);
        message.success('Membership type updated successfully');
      }

      setIsModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this membership type?',
      content: 'This action can be undone later.',
      okText: 'Yes, delete it',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteMembershipType(id);
          message.success('Membership type deleted successfully');
          actionRef.current?.reload();
        } catch (error) {
          message.error('Failed to delete membership type');
          console.error('Error:', error);
        }
      },
    });
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreMembershipType(id);
      message.success('Membership type restored successfully');
      actionRef.current?.reload();
    } catch (error) {
      message.error('Failed to restore membership type');
      console.error('Error:', error);
    }
  };

  const columns: ProColumns<API.Service.MembershipType>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },

    {
      title: 'Monthly Price',
      dataIndex: 'monthly_price',
      key: 'monthly_price',
      render: (_, record) => `$${record.monthly_price}`,
    },

    {
      title: 'Classes per Month',
      dataIndex: 'class_limit',
      key: 'class_limit',
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      valueEnum: {
        true: {
          text: 'Active',
          status: 'Success',
        },
        false: {
          text: 'Inactive',
          status: 'Error',
        },
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => showEditModal(record)}>
            Edit
          </Button>
          {record.deleted_at ? (
            <Button type="default" onClick={() => handleRestore(record.id)}>
              Restore
            </Button>
          ) : (
            <Button
              type="primary"
              danger
              onClick={() => handleDelete(record.id)}
            >
              Delete
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.Service.MembershipType>
        columns={columns}
        actionRef={actionRef}
        request={async () => {
          const data = await getAllMembershipTypes();
          return {
            data: data.data || [],
            success: true,
          };
        }}
        search={false}
        rowKey="id"
        pagination={{
          pageSize: 10,
        }}
        dateFormatter="string"
        headerTitle="Membership Types"
        toolBarRender={() => [
          <Button key="add" type="primary" onClick={showCreateModal}>
            Create New Membership Type
          </Button>,
        ]}
      />

      <Modal
        title={
          modalType === 'create'
            ? 'Create Membership Type'
            : 'Edit Membership Type'
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="monthly_price"
            label="Monthly Price"
            rules={[{ required: true, message: 'Please enter a price' }]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              prefix="$"
            />
          </Form.Item>

          <Form.Item
            name="class_limit"
            label="Classes per Month"
            rules={[
              { required: true, message: 'Please enter classes per month' },
            ]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default MembershipTypesPage;
