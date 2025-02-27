import {
  approveTrainer,
  createTrainer,
  deleteTrainer,
  getTrainers,
  updateTrainer,
} from '@/services/service/trainers';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Form, Input, InputNumber, message, Modal, Space } from 'antd';
import { useRef, useState } from 'react';

const TrainersPage = () => {
  const actionRef = useRef<ActionType>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [currentRecord, setCurrentRecord] =
    useState<API.Service.Trainer | null>(null);
  const [form] = Form.useForm();

  const showCreateModal = () => {
    setModalType('create');
    setCurrentRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (record: API.Service.Trainer) => {
    setModalType('edit');
    setCurrentRecord(record);
    form.setFieldsValue({
      email: record.email,
      full_name: record.full_name,
      specialization: record.specialization,
      experience_years: record.experience_years,
    });
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (modalType === 'create') {
        await createTrainer(values);
        message.success('Trainer created successfully');
      } else {
        await updateTrainer(currentRecord!.id, values);
        message.success('Trainer updated successfully');
      }

      setIsModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveTrainer(id);
      message.success('Trainer approved successfully');
      actionRef.current?.reload();
    } catch (error) {
      message.error('Failed to approve trainer');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this trainer?',
      content: 'This action cannot be undone.',
      okText: 'Yes, delete it',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteTrainer(id);
          message.success('Trainer deleted successfully');
          actionRef.current?.reload();
        } catch (error) {
          message.error('Failed to delete trainer');
          console.error('Error:', error);
        }
      },
    });
  };

  const columns: ProColumns<API.Service.Trainer>[] = [
    {
      title: 'Full Name',
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
      ellipsis: true,
    },
    {
      title: 'Experience (years)',
      dataIndex: 'experience_years',
      key: 'experience_years',
    },
    {
      title: 'Approval Status',
      dataIndex: 'is_approved',
      key: 'is_approved',
      valueEnum: {
        true: {
          text: 'Approved',
          status: 'Success',
        },
        false: {
          text: 'Pending',
          status: 'Warning',
        },
      },
      render: (_, record) => (
        <span style={{ color: record.is_approved ? 'green' : 'orange' }}>
          {record.is_approved ? 'Approved' : 'Pending Approval'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 250,
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => showEditModal(record)}>
            Edit
          </Button>
          {!record.is_approved && (
            <Button type="default" onClick={() => handleApprove(record.id)}>
              Approve
            </Button>
          )}
          <Button type="primary" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.Service.Trainer>
        columns={columns}
        actionRef={actionRef}
        request={async () => {
          const data = await getTrainers();
          return {
            data: data.data || [],
            success: true,
          };
        }}
        rowKey="id"
        pagination={{
          pageSize: 10,
        }}
        toolBarRender={() => [
          // <Button key="add" type="primary" onClick={showCreateModal}>
          //   Create New Trainer
          // </Button>,
        ]}
        search={false}
      />

      <Modal
        title={modalType === 'create' ? 'Create Trainer' : 'Edit Trainer'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter an email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input />
          </Form.Item>
          {modalType === 'create' && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter a password' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item
            name="full_name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter a full name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="specialization" label="Specialization">
            <Input />
          </Form.Item>
          <Form.Item name="experience_years" label="Experience (years)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default TrainersPage;
